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
  };
}

// 저장된 문자열 → 기록. 깨졌거나 버전이 다르면 새 기록
export function parseMeta(text) {
  try {
    const data = JSON.parse(text);
    if (!data || data.version !== META_VERSION) return createMeta();
    const meta = { ...createMeta(), ...data };
    meta.memories = meta.memories.filter((id) => CARDS[id]);
    meta.met = { ...(data.met ?? {}) };
    meta.clears = { ...createMeta().clears, ...(data.clears ?? {}) };
    return meta;
  } catch {
    return createMeta();
  }
}

export function serializeMeta(meta) {
  return JSON.stringify(meta);
}

// 들고 시작할 수 있는 기억 무공 개수: 1개에서 3회차마다 1개씩, 최대 3개
export function memorySlots(meta) {
  return Math.min(MAX_MEMORY_SLOTS, 1 + Math.floor(meta.runs / 3));
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
export function validateLoadout(meta, ids) {
  if (ids.length > memorySlots(meta)) return false;
  return ids.every((id) => meta.memories.includes(id)) && new Set(ids).size === ids.length;
}

// 이야기 인물과 만남: 만난 횟수(이번 포함)를 돌려줌 → 회차마다 다른 대사
export function meetNpc(meta, id) {
  meta.met[id] = (meta.met[id] ?? 0) + 1;
  return meta.met[id];
}
