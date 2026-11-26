// 회귀 기록 (판과 판 사이에 남는 것)
//   - 회차 수, 프롤로그를 봤는지
//   - 기억한 무공: 죽을 때마다 그 판에서 익힌 무공 1개를 영구히 기억
//   - 알아낸 단서
// 저장은 화면 쪽(localStorage)에서 하고, 여기서는 데이터와 규칙만 다룸.
import { CARDS } from './cards.js';

export const META_VERSION = 1;
export const MAX_MEMORY_SLOTS = 3;

export function createMeta() {
  return {
    version: META_VERSION,
    prologueDone: false,
    runs: 0, // 회귀 후 시작한 판 수
    deaths: 0,
    clears: { zone1: 0, zone2: 0, zone3: 0, final: 0 },
    memories: [], // 기억한 무공 id (중복 없음)
    clues: [], // 알아낸 단서 id
    bestFloor: 0,
    met: {}, // 이야기 인물을 만난 횟수 (회차를 넘어 누적) { juno: 2, ... }
    pendingMemory: null, // 쓰러진 뒤 아직 고르지 않은 기억 후보 (새로고침해도 다시 고르게)
  };
}

const count = (v) => (Number.isInteger(v) && v >= 0 ? v : 0);
const strList = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

// 저장된 문자열 → 기록. 깨졌거나 버전이 다르면 새 기록, 값이 이상하면 기본값으로
export function parseMeta(text) {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || data.version !== META_VERSION) return createMeta();
    const base = createMeta();
    const meta = { ...base };
    meta.prologueDone = data.prologueDone === true;
    meta.runs = count(data.runs);
    meta.deaths = count(data.deaths);
    meta.bestFloor = count(data.bestFloor);
    meta.clears = { ...base.clears };
    for (const k of Object.keys(base.clears)) meta.clears[k] = count(data.clears?.[k]);
    meta.memories = [...new Set(strList(data.memories).filter((id) => CARDS[id]))];
    meta.clues = [...new Set(strList(data.clues))];
    meta.met = {};
    for (const [k, v] of Object.entries(data.met && typeof data.met === 'object' ? data.met : {})) {
      if (Number.isInteger(v) && v > 0) meta.met[k] = v;
    }
    setPendingMemory(meta, strList(data.pendingMemory));
    return meta;
  } catch {
    return createMeta();
  }
}

export function serializeMeta(meta) {
  return JSON.stringify(meta);
}

// 들고 시작할 수 있는 기억 무공 개수: 1개에서 3회차마다 1개씩, 최대 3개
// upcoming = 1 이면 "곧 시작할 판" 기준으로 미리 계산 (세력 선택 화면은 판 시작 전이라)
export function memorySlots(meta, upcoming = 0) {
  const runs = Number.isFinite(meta.runs) ? meta.runs : 0;
  return Math.min(MAX_MEMORY_SLOTS, 1 + Math.floor((runs + upcoming) / 3));
}

// 죽은 판에서 기억할 수 있는 무공 후보: 그 판에서 새로 얻은 무공 (시작 덱 카드 제외, 중복 제거)
export function memoryCandidates(run) {
  const ids = [];
  for (const card of run.deck) {
    if (CARDS[card.id].rarity === 'starter') continue;
    if (!ids.includes(card.id)) ids.push(card.id);
  }
  return ids;
}

export function rememberCard(meta, id) {
  if (!CARDS[id] || CARDS[id].rarity === 'starter') return false;
  if (!meta.memories.includes(id)) meta.memories.push(id);
  return true;
}

// 쓰러진 뒤 고를 기억 후보를 남겨 둠 (시작 덱·모르는 카드 제외, 없으면 null)
export function setPendingMemory(meta, ids) {
  const list = [...new Set(ids)].filter((id) => CARDS[id] && CARDS[id].rarity !== 'starter');
  meta.pendingMemory = list.length ? list : null;
}

// 고르기 끝 (id = null 이면 고르지 않음)
export function resolvePendingMemory(meta, id) {
  if (id && meta.pendingMemory?.includes(id)) rememberCard(meta, id);
  meta.pendingMemory = null;
}

export function finishPrologue(meta) {
  meta.prologueDone = true;
}

export function startNewRun(meta) {
  meta.runs += 1;
}

export function recordRunEnd(meta, run) {
  meta.bestFloor = Math.max(meta.bestFloor, runFloor(run));
  if (run.phase === 'defeat') meta.deaths += 1;
  for (let z = 1; z <= Math.min(3, run.zonesCleared ?? 0); z++) meta.clears[`zone${z}`] += 1;
  if (run.phase === 'victory') meta.clears.final += 1;
}

// 지금까지 오른 층 (구역마다 13층: 12층 + 두목)
export function runFloor(run) {
  const inZone = run.position ? Number(run.position.split('-')[0]) + 1 : 0;
  return (run.zone ?? 0) * 13 + inZone;
}

export function addClue(meta, id) {
  if (meta.clues.includes(id)) return false;
  meta.clues.push(id);
  return true;
}

// 고른 기억 무공이 슬롯 수를 넘지 않고, 실제로 기억한 것인지 확인
export function validateLoadout(meta, ids, upcoming = 0) {
  if (ids.length > memorySlots(meta, upcoming)) return false;
  return ids.every((id) => meta.memories.includes(id)) && new Set(ids).size === ids.length;
}

// 이야기 인물과 만남: 만난 횟수(이번 포함)를 돌려줌 → 회차마다 다른 대사
export function meetNpc(meta, id) {
  meta.met[id] = (meta.met[id] ?? 0) + 1;
  return meta.met[id];
}
