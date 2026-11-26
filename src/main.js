// 화면 연결: 타이틀 → (프롤로그) → 회귀 → 세력 선택 → 한 판(run) → 죽음/돌파 → 회귀 ...
// 규칙은 src/core 에만 있고, 여기서는 상태를 그리고 입력을 전달함.
import {
  createBattle, startPlayerTurn, playCard, canPlay, endPlayerTurn, runEnemyTurn, takeEvents, intentPreview,
} from './core/battle.js';
import { cardStats } from './core/cards.js';
import {
  createMeta, parseMeta, serializeMeta, finishPrologue, startNewRun, recordRunEnd,
  memoryCandidates, rememberCard, validateLoadout, addClue, meetNpc,
} from './core/meta.js';
import { ENEMIES } from './core/enemies.js';
import { EVENTS } from './core/events.js';
import {
  createRun, enterNode, startEncounter, finishBattle, chooseReward, restHeal, restUpgrade,
  buyCard, removeCard, leaveShop, chooseEventOption, leaveEvent,
} from './core/run.js';
import {
  PROLOGUE_INTRO, PROLOGUE_AFTER_THUG, PROLOGUE_DEATH, TUTORIAL_1_HINTS, TUTORIAL_2_HINTS,
  wakeLines, deathLines, ZONE1_CLEAR, CLUES, zone1Start, battleIntro, battleOutro, npcIntro,
} from './story/script.js';
import { playDialogue } from './ui/dialogue.js';
import {
  renderTitle, renderRecord, renderSelect, renderMemoryPick, playRegression, hideFlow,
} from './ui/flow.js';
import { createScene, CHEST, FEET, HEAD_Y } from './ui/scene.js';
import {
  cardFace, renderMap, hideMap, renderReward, renderRest, renderShop, renderEvent, renderEnd,
  openDeck, closePanel,
} from './ui/screens.js';

const PLAYER_ART = 'orthodox-sword';
const SAVE_KEY = 'temp-game.meta.v1';
const STATUS_INFO = {
  strength: { glyph: '勢', name: '기세', tip: '공격 피해 +' },
  vulnerable: { glyph: '傷', name: '내상', tip: '받는 피해 1.5배, 남은 턴' },
  weak: { glyph: '亂', name: '기혈 흐트러짐', tip: '주는 피해 0.75배, 남은 턴' },
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

// ── 화면 크기 맞추기 ─────────────────────────
function fit() {
  const s = Math.min(window.innerWidth / 960, window.innerHeight / 540);
  stage.style.setProperty('--scale', s.toFixed(4));
}
window.addEventListener('resize', fit);
fit();

function setZone(text) {
  document.querySelector('#topbar .zone').textContent = text;
}

function setScreen(name) {
  stage.dataset.screen = name;
  if (name !== 'battle') $('turn-label').textContent = '';
}

// ── 타이틀 ─────────────────────────
function showTitle() {
  run = null;
  battle = null;
  closePanel();
  hideMap();
  hint(null);
  renderRunInfo();
  scene.clearEnemy();
  scene.reset();
  scene.setBackground(meta.prologueDone ? 'arena' : 'inn');
  setScreen('title');
  renderTitle(meta, {
    onStart: () => {
      hideFlow();
      if (meta.prologueDone) beginLife();
      else playPrologue();
    },
    onRecord: () => renderRecord(meta, showTitle),
    onReset: () => {
      meta = createMeta();
      saveMeta();
      showTitle();
    },
  });
}

// ── 프롤로그 (1회차, 튜토리얼 겸) ─────────────────────────
async function playPrologue() {
  setZone('청운객잔 · 그날 밤');
  scene.setBackground('inn');
  scene.clearEnemy();
  scene.reset();
  setScreen('story');
  await scene.setEnemy('unorthodox-fist');
  await playDialogue(PROLOGUE_INTRO);

  // 튜토리얼 전투 1: 술 취한 주먹패
  const first = createBattle({ enemyId: 'drunkThug', seed: 11 });
  await runBattle(first, { title: '술 취한 흑도 주먹패 왕삼', hints: TUTORIAL_1_HINTS });
  hint(null);
  setScreen('story');
  // 문이 부서지는 순간부터 자객이 등장
  const burst = PROLOGUE_AFTER_THUG.findIndex((l) => l.text.startsWith('쾅'));
  await playDialogue(PROLOGUE_AFTER_THUG.slice(0, burst));
  await scene.setEnemy('demonic-assassin');
  scene.reset();
  scene.shake(8);
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
  await playRegression();
  beginLife();
}

// ── 한 생의 시작: 회귀 → 세력 선택 → 지도 ─────────────────────────
async function beginLife() {
  setZone('백 일 전');
  startNewRun(meta);
  saveMeta();
  battle = null;
  scene.setBackground('arena');
  scene.clearEnemy();
  scene.reset();
  setScreen('story');
  await playDialogue(wakeLines(meta.runs));
  setScreen('title');
  renderSelect(meta, (artKey, memories) => {
    if (!validateLoadout(meta, memories)) return;
    hideFlow();
    run = createRun({ seed: (Math.random() * 2 ** 31) | 0, extraCards: memories });
    run.art = artKey;
    setZone('제1구역 · 후기지수 비무대회');
    startZone();
  });
}

async function startZone() {
  renderRunInfo();
  setScreen('story');
  await playDialogue(zone1Start(meta));
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
async function show() {
  collectClues();
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
      const enemyId = run.encounter.enemyId;
      const clue = ENEMIES[enemyId].clue;
      const known = !!clue && meta.clues.includes(clue);
      const b = startEncounter(run);
      const intro = battleIntro(enemyId, known);
      if (intro) {
        await scene.setEnemy(b.enemy.art);
        scene.reset();
        setScreen('story');
        await playDialogue(intro);
      }
      const tierLabel = { elite: '고수 · ', boss: '두목 · ' }[b.enemy.tier] ?? '';
      const result = await runBattle(b, { title: `${tierLabel}${b.enemy.title} ${b.enemy.name}`, boss: b.enemy.tier === 'boss' });
      const outro = result === 'won' ? battleOutro(enemyId, known) : null;
      if (outro) {
        setScreen('story');
        await playDialogue(outro);
      }
      finishBattle(run, b);
      battle = null;
      show();
      break;
    }
    case 'reward':
      setScreen('panel');
      renderReward(run, (i) => { chooseReward(run, i); show(); });
      break;
    case 'rest':
      setScreen('panel');
      renderRest(run, {
        onHeal: () => { restHeal(run); show(); },
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
        run.event.introDone = true;
        const n = meetNpc(meta, ev.npc);
        saveMeta();
        await scene.setEnemy(`npc-${ev.npc}`);
        scene.reset();
        setScreen('story');
        await playDialogue(npcIntro(ev.npc, n, meta));
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
    case 'victory':
      recordRunEnd(meta, run);
      saveMeta();
      setScreen('story');
      await playDialogue(ZONE1_CLEAR);
      setScreen('panel');
      renderEnd(run, showTitle);
      break;
    default:
      break;
  }
}

async function onDeath() {
  recordRunEnd(meta, run);
  saveMeta();
  setScreen('story');
  await playDialogue(deathLines(run.lastEnemyName ?? '적'));
  setScreen('title');
  const candidates = memoryCandidates(run);
  await new Promise((resolve) => {
    renderMemoryPick(candidates, meta, (id) => {
      if (id) rememberCard(meta, id);
      saveMeta();
      resolve();
    });
  });
  hideFlow();
  run = null;
  renderRunInfo();
  await playRegression();
  beginLife();
}

function renderRunInfo() {
  const info = document.querySelector('.run-info');
  info.hidden = !run;
  if (!run) return;
  const hp = battle && run.phase === 'battle' ? battle.player.hp : run.hp;
  $('run-hp').textContent = `❤ ${hp}/${run.maxHp}`;
  $('run-gold').textContent = `銀 ${run.gold}`;
  $('deck-button').textContent = `덱 ${run.deck.length}`;
}

$('deck-button').addEventListener('click', () => run && openDeck(run));

// ── 전투 ─────────────────────────
// 전투 하나를 진행하고, 끝나면(승리·패배·연출로 중단) 결과를 돌려줌
async function runBattle(b, { title, hints = null, interrupt = null, boss = false }) {
  busy = true;
  battle = b;
  if (run) run.lastEnemyName = b.enemy.name;
  await scene.setEnemy(b.enemy.art);
  scene.reset();
  setScreen('battle');
  $('hand').replaceChildren();
  startPlayerTurn(b);
  takeEvents(b);
  busy = false;
  const done = new Promise((resolve) => {
    battleCtx = { resolve, interrupt, hints, hintStep: 0 };
  });
  render();
  showBanner(title, boss ? '#ff8a7a' : '#f2c14e', 1400);
  if (hints) hint(hints.start);
  return done;
}

function endBattle(result) {
  const ctx = battleCtx;
  if (!ctx) return;
  battleCtx = null;
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
  renderUnit($('player-info'), '나', run ? '정파 · 떠돌이 무인' : '떠돌이 무인', s.player, 'player');
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
  st.innerHTML = Object.entries(u.status)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `<span class="st ${k}" title="${STATUS_INFO[k].name}: ${STATUS_INFO[k].tip}${v}">${STATUS_INFO[k].glyph}<b>${v}</b></span>`)
    .join('');
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
  const parts = [];
  if (s.enemy.intent.damage) parts.push(`<span class="atk">⚔ ${it.damage}${it.hits > 1 ? ` × ${it.hits}` : ''}</span>`);
  if (it.strength) parts.push(`<span class="buf">勢 +${it.strength}</span>`);
  if (it.vulnerable) parts.push(`<span class="deb">傷 ${it.vulnerable}</span>`);
  if (it.weak) parts.push(`<span class="deb">亂 ${it.weak}</span>`);
  el.innerHTML = `<span class="label">다음 초식 · ${it.name}</span>${parts.join(' &nbsp;')}`;
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
      el.style.animationDelay = `${i * 50}ms`;
      el.addEventListener('click', () => onCard(card.uid, el));
    }
    handEl.appendChild(el); // 순서 유지
    el.querySelector('.key').textContent = i < 9 ? i + 1 : '';
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

window.addEventListener('keydown', (e) => {
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
const STATUS_POPUP = { strength: '기세', vulnerable: '내상', weak: '흐트러짐' };

async function playEvents(events) {
  for (const ev of events) {
    switch (ev.type) {
      case 'enemyAct':
        showBanner(ev.name, '#ffb0a0', 800);
        break;
      case 'damage': {
        // 타격마다 공격 모션 → 닿는 순간 피격 연출 (다단 공격은 여러 번 휘두름)
        const from = ev.target === 'player' ? 'enemy' : 'player';
        await wait(scene.attack(from));
        if (ev.amount > 0) {
          scene.hit(ev.target, ev.amount);
          popup(ev.target, `-${ev.amount}`, 'dmg');
        }
        renderStatus();
        if (battle[ev.target].hp <= 0) scene.die(ev.target);
        await wait(300);
        break;
      }
      case 'status':
        if (ev.kind === 'strength') scene.buff(ev.target);
        popup(ev.target, `${STATUS_POPUP[ev.kind]} ${ev.kind === 'strength' ? '+' : ''}${ev.amount}`, `st-${ev.kind}`, -50);
        renderStatus();
        await wait(180);
        break;
      case 'turnStart':
        enemyActing = false;
        render();
        await wait(200);
        showBanner(`제 ${ev.turn} 턴 · 나의 차례`, '#f4ead8', 900);
        break;
      case 'won':
      case 'lost':
        renderStatus();
        await wait(900);
        endBattle(ev.type);
        return;
      default:
        break;
    }
  }
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
