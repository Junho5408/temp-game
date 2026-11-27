// qa-20261127-1430 티켓 (BUG-050~066) 규칙 확인
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, endPlayerTurn, runEnemyTurn, takeEvents, playCard, cardPreviewDamage,
} from '../src/core/battle.js';
import { CARDS, cardStats } from '../src/core/cards.js';
import { ENEMIES } from '../src/core/enemies.js';
import {
  createRun, chooseEventOption, serializeRun, parseRun, cardPool,
} from '../src/core/run.js';
import { EVENTS } from '../src/core/events.js';
import { FACTION_IDS, ROUTES } from '../src/core/routes.js';
import { CLASS_IDS } from '../src/core/schools.js';

test('BUG-050: 혈공 장로는 계열에 맞는 피의 무공을 줌', () => {
  for (const cls of CLASS_IDS) {
    const run = createRun({ seed: 1, faction: 'demonic', cls });
    run.phase = 'event';
    run.event = { id: 'cultElder', introDone: true };
    chooseEventOption(run, 0);
    const id = run.deck.at(-1).id;
    assert.equal(CARDS[id].faction, 'demonic');
    assert.equal(CARDS[id].cls, cls, `${cls}: ${id}`);
    assert.ok(run.event.result.includes(CARDS[id].name));
  }
});

test('BUG-050: 무공을 직접 주는 기연은 9개 길 모두 내 세력·계열 무공만', () => {
  const giving = Object.entries(EVENTS).filter(([, ev]) => ev.options.some((o) => String(o.effect).includes('addCard')));
  for (const f of FACTION_IDS) {
    for (const cls of Object.keys(ROUTES[f].classes)) {
      for (const [id, ev] of giving) {
        if ((ev.route ?? 'orthodox') !== f && ev.route) continue;
        ev.options.forEach((o, i) => {
          if (!String(o.effect).includes('addCard')) return;
          const run = createRun({ seed: 7, faction: f, cls });
          run.gold = 999;
          run.phase = 'event';
          run.event = { id, introDone: true };
          const before = run.deck.length;
          try { chooseEventOption(run, i); } catch { return; }
          for (const c of run.deck.slice(before)) {
            if (CARDS[c.id].rarity === 'curse') continue;
            assert.equal(CARDS[c.id].faction, f, `${f}-${cls} ${id}#${i} ${c.id}`);
            assert.equal(CARDS[c.id].cls, cls, `${f}-${cls} ${id}#${i} ${c.id}`);
          }
        });
      }
    }
  }
});

test('BUG-051: 계열 없는 옛 저장은 덱으로 계열을 짐작', () => {
  for (const f of FACTION_IDS) {
    for (const cls of Object.keys(ROUTES[f].classes)) {
      const run = createRun({ seed: 2, faction: f, cls });
      const data = JSON.parse(serializeRun(run));
      delete data.cls;
      delete data.art;
      const back = parseRun(JSON.stringify(data));
      assert.equal(back.cls, cls, `${f}-${cls}`);
      assert.ok(cardPool(back, 'common').every((id) => CARDS[id].cls === cls));
    }
  }
});

test('BUG-052: 계열 값이 toString·배열·숫자면 되돌림, 보상 풀이 비지 않음', () => {
  for (const bad of ['toString', 'constructor', '__proto__', ['fist'], 123]) {
    const run = createRun({ seed: 3, faction: 'demonic', cls: 'fist' });
    const data = JSON.parse(serializeRun(run));
    data.cls = bad;
    const back = parseRun(JSON.stringify(data));
    assert.ok(CLASS_IDS.includes(back.cls), String(bad));
    assert.ok(cardPool(back, 'common').length > 0);
  }
});

function bossAtThreshold(id, intent) {
  const s = createBattle({ enemyId: id, seed: 1, luck: false });
  startPlayerTurn(s);
  s.enemy.intent = intent;
  s.enemy.hp = Math.floor(s.enemy.maxHp * ENEMIES[id].phase2.at) + 3;
  return s;
}

test('BUG-054: 반격으로 2단계에 들어가면 같은 공격의 남은 타는 멈추고, 2단계 첫 수를 예고', () => {
  for (const id of ['gwimyeon', 'spy', 'rivalProdigy']) {
    if (!ENEMIES[id]?.phase2) continue;
    const s = bossAtThreshold(id, { name: '연타', damage: 6, hits: 3 });
    s.player.status.riposte = 10;
    const hp = s.player.hp;
    takeEvents(s);
    s.phase = 'enemy';
    runEnemyTurn(s);
    assert.ok(s.enemy.phase2Done, id);
    assert.equal(hp - s.player.hp, 6, `${id}: 첫 타만`);
    assert.equal(s.enemy.intent, ENEMIES[id].phase2.pattern[0], id);
  }
});

test('BUG-054: 광폭이 반격으로 켜져도 같은 공격의 남은 타는 예고 피해 그대로', () => {
  const id = Object.keys(ENEMIES).find((k) => ENEMIES[k].traits?.includes('berserk') && !ENEMIES[k].phase2);
  const s = createBattle({ enemyId: id, seed: 1, luck: false });
  startPlayerTurn(s);
  s.enemy.status.strength = 0;
  s.enemy.intent = { name: '난타', damage: 3, hits: 3 };
  s.enemy.hp = Math.floor(s.enemy.maxHp / 2) + 2;
  s.player.status.riposte = 5;
  const hp = s.player.hp;
  s.phase = 'enemy';
  runEnemyTurn(s);
  assert.ok(s.enemy.berserkDone);
  assert.equal(hp - s.player.hp, 9, '3 × 3 그대로');
});

test('BUG-055: 호신으로 다 막은 타는 안 맞은 것 — 독수 중독·흐트러짐 안 붙음', () => {
  const s = createBattle({ enemyId: 'oneEye', seed: 1, luck: false });
  startPlayerTurn(s);
  s.enemy.intent = { name: '독비도', damage: 3, hits: 3, weak: 1 };
  s.player.status.guard = 50;
  s.phase = 'enemy';
  runEnemyTurn(s);
  assert.equal(s.player.status.poison, 0);
  assert.equal(s.player.status.weak, 0);
  // 일부만 막으면 맞은 것
  const t = createBattle({ enemyId: 'oneEye', seed: 1, luck: false });
  startPlayerTurn(t);
  t.enemy.intent = { name: '독비도', damage: 3, hits: 3, weak: 1 };
  t.player.status.guard = 4;
  t.phase = 'enemy';
  runEnemyTurn(t);
  assert.ok(t.player.status.weak > 0);
});

test('BUG-063: 발도는 이번 턴 첫 초식 — 심법을 먼저 써도 남음', () => {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false });
  startPlayerTurn(s);
  const iaido = Object.values(CARDS).find((c) => c.opener && c.type === 'attack' && !c.sure);
  const skill = Object.values(CARDS).find((c) => c.type === 'skill' && c.evasion && !c.power && !c.curse && !c.hpCost && !c.goldCost);
  s.hand = [{ uid: 901, id: skill.id, upgraded: false }, { uid: 902, id: iaido.id, upgraded: false }, { uid: 903, id: iaido.id, upgraded: false }];
  s.player.energy = 9;
  const c = cardStats({ id: iaido.id });
  const full = cardPreviewDamage(s, c);
  playCard(s, 901);
  assert.equal(cardPreviewDamage(s, c), full, '심법 뒤에도 발도');
  playCard(s, 902);
  assert.equal(cardPreviewDamage(s, c), full - iaido.opener, '둘째 초식은 발도 없음');
});
