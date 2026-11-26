import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, endPlayerTurn, runEnemyTurn, computeDamage, intentPreview,
} from '../src/core/battle.js';
import { cardStats, CARDS } from '../src/core/cards.js';

function setup(enemyId = 'dummy') {
  const s = createBattle({ enemyId, seed: 7, luck: false });
  startPlayerTurn(s);
  return s;
}

function forceHand(s, ids) {
  s.drawPile.push(...s.hand);
  s.hand = ids.map((id, i) => (typeof id === 'string'
    ? { uid: 1000 + i, id, upgraded: false }
    : { uid: 1000 + i, ...id }));
}

test('연마한 카드는 수치가 올라가고 이름에 + 가 붙음', () => {
  const c = cardStats({ id: 'strike', upgraded: true });
  assert.equal(c.damage, 9);
  assert.equal(c.displayName, '기본 검법+');
  assert.equal(cardStats({ id: 'strike' }).damage, 6);
});

test('모든 카드는 설명과 연마 값이 있음', () => {
  for (const id of Object.keys(CARDS)) {
    assert.ok(cardStats({ id }).desc.length > 0, id);
    assert.ok(CARDS[id].upgrade, `${id} 연마 값 없음`);
  }
});

test('기세는 공격 피해를 늘림 (타수마다)', () => {
  const s = setup();
  forceHand(s, ['breathe', 'chain']);
  playCard(s, 1000); // 기세 +2
  const hp = s.enemy.hp;
  playCard(s, 1001); // (4+2) x 2
  assert.equal(s.enemy.hp, hp - 12);
});

test('내상: 받는 피해 1.5배, 적 차례가 끝날 때 1 줄어듦', () => {
  const s = setup();
  forceHand(s, ['rend', 'strike']);
  playCard(s, 1000); // 피해 6, 내상 2
  assert.equal(s.enemy.status.vulnerable, 2);
  const hp = s.enemy.hp;
  playCard(s, 1001); // 6 * 1.5 = 9
  assert.equal(s.enemy.hp, hp - 9);
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.enemy.status.vulnerable, 1);
});

test('기혈 흐트러짐: 주는 피해 0.75배 (내림)', () => {
  const s = setup('dummy'); // 첫 행동 피해 7
  forceHand(s, ['sway']);
  playCard(s, 1000); // 적에게 기혈 흐트러짐 2
  assert.equal(intentPreview(s).damage, 5); // floor(7 * 0.75)
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.player.hp, s.player.maxHp - 5);
});

test('적이 건 디버프도 플레이어에게 적용되고 내 차례가 끝나면 줄어듦', () => {
  const s = setup();
  s.enemy.intent = { name: '암침', damage: 5, weak: 2 };
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.player.status.weak, 2);
  forceHand(s, ['strike']);
  const hp = s.enemy.hp;
  playCard(s, 1000);
  assert.equal(s.enemy.hp, hp - 4); // floor(6 * 0.75)
  endPlayerTurn(s);
  assert.equal(s.player.status.weak, 1);
});

test('적 기세가 예고 피해에 반영됨', () => {
  const s = setup(); // 타격 7 → 기 모으기(기세 +2) → 강타 10
  endPlayerTurn(s);
  runEnemyTurn(s);
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.enemy.status.strength, 2);
  assert.equal(intentPreview(s).damage, 12);
});

test('기 모으기는 내공을 돌려주고, 검기 집중은 기세와 카드 1장', () => {
  const s = setup();
  forceHand(s, ['gather', 'focus']);
  playCard(s, 1000);
  assert.equal(s.player.energy, 4);
  const before = s.hand.length;
  playCard(s, 1001); // 기세 +1, 카드 1장
  assert.equal(s.hand.length, before - 1 + 1);
  assert.equal(s.player.status.strength, 1);
});

test('computeDamage는 음수가 되지 않음', () => {
  const a = { status: { strength: -10, weak: 0, vulnerable: 0 } };
  const d = { status: { strength: 0, weak: 0, vulnerable: 0 } };
  assert.equal(computeDamage(a, d, 3), 0);
});
