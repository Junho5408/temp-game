// 회귀물 개편: 미래를 아는 자의 선택지(needClue), 마지막 죽음 기록
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, serializeRun, parseRun, chooseEventOption, optionKnown } from '../src/core/run.js';
import { createMeta, parseMeta, serializeMeta, recordRunEnd } from '../src/core/meta.js';
import { EVENTS } from '../src/core/events.js';

test('needClue 선택지는 회귀 기록이 그 단서를 알 때만 고를 수 있음', () => {
  EVENTS.__t = { title: 't', text: 't', options: [{ label: 'a', hint: '', effect: () => 'a' }, { label: 'b', hint: '', needClue: 'mask', effect: () => 'b' }] };
  try {
    const a = createRun({ seed: 1 });
    a.phase = 'event'; a.event = { id: '__t' };
    assert.equal(optionKnown(a, EVENTS.__t.options[1]), false);
    assert.equal(chooseEventOption(a, 1), null);
    const b = createRun({ seed: 1, knownClues: ['mask'] });
    b.phase = 'event'; b.event = { id: '__t' };
    assert.equal(chooseEventOption(b, 1), 'b');
    assert.deepEqual(parseRun(serializeRun(b)).knownClues, ['mask']);
  } finally {
    delete EVENTS.__t;
  }
});

test('쓰러지면 나를 죽인 적을 회귀 기록에 남기고, 그날 밤을 넘기면 지움', () => {
  const meta = createMeta();
  const run = createRun({ seed: 2 });
  run.phase = 'defeat';
  run.encounter = { enemyId: 'spy', tier: 'boss' };
  recordRunEnd(meta, run);
  assert.equal(parseMeta(serializeMeta(meta)).lastDeath, 'spy');
  const win = createRun({ seed: 3 });
  win.phase = 'victory';
  recordRunEnd(meta, win);
  assert.equal(meta.lastDeath, null);
});
