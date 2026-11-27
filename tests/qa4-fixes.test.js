// qa-20261127-1119 티켓 (BUG-038~049) 규칙 확인
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, endPlayerTurn, runEnemyTurn, takeEvents, playCard,
} from '../src/core/battle.js';
import { CARDS, cardStats, cardKeywords } from '../src/core/cards.js';
import { ENEMIES } from '../src/core/enemies.js';
import { TREASURES } from '../src/core/items.js';

const bosses = Object.entries(ENEMIES).filter(([, d]) => d.phase2).map(([id]) => id);

// 1단계 첫 공격 수를 의도로 두고, 체력을 2단계 문턱 바로 위로
function atThreshold(id) {
  const s = createBattle({ enemyId: id, seed: 1, luck: false });
  startPlayerTurn(s);
  const e = s.enemy;
  const atk = e.pattern.findIndex((a) => a.damage);
  e.patternIndex = atk;
  e.intent = e.pattern[atk];
  e.hp = Math.floor(e.maxHp * ENEMIES[id].phase2.at) + 5;
  takeEvents(s);
  return s;
}

test('BUG-038: 함정으로 2단계에 들어가면 1단계 수를 쓰지 않고, 2단계 첫 수가 다음 의도', () => {
  assert.ok(bosses.length >= 5);
  for (const id of bosses) {
    const s = atThreshold(id);
    const oldName = s.enemy.intent.name;
    s.traps = [{ card: 'uTripWire', damage: 30 }];
    endPlayerTurn(s);
    runEnemyTurn(s);
    const acts = takeEvents(s).filter((ev) => ev.type === 'enemyAct').map((ev) => ev.name);
    assert.ok(s.enemy.phase2Done, id);
    assert.ok(!acts.includes(oldName) || ENEMIES[id].phase2.pattern[0].name === oldName, `${id}: ${acts}`);
    assert.equal(acts.length, 0, `${id}: 전환 차례에는 행동 없음`);
    assert.equal(s.enemy.intent, ENEMIES[id].phase2.pattern[0], `${id}: 2단계 첫 수 예고`);
  }
});

test('BUG-038: 2단계 첫 수는 실제로 쓰임 (다음 적 차례)', () => {
  const s = atThreshold('spy');
  s.traps = [{ card: 'uTripWire', damage: 30 }];
  endPlayerTurn(s);
  runEnemyTurn(s);
  takeEvents(s);
  endPlayerTurn(s);
  runEnemyTurn(s);
  const acts = takeEvents(s).filter((ev) => ev.type === 'enemyAct').map((ev) => ev.name);
  assert.deepEqual(acts, [ENEMIES.spy.phase2.pattern[0].name]);
});

test('BUG-045: 적 차례에 함정 점혈로 차면 "다음 차례에 굳음" 표시, 다음 차례에 굳음', () => {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false });
  startPlayerTurn(s);
  s.enemy.status.point = s.enemy.pointMax - 1;
  s.enemy.intent = { name: '타격', damage: 7 };
  s.traps = [{ card: 'uTripWire', point: 5 }];
  endPlayerTurn(s);
  runEnemyTurn(s);
  const stun = takeEvents(s).find((ev) => ev.type === 'stun');
  assert.equal(stun.next, true);
  assert.equal(s.enemy.status.stun, 1);
});

test('BUG-046: 함정 피해 이벤트에 함정 표시', () => {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false });
  startPlayerTurn(s);
  s.enemy.intent = { name: '타격', damage: 7 };
  s.traps = [{ card: 'uTripWire', damage: 5 }];
  endPlayerTurn(s);
  runEnemyTurn(s);
  const dmg = takeEvents(s).find((ev) => ev.type === 'damage' && ev.target === 'enemy');
  assert.equal(dmg.trap, true);
});

test('BUG-040: 훔치기 이벤트는 음수 amount (화면이 부호 그대로 표시)', () => {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false });
  startPlayerTurn(s);
  s.hand = [{ uid: 900, id: 'uHighwayman', upgraded: false }];
  s.player.energy = 9;
  takeEvents(s);
  playCard(s, 900);
  const ev = takeEvents(s).find((x) => x.type === 'status' && x.target === 'enemy' && x.kind === 'strength');
  assert.ok(ev.amount < 0);
});

test('BUG-041~044: 밸런스 수치', () => {
  assert.deepEqual(TREASURES.mirrorHeart.fx, { turnStatus: { insight: 1 }, attackBonus: 1 });
  assert.equal(TREASURES.demonGodSeal.fx.maxHp, -5);
  const h = CARDS.uPoisonHammer;
  assert.deepEqual([h.damage, h.thrown, h.thrownPoison, h.upgrade.damage, h.upgrade.thrown], [9, 5, 2, 11, 7]);
  assert.deepEqual([CARDS.uHighwayman.steal, CARDS.uHighwayman.upgrade.steal, CARDS.uDivineThief.upgrade.steal], [2, 3, 3]);
});

test('BUG-047: 보물 설명에 숫자 붙은 "약화 n" 없음', () => {
  for (const [id, t] of Object.entries(TREASURES)) assert.ok(!/약화 \d/.test(t.desc), id);
});

test('BUG-048: 체력 대가 마교 무공은 마기 풀이가 있음', () => {
  for (const [id, c] of Object.entries(CARDS)) {
    if (c.faction !== 'demonic' || !c.hpCost) continue;
    assert.ok(String(cardKeywords(cardStats({ id }))).includes('마기:'), id);
  }
});

test('BUG-049: 입마 경문 설명이 1장당 합계를 밝힘', () => {
  assert.match(TREASURES.madnessSutra.desc, /1장당 \+3/);
});
