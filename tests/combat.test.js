// 2-C 전투 개편: 명중·회피·치명, 경공, 간파, 점혈, 파기, 반격, 철포삼, 중독, 연계, 2단계
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, endPlayerTurn, runEnemyTurn, intentPreview, takeEvents,
  playerHitChance, enemyHitChance, PLAYER_MAX_HP,
} from '../src/core/battle.js';
import { cardStats } from '../src/core/cards.js';
import { ENEMIES } from '../src/core/enemies.js';

function setup(enemyId = 'dummy', opts = {}) {
  const s = createBattle({ enemyId, seed: 3, luck: false, ...opts });
  startPlayerTurn(s);
  return s;
}

function forceHand(s, ids) {
  s.drawPile.push(...s.hand);
  s.hand = ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

const enemyTurn = (s) => { endPlayerTurn(s); runEnemyTurn(s); };

test('명중률: 기본 90%, 적 회피만큼 깎이고, 필중은 100%', () => {
  const s = setup('inspector'); // 회피 20
  assert.equal(playerHitChance(s, cardStats({ id: 'strike' })), 70);
  assert.equal(playerHitChance(s, cardStats({ id: 'oneFinger' })), 100);
  s.player.missStreak = 2; // 불운 보정
  assert.equal(playerHitChance(s, cardStats({ id: 'strike' })), 90);
});

test('운이 켜져 있으면 실제로 빗나가고 치명도 나옴 (대략 확률대로)', () => {
  let hits = 0;
  let crits = 0;
  let tries = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const s = createBattle({ enemyId: 'dummy', seed });
    startPlayerTurn(s);
    forceHand(s, ['strike']);
    s.player.missStreak = 0;
    playCard(s, 1000);
    const ev = takeEvents(s);
    tries++;
    const dmg = ev.find((e) => e.type === 'damage');
    if (dmg) { hits++; if (dmg.crit) crits++; }
  }
  assert.ok(hits / tries > 0.84 && hits / tries < 0.96, `명중 ${hits}/${tries}`);
  assert.ok(crits / hits > 0.05 && crits / hits < 0.16, `치명 ${crits}/${hits}`);
});

test('경공: 쌓은 만큼 적의 명중률이 떨어지고, 내 다음 차례에 사라짐', () => {
  const s = setup();
  forceHand(s, ['lightBody']);
  playCard(s, 1000);
  assert.equal(s.player.status.evasion, 3);
  assert.equal(enemyHitChance(s), 60);
  assert.equal(intentPreview(s).hitChance, 60);
  enemyTurn(s);
  assert.equal(s.player.status.evasion, 0);
});

test('경공을 쌓으면 실제로 덜 맞음', () => {
  let hpPlain = 0;
  let hpDodge = 0;
  for (let seed = 1; seed <= 300; seed++) {
    for (const dodge of [false, true]) {
      const s = createBattle({ enemyId: 'dummy', seed });
      startPlayerTurn(s);
      if (dodge) s.player.status.evasion = 5;
      enemyTurn(s);
      if (dodge) hpDodge += PLAYER_MAX_HP - s.player.hp;
      else hpPlain += PLAYER_MAX_HP - s.player.hp;
    }
  }
  assert.ok(hpDodge < hpPlain * 0.6, `${hpDodge} vs ${hpPlain}`);
});

test('간파: 다음 초식은 필중 + 치명(1.5배)', () => {
  const s = setup('inspector', { luck: true });
  forceHand(s, ['insight', 'strike']);
  playCard(s, 1000);
  assert.equal(s.player.status.insight, 1);
  const hp = s.enemy.hp;
  playCard(s, 1001);
  assert.equal(s.enemy.hp, hp - 9);
  assert.equal(s.player.status.insight, 0);
});

test('점혈: 게이지가 차면 적이 한 차례 굳고, 다음 게이지는 더 길어짐', () => {
  const s = setup(); // 일반 10
  forceHand(s, ['pointStrike', 'pointStrike']);
  playCard(s, 1000);
  assert.equal(s.enemy.status.point, 5);
  playCard(s, 1001);
  assert.equal(s.enemy.status.stun, 1);
  assert.equal(s.enemy.pointMax, 16);
  assert.ok(intentPreview(s).stunned);
  enemyTurn(s);
  assert.equal(s.player.hp, PLAYER_MAX_HP); // 굳어서 공격 못 함
  assert.equal(s.enemy.status.stun, 0);
});

test('필살기 파기: 예고된 턴에 일정 피해를 주면 필살기가 끊김', () => {
  const s = setup('ironFist'); // 철권 → 기 모으기 → 붕산권(파기 10)
  enemyTurn(s);
  enemyTurn(s);
  assert.ok(s.enemy.intent.charge);
  const hp = s.player.hp;
  forceHand(s, ['strike', 'strike', 'strike']); // 철포삼: 첫 타 절반
  playCard(s, 1000); // 3
  playCard(s, 1001); // 6 → 9, 아직
  assert.equal(s.enemy.status.stun, 0);
  playCard(s, 1002); // 15 ≥ 10 → 파기
  assert.equal(s.enemy.status.stun, 1);
  assert.equal(takeEvents(s).filter((e) => e.type === 'break').length, 1);
  enemyTurn(s);
  assert.equal(s.player.hp, hp);
});

test('철포삼: 매 턴 첫 일격만 절반', () => {
  const s = setup('ironFist');
  forceHand(s, ['strike', 'strike']);
  const hp = s.enemy.hp;
  playCard(s, 1000);
  assert.equal(s.enemy.hp, hp - 3);
  playCard(s, 1001);
  assert.equal(s.enemy.hp, hp - 9);
});

test('반격 자세: 초식을 쓰면 카드마다 되받아침, 적이 움직이면 풀림', () => {
  const s = setup();
  s.enemy.intent = { name: '반격 자세', counter: 4 };
  enemyTurn(s);
  assert.equal(s.enemy.status.counter, 4);
  forceHand(s, ['strike', 'lightBody']);
  playCard(s, 1001); // 심법은 반격 없음
  assert.equal(s.player.hp, PLAYER_MAX_HP);
  playCard(s, 1000);
  assert.equal(s.player.hp, PLAYER_MAX_HP - 4);
  enemyTurn(s);
  assert.equal(s.enemy.status.counter, 0);
});

test('중독: 자기 차례 시작에 피해, 1씩 줄어듦', () => {
  const s = setup();
  s.player.status.poison = 3;
  s.enemy.intent = { name: '숨 고르기' };
  enemyTurn(s);
  assert.equal(s.player.hp, PLAYER_MAX_HP - 3);
  assert.equal(s.player.status.poison, 2);
});

test('연계: 이번 턴에 초식을 쓴 뒤면 추가 피해·추가 타수', () => {
  const s = setup();
  forceHand(s, ['followUp', 'strike', 'followUp', 'chain']);
  let hp = s.enemy.hp;
  playCard(s, 1000); // 연계 없음: 5
  assert.equal(s.enemy.hp, hp - 5);
  hp = s.enemy.hp;
  playCard(s, 1002); // 연계: 5 + 5
  assert.equal(s.enemy.hp, hp - 10);
  hp = s.enemy.hp;
  playCard(s, 1003); // 연환검 4 × 3
  assert.equal(s.enemy.hp, hp - 12);
});

test('유성낙화: 앞서 쓴 초식마다 피해 증가', () => {
  const s = setup();
  s.player.energy = 9;
  forceHand(s, ['quick', 'quick', 'meteor']);
  playCard(s, 1000);
  playCard(s, 1001);
  const hp = s.enemy.hp;
  playCard(s, 1002);
  assert.equal(s.enemy.hp, hp - 12);
});

test('두목 2단계: 체력 절반에서 정체를 드러내고 패턴·특성이 바뀜', () => {
  const s = setup('spy');
  s.enemy.hp = 80;
  forceHand(s, ['strike']);
  playCard(s, 1000);
  assert.ok(s.enemy.phase2Done);
  assert.equal(s.enemy.title, ENEMIES.spy.phase2.title);
  assert.ok(s.enemy.traits.includes('drain'));
  assert.equal(s.enemy.intent, ENEMIES.spy.phase2.pattern[0]);
  assert.ok(takeEvents(s).some((e) => e.type === 'phase'));
});

test('광폭: 체력이 절반 아래로 떨어지면 기세 +3 (한 번만)', () => {
  const s = setup('brawler');
  s.enemy.hp = 25;
  forceHand(s, ['strike', 'strike']);
  playCard(s, 1000);
  assert.equal(s.enemy.status.strength, 3);
  playCard(s, 1001);
  assert.equal(s.enemy.status.strength, 3);
});

test('무작위 패턴은 같은 수를 연달아 쓰지 않음', () => {
  const s = setup('ronin', { luck: true });
  let prev = s.enemy.patternIndex;
  for (let i = 0; i < 30 && s.phase === 'player'; i++) {
    s.player.hp = 70;
    enemyTurn(s);
    assert.notEqual(s.enemy.patternIndex, prev);
    prev = s.enemy.patternIndex;
  }
});

test('흡성대법: 준 피해의 절반만큼 회복', () => {
  const s = setup();
  s.enemy.traits.push('drain');
  s.enemy.hp = 20;
  enemyTurn(s); // 피해 7 → 4 회복
  assert.equal(s.enemy.hp, 24);
});
