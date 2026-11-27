// QA qa-20261127-0536 티켓 수정 확인 (BUG-026 ~ 037)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, endPlayerTurn, takeEvents,
} from '../src/core/battle.js';

const hand = (s, ids) => { s.hand = ids.map((id, i) => ({ uid: 900 + i, id, upgraded: false })); };

test('BUG-026: 암기로 이긴 턴 종료 뒤에는 입마가 체력·마기를 바꾸지 않음', () => {
  const s = createBattle({ enemyId: 'dummy', deck: ['flyingKnife'], luck: false, faction: 'demonic', playerHp: 30 });
  startPlayerTurn(s);
  hand(s, ['flyingKnife', 'qiDeviation', 'qiDeviation', 'qiDeviation']);
  s.enemy.hp = 3;
  takeEvents(s);
  endPlayerTurn(s);
  assert.equal(s.phase, 'won');
  assert.equal(s.player.hp, 30);
  assert.equal(s.player.magi, 0);
  const ev = takeEvents(s);
  const after = ev.slice(ev.findIndex((e) => e.type === 'won') + 1);
  assert.ok(!after.some((e) => (e.type === 'damage' && e.target === 'player') || e.type === 'magi'));
});

test('BUG-026: 입마가 암기보다 앞에 있어도 (지는 중이 아니면) 대가는 치름', () => {
  const s = createBattle({ enemyId: 'dummy', deck: ['flyingKnife'], luck: false, faction: 'demonic', playerHp: 30 });
  startPlayerTurn(s);
  hand(s, ['qiDeviation', 'flyingKnife']);
  endPlayerTurn(s);
  assert.equal(s.player.hp, 28);
  assert.equal(s.player.magi, 1);
});

test('BUG-028: 지도 제목은 세력·구역 이름, 안내의 두목도 세력마다', async () => {
  const { mapHeader, zoneName } = await import('../src/story/script.js');
  for (const f of ['orthodox', 'unorthodox', 'demonic']) {
    for (const z of [0, 1, 2, 3]) assert.equal(mapHeader(f, z).title, zoneName(f, z));
  }
  assert.match(mapHeader('unorthodox', 0).hint, /흑도 맹주가 기다린다/);
  assert.ok(!mapHeader('demonic', 0).hint.includes('우승 후보'));
});

test('BUG-029: 말이 안 되는 판 저장은 고치거나 거름', async () => {
  const { createRun, serializeRun, parseRun } = await import('../src/core/run.js');
  const good = createRun({ seed: 4, faction: 'unorthodox' });
  const save = (patch) => JSON.stringify({ ...JSON.parse(serializeRun(good)), ...patch });
  assert.equal(parseRun(save({ hp: 0 })), null);
  assert.equal(parseRun(save({ hp: 999 })).hp, good.maxHp);
  assert.equal(parseRun(save({ position: '99-9' })), null);
  assert.ok(parseRun(save({ position: good.map.rows[0][0].id })));
  assert.equal(parseRun(save({ phase: 'shop', shop: { items: [{ kind: 'card', id: 'nope', price: 5 }] } })), null);
  assert.equal(parseRun(save({ phase: 'shop', shop: { items: [null] } })), null);
  assert.equal(parseRun(save({ phase: 'battle', encounter: { enemyId: 'dummy', tier: 'normal', scale: null } })), null);
  assert.ok(parseRun(save({ phase: 'battle', encounter: { enemyId: 'dummy', tier: 'normal', scale: { hp: 1, strength: 0 } } })));
});

test('BUG-030: 백리현 등장 장면 표시가 판 저장에 남고, 보지 못한 엔딩은 회귀 기록에 남음', async () => {
  const { createRun, serializeRun, parseRun, startEncounter, finishBattle, advanceZone } = await import('../src/core/run.js');
  const { createMeta, parseMeta, serializeMeta, recordRunEnd, clearPendingEnding } = await import('../src/core/meta.js');
  const meta = createMeta();
  meta.clues = ['traitor', 'payer', 'request'];
  const run = createRun({ seed: 3 });
  run.zone = 2;
  run.zonesCleared = 3;
  run.phase = 'zoneClear';
  advanceZone(run, meta);
  const win = (r) => { const b = startEncounter(r); b.enemy.hp = 0; b.phase = 'won'; finishBattle(r, b); };
  win(run);
  const back = parseRun(serializeRun(run));
  assert.equal(back.encounter.enemyId, 'baekri');
  assert.equal(back.encounter.bridge, true);
  win(back);
  recordRunEnd(meta, back);
  const saved = parseMeta(serializeMeta(meta));
  assert.equal(saved.pendingEnding.kind, 'true');
  assert.ok(saved.pendingEnding.floor > 0);
  clearPendingEnding(saved);
  assert.equal(parseMeta(serializeMeta(saved)).pendingEnding, null);
});

test('BUG-032: 세력 길의 적 칭호에 다른 길의 장소가 나오지 않음', async () => {
  const { ENEMIES } = await import('../src/core/enemies.js');
  const { ROUTES } = await import('../src/core/routes.js');
  const titles = (f) => ROUTES[f].pools.flatMap((z) => Object.values(z).flat()).map((id) => ENEMIES[id].title);
  for (const f of ['unorthodox', 'demonic']) assert.ok(!titles(f).some((t) => t.includes('비무대')), f);
  assert.ok(!titles('demonic').includes('마교에 투항한 낭인'));
  assert.ok(!titles('demonic').includes('흑도 칼잡이'));
});
