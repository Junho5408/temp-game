// 5-B: 남은 낮음 티켓 (BUG-010, 011, 012, 013, 015)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, takeEvents, cardPreviewDamage,
} from '../src/core/battle.js';
import { cardStats } from '../src/core/cards.js';
import { BAG_SIZE } from '../src/core/items.js';
import {
  createRun, addItem, chooseEventOption, finishBattle, startEncounter, swapRewardItem, canRestHeal, restHeal,
} from '../src/core/run.js';

test('BUG-010: 행낭이 가득하면 약초 노파 금창약 선택 불가, 줄 보물이 없으면 주노 "한 수" 불가', () => {
  const run = createRun({ seed: 1 });
  run.gold = 100;
  for (let i = 0; i < BAG_SIZE; i++) addItem(run, 'smoke');
  run.phase = 'event';
  run.event = { id: 'herbSeller', result: null };
  assert.equal(chooseEventOption(run, 1), null);
  assert.equal(run.gold, 100);
  run.treasures = ['taiji', 'farSight', 'silkArmor', 'drunkenFist', 'chainArt', 'mirror'];
  run.event = { id: 'junoGate', result: null };
  assert.equal(chooseEventOption(run, 1), null);
  assert.equal(run.gold, 100);
});

test('BUG-011: 첫 턴 보물 이벤트가 나옴 (화면이 연출할 수 있게)', () => {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false, treasures: ['stoneMilk'] });
  startPlayerTurn(s);
  assert.ok(takeEvents(s).some((e) => e.type === 'treasure' && e.id === 'stoneMilk'));
});

test('BUG-012: 체력이 가득하면 휴식 불가', () => {
  const run = createRun({ seed: 2 });
  run.phase = 'rest';
  assert.equal(canRestHeal(run), false);
  run.hp = 40;
  assert.equal(canRestHeal(run), true);
  assert.ok(restHeal(run) > 0);
});

test('BUG-013: 행낭이 가득할 때 떨어진 물품과 바꿔 넣기', () => {
  const run = createRun({ seed: 3 });
  for (let i = 0; i < BAG_SIZE; i++) addItem(run, 'smoke');
  run.phase = 'reward';
  run.reward = { gold: 10, cards: ['quick'], item: 'geumchang', itemKept: false };
  assert.ok(swapRewardItem(run, 1));
  assert.deepEqual(run.bag, ['smoke', 'geumchang', 'smoke']);
  assert.ok(run.reward.itemKept);
  assert.equal(swapRewardItem(run, 0), false); // 한 번만
});

test('BUG-015: 카드 피해 미리보기 = 실제로 들어가는 피해 (기세·내상·흐트러짐·연계·보물)', () => {
  const cases = [
    { setup: (s) => { s.player.status.strength = 2; }, card: 'strike' },
    { setup: (s) => { s.enemy.status.vulnerable = 2; }, card: 'strike' },
    { setup: (s) => { s.player.status.weak = 2; }, card: 'yusu' },
    { setup: (s) => { s.turnAttacks = 1; }, card: 'followUp' },
    { setup: (s) => { s.turnAttacks = 2; }, card: 'meteor' },
    { setup: (s) => { s.turnAttacks = 1; s.treasures.add('chainArt'); }, card: 'strike' },
  ];
  for (const { setup, card } of cases) {
    const s = createBattle({ enemyId: 'dummy', seed: 4, luck: false });
    startPlayerTurn(s);
    setup(s);
    s.hand = [{ uid: 900, id: card, upgraded: false }];
    const c = cardStats(s.hand[0]);
    const preview = cardPreviewDamage(s, c);
    const hp = s.enemy.hp;
    s.player.energy = 9;
    playCard(s, 900);
    const hits = (c.hits ?? 1) + (c.comboHits && s.turnAttacks > 1 ? c.comboHits : 0);
    assert.equal(hp - s.enemy.hp, preview * hits, card);
  }
});
