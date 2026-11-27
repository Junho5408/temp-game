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
