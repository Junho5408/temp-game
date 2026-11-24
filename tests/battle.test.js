import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, canPlay, endPlayerTurn, runEnemyTurn,
  HAND_SIZE, MAX_ENERGY, PLAYER_MAX_HP,
} from '../src/core/battle.js';
import { STARTER_DECK } from '../src/core/cards.js';
import { ENEMIES } from '../src/core/enemies.js';

function setup(enemyId = 'ironFist', opts = {}) {
  const s = createBattle({ enemyId, seed: 42, ...opts });
  startPlayerTurn(s);
  return s;
}

function cardInHand(s, id) {
  return s.hand.find((c) => c.id === id);
}

function forceHand(s, ids) {
  // 테스트용: 손패를 원하는 카드로 교체
  s.drawPile.push(...s.hand);
  s.hand = ids.map((id, i) => ({ uid: 1000 + i, id }));
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
  assert.equal(s.hand.length, 0);
  assert.equal(s.discard.at(-1).id, 'strike');
});

test('내공이 부족하면 카드를 쓸 수 없음', () => {
  const s = setup();
  forceHand(s, ['yusu', 'yusu']);
  assert.ok(playCard(s, 1000));
  assert.equal(s.player.energy, 1);
  assert.equal(canPlay(s, 1001), false);
  assert.equal(playCard(s, 1001), false);
  assert.equal(s.hand.length, 1);
});

test('유수검은 피해 9 + 호신강기 4', () => {
  const s = setup();
  forceHand(s, ['yusu']);
  const hp = s.enemy.hp;
  playCard(s, 1000);
  assert.equal(s.enemy.hp, hp - 9);
  assert.equal(s.player.block, 4);
});

test('호신강기가 적의 공격을 먼저 막음', () => {
  const s = setup('ironFist'); // 첫 행동: 피해 7
  forceHand(s, ['guard']);
  playCard(s, 1000);
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.player.hp, PLAYER_MAX_HP - 2); // 7 - 5
});

test('호신강기는 내 다음 턴 시작 시 사라짐', () => {
  const s = setup('ronin');
  forceHand(s, ['guard', 'guard', 'guard']);
  playCard(s, 1000); playCard(s, 1001); playCard(s, 1002); // 15
  endPlayerTurn(s);
  runEnemyTurn(s); // 4 x 2 = 8 막힘
  assert.equal(s.player.hp, PLAYER_MAX_HP);
  assert.equal(s.player.block, 0);
});

test('적 방어도가 피해를 줄이고, 적 차례가 시작되면 사라짐', () => {
  const s = setup('ironFist');
  endPlayerTurn(s); runEnemyTurn(s); // 철검 내려치기
  endPlayerTurn(s); runEnemyTurn(s); // 철벽세: 방어 8
  assert.equal(s.enemy.block, 8);
  forceHand(s, ['strike']);
  const hp = s.enemy.hp;
  playCard(s, 1000);
  assert.equal(s.enemy.hp, hp); // 6은 전부 막힘
  assert.equal(s.enemy.block, 2);
  endPlayerTurn(s); runEnemyTurn(s);
  assert.equal(s.enemy.block, 0);
});

test('적 행동 패턴이 순서대로 반복되고 다음 행동이 예고됨', () => {
  const s = setup('ironFist');
  const pattern = ENEMIES.ironFist.pattern;
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
  const s = setup('ronin'); // 연환창 4 x 2
  endPlayerTurn(s);
  runEnemyTurn(s);
  assert.equal(s.player.hp, PLAYER_MAX_HP - 8);
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
  const s = setup('ironFist', { playerHp: 3 });
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
  const s = setup('ironFist');
  let guard = 0;
  while (s.phase !== 'lost' && guard++ < 100) {
    endPlayerTurn(s);
    runEnemyTurn(s);
  }
  assert.equal(s.phase, 'lost');
});

test('기본 덱과 단순한 전략으로 두 적 모두 이길 수 있음 (간단 밸런스 확인)', () => {
  for (const enemyId of Object.keys(ENEMIES)) {
    for (let seed = 1; seed <= 20; seed++) {
      const s = createBattle({ enemyId, seed });
      startPlayerTurn(s);
      let guard = 0;
      while (s.phase === 'player' && guard++ < 50) {
        // 간단한 전략: 적이 공격하면 방어 우선, 아니면 공격 우선
        const attacking = !!s.enemy.intent.damage;
        const order = attacking ? ['guard', 'yusu', 'strike'] : ['yusu', 'strike', 'guard'];
        let played = true;
        while (played && s.phase === 'player') {
          played = false;
          for (const id of order) {
            const c = cardInHand(s, id);
            if (c && playCard(s, c.uid)) { played = true; break; }
          }
        }
        if (s.phase !== 'player') break;
        endPlayerTurn(s);
        runEnemyTurn(s);
      }
      assert.equal(s.phase, 'won', `${enemyId} seed ${seed}: 체력 ${s.player.hp}`);
    }
  }
});
