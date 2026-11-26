import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, canPlay, endPlayerTurn, runEnemyTurn,
  HAND_SIZE, MAX_ENERGY, PLAYER_MAX_HP,
} from '../src/core/battle.js';
import { STARTER_DECK } from '../src/core/cards.js';
import { ENEMIES, ZONE_POOLS } from '../src/core/enemies.js';

function setup(enemyId = 'dummy', opts = {}) {
  const s = createBattle({ enemyId, seed: 42, luck: false, ...opts });
  startPlayerTurn(s);
  return s;
}

function forceHand(s, ids) {
  // 테스트용: 손패를 원하는 카드로 교체
  s.drawPile.push(...s.hand);
  s.hand = ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

test('전투 시작 시 5장 뽑고 내공 3, 덱 총합은 시작 덱과 같음', () => {
  const s = setup();
  assert.equal(s.hand.length, HAND_SIZE);
  assert.equal(s.player.energy, MAX_ENERGY);
  assert.equal(s.player.hp, PLAYER_MAX_HP);
  assert.equal(s.hand.length + s.drawPile.length + s.discard.length, STARTER_DECK.length);
  assert.equal(s.phase, 'player');
  assert.equal(s.turn, 1);
});

test('기본 검법은 내공 1을 쓰고 피해 6', () => {
  const s = setup();
  forceHand(s, ['strike']);
  const hp = s.enemy.hp;
  assert.ok(playCard(s, 1000));
  assert.equal(s.enemy.hp, hp - 6);
  assert.equal(s.player.energy, MAX_ENERGY - 1);
  assert.equal(s.discard.at(-1).id, 'strike');
});

test('내공이 부족하면 카드를 쓸 수 없음', () => {
  const s = setup();
  forceHand(s, ['yusu', 'yusu']);
  assert.ok(playCard(s, 1000));
  assert.equal(s.player.energy, 1);
  assert.equal(canPlay(s, 1001), false);
  assert.equal(playCard(s, 1001), false);
});

test('유수검은 2연격 (7 × 2)', () => {
  const s = setup();
  forceHand(s, ['yusu']);
  const hp = s.enemy.hp;
  playCard(s, 1000);
  assert.equal(s.enemy.hp, hp - 14);
});

test('방어가 없음: 적의 공격은 그대로 체력을 깎음', () => {
  const s = setup('dummy'); // 첫 행동: 피해 7
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.player.hp, PLAYER_MAX_HP - 7);
  assert.equal(s.player.block, undefined);
});

test('견제: 피해 4 + 적 기혈 흐트러짐 → 적 공격 25% 감소', () => {
  const s = setup('dummy');
  forceHand(s, ['feint']);
  playCard(s, 1000);
  assert.equal(s.enemy.status.weak, 1);
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.player.hp, PLAYER_MAX_HP - 5); // floor(7 * 0.75)
});

test('역류검: 적이 공격을 예고한 턴에는 추가 피해', () => {
  const s = setup('dummy'); // 1번째 행동: 공격
  forceHand(s, ['counter']);
  const hp = s.enemy.hp;
  playCard(s, 1000);
  assert.equal(s.enemy.hp, hp - 12);
  endPlayerTurn(s);
  runEnemyTurn(s); // 다음 예고: 기 모으기 (공격 아님)
  forceHand(s, ['counter']);
  const hp2 = s.enemy.hp;
  playCard(s, 1000);
  assert.equal(s.enemy.hp, hp2 - 6);
});

test('적 행동 패턴이 순서대로 반복되고 다음 행동이 예고됨', () => {
  const s = setup('dummy');
  const pattern = ENEMIES.dummy.pattern;
  for (let i = 0; i < pattern.length * 2; i++) {
    assert.equal(s.enemy.intent, pattern[i % pattern.length]);
    endPlayerTurn(s);
    runEnemyTurn(s);
    if (s.phase === 'lost') break;
  }
});

test('턴 종료 시 손패는 버린 패로, 뽑을 패가 없으면 버린 패를 섞어 다시 씀', () => {
  const s = setup();
  for (let t = 0; t < 4; t++) {
    endPlayerTurn(s);
    runEnemyTurn(s);
    assert.equal(s.hand.length, HAND_SIZE);
    assert.equal(s.hand.length + s.drawPile.length + s.discard.length, STARTER_DECK.length);
  }
});

test('다단 공격은 타수만큼 피해', () => {
  const s = setup('dummyMulti'); // 쾌검 이연격 4 x 2
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.player.hp, PLAYER_MAX_HP - 8);
});

test('위층 적: 체력 배율과 처음부터 붙은 기세', () => {
  const s = createBattle({ enemyId: 'dummy', seed: 1, scale: { hp: 1.5, strength: 2 }, luck: false });
  assert.equal(s.enemy.maxHp, 60);
  assert.equal(s.enemy.status.strength, 2);
  startPlayerTurn(s);
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.player.hp, PLAYER_MAX_HP - 9);
});

test('적 체력이 0이 되면 승리, 이후 카드 사용 불가', () => {
  const s = setup();
  s.enemy.hp = 5;
  forceHand(s, ['strike', 'strike']);
  playCard(s, 1000);
  assert.equal(s.enemy.hp, 0);
  assert.equal(s.phase, 'won');
  assert.equal(playCard(s, 1001), false);
});

test('내 체력이 0이 되면 패배', () => {
  const s = setup('dummy', { playerHp: 3 });
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.player.hp, 0);
  assert.equal(s.phase, 'lost');
});

test('플레이어 차례가 아닐 때는 카드 사용/턴 종료 불가', () => {
  const s = setup();
  endPlayerTurn(s);
  assert.equal(endPlayerTurn(s), false);
  assert.equal(playCard(s, s.discard[0].uid), false);
});

test('아무것도 안 하고 버티면 결국 패배 (무한 루프 없음)', () => {
  const s = setup('dummy');
  let guard = 0;
  while (s.phase !== 'lost' && guard++ < 100) {
    endPlayerTurn(s);
    runEnemyTurn(s);
  }
  assert.equal(s.phase, 'lost');
});

test('시작 덱으로 1층 일반 적은 거의 이길 수 있음 (간단 밸런스 확인)', () => {
  for (const enemyId of ZONE_POOLS[0].normal) {
    let wins = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const s = createBattle({ enemyId, seed });
      startPlayerTurn(s);
      let guard = 0;
      while (s.phase === 'player' && guard++ < 50) {
        let played = true;
        while (played && s.phase === 'player') {
          played = false;
          for (const c of [...s.hand]) {
            if (playCard(s, c.uid)) { played = true; break; }
          }
        }
        if (s.phase !== 'player') break;
        endPlayerTurn(s);
        runEnemyTurn(s);
      }
      if (s.phase === 'won') wins += 1;
    }
    assert.ok(wins >= 36, `${enemyId}: 40판 중 ${wins}승`);
  }
});
