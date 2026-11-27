// 세력 루트: 어느 세력에 몸을 담느냐에 따라 구역·적·고유 규칙이 달라짐
// - pools: 구역별 적 목록 (enemies.js), finalBoss: 그날 밤 객잔의 적
// - unlock: 회귀 기록의 구역 돌파 수로 열림 (천천히 열리게 — 2026-11-27 사용자 결정)
// - passive: 판 내내 적용되는 세력 고유 규칙 (run.js 가 확인)
// - deck: 시작 덱 (세력마다 완전히 다름), basic: 기본 무공 (동굴 기연에서 덜어 냄)
//   무공은 세력마다 따로 — 공용 무공 없음 (cards.js 의 faction)
// - ready: 내용이 다 만들어진 루트만 고를 수 있음
// - classes: 계열별 { ready, deck, basic } (8-A). 계열은 처음부터 고를 수 있음 (세력만 회귀로 열림)
// 이름·배경·대사는 src/story/script.js 의 ROUTE_TEXT
import { ZONE_POOLS, UNORTHODOX_POOLS, DEMONIC_POOLS, FINAL_BOSS } from './enemies.js';
import { STARTER_DECK, UNORTHODOX_DECK, DEMONIC_DECK, REWORKS } from './cards.js';

export const FACTION_IDS = ['orthodox', 'unorthodox', 'demonic'];

// 계열: 류파 재편 파일(cards.js REWORKS)에 시작 덱이 있는 계열만 열림
function classesOf(f) {
  const out = {};
  for (const [cls, deck] of Object.entries(REWORKS[f].decks)) out[cls] = { ready: true, deck, basic: REWORKS[f].basic[cls] };
  return out;
}

export const ROUTES = {
  orthodox: {
    name: '정파',
    ready: true,
    pools: ZONE_POOLS,
    finalBoss: FINAL_BOSS,
    unlock: null,
    passive: {},
    deck: REWORKS.orthodox.decks.sword,
    basic: REWORKS.orthodox.basic.sword,
    classes: classesOf('orthodox'),
  },
  // 사파 · 암수(暗手): 돈과 비열한 수
  unorthodox: {
    name: '사파',
    ready: true,
    pools: UNORTHODOX_POOLS,
    finalBoss: FINAL_BOSS,
    unlock: { zone: 1, text: '어느 길로든 1구역을 한 번 돌파하면 열린다' },
    passive: { startGold: 40, shopDiscount: 0.2 },
    deck: REWORKS.unorthodox.decks.sword,
    basic: REWORKS.unorthodox.basic.sword,
    classes: classesOf('unorthodox'),
  },
  // 마교 · 혈공(血功): 피를 대가로 한 힘
  demonic: {
    name: '마교',
    ready: true,
    pools: DEMONIC_POOLS,
    finalBoss: FINAL_BOSS,
    unlock: { zone: 2, text: '어느 길로든 2구역을 한 번 돌파하면 열린다' },
    passive: { winHeal: 6, restHealRatio: 0.2 },
    deck: REWORKS.demonic.decks.sword,
    basic: REWORKS.demonic.basic.sword,
    classes: classesOf('demonic'),
  },
};

export const PASSIVE_TEXT = {
  orthodox: '정통 검법 — 특별한 규칙 없음',
  unorthodox: '암수(暗手): 시작 은자 +40, 객잔 값 20% 할인',
  demonic: '혈공(血功): 적을 쓰러뜨릴 때마다 체력 6 회복, 대신 운기조식 회복이 줄어듦 (30% → 20%)',
};

// 진엔딩 조건: 세 세력의 길에서 하나씩 얻는 핵심 단서
export const TRUE_CLUES = { orthodox: 'traitor', unorthodox: 'payer', demonic: 'request' };

export function hasTrueClues(clues) {
  return Object.values(TRUE_CLUES).every((id) => clues.includes(id));
}

export function routeOf(run) {
  return ROUTES[run?.faction] ?? ROUTES.orthodox;
}

// 8-A 계열(검객·권사·살수): 세력마다 시작 덱·기본 무공. 만들어진 계열만 ready
export function classOf(run) {
  const r = routeOf(run);
  return r.classes?.[run?.cls] ?? r.classes?.sword ?? { ready: true, deck: r.deck, basic: r.basic };
}

export function isClassOpen(faction, cls) {
  return !!ROUTES[faction]?.classes?.[cls]?.ready;
}

// 회귀 기록으로 이 세력이 열렸는지
export function isFactionOpen(meta, faction) {
  const r = ROUTES[faction];
  if (!r?.ready) return false;
  if (!r.unlock) return true;
  return (meta.clears?.[`zone${r.unlock.zone}`] ?? 0) >= 1;
}
