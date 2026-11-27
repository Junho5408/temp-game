// 전투 규칙 (화면과 무관한 순수 로직)
// 화면은 state.events 를 읽어 연출하고 비운다.
//
// 방어 개념은 없음: 체력은 깎이기만 하고 지도의 운기조식에서 회복. 대신 경공으로 피한다.
//
// 명중 · 회피 · 치명
//   - 공격은 한 타마다 명중을 굴림. 기본 명중 90%, 상대 회피율만큼 깎임 (최저 20%)
//   - 플레이어가 연달아 빗나가면 다음 명중 +10%씩 (불운 보정)
//   - 치명: 피해 1.5배. 플레이어 기본 10%, 적 기본 5%
//   - 필중(sure) 카드와 간파 상태는 반드시 명중
//
// 상태 효과
//   기세(strength)      공격 피해 +n (전투 내내)
//   내상(vulnerable)    받는 피해 1.5배, 남은 턴 수 (자기 차례가 끝날 때 1 감소)
//   흐트러짐(weak)      주는 피해 0.75배, 남은 턴 수 (자기 차례가 끝날 때 1 감소)
//   중독(poison)        자기 차례 시작에 n 피해, 그 뒤 1 감소
//   경공(evasion)       플레이어: 적 공격 회피율 +10%×n (최대 70%). 내 다음 차례가 시작되면 사라짐
//   간파(insight)       플레이어: 다음 초식 한 장이 반드시 명중하고 치명
//   반격(counter)       적: 이 상태에서 초식으로 공격하면 카드마다 n 피해를 되받음. 적이 움직이면 풀림
//   점혈(point)         적: 게이지가 가득 차면 다음 차례 동안 몸이 굳음(stun)
//
// 적 패턴
//   - pattern 을 순서대로(cycle) 또는 무작위(random, 같은 수 연속 없음) 사용
//   - charge: 필살기. 예고된 턴에 breakAt 이상 피해를 주면 파기(破氣) → 몸이 굳음
//   - phase2: 체력이 일정 이하가 되면 패턴·특성이 바뀜 (두목)
//   - 특성(traits): enemies.js 의 TRAITS 참고
//
// 아이템 (items.js)
//   - 행낭 물품(bag): useItem 으로 내 차례에 한 번 쓰고 사라짐 (내공 안 씀)
//   - 보물(treasures): 전투 내내 자동 적용
import { STARTER_DECK, cardStats } from './cards.js';
import { ENEMIES, POINT_MAX } from './enemies.js';
import { CONSUMABLES } from './items.js';
import { createRng, shuffle } from './rng.js';

export const HAND_SIZE = 5;
export const MAX_HAND = 10;
export const MAX_ENERGY = 3;
export const PLAYER_MAX_HP = 70;
export const BASE_ACCURACY = 90;
export const PLAYER_CRIT = 10;
export const ENEMY_CRIT = 5;
export const CRIT_MULT = 1.5;
export const EVASION_PER_STACK = 10;
export const MAX_EVASION = 70;
export const MIN_HIT = 20;
export const POINT_STEP = 6; // 점혈로 한 번 굳을 때마다 게이지 최대치 증가

const newStatus = () => ({
  strength: 0, vulnerable: 0, weak: 0, poison: 0, evasion: 0, insight: 0, counter: 0, stun: 0, point: 0,
});

// scale: 위층 적일수록 강하게 { hp: 배율, strength: 처음부터 붙은 기세 }
// luck: false 면 빗나감·치명·허초 없음 (테스트용)
export function createBattle({
  enemyId,
  seed = 1,
  deck = STARTER_DECK,
  playerHp = PLAYER_MAX_HP,
  playerMaxHp = PLAYER_MAX_HP,
  scale = { hp: 1, strength: 0 },
  luck = true,
  bag = [],
  treasures = [],
} = {}) {
  const def = ENEMIES[enemyId];
  if (!def) throw new Error(`알 수 없는 적: ${enemyId}`);
  const rng = createRng(seed);
  // 덱은 카드 id 문자열 또는 { uid, id, upgraded } 객체
  const cards = deck.map((c, i) => (typeof c === 'string'
    ? { uid: i + 1, id: c, upgraded: false }
    : { uid: c.uid ?? i + 1, id: c.id, upgraded: !!c.upgraded }));
  const maxHp = Math.round(def.maxHp * scale.hp);

  const s = {
    rng,
    luck,
    turn: 0,
    phase: 'start', // start → player → enemy → player ... → won | lost
    turnAttacks: 0, // 이번 턴에 쓴 초식 수 (연계)
    bag: [...bag], // 행낭 물품 id
    treasures: new Set(treasures), // 보물 id
    player: {
      hp: playerHp,
      maxHp: playerMaxHp,
      energy: 0,
      maxEnergy: MAX_ENERGY + (treasures.includes('daeHwan') ? 1 : 0),
      status: newStatus(),
      missStreak: 0,
      shield: treasures.includes('silkArmor'), // 천잠보의: 첫 일격 무효
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
      evasion: def.evasion ?? 0,
      crit: def.crit ?? ENEMY_CRIT,
      traits: [...(def.traits ?? [])],
      pattern: def.pattern,
      patternMode: def.patternMode ?? 'cycle',
      patternIndex: 0,
      intent: def.pattern[0],
      intentHidden: false,
      pointMax: POINT_MAX[def.tier] ?? 12,
      phase2Done: false,
      berserkDone: false,
      turnDamage: 0, // 이번 내 턴에 받은 피해 (파기 판정)
      ironUsed: false,
    },
    drawPile: shuffle(cards, rng),
    hand: [],
    discard: [],
    events: [],
  };
  if (s.enemy.traits.includes('killer')) s.enemy.crit = 25;
  return s;
}

const owns = (s, id) => s.treasures?.has(id);

// 보물 효과로 상태가 붙을 때 (연출용 이벤트에 보물 id 를 같이 실음)
function treasureStatus(s, id, kind, amount) {
  emit(s, { type: 'treasure', id });
  addStatus(s, 'player', kind, amount);
}

function emit(s, event) {
  s.events.push(event);
}

const has = (unit, trait) => !!unit.traits?.includes(trait);

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
  const p = s.player;
  p.status.evasion = 0; // 경공은 적의 한 차례 동안만
  s.turnAttacks = 0;
  s.enemy.turnDamage = 0;
  s.enemy.ironUsed = false;
  emit(s, { type: 'turnStart', turn: s.turn });
  if (tickPoison(s, 'player')) return;
  if (s.turn === 1) {
    if (owns(s, 'stoneMilk')) treasureStatus(s, 'stoneMilk', 'strength', 1);
    if (owns(s, 'farSight')) treasureStatus(s, 'farSight', 'insight', 1);
  }
  if (owns(s, 'taiji')) treasureStatus(s, 'taiji', 'evasion', 1);
  p.energy = p.maxEnergy;
  drawCards(s, HAND_SIZE);
  s.phase = 'player';
}

// 중독 피해. 쓰러졌으면 true
function tickPoison(s, key) {
  const u = s[key];
  if (u.status.poison <= 0) return false;
  const amount = u.status.poison;
  u.status.poison -= 1;
  u.hp = Math.max(0, u.hp - amount);
  emit(s, { type: 'damage', target: key, amount, poison: true });
  if (key === 'enemy') afterEnemyHurt(s, amount);
  checkEnd(s);
  return s.phase === 'won' || s.phase === 'lost';
}

// 상태 효과를 반영한 한 타 피해 (치명 제외)
export function computeDamage(attacker, defender, base) {
  let dmg = base + attacker.status.strength;
  if (attacker.status.weak > 0) dmg = Math.floor(dmg * 0.75);
  if (defender.status.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
  return Math.max(0, dmg);
}

// ── 명중 확률 ─────────────────────────
// 플레이어 카드의 명중률 (%). 필중·간파면 100
export function playerHitChance(s, c) {
  if (c.sure || s.player.status.insight > 0) return 100;
  const chance = (c.accuracy ?? BASE_ACCURACY) - s.enemy.evasion + s.player.missStreak * 10;
  return Math.max(MIN_HIT, Math.min(100, chance));
}

export function playerEvasion(s) {
  return Math.min(MAX_EVASION, s.player.status.evasion * EVASION_PER_STACK);
}

// 적 공격의 명중률 (%)
export function enemyHitChance(s, act = s.enemy.intent) {
  const chance = (act.accuracy ?? BASE_ACCURACY) - playerEvasion(s);
  return Math.max(MIN_HIT, Math.min(100, chance));
}

function roll(s, chancePct) {
  if (!s.luck) return chancePct > 0;
  return s.rng() * 100 < chancePct;
}

function rollCrit(s, chancePct) {
  if (!s.luck) return false;
  return s.rng() * 100 < chancePct;
}

function addStatus(s, targetKey, kind, amount) {
  if (targetKey === 'player' && kind === 'poison' && owns(s, 'poisonProof')) {
    emit(s, { type: 'treasure', id: 'poisonProof' });
    return;
  }
  s[targetKey].status[kind] += amount;
  emit(s, { type: 'status', target: targetKey, kind, amount });
}

function tickStatus(unit) {
  if (unit.status.vulnerable > 0) unit.status.vulnerable -= 1;
  if (unit.status.weak > 0) unit.status.weak -= 1;
}

function checkEnd(s) {
  if (s.phase === 'won' || s.phase === 'lost') return;
  if (s.enemy.hp <= 0) {
    s.phase = 'won';
    emit(s, { type: 'won' });
  } else if (s.player.hp <= 0) {
    s.phase = 'lost';
    emit(s, { type: 'lost' });
  }
}

// 적이 피해를 받은 뒤: 파기, 광폭, 2단계
function afterEnemyHurt(s, amount) {
  const e = s.enemy;
  if (e.hp <= 0) return;
  e.turnDamage += amount;
  const it = e.intent;
  if (s.phase === 'player' && it.charge && e.status.stun === 0 && e.turnDamage >= it.breakAt) {
    e.status.stun = 1;
    emit(s, { type: 'break', name: it.name });
  }
  const def = ENEMIES[e.id];
  if (has(e, 'berserk') && !e.berserkDone && e.hp <= e.maxHp / 2) {
    e.berserkDone = true;
    emit(s, { type: 'trait', trait: 'berserk' });
    addStatus(s, 'enemy', 'strength', 3);
  }
  const p2 = def.phase2;
  if (p2 && !e.phase2Done && e.hp <= e.maxHp * p2.at) {
    e.phase2Done = true;
    if (p2.title) e.title = p2.title;
    if (p2.traits) e.traits = [...new Set([...e.traits, ...p2.traits])];
    if (p2.evasion !== undefined) e.evasion = p2.evasion;
    e.pattern = p2.pattern;
    e.patternMode = p2.patternMode ?? 'cycle';
    e.patternIndex = 0;
    e.intent = e.pattern[0];
    e.intentHidden = false;
    emit(s, { type: 'phase', text: p2.text, title: e.title });
    if (p2.strength) addStatus(s, 'enemy', 'strength', p2.strength);
  }
}

// 점혈 게이지
function addPoint(s, n) {
  const e = s.enemy;
  if (e.status.stun > 0) {
    e.status.point = Math.min(e.pointMax - 1, e.status.point + n);
    emit(s, { type: 'status', target: 'enemy', kind: 'point', amount: n });
    return;
  }
  e.status.point += n;
  emit(s, { type: 'status', target: 'enemy', kind: 'point', amount: n });
  if (e.status.point >= e.pointMax) {
    e.status.point = 0;
    e.pointMax += POINT_STEP;
    e.status.stun = 1;
    emit(s, { type: 'stun', reason: 'point' });
  }
}

export function canPlay(s, uid) {
  if (s.phase !== 'player') return false;
  const card = s.hand.find((c) => c.uid === uid);
  return !!card && cardStats(card).cost <= s.player.energy;
}

// 연계 조건: 이번 턴에 이미 초식을 썼는가
export function comboActive(s) {
  return s.turnAttacks > 0;
}

// 카드 한 타의 기본 피해 (조건부 추가 피해 포함)
export function cardBaseDamage(s, c) {
  let base = c.damage ?? 0;
  if (c.bonusIfAttacking && s.enemy.intent.damage && !s.enemy.intentHidden) base += c.bonusIfAttacking;
  if (c.combo && comboActive(s)) base += c.combo;
  if (c.perAttack) base += c.perAttack * s.turnAttacks;
  return base;
}

// 보물까지 더한 한 타 기본 피해 (기세·내상 적용 전)
function cardDamageBase(s, c) {
  let base = cardBaseDamage(s, c);
  if (owns(s, 'chainArt') && comboActive(s)) base += 2;
  if (owns(s, 'drunkenFist')) base += s.player.missStreak * 3;
  return base;
}

// 손패에 보여 줄 한 타 실제 피해 (치명·철포삼 제외) — BUG-015
export function cardPreviewDamage(s, c) {
  if (!c.damage) return 0;
  return computeDamage(s.player, s.enemy, cardDamageBase(s, c));
}

export function cardHits(s, c) {
  return (c.hits ?? 1) + (c.comboHits && comboActive(s) ? c.comboHits : 0);
}

// 카드 사용. 성공하면 true.
export function playCard(s, uid) {
  if (!canPlay(s, uid)) return false;
  const idx = s.hand.findIndex((c) => c.uid === uid);
  const card = s.hand[idx];
  const c = cardStats(card);
  const p = s.player;
  const e = s.enemy;

  p.energy -= c.cost;
  s.hand.splice(idx, 1);
  emit(s, { type: 'play', card: card.id, attack: !!c.damage });

  if (c.strength) addStatus(s, 'player', 'strength', c.strength);
  if (c.evasion) addStatus(s, 'player', 'evasion', c.evasion);
  if (c.damage) {
    const insight = p.status.insight > 0;
    if (insight) p.status.insight -= 1;
    const hits = cardHits(s, c);
    const base = cardDamageBase(s, c);
    const critChance = PLAYER_CRIT + (c.crit ?? 0) + (owns(s, 'blueSteel') ? 10 : 0);
    let landed = 0;
    for (let h = 0; h < hits && e.hp > 0; h++) {
      if (!roll(s, insight || c.sure ? 100 : playerHitChance(s, c))) {
        p.missStreak += 1;
        emit(s, { type: 'miss', target: 'enemy' });
        continue;
      }
      p.missStreak = 0;
      landed += 1;
      const crit = insight || rollCrit(s, critChance);
      let dmg = computeDamage(p, e, base);
      if (crit) dmg = Math.floor(dmg * CRIT_MULT);
      let guarded = false;
      if (has(e, 'ironBody') && !e.ironUsed && dmg > 0) {
        e.ironUsed = true;
        dmg = Math.ceil(dmg / 2);
        guarded = true;
      }
      e.hp = Math.max(0, e.hp - dmg);
      emit(s, { type: 'damage', target: 'enemy', amount: dmg, crit, guarded });
      afterEnemyHurt(s, dmg);
    }
    if (e.hp > 0 && landed > 0) {
      if (c.vulnerable) addStatus(s, 'enemy', 'vulnerable', c.vulnerable);
      if (c.weak) addStatus(s, 'enemy', 'weak', c.weak);
      if (c.point) addPoint(s, c.point + (owns(s, 'meridianChart') ? 3 : 0));
    }
    // 반격 자세: 초식 한 장마다 되받아침
    if (e.hp > 0 && e.status.counter > 0) {
      const dmg = computeDamage(e, p, e.status.counter);
      p.hp = Math.max(0, p.hp - dmg);
      emit(s, { type: 'damage', target: 'player', amount: dmg, counter: true });
    }
    s.turnAttacks += 1;
  } else if (c.point) {
    addPoint(s, c.point + (owns(s, 'meridianChart') ? 3 : 0));
  }
  if (c.insight) addStatus(s, 'player', 'insight', c.insight);
  if (c.energy) p.energy += c.energy;
  s.discard.push(card);
  if (c.draw) drawCards(s, c.draw);

  checkEnd(s);
  return true;
}

// 행낭 물품 사용 (내 차례, 내공 안 씀). 성공하면 true
export function useItem(s, index) {
  if (s.phase !== 'player') return false;
  const id = s.bag[index];
  const it = CONSUMABLES[id];
  if (!it) return false;
  s.bag.splice(index, 1);
  const p = s.player;
  const e = s.enemy;
  emit(s, { type: 'item', id });
  if (it.heal) {
    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + it.heal);
    emit(s, { type: 'heal', target: 'player', amount: p.hp - before });
  }
  if (it.cleanse) {
    p.status.poison = 0;
    p.status.vulnerable = 0;
    p.status.weak = 0;
    emit(s, { type: 'status', target: 'player', kind: 'cleanse', amount: 0 });
  }
  if (it.evasion) addStatus(s, 'player', 'evasion', it.evasion);
  if (it.energy) p.energy += it.energy;
  if (it.draw) drawCards(s, it.draw);
  if (it.damage) {
    let dmg = it.damage;
    if (e.status.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
    e.hp = Math.max(0, e.hp - dmg);
    emit(s, { type: 'damage', target: 'enemy', amount: dmg, item: true });
    afterEnemyHurt(s, dmg);
  }
  if (e.hp > 0) {
    if (it.poison) addStatus(s, 'enemy', 'poison', it.poison);
    if (it.point) addPoint(s, it.point);
  }
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

function setNextIntent(s) {
  const e = s.enemy;
  const n = e.pattern.length;
  if (e.patternMode === 'random' && n > 1) {
    let next = Math.floor(s.rng() * (n - 1));
    if (next >= e.patternIndex) next += 1; // 같은 수 연속 금지
    e.patternIndex = next;
  } else {
    e.patternIndex = (e.patternIndex + 1) % n;
  }
  e.intent = e.pattern[e.patternIndex];
  e.intentHidden = s.luck && has(e, 'feint') && !e.intent.charge && s.rng() < 0.4;
}

// 적 행동 실행 후, 전투가 계속되면 다음 플레이어 턴 시작
export function runEnemyTurn(s) {
  if (s.phase !== 'enemy') return false;
  const e = s.enemy;
  const p = s.player;
  e.status.counter = 0; // 반격 자세는 적이 움직이면 풀림

  if (tickPoison(s, 'enemy')) return true;

  if (e.status.stun > 0) {
    e.status.stun = 0;
    emit(s, { type: 'enemyAct', name: '몸이 굳어 움직이지 못한다', stunned: true });
  } else {
    const act = e.intent;
    emit(s, { type: 'enemyAct', name: act.name, charge: !!act.charge });
    if (act.strength) addStatus(s, 'enemy', 'strength', act.strength);
    if (act.heal) {
      const before = e.hp;
      e.hp = Math.min(e.maxHp, e.hp + act.heal);
      emit(s, { type: 'heal', target: 'enemy', amount: e.hp - before });
    }
    if (act.damage) {
      const hits = act.hits ?? 1;
      let landed = 0;
      for (let h = 0; h < hits && p.hp > 0; h++) {
        if (!roll(s, enemyHitChance(s, act))) {
          emit(s, { type: 'miss', target: 'player', dodge: p.status.evasion > 0 });
          continue;
        }
        if (p.shield) {
          p.shield = false;
          emit(s, { type: 'shield', target: 'player' });
          continue;
        }
        landed += 1;
        const crit = !owns(s, 'mirror') && rollCrit(s, e.crit);
        let dmg = computeDamage(e, p, act.damage);
        if (crit) dmg = Math.floor(dmg * CRIT_MULT);
        p.hp = Math.max(0, p.hp - dmg);
        emit(s, { type: 'damage', target: 'player', amount: dmg, crit });
        if (has(e, 'drain') && dmg > 0) {
          const before = e.hp;
          e.hp = Math.min(e.maxHp, e.hp + Math.ceil(dmg / 2));
          if (e.hp > before) emit(s, { type: 'heal', target: 'enemy', amount: e.hp - before });
        }
        if (has(e, 'venom') && p.hp > 0) addStatus(s, 'player', 'poison', 1);
      }
      if (p.hp > 0 && landed > 0) {
        if (act.weak) addStatus(s, 'player', 'weak', act.weak);
        if (act.vulnerable) addStatus(s, 'player', 'vulnerable', act.vulnerable);
        if (act.poison) addStatus(s, 'player', 'poison', act.poison);
      }
    } else if (p.hp > 0) {
      if (act.weak) addStatus(s, 'player', 'weak', act.weak);
      if (act.vulnerable) addStatus(s, 'player', 'vulnerable', act.vulnerable);
      if (act.poison) addStatus(s, 'player', 'poison', act.poison);
    }
    if (act.counter) addStatus(s, 'enemy', 'counter', act.counter);
  }
  tickStatus(e);
  setNextIntent(s);

  checkEnd(s);
  if (s.phase === 'enemy') startPlayerTurn(s);
  return true;
}

// 화면에 보여줄 적의 다음 행동 (상태 효과 반영한 실제 피해)
export function intentPreview(s) {
  const e = s.enemy;
  if (e.status.stun > 0) return { name: '몸이 굳었다', stunned: true, damage: 0, hits: 1 };
  if (e.intentHidden) return { name: '허초', hidden: true, damage: 0, hits: 1 };
  const it = e.intent;
  return {
    ...it,
    damage: it.damage ? computeDamage(e, s.player, it.damage) : 0,
    hits: it.hits ?? 1,
    hitChance: it.damage ? enemyHitChance(s, it) : 0,
    breakProgress: it.charge ? e.turnDamage : 0,
  };
}

export function takeEvents(s) {
  const ev = s.events;
  s.events = [];
  return ev;
}
