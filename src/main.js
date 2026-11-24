// 화면 연결: 전투 로직(src/core) 상태를 읽어 그리고, 입력을 로직에 전달
import {
  createBattle, startPlayerTurn, playCard, canPlay, endPlayerTurn, runEnemyTurn, takeEvents,
} from './core/battle.js';
import { CARDS } from './core/cards.js';
import { ENEMY_IDS } from './core/enemies.js';
import { createScene, FEET, SCALE, SPRITE_TOP } from './ui/scene.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const scene = createScene($('scene'));

const TYPE_LABEL = { attack: '초식', defense: '호신강기', skill: '심법' };
const POS = {
  player: { x: FEET.player.x * SCALE, y: FEET.player.y * SCALE },
  enemy: { x: FEET.enemy.x * SCALE, y: FEET.enemy.y * SCALE },
};

let battle = null;
let busy = false;
let lastEnemy = null;

// ── 화면 크기 맞추기 ─────────────────────────
function fit() {
  const s = Math.min(window.innerWidth / 960, window.innerHeight / 540);
  stage.style.setProperty('--scale', s.toFixed(4));
}
window.addEventListener('resize', fit);
fit();

// ── 전투 시작 ─────────────────────────
function newBattle() {
  const choices = ENEMY_IDS.filter((id) => id !== lastEnemy);
  const enemyId = choices[Math.floor(Math.random() * choices.length)];
  lastEnemy = enemyId;
  battle = createBattle({ enemyId, seed: (Math.random() * 2 ** 31) | 0 });
  scene.setEnemy(battle.enemy.sprite);
  $('hand').replaceChildren();
  $('result').hidden = true;
  busy = false;
  startPlayerTurn(battle);
  takeEvents(battle);
  render();
  showBanner(`${battle.enemy.title} ${battle.enemy.name}`, '#f2c14e');
}

// ── 그리기 ─────────────────────────
function render() {
  const s = battle;
  $('turn-label').textContent = `제 ${s.turn} 턴`;
  renderUnit($('player-info'), '검객', '정파 · 떠돌이 무인', s.player, POS.player);
  renderUnit($('enemy-info'), s.enemy.name, s.enemy.title, s.enemy, POS.enemy);
  renderIntent();

  $('energy-value').textContent = `${s.player.energy}/${s.player.maxEnergy}`;
  $('energy').classList.toggle('empty', s.player.energy === 0);
  $('draw-count').textContent = `뽑을 패 ${s.drawPile.length}`;
  $('discard-count').textContent = `버린 패 ${s.discard.length}`;
  $('end-turn').disabled = busy || s.phase !== 'player';
  renderHand();
}

function renderUnit(el, name, title, u, pos) {
  if (!el.firstChild) {
    el.innerHTML = `
      <div class="hpbar"><div class="fill"></div><div class="text"></div></div>
      <div class="block-badge" hidden></div>
      <div class="name"></div><div class="title"></div>`;
  }
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y + 8}px`;
  el.querySelector('.name').textContent = name;
  el.querySelector('.title').textContent = title;
  el.querySelector('.fill').style.width = `${(u.hp / u.maxHp) * 100}%`;
  el.querySelector('.hpbar .text').textContent = `${u.hp} / ${u.maxHp}`;
  const badge = el.querySelector('.block-badge');
  badge.hidden = u.block <= 0;
  badge.textContent = u.block;
  badge.title = `호신강기 ${u.block}`;
}

function renderIntent() {
  const el = $('intent');
  const s = battle;
  el.style.left = `${POS.enemy.x}px`;
  el.style.top = `${SPRITE_TOP.enemy * SCALE - 6}px`;
  if (s.phase === 'won' || s.phase === 'lost') {
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');
  const it = s.enemy.intent;
  const parts = [];
  if (it.damage) {
    const hits = it.hits ?? 1;
    parts.push(`<span class="atk">⚔ ${it.damage}${hits > 1 ? ` × ${hits}` : ''}</span>`);
  }
  if (it.block) parts.push(`<span class="def">🛡 ${it.block}</span>`);
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
      el = makeCardEl(card);
      el.style.animationDelay = `${i * 50}ms`;
    }
    handEl.appendChild(el); // 순서 유지
    el.querySelector('.key').textContent = i < 9 ? i + 1 : '';
    const playable = !busy && canPlay(s, card.uid);
    el.classList.toggle('disabled', !playable);
    el.setAttribute('aria-disabled', String(!playable));
  });
}

function makeCardEl(card) {
  const def = CARDS[card.id];
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `card ${def.type}`;
  el.dataset.uid = card.uid;
  el.innerHTML = `
    <span class="key"></span>
    <span class="cost">${def.cost}</span>
    <span class="cname">${def.name}</span>
    <span class="art">${def.glyph}</span>
    <span class="desc">${def.desc}</span>
    <span class="ctype">${TYPE_LABEL[def.type]}</span>`;
  el.addEventListener('click', () => onCard(card.uid, el));
  return el;
}

// ── 입력 ─────────────────────────
function onCard(uid, el) {
  if (busy || battle.phase !== 'player') return;
  if (!playCard(battle, uid)) {
    el.classList.remove('denied');
    void el.offsetWidth;
    el.classList.add('denied');
    if (battle.phase === 'player') showBanner('내공이 부족하다', '#ff9a9a', 700);
    return;
  }
  playEvents(takeEvents(battle));
  render();
}

async function onEndTurn() {
  if (busy || !endPlayerTurn(battle)) return;
  busy = true;
  render();
  await wait(350);
  runEnemyTurn(battle);
  await playEvents(takeEvents(battle));
  busy = false;
  render();
}

$('end-turn').addEventListener('click', onEndTurn);
$('restart').addEventListener('click', newBattle);

window.addEventListener('keydown', (e) => {
  if (!battle) return;
  if (!$('result').hidden) {
    if (e.key === 'Enter' || e.key === ' ') newBattle();
    return;
  }
  if (e.key >= '1' && e.key <= '9') {
    const card = battle.hand[Number(e.key) - 1];
    if (card) onCard(card.uid, $('hand').querySelector(`[data-uid="${card.uid}"]`));
  } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
    e.preventDefault();
    onEndTurn();
  }
});

// ── 연출 ─────────────────────────
async function playEvents(events) {
  for (const ev of events) {
    switch (ev.type) {
      case 'play':
        if (CARDS[ev.card].damage) scene.play('player', 'lunge');
        break;
      case 'enemyAct':
        showBanner(ev.name, '#ffb0a0', 800);
        scene.play('enemy', 'lunge');
        await wait(180);
        break;
      case 'damage':
        if (ev.amount > 0) {
          scene.play(ev.target, 'hit');
          popup(ev.target, `-${ev.amount}`, 'dmg');
        }
        if (ev.blocked > 0) popup(ev.target, `막음 ${ev.blocked}`, 'blk', 26);
        render();
        await wait(150);
        break;
      case 'block':
        popup(ev.target, `+${ev.amount} 강기`, 'gain', -10);
        break;
      case 'turnStart':
        render();
        await wait(250);
        showBanner(`제 ${ev.turn} 턴 · 나의 차례`, '#f4ead8', 900);
        break;
      case 'won':
        await wait(500);
        showResult(true);
        break;
      case 'lost':
        await wait(500);
        showResult(false);
        break;
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
  el.style.left = `${POS[target].x + jitter}px`;
  el.style.top = `${POS[target].y - 60 + offsetY}px`;
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

function showResult(win) {
  const e = battle.enemy;
  const box = $('result').querySelector('.result-box');
  box.className = `result-box ${win ? 'win' : 'lose'}`;
  $('result-title').textContent = win ? '승리' : '패배';
  $('result-text').textContent = win
    ? `${e.title} ${e.name}${josa(e.name, '을', '를')} 꺾었다!\n남은 체력 ${battle.player.hp} / ${battle.player.maxHp}`
    : `${e.name}의 초식에 쓰러졌다…\n(이곳에서 훗날 회귀가 시작됩니다)`;
  $('restart').textContent = win ? '다른 상대와 겨루기' : '다시 도전';
  $('result').hidden = false;
  render();
}

function josa(word, withFinal, withoutFinal) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return withoutFinal;
  return code % 28 ? withFinal : withoutFinal;
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── 메인 루프 ─────────────────────────
function frame(now) {
  scene.draw(now, battle);
  requestAnimationFrame(frame);
}

newBattle();
requestAnimationFrame(frame);
