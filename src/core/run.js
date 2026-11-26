// 한 판(런) 진행: 지도 이동, 칸별 처리, 보상, 휴식, 객잔, 기연
// 전투 자체는 battle.js 가 맡고, 여기서는 전투 전후만 다룸.
import { createBattle, PLAYER_MAX_HP } from './battle.js';
import { CARDS, STARTER_DECK, canUpgrade, cardsByRarity } from './cards.js';
import { ENEMIES, POOLS } from './enemies.js';
import { EVENTS, EVENT_IDS } from './events.js';
import { findNode, generateMap } from './map.js';
import { createRng } from './rng.js';

export const START_GOLD = 60;
export const REST_HEAL_RATIO = 0.3;
export const REMOVE_COST_START = 50;
export const REMOVE_COST_STEP = 25;

const REWARD_WEIGHTS = {
  normal: [['common', 60], ['uncommon', 33], ['rare', 7]],
  elite: [['common', 35], ['uncommon', 45], ['rare', 20]],
};
const GOLD_REWARD = { normal: [12, 20], elite: [28, 36] };
const PRICE = { common: [45, 55], uncommon: [70, 85], rare: [135, 155] };

export function createRun({ seed = 1 } = {}) {
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
    battlesWon: 0,
  };
  for (const id of STARTER_DECK) addCard(run, id);
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
        : node.row <= 1 ? POOLS.easy : POOLS.normal;
    const choices = pool.length > 1 ? pool.filter((e) => e !== run.lastEnemy) : pool;
    const enemyId = choices[Math.floor(run.rng() * choices.length)];
    run.lastEnemy = enemyId;
    run.encounter = { enemyId, tier: ENEMIES[enemyId].tier };
    run.phase = 'battle';
  } else if (node.type === 'rest') {
    run.phase = 'rest';
  } else if (node.type === 'shop') {
    run.shop = makeShop(run);
    run.phase = 'shop';
  } else if (node.type === 'event') {
    const fresh = EVENT_IDS.filter((e) => !run.seenEvents.includes(e));
    const pool = fresh.length ? fresh : EVENT_IDS;
    const eventId = pool[Math.floor(run.rng() * pool.length)];
    run.seenEvents.push(eventId);
    run.event = { id: eventId, result: null };
    run.phase = 'event';
  }
  return true;
}

// ── 전투 ─────────────────────────
export function startEncounter(run) {
  return createBattle({
    enemyId: run.encounter.enemyId,
    seed: Math.floor(run.rng() * 2 ** 31),
    deck: run.deck,
    playerHp: run.hp,
    playerMaxHp: run.maxHp,
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
  run.battlesWon += 1;
  const tier = run.encounter.tier;
  run.encounter = null;
  if (tier === 'boss') {
    run.phase = 'victory';
    return;
  }
  const gold = randInt(run.rng, GOLD_REWARD[tier]);
  run.gold += gold;
  run.reward = { gold, cards: rollCards(run, REWARD_WEIGHTS[tier], 3) };
  run.phase = 'reward';
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
function makeShop(run) {
  const items = [];
  const plan = ['common', 'common', 'uncommon', 'uncommon', 'rare'];
  for (const rarity of plan) {
    const pool = cardsByRarity(rarity).filter((id) => !items.some((it) => it.id === id));
    const id = pool[Math.floor(run.rng() * pool.length)];
    items.push({ id, price: randInt(run.rng, PRICE[rarity]), sold: false });
  }
  return { items, removed: false };
}

export function buyCard(run, index) {
  if (run.phase !== 'shop') return false;
  const item = run.shop.items[index];
  if (!item || item.sold || run.gold < item.price) return false;
  run.gold -= item.price;
  item.sold = true;
  addCard(run, item.id);
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
