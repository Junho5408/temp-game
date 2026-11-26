import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createMeta, parseMeta, serializeMeta, memorySlots, memoryCandidates, rememberCard,
  startNewRun, recordRunEnd, validateLoadout, addClue,
} from '../src/core/meta.js';
import { createRun, addCard } from '../src/core/run.js';
import { ENEMIES } from '../src/core/enemies.js';
import { createBattle } from '../src/core/battle.js';

test('새 기록: 프롤로그 전, 회차 0, 기억 없음', () => {
  const m = createMeta();
  assert.equal(m.prologueDone, false);
  assert.equal(m.runs, 0);
  assert.deepEqual(m.memories, []);
});

test('저장 → 불러오기 그대로, 깨진 데이터는 새 기록', () => {
  const m = createMeta();
  m.runs = 4;
  rememberCard(m, 'flash');
  addClue(m, 'mask');
  const back = parseMeta(serializeMeta(m));
  assert.deepEqual(back, m);
  assert.deepEqual(parseMeta('{{망가짐'), createMeta());
  assert.deepEqual(parseMeta(JSON.stringify({ version: 999 })), createMeta());
});

test('없는 카드 id는 불러올 때 버림', () => {
  const m = createMeta();
  m.memories = ['flash', 'deletedCard'];
  assert.deepEqual(parseMeta(serializeMeta(m)).memories, ['flash']);
});

test('기억 슬롯: 1개에서 3회차마다 +1, 최대 3', () => {
  const m = createMeta();
  const slots = [];
  for (let i = 0; i <= 10; i++) { m.runs = i; slots.push(memorySlots(m)); }
  assert.deepEqual(slots, [1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3]);
});

test('기억 후보: 그 판에서 새로 얻은 무공만, 중복 없이', () => {
  const run = createRun({ seed: 1 });
  assert.deepEqual(memoryCandidates(run), []);
  addCard(run, 'flash');
  addCard(run, 'flash');
  addCard(run, 'rend');
  assert.deepEqual(memoryCandidates(run), ['flash', 'rend']);
});

test('기본 카드는 기억할 수 없고, 같은 무공은 한 번만', () => {
  const m = createMeta();
  assert.equal(rememberCard(m, 'strike'), false);
  rememberCard(m, 'flash');
  rememberCard(m, 'flash');
  assert.deepEqual(m.memories, ['flash']);
});

test('기억한 무공을 들고 새 판 시작', () => {
  const run = createRun({ seed: 2, extraCards: ['flash', 'whirl'] });
  assert.equal(run.deck.length, 12);
  assert.ok(run.deck.some((c) => c.id === 'flash'));
});

test('들고 갈 기억 검사: 슬롯 초과·기억 안 한 무공·중복은 불가', () => {
  const m = createMeta();
  rememberCard(m, 'flash');
  rememberCard(m, 'rend');
  assert.ok(validateLoadout(m, ['flash']));
  assert.equal(validateLoadout(m, ['flash', 'rend']), false); // 슬롯 1개
  assert.equal(validateLoadout(m, ['whirl']), false);
  m.runs = 3;
  assert.ok(validateLoadout(m, ['flash', 'rend']));
  assert.equal(validateLoadout(m, ['flash', 'flash']), false);
});

test('판 결과 기록: 죽음 수, 최고 층, 1구역 돌파 수', () => {
  const m = createMeta();
  startNewRun(m);
  const run = createRun({ seed: 3 });
  run.position = '7-1';
  run.phase = 'defeat';
  recordRunEnd(m, run);
  assert.equal(m.deaths, 1);
  assert.equal(m.bestFloor, 8);
  run.zonesCleared = 3;
  run.zone = 3;
  run.phase = 'victory';
  recordRunEnd(m, run);
  assert.equal(m.clears.zone1, 1);
  assert.equal(m.clears.zone3, 1);
  assert.equal(m.clears.final, 1);
});

test('프롤로그 적은 지도에 나오지 않고 전투는 정상 동작', () => {
  for (const id of ['drunkThug', 'bloodShadow']) {
    assert.equal(ENEMIES[id].tier, 'tutorial');
    const b = createBattle({ enemyId: id, seed: 1 });
    assert.ok(b.enemy.hp > 0);
  }
});

test('이야기 인물 만난 횟수는 회차를 넘어 누적되고 저장됨', async () => {
  const { meetNpc } = await import('../src/core/meta.js');
  const meta = createMeta();
  assert.equal(meetNpc(meta, 'juno'), 1);
  assert.equal(meetNpc(meta, 'juno'), 2);
  const back = parseMeta(serializeMeta(meta));
  assert.equal(back.met.juno, 2);
  assert.deepEqual(parseMeta(JSON.stringify({ ...createMeta(), met: undefined })).met, {});
});
