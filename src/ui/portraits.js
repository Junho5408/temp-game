// 대사 창 초상화: 전신 그림에서 얼굴 부분을 자동으로 잘라냄
// (몸 중심 위쪽 끝을 머리로 보고 정사각형으로 자름, 그림마다 face 로 손보정)
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

  // 머리 찾기: 무기·머리카락·털이 옆으로 뻗어도 흔들리지 않게,
  // 위쪽 10~40% 띠(어깨·몸통)의 불투명 픽셀 중앙값을 몸 중심으로 보고, 그 중심 근처에서 가장 위 픽셀을 머리 꼭대기로 봄
  const probe = document.createElement('canvas');
  probe.width = img.width;
  probe.height = Math.round(img.height * 0.45);
  const pg = probe.getContext('2d', { willReadFrequently: true });
  pg.drawImage(img, 0, 0);
  const data = pg.getImageData(0, 0, probe.width, probe.height).data;
  const W = probe.width;
  const solid = (x, y) => data[(y * W + x) * 4 + 3] > 128;
  const F = d.sprite.face; // 손으로 맞춘 얼굴 위치 (그림 높이 대비 비율): { x: 머리 가운데, y: 머리 꼭대기, size }
  const side = img.height * (F?.size ?? 0.2);
  const xs = [];
  for (let y = Math.round(img.height * 0.1); y < probe.height; y += 2) {
    for (let x = 0; x < W; x += 2) if (solid(x, y)) xs.push(x);
  }
  xs.sort((a, b) => a - b);
  let cx = xs.length ? xs[xs.length >> 1] : img.width / 2;
  // 그 중심 근처(머리 폭)에서 가장 위 픽셀
  const half = side * 0.3;
  let top = 0;
  find: for (let y = 0; y < probe.height; y++) {
    for (let x = Math.max(0, Math.round(cx - half)); x < Math.min(W, cx + half); x++) {
      if (solid(x, y)) { top = y; break find; }
    }
  }
  // 머리 꼭대기 근처 몇 줄의 가운데로 다시 맞춤 (상투·갓이 살짝 비껴 있어도)
  let hs = 0;
  let hn = 0;
  for (let y = top; y < Math.min(probe.height, top + side * 0.5); y++) {
    for (let x = Math.max(0, Math.round(cx - side * 0.5)); x < Math.min(W, cx + side * 0.5); x++) if (solid(x, y)) { hs += x; hn++; }
  }
  if (hn) cx = hs / hn;
  if (F?.x !== undefined) cx = F.x * img.height;
  if (F?.y !== undefined) top = F.y * img.height;
  const sx = Math.max(0, Math.min(img.width - side, cx - side / 2));
  const sy = Math.max(0, top - side * 0.06);

  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  c.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, size, size);
  cache.set(key, c);
  return c;
}
