// 갈림길 지도 생성
// 층(row) 0~5 + 두목 층 6. 층마다 2~4칸, 칸끼리 다음 층으로 갈림길 연결.
// 규칙
//   - 0층: 모두 일반 전투
//   - 5층(두목 바로 앞): 모두 운기조식
//   - 고수: 2층부터
//   - 1~4층에 객잔과 고수가 최소 1칸씩
//   - 모든 칸은 들어오는 길과 나가는 길이 있음 (막힌 칸 없음)
import { createRng } from './rng.js';

export const ROWS = 6; // 두목 층 제외
export const NODE_TYPES = {
  battle: { name: '전투', icon: '武' },
  elite: { name: '고수', icon: '鬼' },
  rest: { name: '운기조식', icon: '息' },
  shop: { name: '객잔', icon: '酒' },
  event: { name: '기연', icon: '緣' },
  boss: { name: '두목', icon: '王' },
};

function pickWeighted(rng, weights) {
  const total = weights.reduce((a, [, w]) => a + w, 0);
  let r = rng() * total;
  for (const [k, w] of weights) {
    r -= w;
    if (r < 0) return k;
  }
  return weights.at(-1)[0];
}

function rowType(rng, row) {
  if (row === 0) return 'battle';
  if (row === ROWS - 1) return 'rest';
  const weights = [['battle', 45], ['event', 22], ['shop', 12]];
  if (row >= 2) weights.push(['elite', 14]);
  if (row >= 2) weights.push(['rest', 7]);
  return pickWeighted(rng, weights);
}

export function generateMap(seed = 1) {
  const rng = createRng(seed ^ 0x5bd1e995);
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const count = r === 0 ? 3 : 2 + Math.floor(rng() * 3); // 0층은 3칸, 나머지 2~4칸
    const row = [];
    for (let c = 0; c < count; c++) {
      row.push({ id: `${r}-${c}`, row: r, col: c, count, type: rowType(rng, r), next: [] });
    }
    rows.push(row);
  }
  rows.push([{ id: `${ROWS}-0`, row: ROWS, col: 0, count: 1, type: 'boss', next: [] }]);

  // 갈림길 연결: 비율이 비슷한 위치끼리 이어서 길이 서로 엇갈리지 않게
  const pos = (node) => (node.count === 1 ? 0.5 : node.col / (node.count - 1));
  for (let r = 0; r < rows.length - 1; r++) {
    const cur = rows[r];
    const nxt = rows[r + 1];
    for (const node of cur) {
      const j = Math.round(pos(node) * (nxt.length - 1));
      node.next.push(nxt[j].id);
      // 가끔 옆 칸으로도 갈림길
      const side = j + (rng() < 0.5 ? -1 : 1);
      if (nxt.length > 1 && rng() < 0.45 && side >= 0 && side < nxt.length) {
        node.next.push(nxt[side].id);
      }
    }
    // 들어오는 길이 없는 칸은 가장 가까운 칸에서 연결
    for (const target of nxt) {
      if (cur.some((n) => n.next.includes(target.id))) continue;
      let best = cur[0];
      for (const n of cur) if (Math.abs(pos(n) - pos(target)) < Math.abs(pos(best) - pos(target))) best = n;
      best.next.push(target.id);
    }
    for (const n of cur) n.next.sort();
  }

  ensureType(rng, rows, 'shop', [1, 2, 3, 4]);
  ensureType(rng, rows, 'elite', [2, 3, 4]);
  return { rows, seed };
}

function ensureType(rng, rows, type, allowedRows) {
  if (rows.some((row) => row.some((n) => n.type === type))) return;
  const candidates = allowedRows.flatMap((r) => rows[r].filter((n) => n.type === 'battle' || n.type === 'event'));
  const pick = candidates[Math.floor(rng() * candidates.length)];
  if (pick) pick.type = type;
}

export function allNodes(map) {
  return map.rows.flat();
}

export function findNode(map, id) {
  return allNodes(map).find((n) => n.id === id) ?? null;
}
