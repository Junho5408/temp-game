// 대사 창 초상화: 전신 그림에서 얼굴 부분을 자동으로 잘라냄
// (그림 맨 위쪽에서 보이는 픽셀들의 가운데를 머리로 보고 정사각형으로 자름)
import { DESIGNS } from './characters.js';

const cache = new Map();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function getPortrait(artKey, size = 160) {
  const key = `${artKey}@${size}`;
  if (cache.has(key)) return cache.get(key);
  const d = DESIGNS[artKey];
  if (!d?.sprite) return null;
  const img = await loadImage(d.sprite.image);

  // 위쪽 25% 범위에서 머리 위치 찾기
  const probe = document.createElement('canvas');
  probe.width = img.width;
  probe.height = Math.round(img.height * 0.25);
  const pg = probe.getContext('2d', { willReadFrequently: true });
  pg.drawImage(img, 0, 0);
  const data = pg.getImageData(0, 0, probe.width, probe.height).data;
  let top = -1;
  let sumX = 0;
  let count = 0;
  for (let y = 0; y < probe.height; y++) {
    for (let x = 0; x < probe.width; x += 2) {
      if (data[(y * probe.width + x) * 4 + 3] > 128) {
        if (top < 0) top = y;
        sumX += x;
        count++;
      }
    }
  }
  const cx = count ? sumX / count : img.width / 2;
  const side = img.height * 0.2;
  const sx = Math.max(0, Math.min(img.width - side, cx - side / 2));
  const sy = Math.max(0, top - side * 0.06);

  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  c.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, size, size);
  cache.set(key, c);
  return c;
}
