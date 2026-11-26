// 쿼터뷰 전투 장면: 채색 배경 + 전신 캐릭터 + 코드 모션 + 이펙트
// 캐릭터 그림은 오른쪽을 보도록 그려져 있고, 적은 좌우 반전해서 그림.
// 캔버스는 960x540 좌표계로 그리되, 선명하게 보이도록 2배 해상도로 렌더링.
import { DESIGNS } from './characters.js';

export const W = 960;
export const H = 540;
const DPR = 2;
export const CHAR_H = 210; // 화면에서 캐릭터 키

// 발 위치
export const FEET = {
  player: { x: 300, y: 345 },
  enemy: { x: 668, y: 300 },
};
// 가슴 높이 (데미지 숫자, 이펙트 위치)
export const CHEST = {
  player: { x: FEET.player.x, y: FEET.player.y - CHAR_H * 0.58 },
  enemy: { x: FEET.enemy.x, y: FEET.enemy.y - CHAR_H * 0.58 },
};
export const HEAD_Y = {
  player: FEET.player.y - CHAR_H,
  enemy: FEET.enemy.y - CHAR_H,
};

// 공격이 상대에게 닿는 시점 (ms)
export const IMPACT_MS = 230;

const ease = {
  out: (t) => 1 - (1 - t) ** 3,
  in: (t) => t * t * t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
};
const clamp01 = (t) => Math.max(0, Math.min(1, t));

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`그림을 불러오지 못함: ${src}`));
    img.src = src;
  });
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * DPR);
  c.height = Math.ceil(h * DPR);
  return c;
}

// 그림을 한 가지 색으로 덮은 사본 (번쩍임, 실루엣용)
function tinted(src, w, h, color, alpha = 1) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0, c.width, c.height);
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

export async function createScene(canvas, { player }) {
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext('2d');
  const background = renderBackground();
  const fx = [];
  const sparks = [];
  const embers = Array.from({ length: 60 }, () => spawnEmber(true));
  const fog = Array.from({ length: 8 }, (_, i) => ({
    x: Math.random() * W,
    y: 150 + Math.random() * 330,
    r: 140 + Math.random() * 160,
    speed: (0.15 + Math.random() * 0.35) * (i % 2 ? 1 : -1),
    alpha: 0.04 + Math.random() * 0.06,
  }));
  let shakeUntil = 0;
  let shakePower = 0;

  const fallbackImg = await loadImage(DESIGNS[player].sprite.image);
  const units = {
    player: await makeUnit(player, 1, fallbackImg),
    enemy: null,
  };

  async function setEnemy(artKey) {
    units.enemy = await makeUnit(artKey, -1, fallbackImg);
  }

  // ── 동작 ─────────────────────────
  function attack(who) {
    const u = units[who];
    if (!u) return IMPACT_MS;
    u.anim.attack = performance.now();
    const target = who === 'player' ? 'enemy' : 'player';
    setTimeout(() => spawnAttackFx(u.cls, who, target), IMPACT_MS - 30);
    return IMPACT_MS;
  }

  function hit(who, amount) {
    const u = units[who];
    if (!u) return;
    u.anim.hit = performance.now();
    const at = CHEST[who];
    const n = Math.min(22, 8 + amount);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 5;
      sparks.push({ x: at.x, y: at.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, life: 1, born: performance.now() });
    }
    if (amount >= 8) shake(amount >= 11 ? 7 : 4);
  }

  function guard(who) {
    const u = units[who];
    if (!u) return;
    u.anim.guard = performance.now();
  }

  function die(who) {
    const u = units[who];
    if (!u || u.anim.death) return;
    u.anim.death = performance.now();
  }

  function shake(power) {
    shakePower = power;
    shakeUntil = performance.now() + 260;
  }

  function spawnAttackFx(cls, from, to) {
    const now = performance.now();
    const at = CHEST[to];
    const dir = from === 'player' ? 1 : -1;
    const tint = units[from]?.fxColor ?? '#bcd6ff';
    if (cls === 'fist') fx.push({ type: 'impact', x: at.x, y: at.y, born: now, color: tint, dir });
    else if (cls === 'assassin') fx.push({ type: 'streaks', x: at.x, y: at.y, born: now, color: tint, dir });
    else fx.push({ type: 'slash', x: at.x, y: at.y, born: now, color: tint, dir });
  }

  // ── 그리기 ─────────────────────────
  function draw(now, state) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    let sx = 0;
    let sy = 0;
    if (now < shakeUntil) {
      sx = (Math.random() - 0.5) * shakePower * 2;
      sy = (Math.random() - 0.5) * shakePower * 2;
    }
    ctx.drawImage(background, 0, 0, W, H);
    drawFog(ctx, now);
    ctx.save();
    ctx.translate(sx, sy);
    // 뒤에 있는 적부터
    if (units.enemy) drawUnit(ctx, units.enemy, 'enemy', now, state);
    drawUnit(ctx, units.player, 'player', now, state);
    drawFx(ctx, now);
    drawSparks(ctx, now);
    ctx.restore();
    drawEmbers(ctx, now);
  }

  function drawUnit(g, u, who, now, state) {
    const feet = FEET[who];
    const other = FEET[who === 'player' ? 'enemy' : 'player'];
    const a = u.anim;
    let x = 0;
    let y = 0;
    let rot = Math.sin(now / 1300 + u.phase) * 0.006;
    let alpha = 1;
    let flash = null;
    let ghost = 0;

    // 대기: 숨쉬기
    const breath = Math.sin(now / 650 + u.phase);
    let scaleY = 1 + breath * 0.012;
    let scaleX = 1 - breath * 0.005;

    // 공격: 뒤로 당겼다가 → 돌진 → 잠깐 멈춤 → 복귀
    const at = now - a.attack;
    if (at >= 0 && at < 600) {
      const dashX = (other.x - feet.x) * 0.5;
      const dashY = (other.y - feet.y) * 0.5;
      let k;
      if (at < 120) {
        k = -0.08 * ease.out(at / 120);
      } else if (at < IMPACT_MS) {
        k = -0.08 + 1.08 * ease.in((at - 120) / (IMPACT_MS - 120));
        ghost = 1;
      } else if (at < 320) {
        k = 1;
      } else {
        k = 1 - ease.inOut((at - 320) / 280);
      }
      x += dashX * k;
      y += dashY * k;
      rot += u.dir * 0.08 * Math.max(0, k);
      if (k < 0) {
        scaleY *= 1 + k * 0.4; // 웅크림
      }
    }

    // 피격: 뒤로 밀림 + 기울어짐 + 번쩍임
    const ht = now - a.hit;
    if (ht >= 0 && ht < 450) {
      const p = ht / 450;
      const k = p < 0.2 ? ease.out(p / 0.2) : 1 - ease.inOut((p - 0.2) / 0.8);
      x -= u.dir * 26 * k;
      rot -= u.dir * 0.09 * k;
      if (ht < 70) flash = u.flashWhite;
      else if (ht < 240) flash = u.flashRed;
    }

    // 쓰러짐
    if (a.death) {
      const p = clamp01((now - a.death) / 750);
      rot -= u.dir * 1.2 * ease.in(p);
      x -= u.dir * 18 * p;
      alpha = 1 - 0.55 * p;
      scaleY = 1;
      scaleX = 1;
    }

    // 그림자
    g.save();
    g.globalAlpha = 0.45 * alpha;
    g.fillStyle = '#05070a';
    g.beginPath();
    g.ellipse(feet.x + x, feet.y + 2, 68, 13, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();

    // 호신강기 (방어도가 있을 때 몸을 감싸는 푸른 기운)
    const block = state?.[who]?.block ?? 0;
    const gt = now - a.guard;
    if (block > 0 || (gt >= 0 && gt < 500)) {
      drawAura(g, feet.x + x, feet.y + y, u, now, block > 0, gt);
    }

    // 돌진 잔상
    if (ghost) {
      for (let i = 1; i <= 3; i++) {
        g.save();
        g.globalAlpha = 0.12 * (4 - i) * alpha;
        drawBody(g, u, feet.x + x - u.dir * i * 16, feet.y + y, rot, scaleX, scaleY, u.image);
        g.restore();
      }
    }

    g.save();
    g.globalAlpha = alpha;
    drawBody(g, u, feet.x + x, feet.y + y, rot, scaleX, scaleY, u.image);
    if (flash) drawBody(g, u, feet.x + x, feet.y + y, rot, scaleX, scaleY, flash);
    g.restore();
  }

  function drawBody(g, u, x, y, rot, sx, sy, img) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.scale(u.dir * sx, sy);
    g.drawImage(img, -u.footX * u.w, -u.h, u.w, u.h);
    g.restore();
  }

  function drawAura(g, x, y, u, now, active, gt) {
    const cy = y - u.h * 0.5;
    const pulse = 0.5 + Math.sin(now / 260) * 0.5;
    g.save();
    if (active) {
      const grad = g.createRadialGradient(x, cy, 10, x, cy, u.h * 0.62);
      grad.addColorStop(0, `rgba(110, 170, 255, ${0.06 + pulse * 0.04})`);
      grad.addColorStop(0.75, `rgba(110, 170, 255, ${0.16 + pulse * 0.06})`);
      grad.addColorStop(1, 'rgba(110, 170, 255, 0)');
      g.fillStyle = grad;
      g.beginPath();
      g.ellipse(x, cy, u.h * 0.45, u.h * 0.62, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = `rgba(170, 210, 255, ${0.35 + pulse * 0.2})`;
      g.lineWidth = 2;
      g.setLineDash([14, 10]);
      g.lineDashOffset = -now / 25;
      g.beginPath();
      g.ellipse(x, cy, u.h * 0.42, u.h * 0.58, 0, 0, Math.PI * 2);
      g.stroke();
    }
    if (gt >= 0 && gt < 500) {
      // 강기를 끌어올리는 순간 퍼지는 고리
      const p = gt / 500;
      g.setLineDash([]);
      g.strokeStyle = `rgba(190, 225, 255, ${0.8 * (1 - p)})`;
      g.lineWidth = 4 * (1 - p) + 1;
      g.beginPath();
      g.ellipse(x, cy, u.h * (0.3 + p * 0.25), u.h * (0.42 + p * 0.3), 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
  }

  function drawFx(g, now) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i];
      const t = now - f.born;
      if (t > 450) {
        fx.splice(i, 1);
        continue;
      }
      g.save();
      g.globalCompositeOperation = 'lighter';
      if (f.type === 'slash') drawSlash(g, f, t);
      else if (f.type === 'impact') drawImpact(g, f, t);
      else drawStreaks(g, f, t);
      g.restore();
    }
  }

  // 검기: 초승달 모양 궤적
  function drawSlash(g, f, t) {
    const r = 92;
    const start = f.dir > 0 ? -2.3 : -0.85;
    const sweep = 2.3 * f.dir;
    const head = ease.out(clamp01(t / 150));
    const tail = ease.in(clamp01((t - 60) / 300));
    if (head <= tail) return;
    const a0 = start + sweep * tail;
    const a1 = start + sweep * head;
    const fade = 1 - clamp01((t - 250) / 200);
    const cx = f.x - f.dir * 20;
    const cy = f.y + 10;
    g.lineCap = 'round';
    g.shadowColor = f.color;
    g.shadowBlur = 24;
    for (const [w, col, al] of [[18, f.color, 0.55], [8, '#ffffff', 0.9]]) {
      g.strokeStyle = col;
      g.globalAlpha = al * fade;
      g.lineWidth = w;
      g.beginPath();
      g.arc(cx, cy, r, Math.min(a0, a1), Math.max(a0, a1));
      g.stroke();
    }
  }

  // 권경: 퍼지는 충격파
  function drawImpact(g, f, t) {
    const p = clamp01(t / 380);
    g.strokeStyle = f.color;
    g.shadowColor = f.color;
    g.shadowBlur = 20;
    for (let k = 0; k < 2; k++) {
      const q = clamp01(p - k * 0.18);
      g.globalAlpha = (1 - q) * 0.9;
      g.lineWidth = 10 * (1 - q) + 1;
      g.beginPath();
      g.ellipse(f.x, f.y, 20 + q * 95, 12 + q * 60, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.globalAlpha = 1 - p;
    g.lineWidth = 3;
    g.strokeStyle = '#fff6dc';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r0 = 20 + p * 40;
      const r1 = r0 + 30 * (1 - p);
      g.beginPath();
      g.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0 * 0.7);
      g.lineTo(f.x + Math.cos(a) * r1, f.y + Math.sin(a) * r1 * 0.7);
      g.stroke();
    }
  }

  // 암기: 빠르게 꽂히는 여러 줄기
  function drawStreaks(g, f, t) {
    const p = clamp01(t / 300);
    g.strokeStyle = f.color;
    g.shadowColor = f.color;
    g.shadowBlur = 14;
    g.lineWidth = 3;
    g.globalAlpha = 1 - p;
    for (let i = 0; i < 4; i++) {
      const oy = (i - 1.5) * 22;
      const len = 120 * (1 - p);
      g.beginPath();
      g.moveTo(f.x - f.dir * (len + 30), f.y + oy - 10);
      g.lineTo(f.x - f.dir * 10, f.y + oy);
      g.stroke();
    }
  }

  function drawSparks(g, now) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      const t = (now - s.born) / 450;
      if (t >= 1) {
        sparks.splice(i, 1);
        continue;
      }
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.25;
      g.strokeStyle = `rgba(255, ${190 - t * 90}, ${110 - t * 80}, ${1 - t})`;
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(s.x, s.y);
      g.lineTo(s.x - s.vx * 2.2, s.y - s.vy * 2.2);
      g.stroke();
    }
    g.restore();
  }

  function drawFog(g, now) {
    for (const f of fog) {
      f.x += f.speed;
      if (f.x - f.r > W) f.x = -f.r;
      if (f.x + f.r < 0) f.x = W + f.r;
      const grad = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      grad.addColorStop(0, `rgba(160, 172, 190, ${f.alpha})`);
      grad.addColorStop(1, 'rgba(160, 172, 190, 0)');
      g.fillStyle = grad;
      g.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }
  }

  function spawnEmber(anywhere = false) {
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 10,
      vy: 0.3 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      size: 0.8 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function drawEmbers(g, now) {
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.y -= e.vy;
      e.x += e.vx + Math.sin(now / 900 + e.phase) * 0.25;
      if (e.y < -10) embers[i] = spawnEmber();
      const flicker = 0.55 + Math.sin(now / 160 + e.phase) * 0.35;
      g.fillStyle = `rgba(255, 120, 40, ${0.16 * flicker})`;
      g.beginPath();
      g.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = `rgba(255, 195, 120, ${flicker})`;
      g.beginPath();
      g.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      g.fill();
    }
  }

  return { setEnemy, attack, hit, guard, die, shake, draw };
}

// 캐릭터 하나 준비: 그림 + 번쩍임 사본. 전신 그림이 아직 없으면 실루엣으로 대신함.
async function makeUnit(artKey, dir, fallbackImg) {
  const d = DESIGNS[artKey];
  const hasArt = !!d.sprite;
  const img = hasArt ? await loadImage(d.sprite.image) : fallbackImg;
  const footX = hasArt ? d.sprite.footX : DESIGNS['orthodox-sword'].sprite.footX;
  const h = CHAR_H;
  const w = (h * img.width) / img.height;
  let image = img;
  if (!hasArt) {
    // 실루엣 + 세력 색 테두리 느낌
    const rim = tinted(img, w, h, d.factionColor, 1);
    const body = tinted(img, w, h, '#10131a', 1);
    const c = makeCanvas(w, h);
    const g = c.getContext('2d');
    for (const [ox, oy] of [[-3, 0], [3, 0], [0, -3], [0, 3]]) g.drawImage(rim, ox * DPR, oy * DPR);
    g.globalAlpha = 1;
    g.drawImage(body, 0, 0);
    image = c;
  }
  return {
    key: artKey,
    cls: d.cls,
    dir,
    image,
    w,
    h,
    footX,
    placeholder: !hasArt,
    fxColor: d.fxColor,
    flashWhite: tinted(image, w, h, '#ffffff', 0.85),
    flashRed: tinted(image, w, h, '#ff2a2a', 0.45),
    phase: Math.random() * 10,
    anim: { attack: -1e9, hit: -1e9, guard: -1e9, death: 0 },
  };
}

// ── 배경 (한 번만 그려서 재사용) ─────────────────────────
function renderBackground() {
  const c = makeCanvas(W, H);
  const g = c.getContext('2d');
  g.scale(DPR, DPR);

  // 하늘
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0f141b');
  sky.addColorStop(0.45, '#1d2530');
  sky.addColorStop(0.62, '#2e2a30');
  sky.addColorStop(1, '#1a1517');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);

  // 지평선의 붉은 기운
  const haze = g.createRadialGradient(W * 0.55, 300, 20, W * 0.55, 300, 560);
  haze.addColorStop(0, 'rgba(160, 60, 40, 0.35)');
  haze.addColorStop(1, 'rgba(160, 60, 40, 0)');
  g.fillStyle = haze;
  g.fillRect(0, 0, W, H);

  // 먼 산 → 가까운 산 (뒤로 갈수록 흐리게)
  ridge(g, 205, 70, 0.006, 1.1, ['#2a3340', '#232b36']);
  mist(g, 200, 60, 0.16);
  ridge(g, 245, 60, 0.009, 3.7, ['#212833', '#1a2029']);
  mist(g, 240, 50, 0.14);
  ridge(g, 282, 34, 0.013, 5.2, ['#181d25', '#13171d']);

  drawBanner(g, 198, 300, '#a3262e', '#6e161c');
  drawBanner(g, 772, 292, '#2f5ea8', '#1d3b6e');
  drawPlatform(g);

  // 가장자리 어둡게
  const vig = g.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.45, W * 0.68);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);
  return c;
}

function ridge(g, baseY, amp, freq, phase, [top, bottom]) {
  const grad = g.createLinearGradient(0, baseY - amp, 0, baseY + 60);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, H);
  for (let x = 0; x <= W; x += 4) {
    const h =
      Math.sin(x * freq + phase) * amp * 0.55 +
      Math.sin(x * freq * 2.7 + phase * 1.9) * amp * 0.25 +
      Math.abs(Math.sin(x * freq * 0.6 + phase)) * amp * 0.45;
    g.lineTo(x, baseY - h);
  }
  g.lineTo(W, H);
  g.closePath();
  g.fill();
}

function mist(g, y, h, alpha) {
  const grad = g.createLinearGradient(0, y - h, 0, y + h);
  grad.addColorStop(0, 'rgba(150, 160, 175, 0)');
  grad.addColorStop(0.5, `rgba(150, 160, 175, ${alpha})`);
  grad.addColorStop(1, 'rgba(150, 160, 175, 0)');
  g.fillStyle = grad;
  g.fillRect(0, y - h, W, h * 2);
}

function drawBanner(g, x, footY, color, dark) {
  // 깃대
  g.fillStyle = '#2a1f1a';
  g.fillRect(x - 2, footY - 190, 5, 190);
  g.fillStyle = '#b8923e';
  g.fillRect(x - 4, footY - 196, 9, 7);
  // 늘어진 깃발 (살짝 휘날림)
  const top = footY - 182;
  const grad = g.createLinearGradient(x, 0, x + 46, 0);
  grad.addColorStop(0, dark);
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, dark);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(x + 3, top);
  g.lineTo(x + 46, top + 4);
  g.quadraticCurveTo(x + 52, top + 60, x + 44, top + 112);
  g.lineTo(x + 36, top + 102);
  g.lineTo(x + 28, top + 116);
  g.lineTo(x + 20, top + 104);
  g.lineTo(x + 12, top + 118);
  g.quadraticCurveTo(x + 8, top + 60, x + 3, top);
  g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.6)';
  g.lineWidth = 1.5;
  g.stroke();
  // 금색 테두리 무늬
  g.strokeStyle = 'rgba(220, 180, 90, 0.55)';
  g.lineWidth = 1.2;
  g.strokeRect(x + 14, top + 16, 20, 60);
}

function drawPlatform(g) {
  const L = [150, 300];
  const T = [480, 190];
  const R = [810, 300];
  const B = [480, 410];
  const depth = 26;

  // 옆면
  const left = g.createLinearGradient(0, 300, 0, 440);
  left.addColorStop(0, '#4a4038');
  left.addColorStop(1, '#2a241f');
  g.fillStyle = left;
  g.beginPath();
  g.moveTo(...L);
  g.lineTo(...B);
  g.lineTo(B[0], B[1] + depth);
  g.lineTo(L[0], L[1] + depth);
  g.closePath();
  g.fill();
  const right = g.createLinearGradient(0, 300, 0, 440);
  right.addColorStop(0, '#362e28');
  right.addColorStop(1, '#1c1814');
  g.fillStyle = right;
  g.beginPath();
  g.moveTo(...B);
  g.lineTo(...R);
  g.lineTo(R[0], R[1] + depth);
  g.lineTo(B[0], B[1] + depth);
  g.closePath();
  g.fill();
  // 옆면 돌 이음새
  g.strokeStyle = 'rgba(0,0,0,0.35)';
  g.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    for (const [a, b] of [[L, B], [B, R]]) {
      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x, y + depth);
      g.stroke();
    }
  }

  // 윗면 (빛이 오른쪽 위에서)
  const topGrad = g.createLinearGradient(200, 400, 760, 200);
  topGrad.addColorStop(0, '#5c5348');
  topGrad.addColorStop(1, '#8a7f70');
  g.fillStyle = topGrad;
  g.beginPath();
  g.moveTo(...L);
  g.lineTo(...T);
  g.lineTo(...R);
  g.lineTo(...B);
  g.closePath();
  g.fill();

  // 바닥 돌판 줄눈
  g.save();
  g.clip();
  g.strokeStyle = 'rgba(20, 15, 12, 0.28)';
  g.lineWidth = 1.2;
  const n = 6;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    g.beginPath();
    g.moveTo(L[0] + (T[0] - L[0]) * t, L[1] + (T[1] - L[1]) * t);
    g.lineTo(B[0] + (R[0] - B[0]) * t, B[1] + (R[1] - B[1]) * t);
    g.stroke();
    g.beginPath();
    g.moveTo(L[0] + (B[0] - L[0]) * t, L[1] + (B[1] - L[1]) * t);
    g.lineTo(T[0] + (R[0] - T[0]) * t, T[1] + (R[1] - T[1]) * t);
    g.stroke();
  }
  // 가운데 문양
  g.strokeStyle = 'rgba(150, 50, 40, 0.35)';
  g.lineWidth = 3;
  g.beginPath();
  g.ellipse(480, 300, 92, 31, 0, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 1.5;
  g.beginPath();
  g.ellipse(480, 300, 72, 24, 0, 0, Math.PI * 2);
  g.stroke();
  // 연기에 가려진 듯한 어둠
  const shade = g.createLinearGradient(0, 190, 0, 410);
  shade.addColorStop(0, 'rgba(10, 12, 16, 0.25)');
  shade.addColorStop(1, 'rgba(10, 12, 16, 0)');
  g.fillStyle = shade;
  g.fillRect(150, 190, 660, 220);
  g.restore();

  // 윗면 가장자리 하이라이트
  g.strokeStyle = 'rgba(220, 205, 180, 0.35)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(...L);
  g.lineTo(...T);
  g.lineTo(...R);
  g.stroke();
}
