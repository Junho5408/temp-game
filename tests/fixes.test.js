// QA 티켓 수정 확인 (qa-20261126-0921)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createMeta, parseMeta, serializeMeta, memorySlots, validateLoadout, startNewRun,
  setPendingMemory, resolvePendingMemory,
} from '../src/core/meta.js';
import {
  createRun, serializeRun, parseRun, startEncounter, finishBattle, meetEventNpc,
} from '../src/core/run.js';

// BUG-003: 회차는 판을 시작할 때만 오르고, 선택 화면은 "이번 판" 기준 슬롯을 미리 봄
test('BUG-003: 선택 화면의 슬롯 미리보기 = 판 시작 후 슬롯', () => {
  const meta = createMeta();
  meta.runs = 2;
  const preview = memorySlots(meta, 1);
  const ok = validateLoadout({ ...meta, memories: ['flash', 'quick'] }, ['flash', 'quick'], 1);
  startNewRun(meta);
  assert.equal(memorySlots(meta), preview);
  assert.equal(preview, 2);
  assert.ok(ok);
  assert.equal(meta.runs, 3);
});

// BUG-002: 쓰러진 뒤 고를 후보가 저장에 남아 있다가, 고르면 기억으로
test('BUG-002: 기억 고르기 대기는 저장되고, 고르면 기억으로 옮겨짐', () => {
  const meta = createMeta();
  setPendingMemory(meta, ['flash', 'quick', 'strike', 'nope']);
  const back = parseMeta(serializeMeta(meta));
  assert.deepEqual(back.pendingMemory, ['flash', 'quick']); // 시작 덱·모르는 카드 제외
  resolvePendingMemory(back, 'quick');
  assert.deepEqual(back.memories, ['quick']);
  assert.equal(back.pendingMemory, null);
  const m2 = createMeta();
  setPendingMemory(m2, []);
  assert.equal(m2.pendingMemory, null); // 고를 게 없으면 대기도 없음
  setPendingMemory(m2, ['flash']);
  resolvePendingMemory(m2, null); // 안 고르고 넘김
  assert.deepEqual(m2.memories, []);
  assert.equal(m2.pendingMemory, null);
});

// BUG-001: 이긴 전투는 finishBattle 직후 저장하면 보상 단계 + 단서가 남음
test('BUG-001: 승리 확정 후 저장하면 전투 단계가 아니고 단서가 들어 있음', () => {
  const run = createRun({ seed: 31 });
  run.encounter = { enemyId: 'masked', tier: 'elite', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  const back = parseRun(serializeRun(run));
  assert.notEqual(back.phase, 'battle');
  assert.ok(back.cluesFound.includes('mask'));
});

// BUG-005: 같은 만남은 한 번만 셈 (저장했다 다시 불러도)
test('BUG-005: 이야기 인물 만남은 판 저장과 함께 한 번만 셈', () => {
  const meta = createMeta();
  const run = createRun({ seed: 32 });
  run.phase = 'event';
  run.event = { id: 'juno', result: null };
  assert.equal(meetEventNpc(run, meta), 1);
  assert.equal(meetEventNpc(run, meta), 1);
  const back = parseRun(serializeRun(run));
  assert.equal(meetEventNpc(back, meta), 1);
  assert.equal(meta.met.juno, 1);
});

// BUG-004: 깨진 판 저장은 걸러지고, 모르는 물품·보물은 버려짐
test('BUG-004: 깨진 판 저장 거르기', () => {
  const good = createRun({ seed: 33 });
  const save = (patch) => JSON.stringify({ ...JSON.parse(serializeRun(good)), ...patch });
  assert.ok(parseRun(serializeRun(good)));
  const lenient = parseRun(save({ bag: ['nope', 'geumchang'], treasures: ['nope', 'taiji'] }));
  assert.deepEqual(lenient.bag, ['geumchang']);
  assert.deepEqual(lenient.treasures, ['taiji']);
  const noClues = JSON.parse(serializeRun(good));
  delete noClues.cluesFound;
  assert.deepEqual(parseRun(JSON.stringify(noClues)).cluesFound, []);
  assert.equal(parseRun(save({ phase: 'battle', encounter: null })), null);
  assert.equal(parseRun(save({ phase: 'battle', encounter: { enemyId: 'nope' } })), null);
  assert.equal(parseRun(save({ phase: 'event', event: { id: 'nope' } })), null);
  assert.equal(parseRun(save({ phase: 'reward', reward: null })), null);
  assert.equal(parseRun(save({ phase: 'treasure', treasureChoice: null })), null);
  assert.equal(parseRun(save({ phase: 'shop', shop: null })), null);
  assert.equal(parseRun(save({ phase: 'weird' })), null);
  assert.equal(parseRun(save({ zone: 9 })), null);
  assert.equal(parseRun(save({ zone: 1.5 })), null);
  assert.equal(parseRun(save({ hp: 'x' })), null);
  assert.equal(parseRun(save({ gold: -5 })), null);
  assert.equal(parseRun(save({ map: {} })), null);
  assert.equal(parseRun('{"v":1,"deck":[],"map":{}}'), null);
});

test('BUG-004: 회귀 기록의 이상한 값은 기본값으로', () => {
  const m = parseMeta(JSON.stringify({
    version: 1, prologueDone: true, runs: 'abc', deaths: -1, bestFloor: 2.5, clues: null,
    memories: 'x', met: { juno: 'x', sooha: 2 }, clears: { zone1: 'y', final: 1 },
  }));
  assert.equal(m.runs, 0);
  assert.equal(m.deaths, 0);
  assert.equal(m.bestFloor, 0);
  assert.deepEqual(m.clues, []);
  assert.deepEqual(m.memories, []);
  assert.deepEqual(m.met, { sooha: 2 });
  assert.equal(m.clears.zone1, 0);
  assert.equal(m.clears.final, 1);
  assert.equal(memorySlots(m), 1);
  assert.equal(validateLoadout({ ...m, memories: ['a', 'b', 'c'] }, ['a', 'b', 'c']), false);
  assert.equal(memorySlots({ runs: NaN }), 1);
});
