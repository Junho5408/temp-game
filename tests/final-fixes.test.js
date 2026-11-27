// 최종 QA 티켓 (qa-20261127-0035): BUG-022, 023, 025
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBattle, startPlayerTurn, playCard, endPlayerTurn, runEnemyTurn, intentPreview, counterDamage,
} from '../src/core/battle.js';
import { cleanSettings, DEFAULT_SETTINGS } from '../src/core/settings.js';
import { josa } from '../src/core/josa.js';
import {
  createRun, addItem, swapRewardItem, restHeal, leaveRest,
} from '../src/core/run.js';
import { BAG_SIZE } from '../src/core/items.js';

test('BUG-022: 깨진 음량 설정은 기본값, 범위 밖 숫자는 0~1 로', () => {
  assert.deepEqual(cleanSettings({ music: 'abc', sfx: 'x' }), DEFAULT_SETTINGS);
  assert.deepEqual(cleanSettings({ music: null, sfx: undefined }), DEFAULT_SETTINGS);
  assert.deepEqual(cleanSettings({ music: 99, sfx: -5 }), { music: 1, sfx: 0 });
  assert.deepEqual(cleanSettings({ music: 0.2, sfx: 0 }), { music: 0.2, sfx: 0 });
  assert.deepEqual(cleanSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(cleanSettings(5), DEFAULT_SETTINGS);
  assert.deepEqual(cleanSettings({ music: Infinity }), DEFAULT_SETTINGS);
});

function counterBattle(setup) {
  const s = createBattle({ enemyId: 'dummy', seed: 1, luck: false, scale: { hp: 1, strength: 2 } });
  startPlayerTurn(s);
  setup?.(s);
  return s;
}

test('BUG-023: 반격 표시 = 실제로 되받는 피해 (기세·흐트러짐·내상)', () => {
  const cases = [
    () => {},
    (s) => { s.enemy.status.weak = 2; },
    (s) => { s.player.status.vulnerable = 2; },
  ];
  for (const setup of cases) {
    // 예고 단계: 적이 반격 자세를 예고
    const a = counterBattle(setup);
    a.enemy.intent = { name: '반격 자세', counter: 5 };
    const shownInIntent = intentPreview(a).counter;
    // 실제: 반격 자세 상태에서 초식 한 장
    const s = counterBattle(setup);
    s.enemy.status.counter = 5;
    const shownNow = counterDamage(s);
    s.hand = [{ uid: 900, id: 'strike', upgraded: false }];
    const hp = s.player.hp;
    playCard(s, 900);
    assert.equal(hp - s.player.hp, shownNow);
    assert.equal(shownInIntent, shownNow);
  }
  // 반격이 없으면 0
  const none = counterBattle();
  assert.equal(counterDamage(none), 0);
  endPlayerTurn(none);
  runEnemyTurn(none);
});

test('BUG-025: 조사 고르기 (받침 유무)', () => {
  assert.equal(josa('금창약', '이/가'), '금창약이');
  assert.equal(josa('금창약', '을/를'), '금창약을');
  assert.equal(josa('해독산', '이/가'), '해독산이');
  assert.equal(josa('붕산권', '을/를'), '붕산권을');
  assert.equal(josa('목 베기', '이/가'), '목 베기가');
  assert.equal(josa('쾌검', '을/를'), '쾌검을');
  assert.equal(josa('기 모으기', '을/를'), '기 모으기를');
  assert.equal(josa('『일섬』', '이/가'), '『일섬』이'); // 괄호 앞 글자로 판단
  assert.equal(josa('ABC', '이/가'), 'ABC이(가)'); // 한글이 아니면 둘 다
});

test('BUG-025: 같은 물품 칸과는 바꿔 넣지 않음 (기회 유지)', () => {
  const run = createRun({ seed: 2 });
  addItem(run, 'geumchang');
  addItem(run, 'antidote');
  addItem(run, 'smoke');
  assert.equal(run.bag.length, BAG_SIZE);
  run.phase = 'reward';
  run.reward = { gold: 1, cards: ['quick'], item: 'geumchang', itemKept: false };
  assert.equal(swapRewardItem(run, 0), false);
  assert.equal(run.reward.itemKept, false);
  assert.ok(swapRewardItem(run, 1));
  assert.deepEqual(run.bag, ['geumchang', 'geumchang', 'smoke']);
});

test('BUG-025: 체력이 가득하면 휴식은 아무것도 바꾸지 않고, 지나가기는 따로', () => {
  const run = createRun({ seed: 3 });
  run.phase = 'rest';
  assert.equal(restHeal(run), false);
  assert.equal(run.phase, 'rest');
  assert.ok(leaveRest(run));
  assert.equal(run.phase, 'map');
});
