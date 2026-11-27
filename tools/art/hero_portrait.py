"""주인공 선택 화면 초상 만들기: 전신 스프라이트에서 머리·어깨를 잘라 어두운 배경에 얹음
사용: python3 tools/art/hero_portrait.py <key> [<key> ...]  → assets/portraits/<key>.webp (329×206)"""
import sys
from PIL import Image, ImageDraw, ImageFilter

W, H = 329, 206
COLOR = {'orthodox': (60, 90, 140), 'unorthodox': (130, 100, 55), 'demonic': (140, 40, 45)}


def background(tint):
    bg = Image.new('RGB', (W, H), (22, 24, 30))
    glow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(glow).ellipse([W * 0.15, H * 0.05, W * 0.85, H * 1.4], fill=150)
    glow = glow.filter(ImageFilter.GaussianBlur(40))
    bg.paste(Image.new('RGB', (W, H), tuple(int(c * 0.55) for c in tint)), (0, 0), glow)
    d = ImageDraw.Draw(bg)
    for (x, y, sx, sy) in [(4, 4, 1, 1), (W - 5, 4, -1, 1), (4, H - 5, 1, -1), (W - 5, H - 5, -1, -1)]:
        d.line([(x, y), (x + 22 * sx, y)], fill=(150, 130, 90), width=2)
        d.line([(x, y), (x, y + 22 * sy)], fill=(150, 130, 90), width=2)
    return bg


def head_box(img):
    a = img.getchannel('A')
    w, h = img.size
    # 몸 중심: 위 10~40% 띠의 불투명 픽셀 중앙값 (무기에 안 끌리게)
    xs = [x for y in range(int(h * 0.1), int(h * 0.4), 3) for x in range(0, w, 3) if a.getpixel((x, y)) > 128]
    xs.sort()
    cx = xs[len(xs) // 2] if xs else w / 2
    half = h * 0.06
    top = 0
    for y in range(h):
        if any(a.getpixel((x, y)) > 128 for x in range(max(0, int(cx - half)), min(w, int(cx + half)))):
            top = y
            break
    return cx, top


for key in sys.argv[1:]:
    spr = Image.open(f'assets/characters/{key}.webp').convert('RGBA')
    cx, top = head_box(spr)
    side = spr.height * 0.40  # 머리·어깨
    cw = side * W / H
    box = (int(cx - cw / 2), int(top - side * 0.04), int(cx + cw / 2), int(top - side * 0.04 + side))
    crop = Image.new('RGBA', (box[2] - box[0], box[3] - box[1]), (0, 0, 0, 0))
    crop.paste(spr.crop((max(0, box[0]), max(0, box[1]), min(spr.width, box[2]), min(spr.height, box[3]))), (max(0, -box[0]), max(0, -box[1])))
    crop = crop.resize((W, H), Image.LANCZOS)
    out = background(COLOR[key.split('-')[0]])
    out.paste(crop, (0, 0), crop)
    out.save(f'assets/portraits/{key}.webp', quality=92)
    print('portrait', key)
