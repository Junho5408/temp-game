// 전투 규칙 (화면과 무관한 순수 로직)
// 화면은 state.events 를 읽어 연출하고 비운다.
//
// 방어(호신강기) 개념은 없음: 체력은 깎이기만 하고 지도의 운기조식에서 회복.
//
// 상태 효과
//   기세(strength)        공격 피해 +n (전투 내내 유지)
//   내상(vulnerable)      받는 피해 1.5배, 남은 턴 수
//   기혈 흐트러짐(weak)    주는 피해 0.75배, 남은 턴 수
//   내상/기혈 흐트러짐은 그 캐릭터의 차례가 끝날 때 1씩 줄어듦
import { STARTER_DECK, cardStats } from './cards.js';
import { ENEMIES } from './enemies.js';
import { createRng, shuffle } from './rng.js';

export const HAND_SIZE = 5;
export const MAX_HAND = 10;
export const MAX_ENERGY = 3;
export const PLAYER_MAX_HP = 70;

const newStatus = () => ({ strength: 0, vulnerable: 0, weak: 0 });

// scale: 위층 적일수록 강하게 { hp: 배율, strength: 처음부터 붙은 기세 }
export function createBattle({
  enemyId,
  seed = 1,
  deck = STARTER_DECK,
  playerHp = PLAYER_MAX_HP,
  playerMaxHp = PLAYER_MAX_HP,
  scale = { hp: 1, strength: 0 },
} = {}) {
  const def = ENEMIES[enemyId];
  if (!def) throw new Error(`알 수 없는 적: ${enemyId}`);
  const rng = createRng(seed);
  // 덱은 카드 id 문자열 또는 { uid, id, upgraded } 객체
  const cards = deck.map((c, i) => (typeof c === 'string'
    ? { uid: i + 1, id: c, upgraded: false }
    : { uid: c.uid ?? i + 1, id: c.id, upgraded: !!c.upgraded }));
  const maxHp = Math.round(def.maxHp * scale.hp);

  return {
    rng,
    turn: 0,
    phase: 'start', // start → player → enemy → player ... → won | lost
    player: {
      hp: playerHp, maxHp: playerMaxHp, energy: 0, maxEnergy: MAX_ENERGY, status: newStatus(),
    },
    enemy: {
      id: def.id,
      name: def.name,
      title: def.title,
      art: def.art,
      tier: def.tier,
      hp: maxHp,
      maxHp,
      status: { ...newStatus(), strength: scale.strength },
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
  s.player.energy = s.player.maxEnergy;
  drawCards(s, HAND_SIZE);
  s.phase = 'player';
  emit(s, { type: 'turnStart', turn: s.turn });
}

// 상태 효과를 반영한 한 타 피해
export function computeDamage(attacker, defender, base) {
  let dmg = base + attacker.status.strength;
  if (attacker.status.weak > 0) dmg = Math.floor(dmg * 0.75);
  if (defender.status.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
  return Math.max(0, dmg);
}

function applyDamage(s, targetKey, amount) {
  const t = s[targetKey];
  t.hp = Math.max(0, t.hp - amount);
  emit(s, { type: 'damage', target: targetKey, amount });
}

function addStatus(s, targetKey, kind, amount) {
  s[targetKey].status[kind] += amount;
  emit(s, { type: 'status', target: targetKey, kind, amount });
}

function tickStatus(unit) {
  if (unit.status.vulnerable > 0) unit.status.vulnerable -= 1;
  if (unit.status.weak > 0) unit.status.weak -= 1;
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
  return !!card && cardStats(card).cost <= s.player.energy;
}

// 카드 한 타의 기본 피해 (역류검처럼 조건부 추가 피해 포함)
export function cardBaseDamage(s, c) {
  let base = c.damage ?? 0;
  if (c.bonusIfAttacking && s.enemy.intent.damage) base += c.bonusIfAttacking;
  return base;
}

// 카드 사용. 성공하면 true.
export function playCard(s, uid) {
  if (!canPlay(s, uid)) return false;
  const idx = s.hand.findIndex((c) => c.uid === uid);
  const card = s.hand[idx];
  const c = cardStats(card);

  s.player.energy -= c.cost;
  s.hand.splice(idx, 1);
  emit(s, { type: 'play', card: card.id, attack: !!c.damage });

  if (c.strength) addStatus(s, 'player', 'strength', c.strength);
  if (c.damage) {
    const hits = c.hits ?? 1;
    const base = cardBaseDamage(s, c);
    for (let h = 0; h < hits && s.enemy.hp > 0; h++) {
      applyDamage(s, 'enemy', computeDamage(s.player, s.enemy, base));
    }
  }
  if (s.enemy.hp > 0) {
    if (c.vulnerable) addStatus(s, 'enemy', 'vulnerable', c.vulnerable);
    if (c.weak) addStatus(s, 'enemy', 'weak', c.weak);
  }
  if (c.energy) s.player.energy += c.energy;
  s.discard.push(card);
  if (c.draw) drawCards(s, c.draw);

  checkEnd(s);
  return true;
}

// 턴 종료: 손패를 버리고 적 차례로 넘어감
export function endPlayerTurn(s) {
  if (s.phase !== 'player') return false;
  s.discard.push(...s.hand);
  s.hand = [];
  tickStatus(s.player);
  s.phase = 'enemy';
  return true;
}

// 적 행동 실행 후, 전투가 계속되면 다음 플레이어 턴 시작
export function runEnemyTurn(s) {
  if (s.phase !== 'enemy') return false;
  const e = s.enemy;
  const act = e.intent;
  emit(s, { type: 'enemyAct', name: act.name });

  if (act.strength) addStatus(s, 'enemy', 'strength', act.strength);
  if (act.damage) {
    const hits = act.hits ?? 1;
    for (let h = 0; h < hits && s.player.hp > 0; h++) {
      applyDamage(s, 'player', computeDamage(e, s.player, act.damage));
    }
  }
  if (s.player.hp > 0) {
    if (act.weak) addStatus(s, 'player', 'weak', act.weak);
    if (act.vulnerable) addStatus(s, 'player', 'vulnerable', act.vulnerable);
  }
  tickStatus(e);

  const pattern = ENEMIES[e.id].pattern;
  e.patternIndex = (e.patternIndex + 1) % pattern.length;
  e.intent = pattern[e.patternIndex];

  checkEnd(s);
  if (s.phase === 'enemy') startPlayerTurn(s);
  return true;
}

// 화면에 보여줄 적의 다음 행동 (상태 효과 반영한 실제 피해)
export function intentPreview(s) {
  const it = s.enemy.intent;
  return {
    ...it,
    damage: it.damage ? computeDamage(s.enemy, s.player, it.damage) : 0,
    hits: it.hits ?? 1,
  };
}

export function takeEvents(s) {
  const ev = s.events;
  s.events = [];
  return ev;
}
