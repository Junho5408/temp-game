import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateMap, ROWS, allNodes } from '../src/core/map.js';
import {
  createRun, availableNodes, enterNode, startEncounter, finishBattle, chooseReward,
  restHeal, restUpgrade, buyCard, removeCard, leaveShop, chooseEventOption, leaveEvent, chooseTreasure,
  advanceZone, serializeRun, parseRun,
  START_GOLD,
} from '../src/core/run.js';
import {
  startPlayerTurn, playCard, endPlayerTurn, runEnemyTurn, intentPreview,
} from '../src/core/battle.js';
import { cardStats } from '../src/core/cards.js';
import { EVENTS } from '../src/core/events.js';

// ── 지도 ─────────────────────────
test('지도 규칙: 층 구성, 막힌 칸 없음, 필수 칸 존재 (여러 시드)', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const map = generateMap(seed);
    assert.equal(map.rows.length, ROWS + 1);
    assert.ok(map.rows[0].every((n) => n.type === 'battle'), '0층은 전투');
    assert.ok(map.rows[ROWS - 1].every((n) => n.type === 'rest'), '두목 앞은 운기조식');
    assert.ok(map.rows[5].every((n) => n.type === 'rest'), '중간(5층)은 운기조식');
    const half = (rows, type) => rows.some((r) => map.rows[r].some((n) => n.type === type));
    assert.ok(half([1, 2, 3, 4], 'shop') && half([6, 7, 8, 9, 10], 'shop'), `seed ${seed}: 앞뒤 객잔`);
    assert.ok(half([3, 4], 'elite') && half([6, 7, 8, 9, 10], 'elite'), `seed ${seed}: 앞뒤 고수`);
    assert.equal(map.rows[ROWS][0].type, 'boss');
    const nodes = allNodes(map);
    assert.ok(nodes.some((n) => n.type === 'shop'), `seed ${seed}: 객잔 없음`);
    assert.ok(nodes.some((n) => n.type === 'elite'), `seed ${seed}: 고수 없음`);
    assert.ok([1, 2].every((r) => map.rows[r].every((n) => n.type !== 'elite')), '고수는 3층부터');
    for (let r = 0; r < ROWS; r++) {
      for (const n of map.rows[r]) assert.ok(n.next.length > 0, `seed ${seed}: ${n.id} 나가는 길 없음`);
    }
    for (let r = 1; r <= ROWS; r++) {
      for (const n of map.rows[r]) {
        assert.ok(map.rows[r - 1].some((p) => p.next.includes(n.id)), `seed ${seed}: ${n.id} 들어오는 길 없음`);
      }
    }
  }
});

test('같은 시드면 같은 지도', () => {
  assert.deepEqual(generateMap(42), generateMap(42));
});

// ── 진행 ─────────────────────────
test('새 판: 시작 덱 10장, 은자, 첫 층에서 출발', () => {
  const run = createRun({ seed: 3 });
  assert.equal(run.deck.length, 10);
  assert.equal(run.gold, START_GOLD);
  assert.deepEqual(availableNodes(run).map((n) => n.row), [0, 0, 0]);
});

test('갈 수 없는 칸은 선택 불가, 이동 후에는 연결된 칸만', () => {
  const run = createRun({ seed: 3 });
  assert.equal(enterNode(run, '2-0'), false);
  const first = availableNodes(run)[0];
  assert.ok(enterNode(run, first.id));
  assert.equal(run.phase, 'battle');
  assert.deepEqual(availableNodes(run), []); // 전투 중에는 이동 불가
});

function autoBattle(battle) {
  startPlayerTurn(battle);
  let guard = 0;
  while (battle.phase === 'player' && guard++ < 200) {
    const attacking = intentPreview(battle).damage > 0;
    let played = true;
    while (played && battle.phase === 'player') {
      played = false;
      const order = [...battle.hand].sort((a, b) => score(b, attacking) - score(a, attacking));
      for (const c of order) {
        if (playCard(battle, c.uid)) { played = true; break; }
      }
    }
    if (battle.phase !== 'player') break;
    endPlayerTurn(battle);
    runEnemyTurn(battle);
  }
}

function score(card, attacking) {
  const c = cardStats(card);
  const v = (c.damage ?? 0) * (c.hits ?? 1) + (c.strength ?? 0) * 6 + (c.draw ?? 0) * 3 + (c.energy ?? 0) * 8
    + (c.weak ?? 0) * (attacking ? 4 : 1.5) + (c.vulnerable ?? 0) * 3
    + (c.evasion ?? 0) * (attacking ? 3 : 0.5) + (c.point ?? 0) * 0.7 + (c.insight ?? 0) * 6;
  return v / Math.max(1, c.cost);
}

test('전투 승리 → 은자와 비급 3장 보상 → 고르면 덱에 추가', () => {
  const run = createRun({ seed: 5 });
  enterNode(run, availableNodes(run)[0].id);
  const battle = startEncounter(run);
  autoBattle(battle);
  assert.equal(battle.phase, 'won');
  const goldBefore = run.gold;
  finishBattle(run, battle);
  assert.equal(run.phase, 'reward');
  assert.ok(run.gold > goldBefore);
  assert.equal(run.reward.cards.length, 3);
  assert.equal(new Set(run.reward.cards).size, 3);
  chooseReward(run, 0);
  assert.equal(run.deck.length, 11);
  assert.equal(run.phase, 'map');
  assert.equal(run.hp, battle.player.hp); // 체력 유지
});

test('보상 건너뛰기', () => {
  const run = createRun({ seed: 5 });
  enterNode(run, availableNodes(run)[0].id);
  const battle = startEncounter(run);
  autoBattle(battle);
  finishBattle(run, battle);
  chooseReward(run, null);
  assert.equal(run.deck.length, 10);
});

test('운기조식: 회복(최대 체력 30%) 또는 연마', () => {
  const run = createRun({ seed: 1 });
  run.phase = 'rest';
  run.hp = 20;
  assert.equal(restHeal(run), 21); // 최대 체력 70의 30%
  assert.equal(run.phase, 'map');
  run.phase = 'rest';
  const card = run.deck[0];
  assert.ok(restUpgrade(run, card.uid));
  assert.equal(card.upgraded, true);
  run.phase = 'rest';
  assert.equal(restUpgrade(run, card.uid), false); // 이미 연마됨
});

function forceShop(run) {
  run.phase = 'map';
  run.position = null;
  // 객잔 칸이 나올 때까지 지도 직접 조작 대신, 객잔 생성 경로를 그대로 쓰려고 칸 타입을 바꿈
  const node = availableNodes(run)[0];
  node.type = 'shop';
  enterNode(run, node.id);
}

test('객잔: 은자가 있으면 구매, 부족하면 실패, 제거는 한 번만 + 비용 증가', () => {
  const run = createRun({ seed: 9 });
  forceShop(run);
  assert.equal(run.phase, 'shop');
  assert.equal(run.shop.items.length, 8); // 무공 5 + 행낭 물품 2 + 보물 1
  assert.deepEqual(run.shop.items.map((it) => it.kind), ['card', 'card', 'card', 'card', 'card', 'item', 'item', 'treasure']);
  run.gold = 1000;
  assert.ok(buyCard(run, 0));
  assert.equal(buyCard(run, 0), false); // 이미 팔림
  assert.equal(run.deck.length, 11);
  const cost = run.removeCost;
  assert.ok(removeCard(run, run.deck[0].uid));
  assert.equal(run.deck.length, 10);
  assert.equal(run.removeCost, cost + 25);
  assert.equal(removeCard(run, run.deck[0].uid), false);
  run.gold = 0;
  assert.equal(buyCard(run, 1), false);
  assert.ok(leaveShop(run));
  assert.equal(run.phase, 'map');
});

test('기연: 모든 선택지가 오류 없이 결과를 돌려줌', () => {
  for (const [id, ev] of Object.entries(EVENTS)) {
    ev.options.forEach((_, i) => {
      const run = createRun({ seed: 11 + i });
      run.gold = 100;
      run.phase = 'event';
      run.event = { id, result: null };
      const text = chooseEventOption(run, i);
      assert.ok(typeof text === 'string' && text.length > 0, `${id}/${i}`);
      assert.ok(run.hp >= 1);
      assert.ok(leaveEvent(run));
    });
  }
});

test('기연: 은자가 부족하면 해당 선택지 불가', () => {
  const run = createRun({ seed: 2 });
  run.gold = 0;
  run.phase = 'event';
  run.event = { id: 'herbSeller', result: null };
  assert.equal(chooseEventOption(run, 0), null);
});

// ── 한 판 전체 자동 진행 (밸런스 확인) ─────────────────────────
function autoRun(seed) {
  const run = createRun({ seed });
  let steps = 0;
  while (!['victory', 'defeat'].includes(run.phase) && steps++ < 400) {
    if (run.phase === 'zoneClear') { advanceZone(run); continue; }
    if (run.phase === 'map') {
      const opts = availableNodes(run);
      // 단순한 선택: 체력이 낮으면 휴식/객잔 쪽, 아니면 아무거나
      const pref = run.hp < run.maxHp * 0.45 ? ['rest', 'shop', 'event', 'battle', 'elite', 'boss'] : ['battle', 'event', 'elite', 'shop', 'rest', 'boss'];
      opts.sort((a, b) => pref.indexOf(a.type) - pref.indexOf(b.type));
      enterNode(run, opts[0].id);
    } else if (run.phase === 'battle') {
      const b = startEncounter(run);
      autoBattle(b);
      finishBattle(run, b);
    } else if (run.phase === 'treasure') {
      chooseTreasure(run, 0);
    } else if (run.phase === 'reward') {
      chooseReward(run, 0);
    } else if (run.phase === 'rest') {
      const up = run.deck.find((c) => !c.upgraded);
      if (run.hp < run.maxHp * 0.75 || !up) restHeal(run);
      else restUpgrade(run, up.uid);
    } else if (run.phase === 'shop') {
      const i = run.shop.items.findIndex((it) => it.price <= run.gold);
      if (i >= 0) buyCard(run, i);
      leaveShop(run);
    } else if (run.phase === 'event') {
      const ev = EVENTS[run.event.id];
      const i = ev.options.findIndex((o) => !o.disabled?.(run));
      chooseEventOption(run, i);
      leaveEvent(run);
    }
  }
  return run;
}

test('자동 플레이로 한 판이 끝까지 진행됨 + 승률이 너무 높거나 낮지 않음', () => {
  let wins = 0;
  let zone1 = 0;
  let earlyDeaths = 0;
  const N = 80;
  for (let seed = 1; seed <= N; seed++) {
    const run = autoRun(seed);
    assert.ok(['victory', 'defeat'].includes(run.phase), `seed ${seed}: ${run.phase}에서 멈춤`);
    if (run.phase === 'victory') wins++;
    if (run.zonesCleared >= 1) zone1++;
    if (run.phase === 'defeat' && run.zone === 0 && Number(run.position.split('-')[0]) <= 3) earlyDeaths++;
  }
  const rate = zone1 / N;
  console.log(`  자동 플레이: 1구역 돌파 ${(rate * 100).toFixed(0)}%, 최종 결전 승리 ${wins}/${N}, 3층 이하에서 쓰러짐 ${earlyDeaths}판`);
  // 단순한 봇 기준 (사람은 이보다 잘함). 1구역 돌파율로 확인, 전체 돌파는 훨씬 드묾
  assert.ok(rate >= 0.12 && rate <= 0.6, `1구역 돌파율 ${rate}`);
  assert.ok(wins <= zone1, '최종 승리가 1구역 돌파보다 많을 수 없음');
  assert.ok(earlyDeaths <= N * 0.05, `초반에 너무 많이 쓰러짐: ${earlyDeaths}`);
});

// ── 3-C: 이야기 기연 · 단서 ─────────────────────────
test('이야기 기연: 첫 기연은 주노, 흰 옷의 사내는 6층(row 5)부터', () => {
  const run = createRun({ seed: 5 });
  run.seenEvents = ['juno'];
  run.map.rows[0][0].type = 'event'; // 1층: 흰 옷의 사내는 아직
  assert.ok(enterNode(run, run.map.rows[0][0].id));
  assert.ok(!EVENTS[run.event.id].story);

  const fresh = createRun({ seed: 5 });
  fresh.map.rows[0][0].type = 'event';
  assert.ok(enterNode(fresh, fresh.map.rows[0][0].id));
  assert.equal(fresh.event.id, 'juno');
});

test('이야기 기연은 한 판에 한 번, 이후에는 일반 기연만', () => {
  const run = createRun({ seed: 6 });
  run.seenEvents = ['juno', 'sooha'];
  run.map.rows[0][0].type = 'event';
  assert.ok(enterNode(run, run.map.rows[0][0].id));
  assert.ok(!EVENTS[run.event.id].story);
});

test('흰 옷의 사내를 쫓으면 단서 envoy', () => {
  const run = createRun({ seed: 7 });
  run.phase = 'event';
  run.event = { id: 'sooha', result: null };
  chooseEventOption(run, 0);
  assert.deepEqual(run.cluesFound, ['envoy']);
});

test('복면객 무명을 쓰러뜨리면 단서 mask', () => {
  const run = createRun({ seed: 8 });
  run.encounter = { enemyId: 'masked', tier: 'elite', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.deepEqual(run.cluesFound, ['mask']);
});

// ── 2-B: 여러 구역 · 최종 결전 · 판 저장 ─────────────────────────
test('두목을 이기면 보물(대환단 포함) → 무공 → 다음 구역 (잃은 체력 절반 회복)', () => {
  const run = createRun({ seed: 12 });
  run.encounter = { enemyId: 'spy', tier: 'boss', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  b.player.hp = 30;
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.equal(run.phase, 'treasure');
  assert.ok(run.treasureChoice.includes('daeHwan'));
  chooseTreasure(run, 0);
  assert.equal(run.phase, 'reward');
  chooseReward(run, 0);
  assert.equal(run.phase, 'zoneClear');
  assert.ok(advanceZone(run));
  assert.equal(run.zone, 1);
  assert.equal(run.phase, 'map');
  assert.equal(run.hp, 30 + Math.ceil((run.maxHp - 30) / 2));
  assert.equal(run.position, null);
});

test('2구역 지도에는 2구역 적이 나옴', () => {
  const run = createRun({ seed: 13 });
  run.zone = 1;
  run.map.rows[0][0].type = 'battle';
  enterNode(run, run.map.rows[0][0].id);
  assert.ok(['bandit', 'blackWind'].includes(run.encounter.enemyId));
});

test('3구역 두목 뒤에는 최종 결전 (귀면), 이기면 승리', () => {
  const run = createRun({ seed: 14 });
  run.zone = 2;
  run.phase = 'zoneClear';
  run.pendingAdvance = true;
  assert.ok(advanceZone(run));
  assert.equal(run.phase, 'battle');
  assert.equal(run.encounter.enemyId, 'gwimyeon');
  const b = startEncounter(run);
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.equal(run.phase, 'victory');
  assert.ok(run.cluesFound.includes('sender'));
});

test('판 저장 → 불러오기: 상태와 난수 흐름이 그대로 이어짐', () => {
  const a = createRun({ seed: 21, extraCards: ['flash'] });
  enterNode(a, availableNodes(a)[0].id);
  a.gold = 77;
  const text = serializeRun(a);
  const b = parseRun(text);
  assert.ok(b);
  assert.equal(b.gold, 77);
  assert.deepEqual(b.deck, a.deck);
  assert.equal(b.position, a.position);
  assert.equal(b.rng(), a.rng()); // 같은 다음 난수
  assert.equal(parseRun('망가진 저장'), null);
  assert.equal(parseRun(JSON.stringify({ v: 999 })), null);
});
