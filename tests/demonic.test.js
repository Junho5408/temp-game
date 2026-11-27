// 6-C: 마교 루트
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, canPlay, takeEvents, cardPreviewDamage,
} from '../src/core/battle.js';
import { cardStats, CARDS } from '../src/core/cards.js';
import { ROUTES } from '../src/core/routes.js';
import {
  createRun, enterNode, chooseEventOption, cardPool,
} from '../src/core/run.js';

function battle(opts = {}) {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false, ...opts });
  startPlayerTurn(s);
  return s;
}
const hand = (s, ids) => { s.hand = ids.map((id, i) => ({ uid: 900 + i, id, upgraded: false })); s.player.energy = 9; };

test('마교 검객 시작 덱: 정파와 겹치는 무공 없음 (마검 베기·혈참·혈무·마기 흡수·천마심법, 8-B)', () => {
  const ids = createRun({ seed: 1, faction: 'demonic' }).deck.map((c) => c.id);
  assert.equal(ids.length, 10);
  assert.ok(ids.every((id) => CARDS[id].faction === 'demonic' && CARDS[id].cls === 'sword'));
  assert.equal(ids.filter((id) => id === 'dMaCut').length, 4);
});

test('혈검: 체력 3을 내고 피해 12', () => {
  const s = battle();
  hand(s, ['bloodSword']);
  const hp = s.player.hp;
  const ehp = s.enemy.hp;
  playCard(s, 900);
  assert.equal(s.player.hp, hp - 3);
  assert.equal(ehp - s.enemy.hp, 12);
  assert.ok(takeEvents(s).some((e) => e.type === 'damage' && e.blood && e.amount === 3));
});

test('체력이 대가 이하이면 혈 무공을 쓸 수 없음 (스스로 쓰러지지 않음)', () => {
  const s = battle();
  hand(s, ['heavenDemonBlade']);
  s.player.hp = 5;
  assert.equal(canPlay(s, 900), false);
  s.player.hp = 6;
  assert.ok(canPlay(s, 900));
  playCard(s, 900);
  assert.equal(s.player.hp, 1); // 천마혈검 체력 대가 5 (BUG-037)
});

test('흡혈 일섬: 준 피해 절반 회복', () => {
  const s = battle();
  s.player.hp = 40;
  hand(s, ['drainStrike']);
  playCard(s, 900);
  assert.equal(s.player.hp, 40 + Math.floor(13 * 0.5));
});

test('마공 폭주: 체력 2(혈수 -2, BUG-056) → 내공 +2, 피의 맹세: 체력 5 → 기세 +6 (둘 다 입마)', () => {
  const s = battle();
  hand(s, ['bloodRage', 'bloodOath']);
  s.player.energy = 1;
  const pile = s.drawPile.length;
  playCard(s, 900);
  assert.equal(s.player.energy, 3);
  playCard(s, 901);
  assert.equal(s.player.status.strength, 6);
  assert.equal(s.player.hp, 70 - 2 - 5);
  assert.equal(s.drawPile.length, pile + 2);
});

test('천마 혈옥: 혈 무공 피해 +3, 마령 가면: 첫 턴 적 흐트러짐 2', () => {
  const s = battle({ treasures: ['bloodJade', 'demonMask'] });
  assert.equal(s.enemy.status.weak, 2);
  assert.equal(cardPreviewDamage(s, cardStats({ id: 'bloodSword' })), 15);
  assert.equal(cardPreviewDamage(s, cardStats({ id: 'bloodClaw' })), 7);
});

test('마교 무공은 마교 판에서만', () => {
  const demonic = Object.values(CARDS).filter((c) => c.faction === 'demonic').map((c) => c.id);
  assert.ok(demonic.length >= 16);
  for (const r of ['common', 'uncommon', 'rare']) {
    assert.ok(cardPool(createRun({ seed: 1, faction: 'unorthodox' }), r).every((id) => !demonic.includes(id)));
  }
});

test('마교 루트: 열려 있고, 구역 두목은 연화 → 조광 → 우문혁', () => {
  assert.ok(ROUTES.demonic.ready);
  const bosses = [];
  for (let z = 0; z < 3; z++) {
    const run = createRun({ seed: 9, faction: 'demonic' });
    run.zone = z;
    run.map.rows[0][0].type = 'boss';
    enterNode(run, run.map.rows[0][0].id);
    bosses.push(run.encounter.enemyId);
  }
  assert.deepEqual(bosses, ['rivalProdigy', 'gangLordD', 'allianceElderD']);
});

test('마교 단서: 혈영대 막사의 서찰 (두 선택지 모두)', () => {
  for (const i of [0, 1]) {
    const run = createRun({ seed: 10, faction: 'demonic' });
    run.phase = 'event';
    run.event = { id: 'bloodCamp', result: null };
    chooseEventOption(run, i);
    assert.ok(run.cluesFound.includes('request'));
  }
});
