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

test('회귀 직후 대사: 직전에 죽인 적, 일반 엔딩 뒤, 진상 조각을 다 모았을 때', async () => {
  const { wakeLines, CLUES } = await import('../src/story/script.js');
  const text = (ls) => ls.map((l) => l.text).join('\n');
  assert.match(text(wakeLines(5, { lastDeath: 'gangLordD', clues: [], clears: {} })), /곰방대/);
  assert.match(text(wakeLines(5, { lastDeath: null, clues: [], clears: { final: 1 } })), /…아니, 아직이다\./);
  assert.match(text(wakeLines(5, { lastDeath: 'spy', clues: ['traitor', 'payer', 'request'], clears: {} })), /이번 생에서 끝낸다/);
  assert.ok(wakeLines(1, {}).length > 0 && wakeLines(2).length > 0);
  assert.ok(CLUES.wine);
});

test('미래를 아는 자의 선택지: 필요한 단서는 모두 실제 단서, 주노에게 물으면 백일취 단서', () => {
  return import('../src/story/script.js').then(({ CLUES }) => {
    for (const [id, ev] of Object.entries(EVENTS)) {
      for (const o of ev.options) if (o.needClue) assert.ok(CLUES[o.needClue], `${id}: ${o.needClue}`);
    }
    const run = createRun({ seed: 4, knownClues: ['note'] });
    run.phase = 'event';
    run.event = { id: 'juno' };
    const i = EVENTS.juno.options.findIndex((o) => o.needClue === 'note');
    assert.ok(chooseEventOption(run, i));
    assert.ok(run.cluesFound.includes('wine'));
  });
});

test('진엔딩: 백일취를 이미 알면 같은 설명을 다시 하지 않음', async () => {
  const { trueEndingLines } = await import('../src/story/script.js');
  const t = (c) => trueEndingLines(c).map((l) => l.text).join('\n');
  assert.match(t([]), /백일취\(百日醉\)\. 그날 밤/);
  assert.ok(!t(['wine']).includes('백일취(百日醉). 그날 밤'));
  assert.match(t(['wine']), /술이, 깼습니까/);
});
