"""그림 후보를 한 장에 나란히 놓은 비교 시트를 만든다 (사람·에이전트가 한눈에 고르기 쉽게).

사용: python3 tools/art/sheet.py <출력.png> <그림1> <그림2> ... [--label 이름1,이름2,...]
투명 그림(처리된 스프라이트)은 어두운 배경 위에 놓는다.
"""
import sys

from PIL import Image, ImageDraw

args = [a for a in sys.argv[1:] if not a.startswith('--label')]
labels = None
for a in sys.argv[1:]:
    if a.startswith('--label'):
        labels = a.split('=', 1)[1].split(',') if '=' in a else None
out, files = args[0], args[1:]
if not files:
    sys.exit('그림이 없음')
H = 420
tiles = []
for f in files:
    im = Image.open(f).convert('RGBA')
    im = im.resize((max(1, round(im.width * H / im.height)), H))
    bg = Image.new('RGBA', im.size, (34, 30, 38, 255))
    bg.alpha_composite(im)
    tiles.append(bg)
W = sum(t.width for t in tiles) + 12 * (len(tiles) + 1)
sheet = Image.new('RGB', (W, H + 44), (18, 16, 20))
draw = ImageDraw.Draw(sheet)
x = 12
for i, t in enumerate(tiles):
    sheet.paste(t.convert('RGB'), (x, 12))
    draw.text((x + 6, H + 18), labels[i] if labels and i < len(labels) else f'{i + 1}: {files[i].split("/")[-1]}', fill=(230, 220, 200))
    x += t.width + 12
sheet.save(out)
print(out)
