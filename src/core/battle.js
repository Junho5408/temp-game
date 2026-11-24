// 전투 규칙 (화면과 무관한 순수 로직)
// 화면은 state.events 를 읽어 연출하고 비운다.
import { CARDS, STARTER_DECK } from './cards.js';
import { ENEMIES } from './enemies.js';
import { createRng, shuffle } from './rng.js';

export const HAND_SIZE = 5;
export const MAX_HAND = 10;
export const MAX_ENERGY = 3;
export const PLAYER_MAX_HP = 50;

export function createBattle({
  enemyId,
  seed = 1,
  deck = STARTER_DECK,
  playerHp = PLAYER_MAX_HP,
  playerMaxHp = PLAYER_MAX_HP,
} = {}) {
  const def = ENEMIES[enemyId];
  if (!def) throw new Error(`알 수 없는 적: ${enemyId}`);
  const rng = createRng(seed);
  const cards = deck.map((id, i) => ({ uid: i + 1, id }));

  return {
    rng,
    turn: 0,
    phase: 'start', // start → player → enemy → player ... → won | lost
    player: { hp: playerHp, maxHp: playerMaxHp, block: 0, energy: 0, maxEnergy: MAX_ENERGY },
    enemy: {
      id: def.id,
      name: def.name,
      title: def.title,
      art: def.art,
      hp: def.maxHp,
      maxHp: def.maxHp,
      block: 0,
      patternIndex: 0,
      intent: def.pattern[0],
    },
    drawPile: shuffle(cards, rng),
    hand: [],
    discard: [],
    events: [],
  };
}

function emit(s, event) {
  s.events.push(event);
}

export function drawCards(s, n) {
  for (let i = 0; i < n; i++) {
    if (s.hand.length >= MAX_HAND) break;
    if (s.drawPile.length === 0) {
      if (s.discard.length === 0) break;
      s.drawPile = shuffle(s.discard, s.rng);
      s.discard = [];
      emit(s, { type: 'reshuffle' });
    }
    s.hand.push(s.drawPile.pop());
  }
}

export function startPlayerTurn(s) {
  if (s.phase === 'won' || s.phase === 'lost') return;
  s.turn += 1;
  s.player.block = 0;
  s.player.energy = s.player.maxEnergy;
  drawCards(s, HAND_SIZE);
  s.phase = 'player';
  emit(s, { type: 'turnStart', turn: s.turn });
}

function applyDamage(s, targetKey, amount) {
  const t = s[targetKey];
  const blocked = Math.min(t.block, amount);
  const dealt = amount - blocked;
  t.block -= blocked;
  t.hp = Math.max(0, t.hp - dealt);
  emit(s, { type: 'damage', target: targetKey, amount: dealt, blocked });
}

function gainBlock(s, targetKey, amount) {
  s[targetKey].block += amount;
  emit(s, { type: 'block', target: targetKey, amount });
}

function checkEnd(s) {
  if (s.enemy.hp <= 0) {
    s.phase = 'won';
    emit(s, { type: 'won' });
  } else if (s.player.hp <= 0) {
    s.phase = 'lost';
    emit(s, { type: 'lost' });
  }
}

export function canPlay(s, uid) {
  if (s.phase !== 'player') return false;
  const card = s.hand.find((c) => c.uid === uid);
  return !!card && CARDS[card.id].cost <= s.player.energy;
}

// 카드 사용. 성공하면 true.
export function playCard(s, uid) {
  if (!canPlay(s, uid)) return false;
  const idx = s.hand.findIndex((c) => c.uid === uid);
  const card = s.hand[idx];
  const def = CARDS[card.id];

  s.player.energy -= def.cost;
  s.hand.splice(idx, 1);
  emit(s, { type: 'play', card: card.id });

  if (def.block) gainBlock(s, 'player', def.block);
  if (def.damage) {
    const hits = def.hits ?? 1;
    for (let h = 0; h < hits && s.enemy.hp > 0; h++) applyDamage(s, 'enemy', def.damage);
  }
  if (def.draw) drawCards(s, def.draw);

  s.discard.push(card);
  checkEnd(s);
  return true;
}

// 턴 종료: 손패를 버리고 적 차례로 넘어감
export function endPlayerTurn(s) {
  if (s.phase !== 'player') return false;
  s.discard.push(...s.hand);
  s.hand = [];
  s.phase = 'enemy';
  return true;
}

// 적 행동 실행 후, 전투가 계속되면 다음 플레이어 턴 시작
export function runEnemyTurn(s) {
  if (s.phase !== 'enemy') return false;
  const e = s.enemy;
  const act = e.intent;
  e.block = 0;
  emit(s, { type: 'enemyAct', name: act.name });

  if (act.block) gainBlock(s, 'enemy', act.block);
  if (act.damage) {
    const hits = act.hits ?? 1;
    for (let h = 0; h < hits && s.player.hp > 0; h++) applyDamage(s, 'player', act.damage);
  }

  const pattern = ENEMIES[e.id].pattern;
  e.patternIndex = (e.patternIndex + 1) % pattern.length;
  e.intent = pattern[e.patternIndex];

  checkEnd(s);
  if (s.phase === 'enemy') startPlayerTurn(s);
  return true;
}

export function takeEvents(s) {
  const ev = s.events;
  s.events = [];
  return ev;
}
