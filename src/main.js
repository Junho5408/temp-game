// 화면 연결: 타이틀 → (프롤로그) → 회귀 → 세력 선택 → 한 판(run) → 죽음/돌파 → 회귀 ...
// 규칙은 src/core 에만 있고, 여기서는 상태를 그리고 입력을 전달함.
import {
  createBattle, startPlayerTurn, playCard, canPlay, endPlayerTurn, runEnemyTurn, takeEvents, intentPreview,
  playerHitChance, playerEvasion, comboActive, useItem, cardPreviewDamage, cardHits, counterDamage, MAGI_MAX,
} from './core/battle.js';
import { BAG_SIZE, CONSUMABLES, TREASURES, TREASURE_KIND } from './core/items.js';
import { cardStats, CARDS } from './core/cards.js';
import {
  createMeta, parseMeta, serializeMeta, finishPrologue, startNewRun, recordRunEnd, clearPendingEnding,
  memoryCandidates, validateLoadout, addClue, setPendingMemory, resolvePendingMemory,
} from './core/meta.js';
import { ENEMIES, TRAITS } from './core/enemies.js';
import { EVENTS } from './core/events.js';
import {
  createRun, enterNode, startEncounter, finishBattle, chooseReward, chooseTreasure, restHeal, restUpgrade, swapRewardItem, leaveRest,
  buyCard, removeCard, leaveShop, chooseEventOption, leaveEvent, advanceZone, serializeRun, parseRun, meetEventNpc,
} from './core/run.js';
import {
  PROLOGUE_INTRO, PROLOGUE_AFTER_THUG, PROLOGUE_DEATH, TUTORIAL_1_HINTS, TUTORIAL_2_HINTS,
  wakeLines, deathLines, CLUES, zone1Start, battleIntro, battleOutro, npcIntro,
  zoneIntro, zoneClearLines, zoneName, zoneBackground, TRUE_BRIDGE, trueEndingLines, ENDING, SPEAKERS,
} from './story/script.js';
import { playDialogue } from './ui/dialogue.js';
import {
  renderTitle, renderRecord, renderSelect, renderMemoryPick, playRegression, hideFlow,
} from './ui/flow.js';
import { createScene, CHEST, FEET, HEAD_Y } from './ui/scene.js';
import { sfx, playMusic, getVolume, setVolume } from './ui/audio.js';
import { DESIGNS, heroArt } from './ui/characters.js';
import { installTouchTips } from './ui/touch.js';
import { ROUTES } from './core/routes.js';
import { josa } from './core/josa.js';
import {
  cardFace, renderMap, hideMap, renderReward, renderTreasure, renderRest, renderShop, renderEvent, renderEnd,
  openDeck, closePanel, fitCardText } from './ui/screens.js';

let PLAYER_ART = 'orthodox-sword'; // 판의 세력·계열에 맞춘 주인공 그림 (8단계, heroArt)
const SAVE_KEY = 'temp-game.meta.v1';
const RUN_KEY = 'temp-game.run.v1'; // 판 중간 저장
const STATUS_INFO = {
  strength: { glyph: '勢', name: '기세', tip: '공격 피해 +' },
  vulnerable: { glyph: '傷', name: '내상', tip: '받는 피해 1.5배, 남은 턴 ' },
  weak: { glyph: '亂', name: '기혈 흐트러짐', tip: '주는 피해 0.75배, 남은 턴 ' },
  poison: { glyph: '毒', name: '중독', tip: '차례 시작에 이만큼 피해 (1씩 줄어듦): ' },
  evasion: { glyph: '輕', name: '경공', tip: '적의 다음 차례 동안 회피율 +10%씩: ' },
  insight: { glyph: '見', name: '간파', tip: '다음 초식이 반드시 명중하고 치명 · 남은 횟수 ' },
  counter: { glyph: '反', name: '반격 자세', tip: '초식으로 공격하면 카드마다 되받는 피해 ' },
  stun: { glyph: '定', name: '굳음', tip: '다음 차례에 움직이지 못함' },
  riposte: { glyph: '反', name: '반격', tip: '적이 한 타 칠 때마다 되받아침 (피하면 2배): ' },
  guard: { glyph: '護', name: '호신', tip: '이번 적 차례에 받는 피해를 막음, 남은 양 ' },
};

const $ = (id) => document.getElementById(id);
const stage = $('stage');

let scene = null;
let meta = createMeta();
let run = null;
let battle = null;
let busy = false;
let enemyActing = false; // 적이 움직이는 동안 예고 말풍선 숨김
let battleCtx = null; // { resolve, interrupt, hints, hintStep }

// ── 저장 ─────────────────────────
function loadMeta() {
  try {
    const text = window.localStorage.getItem(SAVE_KEY);
    meta = text ? parseMeta(text) : createMeta();
  } catch {
    meta = createMeta();
  }
}

function saveMeta() {
  try {
    window.localStorage.setItem(SAVE_KEY, serializeMeta(meta));
  } catch {
    // 저장이 막힌 환경(사생활 보호 모드 등)에서는 이번 접속 동안만 유지
  }
}

// 판 중간 저장: 전투 밖 화면에 들어설 때마다 (전투 중 새로고침하면 그 전투를 처음부터)
function saveRun() {
  if (!run || run.phase === 'victory' || run.phase === 'defeat') return;
  try {
    window.localStorage.setItem(RUN_KEY, serializeRun(run));
  } catch {
    // 저장이 막힌 환경
  }
}

function loadRun() {
  try {
    const text = window.localStorage.getItem(RUN_KEY);
    return text ? parseRun(text) : null;
  } catch {
    return null;
  }
}

function clearRun() {
  try {
    window.localStorage.removeItem(RUN_KEY);
  } catch {
    // 무시
  }
}

// ── 화면 크기 맞추기 ─────────────────────────
function fit() {
  const s = Math.min(window.innerWidth / 960, window.innerHeight / 540);
  stage.style.setProperty('--scale', s.toFixed(4));
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', () => setTimeout(fit, 150));
fit();
installTouchTips();

function setZone(text) {
  document.querySelector('#topbar .zone').textContent = text;
}

function setScreen(name) {
  stage.dataset.screen = name;
  if (name !== 'battle') $('turn-label').textContent = '';
}

// ── 타이틀 ─────────────────────────
async function replayEnding() {
  const pe = meta.pendingEnding;
  scene.setBackground('inn');
  setScreen('story');
  await playDialogue(pe.kind === 'true' ? trueEndingLines(meta.clues) : ENDING);
  setScreen('panel');
  renderEnd({
    phase: 'victory', trueWin: pe.kind === 'true', floor: pe.floor, battlesWon: pe.battlesWon, deck: { length: pe.deck }, gold: pe.gold,
  }, showTitle);
  clearPendingEnding(meta);
  saveMeta();
}

function showTitle() {
  run = null;
  battle = null;
  playMusic(meta.prologueDone ? 'title' : 'inn');
  closePanel();
  hideMap();
  hint(null);
  renderRunInfo();
  scene.clearEnemy();
  scene.reset();
  scene.setBackground(meta.prologueDone ? 'arena' : 'inn');
  setScreen('title');
  if (meta.pendingMemory) {
    // 쓰러진 뒤 기억을 고르기 전에 나갔던 경우
    pickMemoryAndRegress();
    return;
  }
  if (meta.pendingEnding) {
    // 엔딩 대사 중에 나갔던 경우: 엔딩을 다시 보여 줌 (BUG-030)
    replayEnding();
    return;
  }
  const saved = meta.prologueDone ? loadRun() : null;
  renderTitle(meta, {
    saved: saved ? { zone: `${ROUTES[saved.faction]?.name ?? '정파'} · ${zoneName(saved.faction, saved.zone)}`, hp: saved.hp, maxHp: saved.maxHp } : null,
    onContinue: () => {
      hideFlow();
      run = saved;
      show();
    },
    onStart: () => {
      hideFlow();
      if (saved) {
        // 이어하지 않고 새로 시작하면 그 생은 포기한 것으로 (쓰러짐으로 기록, 기억은 없음)
        saved.phase = 'defeat';
        recordRunEnd(meta, saved);
        saveMeta();
        clearRun();
      }
      if (meta.prologueDone) beginLife();
      else playPrologue();
    },
    onRecord: () => renderRecord(meta, showTitle),
    onReset: () => {
      meta = createMeta();
      saveMeta();
      clearRun();
      showTitle();
    },
  });
}

// ── 프롤로그 (1회차, 튜토리얼 겸) ─────────────────────────
async function playPrologue() {
  playMusic('inn');
  setZone('청운객잔 · 그날 밤');
  scene.setBackground('inn');
  scene.clearEnemy();
  scene.reset();
  setScreen('story');
  await scene.setEnemy(ENEMIES.drunkThug.art);
  await playDialogue(PROLOGUE_INTRO);

  // 튜토리얼 전투 1: 술 취한 주먹패
  const first = createBattle({ enemyId: 'drunkThug', seed: 11 });
  await runBattle(first, { title: '술 취한 흑도 주먹패 왕삼', hints: TUTORIAL_1_HINTS });
  hint(null);
  setScreen('story');
  // 문이 부서지는 순간부터 자객이 등장
  const burst = PROLOGUE_AFTER_THUG.findIndex((l) => l.text.startsWith('쾅'));
  await playDialogue(PROLOGUE_AFTER_THUG.slice(0, burst));
  await scene.setEnemy('foe-demonic-assassin');
  scene.reset();
  scene.shake(8);
  sfx('door');
  playMusic('boss');
  await playDialogue(PROLOGUE_AFTER_THUG.slice(burst));

  // 튜토리얼 전투 2: 혈영대원 — 이겨도 지는 싸움 (3턴이 지나거나 크게 몰아붙이면 끊김)
  const second = createBattle({ enemyId: 'bloodShadow', seed: 12, playerHp: Math.max(first.player.hp, 40) });
  await runBattle(second, {
    title: '귀면 가면의 자객',
    hints: TUTORIAL_2_HINTS,
    interrupt: (b) => b.turn >= 4 || b.enemy.hp <= b.enemy.maxHp * 0.35,
  });
  hint(null);
  setScreen('story');
  scene.die('player');
  await playDialogue(PROLOGUE_DEATH);

  finishPrologue(meta);
  saveMeta();
  sfx('regress');
  await playRegression();
  beginLife();
}

// ── 한 생의 시작: 회귀 → 세력 선택 → 지도 ─────────────────────────
async function beginLife() {
  setZone('백 일 전');
  playMusic('title');
  // 회차는 세력을 골라 판을 실제로 시작할 때 올림 (선택 화면에서 새로고침해도 늘지 않게) — BUG-003
  battle = null;
  scene.setBackground('arena');
  scene.clearEnemy();
  scene.reset();
  setScreen('story');
  await playDialogue(wakeLines(meta.runs + 1, meta));
  setScreen('title');
  renderSelect(meta, (artKey, memories) => {
    if (!validateLoadout(meta, memories, 1)) return;
    hideFlow();
    startNewRun(meta);
    saveMeta();
    run = createRun({ seed: (Math.random() * 2 ** 31) | 0, extraCards: memories, faction: artKey.split('-')[0], cls: artKey.split('-')[1], knownClues: meta.clues });
    run.art = artKey;
    applyZoneLook();
    startZone();
  });
}

// 구역에 맞는 이름과 배경
function applyZoneLook() {
  const hero = heroArt(run.faction, run.cls ?? 'sword');
  if (hero !== PLAYER_ART) {
    PLAYER_ART = hero;
    SPEAKERS.me.art = hero;
    scene.setPlayer(hero);
  }
  setZone(zoneName(run.faction, run.zone));
  scene.setBackground(zoneBackground(run.faction, run.zone));
  playMusic(run.zone >= 3 ? 'boss' : zoneBackground(run.faction, run.zone));
}

async function startZone() {
  renderRunInfo();
  setScreen('story');
  await playDialogue(zone1Start(meta, run.faction));
  show();
}

// 이번 판에서 알아낸 단서를 회귀 기록에 옮기고 바로 저장 (죽어도 남음)
function collectClues() {
  if (!run) return;
  for (const id of run.cluesFound) {
    if (addClue(meta, id)) {
      saveMeta();
      showBanner(`단서 · ${CLUES[id]?.title ?? id}`, '#9cc4ff', 2200);
    }
  }
}

// ── 한 판 흐름 ─────────────────────────
// 안전망: 판 진행 중 예상치 못한 오류가 나면 (손상된 저장 등) 이 생을 끝내고 타이틀로 — BUG-004
async function show() {
  try {
    await showStep();
  } catch (err) {
    console.error('판 진행 오류', err);
    clearRun();
    run = null;
    battle = null;
    hideFlow();
    showTitle();
    showBanner('저장이 손상되어 이번 생을 이어갈 수 없다', '#ff9a9a', 2600);
  }
}

async function showStep() {
  closeFloating();
  collectClues();
  saveRun();
  applyZoneLook();
  renderRunInfo();
  closePanel();
  if (run.phase !== 'map') hideMap();
  if (run.phase !== 'battle') scene.clearEnemy();
  switch (run.phase) {
    case 'map':
      setScreen('map');
      renderMap(run, (id) => {
        if (enterNode(run, id)) show();
      });
      break;
    case 'battle': {
      if (run.encounter.bridge) {
        // 진엔딩: 귀면이 쓰러진 자리에 백리현이 걸어 들어옴 (새로고침해도 다시 — BUG-030)
        setScreen('story');
        const enter = TRUE_BRIDGE.findIndex((l) => l.who === 'narr');
        await playDialogue(TRUE_BRIDGE.slice(0, enter + 1));
        await scene.setEnemy(ENEMIES.baekri.art);
        scene.reset();
        sfx('door');
        renderRunInfo(); // 숨을 고른 뒤의 체력 (BUG-031)
        showBanner('숨을 고른다 · 체력 회복', '#9fe0a0', 1300);
        await playDialogue(TRUE_BRIDGE.slice(enter + 1));
        delete run.encounter.bridge;
        saveRun();
      }
      const enemyId = run.encounter.enemyId;
      const clue = ENEMIES[enemyId].clue;
      const known = !!clue && meta.clues.includes(clue);
      const b = startEncounter(run);
      const intro = battleIntro(enemyId, known);
      if (intro) {
        // "쾅―" 으로 시작하는 줄이 있으면 그 순간 적이 들이닥침
        const burst = intro.findIndex((l) => l.text.startsWith('쾅'));
        scene.clearEnemy();
        scene.reset();
        setScreen('story');
        if (burst > 0) {
          await playDialogue(intro.slice(0, burst));
          await scene.setEnemy(b.enemy.art);
          scene.reset();
          scene.shake(8);
          sfx('door');
          await playDialogue(intro.slice(burst));
        } else {
          await scene.setEnemy(b.enemy.art);
          scene.reset();
          await playDialogue(intro);
        }
      }
      const tierLabel = { elite: '고수 · ', boss: '두목 · ' }[b.enemy.tier] ?? '';
      const result = await runBattle(b, { title: `${tierLabel}${b.enemy.title} ${b.enemy.name}`, boss: b.enemy.tier === 'boss' });
      // 승리를 먼저 확정·저장한 뒤 대사 (대사 중 새로고침해도 다시 싸우지 않게) — BUG-001
      finishBattle(run, b);
      battle = null;
      collectClues();
      saveRun();
      if (run.phase === 'victory') {
        // 최종 결전 승리: 엔딩 대사 전에 기록 (엔딩 중 새로고침해도 다시 싸우지 않게)
        clearRun();
        recordRunEnd(meta, run);
        saveMeta();
        run.recorded = true;
      }
      // 진엔딩 판: 귀면이 쓰러지면 일반 엔딩 대신 백리현 등장 장면 (다음 전투 시작에서 — encounter.bridge)
      const outro = result !== 'won' ? null
        : enemyId === 'gwimyeon' && run.trueEnding ? null
          : enemyId === 'baekri' ? trueEndingLines(meta.clues)
            : battleOutro(enemyId, known);
      if (outro) {
        setScreen('story');
        await playDialogue(outro);
      }
      show();
      break;
    }
    case 'treasure':
      setScreen('panel');
      renderTreasure(run, (i) => { chooseTreasure(run, i); show(); });
      break;
    case 'reward':
      setScreen('panel');
      renderReward(run, (i) => { chooseReward(run, i); show(); }, (bagIndex) => { swapRewardItem(run, bagIndex); show(); });
      break;
    case 'rest':
      setScreen('panel');
      renderRest(run, {
        onHeal: () => { restHeal(run); show(); },
        onLeave: () => { leaveRest(run); show(); },
        onUpgrade: (uid) => { restUpgrade(run, uid); show(); },
      });
      break;
    case 'shop':
      setScreen('panel');
      renderShop(run, {
        onBuy: (i) => { buyCard(run, i); show(); },
        onRemove: (uid) => { removeCard(run, uid); show(); },
        onLeave: () => { leaveShop(run); show(); },
      });
      break;
    case 'event': {
      const ev = EVENTS[run.event.id];
      if (ev.npc && !run.event.introDone) {
        // 만남을 판·기록에 함께 저장한 뒤 대사 (새로고침해도 한 번만 셈) — BUG-005
        const n = meetEventNpc(run, meta);
        saveMeta();
        saveRun();
        const npcArt = { cultElder: 'foe-demonic-fist', bloodCamp: null }[ev.npc] ?? `npc-${ev.npc}`;
        if (npcArt) await scene.setEnemy(npcArt);
        else scene.clearEnemy();
        scene.reset();
        setScreen('story');
        await playDialogue(npcIntro(ev.intro ?? ev.npc, n, meta));
        scene.clearEnemy();
      }
      setScreen('panel');
      renderEvent(run, {
        onChoose: (i) => { chooseEventOption(run, i); show(); },
        onLeave: () => { leaveEvent(run); show(); },
      });
      break;
    }
    case 'defeat':
      await onDeath();
      break;
    case 'zoneClear':
      // 구역 돌파 → 다음 구역 (마지막 구역 뒤에는 그날 밤의 객잔)
      setScreen('story');
      await playDialogue(zoneClearLines(run.zone, run.faction));
      advanceZone(run, meta); // 세 길의 핵심 단서를 모두 모았으면 진엔딩 판
      applyZoneLook();
      saveRun();
      if (run.phase === 'map') {
        showBanner(zoneName(run.faction, run.zone), '#f2c14e', 1800);
        await playDialogue(zoneIntro(run.zone, meta, run.faction));
      }
      show();
      break;
    case 'victory':
      if (!run.recorded) {
        clearRun();
        recordRunEnd(meta, run);
        saveMeta();
      }
      setScreen('panel');
      renderEnd(run, showTitle);
      clearPendingEnding(meta); // 결과 화면까지 봤음 (BUG-030)
      saveMeta();
      break;
    default:
      break;
  }
}

async function onDeath() {
  // 고를 기억 후보까지 먼저 저장 (죽음 대사 중 새로고침해도 다시 고르게) — BUG-002
  clearRun();
  recordRunEnd(meta, run);
  setPendingMemory(meta, memoryCandidates(run));
  saveMeta();
  setScreen('story');
  await playDialogue(deathLines(run.lastEnemyName ?? '적'));
  run = null;
  await pickMemoryAndRegress();
}

// 기억할 무공 고르기 → 회귀 → 새 생
async function pickMemoryAndRegress() {
  $('flash').className = '';
  setScreen('title');
  await new Promise((resolve) => {
    renderMemoryPick(meta.pendingMemory ?? [], meta, (id) => {
      resolvePendingMemory(meta, id);
      saveMeta();
      resolve();
    });
  });
  hideFlow();
  renderRunInfo();
  sfx('regress');
  await playRegression();
  beginLife();
}

function renderRunInfo() {
  const info = document.querySelector('.run-info');
  info.hidden = !run;
  $('treasures').hidden = !run;
  if (!run) return;
  $('treasures').innerHTML = run.treasures.map((id) => {
    const t = TREASURES[id];
    return `<span class="tr-chip ${t.kind}" title="${t.name} (${TREASURE_KIND[t.kind]}·영구): ${t.desc}">${t.glyph}</span>`;
  }).join('');
  const bag = battle && run.phase === 'battle' ? battle.bag : run.bag;
  $('bag-top').innerHTML = `囊 ${bag.length}/${BAG_SIZE}`;
  $('bag-top').title = bag.length
    ? `행낭: ${bag.map((id) => `${CONSUMABLES[id].name}(${CONSUMABLES[id].desc})`).join(', ')}`
    : '행낭이 비었다 (전투 중에 한 번 쓰는 물품)';
  const hp = battle && run.phase === 'battle' ? battle.player.hp : run.hp;
  $('run-hp').textContent = `❤ ${hp}/${run.maxHp}`;
  const gold = battle && run.phase === 'battle' ? Math.max(0, run.gold + battle.goldGained) : run.gold;
  $('run-gold').textContent = `銀 ${gold}`;
  $('deck-button').textContent = `덱 ${run.deck.length}`;
}

$('deck-button').addEventListener('click', () => run && openDeck(run));

// 버튼·칸을 누를 때 작은 소리 (카드는 따로)
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn, .map-node, .choice, .option, .item-face, .sg-cell, #deck-button, .bag-slot')) sfx('click');
});

// 소리 설정 (위쪽 막대의 音 버튼)
$('sound-button').addEventListener('click', () => {
  const panel = $('sound-panel');
  panel.hidden = !panel.hidden;
  if (!panel.hidden) {
    panel.querySelector('[data-kind="music"]').value = Math.round(getVolume('music') * 100);
    panel.querySelector('[data-kind="sfx"]').value = Math.round(getVolume('sfx') * 100);
  }
});
document.querySelectorAll('#sound-panel input[type="range"]').forEach((input) => {
  input.addEventListener('input', () => {
    setVolume(input.dataset.kind, Number(input.value) / 100);
    if (input.dataset.kind === 'sfx') sfx('click');
  });
});

// ── 전투 ─────────────────────────
// 전투 하나를 진행하고, 끝나면(승리·패배·연출로 중단) 결과를 돌려줌
async function runBattle(b, { title, hints = null, interrupt = null, boss = false }) {
  busy = true;
  battle = b;
  if (run) run.lastEnemyName = b.enemy.name;
  if (b.enemy.tier === 'elite' || b.enemy.tier === 'boss') playMusic('boss');
  await fadeOut();
  $('flash').className = '';
  await scene.setEnemy(b.enemy.art);
  scene.reset();
  setScreen('battle');
  $('hand').replaceChildren();
  startPlayerTurn(b);
  // 첫 턴의 보물 발동은 이름표 뒤에 보여 줌 (나머지 첫 턴 이벤트는 생략) — BUG-011
  const opening = takeEvents(b).filter((e) => e.type === 'treasure' || (e.type === 'status' && e.target === 'player'));
  busy = false;
  const done = new Promise((resolve) => {
    battleCtx = { resolve, interrupt, hints, hintStep: 0 };
  });
  render();
  fadeIn();
  if (b.enemy.tier === 'elite' || b.enemy.tier === 'boss') {
    nameCard(b.enemy.tier === 'boss' ? '두목' : '고수', b.enemy.name, b.enemy.title);
    sfx('gong');
  } else {
    showBanner(title, boss ? '#ff8a7a' : '#f2c14e', 1400);
  }
  if (hints) hint(hints.start);
  if (opening.length) {
    busy = true;
    wait(900).then(async () => {
      await playEvents(opening);
      busy = false;
      if (battle === b && b.phase === 'player') render();
    });
  }
  return done;
}

function endBattle(result) {
  const ctx = battleCtx;
  if (!ctx) return;
  battleCtx = null;
  closeFloating(); // 연출 중에 연 덱 창이 대사·다음 화면까지 따라가지 않게 — BUG-020
  busy = true;
  ctx.resolve(result);
}

function checkInterrupt() {
  if (battleCtx?.interrupt && battle && battle.phase === 'player' && battleCtx.interrupt(battle)) {
    endBattle('interrupted');
  }
}

function render() {
  if (!battle) return;
  renderStatus();
  renderControls();
}

function renderStatus() {
  const s = battle;
  $('turn-label').textContent = `제 ${s.turn} 턴`;
  renderUnit($('player-info'), '나', run ? `${ROUTES[run.faction]?.name ?? '정파'} · 떠돌이 무인` : '떠돌이 무인', s.player, 'player');
  renderUnit($('enemy-info'), s.enemy.name, s.enemy.title, s.enemy, 'enemy');
  renderIntent();
  renderRunInfo();
}

function renderControls() {
  const s = battle;
  $('energy-value').textContent = `${s.player.energy}/${s.player.maxEnergy}`;
  $('energy').classList.toggle('empty', s.player.energy === 0);
  $('draw-count').textContent = `뽑을 패 ${s.drawPile.length}`;
  $('discard-count').textContent = `버린 패 ${s.discard.length}`;
  $('end-turn').disabled = busy || s.phase !== 'player';
  renderBag();
  renderHand();
}

// 머리 위: 이름 / 소속 / 체력 / 상태 효과 (방어 수치는 없음)
function renderUnit(el, name, title, u, who) {
  if (!el.firstChild) {
    el.innerHTML = `
      <div class="name"></div><div class="title"></div>
      <div class="hpbar"><div class="fill"></div><div class="text"></div></div>
      <div class="statuses"></div>`;
  }
  el.style.left = `${FEET[who].x}px`;
  el.style.top = `${HEAD_Y[who] - 56}px`;
  el.querySelector('.name').textContent = name;
  el.querySelector('.title').textContent = title;
  el.querySelector('.fill').style.width = `${(u.hp / u.maxHp) * 100}%`;
  el.querySelector('.hpbar .text').textContent = `${u.hp} / ${u.maxHp}`;
  const st = el.querySelector('.statuses');
  const chips = Object.entries(u.status)
    .filter(([k, v]) => (v > 0 || (k === 'strength' && v < 0)) && STATUS_INFO[k])
    .map(([k, v]) => {
      const label = k === 'evasion' ? `${playerEvasion(battle)}%` : k === 'stun' || k === 'insight' ? '' : v;
      const tipValue = k === 'stun' ? '' : k === 'counter' && who === 'enemy' ? counterDamage(battle) : v;
      if (k === 'strength' && v < 0) return `<span class="st strength neg" title="${STATUS_INFO[k].name}: 기세를 빼앗겨 공격 피해 ${v}">${STATUS_INFO[k].glyph}<b>${v}</b></span>`;
      return `<span class="st ${k}" title="${STATUS_INFO[k].name}: ${STATUS_INFO[k].tip}${tipValue}">${STATUS_INFO[k].glyph}<b>${label}</b></span>`;
    });
  if (who === 'player') {
    if (battle.traps?.length) chips.push(`<span class="st trap" title="깔아 둔 함정: 적이 공격하는 순간 발동 (${battle.traps.map((t) => CARDS[t.card].name).join(', ')})">陷<b>${battle.traps.length}</b></span>`);
    if (battle.powers?.length) chips.push(`<span class="st power" title="심법 유지: 매 턴 시작에 발동 (${battle.powers.map((t) => CARDS[t.card].name).join(', ')})">心<b>${battle.powers.length}</b></span>`);
    el.querySelector('.magi')?.remove();
    if (battle.faction === 'demonic' || u.magi > 0) {
      el.insertAdjacentHTML('beforeend', `<div class="magi" title="마기(魔氣): 체력을 대가로 쓰거나 맞으면 쌓인다. 마기 6마다 초식 피해 +1 (최대 +3), 마기를 쓰는 무공은 한꺼번에 피해로 바꾼다 (최대 ${MAGI_MAX})"><span>魔</span><i><b style="width:${(u.magi / MAGI_MAX) * 100}%"></b></i><em>${u.magi}</em></div>`);
    }
  }
  if (who === 'enemy') {
    // 점혈 게이지와 타고난 특성
    if (u.status.point > 0) chips.push(`<span class="st point" title="점혈: ${u.pointMax} 이 되면 한 차례 굳음">穴<b>${u.status.point}/${u.pointMax}</b></span>`);
    const traits = [];
    if (u.evasion > 0) traits.push(`<span class="trait" title="경신술: 회피율 ${u.evasion}%">迅 ${u.evasion}%</span>`);
    for (const t of u.traits) traits.push(`<span class="trait" title="${TRAITS[t].name}: ${TRAITS[t].desc}">${TRAITS[t].glyph} ${TRAITS[t].name}</span>`);
    el.querySelector('.traits')?.remove();
    if (traits.length) el.insertAdjacentHTML('beforeend', `<div class="traits">${traits.join('')}</div>`);
  }
  st.innerHTML = chips.join('');
}

function renderIntent() {
  const el = $('intent');
  const s = battle;
  if (enemyActing || s.phase === 'won' || s.phase === 'lost') {
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');
  const it = intentPreview(s);
  el.classList.toggle('charge', !!it.charge);
  el.classList.toggle('stunned', !!it.stunned);
  if (it.stunned) {
    el.innerHTML = '<span class="label">혈도가 막혔다</span><span class="buf">定 이번 차례는 움직이지 못함</span>';
    return;
  }
  if (it.hidden) {
    el.innerHTML = '<span class="label">허초 · 수를 숨겼다</span><span class="atk">? ? ?</span>';
    return;
  }
  const parts = [];
  if (it.damage) parts.push(`<span class="atk">⚔ ${it.damage}${it.hits > 1 ? ` × ${it.hits}` : ''}</span><span class="acc">명중 ${it.hitChance}%</span>`);
  if (it.strength) parts.push(`<span class="buf">勢 +${it.strength}</span>`);
  if (it.counter) parts.push(`<span class="buf">反 반격 ${it.counter}</span>`);
  if (it.heal) parts.push(`<span class="buf">회복 ${it.heal}</span>`);
  if (it.vulnerable) parts.push(`<span class="deb">傷 ${it.vulnerable}</span>`);
  if (it.weak) parts.push(`<span class="deb">亂 ${it.weak}</span>`);
  if (it.poison) parts.push(`<span class="deb">毒 ${it.poison}</span>`);
  const label = it.charge ? `필살 · ${it.name}` : `다음 초식 · ${it.name}`;
  const brk = it.charge
    ? `<span class="break">파기 ${Math.min(it.breakProgress, it.breakAt)} / ${it.breakAt}</span>` : '';
  el.innerHTML = `<span class="label">${label}</span>${parts.join(' &nbsp;')}${brk}`;
  el.title = it.charge ? `필살기: 이번 내 차례에 피해를 ${it.breakAt} 이상 주면 끊고(파기) 굳힐 수 있다`
    : it.counter ? `반격 자세: 다음 내 차례에 초식을 쓰면 카드마다 ${it.counter} 피해를 되받는다`
      : '적이 다음 차례에 할 행동 (명중률은 내 경공에 따라 내려감)';
}

// 행낭: 전투 중 한 번 쓰는 물품 (내공 안 씀)
function renderBag() {
  const el = $('bag');
  const s = battle;
  el.replaceChildren();
  for (let i = 0; i < BAG_SIZE; i++) {
    const id = s.bag[i];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `bag-slot${id ? '' : ' empty'}`;
    if (id) {
      const it = CONSUMABLES[id];
      b.innerHTML = `<span>${it.glyph}</span><small>${it.name}</small>`;
      b.title = `${it.name}: ${it.desc} (눌러서 사용)`;
      b.disabled = busy || s.phase !== 'player';
      b.addEventListener('click', () => onItem(i));
    } else {
      b.disabled = true;
    }
    el.appendChild(b);
  }
}

async function onItem(index) {
  if (busy || !battle || battle.phase !== 'player') return;
  if (!useItem(battle, index)) return;
  busy = true;
  renderControls();
  await playEvents(takeEvents(battle));
  if (!battleCtx) return;
  busy = false;
  if (battle.phase === 'player') render();
  checkInterrupt();
}

function renderHand() {
  const handEl = $('hand');
  const s = battle;
  const existing = new Map([...handEl.children].map((el) => [Number(el.dataset.uid), el]));
  const keep = new Set(s.hand.map((c) => c.uid));

  for (const [uid, el] of existing) if (!keep.has(uid)) el.remove();

  s.hand.forEach((card, i) => {
    let el = existing.get(card.uid);
    if (!el) {
      el = cardFace(card, { tag: 'button', showKey: true });
      el.dataset.uid = card.uid;
      el.dataset.cardId = card.id;
      el.style.animationDelay = `${i * 50}ms`;
      el.addEventListener('click', () => onCard(card.uid, el));
    }
    handEl.appendChild(el); // 순서 유지
    el.querySelector('.key').textContent = i < 9 ? i + 1 : '';
    const stats = cardStats(card);
    const hitEl = el.querySelector('.hit');
    if (stats.damage) {
      // 실제로 들어갈 한 타 피해 (기세·내상·흐트러짐·연계·보물 반영)
      const dmg = cardPreviewDamage(s, stats);
      const hits = cardHits(s, stats);
      const descEl = el.querySelector('.desc');
      const first = hits > 1 ? `피해 ${dmg} × ${hits}` : `피해 ${dmg}`;
      const rest = stats.desc.split('\n').slice(1).join('\n');
      descEl.innerHTML = `<span><b class="dmg-now${dmg > stats.damage ? ' up' : dmg < stats.damage ? ' down' : ''}">${first}</b>${rest ? `\n${rest}` : ''}</span>`;
      const ch = playerHitChance(s, stats);
      hitEl.textContent = `명중 ${ch}%`;
      hitEl.classList.toggle('low', ch < 70);
      hitEl.classList.toggle('sure', ch >= 100);
    }
    if (stats.burst) {
      let dmg = s.enemy.status.poison * stats.burst;
      if (s.enemy.status.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
      // 첫 줄("중독 × n 피해")을 지금 들어갈 피해로 바꿈 (BUG-027)
      const rest = stats.desc.split('\n').slice(1).join('\n');
      el.querySelector('.desc').innerHTML = `<span><b class="dmg-now${dmg > 0 ? ' up' : ' down'}">피해 ${dmg} (중독×${stats.burst})</b>${rest ? `\n${rest}` : ''}</span>`;
      hitEl.textContent = '필중';
      hitEl.classList.add('sure');
    }
    fitCardText(el);
    el.classList.toggle('combo-on', comboActive(s) && !!(stats.combo || stats.comboHits || stats.perAttack));
    const playable = !busy && canPlay(s, card.uid);
    el.classList.toggle('disabled', !playable);
    el.setAttribute('aria-disabled', String(!playable));
  });
  handEl.classList.toggle('crowded', s.hand.length > 6);
}

// ── 튜토리얼 도움말 ─────────────────────────
function hint(text) {
  const el = $('hint');
  el.hidden = !text;
  el.textContent = text ?? '';
}

function advanceHint(trigger) {
  const h = battleCtx?.hints;
  if (!h) return;
  if (trigger === 'play' && battleCtx.hintStep === 0 && h.afterPlay) {
    battleCtx.hintStep = 1;
    hint(h.afterPlay);
  } else if (trigger === 'noEnergy' && battleCtx.hintStep <= 1 && h.noEnergy) {
    battleCtx.hintStep = 2;
    hint(h.noEnergy);
  } else if (trigger === 'turn' && battle.turn >= 3) {
    hint(null);
  }
}

// ── 입력 ─────────────────────────
async function onCard(uid, el) {
  if (busy || !battle || battle.phase !== 'player') return;
  if (!playCard(battle, uid)) {
    el.classList.remove('denied');
    void el.offsetWidth;
    el.classList.add('denied');
    const card = battle.hand.find((c) => c.uid === uid);
    if (card && cardStats(card).cost > battle.player.energy) showBanner('내공이 부족하다', '#ff9a9a', 700);
    return;
  }
  busy = true;
  sfx('card');
  flyCard(el, cardStats({ id: el.dataset.cardId ?? 'strike' }).type);
  renderControls(); // 카드는 바로 손에서 빠지고, 체력은 맞는 순간에 줄어듦
  await playEvents(takeEvents(battle));
  if (!battleCtx) return;
  busy = false;
  advanceHint('play');
  if (battle.player.energy === 0) advanceHint('noEnergy');
  if (battle.phase === 'player') render();
  checkInterrupt();
}

async function onEndTurn() {
  if (busy || !battle || !endPlayerTurn(battle)) return;
  busy = true;
  const handEvents = takeEvents(battle); // 던져진 암기, 입마의 대가
  if (handEvents.length) {
    renderControls();
    await playEvents(handEvents);
    if (!battleCtx) return;
  }
  enemyActing = true;
  render();
  await wait(350);
  runEnemyTurn(battle);
  await playEvents(takeEvents(battle));
  enemyActing = false;
  if (!battleCtx) return;
  busy = false;
  render();
  advanceHint('turn');
  checkInterrupt();
}

$('end-turn').addEventListener('click', onEndTurn);

// 떠 있는 작은 창 (덱 보기·음량). 새 창을 만들면 여기에 추가 — BUG-020·021
const FLOATING = ['deck-modal', 'sound-panel'];

function closeFloating() {
  for (const id of FLOATING) $(id).hidden = true;
}

// 창·대사가 떠 있으면 전투 키 입력을 막음 (Esc 는 떠 있는 창 닫기) — BUG-006·021
function inputBlocked() {
  return FLOATING.some((id) => !$(id).hidden) || !$('dialogue').hidden || !$('panel').hidden || !$('flow').hidden;
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && FLOATING.some((id) => !$(id).hidden)) {
    closeFloating();
    return;
  }
  if (inputBlocked()) return;
  if (!battle || stage.dataset.screen !== 'battle') return;
  if (e.key >= '1' && e.key <= '9') {
    const card = battle.hand[Number(e.key) - 1];
    if (card) onCard(card.uid, $('hand').querySelector(`[data-uid="${card.uid}"]`));
  } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
    e.preventDefault();
    onEndTurn();
  }
});

// ── 연출 ─────────────────────────
const STATUS_POPUP = {
  cleanse: '해독',
  strength: '기세', vulnerable: '내상', weak: '흐트러짐', poison: '중독', evasion: '경공', insight: '간파', counter: '반격 자세', point: '점혈', riposte: '반격', guard: '호신',
};

async function playEvents(events) {
  for (const ev of events) {
    switch (ev.type) {
      case 'enemyAct':
        showBanner(ev.name, ev.stunned ? '#9cd7ff' : '#ffb0a0', ev.stunned ? 1100 : 800);
        if (ev.stunned) await wait(700);
        break;
      case 'damage': {
        if (ev.thrown || ev.riposte) {
          // 암기·함정·반격: 공격 동작 없이 바로 꽂힘
          sfx(ev.riposte ? 'hit' : 'stab');
          scene.hit('enemy', ev.amount);
          popup('enemy', `${ev.riposte ? '反' : ev.trap ? '陷' : '暗'} -${ev.amount}`, 'thrown');
          renderStatus();
          if (battle.enemy.hp <= 0) scene.die('enemy');
          await wait(380);
          break;
        }
        if (ev.blood) {
          // 혈공: 체력을 대가로 냄 (입마의 대가도)
          sfx('poison');
          scene.buff('player');
          popup('player', ev.curse ? `魘 입마 -${ev.amount}` : `血 -${ev.amount}`, 'blood');
          renderStatus();
          await wait(280);
          break;
        }
        if (ev.poison) {
          // 중독: 공격 동작 없이 독 피해
          scene.hit(ev.target, 2);
          sfx('poison');
          if (ev.burst) {
            scene.shake(7);
            flash('crit');
          }
          popup(ev.target, ev.burst ? `毒爆 -${ev.amount}` : `毒 -${ev.amount}`, 'poison');
          renderStatus();
          if (battle[ev.target].hp <= 0) scene.die(ev.target);
          await wait(450);
          break;
        }
        // 타격마다 공격 모션 → 닿는 순간 피격 연출 (다단 공격은 여러 번 휘두름)
        const from = ev.target === 'player' ? 'enemy' : 'player';
        if (ev.counter) popup(from, '반격!', 'st-counter', -60);
        swingSound(from, ev.item);
        await wait(scene.attack(from));
        if (ev.amount > 0) {
          sfx(ev.crit ? 'crit' : 'hit');
          scene.hit(ev.target, ev.crit ? ev.amount + 6 : ev.amount);
          if (ev.crit) {
            popup(ev.target, `치명! -${ev.amount}`, 'crit');
            scene.shake(8);
            flash('crit');
            await wait(110);
          } else {
            popup(ev.target, `-${ev.amount}`, 'dmg');
          }
          if (ev.guarded) popup(ev.target, '鐵 철포삼', 'guard', -70);
        }
        renderStatus();
        if (battle[ev.target].hp <= 0) scene.die(ev.target);
        await wait(300);
        break;
      }
      case 'miss': {
        const from = ev.target === 'player' ? 'enemy' : 'player';
        await wait(scene.attack(from) - 60);
        sfx('miss');
        scene.dodge(ev.target);
        popup(ev.target, ev.target === 'player' ? '회피!' : '빗나감', 'miss');
        await wait(360);
        break;
      }
      case 'item': {
        const it = CONSUMABLES[ev.id];
        sfx('item');
        showBanner(`${it.name} · ${it.desc}`, '#e8dcc0', 1000);
        await wait(250);
        break;
      }
      case 'treasure':
        popup('player', TREASURES[ev.id].name, 'treasure', -90);
        await wait(150);
        break;
      case 'guard':
        sfx('stun');
        popup('player', `護 ${ev.amount} 막음`, 'treasure');
        renderStatus();
        await wait(200);
        break;
      case 'shield':
        swingSound('enemy');
        await wait(scene.attack('enemy'));
        sfx('stun');
        popup('player', '衣 천잠보의 — 막았다!', 'treasure');
        await wait(350);
        break;
      case 'gold':
        sfx('coin');
        popup('player', ev.amount < 0 ? `銀 ${ev.amount}` : `銀 +${ev.amount}`, 'treasure', -70);
        renderRunInfo();
        await wait(200);
        break;
      case 'powerSet':
        sfx('buff');
        scene.buff('player');
        popup('player', `心 ${CARDS[ev.card].name} · 유지`, 'magi', -80);
        await wait(250);
        break;
      case 'power':
        popup('player', `心 ${CARDS[ev.card].name}`, 'thrown-name', -95);
        await wait(120);
        break;
      case 'trapSet':
        sfx('item');
        popup('player', `陷 ${CARDS[ev.card].name} 설치`, 'thrown-name', -80);
        renderStatus();
        await wait(200);
        break;
      case 'trap':
        sfx('stab');
        scene.shake(5);
        showBanner(`함정 발동! ${CARDS[ev.card].name}`, '#e8c27a', 900);
        await wait(300);
        break;
      case 'thrown':
        popup('player', `暗器 · ${CARDS[ev.card].name}`, 'thrown-name', -80);
        await wait(140);
        break;
      case 'magi':
        if (ev.amount > 0) scene.buff('player');
        popup('player', ev.amount > 0 ? `魔 +${ev.amount}` : `魔 ${ev.amount}`, 'magi', -60);
        renderStatus();
        await wait(150);
        break;
      case 'curse':
        sfx('debuff');
        flash('phase');
        showBanner(`입마(入魔)! 마기가 역류한다 — 입마 ${ev.amount}장이 덱에 섞였다`, '#c86aff', 1300);
        renderControls();
        await wait(450);
        break;
      case 'purge':
        sfx('heal');
        popup('player', `입마 ${ev.amount}장 흡수`, 'magi', -90);
        renderControls();
        await wait(250);
        break;
      case 'heal':
        sfx('heal');
        popup(ev.target, `+${ev.amount}`, 'heal', -40);
        renderStatus();
        await wait(250);
        break;
      case 'break':
        sfx('gong');
        scene.shake(10);
        showBanner(`파기(破氣)! ${josa(ev.name, '이/가')} 끊겼다`, '#9cd7ff', 1300);
        renderStatus();
        await wait(500);
        break;
      case 'stun':
        sfx('stun');
        scene.shake(6);
        showBanner(ev.reason === 'bribe' ? '매수! 은자를 받고 이번 차례는 손을 놓는다' : ev.next ? '점혈! 혈도가 막혔다 · 다음 차례에 굳는다' : '점혈! 혈도가 막혀 몸이 굳었다', '#9cd7ff', 1300);
        renderStatus();
        await wait(500);
        break;
      case 'trait':
        sfx('buff');
        scene.buff('enemy');
        showBanner(`${TRAITS[ev.trait].name}! ${TRAITS[ev.trait].desc}`, '#ff8a7a', 1300);
        await wait(400);
        break;
      case 'phase':
        sfx('gong');
        flash('phase');
        scene.buff('enemy');
        scene.shake(9);
        showBanner(ev.text, '#ff8a7a', 2200);
        renderStatus();
        await wait(1100);
        break;
      case 'status':
        sfx({ strength: 'buff', evasion: 'buff', insight: 'buff', point: 'point', poison: 'poison', cleanse: 'heal', counter: 'debuff' }[ev.kind] ?? 'debuff');
        if (ev.kind === 'strength' && ev.amount > 0) scene.buff(ev.target);
        // 훔치기처럼 줄어드는 값은 부호 그대로 (BUG-040)
        popup(ev.target, `${STATUS_POPUP[ev.kind]} ${['strength', 'evasion', 'point'].includes(ev.kind) && ev.amount > 0 ? '+' : ''}${['insight', 'cleanse'].includes(ev.kind) ? '' : ev.amount}`, `st-${ev.kind}`, -50);
        renderStatus();
        await wait(180);
        break;
      case 'turnStart':
        sfx('turn');
        enemyActing = false;
        render();
        await wait(200);
        showBanner(`제 ${ev.turn} 턴 · 나의 차례`, '#f4ead8', 900);
        break;
      case 'won':
      case 'lost':
        sfx(ev.type === 'won' ? 'victory' : 'defeat');
        renderStatus();
        if (ev.type === 'won') bigWord('勝', '#f2c14e');
        else flash('lost');
        await wait(900);
        endBattle(ev.type);
        return;
      default:
        break;
    }
  }
}

function swingSound(from, item = false) {
  if (item) {
    sfx('stab');
    return;
  }
  const art = from === 'player' ? PLAYER_ART : battle?.enemy.art;
  const cls = DESIGNS[art]?.cls ?? 'sword';
  sfx({ sword: 'slash', fist: 'impact', assassin: 'stab' }[cls] ?? 'slash');
}

function popup(target, text, cls, offsetY = 0) {
  const el = document.createElement('div');
  el.className = `popup ${cls}`;
  el.textContent = text;
  const jitter = Math.round((Math.random() - 0.5) * 30);
  el.style.left = `${CHEST[target].x + jitter}px`;
  el.style.top = `${CHEST[target].y - 30 + offsetY}px`;
  $('popups').appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function showBanner(text, color = '#f4ead8', duration = 1000) {
  const el = $('banner');
  el.textContent = text;
  el.style.color = color;
  el.style.animationDuration = `${duration}ms`;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

// ── 연출 도우미 ─────────────────────────
// 카드가 손에서 적(초식) 또는 위(심법)로 날아감
function flyCard(el, type) {
  if (!el) return;
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / 960;
  const r = el.getBoundingClientRect();
  const ghost = el.cloneNode(true);
  ghost.classList.add('flying');
  ghost.classList.remove('disabled', 'combo-on');
  ghost.style.left = `${(r.left - stageRect.left) / scale}px`;
  ghost.style.top = `${(r.top - stageRect.top) / scale}px`;
  const target = type === 'attack' ? CHEST.enemy : { x: CHEST.player.x, y: CHEST.player.y - 60 };
  ghost.style.setProperty('--dx', `${target.x - (r.left - stageRect.left) / scale - 53}px`);
  ghost.style.setProperty('--dy', `${target.y - (r.top - stageRect.top) / scale - 72}px`);
  $('popups').appendChild(ghost);
  setTimeout(() => ghost.remove(), 420);
}

// 화면 전체 번쩍임: crit(흰빛) / phase(붉은빛) / lost(어두운 붉은빛)
function flash(kind) {
  const el = $('flash');
  el.className = '';
  void el.offsetWidth;
  el.className = `on ${kind}`;
}

// 고수·두목 등장 이름표
function nameCard(rank, name, title) {
  const el = $('namecard');
  el.innerHTML = `<small>${rank}</small><b>${name}</b><span>${title}</span>`;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

// 큰 한 글자 (승리)
function bigWord(text, color) {
  const el = $('bigword');
  el.textContent = text;
  el.style.color = color;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

// 전투로 들어갈 때 잠깐 어두워졌다가 밝아짐
function fadeOut() {
  $('fade').classList.add('on');
  return wait(220);
}

function fadeIn() {
  $('fade').classList.remove('on');
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── 시작 ─────────────────────────
function frame(now) {
  scene.draw(now, battle);
  requestAnimationFrame(frame);
}

// 자동 테스트용 (브라우저 콘솔에서 상태 확인)
window.__game = {
  get meta() { return meta; },
  get run() { return run; },
  get battle() { return battle; },
};

(async () => {
  loadMeta();
  scene = await createScene($('scene'), { player: PLAYER_ART });
  requestAnimationFrame(frame);
  showTitle();
})();
