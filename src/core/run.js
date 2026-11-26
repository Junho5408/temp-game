// 한 판(런) 진행: 지도 이동, 칸별 처리, 보상, 휴식, 객잔, 기연
// 전투 자체는 battle.js 가 맡고, 여기서는 전투 전후만 다룸.
import { createBattle, PLAYER_MAX_HP } from './battle.js';
import { CARDS, STARTER_DECK, canUpgrade, cardsByRarity } from './cards.js';
import { ENEMIES, POOLS } from './enemies.js';
import { EVENTS, EVENT_IDS } from './events.js';
import { findNode, generateMap } from './map.js';
import {
  BAG_SIZE, CONSUMABLES, TREASURES, consumablesByRarity, treasuresByRarity,
} from './items.js';
import { createRng } from './rng.js';

export const START_GOLD = 60;
export const REST_HEAL_RATIO = 0.3;

// 위층으로 갈수록 적이 강해짐: 체력 배율, 처음부터 붙은 기세
export function scaleForRow(row, tier) {
  if (tier === 'boss') return { hp: 1, strength: 0 };
  return { hp: 1 + 0.05 * row, strength: Math.floor(row / 4) };
}
export const REMOVE_COST_START = 50;
export const REMOVE_COST_STEP = 25;

const REWARD_WEIGHTS = {
  normal: [['common', 60], ['uncommon', 33], ['rare', 7]],
  elite: [['common', 35], ['uncommon', 45], ['rare', 20]],
};
const GOLD_REWARD = { normal: [12, 20], elite: [28, 36] };
const PRICE = { common: [45, 55], uncommon: [70, 85], rare: [135, 155] };
const ITEM_PRICE = { common: [28, 36], uncommon: [45, 55], rare: [70, 80] };
const TREASURE_PRICE = { common: [100, 120], uncommon: [135, 155], rare: [175, 195] };
const ITEM_WEIGHTS = [['common', 65], ['uncommon', 28], ['rare', 7]];
const TREASURE_WEIGHTS = [['common', 45], ['uncommon', 40], ['rare', 15]];
export const ITEM_DROP_CHANCE = { normal: 0.35, elite: 0.6 };
export const SNOW_LOTUS_HEAL = 6;

// extraCards: 회귀하며 기억한 무공 (시작 덱에 추가)
export function createRun({ seed = 1, extraCards = [] } = {}) {
  const run = {
    seed,
    rng: createRng(seed),
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    gold: START_GOLD,
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
  for (const id of STARTER_DECK) addCard(run, id);
  for (const id of extraCards) addCard(run, id);
  return run;
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
    const pool = node.type === 'boss' ? POOLS.boss
      : node.type === 'elite' ? POOLS.elite
        : node.row <= 2 ? POOLS.easy : POOLS.normal;
    const choices = pool.length > 1 ? pool.filter((e) => e !== run.lastEnemy) : pool;
    const enemyId = choices[Math.floor(run.rng() * choices.length)];
    run.lastEnemy = enemyId;
    const tier = ENEMIES[enemyId].tier;
    run.encounter = { enemyId, tier, scale: scaleForRow(node.row, tier) };
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
  const story = EVENT_IDS.find((e) => EVENTS[e].story && !run.seenEvents.includes(e) && row >= (EVENTS[e].minRow ?? 0));
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
      .filter((id) => !run.treasures.includes(id) && !picked.includes(id));
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
  if (run.treasures.includes('snowLotus')) run.hp = Math.min(run.maxHp, run.hp + SNOW_LOTUS_HEAL);
  run.battlesWon += 1;
  const tier = run.encounter.tier;
  const clue = ENEMIES[run.encounter.enemyId].clue;
  if (clue && !run.cluesFound.includes(clue)) run.cluesFound.push(clue);
  run.encounter = null;
  if (tier === 'boss') {
    run.phase = 'victory';
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
    const pool = cardsByRarity(pickWeighted(run.rng, weights));
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
  run.phase = 'map';
  return true;
}

// ── 운기조식 ─────────────────────────
export function restHeal(run) {
  if (run.phase !== 'rest') return 0;
  const before = run.hp;
  run.hp = Math.min(run.maxHp, run.hp + Math.ceil(run.maxHp * REST_HEAL_RATIO));
  run.phase = 'map';
  return run.hp - before;
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
    const pool = cardsByRarity(rarity).filter((id) => !items.some((it) => it.id === id));
    const id = pool[Math.floor(run.rng() * pool.length)];
    items.push({ kind: 'card', id, price: randInt(run.rng, PRICE[rarity]), sold: false });
  }
  for (let i = 0; i < 2; i++) {
    let id = rollItem(run);
    if (items.some((it) => it.id === id)) id = rollItem(run);
    items.push({ kind: 'item', id, price: randInt(run.rng, ITEM_PRICE[CONSUMABLES[id].rarity]), sold: false });
  }
  const [tid] = rollTreasures(run, 1);
  if (tid) items.push({ kind: 'treasure', id: tid, price: randInt(run.rng, TREASURE_PRICE[TREASURES[tid].rarity]), sold: false });
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
export function chooseEventOption(run, index) {
  if (run.phase !== 'event' || run.event.result) return null;
  const option = EVENTS[run.event.id].options[index];
  if (!option || option.disabled?.(run)) return null;
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
