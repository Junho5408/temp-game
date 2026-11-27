// 7-C 새 갈래 규칙: 심법 유지·검기·함정·훔치기·혈계·입마 연료
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS } from '../src/core/cards.js';
import {
  createBattle, startPlayerTurn, playCard, endPlayerTurn, runEnemyTurn, cardPreviewDamage,
} from '../src/core/battle.js';
import { cardStats } from '../src/core/cards.js';

const T = (id, def) => { CARDS[id] = { id, name: id, type: 'attack', rarity: 'common', faction: 'orthodox', cost: 0, ...def }; };
function battle(opts = {}) {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false, ...opts });
  startPlayerTurn(s);
  return s;
}
const hand = (s, ids) => { s.hand = ids.map((id, i) => ({ uid: 900 + i, id, upgraded: false })); s.player.energy = 9; };
const clean = (...ids) => ids.forEach((id) => delete CARDS[id]);

test('심법 유지: 쓰면 사라지고 다음 턴부터 매 턴 효과', () => {
  T('__pw', { type: 'skill', power: { strength: 1, draw: 1 } });
  try {
    const s = battle({ deck: Array(15).fill('strike') });
    hand(s, ['__pw']);
    playCard(s, 900);
    assert.ok(s.exhausted.some((c) => c.id === '__pw'));
    endPlayerTurn(s); runEnemyTurn(s);
    assert.equal(s.player.status.strength, 1);
    assert.equal(s.hand.length, 6);
  } finally { clean('__pw'); }
});

test('검기: 앞서 쓴 카드마다 피해 증가', () => {
  T('__qi', { damage: 3, swordQi: 2 }); T('__sk', { type: 'skill', draw: 0 });
  try {
    const s = battle();
    hand(s, ['__sk', '__sk', '__qi']);
    playCard(s, 900); playCard(s, 901);
    assert.equal(cardPreviewDamage(s, cardStats({ id: '__qi' })), 7);
  } finally { clean('__qi', '__sk'); }
});

test('함정: 적이 공격하는 순간 먼저 발동, 쓰러뜨리면 승리', () => {
  T('__tr', { type: 'skill', trap: { damage: 50, weak: 1 } });
  try {
    const s = battle();
    hand(s, ['__tr']);
    playCard(s, 900);
    s.enemy.hp = 10;
    s.enemy.intent = { name: '공격', damage: 5 };
    endPlayerTurn(s); runEnemyTurn(s);
    assert.equal(s.phase, 'won');
    assert.equal(s.player.hp, 70);
  } finally { clean('__tr'); }
});

test('훔치기: 적 기세를 깎고 있던 만큼 내 기세로', () => {
  T('__st', { type: 'skill', steal: 3 });
  try {
    const s = battle();
    s.enemy.status.strength = 2;
    hand(s, ['__st']);
    playCard(s, 900);
    assert.equal(s.enemy.status.strength, -1);
    assert.equal(s.player.status.strength, 2);
  } finally { clean('__st'); }
});

test('혈계·입마 연료', () => {
  T('__bp', { damage: 4, bloodPact: 2 }); T('__cf', { damage: 4, consumeCurse: 6 });
  try {
    const s = battle({ faction: 'demonic' });
    s.player.hp = 40;
    assert.equal(cardPreviewDamage(s, cardStats({ id: '__bp' })), 4 + 6);
    hand(s, ['__cf', 'qiDeviation']);
    assert.equal(cardPreviewDamage(s, cardStats({ id: '__cf' })), 10);
    const hp = s.enemy.hp;
    playCard(s, 900);
    assert.equal(hp - s.enemy.hp, 10);
    assert.ok(!s.hand.some((c) => c.id === 'qiDeviation'));
  } finally { clean('__bp', '__cf'); }
});

test('7-D 보물 공통 효과(fx): 첫 턴·매 턴·상시·판 전체', async () => {
  const { TREASURES } = await import('../src/core/items.js');
  const { createRun, addTreasure, restHealAmount } = await import('../src/core/run.js');
  TREASURES.__a = { name: 'a', kind: 'gear', rarity: 'common', fx: { startStatus: { strength: 1 }, attackBonus: 2 } };
  TREASURES.__b = { name: 'b', kind: 'gear', rarity: 'common', fx: { turnEnemy: { poison: 1 }, maxHp: 5, restBonus: 4 } };
  try {
    const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false, treasures: ['__a', '__b'] });
    startPlayerTurn(s);
    assert.equal(s.player.status.strength, 1);
    assert.equal(s.enemy.status.poison, 1);
    assert.equal(cardPreviewDamage(s, cardStats({ id: 'strike' })), 6 + 1 + 2);
    const run = createRun({ seed: 1 });
    const base = restHealAmount(run);
    addTreasure(run, '__b');
    assert.equal(run.maxHp, 75);
    assert.equal(restHealAmount(run), base + 4 + 2);
  } finally {
    delete TREASURES.__a;
    delete TREASURES.__b;
  }
});
