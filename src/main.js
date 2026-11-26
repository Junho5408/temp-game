// 화면 연결: 타이틀 → (프롤로그) → 회귀 → 세력 선택 → 한 판(run) → 죽음/돌파 → 회귀 ...
// 규칙은 src/core 에만 있고, 여기서는 상태를 그리고 입력을 전달함.
import {
  createBattle, startPlayerTurn, playCard, canPlay, endPlayerTurn, runEnemyTurn, takeEvents, intentPreview,
  playerHitChance, playerEvasion, comboActive, useItem,
} from './core/battle.js';
import { BAG_SIZE, CONSUMABLES, TREASURES, TREASURE_KIND } from './core/items.js';
import { cardStats } from './core/cards.js';
import {
  createMeta, parseMeta, serializeMeta, finishPrologue, startNewRun, recordRunEnd,
  memoryCandidates, rememberCard, validateLoadout, addClue, meetNpc,
} from './core/meta.js';
import { ENEMIES, TRAITS } from './core/enemies.js';
import { EVENTS } from './core/events.js';
import {
  createRun, enterNode, startEncounter, finishBattle, chooseReward, chooseTreasure, restHeal, restUpgrade,
  buyCard, removeCard, leaveShop, chooseEventOption, leaveEvent, advanceZone, serializeRun, parseRun,
} from './core/run.js';
import {
  PROLOGUE_INTRO, PROLOGUE_AFTER_THUG, PROLOGUE_DEATH, TUTORIAL_1_HINTS, TUTORIAL_2_HINTS,
  wakeLines, deathLines, CLUES, zone1Start, battleIntro, battleOutro, npcIntro,
  zoneIntro, zoneClearLines, ZONE_NAMES, ZONE_BACKGROUNDS,
} from './story/script.js';
import { playDialogue } from './ui/dialogue.js';
import {
  renderTitle, renderRecord, renderSelect, renderMemoryPick, playRegression, hideFlow,
} from './ui/flow.js';
import { createScene, CHEST, FEET, HEAD_Y } from './ui/scene.js';
import {
  cardFace, renderMap, hideMap, renderReward, renderTreasure, renderRest, renderShop, renderEvent, renderEnd,
  openDeck, closePanel,
} from './ui/screens.js';

const PLAYER_ART = 'orthodox-sword';
const SAVE_KEY = 'temp-game.meta.v1';
const RUN_KEY = 'temp-game.run.v1'; // 판 중간 저장
const STATUS_INFO = {
  strength: { glyph: '勢', name: '기세', tip: '공격 피해 +' },
  vulnerable: { glyph: '傷', name: '내상', tip: '받는 피해 1.5배, 남은 턴 ' },
  weak: { glyph: '亂', name: '기혈 흐트러짐', tip: '주는 피해 0.75배, 남은 턴 ' },
  poison: { glyph: '毒', name: '중독', tip: '차례 시작에 이만큼 피해 (1씩 줄어듦): ' },
  evasion: { glyph: '輕', name: '경공', tip: '적의 다음 차례 동안 회피율 +10%씩: ' },
  insight: { glyph: '見', name: '간파', tip: '다음 초식이 반드시 명중하고 치명: ' },
  counter: { glyph: '反', name: '반격 자세', tip: '초식으로 공격하면 카드마다 되받는 피해 ' },
  stun: { glyph: '定', name: '굳음', tip: '다음 차례에 움직이지 못함' },
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
  const saved = meta.prologueDone ? loadRun() : null;
  renderTitle(meta, {
    saved: saved ? { zone: ZONE_NAMES[saved.zone], hp: saved.hp, maxHp: saved.maxHp } : null,
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
    applyZoneLook();
    startZone();
  });
}

// 구역에 맞는 이름과 배경
function applyZoneLook() {
  setZone(ZONE_NAMES[run.zone]);
  scene.setBackground(ZONE_BACKGROUNDS[run.zone]);
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
          await playDialogue(intro.slice(burst));
        } else {
          await scene.setEnemy(b.enemy.art);
          scene.reset();
          await playDialogue(intro);
        }
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
    case 'treasure':
      setScreen('panel');
      renderTreasure(run, (i) => { chooseTreasure(run, i); show(); });
      break;
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
      await playDialogue(zoneClearLines(run.zone));
      advanceZone(run);
      applyZoneLook();
      saveRun();
      if (run.phase === 'map') {
        showBanner(ZONE_NAMES[run.zone], '#f2c14e', 1800);
        await playDialogue(zoneIntro(run.zone, meta));
      }
      show();
      break;
    case 'victory':
      clearRun();
      recordRunEnd(meta, run);
      saveMeta();
      setScreen('panel');
      renderEnd(run, showTitle);
      break;
    default:
      break;
  }
}

async function onDeath() {
  clearRun();
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
    .filter(([k, v]) => v > 0 && STATUS_INFO[k])
    .map(([k, v]) => {
      const label = k === 'evasion' ? `${playerEvasion(battle)}%` : k === 'stun' || k === 'insight' ? '' : v;
      return `<span class="st ${k}" title="${STATUS_INFO[k].name}: ${STATUS_INFO[k].tip}${k === 'stun' ? '' : v}">${STATUS_INFO[k].glyph}<b>${label}</b></span>`;
    });
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
      el.style.animationDelay = `${i * 50}ms`;
      el.addEventListener('click', () => onCard(card.uid, el));
    }
    handEl.appendChild(el); // 순서 유지
    el.querySelector('.key').textContent = i < 9 ? i + 1 : '';
    const stats = cardStats(card);
    const hitEl = el.querySelector('.hit');
    if (stats.damage) {
      const ch = playerHitChance(s, stats);
      hitEl.textContent = `명중 ${ch}%`;
      hitEl.classList.toggle('low', ch < 70);
      hitEl.classList.toggle('sure', ch >= 100);
    }
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
const STATUS_POPUP = {
  cleanse: '해독',
  strength: '기세', vulnerable: '내상', weak: '흐트러짐', poison: '중독', evasion: '경공', insight: '간파', counter: '반격 자세', point: '점혈',
};

async function playEvents(events) {
  for (const ev of events) {
    switch (ev.type) {
      case 'enemyAct':
        showBanner(ev.name, ev.stunned ? '#9cd7ff' : '#ffb0a0', ev.stunned ? 1100 : 800);
        if (ev.stunned) await wait(700);
        break;
      case 'damage': {
        if (ev.poison) {
          // 중독: 공격 동작 없이 독 피해
          scene.hit(ev.target, 2);
          popup(ev.target, `毒 -${ev.amount}`, 'poison');
          renderStatus();
          if (battle[ev.target].hp <= 0) scene.die(ev.target);
          await wait(450);
          break;
        }
        // 타격마다 공격 모션 → 닿는 순간 피격 연출 (다단 공격은 여러 번 휘두름)
        const from = ev.target === 'player' ? 'enemy' : 'player';
        if (ev.counter) popup(from, '반격!', 'st-counter', -60);
        await wait(scene.attack(from));
        if (ev.amount > 0) {
          scene.hit(ev.target, ev.crit ? ev.amount + 6 : ev.amount);
          if (ev.crit) {
            popup(ev.target, `치명! -${ev.amount}`, 'crit');
            scene.shake(8);
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
        scene.dodge(ev.target);
        popup(ev.target, ev.target === 'player' ? '회피!' : '빗나감', 'miss');
        await wait(360);
        break;
      }
      case 'item': {
        const it = CONSUMABLES[ev.id];
        showBanner(`${it.name} · ${it.desc}`, '#e8dcc0', 1000);
        await wait(250);
        break;
      }
      case 'treasure':
        popup('player', TREASURES[ev.id].name, 'treasure', -90);
        await wait(150);
        break;
      case 'shield':
        await wait(scene.attack('enemy'));
        popup('player', '衣 천잠보의 — 막았다!', 'treasure');
        await wait(350);
        break;
      case 'heal':
        popup(ev.target, `+${ev.amount}`, 'heal', -40);
        renderStatus();
        await wait(250);
        break;
      case 'break':
        scene.shake(10);
        showBanner(`파기(破氣)! ${ev.name}이(가) 끊겼다`, '#9cd7ff', 1300);
        renderStatus();
        await wait(500);
        break;
      case 'stun':
        scene.shake(6);
        showBanner('점혈! 혈도가 막혀 몸이 굳었다', '#9cd7ff', 1300);
        renderStatus();
        await wait(500);
        break;
      case 'trait':
        scene.buff('enemy');
        showBanner(`${TRAITS[ev.trait].name}! ${TRAITS[ev.trait].desc}`, '#ff8a7a', 1300);
        await wait(400);
        break;
      case 'phase':
        scene.buff('enemy');
        scene.shake(9);
        showBanner(ev.text, '#ff8a7a', 2200);
        renderStatus();
        await wait(1100);
        break;
      case 'status':
        if (ev.kind === 'strength') scene.buff(ev.target);
        popup(ev.target, `${STATUS_POPUP[ev.kind]} ${['strength', 'evasion', 'point'].includes(ev.kind) ? '+' : ''}${['insight', 'cleanse'].includes(ev.kind) ? '' : ev.amount}`, `st-${ev.kind}`, -50);
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
