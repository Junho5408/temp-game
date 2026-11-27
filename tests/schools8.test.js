// 8-A: 계열·류파·반격·호신·류파 쏠림
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, endPlayerTurn, runEnemyTurn, takeEvents, playCard,
} from '../src/core/battle.js';
import { CARDS } from '../src/core/cards.js';
import { createRun, cardPool, pickFromPool, deckSchools, parseRun, serializeRun } from '../src/core/run.js';
import { SCHOOLS, CLASS_IDS } from '../src/core/schools.js';
import { FACTION_IDS, ROUTES } from '../src/core/routes.js';

function withCard(id, def, fn) {
  CARDS[id] = { id, name: id, glyph: '試', type: 'skill', rarity: 'common', cost: 1, ...def };
  try { return fn(); } finally { delete CARDS[id]; }
}

function enemyTurnWith(card, intent, opts = {}, prep = () => {}) {
  return withCard('__t', card, () => {
    const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false, ...opts });
    startPlayerTurn(s);
    prep(s);
    s.enemy.intent = intent;
    s.hand = [{ uid: 900, id: '__t', upgraded: false }];
    s.player.energy = 9;
    playCard(s, 900);
    takeEvents(s);
    const hp = { p: s.player.hp, e: s.enemy.hp };
    endPlayerTurn(s);
    runEnemyTurn(s);
    return { s, lostP: hp.p - s.player.hp, lostE: hp.e - s.enemy.hp, evs: takeEvents(s) };
  });
}

test('반격: 적이 한 타 칠 때마다 되받아침, 다음 내 턴에 사라짐', () => {
  const { s, lostE, evs } = enemyTurnWith({ riposte: 4 }, { name: '연타', damage: 3, hits: 3 });
  assert.equal(lostE, 12);
  assert.equal(evs.filter((e) => e.type === 'damage' && e.riposte).length, 3);
  assert.equal(s.player.status.riposte, 0);
});

test('반격: 피하면 2배', () => {
  // 확률을 켜고 난수를 끝값으로 → 적 공격은 빗나감
  const { lostE } = enemyTurnWith({ riposte: 4 }, { name: '타격', damage: 3, accuracy: 0 }, {}, (s) => { s.luck = true; s.rng = () => 0.999; });
  assert.equal(lostE, 8);
});

test('반격으로 적이 쓰러지면 승리', () => {
  const r = enemyTurnWith({ riposte: 500 }, { name: '타격', damage: 3 });
  assert.equal(r.s.phase, 'won');
});

test('호신: 이번 적 차례에 받는 피해를 합계 n 까지 막음', () => {
  const { lostP, s } = enemyTurnWith({ guard: 10 }, { name: '연타', damage: 4, hits: 3 });
  assert.equal(lostP, 2);
  assert.equal(s.player.status.guard, 0);
});

test('심법 유지로 반격·호신이 매 턴', () => {
  const { s } = enemyTurnWith({ power: { riposte: 2, guard: 3 } }, { name: '기 모으기', strength: 1 });
  assert.equal(s.player.status.riposte, 2);
  assert.equal(s.player.status.guard, 3);
});

test('계열: 판은 계열을 기억하고, 보상은 내 세력·계열 무공만', () => {
  for (const f of FACTION_IDS) {
    const run = createRun({ seed: 1, faction: f, cls: 'sword' });
    assert.equal(run.cls, 'sword');
    for (const r of ['common', 'uncommon', 'rare']) {
      assert.ok(cardPool(run, r).every((id) => CARDS[id].faction === f && CARDS[id].cls === 'sword'));
    }
  }
  // 없는 계열은 검객으로
  assert.equal(createRun({ seed: 1, cls: 'nope' }).cls, 'sword');
  // 옛 저장(계열 없음)은 검객
  const run = createRun({ seed: 2 });
  const data = JSON.parse(serializeRun(run));
  delete data.cls;
  assert.equal(parseRun(JSON.stringify(data)).cls, 'sword');
});

test('류파 표는 세력 × 계열 9칸, 칸마다 류파 3개 (id 겹침 없음)', () => {
  assert.equal(Object.keys(SCHOOLS).length, FACTION_IDS.length * CLASS_IDS.length);
  const ids = Object.values(SCHOOLS).flat().map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const list of Object.values(SCHOOLS)) assert.equal(list.length, 3);
  for (const c of Object.values(CARDS)) {
    if (!c.school) continue;
    assert.ok(SCHOOLS[`${c.faction}-${c.cls}`].some((x) => x.id === c.school), c.id);
  }
});

test('류파 쏠림: 덱에 있는 류파 무공이 더 자주 나옴', () => {
  CARDS.__a = { id: '__a', faction: 'orthodox', cls: 'sword', school: 'hwasan', rarity: 'common' };
  CARDS.__b = { id: '__b', faction: 'orthodox', cls: 'sword', school: 'mudang', rarity: 'common' };
  try {
    const run = createRun({ seed: 5 });
    run.deck.push({ uid: 999, id: '__a', upgraded: false });
    assert.ok(deckSchools(run).has('hwasan'));
    let a = 0;
    for (let i = 0; i < 2000; i++) if (pickFromPool(run, ['__a', '__b']) === '__a') a++;
    assert.ok(a > 1350 && a < 1650, String(a)); // 3:1 → 75%
  } finally {
    delete CARDS.__a;
    delete CARDS.__b;
  }
});

test('세력마다 계열 정의: 검객은 열림', () => {
  for (const f of FACTION_IDS) assert.ok(ROUTES[f].classes.sword.ready);
});

test('8-B 검객 재편: 세력마다 검객 기본 + 류파 3개, 류파마다 일반·고급·희귀가 다 있음', async () => {
  const { REWORKS } = await import('../src/core/cards.js');
  for (const f of FACTION_IDS) {
    const sword = Object.values(CARDS).filter((c) => c.faction === f && c.cls === 'sword' && !c.retired);
    assert.ok(sword.length >= 38 && sword.length <= 46, `${f} ${sword.length}`);
    for (const sc of SCHOOLS[`${f}-sword`]) {
      for (const r of ['common', 'uncommon', 'rare']) {
        assert.ok(sword.some((c) => c.school === sc.id && c.rarity === r), `${f} ${sc.id} ${r}`);
      }
    }
    // 시작 덱은 검객 기본 무공만
    assert.ok(REWORKS[f].decks.sword.every((id) => CARDS[id].cls === 'sword' && !CARDS[id].school), f);
  }
});
