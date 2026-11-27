// 6-A: 세력 루트 공통 구조
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROUTES, isFactionOpen } from '../src/core/routes.js';
import {
  createMeta, parseMeta, serializeMeta, recordRunEnd,
} from '../src/core/meta.js';
import {
  createRun, serializeRun, parseRun, startEncounter, finishBattle, restHealAmount, START_GOLD, cardPool,
} from '../src/core/run.js';
import { CARDS } from '../src/core/cards.js';

test('세력 해금: 정파는 처음부터, 사파는 1구역 돌파, 마교는 2구역 돌파 (내용이 준비된 루트만)', () => {
  const meta = createMeta();
  assert.ok(isFactionOpen(meta, 'orthodox'));
  const ready = { u: ROUTES.unorthodox.ready, d: ROUTES.demonic.ready };
  ROUTES.unorthodox.ready = true;
  ROUTES.demonic.ready = true;
  try {
    assert.equal(isFactionOpen(meta, 'unorthodox'), false);
    meta.clears.zone1 = 1;
    assert.ok(isFactionOpen(meta, 'unorthodox'));
    assert.equal(isFactionOpen(meta, 'demonic'), false);
    meta.clears.zone2 = 1;
    assert.ok(isFactionOpen(meta, 'demonic'));
  } finally {
    ROUTES.unorthodox.ready = ready.u;
    ROUTES.demonic.ready = ready.d;
  }
});

test('사파 암수: 시작 은자 +40, 객잔 값 20% 할인', async () => {
  const a = createRun({ seed: 5 });
  const b = createRun({ seed: 5, faction: 'unorthodox' });
  assert.equal(a.gold, START_GOLD);
  assert.equal(b.gold, START_GOLD + 40);
  for (const r of [a, b]) {
    r.map.rows[0].forEach((n) => { n.type = 'shop'; });
  }
  // 같은 시드라 같은 진열 → 값만 비교
  const enter = (r) => {
    r.phase = 'map';
    r.position = null;
    return r.map.rows[0][0].id;
  };
  const { enterNode } = await import('../src/core/run.js');
  assert.ok(enterNode(a, enter(a)));
  assert.ok(enterNode(b, enter(b)));
  assert.equal(a.shop.items.length, b.shop.items.length);
  a.shop.items.forEach((it, i) => {
    assert.equal(b.shop.items[i].price, Math.max(1, Math.round(it.price * 0.8)));
  });
});

test('마교 혈공: 이길 때마다 체력 6 회복, 운기조식 회복 20%', () => {
  const run = createRun({ seed: 6, faction: 'demonic' });
  assert.equal(restHealAmount(run), Math.ceil(run.maxHp * 0.2));
  assert.equal(restHealAmount(createRun({ seed: 6 })), Math.ceil(70 * 0.3));
  run.encounter = { enemyId: 'dummy', tier: 'normal', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  b.player.hp = 40;
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.equal(run.hp, 46);
});

test('세력 고유 무공은 그 세력 판에서만 나옴', () => {
  CARDS.__testOnly = { id: '__testOnly', name: '시험', type: 'attack', rarity: 'common', faction: 'demonic', cls: 'sword', cost: 1, damage: 1 };
  try {
    assert.ok(!cardPool(createRun({ seed: 1 }), 'common').includes('__testOnly'));
    assert.ok(cardPool(createRun({ seed: 1, faction: 'demonic' }), 'common').includes('__testOnly'));
  } finally {
    delete CARDS.__testOnly;
  }
});

test('세력은 판 저장에 남고, 세력이 없던 옛 저장은 정파로', () => {
  const run = createRun({ seed: 7, faction: 'unorthodox' });
  assert.equal(parseRun(serializeRun(run)).faction, 'unorthodox');
  const old = JSON.parse(serializeRun(createRun({ seed: 7 })));
  delete old.faction;
  assert.equal(parseRun(JSON.stringify(old)).faction, 'orthodox');
});

test('세력별 기록 (판 수, 최고 구역, 그날 밤을 넘긴 수)', () => {
  const meta = createMeta();
  const run = createRun({ seed: 8, faction: 'unorthodox' });
  run.zonesCleared = 2;
  run.phase = 'defeat';
  run.position = '3-0';
  recordRunEnd(meta, run);
  const back = parseMeta(serializeMeta(meta));
  assert.deepEqual(back.routeStats.unorthodox, { runs: 1, bestZone: 2, wins: 0 });
  assert.equal(back.clears.zone2, 1);
});
