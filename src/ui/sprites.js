// 32x32 SD 무협 도트 캐릭터를 코드로 그림
// 모든 캐릭터는 오른쪽(쿼터뷰 기준 오른쪽 위)을 보도록 그리고, 적은 좌우 반전해서 씀.
// 나중에 사용자가 그린 PNG로 교체할 수 있도록 캔버스(이미지) 형태로 내보냄.

export const SPRITE_SIZE = 32;
const OUTLINE = '#1b1424';

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

// 공통 SD 몸체. opt 로 옷 색, 머리 모양, 무기를 바꿈.
function drawChibi(p, o) {
  const skin = '#f7cfa6';
  const skinShade = '#e3a77f';
  const eye = '#1b1424';

  // 무기(뒤쪽에 있는 창은 몸보다 먼저)
  if (o.weapon === 'spear') {
    p.line(19, 30, 30, 3, '#8a5a32');
    p.line(20, 30, 31, 3, '#6b4426');
    p.rect(29, 1, 2, 3, '#e8eef5');
    p.set(30, 0, '#e8eef5');
    p.rect(28, 4, 3, 1, '#c8323c'); // 창술 붉은 술
    p.set(27, 5, '#c8323c');
  }

  // 다리, 신발
  p.rect(12, 26, 3, 3, o.pants);
  p.rect(18, 26, 3, 3, o.pants);
  p.rect(11, 29, 4, 2, '#231d2b');
  p.rect(18, 29, 5, 2, '#231d2b');

  // 도포 (아래로 갈수록 넓어짐)
  for (let y = 17; y <= 27; y++) {
    const half = 5 + Math.floor((y - 17) / 3);
    p.rect(16 - half, y, half * 2, 1, o.robe);
    p.rect(16 - half, y, 2, 1, o.robeShade); // 뒤쪽 그림자
  }
  // 옷깃(교령) + 허리띠
  p.line(15, 17, 18, 20, o.trim);
  p.line(16, 17, 19, 20, o.trim);
  p.rect(10, 21, 13, 2, o.belt);
  p.rect(18, 23, 2, 3, o.belt); // 허리띠 늘어진 끈
  // 도포 아래 단
  p.rect(8, 27, 16, 1, o.trim);

  // 뒤쪽 팔
  p.rect(9, 18, 2, 4, o.robeShade);
  p.rect(9, 22, 2, 1, skinShade);

  // 머리 (뒷머리 → 얼굴 → 앞머리)
  p.ellipse(15.5, 9.5, 8, 7.5, o.hair);
  p.ellipse(17.5, 11, 6, 5.5, skin);
  // 앞머리
  p.rect(10, 3, 13, 4, o.hair);
  p.rect(12, 7, 2, 1, o.hair);
  p.rect(16, 7, 3, 1, o.hair);
  p.rect(21, 7, 2, 2, o.hair);
  p.rect(10, 7, 3, 7, o.hair); // 옆머리(뒤쪽)
  p.set(13, 4, o.hairHi);
  p.set(14, 4, o.hairHi);
  p.set(15, 3, o.hairHi);

  // 머리 장식
  if (o.hairStyle === 'topknot') {
    p.ellipse(14, 1.5, 2.5, 1.8, o.hair);
    p.rect(12, 3, 5, 1, o.trim); // 상투 끈
  } else if (o.hairStyle === 'headband') {
    p.rect(10, 5, 14, 2, o.trim);
    p.rect(7, 6, 3, 1, o.trim); // 뒤로 날리는 끈
    p.rect(5, 7, 3, 1, o.trim);
  } else if (o.hairStyle === 'buns') {
    p.ellipse(10, 3, 2.5, 2.5, o.hair);
    p.ellipse(21, 2, 2.5, 2.5, o.hair);
    p.set(10, 1, o.trim);
    p.set(21, 0, o.trim);
    p.rect(8, 8, 2, 7, o.hair); // 땋은 머리
  }

  // 눈, 볼
  p.rect(18, 10, 1, 2, eye);
  p.rect(22, 10, 1, 2, eye);
  p.set(18, 10, '#ffffff');
  p.set(22, 10, '#ffffff');
  p.rect(18, 11, 1, 1, eye);
  p.set(17, 13, o.blush);
  p.set(23, 13, o.blush);
  if (o.brow) {
    p.line(17, 8, 19, 9, eye);
    p.line(21, 9, 23, 8, eye);
  }

  // 앞쪽 팔 + 손
  p.rect(20, 18, 3, 4, o.robe);
  p.rect(20, 18, 3, 1, o.trim);
  p.ellipse(22.5, 22.5, 1.5, 1.5, skin);

  // 무기 (앞쪽)
  if (o.weapon === 'sword') {
    p.line(23, 21, 30, 11, '#e8eef5');
    p.line(24, 21, 30, 12, '#9eb0c4');
    p.rect(21, 21, 3, 1, '#c99a3e'); // 코등이
    p.set(22, 24, '#6b4426');
    p.set(21, 25, '#c8323c'); // 검수술
  } else if (o.weapon === 'broadsword') {
    p.line(23, 21, 29, 12, '#d6dde6');
    p.line(24, 21, 30, 12, '#d6dde6');
    p.line(25, 21, 31, 13, '#8c98a8');
    p.rect(21, 21, 4, 1, '#5a5f6b');
    p.set(22, 24, '#4a3a2a');
  } else if (o.weapon === 'spear') {
    p.rect(21, 20, 3, 2, skin); // 창대를 쥔 손
  }
}

const DESIGNS = {
  // 주인공: 정파 검객 (흰 도포, 푸른 장식, 상투)
  swordsman: {
    robe: '#eef2f8', robeShade: '#b7c3d8', trim: '#3d6bb3', belt: '#2a4a82',
    pants: '#3b3652', hair: '#2a2233', hairHi: '#4d405f', blush: '#f19a9a',
    hairStyle: 'topknot', weapon: 'sword',
  },
  // 철검문 후기지수 (회색 도포, 머리띠, 넓은 검)
  ironDisciple: {
    robe: '#8f96a3', robeShade: '#646b78', trim: '#b83a3a', belt: '#3a3f4a',
    pants: '#2e3038', hair: '#3a2a22', hairHi: '#5c463a', blush: '#e88c7a',
    hairStyle: 'headband', weapon: 'broadsword', brow: true,
  },
  // 홍창방 후기지수 (붉은 도포, 쌍상투, 창)
  spearMaiden: {
    robe: '#d9534f', robeShade: '#a8343a', trim: '#f2c14e', belt: '#7a2430',
    pants: '#4a2a34', hair: '#2b1c26', hairHi: '#4a3242', blush: '#f7a0a8',
    hairStyle: 'buns', weapon: 'spear',
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
  drawChibi(painter(grid), DESIGNS[name]);
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
