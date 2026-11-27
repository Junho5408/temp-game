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
  // 배경: arena(1구역 비무대) / forest(2구역 녹림 산채) / gate(3구역 불타는 관문) / inn(청운객잔)
  const backgrounds = {
    arena: renderBackground('arena'),
    forest: renderBackground('forest'),
    gate: renderBackground('gate'),
    alley: renderBackground('alley'),
    altar: renderBackground('altar'),
    hall: renderBackground('hall'),
    inn: renderInnBackground(),
  };
  let mode = 'arena';
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

  // ── 타격 멈춤(히트스톱): 동작 시계만 잠깐 멈춤 (흔들림·불티는 계속) ──
  let freezeStart = 0;
  let freezeEnd = 0;
  let frozenAcc = 0;
  let freezeCounted = true;
  function clock() {
    const n = performance.now();
    if (n < freezeEnd) return freezeStart - frozenAcc;
    if (!freezeCounted) {
      frozenAcc += freezeEnd - freezeStart;
      freezeCounted = true;
    }
    return n - frozenAcc;
  }
  function isFrozen() {
    return performance.now() < freezeEnd;
  }
  function hitstop(ms) {
    const n = performance.now();
    if (n < freezeEnd) {
      freezeEnd = Math.max(freezeEnd, n + ms);
      return;
    }
    clock();
    freezeStart = n;
    freezeEnd = n + ms;
    freezeCounted = false;
  }
  // 카메라: 맞는 쪽으로 살짝 당겼다 놓음
  let cam = { at: -1e9, x: W / 2, y: H / 2, pow: 0 };
  function punch(who, pow = 1) {
    const c = CHEST[who];
    cam = { at: performance.now(), x: c.x, y: c.y, pow: Math.min(1.6, pow) };
  }
  // 필살: 화면이 어두워지고 기를 모으는 속도선
  let fin = { at: -1e9, who: 'player' };
  function finisher(who) {
    fin = { at: performance.now(), who };
  }

  const fallbackImg = await loadImage(DESIGNS[player].sprite.image);
  const units = {
    player: await makeUnit(player, 1, fallbackImg),
    enemy: null,
  };

  async function setPlayer(artKey) {
    units.player = await makeUnit(artKey, 1, fallbackImg);
  }

  async function setEnemy(artKey) {
    units.enemy = await makeUnit(artKey, -1, fallbackImg);
  }

  function clearEnemy() {
    units.enemy = null;
  }

  // 새 전투 시작: 쓰러짐 등 이전 동작 상태를 지움
  function reset() {
    for (const u of Object.values(units)) {
      if (u) u.anim = { attack: -1e9, hit: -1e9, buff: -1e9, dodge: -1e9, death: 0, hold: false, release: -1e9, strike: -1e9 };
    }
    fx.length = 0;
    sparks.length = 0;
  }

  // ── 동작 ─────────────────────────
  // 공격: 계열마다 다른 동작 (검객 베고 지나감 / 권사 파고들어 내지름 / 살수 사라졌다 나타남)
  // hold: 연타면 상대 앞에 머물러 strike 로 이어 치고 release 로 돌아옴
  function attack(who, { hold = false } = {}) {
    const u = units[who];
    if (!u) return IMPACT_MS;
    u.anim.attack = clock();
    u.anim.hold = hold;
    u.anim.release = -1e9;
    u.anim.strike = -1e9;
    const target = who === 'player' ? 'enemy' : 'player';
    setTimeout(() => spawnAttackFx(u.cls, who, target), IMPACT_MS - 30);
    return IMPACT_MS;
  }

  const STRIKE_MS = 95;
  function strike(who) {
    const u = units[who];
    if (!u) return STRIKE_MS;
    u.anim.strike = clock();
    const target = who === 'player' ? 'enemy' : 'player';
    setTimeout(() => spawnAttackFx(u.cls, who, target, true), STRIKE_MS - 30);
    return STRIKE_MS;
  }

  function release(who) {
    const u = units[who];
    if (!u || !u.anim.hold) return;
    u.anim.hold = false;
    u.anim.release = clock();
  }

  function hit(who, amount, { crit = false } = {}) {
    const u = units[who];
    if (!u) return;
    u.anim.hit = clock();
    u.anim.hitPow = Math.min(64, 18 + amount * 1.6) * (crit ? 1.3 : 1);
    const at = CHEST[who];
    const away = who === 'enemy' ? 1 : -1; // 맞은 쪽 뒤로 튐
    const now = clock();
    const n = Math.min(24, 8 + amount);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 5;
      sparks.push({ x: at.x, y: at.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, born: now });
    }
    // 피: 맞은 쪽 뒤로 뿌려짐 (피해가 클수록 많이)
    const b = Math.min(26, Math.round(amount * 1.2));
    for (let i = 0; i < b; i++) {
      const a = (Math.random() - 0.5) * 1.4 - 0.35;
      const sp = 3 + Math.random() * 6;
      sparks.push({
        x: at.x + away * 6, y: at.y - 4, vx: away * Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, born: now, blood: true, size: 1.5 + Math.random() * 2.5,
      });
    }
    if (amount >= 8) shake(amount >= 11 ? 7 : 4);
  }

  // 회피: 뒤로 미끄러지며 잔상
  function dodge(who) {
    const u = units[who];
    if (!u) return;
    u.anim.dodge = clock();
  }

  // 기세를 끌어올릴 때: 몸에서 금빛 기운이 퍼짐
  function buff(who) {
    const u = units[who];
    if (!u) return;
    u.anim.buff = clock();
  }

  function die(who) {
    const u = units[who];
    if (!u || u.anim.death) return;
    u.anim.death = clock();
  }

  function shake(power) {
    shakePower = power;
    shakeUntil = performance.now() + 260;
  }

  function spawnAttackFx(cls, from, to, small = false) {
    const now = clock();
    const at = CHEST[to];
    const dir = from === 'player' ? 1 : -1;
    const tint = units[from]?.fxColor ?? '#bcd6ff';
    const flip = small && Math.random() < 0.5; // 연타는 위아래로 번갈아
    if (cls === 'fist') {
      fx.push({ type: 'impact', x: at.x + (small ? (Math.random() - 0.5) * 30 : 0), y: at.y + (small ? (Math.random() - 0.5) * 30 : 0), born: now, color: tint, dir, small });
      if (!small) fx.push({ type: 'crack', x: FEET[to].x, y: FEET[to].y, born: now, color: tint, dir });
    } else if (cls === 'assassin') {
      fx.push({ type: 'streaks', x: at.x, y: at.y, born: now, color: tint, dir, small });
      fx.push({ type: 'stab', x: at.x, y: at.y + (Math.random() - 0.5) * 20, born: now, color: tint, dir });
    } else {
      fx.push({ type: 'slash', x: at.x, y: at.y, born: now, color: tint, dir, flip, small });
      if (!small) fx.push({ type: 'slash', x: at.x, y: at.y - 6, born: now + 50, color: '#ffffff', dir, flip: !flip, small: true, thin: true });
    }
  }

  // ── 그리기 ─────────────────────────
  function draw(now, state) {
    const t = clock(); // 동작 시계 (히트스톱 동안 멈춤)
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    let sx = 0;
    let sy = 0;
    if (now < shakeUntil) {
      sx = (Math.random() - 0.5) * shakePower * 2;
      sy = (Math.random() - 0.5) * shakePower * 2;
    }
    // 카메라 펀치: 맞는 쪽으로 살짝 확대했다 돌아옴
    const ct = now - cam.at;
    ctx.save();
    if (ct >= 0 && ct < 260) {
      const k = Math.sin((ct / 260) * Math.PI) * 0.045 * cam.pow;
      ctx.translate(cam.x, cam.y);
      ctx.scale(1 + k, 1 + k);
      ctx.translate(-cam.x, -cam.y);
    }
    ctx.drawImage(backgrounds[mode], 0, 0, W, H);
    if (mode === 'inn') drawInnLife(ctx, now);
    else drawFog(ctx, now);
    drawFinisher(ctx, now);
    ctx.save();
    ctx.translate(sx, sy);
    // 뒤에 있는 적부터
    if (units.enemy) drawUnit(ctx, units.enemy, 'enemy', t, state);
    drawUnit(ctx, units.player, 'player', t, state);
    drawFx(ctx, t);
    drawSparks(ctx, t);
    ctx.restore();
    ctx.restore();
    if (mode !== 'inn') drawEmbers(ctx, now);
  }

  // 필살: 0.5초 동안 배경이 어두워지고, 쓰는 쪽 뒤로 속도선
  const FIN_MS = 520;
  function drawFinisher(g, now) {
    const t = now - fin.at;
    if (t < 0 || t > FIN_MS) return;
    const p = t / FIN_MS;
    const env = p < 0.2 ? p / 0.2 : p > 0.75 ? (1 - p) / 0.25 : 1;
    g.save();
    g.fillStyle = `rgba(4, 4, 8, ${0.72 * env})`;
    g.fillRect(0, 0, W, H);
    const c = CHEST[fin.who];
    const dir = fin.who === 'player' ? 1 : -1;
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = `rgba(255, 220, 160, ${0.85 * env})`;
    g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const y = c.y - 150 + ((i * 53 + Math.floor(now / 30) * 17) % 300);
      const len = 80 + ((i * 37) % 160);
      const x0 = c.x - dir * (60 + ((now / 2 + i * 41) % 420));
      g.lineWidth = 1 + (i % 3);
      g.beginPath();
      g.moveTo(x0, y);
      g.lineTo(x0 - dir * len, y);
      g.stroke();
    }
    g.restore();
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
    let flashA = 1;
    let ghost = 0;

    // 대기: 숨쉬기
    const breath = Math.sin(now / 650 + u.phase);
    let scaleY = 1 + breath * 0.012;
    let scaleX = 1 - breath * 0.005;

    // 공격: 계열마다 다른 동작 (attackPose)
    const at = now - a.attack;
    const pose = attackPose(u, at, now);
    if (pose) {
      x += (other.x - feet.x) * 0.5 * pose.k;
      y += (other.y - feet.y) * 0.5 * pose.k;
      rot += u.dir * pose.rot;
      scaleX *= pose.sx;
      scaleY *= pose.sy;
      alpha *= pose.alpha;
      if (pose.ghost) ghost = pose.ghost;
    }

    // 피격: 세기만큼 뒤로 밀림 + 젖혀짐 + 번쩍임
    const ht = now - a.hit;
    if (ht >= 0 && ht < 480) {
      const p = ht / 480;
      const k = p < 0.15 ? ease.out(p / 0.15) : 1 - ease.inOut((p - 0.15) / 0.85);
      const pow = a.hitPow ?? 26;
      x -= u.dir * pow * k;
      rot -= u.dir * (0.05 + pow * 0.0025) * k;
      scaleX *= 1 - 0.05 * k;
      // 번쩍임은 짧고 옅게 (하얗게 → 붉게 → 사라짐)
      if (ht < 70) { flash = u.flashWhite; flashA = 0.6 * (1 - ht / 70); } else if (ht < 230) { flash = u.flashRed; flashA = 0.55 * (1 - (ht - 70) / 160); }
    }

    // 회피: 뒤로 크게 비켜섰다가 돌아옴
    const dt = now - (a.dodge ?? -1e9);
    if (dt >= 0 && dt < 520) {
      const p = dt / 520;
      const k = p < 0.25 ? ease.out(p / 0.25) : 1 - ease.inOut((p - 0.25) / 0.75);
      x -= u.dir * 58 * k;
      y += 8 * k;
      rot -= u.dir * 0.05 * k;
      if (p < 0.6) ghost = 2;
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

    // 기세: 끌어올리는 순간 금빛 고리 + 기세가 쌓여 있으면 은은한 기운
    const strength = state?.[who]?.status?.strength ?? 0;
    const gt = now - a.buff;
    if (strength > 0 || (gt >= 0 && gt < 600)) {
      drawAura(g, feet.x + x, feet.y + y, u, now, strength, gt);
    }

    // 돌진 잔상 (회피는 반대쪽으로 남김)
    if (ghost) {
      const back = ghost === 2 ? -1 : 1;
      for (let i = 1; i <= 3; i++) {
        g.save();
        g.globalAlpha = 0.12 * (4 - i) * alpha;
        drawBody(g, u, feet.x + x - back * u.dir * i * 16, feet.y + y, rot, scaleX, scaleY, u.image);
        g.restore();
      }
    }

    g.save();
    g.globalAlpha = alpha;
    drawBody(g, u, feet.x + x, feet.y + y, rot, scaleX, scaleY, u.image);
    if (flash) {
      g.globalAlpha = alpha * flashA;
      drawBody(g, u, feet.x + x, feet.y + y, rot, scaleX, scaleY, flash);
    }
    g.restore();

    // 점혈·파기로 굳음: 머리 위를 도는 혈도 표시
    if (!a.death && state?.[who]?.status?.stun > 0) {
      const hy = HEAD_Y[who] - 8;
      g.save();
      g.fillStyle = '#9cd7ff';
      g.shadowColor = '#9cd7ff';
      g.shadowBlur = 8;
      for (let i = 0; i < 3; i++) {
        const t = now / 420 + (i * Math.PI * 2) / 3;
        g.globalAlpha = 0.55 + 0.45 * Math.sin(t);
        g.beginPath();
        g.arc(feet.x + x + Math.cos(t) * 30, hy + Math.sin(t) * 8, 4, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
  }

  // 공격 동작: k = 상대 쪽으로 간 정도(0 제자리, 1 상대 앞), rot·sx·sy·alpha·ghost
  // 연타(hold)면 상대 앞에 머물고, strike 마다 짧게 내지름
  const RETURN_MS = { sword: 270, fist: 240, assassin: 260 };
  function attackPose(u, at, now) {
    const a = u.anim;
    const cls = u.cls === 'fist' || u.cls === 'assassin' ? u.cls : 'sword';
    const stayEnd = a.hold ? Infinity : Math.max(IMPACT_MS + 90, a.release > a.attack ? a.release - a.attack : 0);
    if (at < 0 || at > stayEnd + RETURN_MS[cls]) return null;
    const P = { k: 0, rot: 0, sx: 1, sy: 1, alpha: 1, ghost: 0 };
    if (cls === 'sword') {
      // 몸을 낮춰 당김 → 크게 기울며 베고 지나감 → 돌아옴
      if (at < 110) {
        const q = ease.out(at / 110);
        P.k = -0.12 * q; P.sy = 1 - 0.08 * q; P.sx = 1 + 0.04 * q; P.rot = -0.1 * q;
      } else if (at < IMPACT_MS) {
        const q = ease.in((at - 110) / (IMPACT_MS - 110));
        P.k = -0.12 + 1.2 * q; P.rot = -0.1 + 0.32 * q; P.sx = 1 + 0.12 * q; P.sy = 1 - 0.04 * q; P.ghost = 1;
      } else if (at < stayEnd) {
        const q = ease.out(clamp01((at - IMPACT_MS) / 120));
        P.k = 1.08 - 0.06 * q; P.rot = 0.22 - 0.12 * q; P.sx = 1.12 - 0.12 * q;
      } else {
        const q = ease.inOut((at - stayEnd) / RETURN_MS.sword);
        P.k = 1.02 * (1 - q); P.rot = 0.1 * (1 - q);
      }
    } else if (cls === 'fist') {
      // 파고들며 몸을 압축 → 폭발하듯 내지름(늘어남) → 돌아옴
      if (at < 90) {
        const q = ease.out(at / 90);
        P.k = -0.05 * q; P.sx = 1 + 0.08 * q; P.sy = 1 - 0.1 * q;
      } else if (at < IMPACT_MS) {
        const q = ease.in((at - 90) / (IMPACT_MS - 90));
        P.k = -0.05 + 0.92 * q; P.rot = 0.12 * q; P.sx = 1.08 - 0.08 * q; P.sy = 0.9 + 0.06 * q; P.ghost = 1;
      } else if (at < stayEnd) {
        const q = clamp01((at - IMPACT_MS) / 110);
        const punchK = Math.sin(Math.min(1, q) * Math.PI);
        P.k = 0.87 + 0.08 * punchK; P.rot = 0.12 - 0.06 * q; P.sx = 1 + 0.16 * punchK; P.sy = 1 - 0.08 * punchK;
      } else {
        const q = ease.inOut((at - stayEnd) / RETURN_MS.fist);
        P.k = 0.87 * (1 - q); P.rot = 0.06 * (1 - q);
      }
    } else {
      // 살수: 잔상만 남기고 사라짐 → 상대 바로 앞에 나타나 찌름 → 사라졌다 제자리에 나타남
      if (at < 90) {
        const q = at / 90;
        P.alpha = 1 - q; P.k = -0.04 * q; P.sy = 1 - 0.05 * q; P.ghost = 2;
      } else if (at < IMPACT_MS - 50) {
        P.alpha = 0; P.k = 1.12;
      } else if (at < stayEnd) {
        const q = clamp01((at - (IMPACT_MS - 50)) / 50);
        P.alpha = q; P.k = 1.12; P.rot = 0.16 * (1 - clamp01((at - IMPACT_MS) / 140)); P.sx = 1.06;
      } else {
        const r = at - stayEnd;
        if (r < 100) { P.k = 1.12; P.alpha = 1 - r / 100; } else { P.k = 0; P.alpha = clamp01((r - 100) / (RETURN_MS.assassin - 100)); }
      }
    }
    // 연타: 머문 채 짧게 내지름
    const st = now - (a.strike ?? -1e9);
    if (st >= 0 && st < 170) {
      const j = Math.sin((st / 170) * Math.PI);
      P.k += 0.07 * j;
      P.rot += 0.1 * j * (cls === 'sword' ? (Math.floor(a.strike) % 2 ? 1 : -1) : 1);
      P.sx *= 1 + 0.08 * j;
    }
    return P;
  }

  function drawBody(g, u, x, y, rot, sx, sy, img) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.scale(u.dir * sx, sy);
    g.drawImage(img, -u.footX * u.w, -u.h, u.w, u.h);
    g.restore();
  }

  function drawAura(g, x, y, u, now, strength, gt) {
    const cy = y - u.h * 0.5;
    g.save();
    if (strength > 0) {
      // 기세가 쌓일수록 진해지는 발밑의 금빛 기운
      const k = Math.min(1, strength / 6);
      const pulse = 0.5 + Math.sin(now / 300) * 0.5;
      const grad = g.createRadialGradient(x, y - 6, 4, x, y - 6, 90);
      grad.addColorStop(0, `rgba(255, 190, 90, ${(0.18 + pulse * 0.08) * (0.5 + k)})`);
      grad.addColorStop(1, 'rgba(255, 190, 90, 0)');
      g.fillStyle = grad;
      g.beginPath();
      g.ellipse(x, y - 6, 90, 26, 0, 0, Math.PI * 2);
      g.fill();
    }
    if (gt >= 0 && gt < 600) {
      // 기세를 끌어올리는 순간 몸을 타고 올라가는 금빛 고리
      const p = gt / 600;
      g.strokeStyle = `rgba(255, 210, 120, ${0.85 * (1 - p)})`;
      g.lineWidth = 4 * (1 - p) + 1;
      g.shadowColor = '#ffb84a';
      g.shadowBlur = 16;
      g.beginPath();
      g.ellipse(x, y - u.h * p * 0.9, 60 - p * 20, 16 - p * 4, 0, 0, Math.PI * 2);
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
      if (t < 0) {
        g.restore();
        continue;
      }
      if (f.type === 'slash') drawSlash(g, f, t);
      else if (f.type === 'impact') drawImpact(g, f, t);
      else if (f.type === 'crack') drawCrack(g, f, t);
      else if (f.type === 'stab') drawStab(g, f, t);
      else drawStreaks(g, f, t);
      g.restore();
    }
  }

  // 검기: 초승달 모양 궤적
  function drawSlash(g, f, t) {
    const r = f.small ? 74 : 104;
    // 위에서 아래로 (flip 이면 아래에서 위로) 베는 초승달
    let start = f.dir > 0 ? -2.3 : -0.85;
    let sweep = 2.3 * f.dir;
    if (f.flip) {
      start = f.dir > 0 ? 2.3 : 0.85;
      sweep = -2.3 * f.dir;
    }
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
    const layers = f.thin ? [[5, '#ffffff', 0.8]] : [[f.small ? 12 : 22, f.color, 0.6], [f.small ? 5 : 9, '#ffffff', 0.95]];
    for (const [w, col, al] of layers) {
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
    const p = clamp01(t / (f.small ? 260 : 380));
    if (f.small) {
      g.translate(f.x, f.y);
      g.scale(0.6, 0.6);
      g.translate(-f.x, -f.y);
    }
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

  // 권경: 땅이 갈라지는 금
  function drawCrack(g, f, t) {
    const p = clamp01(t / 450);
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = `rgba(20, 14, 10, ${0.7 * (1 - p)})`;
    g.lineWidth = 3;
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI + (i / 5) * Math.PI * 0.9 - 0.15;
      const len = 30 + ((i * 29) % 40) * Math.min(1, t / 90);
      g.moveTo(f.x, f.y);
      g.lineTo(f.x + Math.cos(a) * len, f.y + Math.sin(a) * len * 0.25 + 2);
    }
    g.stroke();
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = `rgba(200, 180, 150, ${0.35 * (1 - p)})`;
    g.beginPath();
    g.ellipse(f.x, f.y, 40 + p * 70, 10 + p * 12, 0, 0, Math.PI * 2);
    g.fill();
  }

  // 살수: 날카로운 찌르기 섬광 (가로로 길게)
  function drawStab(g, f, t) {
    const p = clamp01(t / 200);
    const len = 150 * ease.out(p);
    g.globalAlpha = 1 - p;
    g.shadowColor = f.color;
    g.shadowBlur = 18;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(f.x - f.dir * len * 0.7, f.y - 2);
    g.lineTo(f.x + f.dir * len * 0.3, f.y);
    g.lineTo(f.x - f.dir * len * 0.7, f.y + 2);
    g.closePath();
    g.fill();
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
    const frozen = isFrozen();
    g.save();
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      const life = s.blood ? 620 : 450;
      const t = (now - s.born) / life;
      if (t >= 1) {
        sparks.splice(i, 1);
        continue;
      }
      if (!frozen) {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += s.blood ? 0.42 : 0.25;
        s.vx *= s.blood ? 0.96 : 1;
      }
      if (s.blood) {
        // 피: 붉은 방울 (빛나지 않게 보통 합성)
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = `rgba(${150 - t * 40}, 10, 16, ${0.95 * (1 - t * t)})`;
        g.beginPath();
        g.ellipse(s.x, s.y, s.size, s.size * 0.8, 0, 0, Math.PI * 2);
        g.fill();
        continue;
      }
      g.globalCompositeOperation = 'lighter';
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
      // 숲에서는 반딧불, 관문에서는 굵은 불티
      const [glow, core] = mode === 'forest' ? ['170, 230, 120', '220, 255, 170']
        : mode === 'gate' || mode === 'hall' || mode === 'altar' ? ['255, 80, 30', '255, 170, 90']
          : mode === 'alley' ? ['255, 90, 150', '255, 190, 210'] : ['255, 120, 40', '255, 195, 120'];
      const big = mode === 'gate' || mode === 'hall' ? 1.4 : 1;
      g.fillStyle = `rgba(${glow}, ${0.16 * flicker})`;
      g.beginPath();
      g.arc(e.x, e.y, e.size * 3 * big, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = `rgba(${core}, ${flicker})`;
      g.beginPath();
      g.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      g.fill();
    }
  }

  function setBackground(name) {
    mode = name;
  }

  return {
    setPlayer, setEnemy, clearEnemy, reset, attack, strike, release, hit, hitstop, punch, finisher, dodge, buff, die, shake, draw, setBackground,
  };
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
    anim: { attack: -1e9, hit: -1e9, buff: -1e9, death: 0 },
  };
}

// ── 배경 (한 번만 그려서 재사용) ─────────────────────────
const THEMES = {
  arena: {
    sky: ['#0f141b', '#1d2530', '#2e2a30', '#1a1517'], haze: '160, 60, 40', hazeA: 0.35,
    ridges: [['#2a3340', '#232b36'], ['#212833', '#1a2029'], ['#181d25', '#13171d']],
    banners: [['#a3262e', '#6e161c'], ['#2f5ea8', '#1d3b6e']],
  },
  forest: {
    sky: ['#0b1412', '#14231f', '#1f2a22', '#121713'], haze: '120, 150, 70', hazeA: 0.22,
    ridges: [['#1d2b26', '#18241f'], ['#16221c', '#111a15'], ['#0f1712', '#0b110d']],
    banners: [['#5b6b2a', '#38421a'], ['#7a5a32', '#4e3a20']],
    trees: true,
  },
  alley: {
    sky: ['#0d0b14', '#1b1424', '#2a1c2a', '#140f16'], haze: '200, 90, 160', hazeA: 0.25,
    ridges: [['#1c1724', '#17121e'], ['#151019', '#100c14'], ['#0f0b12', '#0a080d']],
    banners: [['#6b2a4a', '#41182c'], ['#2c2c36', '#18181f']],
    roofs: true,
  },
  altar: {
    sky: ['#0b0507', '#1f080b', '#33100f', '#120707'], haze: '220, 30, 40', hazeA: 0.45,
    ridges: [['#24100f', '#1c0c0c'], ['#190a0a', '#140808'], ['#110707', '#0c0505']],
    banners: [['#7a0f18', '#4a0a0f'], ['#151215', '#0a080a']],
    pillars: true,
  },
  hall: {
    sky: ['#121a24', '#1e2c3c', '#3a3030', '#171416'], haze: '255, 120, 60', hazeA: 0.4,
    ridges: [['#26313e', '#1f2833'], ['#1c242e', '#161c24'], ['#141a21', '#0f1318']],
    banners: [['#2f5ea8', '#1d3b6e'], ['#e8e2d4', '#a49c8c']],
    wall: true,
  },
  gate: {
    sky: ['#140909', '#2a1110', '#3d1712', '#1a0c0b'], haze: '230, 70, 30', hazeA: 0.55,
    ridges: [['#2a1714', '#22120f'], ['#1f100e', '#190c0a'], ['#150b0a', '#0f0807']],
    banners: [['#1a1a1d', '#0a0a0c'], ['#9c1f26', '#5e1015']],
    wall: true,
  },
};

function renderBackground(theme = 'arena') {
  const t = THEMES[theme];
  const c = makeCanvas(W, H);
  const g = c.getContext('2d');
  g.scale(DPR, DPR);

  // 하늘
  const sky = g.createLinearGradient(0, 0, 0, H);
  [0, 0.45, 0.62, 1].forEach((p, i) => sky.addColorStop(p, t.sky[i]));
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);

  // 지평선의 기운
  const haze = g.createRadialGradient(W * 0.55, 300, 20, W * 0.55, 300, 560);
  haze.addColorStop(0, `rgba(${t.haze}, ${t.hazeA})`);
  haze.addColorStop(1, `rgba(${t.haze}, 0)`);
  g.fillStyle = haze;
  g.fillRect(0, 0, W, H);

  // 먼 산 → 가까운 산 (뒤로 갈수록 흐리게)
  ridge(g, 205, 70, 0.006, 1.1, t.ridges[0]);
  mist(g, 200, 60, 0.16);
  if (t.wall) drawFortress(g);
  ridge(g, 245, 60, 0.009, 3.7, t.ridges[1]);
  mist(g, 240, 50, 0.14);
  if (t.trees) drawPines(g);
  if (t.roofs) drawRoofs(g);
  if (t.pillars) drawPillars(g);
  ridge(g, 282, 34, 0.013, 5.2, t.ridges[2]);

  drawBanner(g, 198, 300, ...t.banners[0]);
  drawBanner(g, 772, 292, ...t.banners[1]);
  drawPlatform(g);

  // 가장자리 어둡게
  const vig = g.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.45, W * 0.68);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);
  return c;
}

// 2구역: 산채 숲의 소나무 실루엣
function drawPines(g) {
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W;
    const base = 250 + rnd() * 40;
    const h = 70 + rnd() * 90;
    const w = h * 0.32;
    g.fillStyle = i % 2 ? '#101a15' : '#0c140f';
    g.beginPath();
    for (let k = 0; k < 4; k++) {
      const y = base - h + (h * k) / 4;
      const ww = (w * (k + 1)) / 4;
      g.moveTo(x, y);
      g.lineTo(x - ww, y + h / 3);
      g.lineTo(x + ww, y + h / 3);
    }
    g.fill();
    g.fillRect(x - 2, base - 4, 4, 10);
  }
}

// 마교 1구역: 총단의 핏빛 기둥과 화로
function drawPillars(g) {
  for (let i = 0; i < 6; i++) {
    const x = 70 + i * 170;
    const top = 120 + (i % 2) * 20;
    g.fillStyle = i % 2 ? '#1a0b0c' : '#140809';
    g.fillRect(x - 14, top, 28, 170);
    g.fillStyle = '#2a0f10';
    g.fillRect(x - 20, top - 8, 40, 10);
    const fire = g.createRadialGradient(x, top - 18, 2, x, top - 18, 34);
    fire.addColorStop(0, 'rgba(255, 70, 40, 0.8)');
    fire.addColorStop(1, 'rgba(255, 70, 40, 0)');
    g.fillStyle = fire;
    g.fillRect(x - 34, top - 52, 68, 68);
  }
}

// 사파 1구역: 뒷골목 지붕들과 홍등
function drawRoofs(g) {
  let seed = 3;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 9; i++) {
    const x = i * 112 - 20 + rnd() * 30;
    const w = 90 + rnd() * 40;
    const base = 262 + rnd() * 18;
    const h = 34 + rnd() * 26;
    g.fillStyle = '#0c0910';
    g.fillRect(x, base - h, w, h + 20);
    g.beginPath();
    g.moveTo(x - 14, base - h);
    g.quadraticCurveTo(x + w / 2, base - h - 26, x + w + 14, base - h);
    g.fill();
    if (rnd() < 0.7) {
      const lx = x + 14 + rnd() * (w - 28);
      const glow = g.createRadialGradient(lx, base - h + 12, 1, lx, base - h + 12, 22);
      glow.addColorStop(0, 'rgba(255, 90, 70, 0.75)');
      glow.addColorStop(1, 'rgba(255, 90, 70, 0)');
      g.fillStyle = glow;
      g.fillRect(lx - 22, base - h - 10, 44, 44);
    }
  }
}

// 3구역: 멀리 불타는 관문 성벽
function drawFortress(g) {
  const y = 232;
  g.fillStyle = '#1b0e0c';
  g.fillRect(250, y - 40, 460, 60);
  for (let x = 250; x < 710; x += 22) g.fillRect(x, y - 52, 12, 14); // 여장
  g.fillRect(430, y - 92, 100, 60); // 문루
  g.beginPath();
  g.moveTo(415, y - 92);
  g.lineTo(480, y - 120);
  g.lineTo(545, y - 92);
  g.fill();
  g.fillStyle = 'rgba(255, 110, 40, 0.55)';
  g.beginPath();
  g.ellipse(480, y + 2, 26, 30, 0, Math.PI, 0); // 불타는 성문
  g.fill();
  const fire = g.createRadialGradient(480, y - 60, 10, 480, y - 60, 260);
  fire.addColorStop(0, 'rgba(255, 120, 40, 0.35)');
  fire.addColorStop(1, 'rgba(255, 120, 40, 0)');
  g.fillStyle = fire;
  g.fillRect(200, y - 260, 560, 320);
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

// ── 청운객잔 (프롤로그) ─────────────────────────
const INN_WINDOWS = [[140, 70, 180, 128], [640, 70, 180, 128]];
const INN_LANTERNS = [[330, 34], [480, 22], [630, 34]];

function renderInnBackground() {
  const c = makeCanvas(W, H);
  const g = c.getContext('2d');
  g.scale(DPR, DPR);

  // 벽
  const wall = g.createLinearGradient(0, 0, 0, 300);
  wall.addColorStop(0, '#140e0b');
  wall.addColorStop(1, '#2c1e16');
  g.fillStyle = wall;
  g.fillRect(0, 0, W, 300);
  // 기둥
  for (const x of [40, 400, 560, 920]) {
    g.fillStyle = '#120c09';
    g.fillRect(x - 10, 0, 20, 300);
    g.fillStyle = 'rgba(255, 200, 140, 0.06)';
    g.fillRect(x + 6, 0, 3, 300);
  }
  // 대들보
  g.fillStyle = '#0f0a08';
  g.fillRect(0, 0, W, 16);

  // 창 (밖은 비 오는 밤)
  for (const [x, y, w, h] of INN_WINDOWS) {
    const night = g.createLinearGradient(0, y, 0, y + h);
    night.addColorStop(0, '#0b1018');
    night.addColorStop(1, '#151d28');
    g.fillStyle = night;
    g.fillRect(x, y, w, h);
    g.strokeStyle = '#3a271b';
    g.lineWidth = 4;
    g.strokeRect(x, y, w, h);
    g.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      g.beginPath();
      g.moveTo(x + (w * i) / 4, y);
      g.lineTo(x + (w * i) / 4, y + h);
      g.stroke();
    }
    for (let i = 1; i < 3; i++) {
      g.beginPath();
      g.moveTo(x, y + (h * i) / 3);
      g.lineTo(x + w, y + (h * i) / 3);
      g.stroke();
    }
  }

  // 바닥 (나무 마루)
  const floor = g.createLinearGradient(0, 280, 0, H);
  floor.addColorStop(0, '#3b2719');
  floor.addColorStop(1, '#1a110b');
  g.fillStyle = floor;
  g.fillRect(0, 280, W, H - 280);
  g.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  g.lineWidth = 1.2;
  for (let k = -20; k < 40; k++) {
    // 쿼터뷰 방향의 마루 널
    const x0 = k * 46;
    g.beginPath();
    g.moveTo(x0, 280);
    g.lineTo(x0 + 520, 540);
    g.stroke();
  }
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.fillRect(0, 276, W, 6); // 벽과 바닥 경계 그림자

  // 탁자와 의자
  innTable(g, 150, 300);
  innTable(g, 820, 296);
  // 탁자 위 그릇
  g.fillStyle = '#d8cbb0';
  g.beginPath();
  g.ellipse(150, 270, 14, 5, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#5a3a24';
  g.beginPath();
  g.ellipse(820, 266, 9, 12, 0, 0, Math.PI * 2);
  g.fill(); // 술병

  // 등불 줄
  for (const [x, y] of INN_LANTERNS) {
    g.strokeStyle = '#0c0806';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, y);
    g.stroke();
  }

  const vig = g.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, W * 0.7);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);
  return c;
}

function innTable(g, x, y) {
  const hw = 62;
  const hh = 22;
  const top = y - 40;
  g.fillStyle = '#1a110b';
  for (const [lx, ly] of [[-hw + 10, 0], [hw - 10, 0], [0, hh - 6], [0, -hh + 6]]) g.fillRect(x + lx - 3, top + ly, 6, 40);
  g.fillStyle = '#5a3c26';
  g.beginPath();
  g.moveTo(x - hw, top);
  g.lineTo(x, top - hh);
  g.lineTo(x + hw, top);
  g.lineTo(x, top + hh);
  g.closePath();
  g.fill();
  g.fillStyle = '#3a2618';
  g.beginPath();
  g.moveTo(x - hw, top);
  g.lineTo(x, top + hh);
  g.lineTo(x, top + hh + 7);
  g.lineTo(x - hw, top + 7);
  g.closePath();
  g.fill();
  g.fillStyle = '#2a1b11';
  g.beginPath();
  g.moveTo(x, top + hh);
  g.lineTo(x + hw, top);
  g.lineTo(x + hw, top + 7);
  g.lineTo(x, top + hh + 7);
  g.closePath();
  g.fill();
}

// 등불 흔들림 + 창밖 빗줄기
function drawInnLife(g, now) {
  for (const [i, [x, y]] of INN_LANTERNS.entries()) {
    const flicker = 0.85 + Math.sin(now / 130 + i * 2) * 0.08 + Math.sin(now / 47 + i) * 0.05;
    const glow = g.createRadialGradient(x, y + 14, 4, x, y + 14, 210);
    glow.addColorStop(0, `rgba(255, 150, 70, ${0.32 * flicker})`);
    glow.addColorStop(1, 'rgba(255, 150, 70, 0)');
    g.fillStyle = glow;
    g.fillRect(x - 210, y - 196, 420, 420);
    g.fillStyle = '#a3262e';
    g.beginPath();
    g.ellipse(x, y + 14, 13, 17, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = `rgba(255, 200, 120, ${0.55 * flicker})`;
    g.beginPath();
    g.ellipse(x, y + 14, 7, 11, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#c99a3e';
    g.fillRect(x - 8, y - 4, 16, 4);
    g.fillRect(x - 8, y + 30, 16, 4);
  }
  g.save();
  g.strokeStyle = 'rgba(150, 170, 200, 0.35)';
  g.lineWidth = 1;
  for (const [x, y, w, h] of INN_WINDOWS) {
    g.save();
    g.beginPath();
    g.rect(x + 2, y + 2, w - 4, h - 4);
    g.clip();
    for (let k = 0; k < 26; k++) {
      const rx = x + ((k * 37 + now / 3) % w);
      const ry = y + ((k * 53 + now / 1.4) % h);
      g.beginPath();
      g.moveTo(rx, ry);
      g.lineTo(rx - 3, ry + 12);
      g.stroke();
    }
    g.restore();
  }
  g.restore();
}
