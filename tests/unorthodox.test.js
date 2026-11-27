// 6-B: 사파 루트
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, cardPreviewDamage,
} from '../src/core/battle.js';
import { cardStats, CARDS } from '../src/core/cards.js';
import { ENEMIES } from '../src/core/enemies.js';
import { ROUTES } from '../src/core/routes.js';
import {
  createRun, enterNode, startEncounter, finishBattle, chooseEventOption, cardPool,
} from '../src/core/run.js';

function battle(opts = {}) {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false, ...opts });
  startPlayerTurn(s);
  return s;
}
const hand = (s, ids) => { s.hand = ids.map((id, i) => ({ uid: 900 + i, id, upgraded: false })); s.player.energy = 9; };

test('사파 검객 시작 덱: 정파와 겹치는 무공 없음 (기본 도법·칼등 치기·막베기·눈치 걸음, 8-B)', () => {
  const run = createRun({ seed: 1, faction: 'unorthodox' });
  const ids = run.deck.map((c) => c.id);
  assert.ok(ids.every((id) => CARDS[id].faction === 'unorthodox' && CARDS[id].cls === 'sword'));
  assert.equal(ids.filter((id) => id === 'uSaber').length, 5);
  assert.equal(run.deck.length, 10);
});

test('독 바른 칼: 맞으면 중독, 모래 뿌리기: 심법으로 흐트러짐', () => {
  const s = battle();
  hand(s, ['venomBlade', 'sandThrow']);
  playCard(s, 900);
  assert.equal(s.enemy.status.poison, 2);
  playCard(s, 901);
  assert.equal(s.enemy.status.weak, 1);
});

test('비열한 일격: 흐트러짐·중독·굳음이면 2배 (미리보기도 같게)', () => {
  const s = battle();
  hand(s, ['lowBlow', 'lowBlow']);
  const c = cardStats({ id: 'lowBlow' });
  assert.equal(cardPreviewDamage(s, c), 6);
  let hp = s.enemy.hp;
  playCard(s, 900);
  assert.equal(hp - s.enemy.hp, 6);
  s.enemy.status.poison = 1;
  assert.equal(cardPreviewDamage(s, c), 12);
  hp = s.enemy.hp;
  playCard(s, 901);
  assert.equal(hp - s.enemy.hp, 12);
});

test('협박: 전투가 끝나면 은자가 판에 더해짐, 흑도 인장은 이길 때 +8', () => {
  const run = createRun({ seed: 2, faction: 'unorthodox' });
  run.treasures.push('gangSeal');
  run.encounter = { enemyId: 'dummy', tier: 'normal', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  startPlayerTurn(b);
  hand(b, ['extort']);
  playCard(b, 900);
  assert.equal(b.goldGained, 12);
  const gold = run.gold;
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.equal(run.gold - gold - run.reward.gold, 12 + 8);
});

test('독낭: 적에게 거는 중독 +1 (BUG-036)', () => {
  const s = battle({ treasures: ['poisonSac'] });
  hand(s, ['venomBlade']);
  playCard(s, 900);
  assert.equal(s.enemy.status.poison, 3);
});

test('사파 무공·보물은 정파 판에 나오지 않음', () => {
  const sapa = Object.values(CARDS).filter((c) => c.faction === 'unorthodox').map((c) => c.id);
  assert.ok(sapa.length >= 16);
  for (const r of ['common', 'uncommon', 'rare']) {
    assert.ok(cardPool(createRun({ seed: 1 }), r).every((id) => !sapa.includes(id)));
  }
});

test('사파 루트: 구역마다 사파용 적이 나오고, 열려 있음', () => {
  assert.ok(ROUTES.unorthodox.ready);
  const run = createRun({ seed: 3, faction: 'unorthodox' });
  run.map.rows[0][0].type = 'boss';
  enterNode(run, run.map.rows[0][0].id);
  assert.equal(run.encounter.enemyId, 'gangLord');
  run.zone = 2;
  run.phase = 'map';
  run.position = null;
  run.map.rows[0][0].type = 'boss';
  enterNode(run, run.map.rows[0][0].id);
  assert.equal(run.encounter.enemyId, 'allianceElder');
  assert.equal(ENEMIES.allianceElder.clue, 'payer');
});

test('사파 단서: 객잔 주인(기연), 돈을 준 쪽(무림맹 장로)', () => {
  const run = createRun({ seed: 4, faction: 'unorthodox' });
  run.phase = 'event';
  run.event = { id: 'innkeeperDebt', result: null };
  chooseEventOption(run, 1);
  assert.ok(run.cluesFound.includes('innkeeper'));
  run.encounter = { enemyId: 'allianceElder', tier: 'boss', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.ok(run.cluesFound.includes('payer'));
});

test('사파 이야기 기연은 사파 판에서만', async () => {
  const { EVENTS } = await import('../src/core/events.js');
  const run = createRun({ seed: 5 }); // 정파
  run.seenEvents = ['juno'];
  run.map.rows[3][0].type = 'event';
  run.position = run.map.rows[2][0].id;
  run.map.rows[2][0].next = [run.map.rows[3][0].id];
  enterNode(run, run.map.rows[3][0].id);
  assert.notEqual(run.event.id, 'innkeeperDebt');
  assert.equal(EVENTS.innkeeperDebt.route, 'unorthodox');
});
