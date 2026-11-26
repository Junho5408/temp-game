// 화면 연결: 한 판(run) 진행과 전투 화면
// 규칙은 src/core 에만 있고, 여기서는 상태를 그리고 입력을 전달함.
import {
  startPlayerTurn, playCard, canPlay, endPlayerTurn, runEnemyTurn, takeEvents, intentPreview,
} from './core/battle.js';
import { cardStats } from './core/cards.js';
import {
  createRun, enterNode, startEncounter, finishBattle, chooseReward, restHeal, restUpgrade,
  buyCard, removeCard, leaveShop, chooseEventOption, leaveEvent,
} from './core/run.js';
import { createScene, CHEST, FEET, HEAD_Y } from './ui/scene.js';
import {
  cardFace, renderMap, hideMap, renderReward, renderRest, renderShop, renderEvent, renderEnd,
  openDeck, closePanel,
} from './ui/screens.js';

const PLAYER_ART = 'orthodox-sword';
const STATUS_INFO = {
  strength: { glyph: '勢', name: '기세', tip: '공격 피해 +' },
  vulnerable: { glyph: '傷', name: '내상', tip: '받는 피해 1.5배, 남은 턴' },
  weak: { glyph: '亂', name: '기혈 흐트러짐', tip: '주는 피해 0.75배, 남은 턴' },
};

const $ = (id) => document.getElementById(id);
const stage = $('stage');

let scene = null;
let run = null;
let battle = null;
let busy = false;
let enemyActing = false; // 적이 움직이는 동안 예고 말풍선 숨김

// ── 화면 크기 맞추기 ─────────────────────────
function fit() {
  const s = Math.min(window.innerWidth / 960, window.innerHeight / 540);
  stage.style.setProperty('--scale', s.toFixed(4));
}
window.addEventListener('resize', fit);
fit();

// ── 한 판 흐름 ─────────────────────────
function newRun() {
  run = createRun({ seed: (Math.random() * 2 ** 31) | 0 });
  battle = null;
  closePanel();
  $('deck-modal').hidden = true;
  show();
}

// run.phase 에 맞는 화면을 보여줌
async function show() {
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
    case 'battle':
      await beginBattle();
      break;
    case 'reward':
      setScreen('panel');
      renderReward(run, (i) => {
        chooseReward(run, i);
        show();
      });
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
    case 'event':
      setScreen('panel');
      renderEvent(run, {
        onChoose: (i) => { chooseEventOption(run, i); show(); },
        onLeave: () => { leaveEvent(run); show(); },
      });
      break;
    case 'victory':
    case 'defeat':
      setScreen('panel');
      renderEnd(run, newRun);
      break;
    default:
      break;
  }
}

function setScreen(name) {
  stage.dataset.screen = name;
  if (name !== 'battle') $('turn-label').textContent = '';
}

function renderRunInfo() {
  const hp = battle && run.phase === 'battle' ? battle.player.hp : run.hp;
  $('run-hp').textContent = `❤ ${hp}/${run.maxHp}`;
  $('run-gold').textContent = `銀 ${run.gold}`;
  $('deck-button').textContent = `덱 ${run.deck.length}`;
}

$('deck-button').addEventListener('click', () => openDeck(run));

// ── 전투 ─────────────────────────
async function beginBattle() {
  busy = true;
  battle = startEncounter(run);
  await scene.setEnemy(battle.enemy.art);
  scene.reset();
  setScreen('battle');
  $('hand').replaceChildren();
  startPlayerTurn(battle);
  takeEvents(battle);
  busy = false;
  render();
  const tierLabel = { elite: '고수 · ', boss: '두목 · ' }[battle.enemy.tier] ?? '';
  showBanner(`${tierLabel}${battle.enemy.title} ${battle.enemy.name}`, battle.enemy.tier === 'boss' ? '#ff8a7a' : '#f2c14e', 1400);
}

async function endBattle() {
  await wait(900);
  finishBattle(run, battle);
  battle = null;
  show();
}

function render() {
  if (!battle) return;
  renderStatus();
  renderControls();
}

function renderStatus() {
  const s = battle;
  $('turn-label').textContent = `제 ${s.turn} 턴`;
  renderUnit($('player-info'), '검객', '정파 · 떠돌이 무인', s.player, 'player');
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
  if (s.enemy.intent.damage) {
    parts.push(`<span class="atk">⚔ ${it.damage}${it.hits > 1 ? ` × ${it.hits}` : ''}</span>`);
  }
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
  // 손패가 많으면 겹쳐서 표시
  handEl.classList.toggle('crowded', s.hand.length > 6);
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
  busy = false;
  if (battle && battle.phase === 'player') render();
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
  busy = false;
  if (battle) render();
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
        await endBattle();
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

(async () => {
  scene = await createScene($('scene'), { player: PLAYER_ART });
  newRun();
  requestAnimationFrame(frame);
})();
