// 32x32 SD 무협 도트 캐릭터를 코드로 그림
// 모든 캐릭터는 오른쪽(쿼터뷰 기준 오른쪽 위)을 보도록 그리고, 적은 좌우 반전해서 씀.
// 나중에 사용자가 그린 PNG로 교체할 수 있도록 캔버스(이미지) 형태로 내보냄.
//
// 스타일 v2: 2.5~3등신, 가늘고 날카로운 눈, 홍조 없음, 채도 낮은 먹색 계열, 휘날리는 끈/머리

export const SPRITE_SIZE = 32;
const OUTLINE = '#0e0a10';

function createGrid(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(null));
}

function painter(grid) {
  const h = grid.length;
  const w = grid[0].length;
  const set = (x, y, c) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < w && y < h) grid[y][x] = c;
  };
  return {
    set,
    rect(x, y, rw, rh, c) {
      for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) set(x + i, y + j, c);
    },
    ellipse(cx, cy, rx, ry, c) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          if (dx * dx + dy * dy <= 1) set(x, y, c);
        }
      }
    },
    line(x0, y0, x1, y1, c) {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
      for (let i = 0; i <= n; i++) set(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c);
    },
  };
}

function addOutline(grid) {
  const h = grid.length;
  const w = grid[0].length;
  const src = grid.map((r) => r.slice());
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (src[y][x]) continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => src[y + dy]?.[x + dx]);
      if (n) grid[y][x] = OUTLINE;
    }
  }
}

// 공통 무인 몸체. o 로 옷 색, 머리 모양, 무기를 바꿈.
function drawWarrior(p, o) {
  const skin = '#dcb08c';
  const skinShade = '#a97a5e';
  const ink = '#120c14';

  // ── 몸 뒤쪽 요소 (휘날리는 것들, 창) ──
  if (o.ponytail) {
    p.line(11, 4, 4, 12, o.hair);
    p.line(11, 5, 4, 13, o.hair);
    p.line(10, 6, 3, 15, o.hairShade);
    p.line(4, 13, 2, 17, o.hairShade);
  }
  if (o.tails) {
    // 머리띠/목도리 끈이 뒤로 길게 날림
    p.line(11, o.tailsY, 3, o.tailsY + 3, o.tails);
    p.line(11, o.tailsY + 1, 4, o.tailsY + 5, o.tailsShade);
    p.line(3, o.tailsY + 3, 1, o.tailsY + 6, o.tails);
  }
  if (o.weapon === 'spear') {
    p.line(18, 31, 27, 1, '#4a3424');
    p.line(19, 31, 28, 1, '#6b4c34');
    p.rect(26, 0, 3, 3, '#b8c0c8'); // 창날
    p.set(27, 0, '#e2e6ea');
    p.rect(25, 3, 4, 2, o.accent); // 붉은 술
    p.set(24, 5, o.accent);
    p.set(26, 5, o.accent);
  }

  // ── 다리 (넓게 벌린 자세) ──
  p.rect(10, 25, 3, 5, o.pants);
  p.rect(20, 25, 3, 5, o.pants);
  p.rect(9, 29, 4, 2, o.boot);
  p.rect(20, 29, 5, 2, o.boot);
  p.set(12, 25, o.boot); // 각반
  p.set(20, 25, o.boot);

  // ── 도포: 몸통은 곧게, 아래는 갈라지며 넓어짐 ──
  for (let y = 14; y <= 27; y++) {
    const half = y < 21 ? 5 : 5 + Math.floor((y - 21) / 2);
    const x0 = 16 - half;
    p.rect(x0, y, half * 2, 1, o.robe);
    p.rect(x0, y, 2, 1, o.robeShade);
    p.set(x0 + half * 2 - 1, y, o.robeHi);
  }
  // 앞트임 (다리 사이로 갈라진 자락)
  p.line(16, 22, 16, 27, o.robeShade);
  p.line(17, 23, 17, 27, OUTLINE);
  // 교령(겹친 옷깃) + 안감
  p.line(14, 14, 18, 18, o.inner);
  p.line(15, 14, 18, 17, o.inner);
  p.line(16, 14, 19, 17, o.robeHi);
  // 허리띠 + 매듭
  p.rect(11, 19, 10, 2, o.belt);
  p.set(17, 19, o.buckle);
  p.rect(13, 21, 1, 3, o.belt);
  if (o.shoulder) {
    // 어깨 보호대 (철검문)
    p.rect(19, 14, 4, 2, o.shoulder);
    p.set(22, 15, OUTLINE);
  }

  // ── 뒤쪽 팔 ──
  p.rect(9, 15, 2, 5, o.robeShade);
  p.rect(9, 20, 2, 1, skinShade);

  // ── 머리 (작게, 날렵하게) ──
  p.rect(15, 12, 3, 2, skinShade); // 목
  p.ellipse(15.5, 7.5, 5.5, 5.8, o.hair);
  // 얼굴: 턱이 앞으로 튀어나오지 않게 줄 단위로 직접 그림 (아래로 갈수록 좁아지는 갸름한 턱)
  const FACE = [[4, 14, 19], [5, 13, 20], [6, 13, 20], [7, 13, 20], [8, 13, 20], [9, 13, 20], [10, 13, 20], [11, 14, 19], [12, 15, 18]];
  for (const [y, x0, x1] of FACE) p.rect(x0, y, x1 - x0 + 1, 1, skin);
  p.rect(13, 7, 1, 4, skinShade); // 뒤쪽 볼 그림자
  // 앞머리
  p.rect(11, 2, 10, 3, o.hair);
  p.rect(12, 5, 2, 6, o.hair); // 구레나룻
  p.set(16, 5, o.hair);
  p.set(19, 5, o.hair);
  p.set(20, 5, o.hair);
  p.rect(14, 2, 3, 1, o.hairHi);
  p.set(13, 3, o.hairHi);

  // ── 머리 장식 ──
  if (o.headgear === 'crown') {
    // 상투 + 은빛 관
    p.rect(13, 0, 4, 2, o.hair);
    p.rect(13, 1, 4, 1, '#9aa3ad');
    p.set(15, 0, '#c9d0d6');
  } else if (o.headgear === 'headband') {
    p.rect(11, 4, 10, 1, o.accent);
    p.set(20, 5, o.accent);
  } else if (o.headgear === 'ribbon') {
    p.rect(11, 3, 2, 2, o.accent);
  }

  // ── 얼굴: 매서운 눈 (눈썹이 미간 쪽으로 내려와 눈에 붙음) + 한 점 입 ──
  // 두 눈 모두 오른쪽(상대)을 노려봄: [검은 눈꺼풀][눈동자]
  // 앞쪽 눈 (미간 = 오른쪽): 눈썹 끝이 눈동자에 꽂히는 "ㄱ" 모양
  p.rect(14, 6, 2, 1, ink);
  p.set(16, 7, ink);
  p.set(15, 8, ink);
  p.set(16, 8, o.eyeGlint);
  // 먼 쪽 눈 (미간 = 왼쪽)
  p.rect(19, 6, 2, 1, ink);
  p.set(18, 7, ink);
  p.set(18, 8, ink);
  p.set(19, 8, o.eyeGlint);
  // 입: 짧은 한 줄
  p.set(18, 11, '#7a5040');
  if (o.scar) {
    p.set(14, 9, '#8e3b3b');
    p.set(14, 10, '#8e3b3b');
    p.set(15, 11, '#8e3b3b');
  }

  // ── 앞쪽 팔 + 손 ──
  p.rect(19, 15, 3, 4, o.robe);
  p.rect(19, 15, 3, 1, o.robeHi);
  p.rect(20, 18, 2, 1, o.inner); // 소매 끝
  p.ellipse(21.5, 20, 1.3, 1.3, skin);

  // ── 무기 (앞쪽) ──
  if (o.weapon === 'sword') {
    // 검끝을 앞으로 낮게 겨눈 자세
    p.line(23, 21, 31, 27, '#c9d1d9');
    p.line(23, 22, 30, 27, '#7c8794');
    p.rect(22, 19, 1, 4, o.buckle); // 코등이
    p.set(20, 19, '#3a2a22'); // 손잡이
    p.set(19, 18, o.accent); // 검수술
    p.set(18, 19, o.accent);
  } else if (o.weapon === 'broadsword') {
    // 두꺼운 도를 아래로 늘어뜨림
    p.line(23, 21, 30, 29, '#b3bac2');
    p.line(24, 21, 31, 28, '#b3bac2');
    p.line(23, 22, 29, 29, '#6e7680');
    p.line(25, 21, 31, 27, '#dde2e6');
    p.rect(22, 19, 2, 3, '#4a4d55');
    p.set(20, 19, '#2a2020');
  } else if (o.weapon === 'spear') {
    p.rect(20, 19, 3, 2, skin); // 창대를 쥔 손
  }
}

const DESIGNS = {
  // 주인공: 정파 검객 (빛바랜 백의, 쪽빛 안감과 목도리, 은관)
  swordsman: {
    robe: '#cfcbbf', robeShade: '#8a877e', robeHi: '#e6e3da', inner: '#26304a',
    belt: '#26304a', buckle: '#a88a4a', pants: '#2a2e3a', boot: '#151218',
    hair: '#16121a', hairShade: '#0e0b10', hairHi: '#3a3340', eyeGlint: '#4a5a7a',
    accent: '#7a2a2e', headgear: 'crown', weapon: 'sword',
    tails: '#26304a', tailsShade: '#1a2034', tailsY: 14,
  },
  // 철검문 후기지수 곽진 (먹회색 무복, 어깨 보호대, 검붉은 머리띠, 흉터, 넓은 도)
  ironDisciple: {
    robe: '#585b62', robeShade: '#36383e', robeHi: '#757980', inner: '#6e2626',
    belt: '#1e1f24', buckle: '#7a7f88', pants: '#23242a', boot: '#121114',
    hair: '#1c1614', hairShade: '#120e0c', hairHi: '#3a2e2a', eyeGlint: '#6e2626',
    accent: '#6e2626', headgear: 'headband', weapon: 'broadsword',
    shoulder: '#3a3c44', scar: true,
    tails: '#6e2626', tailsShade: '#4a1a1a', tailsY: 4,
  },
  // 홍창방 후기지수 연화 (검붉은 무복, 긴 말총머리, 창)
  spearMaiden: {
    robe: '#7e2a30', robeShade: '#521a20', robeHi: '#a3434a', inner: '#1c1216',
    belt: '#1c1216', buckle: '#b8923e', pants: '#2a1a1e', boot: '#120d10',
    hair: '#110d12', hairShade: '#08060a', hairHi: '#2e2632', eyeGlint: '#7e2a30',
    accent: '#b3323a', headgear: 'ribbon', weapon: 'spear', ponytail: true,
  },
};

function gridToCanvas(grid, { flip = false, tint = null } = {}) {
  const h = grid.length;
  const w = grid[0].length;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const col = grid[y][x];
      if (!col) continue;
      ctx.fillStyle = tint ?? col;
      ctx.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    }
  }
  return c;
}

export function buildGrid(name) {
  const grid = createGrid(SPRITE_SIZE, SPRITE_SIZE);
  drawWarrior(painter(grid), DESIGNS[name]);
  addOutline(grid);
  return grid;
}

// { normal, flash } 두 장을 돌려줌 (flash = 맞았을 때 하얗게 번쩍)
export function buildSprite(name, { flip = false } = {}) {
  const grid = buildGrid(name);
  return {
    normal: gridToCanvas(grid, { flip }),
    flash: gridToCanvas(grid, { flip, tint: '#ffffff' }),
  };
}
