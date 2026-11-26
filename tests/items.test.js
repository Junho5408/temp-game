// 2-D: 행낭 물품(일시적) · 보물(영구적)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, endPlayerTurn, runEnemyTurn, useItem, takeEvents, PLAYER_MAX_HP,
} from '../src/core/battle.js';
import {
  createRun, addItem, addTreasure, finishBattle, chooseTreasure, chooseReward, startEncounter, buyCard, canBuy,
} from '../src/core/run.js';
import { BAG_SIZE, CONSUMABLES, TREASURES } from '../src/core/items.js';

function setup(opts = {}) {
  const s = createBattle({ enemyId: 'dummy', seed: 5, luck: false, ...opts });
  startPlayerTurn(s);
  return s;
}

function forceHand(s, ids) {
  s.drawPile.push(...s.hand);
  s.hand = ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

const enemyTurn = (s) => { endPlayerTurn(s); runEnemyTurn(s); };

test('행낭 물품은 모두 쓸 수 있고, 쓰면 사라짐 (내공은 그대로)', () => {
  for (const id of Object.keys(CONSUMABLES)) {
    const s = setup({ bag: [id] });
    s.player.hp = 40;
    const energy = s.player.energy;
    assert.ok(useItem(s, 0), id);
    assert.equal(s.bag.length, 0);
    assert.ok(s.player.energy >= energy);
    assert.equal(useItem(s, 0), false);
  }
});

test('행낭 물품 효과: 금창약 회복, 비도 필중 피해, 독침 중독, 해독산', () => {
  const s = setup({ bag: ['geumchang', 'flyingDagger', 'poisonNeedle', 'antidote'] });
  s.player.hp = 30;
  s.player.status.poison = 4;
  useItem(s, 0);
  assert.equal(s.player.hp, 45);
  const hp = s.enemy.hp;
  useItem(s, 0);
  assert.equal(s.enemy.hp, hp - 10);
  useItem(s, 0);
  assert.equal(s.enemy.status.poison, 6);
  useItem(s, 0);
  assert.equal(s.player.status.poison, 0);
});

test('행낭은 최대 3칸', () => {
  const run = createRun({ seed: 1 });
  for (let i = 0; i < BAG_SIZE; i++) assert.ok(addItem(run, 'smoke'));
  assert.equal(addItem(run, 'smoke'), false);
  assert.equal(run.bag.length, BAG_SIZE);
});

test('전투에서 쓴 물품은 판에서도 사라짐', () => {
  const run = createRun({ seed: 2 });
  addItem(run, 'geumchang');
  addItem(run, 'smoke');
  run.encounter = { enemyId: 'dummy', tier: 'normal', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  startPlayerTurn(b);
  useItem(b, 0);
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.ok(!run.bag.includes('geumchang'));
  assert.ok(run.bag.includes('smoke'));
});

test('보물은 하나씩만, 소환단은 즉시 최대 체력 +10', () => {
  const run = createRun({ seed: 3 });
  run.hp = 50;
  assert.ok(addTreasure(run, 'soHwan'));
  assert.equal(run.maxHp, PLAYER_MAX_HP + 10);
  assert.equal(run.hp, 60);
  assert.equal(addTreasure(run, 'soHwan'), false);
});

test('보물: 대환단 내공 +1, 공청석유 첫 턴 기세, 천리안 첫 턴 간파, 태극심법 매 턴 경공', () => {
  const s = setup({ treasures: ['daeHwan', 'stoneMilk', 'farSight', 'taiji'] });
  assert.equal(s.player.energy, 4);
  assert.equal(s.player.status.strength, 1);
  assert.equal(s.player.status.insight, 1);
  assert.equal(s.player.status.evasion, 1);
  enemyTurn(s);
  assert.equal(s.player.status.evasion, 1);
  assert.equal(s.player.status.strength, 1); // 공청석유는 첫 턴만
});

test('보물: 천잠보의는 전투마다 첫 일격 무효', () => {
  const s = setup({ treasures: ['silkArmor'] });
  enemyTurn(s); // 타격 7 → 무효
  assert.equal(s.player.hp, PLAYER_MAX_HP);
  assert.ok(takeEvents(s).some((e) => e.type === 'shield'));
  enemyTurn(s); // 기 모으기
  enemyTurn(s); // 강타 10 (+2) → 이번엔 맞음
  assert.equal(s.player.hp, PLAYER_MAX_HP - 12);
});

test('보물: 만독불침은 중독을 막음', () => {
  const s = setup({ treasures: ['poisonProof'] });
  s.enemy.intent = { name: '독', damage: 1, poison: 5 };
  enemyTurn(s);
  assert.equal(s.player.status.poison, 0);
});

test('보물: 혈도도해 점혈 +3, 연환결 연계 피해 +2', () => {
  const s = setup({ treasures: ['meridianChart', 'chainArt'] });
  forceHand(s, ['pointStrike', 'strike']);
  playCard(s, 1000);
  assert.equal(s.enemy.status.point, 8);
  const hp = s.enemy.hp;
  playCard(s, 1001); // 연계 상태: 6 + 2
  assert.equal(s.enemy.hp, hp - 8);
});

test('보물: 천산설련은 이길 때마다 체력 6 회복', () => {
  const run = createRun({ seed: 4 });
  addTreasure(run, 'snowLotus');
  run.encounter = { enemyId: 'dummy', tier: 'normal', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  b.player.hp = 40;
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.equal(run.hp, 46);
});

test('고수를 이기면 보물 3개 중 하나를 고른 뒤 무공 보상', () => {
  const run = createRun({ seed: 6 });
  run.encounter = { enemyId: 'masked', tier: 'elite', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.equal(run.phase, 'treasure');
  assert.equal(run.treasureChoice.length, 3);
  assert.ok(run.treasureChoice.every((id) => TREASURES[id] && TREASURES[id].rarity !== 'boss'));
  const pick = run.treasureChoice[1];
  assert.ok(chooseTreasure(run, 1));
  assert.ok(run.treasures.includes(pick));
  assert.equal(run.phase, 'reward');
  assert.ok(chooseReward(run, null));
});

test('객잔: 행낭이 가득 차면 물품을 못 사고, 가진 보물은 못 삼', () => {
  const run = createRun({ seed: 9 });
  run.phase = 'shop';
  run.shop = {
    items: [{ kind: 'item', id: 'smoke', price: 10 }, { kind: 'treasure', id: 'taiji', price: 10 }],
    removed: false,
  };
  run.gold = 999;
  for (let i = 0; i < BAG_SIZE; i++) addItem(run, 'geumchang');
  assert.equal(canBuy(run, 0), false);
  assert.ok(buyCard(run, 1));
  assert.ok(run.treasures.includes('taiji'));
});
