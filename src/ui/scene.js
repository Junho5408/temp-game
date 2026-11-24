// 쿼터뷰 전투 장면 (저해상도 320x180 에 그린 뒤 3배로 확대해서 도트 느낌 유지)
import { buildSprite, SPRITE_SIZE } from './sprites.js';

export const LOW_W = 320;
export const LOW_H = 180;
export const SCALE = 3;

// 캐릭터 발 위치 (저해상도 좌표)
export const FEET = {
  player: { x: 124, y: 102 },
  enemy: { x: 198, y: 84 },
};

// 머리 꼭대기 위치 (적 의도 말풍선 위치 계산용)
export const SPRITE_TOP = {
  player: FEET.player.y - SPRITE_SIZE,
  enemy: FEET.enemy.y - SPRITE_SIZE,
};

const TILE_W = 32;
const TILE_H = 16;
const PLATFORM = { cx: 160, top: 68, size: 4 };

export function createScene(canvas) {
  const ctx = canvas.getContext('2d');
  const low = document.createElement('canvas');
  low.width = LOW_W;
  low.height = LOW_H;
  const lctx = low.getContext('2d');
  const background = renderBackground();

  const units = {
    player: { sprite: buildSprite('swordsman'), anim: newAnim(), dir: 1 },
    enemy: { sprite: null, anim: newAnim(), dir: -1 },
  };

  function setEnemy(spriteName) {
    units.enemy.sprite = buildSprite(spriteName, { flip: true });
    units.enemy.anim = newAnim();
  }

  function play(unitKey, kind) {
    const a = units[unitKey].anim;
    a[kind] = performance.now();
  }

  function draw(now, state) {
    lctx.clearRect(0, 0, LOW_W, LOW_H);
    lctx.drawImage(background, 0, 0);
    // 뒤에 있는 적부터 그림
    drawUnit(lctx, units.enemy, FEET.enemy, now, state?.enemy.hp <= 0);
    drawUnit(lctx, units.player, FEET.player, now, state?.player.hp <= 0);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(low, 0, 0, LOW_W * SCALE, LOW_H * SCALE);
  }

  return { setEnemy, play, draw };
}

function newAnim() {
  return { lunge: -1e9, hit: -1e9 };
}

function drawUnit(g, unit, feet, now, defeated) {
  if (!unit.sprite) return;
  const a = unit.anim;
  let dx = 0;
  let dy = 0;

  // 숨쉬기 (살짝 위아래)
  const bob = Math.round(Math.sin(now / 420 + (unit.dir > 0 ? 0 : 1.7)) * 0.6);

  // 공격: 상대 쪽으로 돌진했다 돌아옴
  const lt = (now - a.lunge) / 260;
  if (lt >= 0 && lt < 1) {
    const k = Math.sin(lt * Math.PI);
    dx += Math.round(k * 12 * unit.dir);
    dy += Math.round(-k * 5 * unit.dir);
  }
  // 피격: 좌우로 흔들림
  const ht = (now - a.hit) / 300;
  const hitting = ht >= 0 && ht < 1;
  if (hitting) dx += Math.round(Math.sin(ht * Math.PI * 6) * 2 * (1 - ht));

  // 그림자
  g.fillStyle = 'rgba(20, 14, 30, 0.35)';
  ellipse(g, feet.x + dx, feet.y, 10, 3);

  const sx = feet.x - SPRITE_SIZE / 2 + dx;
  const sy = feet.y - SPRITE_SIZE + 1 + dy + (defeated ? 0 : bob);
  const img = hitting && ht < 0.35 ? unit.sprite.flash : unit.sprite.normal;
  g.save();
  if (defeated) g.globalAlpha = 0.35;
  g.drawImage(img, sx, sy);
  g.restore();
}

function ellipse(g, cx, cy, rx, ry) {
  for (let y = -ry; y <= ry; y++) {
    const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry)));
    g.fillRect(cx - w, cy + y, w * 2, 1);
  }
}

// ── 배경 (한 번만 그려서 재사용) ──────────────────────────
function renderBackground() {
  const c = document.createElement('canvas');
  c.width = LOW_W;
  c.height = LOW_H;
  const g = c.getContext('2d');

  // 노을 하늘 (색 띠로 도트 느낌)
  const sky = ['#2c2a4a', '#3d3560', '#5a4272', '#7d4f7c', '#a8607a', '#d07a6e', '#e89c6c', '#f2bf7a'];
  const band = 9;
  sky.forEach((col, i) => {
    g.fillStyle = col;
    g.fillRect(0, i * band, LOW_W, band + 1);
  });
  g.fillStyle = sky.at(-1);
  g.fillRect(0, sky.length * band, LOW_W, LOW_H);

  // 해
  g.fillStyle = '#fbe3a0';
  ellipse(g, 248, 52, 14, 14);

  // 먼 산 / 가까운 산
  mountains(g, 58, 26, 0.045, 1.3, '#6b4a6e');
  mountains(g, 78, 22, 0.07, 4.1, '#4c3657');
  // 안개
  g.fillStyle = 'rgba(242, 191, 122, 0.35)';
  g.fillRect(0, 86, LOW_W, 6);
  // 땅
  mountains(g, 104, 6, 0.03, 2.2, '#2f2540');
  g.fillStyle = '#2f2540';
  g.fillRect(0, 108, LOW_W, LOW_H);

  drawBanner(g, 96, 66, '#c8323c');
  drawBanner(g, 224, 66, '#3d6bb3');
  drawPlatform(g);
  return c;
}

function mountains(g, baseY, amp, freq, phase, color) {
  g.fillStyle = color;
  for (let x = 0; x < LOW_W; x++) {
    const h =
      Math.sin(x * freq + phase) * amp * 0.6 +
      Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.3 +
      Math.abs(Math.sin(x * freq * 0.5 + phase)) * amp * 0.5;
    const top = Math.round(baseY - h);
    g.fillRect(x, top, 1, LOW_H - top);
  }
}

function drawBanner(g, x, footY, color) {
  // 깃대
  g.fillStyle = '#3a2a22';
  g.fillRect(x, footY - 44, 2, 44);
  g.fillStyle = '#c99a3e';
  g.fillRect(x - 1, footY - 46, 4, 2);
  // 깃발 (세로로 긴 무협 깃발)
  g.fillStyle = '#1b1424';
  g.fillRect(x + 2, footY - 43, 12, 24);
  g.fillStyle = color;
  g.fillRect(x + 2, footY - 42, 11, 22);
  for (let i = 0; i < 4; i++) g.fillRect(x + 2 + i * 3, footY - 20, 2, 2 + (i % 2));
  g.fillStyle = 'rgba(255,255,255,0.25)';
  g.fillRect(x + 5, footY - 38, 5, 14);
}

function drawPlatform(g) {
  const { cx, top, size } = PLATFORM;
  const half = (size * TILE_W) / 2;
  const leftX = cx - half;
  const midY = top - TILE_H / 2 + (size * TILE_H) / 2;
  const bottomY = top - TILE_H / 2 + size * TILE_H;
  const depth = 9;

  // 옆면 (왼쪽 밝게, 오른쪽 어둡게)
  for (let x = leftX; x < cx; x++) {
    const y = Math.round(midY + (x - leftX) / 2);
    g.fillStyle = '#6e5a52';
    g.fillRect(x, y, 1, depth);
    g.fillStyle = '#5a463f';
    g.fillRect(x, y + depth - 2, 1, 2);
  }
  for (let x = cx; x < cx + half; x++) {
    const y = Math.round(bottomY - (x - cx) / 2);
    g.fillStyle = '#4e3d38';
    g.fillRect(x, y, 1, depth);
    g.fillStyle = '#3d2f2b';
    g.fillRect(x, y + depth - 2, 1, 2);
  }

  // 바닥 타일
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const tx = cx + (i - j) * (TILE_W / 2);
      const ty = top + (i + j) * (TILE_H / 2);
      const light = (i + j) % 2 === 0;
      tile(g, tx, ty, light ? '#c9b8a2' : '#b8a690', light ? '#d9cab6' : '#c8b8a2');
    }
  }
  // 가운데 문양 (태극 느낌의 원)
  g.fillStyle = 'rgba(160, 60, 60, 0.35)';
  for (let y = -6; y <= 6; y++) {
    const w = Math.round(14 * Math.sqrt(1 - (y * y) / 36));
    g.fillRect(cx - w, midY + y, w * 2, 1);
  }
}

function tile(g, cx, cy, base, highlight) {
  const top = cy - TILE_H / 2;
  for (let r = 0; r < TILE_H; r++) {
    const half = r < TILE_H / 2 ? (r + 1) * 2 : (TILE_H - r) * 2;
    g.fillStyle = r < 2 ? highlight : base;
    g.fillRect(cx - half, top + r, half * 2, 1);
  }
  // 타일 경계선
  g.fillStyle = 'rgba(60, 40, 40, 0.25)';
  for (let r = 0; r < TILE_H / 2; r++) {
    const half = (r + 1) * 2;
    g.fillRect(cx - half, top + r, 1, 1);
  }
}
