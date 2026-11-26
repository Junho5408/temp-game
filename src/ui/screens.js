// 전투 밖 화면들: 지도, 보상, 운기조식, 객잔, 기연, 결과, 덱 보기
// 규칙은 src/core/run.js 에 있고, 여기서는 그리기와 클릭만 담당.
import { cardStats, canUpgrade, RARITY_LABEL, TYPE_LABEL, CARDS } from '../core/cards.js';
import { EVENTS } from '../core/events.js';
import { NODE_TYPES, ROWS } from '../core/map.js';
import { availableNodes } from '../core/run.js';

const $ = (id) => document.getElementById(id);

// ── 카드 그림 (손패·보상·객잔·덱 공용) ─────────────────────────
export function cardFace(card, { tag = 'div', showKey = false, preview = false } = {}) {
  const c = cardStats(preview ? { ...card, upgraded: true } : card);
  const el = document.createElement(tag);
  if (tag === 'button') el.type = 'button';
  el.className = `card ${c.type}${c.upgraded ? ' upgraded' : ''}`;
  el.innerHTML = `
    ${showKey ? '<span class="key"></span>' : ''}
    <span class="cost">${c.cost}</span>
    <span class="cname">${c.displayName}</span>
    <span class="art">${c.glyph}</span>
    <span class="desc">${c.desc}</span>
    <span class="ctype">${TYPE_LABEL[c.type]} · ${RARITY_LABEL[c.rarity]}</span>`;
  return el;
}

// ── 공용 패널 ─────────────────────────
function openPanel(title, sub = '') {
  const panel = $('panel');
  panel.hidden = false;
  panel.innerHTML = `
    <div class="panel-box">
      <h2>${title}</h2>
      ${sub ? `<p class="panel-sub">${sub}</p>` : ''}
      <div class="panel-body"></div>
      <div class="panel-actions"></div>
    </div>`;
  return { body: panel.querySelector('.panel-body'), actions: panel.querySelector('.panel-actions') };
}

export function closePanel() {
  $('panel').hidden = true;
  $('panel').innerHTML = '';
}

function button(label, onClick, cls = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `btn ${cls}`;
  b.innerHTML = label;
  b.addEventListener('click', onClick);
  return b;
}

// ── 지도 ─────────────────────────
const MAP_X0 = 96;
const MAP_DX = 128;
const MAP_Y0 = 132;
const MAP_H = 300;

function nodePos(node) {
  const x = MAP_X0 + node.row * MAP_DX;
  const y = node.count === 1 ? MAP_Y0 + MAP_H / 2 : MAP_Y0 + ((node.col + 0.5) * MAP_H) / node.count;
  // 손으로 그린 지도처럼 살짝 어긋나게 (항상 같은 값)
  const jx = ((node.row * 37 + node.col * 53) % 17) - 8;
  const jy = ((node.row * 29 + node.col * 41) % 15) - 7;
  return { x: x + (node.type === 'boss' ? 0 : jx), y: y + (node.type === 'boss' ? 0 : jy) };
}

export function renderMap(run, onPick) {
  const el = $('map-screen');
  el.hidden = false;
  const avail = new Set(availableNodes(run).map((n) => n.id));
  const visited = new Set(run.visited);
  const nodes = run.map.rows.flat();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  let lines = '';
  for (const n of nodes) {
    const a = nodePos(n);
    for (const id of n.next) {
      const b = nodePos(byId[id]);
      const walked = visited.has(n.id) && visited.has(id);
      const open = n.id === run.position && avail.has(id);
      lines += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${walked ? 'walked' : open ? 'open' : ''}"/>`;
    }
  }

  el.innerHTML = `
    <div class="map-title">
      <h2>제1구역 · 후기지수 비무대회</h2>
      <p>갈 곳을 고르시오 · 마지막에는 우승 후보가 기다린다</p>
    </div>
    <svg class="map-lines" viewBox="0 0 960 540" width="960" height="540">${lines}</svg>
    <div class="map-nodes"></div>
    <div class="map-legend">${Object.entries(NODE_TYPES).map(([k, t]) => `<span><i class="node-dot ${k}">${t.icon}</i>${t.name}</span>`).join('')}</div>
    <div class="map-floor">${run.position ? `${Math.min(ROWS, byId[run.position].row + 1)}층` : '출발'}</div>`;

  const wrap = el.querySelector('.map-nodes');
  for (const n of nodes) {
    const p = nodePos(n);
    const t = NODE_TYPES[n.type];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `map-node ${n.type}`;
    if (visited.has(n.id)) b.classList.add('visited');
    if (n.id === run.position) b.classList.add('current');
    if (avail.has(n.id)) b.classList.add('available');
    b.disabled = !avail.has(n.id);
    b.style.left = `${p.x}px`;
    b.style.top = `${p.y}px`;
    b.title = t.name;
    b.innerHTML = `<span>${t.icon}</span>`;
    b.addEventListener('click', () => onPick(n.id));
    wrap.appendChild(b);
  }
}

export function hideMap() {
  $('map-screen').hidden = true;
}

// ── 승리 보상 ─────────────────────────
export function renderReward(run, onChoose) {
  const { body, actions } = openPanel('승리', `은자 <b class="gold">+${run.reward.gold}냥</b> · 비급 한 권을 골라 덱에 넣으시오`);
  body.classList.add('card-row');
  run.reward.cards.forEach((id, i) => {
    const el = cardFace({ id }, { tag: 'button' });
    el.addEventListener('click', () => onChoose(i));
    body.appendChild(el);
  });
  actions.appendChild(button('건너뛰기', () => onChoose(null), 'ghost'));
}

// ── 운기조식 ─────────────────────────
export function renderRest(run, { onHeal, onUpgrade }) {
  const heal = Math.min(run.maxHp - run.hp, Math.ceil(run.maxHp * 0.3));
  const { body } = openPanel('운기조식', '조용한 곳에서 기혈을 고른다. 한 가지만 할 수 있다.');
  body.classList.add('choice-row');
  const a = button(`<b>息</b><span>휴식</span><small>체력 +${heal} (${run.hp} → ${run.hp + heal})</small>`, onHeal, 'choice');
  const upgradable = run.deck.filter(canUpgrade);
  const b = button('<b>鍊</b><span>초식 연마</span><small>카드 1장을 강화(+)</small>', () => {
    pickCard(run, '연마할 초식을 고르시오', upgradable, { preview: true }, onUpgrade, () => renderRest(run, { onHeal, onUpgrade }));
  }, 'choice');
  b.disabled = upgradable.length === 0;
  body.append(a, b);
}

// 덱에서 카드 고르기 (연마·제거 공용)
function pickCard(run, title, cards, faceOpts, onPick, onBack) {
  const { body, actions } = openPanel(title, faceOpts.preview ? '연마 후 모습으로 보여줍니다' : '');
  body.classList.add('card-grid');
  for (const card of cards) {
    const el = cardFace(card, { tag: 'button', ...faceOpts });
    el.addEventListener('click', () => onPick(card.uid));
    body.appendChild(el);
  }
  actions.appendChild(button('돌아가기', onBack, 'ghost'));
}

// ── 객잔 ─────────────────────────
export function renderShop(run, { onBuy, onRemove, onLeave }) {
  const { body, actions } = openPanel('객잔', `가진 은자 <b class="gold">${run.gold}냥</b> · 떠돌이 무인들이 비급을 팔고 있다`);
  body.classList.add('card-row', 'shop');
  run.shop.items.forEach((item, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'shop-item';
    const el = cardFace({ id: item.id }, { tag: 'button' });
    const cant = item.sold || run.gold < item.price;
    el.disabled = cant;
    if (item.sold) wrap.classList.add('sold');
    el.addEventListener('click', () => onBuy(i));
    const price = document.createElement('div');
    price.className = `price${run.gold < item.price && !item.sold ? ' short' : ''}`;
    price.textContent = item.sold ? '팔림' : `${item.price}냥`;
    wrap.append(el, price);
    body.appendChild(wrap);
  });
  const canRemove = !run.shop.removed && run.gold >= run.removeCost && run.deck.length > 5;
  const rm = button(`카드 제거 <small>${run.shop.removed ? '이번엔 끝' : `${run.removeCost}냥`}</small>`, () => {
    pickCard(run, '덱에서 뺄 카드를 고르시오', run.deck, {}, onRemove, () => renderShop(run, { onBuy, onRemove, onLeave }));
  });
  rm.disabled = !canRemove;
  actions.append(rm, button('떠나기', onLeave, 'ghost'));
}

// ── 기연 ─────────────────────────
export function renderEvent(run, { onChoose, onLeave }) {
  const ev = EVENTS[run.event.id];
  const { body, actions } = openPanel(ev.title);
  const p = document.createElement('p');
  p.className = 'event-text';
  p.textContent = run.event.result ?? ev.text;
  body.appendChild(p);
  if (run.event.result) {
    actions.appendChild(button('계속', onLeave));
    return;
  }
  body.classList.add('event');
  const list = document.createElement('div');
  list.className = 'event-options';
  ev.options.forEach((opt, i) => {
    const b = button(`<span>${opt.label}</span><small>${opt.hint}</small>`, () => onChoose(i), 'option');
    b.disabled = !!opt.disabled?.(run);
    list.appendChild(b);
  });
  body.appendChild(list);
}

// ── 판의 끝 ─────────────────────────
export function renderEnd(run, onRestart) {
  const win = run.phase === 'victory';
  const floor = run.position ? Number(run.position.split('-')[0]) + 1 : 0;
  const { body, actions } = openPanel(
    win ? '제1구역 돌파' : '쓰러졌다',
    win
      ? '우승 후보 연무혁의 정체는 마교의 첩자였다.\n무림맹으로 향하는 길이 열렸다… (2구역은 다음 업데이트에서)'
      : '눈앞이 어두워진다…\n(훗날 이곳에서 회귀가 시작됩니다)',
  );
  $('panel').querySelector('.panel-box').classList.add(win ? 'win' : 'lose');
  body.innerHTML = `
    <div class="end-stats">
      <div><b>${floor}</b><span>도달한 층</span></div>
      <div><b>${run.battlesWon}</b><span>이긴 전투</span></div>
      <div><b>${run.deck.length}</b><span>덱 장수</span></div>
      <div><b>${run.gold}</b><span>남은 은자</span></div>
    </div>`;
  actions.appendChild(button('새 판 시작', onRestart));
}

// ── 덱 보기 ─────────────────────────
export function openDeck(run) {
  const modal = $('deck-modal');
  modal.hidden = false;
  const sorted = [...run.deck].sort((a, b) => {
    const order = { attack: 0, defense: 1, skill: 2 };
    return order[CARDS[a.id].type] - order[CARDS[b.id].type] || a.id.localeCompare(b.id);
  });
  modal.innerHTML = `
    <div class="panel-box deck">
      <h2>나의 덱 <small>${run.deck.length}장</small></h2>
      <div class="panel-body card-grid"></div>
      <div class="panel-actions"></div>
    </div>`;
  const body = modal.querySelector('.panel-body');
  for (const card of sorted) body.appendChild(cardFace(card));
  modal.querySelector('.panel-actions').appendChild(button('닫기', () => { modal.hidden = true; }, 'ghost'));
}
