// 64x64 무협 도트 캐릭터를 코드로 그림 (세력 3 × 계열 3 = 9종)
// 모든 캐릭터는 오른쪽(쿼터뷰 기준 오른쪽 위)을 보도록 그리고, 적은 좌우 반전해서 씀.
// 빛은 오른쪽 위에서 들어온다고 가정 (왼쪽이 그림자, 오른쪽 가장자리가 밝음).
// 나중에 사용자가 그린 PNG로 교체할 수 있도록 캔버스(이미지) 형태로 내보냄.
import { DESIGNS } from './characters.js';

export const SPRITE_SIZE = 64;
const OUTLINE = '#120d14';
const INK = '#16101a';

// ── 그리기 도구 ─────────────────────────────────────
function createGrid(n) {
  return Array.from({ length: n }, () => Array(n).fill(null));
}

function painter(grid) {
  const n = grid.length;
  const set = (x, y, c) => {
    x = Math.round(x);
    y = Math.round(y);
    if (c && x >= 0 && y >= 0 && x < n && y < n) grid[y][x] = c;
  };
  const p = {
    set,
    rect(x, y, w, h, c) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c);
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
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
      for (let i = 0; i <= steps; i++) set(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, c);
    },
    thick(x0, y0, x1, y1, w, c) {
      for (let k = 0; k < w; k++) p.line(x0 + k, y0, x1 + k, y1, c);
    },
    // 다각형 채우기 (스캔라인)
    poly(pts, c) {
      const ys = pts.map((q) => q[1]);
      for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
        const yc = y + 0.5;
        const xs = [];
        for (let i = 0; i < pts.length; i++) {
          const [ax, ay] = pts[i];
          const [bx, by] = pts[(i + 1) % pts.length];
          if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) * (bx - ax)) / (by - ay));
        }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) {
          for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) set(x, y, c);
        }
      }
    },
  };
  return p;
}

function addOutline(grid) {
  const n = grid.length;
  const src = grid.map((r) => r.slice());
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (src[y][x]) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => src[y + dy]?.[x + dx])) grid[y][x] = OUTLINE;
    }
  }
}

// ── 얼굴 기본형 ─────────────────────────────────────
// 줄 단위 [y, 왼쪽 x, 오른쪽 x] — 턱이 앞으로 튀어나오지 않는 갸름한 3/4 얼굴
const FACE_ROWS = [
  [7, 24, 38], [8, 23, 39], [9, 22, 40], [10, 22, 40], [11, 22, 41], [12, 22, 41], [13, 22, 41],
  [14, 22, 41], [15, 22, 41], [16, 22, 41], [17, 22, 41], [18, 22, 41], [19, 22, 41], [20, 22, 41],
  [21, 23, 41], [22, 23, 40], [23, 24, 40], [24, 25, 39], [25, 26, 38], [26, 28, 37], [27, 30, 35],
];
// 다부진 턱선 (권사)
const STRONG_JAW_ROWS = [[24, 24, 40], [25, 25, 40], [26, 26, 39], [27, 28, 37], [28, 30, 35]];

// 눈 위치 (앞쪽 눈 = 왼쪽/뒤, 먼 쪽 눈 = 오른쪽/앞)
const EYE_NEAR = { x: 26, y: 16, w: 5, near: true };
const EYE_FAR = { x: 35, y: 16, w: 4, near: false };

function drawFace(p, d) {
  const [skin, shade, deep] = d.skin;
  const rows = d.extras.includes('strong_jaw')
    ? FACE_ROWS.filter(([y]) => y < 24).concat(STRONG_JAW_ROWS)
    : FACE_ROWS;
  // 목
  p.rect(29, 27, 6, 3, shade);
  p.rect(29, 27, 6, 1, deep);
  for (const [y, x0, x1] of rows) p.rect(x0, y, x1 - x0 + 1, 1, skin);
  // 음영: 왼쪽 볼, 턱 아래
  for (const [y, x0] of rows) if (y >= 11) p.rect(x0, y, y > 20 ? 2 : 1, 1, shade);
  const last = rows.at(-1);
  p.rect(last[1], last[0], last[2] - last[1] + 1, 1, shade);
  // 귀 (뒤쪽)
  p.ellipse(22, 18.5, 2, 3, skin);
  p.set(22, 18, shade);
  p.set(22, 19, shade);
  p.set(21, 20, deep);
}

function eye(p, e, d, liner) {
  const { x, y, w, near } = e;
  const white = d.eyeWhite ?? '#efe9e2';
  const iris = d.iris ?? '#2a2030';
  const style = d.eyes;
  // 미간 쪽: 앞쪽 눈은 오른쪽, 먼 쪽 눈은 왼쪽
  const innerX = near ? x + w - 1 : x;
  const outerX = near ? x : x + w - 1;
  const out = near ? -1 : 1;

  if (style === 'thin') {
    // 가느다란 눈매: 한 줄짜리 눈
    p.rect(x, y, w, 1, INK);
    p.rect(x, y + 1, w, 1, white);
    p.set(x + w - 2, y + 1, iris);
    p.set(outerX + out, y - 1, INK);
    if (liner) p.rect(x, y + 2, w, 1, liner);
    return;
  }

  const h = style === 'crazed' ? 3 : 2;
  p.rect(x, y, w, h, white);
  // 눈동자: 오른쪽(상대)을 봄
  if (style === 'sanpaek') {
    p.rect(x + w - 2, y, 2, 1, iris); // 위로 치켜뜬 작은 눈동자 → 아래 흰자 (삼백안)
  } else if (style === 'crazed') {
    p.set(x + w - 2, y + 1, iris); // 작은 동공, 흰자가 넓음
  } else if (style === 'wary') {
    p.rect(x + w - 1, y, 1, 2, iris); // 눈꼬리 끝으로 흘겨봄
  } else {
    p.rect(x + w - 3, y, 2, 2, iris);
    p.set(x + w - 2, y, d.irisHi ?? '#6a5a6a');
  }

  // 윗눈꺼풀 (스타일마다 기울기가 다름)
  p.rect(x, y - 1, w, 1, INK);
  if (style === 'sanpaek') {
    p.set(outerX + out, y - 2, INK); // 눈꼬리가 치켜 올라감
    p.set(outerX + out * 2, y - 3, liner ?? INK);
  } else if (style === 'calm') {
    p.set(outerX + out, y, INK);
  } else if (style === 'crazed') {
    p.set(x - 1, y - 1, INK);
    p.set(x + w, y - 1, INK);
  } else if (style === 'heavy' || style === 'messy') {
    p.rect(x, y, w, 1, d.skin[1]); // 반쯤 내리깐 눈꺼풀
    p.rect(x, y - 1, w, 1, INK);
    p.set(innerX, y, INK);
  } else {
    p.set(innerX, y, INK); // stern / wary: 미간 쪽이 내려감
  }
  // 아랫눈꺼풀
  if (style !== 'crazed') p.rect(x, y + h, w, 1, d.skin[1]);
  if (liner) {
    p.rect(x, y + h, w, 1, liner); // 붉은 눈화장
    p.set(outerX + out, y + h - 1, liner);
  }
}

function brows(p, d) {
  const c = d.brow ?? d.hair[0];
  switch (d.eyes) {
    case 'calm':
      p.rect(25, 13, 6, 1, c);
      p.rect(35, 13, 4, 1, c);
      break;
    case 'stern': // 굵은 눈썹
      p.rect(24, 12, 7, 2, c);
      p.set(31, 14, c);
      p.rect(35, 12, 5, 2, c);
      p.set(34, 14, c);
      break;
    case 'sanpaek':
    case 'thin': // 가늘고 치켜 올라간 눈썹
      p.line(25, 12, 31, 14, c);
      p.line(34, 14, 39, 11, c);
      break;
    case 'crazed': // 비대칭으로 치켜뜬 눈썹
      p.line(24, 11, 30, 12, c);
      p.line(35, 12, 40, 9, c);
      p.set(31, 13, c);
      break;
    case 'heavy':
      p.rect(24, 12, 7, 2, c);
      p.rect(35, 12, 5, 2, c);
      break;
    case 'messy':
      p.line(25, 12, 31, 14, c);
      p.line(35, 14, 39, 13, c);
      break;
    default: // wary: 한쪽만 찌푸림
      p.line(25, 12, 31, 14, c);
      p.line(35, 13, 39, 13, c);
  }
}

function nose(p, d) {
  if (d.extras.includes('blunt_nose')) {
    p.rect(36, 18, 2, 3, d.skin[1]);
    p.rect(37, 21, 4, 1, d.skin[2]);
    p.rect(39, 19, 2, 2, d.skin[0]);
    return;
  }
  p.set(37, 19, d.skin[1]);
  p.set(37, 20, d.skin[1]);
  p.rect(37, 21, 2, 1, d.skin[2]);
}

function mouth(p, d) {
  const style = d.mouth;
  if (style === 'none') return;
  if (style === 'grin') {
    // 일그러진 광소
    p.poly([[30, 23], [39, 22], [38, 26], [32, 26]], INK);
    p.rect(32, 23, 6, 1, '#efe9e2');
    p.set(34, 23, INK);
    p.set(36, 23, INK);
    return;
  }
  const lip = style === 'dark' ? '#3a1e2a' : d.skin[2];
  if (style === 'firm') {
    p.rect(32, 24, 5, 1, lip);
  } else if (style === 'sneer') {
    p.rect(32, 24, 3, 1, lip);
    p.set(35, 23, lip);
  } else if (style === 'dark') {
    p.rect(33, 24, 3, 1, lip);
    p.rect(33, 25, 3, 1, '#5a2e3e');
  } else {
    p.rect(33, 24, 3, 1, lip);
  }
}

// ── 얼굴 장식 ───────────────────────────────────────
function faceExtras(p, d) {
  const ex = d.extras;
  if (ex.includes('rough_skin')) {
    for (const [x, y] of [[25, 21], [39, 14], [27, 11], [36, 22], [24, 15]]) p.set(x, y, d.skin[1]);
  }
  if (ex.includes('forehead_mark')) {
    // 마교 교단 문양 (붉은 불꽃)
    p.set(32, 7, '#c22a36');
    p.rect(31, 8, 3, 2, '#c22a36');
    p.set(32, 10, '#c22a36');
  }
  if (ex.includes('veins')) {
    p.line(36, 8, 38, 11, '#8e4a5a');
    p.line(38, 11, 40, 10, '#8e4a5a');
    p.line(40, 19, 40, 23, '#8e4a5a');
  }
  if (ex.includes('tattoo')) {
    // 붉은 문신 (볼)
    p.line(23, 19, 27, 24, '#b0283a');
    p.line(24, 19, 28, 24, '#b0283a');
    p.line(26, 19, 27, 21, '#b0283a');
  }
  if (ex.includes('stubble')) {
    for (const [x, y] of [[30, 25], [33, 26], [36, 25], [38, 23], [32, 27], [35, 27], [39, 21], [29, 24]]) {
      p.set(x, y, d.skin[2]);
    }
  }
  if (ex.includes('scar_cheek')) {
    p.line(38, 16, 41, 22, '#9a4a46');
  }
  if (ex.includes('wrinkles')) {
    p.rect(26, 9, 5, 1, d.skin[1]);
    p.rect(33, 9, 6, 1, d.skin[1]);
    p.rect(28, 7, 8, 1, d.skin[1]);
    p.line(34, 22, 31, 25, d.skin[1]); // 팔자 주름
  }
  if (ex.includes('nose_bandage')) {
    p.rect(35, 18, 6, 2, '#e6dccb');
    p.rect(35, 19, 6, 1, '#b8ab96');
    p.line(36, 17, 39, 20, '#e6dccb');
  }
  if (ex.includes('scar_asym')) {
    // 앞쪽 눈을 가로지르는 비대칭 흉터
    p.line(25, 10, 30, 23, '#8a3e3a');
    p.line(26, 10, 31, 23, '#b86a62');
  }
  if (ex.includes('eyepatch')) {
    // 먼 쪽 눈을 가린 안대
    p.rect(34, 14, 6, 5, '#2a221e');
    p.rect(35, 15, 4, 3, '#3a302a');
    p.line(22, 11, 34, 15, '#2a221e');
  }
}

// ── 머리 모양 / 두건 / 복면 ─────────────────────────
function hairBack(p, d) {
  const [h, hs] = d.hair;
  const st = d.hairStyle;
  if (st === 'longLoose') {
    // 등까지 내려오는 긴 머리
    p.poly([[22, 6], [28, 3], [24, 28], [15, 44], [10, 42], [17, 24]], hs);
    p.poly([[23, 5], [30, 3], [26, 26], [18, 40], [14, 38], [19, 22]], h);
  }
  if (st === 'wild') {
    // 산발: 뒤로 뻗친 머리
    p.poly([[22, 4], [10, 2], [16, 10], [6, 14], [16, 17], [9, 24], [21, 22]], hs);
  }
  if (st === 'raggedBand') {
    p.poly([[20, 9], [8, 15], [10, 19], [20, 14]], d.accent[1]); // 낡은 두건 끈
  }
  if (st === 'hood' || st === 'hoodPattern') {
    p.poly([[20, 20], [12, 30], [16, 34], [24, 28]], d.hood[1]); // 두건 뒷자락
    return;
  }
  if (st === 'raggedBand') return;
  if (st === 'hat' || st === 'cropped') {
    p.ellipse(30.5, 15, 10.5, 11, hs);
    return;
  }
  p.ellipse(30.5, 15, 11.5, 12, h);
  p.ellipse(28, 18, 8, 9, hs);
}

function hairFront(p, d) {
  const [h, hs, hi] = d.hair;
  switch (d.hairStyle) {
    case 'topknotCrown': {
      // 단정하게 빗어 올린 머리 + 상투 + 도관
      p.poly([[21, 14], [21, 7], [26, 3], [37, 3], [42, 7], [42, 12], [39, 9], [31, 8], [24, 10], [23, 14]], h);
      p.rect(21, 12, 2, 7, h); // 구레나룻
      p.line(25, 5, 35, 4, hi);
      p.line(26, 8, 34, 7, hs);
      p.ellipse(31.5, 2.5, 4, 2.5, h); // 상투
      p.rect(28, 0, 8, 3, '#d8dde6'); // 도관 (은빛)
      p.rect(28, 2, 8, 1, '#9aa6b8');
      p.rect(31, 0, 2, 2, d.accent[0]); // 옥 장식
      p.line(22, 3, 27, 2, '#9aa6b8'); // 비녀
      break;
    }
    case 'headband': {
      // 짧게 정리한 머리 + 이마를 드러낸 말액
      p.poly([[21, 13], [21, 6], [27, 2], [37, 2], [42, 6], [42, 9], [22, 9]], h);
      p.rect(21, 9, 2, 8, h);
      p.line(26, 4, 35, 3, hi);
      p.rect(22, 8, 20, 3, d.accent[0]); // 말액
      p.rect(22, 10, 20, 1, d.accent[1]);
      p.rect(30, 8, 3, 3, '#e8eef6'); // 이마 장식 옥
      p.poly([[22, 8], [11, 11], [8, 16], [13, 15], [22, 11]], d.accent[0]); // 뒤로 날리는 끈
      p.line(11, 15, 21, 11, d.accent[1]);
      break;
    }
    case 'longLoose': {
      // 이마를 가르는 긴 앞머리
      p.poly([[21, 15], [21, 6], [27, 2], [37, 3], [42, 8], [42, 15], [39, 9], [35, 7], [33, 11], [31, 7], [26, 10], [23, 17]], h);
      p.rect(20, 10, 3, 17, h);
      p.line(26, 4, 36, 4, hi);
      p.line(41, 9, 42, 17, h);
      break;
    }
    case 'wild': {
      // 덥수룩한 산발
      p.poly([[20, 15], [17, 4], [23, 6], [24, 0], [29, 4], [33, 0], [36, 5], [43, 2], [41, 8], [45, 11], [40, 11], [37, 8], [33, 11], [29, 7], [25, 11], [22, 10]], h);
      p.line(24, 3, 28, 6, hi);
      p.line(34, 3, 36, 6, hi);
      p.rect(20, 10, 2, 9, h);
      break;
    }
    case 'cropped': {
      // 바짝 깎은 머리
      p.poly([[21, 12], [21, 6], [27, 3], [37, 3], [41, 6], [41, 8], [22, 8]], h);
      for (let x = 23; x < 41; x += 3) p.set(x, 6, hs);
      p.rect(21, 8, 2, 6, h);
      break;
    }
    case 'hat': {
      // 정돈되지 않은 잔머리 + 넓은 삿갓
      p.rect(21, 10, 2, 10, h);
      p.line(23, 11, 25, 16, h);
      p.line(40, 11, 41, 16, h);
      p.line(37, 11, 38, 14, h);
      p.line(26, 11, 27, 13, hs);
      const [hat, hatS, hatD] = d.hat;
      p.poly([[5, 12], [31, 0], [59, 12], [53, 14], [11, 14]], hat);
      p.poly([[5, 12], [31, 0], [31, 14], [11, 14]], hatS);
      for (let k = 0; k < 6; k++) p.line(31, 1, 8 + k * 9.5, 13, hatD); // 대나무 결
      p.rect(8, 13, 48, 1, hatD);
      p.line(24, 14, 29, 26, '#6a5236'); // 턱끈
      break;
    }
    case 'hood':
    case 'hoodPattern':
    case 'raggedBand': {
      const [c0, c1, c2] = d.hairStyle === 'raggedBand' ? d.accent : d.hood;
      // 머리 전체를 감싼 두건
      p.poly([[19, 26], [18, 10], [22, 3], [31, 0], [39, 2], [43, 7], [43, 13], [40, 11], [35, 10], [24, 11], [22, 26]], c0);
      p.poly([[19, 26], [18, 10], [22, 4], [24, 11], [22, 26]], c1);
      p.line(25, 3, 37, 2, c2 ?? c0);
      if (d.hairStyle === 'hoodPattern') {
        // 붉은 문양
        p.line(26, 4, 31, 8, '#b0283a');
        p.line(31, 8, 36, 4, '#b0283a');
        p.rect(30, 2, 3, 2, '#b0283a');
        p.line(19, 14, 21, 21, '#b0283a');
      }
      if (d.hairStyle === 'raggedBand') {
        p.line(40, 11, 42, 15, h); // 삐져나온 머리
        p.line(23, 11, 23, 14, h);
        p.set(30, 3, c1);
        p.set(36, 6, c1);
      }
      break;
    }
    default:
      break;
  }
}

function lowerMask(p, d) {
  if (d.extras.includes('mask')) {
    // 하관을 가린 복면 (정파 살수)
    const [m, ms] = d.hood;
    p.poly([[21, 20], [43, 20], [43, 24], [38, 29], [30, 30], [21, 28]], m);
    p.rect(21, 20, 22, 1, ms);
    p.line(37, 21, 40, 27, ms);
    p.rect(21, 21, 3, 7, ms);
  }
  if (d.extras.includes('rag_mask')) {
    // 낡은 천 복면 (해진 아래 단)
    const [m, ms] = d.rag ?? d.accent;
    p.poly([[21, 20], [43, 20], [43, 24], [39, 29], [36, 27], [33, 30], [29, 27], [21, 28]], m);
    p.rect(21, 20, 22, 1, ms);
    p.set(30, 23, ms);
    p.set(37, 25, ms);
    p.set(26, 24, ms);
  }
}

// ── 몸 ───────────────────────────────────────────
function drawLegs(p, d) {
  const [pa, ps] = d.pants;
  if (d.outfit === 'tunic') {
    // 통 넓은 바지 + 각반
    p.poly([[22, 46], [30, 46], [30, 58], [20, 58]], pa);
    p.poly([[34, 46], [42, 46], [44, 58], [34, 58]], pa);
    p.rect(20, 48, 2, 10, ps);
    p.rect(34, 48, 2, 10, ps);
    p.rect(21, 54, 9, 4, d.wrap);
    p.rect(35, 54, 9, 4, d.wrap);
    p.rect(21, 56, 9, 1, d.wrapS);
    p.rect(35, 56, 9, 1, d.wrapS);
  } else {
    p.rect(23, 50, 6, 9, pa);
    p.rect(35, 50, 6, 9, pa);
    p.rect(23, 50, 2, 9, ps);
    p.rect(35, 50, 2, 9, ps);
  }
  // 신발 (넓게 벌린 자세)
  p.poly([[20, 58], [30, 58], [31, 63], [18, 63]], d.boot);
  p.poly([[34, 58], [44, 58], [47, 63], [34, 63]], d.boot);
}

function drawBody(p, d) {
  const [r, rs, rd, rh] = d.robe;
  const bottom = d.outfit === 'robe' ? 57 : 50;
  const flare = d.outfit === 'robe' ? 6 : 3;
  // 몸통 + 자락
  p.poly([[22, 29], [41, 29], [43, 41], [42 + flare, bottom], [21 - flare, bottom], [21, 41]], r);
  // 음영 (왼쪽), 밝은 면 (오른쪽)
  p.poly([[22, 29], [26, 29], [26, 41], [25, bottom], [21 - flare, bottom], [21, 41]], rs);
  p.poly([[22, 29], [23, 29], [22, 41], [22 - flare, bottom], [21 - flare, bottom], [21, 41]], rd);
  p.line(41, 30, 43, 41, rh);
  p.line(43, 42, 42 + flare, bottom - 1, rh);
  // 앞트임과 주름
  p.line(33, 43, 33, bottom, rd);
  p.line(34, 43, 35, bottom, rs);
  p.line(28, 44, 26, bottom, rs);
  p.line(39, 44, 41, bottom, rs);
  // 교령 (겹친 옷깃)
  p.thick(27, 29, 35, 38, 2, d.inner);
  p.line(29, 29, 37, 37, rh);
  p.line(26, 29, 34, 38, rd);
  // 허리띠
  p.rect(21, 39, 23, 3, d.belt[0]);
  p.rect(21, 41, 23, 1, d.belt[1]);
  p.rect(34, 39, 3, 3, d.accent[0]); // 매듭
  p.line(35, 42, 34, 49, d.belt[0]);
  p.line(36, 42, 37, 48, d.belt[1]);
  if (d.cls === 'assassin') {
    // 가슴에 두른 암기 띠
    p.line(23, 31, 41, 38, d.belt[1]);
    p.line(23, 32, 41, 39, d.belt[0]);
    for (let k = 0; k < 4; k++) p.set(26 + k * 4, 32 + Math.round(k * 1.6), '#c9d1d9');
  }
}

function backArm(p, d) {
  const [, rs, rd] = d.robe;
  p.poly([[23, 30], [18, 34], [16, 43], [21, 44], [23, 37]], rs);
  p.line(18, 34, 16, 43, rd);
  if (d.cls === 'fist') {
    p.ellipse(18.5, 45, 3, 2.5, d.skin[1]);
    p.rect(16, 43, 6, 2, d.wrap);
  } else {
    p.ellipse(18.5, 45, 2.2, 2, d.skin[1]);
  }
}

function frontArmAndWeapon(p, d) {
  const [r, rs, , rh] = d.robe;
  const [skin, shade] = d.skin;
  if (d.cls === 'sword') {
    // 소매 + 검끝을 앞으로 낮게 겨눔
    p.poly([[38, 30], [43, 32], [46, 40], [41, 42], [38, 36]], r);
    p.line(43, 32, 46, 40, rh);
    p.line(38, 36, 41, 42, rs);
    p.rect(40, 40, 6, 2, d.inner); // 소매 끝
    p.ellipse(45, 43, 2.5, 2.2, skin);
    p.set(44, 44, shade);
    p.thick(48, 44, 62, 55, 2, '#d4dbe3'); // 검
    p.line(48, 46, 61, 56, '#7c8794');
    p.line(49, 44, 63, 54, '#f2f5f8');
    p.rect(46, 41, 2, 6, d.guard ?? '#b8923e'); // 코등이
    p.line(41, 41, 44, 43, '#3a2a22'); // 손잡이
    p.line(40, 42, 37, 47, d.accent[0]); // 검수술
    p.line(39, 42, 36, 46, d.accent[1]);
  } else if (d.cls === 'fist') {
    // 주먹을 얼굴 앞에 세운 권법 자세 (붕대 감은 팔뚝)
    p.poly([[38, 30], [43, 32], [44, 37], [40, 39], [37, 35]], r);
    p.line(43, 32, 44, 37, rh);
    p.poly([[40, 38], [44, 37], [50, 29], [46, 26], [41, 33]], skin);
    p.line(41, 35, 46, 27, shade);
    for (let k = 0; k < 4; k++) p.line(41 + k * 2, 36 - k * 2.4, 45 + k * 2, 37 - k * 2.4, d.wrap);
    p.ellipse(48.5, 25, 3.8, 3.6, skin); // 주먹
    p.rect(46, 22, 5, 1, shade);
    p.rect(45, 26, 7, 2, d.wrap);
    p.set(51, 23, '#ffffff');
    if (d.extras.includes('tattoo')) p.line(42, 34, 45, 30, '#b0283a');
    if (d.extras.includes('veins')) p.line(44, 33, 47, 29, '#8e4a5a');
  } else {
    // 역수로 쥔 단검 + 손가락 사이 비침
    p.poly([[38, 30], [43, 32], [45, 39], [41, 41], [38, 36]], r);
    p.line(43, 32, 45, 39, rh);
    p.rect(40, 39, 6, 2, d.inner); // 손목 보호대
    p.ellipse(44, 42.5, 2.5, 2.2, skin);
    p.thick(42, 45, 39, 55, 2, '#c9d1d9'); // 아래로 향한 칼날
    p.line(41, 45, 38, 54, '#7c8794');
    p.rect(41, 43, 5, 1, d.accent[0]);
    p.line(47, 40, 52, 36, '#c9d1d9');
    p.line(47, 41, 53, 38, '#9aa6b8');
  }
}

function drawCharacter(p, d) {
  hairBack(p, d);
  backArm(p, d);
  drawLegs(p, d);
  drawBody(p, d);
  drawFace(p, d);
  brows(p, d);
  const liner = d.extras.includes('red_liner') ? '#b0283a' : null;
  if (!d.extras.includes('eyepatch')) eye(p, EYE_FAR, d, liner);
  eye(p, EYE_NEAR, d, liner);
  nose(p, d);
  mouth(p, d);
  faceExtras(p, d);
  hairFront(p, d);
  lowerMask(p, d);
  frontArmAndWeapon(p, d);
}

// ── 내보내기 ────────────────────────────────────────
function gridToCanvas(grid, { flip = false, tint = null } = {}) {
  const n = grid.length;
  const c = document.createElement('canvas');
  c.width = n;
  c.height = n;
  const ctx = c.getContext('2d');
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const col = grid[y][x];
      if (!col) continue;
      ctx.fillStyle = tint ?? col;
      ctx.fillRect(flip ? n - 1 - x : x, y, 1, 1);
    }
  }
  return c;
}

export function buildGrid(name) {
  const d = DESIGNS[name];
  if (!d) throw new Error(`알 수 없는 캐릭터: ${name}`);
  const grid = createGrid(SPRITE_SIZE);
  drawCharacter(painter(grid), d);
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
