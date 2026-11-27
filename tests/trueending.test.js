// 6-D: 진엔딩 — 세 길의 핵심 단서 → 귀면 뒤 백리현 → 진엔딩 기록
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRUE_CLUES, hasTrueClues } from '../src/core/routes.js';
import { ENEMIES, TRUE_BOSS } from '../src/core/enemies.js';
import { createMeta, parseMeta, serializeMeta, recordRunEnd } from '../src/core/meta.js';
import {
  createRun, startEncounter, finishBattle, advanceZone, serializeRun, parseRun, TRUE_BOSS_HEAL,
} from '../src/core/run.js';
import { CLUES, battleIntro, battleOutro } from '../src/story/script.js';

const ALL = Object.values(TRUE_CLUES);

// 마지막 구역을 막 돌파한 판
function lastZoneRun(seed = 3) {
  const run = createRun({ seed });
  run.zone = 2;
  run.zonesCleared = 3;
  run.phase = 'zoneClear';
  return run;
}

function winBattle(run) {
  const b = startEncounter(run);
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  return b;
}

test('진엔딩 단서는 세 세력에서 하나씩, 모두 실제 단서', () => {
  assert.deepEqual(Object.keys(TRUE_CLUES).sort(), ['demonic', 'orthodox', 'unorthodox']);
  for (const id of ALL) assert.ok(CLUES[id], id);
  assert.equal(hasTrueClues(ALL.slice(0, 2)), false);
  assert.ok(hasTrueClues(['mask', ...ALL]));
});

test('단서가 모자라면 귀면을 쓰러뜨리는 것으로 끝 (일반 엔딩)', () => {
  const meta = createMeta();
  meta.clues = ALL.slice(0, 2);
  const run = lastZoneRun();
  advanceZone(run, meta);
  assert.equal(run.trueEnding, false);
  winBattle(run);
  assert.equal(run.phase, 'victory');
  assert.equal(run.trueWin, false);
  recordRunEnd(meta, run);
  assert.equal(meta.clears.final, 1);
  assert.equal(meta.clears.trueEnd, 0);
});

test('단서를 모두 모았으면 귀면 뒤에 백리현이 나오고, 이기면 진엔딩', () => {
  const meta = createMeta();
  meta.clues = [...ALL];
  const run = lastZoneRun();
  advanceZone(run, meta);
  assert.equal(run.trueEnding, true);
  assert.equal(run.encounter.enemyId, 'gwimyeon');
  run.hp = 20;
  winBattle(run);
  // 연전: 잃은 체력의 일부(TRUE_BOSS_HEAL) 회복 후 백리현
  assert.equal(run.phase, 'battle');
  assert.equal(run.encounter.enemyId, TRUE_BOSS);
  assert.ok(run.encounter.final);
  assert.equal(run.hp, 20 + Math.ceil((run.maxHp - 20) * TRUE_BOSS_HEAL));
  // 연전 중 저장·불러오기
  const back = parseRun(serializeRun(run));
  assert.equal(back.trueEnding, true);
  assert.equal(back.encounter.enemyId, TRUE_BOSS);
  const b = winBattle(back);
  assert.equal(b.enemy.name, '백리현');
  assert.equal(back.phase, 'victory');
  assert.equal(back.trueWin, true);
  assert.ok(back.cluesFound.includes('traitorName'));
  recordRunEnd(meta, back);
  const saved = parseMeta(serializeMeta(meta));
  assert.equal(saved.clears.final, 1);
  assert.equal(saved.clears.trueEnd, 1);
});

test('meta 없이 넘어가면 (옛 호출) 일반 판', () => {
  const run = lastZoneRun();
  advanceZone(run);
  assert.equal(run.trueEnding, false);
});

test('백리현: 두목 그림·2단계·대사가 있음', () => {
  const e = ENEMIES[TRUE_BOSS];
  assert.equal(e.tier, 'boss');
  assert.equal(e.art, 'boss-baekri');
  assert.ok(e.phase2);
  assert.ok(CLUES[e.clue]);
  assert.ok(battleIntro(TRUE_BOSS, new Set())?.length);
  assert.ok(battleOutro(TRUE_BOSS, new Set())?.length);
});

test('옛 기록에 trueEnd 가 없어도 0 으로', () => {
  const old = JSON.parse(serializeMeta(createMeta()));
  delete old.clears.trueEnd;
  assert.equal(parseMeta(JSON.stringify(old)).clears.trueEnd, 0);
});
