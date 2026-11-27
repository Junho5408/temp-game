// 6-E: 세력 무공 재설계 — 공용 무공 없음, 사파 암기·독 터뜨리기·매수, 마교 마기·혈투·입마
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, canPlay, endPlayerTurn, runEnemyTurn, takeEvents, cardPreviewDamage, purse,
} from '../src/core/battle.js';
import { CARDS, cardStats } from '../src/core/cards.js';
import { FACTION_IDS, ROUTES } from '../src/core/routes.js';
import { createRun, cardPool, startEncounter, finishBattle } from '../src/core/run.js';
import { EVENTS } from '../src/core/events.js';

function battle(opts = {}) {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false, ...opts });
  startPlayerTurn(s);
  return s;
}
const hand = (s, ids) => { s.hand = ids.map((id, i) => ({ uid: 900 + i, id, upgraded: false })); s.player.energy = 9; };

test('공용 무공 없음: 모든 무공은 한 세력 것이고, 판마다 자기 세력 무공만 나옴', () => {
  for (const c of Object.values(CARDS)) {
    if (c.rarity === 'curse') continue;
    assert.ok(FACTION_IDS.includes(c.faction), c.id);
  }
  for (const f of FACTION_IDS) {
    const run = createRun({ seed: 1, faction: f });
    assert.ok(run.deck.every((c) => CARDS[c.id].faction === f), f);
    for (const r of ['common', 'uncommon', 'rare']) {
      const pool = cardPool(run, r);
      assert.ok(pool.length >= 3, `${f} ${r}`);
      assert.ok(pool.every((id) => CARDS[id].faction === f));
    }
  }
  assert.equal(cardPool(createRun({ seed: 1 }), 'curse').length, 0);
});

test('수련동 명상: 세력의 기본 무공을 덜어 냄', () => {
  for (const f of FACTION_IDS) {
    const run = createRun({ seed: 1, faction: f });
    const basic = ROUTES[f].basic;
    const n = run.deck.filter((c) => c.id === basic).length;
    run.phase = 'event';
    run.event = { id: 'cave' };
    const api = { removeFirst: (id) => { const i = run.deck.findIndex((c) => c.id === id); if (i < 0) return false; run.deck.splice(i, 1); return true; } };
    EVENTS.cave.options[0].effect(run, run.rng, api);
    assert.equal(run.deck.filter((c) => c.id === basic).length, n - 1, f);
  }
});

// ── 사파 ─────────────────
test('암기: 쓰지 않고 턴을 넘기면 던져짐 (피해·중독), 쓰면 그냥 초식', () => {
  const s = battle();
  hand(s, ['caltrops', 'flyingKnife']);
  const hp = s.enemy.hp;
  endPlayerTurn(s);
  assert.equal(hp - s.enemy.hp, 3 + 5);
  assert.equal(s.enemy.status.poison, 2); // 마름쇠 던질 때 중독 2 (BUG-034)
  assert.equal(takeEvents(s).filter((e) => e.type === 'thrown').length, 2);
});

test('암기 주머니: 던질 때 +3, 암기로 쓰러뜨리면 바로 승리', () => {
  const s = battle({ treasures: ['knifePouch'] });
  hand(s, ['flyingKnife']);
  s.enemy.hp = 8;
  endPlayerTurn(s);
  assert.equal(s.phase, 'won');
});

test('칼 바꿔 쥐기: 손패를 버리고(암기 발동) 그만큼 다시 뽑음 / 비도 난사: 암기만 던짐', () => {
  const s = battle();
  hand(s, ['switchGrip', 'flyingKnife', 'dagger', 'dagger']);
  const hp = s.enemy.hp;
  playCard(s, 900);
  assert.equal(hp - s.enemy.hp, 5);
  assert.equal(s.hand.length, 3);
  const t = battle();
  hand(t, ['knifeFan', 'needle', 'dagger', 'flyingKnife']);
  playCard(t, 900);
  assert.deepEqual(t.hand.filter((c) => c.uid >= 900).map((c) => c.id), ['dagger']);
  assert.equal(t.enemy.status.poison, 3);
});

test('독 터뜨리기: 중독 × 3 피해 (BUG-035), 중독은 사라짐 / 오독수: 중독이 줄지 않음', () => {
  const s = battle();
  hand(s, ['poisonBurst']);
  s.enemy.status.poison = 6;
  const hp = s.enemy.hp;
  playCard(s, 900);
  assert.equal(hp - s.enemy.hp, 18);
  assert.equal(s.enemy.status.poison, 0);
  const t = battle();
  hand(t, ['fivePoison']);
  playCard(t, 900);
  assert.equal(t.enemy.status.poison, 3);
  endPlayerTurn(t);
  runEnemyTurn(t);
  assert.equal(t.enemy.status.poison, 3);
  assert.ok(t.exhausted.some((c) => c.id === 'fivePoison'));
});

test('매수: 은자를 써서 일반 적은 한 차례 묶음, 두목은 흐트러짐 / 은자가 모자라면 못 씀', () => {
  const s = battle({ gold: 30 });
  hand(s, ['bribe', 'bribe']);
  assert.ok(canPlay(s, 900));
  playCard(s, 900);
  assert.equal(s.enemy.status.stun, 1);
  assert.equal(purse(s), 5);
  assert.equal(canPlay(s, 901), false);
  const b = createBattle({ enemyId: 'gangLord', seed: 1, luck: false, gold: 50 });
  startPlayerTurn(b);
  hand(b, ['bribe']);
  playCard(b, 900);
  assert.equal(b.enemy.status.stun, 0);
  assert.equal(b.enemy.status.weak, 2);
});

test('쓴 은자는 판의 은자에서 빠짐', () => {
  const run = createRun({ seed: 2, faction: 'unorthodox' });
  run.gold = 40;
  run.encounter = { enemyId: 'dummy', tier: 'normal', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  b.luck = false;
  startPlayerTurn(b);
  hand(b, ['purseThrow']);
  assert.ok(playCard(b, 900));
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.equal(run.gold, 30 + (run.reward?.gold ?? 0));
});

// ── 마교 ─────────────────
test('마기: 체력을 대가로 쓰거나 적에게 맞으면 쌓임', () => {
  const s = battle({ faction: 'demonic', enemyId: 'dummyMulti' });
  hand(s, ['bloodSword']);
  playCard(s, 900);
  assert.equal(s.player.magi, 1);
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.ok(s.player.magi > 1);
});

test('마기 일격: 마기를 모두 써서 1마다 피해 +3 (미리보기도 같게)', () => {
  const s = battle({ faction: 'demonic' });
  s.player.magi = 4;
  hand(s, ['magiBlade']);
  assert.equal(cardPreviewDamage(s, cardStats({ id: 'magiBlade' })), 5 + 12);
  const hp = s.enemy.hp;
  playCard(s, 900);
  assert.equal(hp - s.enemy.hp, 17);
  assert.equal(s.player.magi, 0);
});

test('혈투: 체력 절반 이하에서 피해 증가', () => {
  const s = battle({ faction: 'demonic' });
  const c = cardStats({ id: 'lastStand' });
  assert.equal(cardPreviewDamage(s, c), 7);
  s.player.hp = 35;
  assert.equal(cardPreviewDamage(s, c), 14);
});

test('입마: 강한 마공을 쓰면 덱에 섞이고, 쓸 수 없고, 턴 끝에 손에 있으면 체력 -2·마기 +1', () => {
  const s = battle({ faction: 'demonic' });
  hand(s, ['heavenDemonBlade']);
  playCard(s, 900);
  const curse = s.drawPile.find((c) => c.id === 'qiDeviation');
  assert.ok(curse);
  s.hand = [curse];
  assert.equal(canPlay(s, curse.uid), false);
  const hp = s.player.hp;
  const magi = s.player.magi;
  endPlayerTurn(s);
  assert.equal(s.player.hp, hp - 2);
  assert.equal(s.player.magi, magi + 1);
});

test('입마로는 쓰러지지 않음, 마기 흡수로 입마를 없애고 마기 +2씩', () => {
  const s = battle({ faction: 'demonic' });
  s.hand = [{ uid: 1, id: 'qiDeviation', upgraded: false }];
  s.player.hp = 1;
  endPlayerTurn(s);
  assert.equal(s.player.hp, 1);
  const t = battle({ faction: 'demonic' });
  hand(t, ['magiAbsorb', 'qiDeviation', 'qiDeviation']);
  playCard(t, 900);
  assert.ok(!t.hand.some((c) => c.id === 'qiDeviation'));
  assert.equal(t.player.magi, 4 + 1);
});

test('입마는 그 전투에만: 판의 덱에는 남지 않음', () => {
  const run = createRun({ seed: 3, faction: 'demonic' });
  run.encounter = { enemyId: 'dummy', tier: 'normal', scale: { hp: 1, strength: 0 } };
  run.phase = 'battle';
  const b = startEncounter(run);
  startPlayerTurn(b);
  hand(b, ['dissolution']);
  assert.ok(playCard(b, 900));
  b.enemy.hp = 0;
  b.phase = 'won';
  finishBattle(run, b);
  assert.ok(!run.deck.some((c) => c.id === 'qiDeviation'));
});

test('혈해: 체력 대가마다 마기 +2 더 / 천마해체대법: 마기 두 배 / 마령주: 마기 3 으로 시작', () => {
  const s = battle({ faction: 'demonic', treasures: ['magiOrb'] });
  assert.equal(s.player.magi, 3);
  hand(s, ['bloodSea', 'bloodSword', 'dissolution']);
  playCard(s, 900); // +2 → 5
  playCard(s, 901); // +3 → 8
  assert.equal(s.player.magi, 8);
  playCard(s, 902);
  assert.equal(s.player.magi, 16);
});
