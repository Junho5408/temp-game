"""초록 배경(크로마키) 캐릭터 그림을 게임용 투명 PNG/WebP 로 바꾸는 도구.

사용법:
    python3 tools/prepare_sprite.py <원본 이미지> <출력 이름> [--height 640]

예:
    python3 tools/prepare_sprite.py docs/reference/orthodox-sword-raw.webp orthodox-sword
    python3 tools/prepare_sprite.py docs/reference/demonic-sword-raw.webp demonic-sword --despill all

--despill edge (기본): 윤곽선 근처의 초록 번짐만 지움. 초록 옷이 있는 캐릭터용
--despill all: 그림 전체의 초록빛을 지움. 초록 옷이 없고 반투명 연기·기운 이펙트가 있는 캐릭터용

하는 일:
1. 초록 배경을 투명하게 지움 (가장자리는 반투명으로 부드럽게)
2. 가장자리에 남은 초록빛 번짐 제거 (despill)
3. 캐릭터와 떨어진 작은 조각(Gemini 워터마크 등) 제거
4. 캐릭터 크기에 맞게 잘라내고 높이를 맞춤
5. assets/characters/<이름>.webp 로 저장하고, 발 위치(기준점)를 출력
"""
import argparse
import json
from collections import deque

import numpy as np
from PIL import Image


def chroma_alpha(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    green = g - np.maximum(r, b)  # 초록이 얼마나 튀는지
    # 초록 우세도 30 이하 = 완전 불투명, 90 이상 = 완전 투명, 그 사이는 부드럽게
    alpha = 1.0 - np.clip((green - 30.0) / 60.0, 0.0, 1.0)
    return alpha


def edge_band(alpha, width=4):
    """투명한 곳에서 width 픽셀 안쪽까지의 가장자리 영역."""
    band = alpha < 0.99
    grown = band.copy()
    for _ in range(width):
        nxt = grown.copy()
        nxt[1:, :] |= grown[:-1, :]
        nxt[:-1, :] |= grown[1:, :]
        nxt[:, 1:] |= grown[:, :-1]
        nxt[:, :-1] |= grown[:, 1:]
        grown = nxt
    return grown


def despill(rgb, alpha, mode='edge'):
    """초록 번짐 제거. edge: 가장자리만 (초록 옷 보존) / all: 그림 전체."""
    out = rgb.copy()
    r, g, b = out[..., 0], out[..., 1], out[..., 2]
    limit = np.maximum(r, b)
    spill = g > limit
    if mode == 'edge':
        spill &= edge_band(alpha)
    else:
        # 반투명 연기처럼 배경과 섞인 색: 초록을 빨강·파랑의 중간값으로 눌러
        # 올리브색 대신 원래 색(붉은 기운 등)에 가깝게 되돌림
        low = np.minimum(r, b)
        out[..., 1] = np.where(spill, low + (limit - low) * 0.5, g)
        return out
    out[..., 1] = np.where(spill, limit + (g - limit) * 0.15, g)
    return out


def keep_main_components(alpha, min_ratio=0.02, step=4):
    """알파 마스크에서 큰 덩어리만 남김 (작게 줄여서 계산 후 원래 크기로 적용)."""
    small = alpha[::step, ::step] > 0.5
    h, w = small.shape
    labels = np.zeros((h, w), dtype=np.int32)
    sizes = [0]
    current = 0
    for y in range(h):
        for x in range(w):
            if not small[y, x] or labels[y, x]:
                continue
            current += 1
            q = deque([(y, x)])
            labels[y, x] = current
            count = 0
            while q:
                cy, cx = q.popleft()
                count += 1
                for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                    if 0 <= ny < h and 0 <= nx < w and small[ny, nx] and not labels[ny, nx]:
                        labels[ny, nx] = current
                        q.append((ny, nx))
            sizes.append(count)
    if current == 0:
        return alpha
    biggest = max(sizes)
    keep = {i for i, s in enumerate(sizes) if i and s >= biggest * min_ratio}
    keep_small = np.isin(labels, list(keep))
    # 원래 크기로 늘리고, 가장자리 반투명 픽셀을 살리려고 한 칸 넓혀줌
    grown = keep_small.copy()
    grown[1:, :] |= keep_small[:-1, :]
    grown[:-1, :] |= keep_small[1:, :]
    grown[:, 1:] |= keep_small[:, :-1]
    grown[:, :-1] |= keep_small[:, 1:]
    mask = np.kron(grown, np.ones((step, step), dtype=bool))[: alpha.shape[0], : alpha.shape[1]]
    return np.where(mask, alpha, 0.0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('name')
    ap.add_argument('--height', type=int, default=640)
    ap.add_argument('--pad', type=int, default=8)
    ap.add_argument('--despill', choices=['edge', 'all'], default='edge')
    args = ap.parse_args()

    img = Image.open(args.src).convert('RGB')
    rgb = np.asarray(img).astype(np.float32)
    alpha = chroma_alpha(rgb)
    alpha = keep_main_components(alpha)
    rgb = despill(rgb, alpha, args.despill)

    ys, xs = np.where(alpha > 0.05)
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1
    rgba = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
    crop = Image.fromarray(rgba, 'RGBA').crop((x0, y0, x1, y1))

    # 발 위치: 맨 아래 12% 줄에서 보이는 픽셀들의 가로 범위 가운데
    # (한 발이 더 높이 있는 자세도 두 발을 모두 잡도록 범위를 넉넉히)
    a = np.asarray(crop)[..., 3] > 128
    band = a[int(a.shape[0] * 0.88):, :]
    cols = np.where(band.any(axis=0))[0]
    foot_x = (cols.min() + cols.max()) / 2 / a.shape[1]

    scale = args.height / crop.height
    out = crop.resize((round(crop.width * scale), args.height), Image.LANCZOS)
    pad = args.pad
    canvas = Image.new('RGBA', (out.width + pad * 2, out.height + pad), (0, 0, 0, 0))
    canvas.paste(out, (pad, pad))

    path = f'assets/characters/{args.name}.webp'
    canvas.save(path, quality=90, method=6)
    meta = {
        'image': path,
        'width': canvas.width,
        'height': canvas.height,
        # 기준점(발) 위치를 0~1 비율로
        'footX': round((pad + foot_x * out.width) / canvas.width, 4),
        'footY': 1.0,
    }
    print(json.dumps(meta, ensure_ascii=False))


if __name__ == '__main__':
    main()
