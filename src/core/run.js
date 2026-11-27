// 한 판(런) 진행: 지도 이동, 칸별 처리, 보상, 휴식, 객잔, 기연
// 전투 자체는 battle.js 가 맡고, 여기서는 전투 전후만 다룸.
import { createBattle, PLAYER_MAX_HP } from './battle.js';
import { CARDS, STARTER_DECK, canUpgrade, cardsByRarity } from './cards.js';
import { ENEMIES, TRUE_BOSS } from './enemies.js';
import { FACTION_IDS, ROUTES, routeOf, hasTrueClues } from './routes.js';
import { EVENTS, EVENT_IDS } from './events.js';
import { findNode, generateMap } from './map.js';
import {
  BAG_SIZE, CONSUMABLES, TREASURES, consumablesByRarity, treasuresByRarity,
} from './items.js';
import { createRng } from './rng.js';

export const START_GOLD = 60;
export const REST_HEAL_RATIO = 0.3;

// 위층으로 갈수록 적이 강해짐: 체력 배율, 처음부터 붙은 기세
// 구역이 올라갈수록(zone) 덱도 커지므로 일반·고수에게 기세와 체력을 더 붙임. 두목은 따로 설계
export function scaleForRow(row, tier, zone = 0) {
  if (tier === 'boss') return { hp: 1, strength: 0 };
  return { hp: 1 + 0.05 * row + [0, 0.1, 0.15][zone], strength: Math.floor(row / 4) + (zone > 0 ? 1 : 0) };
}
export const REMOVE_COST_START = 50;
export const REMOVE_COST_STEP = 25;

const REWARD_WEIGHTS = {
  normal: [['common', 60], ['uncommon', 33], ['rare', 7]],
  elite: [['common', 35], ['uncommon', 45], ['rare', 20]],
  boss: [['uncommon', 30], ['rare', 70]],
};
export const TRUE_BOSS_HEAL = 0.75; // 귀면을 쓰러뜨린 뒤 백리현 전에 잃은 체력의 이만큼 회복
const GOLD_REWARD = { normal: [12, 20], elite: [28, 36], boss: [55, 70] };
export const ZONE_COUNT = 3; // 구역 셋을 지나면 그날 밤의 최종 결전
export const ZONE_HEAL_RATIO = 0.5; // 구역을 넘어갈 때 잃은 체력의 절반 회복
const PRICE = { common: [45, 55], uncommon: [70, 85], rare: [135, 155] };
const ITEM_PRICE = { common: [28, 36], uncommon: [45, 55], rare: [70, 80] };
const TREASURE_PRICE = { common: [100, 120], uncommon: [135, 155], rare: [175, 195] };
const ITEM_WEIGHTS = [['common', 65], ['uncommon', 28], ['rare', 7]];
const TREASURE_WEIGHTS = [['common', 45], ['uncommon', 40], ['rare', 15]];
export const ITEM_DROP_CHANCE = { normal: 0.35, elite: 0.6 };
export const SNOW_LOTUS_HEAL = 6;

// extraCards: 회귀하며 기억한 무공 (시작 덱에 추가), faction: 몸을 담은 세력 (routes.js)
// knownClues: 회귀 기록이 아는 단서 (미래를 아는 자의 선택지 needClue 에 씀)
export function createRun({ seed = 1, extraCards = [], faction = 'orthodox', knownClues = [] } = {}) {
  const route = ROUTES[faction] ?? ROUTES.orthodox;
  const run = {
    seed,
    knownClues: [...knownClues],
    faction: ROUTES[faction] ? faction : 'orthodox',
    rng: null,
    rngCount: 0, // 저장·불러오기 때 난수 위치를 되살리기 위해 센다
    zone: 0, // 0~2 = 1~3구역, 3 = 최종 결전
    zonesCleared: 0,
    pendingAdvance: false, // 두목을 이겨서 다음 구역으로 넘어갈 차례
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    gold: START_GOLD + (route.passive.startGold ?? 0),
    deck: [],
    nextUid: 1,
    map: generateMap(seed),
    position: null, // 현재 칸 id (출발 전 null)
    visited: [],
    phase: 'map', // map | battle | reward | rest | shop | event | victory | defeat
    encounter: null,
    reward: null,
    shop: null,
    event: null,
    removeCost: REMOVE_COST_START,
    lastEnemy: null,
    seenEvents: [],
    bag: [], // 행낭 물품 (일시적, 최대 BAG_SIZE)
    treasures: [], // 보물 (영구적)
    treasureChoice: null, // 고수를 이긴 뒤 고를 보물 후보
    cluesFound: [], // 이번 판에서 알아낸 단서 id (화면 쪽이 회귀 기록에 옮겨 담음)
    battlesWon: 0,
  };
  attachRng(run);
  for (const id of starterDeck(route)) addCard(run, id);
  for (const id of extraCards) addCard(run, id);
  return run;
}

// 세력별 시작 덱: 공통 시작 덱에서 starter.remove 를 빼고 starter.add 를 넣음
export function starterDeck(route) {
  return [...(route.deck ?? STARTER_DECK)];
}

// 이 판에서 나올 수 있는 무공: 공통 무공 + 내 세력의 고유 무공
export function cardPool(run, rarity) {
  return cardsByRarity(rarity).filter((id) => CARDS[id].faction === run.faction);
}

// 세력 고유 규칙으로 바뀐 객잔 값
function shopPrice(run, price) {
  const off = Math.min(0.6, (routeOf(run).passive.shopDiscount ?? 0)
    + run.treasures.reduce((a, t) => a + (TREASURES[t]?.fx?.shopDiscount ?? 0), 0));
  return Math.max(1, Math.round(price * (1 - off)));
}

// 난수: 몇 번 썼는지 세어 두면 저장한 판을 같은 흐름으로 되살릴 수 있음
function attachRng(run) {
  const base = createRng(run.seed);
  for (let i = 0; i < run.rngCount; i++) base();
  run.rng = () => {
    run.rngCount += 1;
    return base();
  };
}

// ── 판 중간 저장 ─────────────────────────
export const RUN_SAVE_VERSION = 1;

export function serializeRun(run) {
  const { rng, ...data } = run;
  return JSON.stringify({ v: RUN_SAVE_VERSION, ...data });
}

const PHASES = ['map', 'battle', 'reward', 'treasure', 'rest', 'shop', 'event', 'zoneClear'];
const finiteNum = (v, min = 0) => typeof v === 'number' && Number.isFinite(v) && v >= min;

// 깨졌거나 버전이 다르면 null. 모르는 행낭 물품·보물은 버리고(업데이트 대비), 빠진 목록은 빈 목록으로
export function parseRun(text) {
  try {
    const data = JSON.parse(text);
    if (!data || data.v !== RUN_SAVE_VERSION || !Array.isArray(data.deck) || data.deck.length === 0) return null;
    if (!data.deck.every((c) => c && CARDS[c.id])) return null;
    if (!Array.isArray(data.map?.rows) || data.map.rows.length === 0) return null;
    if (!Number.isInteger(data.zone) || data.zone < 0 || data.zone > ZONE_COUNT) return null;
    if (!finiteNum(data.hp) || !finiteNum(data.maxHp, 1) || !finiteNum(data.gold) || !finiteNum(data.seed, -Infinity)) return null;
    if (!PHASES.includes(data.phase)) return null;
    const { v, ...run } = data;
    if (!FACTION_IDS.includes(run.faction)) run.faction = 'orthodox'; // 세력이 없던 옛 저장
    for (const key of ['bag', 'treasures', 'cluesFound', 'visited', 'seenEvents', 'knownClues']) {
      if (!Array.isArray(run[key])) run[key] = [];
    }
    run.bag = run.bag.filter((id) => CONSUMABLES[id]).slice(0, BAG_SIZE);
    run.treasures = run.treasures.filter((id) => TREASURES[id]);
    if (!Number.isInteger(run.rngCount) || run.rngCount < 0) run.rngCount = 0;
    // 값의 범위·연결도 확인 (BUG-029): 살아 있는 판은 체력 1 이상, 최대 체력 넘으면 깎음, 위치는 지도 안
    if (run.hp < 1) return null;
    run.hp = Math.min(run.hp, run.maxHp);
    if (run.position != null && !run.map.rows.flat().some((n) => n?.id === run.position)) return null;
    run.trueEnding = run.trueEnding === true;
    run.trueWin = run.trueWin === true;
    // 단계별로 꼭 필요한 데이터
    const need = {
      battle: () => ENEMIES[run.encounter?.enemyId]
        && finiteNum(run.encounter.scale?.hp) && finiteNum(run.encounter.scale?.strength, -Infinity),
      event: () => EVENTS[run.event?.id],
      reward: () => Array.isArray(run.reward?.cards) && run.reward.cards.every((id) => CARDS[id]),
      treasure: () => Array.isArray(run.treasureChoice) && run.treasureChoice.every((id) => TREASURES[id]),
      shop: () => Array.isArray(run.shop?.items) && run.shop.items.every((it) => it
        && ({ card: CARDS, item: CONSUMABLES, treasure: TREASURES }[it.kind] ?? {})[it.id] && finiteNum(it.price)),
    }[run.phase];
    if (need && !need()) return null;
    attachRng(run);
    return run;
  } catch {
    return null;
  }
}

// 이야기 기연의 인물과 만남: 판(introDone·metCount)과 회귀 기록(met)을 함께 갱신. 같은 만남은 한 번만 셈
export function meetEventNpc(run, meta) {
  const ev = run.event && EVENTS[run.event.id];
  if (!ev?.npc) return null;
  if (!run.event.introDone) {
    run.event.introDone = true;
    meta.met[ev.npc] = (meta.met[ev.npc] ?? 0) + 1;
    if (ev.intro === 'soohaCamp') meta.met.soohaNamed = (meta.met.soohaNamed ?? 0) + 1; // 이름을 알게 됨
    run.event.metCount = meta.met[ev.npc];
  }
  return run.event.metCount;
}

export function zonePools(run) {
  const pools = routeOf(run).pools;
  return pools[Math.min(run.zone, pools.length - 1)];
}

function randInt(rng, [lo, hi]) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

function pickWeighted(rng, weights) {
  const total = weights.reduce((a, [, w]) => a + w, 0);
  let r = rng() * total;
  for (const [k, w] of weights) {
    r -= w;
    if (r < 0) return k;
  }
  return weights.at(-1)[0];
}

export function addCard(run, id, upgraded = false) {
  const card = { uid: run.nextUid++, id, upgraded };
  run.deck.push(card);
  return card;
}

export function currentNode(run) {
  return run.position ? findNode(run.map, run.position) : null;
}

// 지금 갈 수 있는 칸들
export function availableNodes(run) {
  if (run.phase !== 'map') return [];
  const node = currentNode(run);
  if (!node) return run.map.rows[0];
  return node.next.map((id) => findNode(run.map, id));
}

export function enterNode(run, id) {
  if (!availableNodes(run).some((n) => n.id === id)) return false;
  const node = findNode(run.map, id);
  run.position = id;
  run.visited.push(id);

  if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
    const pools = zonePools(run);
    const pool = node.type === 'boss' ? pools.boss
      : node.type === 'elite' ? pools.elite
        : node.row <= 2 ? pools.easy : pools.normal;
    const choices = pool.length > 1 ? pool.filter((e) => e !== run.lastEnemy) : pool;
    const enemyId = choices[Math.floor(run.rng() * choices.length)];
    run.lastEnemy = enemyId;
    const tier = ENEMIES[enemyId].tier;
    run.encounter = { enemyId, tier, scale: scaleForRow(node.row, tier, run.zone) };
    run.phase = 'battle';
  } else if (node.type === 'rest') {
    run.phase = 'rest';
  } else if (node.type === 'shop') {
    run.shop = makeShop(run);
    run.phase = 'shop';
  } else if (node.type === 'event') {
    const eventId = pickEvent(run, node.row);
    run.seenEvents.push(eventId);
    run.event = { id: eventId, result: null };
    run.phase = 'event';
  }
  return true;
}

// 이야기 기연(주노, 흰 옷의 사내)은 조건이 맞으면 그 판에서 먼저 한 번씩 나오고, 나머지는 무작위
function pickEvent(run, row) {
  const story = EVENT_IDS.find((e) => EVENTS[e].story && (EVENTS[e].zone ?? 0) === run.zone
    && (EVENTS[e].route ?? 'orthodox') === run.faction
    && !run.seenEvents.includes(e) && row >= (EVENTS[e].minRow ?? 0));
  if (story) return story;
  const normal = EVENT_IDS.filter((e) => !EVENTS[e].story);
  const fresh = normal.filter((e) => !run.seenEvents.includes(e));
  const pool = fresh.length ? fresh : normal;
  return pool[Math.floor(run.rng() * pool.length)];
}

// ── 아이템 ─────────────────────────
// 행낭에 넣기. 가득 차면 false
export function addItem(run, id) {
  if (!CONSUMABLES[id] || run.bag.length >= BAG_SIZE) return false;
  run.bag.push(id);
  return true;
}

export function discardItem(run, index) {
  if (index < 0 || index >= run.bag.length) return false;
  run.bag.splice(index, 1);
  return true;
}

// 보물 얻기 (같은 보물은 하나만). 소환단은 얻는 즉시 몸에 적용
export function addTreasure(run, id) {
  if (!TREASURES[id] || run.treasures.includes(id)) return false;
  run.treasures.push(id);
  if (id === 'soHwan') {
    run.maxHp += 10;
    run.hp = Math.min(run.maxHp, run.hp + 10);
  }
  const fx = TREASURES[id].fx ?? {};
  if (fx.maxHp) {
    run.maxHp += fx.maxHp;
    run.hp = Math.min(run.maxHp, run.hp + Math.max(0, fx.maxHp));
  }
  if (fx.gold) run.gold += fx.gold;
  return true;
}

function rollItem(run) {
  const pool = consumablesByRarity(pickWeighted(run.rng, ITEM_WEIGHTS));
  return pool[Math.floor(run.rng() * pool.length)];
}

// 아직 없는 보물 n개 (두목 전용 제외)
function rollTreasures(run, n) {
  const picked = [];
  let guard = 0;
  while (picked.length < n && guard++ < 100) {
    const pool = treasuresByRarity(pickWeighted(run.rng, TREASURE_WEIGHTS))
      .filter((id) => !run.treasures.includes(id) && !picked.includes(id))
      .filter((id) => !TREASURES[id].faction || TREASURES[id].faction === run.faction);
    if (pool.length) picked.push(pool[Math.floor(run.rng() * pool.length)]);
  }
  return picked;
}

// ── 전투 ─────────────────────────
export function startEncounter(run) {
  return createBattle({
    enemyId: run.encounter.enemyId,
    seed: Math.floor(run.rng() * 2 ** 31),
    deck: run.deck,
    playerHp: run.hp,
    playerMaxHp: run.maxHp,
    scale: run.encounter.scale,
    bag: run.bag,
    treasures: run.treasures,
    gold: run.gold,
    faction: run.faction,
  });
}

export function finishBattle(run, battle) {
  if (battle.phase === 'lost') {
    run.hp = 0;
    run.phase = 'defeat';
    return;
  }
  if (battle.phase !== 'won') throw new Error('전투가 끝나지 않음');
  run.hp = battle.player.hp;
  run.bag = [...battle.bag]; // 쓴 물품은 사라짐
  run.gold = Math.max(0, run.gold + (battle.goldGained ?? 0)); // 협박(+)·매수(-) 등
  if (run.treasures.includes('gangSeal')) run.gold += 8;
  if (run.treasures.includes('snowLotus')) run.hp = Math.min(run.maxHp, run.hp + SNOW_LOTUS_HEAL);
  const tfxRun = (k) => run.treasures.reduce((a, t) => a + (TREASURES[t]?.fx?.[k] ?? 0), 0);
  if (tfxRun('winHeal')) run.hp = Math.min(run.maxHp, run.hp + tfxRun('winHeal'));
  run.gold += tfxRun('winGold');
  const winHeal = routeOf(run).passive.winHeal ?? 0; // 마교 혈공
  if (winHeal) run.hp = Math.min(run.maxHp, run.hp + winHeal);
  run.battlesWon += 1;
  const tier = run.encounter.tier;
  const final = !!run.encounter.final;
  const beaten = run.encounter.enemyId;
  const clue = ENEMIES[run.encounter.enemyId].clue;
  if (clue && !run.cluesFound.includes(clue)) run.cluesFound.push(clue);
  run.encounter = null;
  if (final) {
    // 진엔딩 조건을 갖춘 판: 귀면 뒤에 백리현이 나타남 (잃은 체력의 TRUE_BOSS_HEAL 회복)
    if (run.trueEnding && beaten !== TRUE_BOSS) {
      run.hp = Math.min(run.maxHp, run.hp + Math.ceil((run.maxHp - run.hp) * TRUE_BOSS_HEAL));
      // bridge: 백리현 등장 장면을 아직 안 봄 (새로고침해도 다시 보여 줌 — BUG-030)
      run.encounter = { enemyId: TRUE_BOSS, tier: 'boss', final: true, scale: { hp: 1, strength: 0 }, bridge: true };
      run.phase = 'battle';
      return;
    }
    run.trueWin = beaten === TRUE_BOSS;
    run.phase = 'victory';
    return;
  }
  if (tier === 'boss') {
    // 구역 돌파: 보물(대환단 포함) → 무공 → 다음 구역
    run.zonesCleared = Math.max(run.zonesCleared, run.zone + 1);
    const gold = randInt(run.rng, GOLD_REWARD.boss);
    run.gold += gold;
    run.reward = { gold, cards: rollCards(run, REWARD_WEIGHTS.boss, 3), item: null, itemKept: false };
    // 두목 보물(대환단 + 세력 두목 보물) 중 아직 없는 것 하나를 후보 맨 앞에
    const bossPool = treasuresByRarity('boss')
      .filter((id) => !run.treasures.includes(id) && (!TREASURES[id].faction || TREASURES[id].faction === run.faction));
    const choice = bossPool.length ? [bossPool[Math.floor(run.rng() * bossPool.length)]] : [];
    run.treasureChoice = [...choice, ...rollTreasures(run, 3 - choice.length)];
    run.pendingAdvance = true;
    run.phase = 'treasure';
    return;
  }
  const gold = randInt(run.rng, GOLD_REWARD[tier]);
  run.gold += gold;
  // 행낭 물품은 확률로 떨어지고, 자리가 있으면 바로 챙김
  let item = null;
  let itemKept = false;
  if (run.rng() < ITEM_DROP_CHANCE[tier]) {
    item = rollItem(run);
    itemKept = addItem(run, item);
  }
  run.reward = { gold, cards: rollCards(run, REWARD_WEIGHTS[tier], 3), item, itemKept };
  // 고수를 이기면 보물 셋 중 하나를 먼저 고름
  if (tier === 'elite') {
    run.treasureChoice = rollTreasures(run, 3);
    if (run.treasureChoice.length) {
      run.phase = 'treasure';
      return;
    }
  }
  run.phase = 'reward';
}

// 고수 보상: 보물 고르기 (index = null 이면 건너뜀) → 무공 보상으로
export function chooseTreasure(run, index) {
  if (run.phase !== 'treasure') return false;
  if (index !== null && index !== undefined) {
    const id = run.treasureChoice[index];
    if (!id) return false;
    addTreasure(run, id);
  }
  run.treasureChoice = null;
  run.phase = 'reward';
  return true;
}

function rollCards(run, weights, n) {
  const picked = [];
  let guard = 0;
  while (picked.length < n && guard++ < 100) {
    const pool = cardPool(run, pickWeighted(run.rng, weights));
    const id = pool[Math.floor(run.rng() * pool.length)];
    if (!picked.includes(id)) picked.push(id);
  }
  return picked;
}

// index = 고른 카드 번호, null = 건너뛰기
export function chooseReward(run, index) {
  if (run.phase !== 'reward') return false;
  if (index !== null && index !== undefined) {
    const id = run.reward.cards[index];
    if (!id) return false;
    addCard(run, id);
  }
  run.reward = null;
  run.phase = run.pendingAdvance ? 'zoneClear' : 'map';
  return true;
}

// 다음 구역으로 (마지막 구역 뒤에는 그날 밤의 최종 결전)
// meta 를 주면: 세 길의 핵심 단서를 모두 모은 회귀라면 진엔딩 판이 됨
export function advanceZone(run, meta = null) {
  if (run.phase !== 'zoneClear') return false;
  run.pendingAdvance = false;
  run.hp = Math.min(run.maxHp, run.hp + Math.ceil((run.maxHp - run.hp) * ZONE_HEAL_RATIO));
  run.zone += 1;
  run.position = null;
  run.visited = [];
  run.lastEnemy = null;
  if (run.zone >= ZONE_COUNT) {
    run.encounter = { enemyId: routeOf(run).finalBoss, tier: 'boss', final: true, scale: { hp: 1, strength: 0 } };
    run.trueEnding = !!meta && hasTrueClues(meta.clues ?? []);
    run.phase = 'battle';
    return true;
  }
  run.map = generateMap(run.seed + run.zone * 7919);
  run.phase = 'map';
  return true;
}

// 행낭이 가득해서 못 챙긴 보상 물품을 행낭 한 칸과 바꿈 — BUG-013
export function swapRewardItem(run, bagIndex) {
  const r = run.reward;
  if (run.phase !== 'reward' || !r?.item || r.itemKept) return false;
  if (bagIndex < 0 || bagIndex >= run.bag.length) return false;
  if (run.bag[bagIndex] === r.item) return false; // 같은 물품끼리는 바꿀 의미가 없음 — BUG-025
  run.bag[bagIndex] = r.item;
  r.itemKept = true;
  return true;
}

// ── 운기조식 ─────────────────────────
export function restHealAmount(run) {
  const bonus = run.treasures.reduce((a, t) => a + (TREASURES[t]?.fx?.restBonus ?? 0), 0);
  return Math.ceil(run.maxHp * (routeOf(run).passive.restHealRatio ?? REST_HEAL_RATIO)) + bonus;
}

export function canRestHeal(run) {
  return run.hp < run.maxHp;
}

// 체력이 가득하면 아무것도 바꾸지 않고 false (휴식 대신 leaveRest) — BUG-025
export function restHeal(run) {
  if (run.phase !== 'rest' || !canRestHeal(run)) return false;
  const before = run.hp;
  run.hp = Math.min(run.maxHp, run.hp + restHealAmount(run));
  run.phase = 'map';
  return run.hp - before;
}

// 휴식도 연마도 하지 않고 지나감
export function leaveRest(run) {
  if (run.phase !== 'rest') return false;
  run.phase = 'map';
  return true;
}

export function restUpgrade(run, uid) {
  if (run.phase !== 'rest') return false;
  const card = run.deck.find((c) => c.uid === uid);
  if (!card || !canUpgrade(card)) return false;
  card.upgraded = true;
  run.phase = 'map';
  return true;
}

// ── 객잔 ─────────────────────────
// 객잔 진열: 무공 5 + 행낭 물품 2 + 보물 1
function makeShop(run) {
  const items = [];
  const plan = ['common', 'common', 'uncommon', 'uncommon', 'rare'];
  for (const rarity of plan) {
    const pool = cardPool(run, rarity).filter((id) => !items.some((it) => it.id === id));
    const id = pool[Math.floor(run.rng() * pool.length)];
    items.push({ kind: 'card', id, price: shopPrice(run, randInt(run.rng, PRICE[rarity])), sold: false });
  }
  for (let i = 0; i < 2; i++) {
    let id = rollItem(run);
    if (items.some((it) => it.id === id)) id = rollItem(run);
    items.push({ kind: 'item', id, price: shopPrice(run, randInt(run.rng, ITEM_PRICE[CONSUMABLES[id].rarity])), sold: false });
  }
  const [tid] = rollTreasures(run, 1);
  if (tid) items.push({ kind: 'treasure', id: tid, price: shopPrice(run, randInt(run.rng, TREASURE_PRICE[TREASURES[tid].rarity])), sold: false });
  return { items, removed: false };
}

export function canBuy(run, index) {
  const item = run.shop?.items[index];
  if (!item || item.sold || run.gold < item.price) return false;
  if (item.kind === 'item' && run.bag.length >= BAG_SIZE) return false;
  if (item.kind === 'treasure' && run.treasures.includes(item.id)) return false;
  return true;
}

// 객잔에서 사기 (무공·행낭 물품·보물 공용)
export function buyCard(run, index) {
  if (run.phase !== 'shop' || !canBuy(run, index)) return false;
  const item = run.shop.items[index];
  run.gold -= item.price;
  item.sold = true;
  if (item.kind === 'item') addItem(run, item.id);
  else if (item.kind === 'treasure') addTreasure(run, item.id);
  else addCard(run, item.id);
  return true;
}

// 카드 제거는 객잔 한 번에 한 장, 쓸수록 비싸짐
export function removeCard(run, uid) {
  if (run.phase !== 'shop' || run.shop.removed || run.gold < run.removeCost) return false;
  const idx = run.deck.findIndex((c) => c.uid === uid);
  if (idx < 0 || run.deck.length <= 5) return false;
  run.gold -= run.removeCost;
  run.deck.splice(idx, 1);
  run.removeCost += REMOVE_COST_STEP;
  run.shop.removed = true;
  return true;
}

export function leaveShop(run) {
  if (run.phase !== 'shop') return false;
  run.shop = null;
  run.phase = 'map';
  return true;
}

// ── 기연 ─────────────────────────
// 미래를 아는 자의 선택지: needClue 단서를 회귀 기록이 알고 있어야 보임
export function optionKnown(run, option) {
  return !option.needClue || (run.knownClues ?? []).includes(option.needClue);
}

export function chooseEventOption(run, index) {
  if (run.phase !== 'event' || run.event.result) return null;
  const option = EVENTS[run.event.id].options[index];
  if (!option || option.disabled?.(run) || !optionKnown(run, option)) return null;
  const api = {
    addCard: (id) => addCard(run, id),
    removeFirst: (id) => {
      const i = run.deck.findIndex((c) => c.id === id);
      if (i < 0 || run.deck.length <= 5) return false;
      run.deck.splice(i, 1);
      return true;
    },
    addClue: (id) => {
      if (!run.cluesFound.includes(id)) run.cluesFound.push(id);
    },
    addItem: (id) => addItem(run, id),
    addTreasure: (id) => addTreasure(run, id),
    randomItem: () => rollItem(run),
  };
  run.event.result = option.effect(run, run.rng, api);
  return run.event.result;
}

export function leaveEvent(run) {
  if (run.phase !== 'event' || !run.event.result) return false;
  run.event = null;
  run.phase = 'map';
  return true;
}

export function cardName(id) {
  return CARDS[id].name;
}
