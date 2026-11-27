// 전투 밖 화면들: 지도, 보상, 운기조식, 객잔, 기연, 결과, 덱 보기
// 규칙은 src/core/run.js 에 있고, 여기서는 그리기와 클릭만 담당.
import { cardStats, canUpgrade, RARITY_LABEL, TYPE_LABEL, CARDS, cardKeywords } from '../core/cards.js';
import { EVENTS } from '../core/events.js';
import { NODE_TYPES, ROWS } from '../core/map.js';
import { availableNodes, canBuy, canRestHeal, restHealAmount, optionKnown } from '../core/run.js';
import { josa } from '../core/josa.js';
import { runFloor } from '../core/meta.js';
import { mapHeader } from '../story/script.js';
import {
  BAG_SIZE, CONSUMABLES, TREASURES, TREASURE_KIND,
} from '../core/items.js';

const $ = (id) => document.getElementById(id);

// ── 카드 그림 (손패·보상·객잔·덱 공용) ─────────────────────────
export function cardFace(card, { tag = 'div', showKey = false, preview = false } = {}) {
  const c = cardStats(preview ? { ...card, upgraded: true } : card);
  const el = document.createElement(tag);
  if (tag === 'button') el.type = 'button';
  el.className = `card ${c.type}${c.upgraded ? ' upgraded' : ''}`;
  const kw = cardKeywords(c);
  if (kw) el.title = kw;
  requestAnimationFrame(() => fitCardText(el)); // 화면에 붙은 뒤 크기를 재서 맞춤
  el.innerHTML = `
    ${showKey ? '<span class="key"></span><span class="hit"></span>' : ''}
    <span class="cost">${c.cost}</span>
    <span class="cname">${c.displayName}</span>
    <span class="art">${c.glyph}</span>
    <span class="desc">${c.desc}</span>
    <span class="ctype">${TYPE_LABEL[c.type]} · ${RARITY_LABEL[c.rarity]}</span>`;
  return el;
}

// 설명이 카드 틀을 넘치면 글자를 한두 단계 줄임 (BUG-027). 손패처럼 설명을 다시 쓰면 다시 부름
export function fitCardText(el) {
  const d = el.querySelector('.desc');
  if (!d || !d.isConnected) return;
  d.classList.remove('dense', 'denser');
  if (d.scrollHeight > d.clientHeight + 1) d.classList.add('dense');
  if (d.scrollHeight > d.clientHeight + 1) d.classList.add('denser');
}

// 아이템 한 칸: kind = 'item'(행낭 물품, 일시적) | 'treasure'(보물, 영구적)
export function itemFace(kind, id, { tag = 'div' } = {}) {
  const it = kind === 'item' ? CONSUMABLES[id] : TREASURES[id];
  const el = document.createElement(tag);
  if (tag === 'button') el.type = 'button';
  el.className = `item-face ${kind}${kind === 'treasure' ? ` ${it.kind}` : ''}`;
  const label = kind === 'item' ? '행낭 · 한 번 쓰고 사라짐' : `보물 · ${TREASURE_KIND[it.kind]} · 영구`;
  el.innerHTML = `
    <span class="ig">${it.glyph}</span>
    <span class="iname">${it.name}</span>
    <span class="idesc">${it.desc}</span>
    <span class="ikind">${label}</span>`;
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
// 12층 + 두목 = 13열을 한 화면에
const MAP_X0 = 64;
const MAP_DX = 66;
const MAP_Y0 = 136;
const MAP_H = 300;

function nodePos(node) {
  const x = MAP_X0 + node.row * MAP_DX;
  const y = node.count === 1 ? MAP_Y0 + MAP_H / 2 : MAP_Y0 + ((node.col + 0.5) * MAP_H) / node.count;
  // 손으로 그린 지도처럼 살짝 어긋나게 (항상 같은 값)
  const jx = ((node.row * 37 + node.col * 53) % 9) - 4;
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
      <h2>${mapHeader(run.faction, run.zone).title}</h2>
      <p>${mapHeader(run.faction, run.zone).hint}</p>
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
export function renderReward(run, onChoose, onSwap) {
  const r = run.reward;
  let itemLine = '';
  if (r.item) {
    itemLine = r.itemKept
      ? ` · 행낭에 <b class="item-name">${josa(CONSUMABLES[r.item].name, '을/를')}</b> 챙겼다`
      : ` · <b class="item-name">${josa(CONSUMABLES[r.item].name, '이/가')}</b> 있었지만 행낭이 가득 찼다`;
  }
  const { body, actions } = openPanel('승리', `은자 <b class="gold">+${r.gold}냥</b>${itemLine}<br>무공 하나를 골라 익히시오`);
  body.classList.add('card-row');
  // 행낭이 가득해서 못 챙긴 물품: 행낭 한 칸을 버리고 바꿔 넣기 — BUG-013
  if (r.item && !r.itemKept && onSwap) {
    const swap = document.createElement('div');
    swap.className = 'bag-swap';
    swap.innerHTML = `<span>버리고 <b>${josa(CONSUMABLES[r.item].name, '을/를')}</b> 챙기기:</span>`;
    run.bag.forEach((id, i) => {
      if (id === r.item) return; // 같은 물품 칸은 바꿀 의미가 없음 — BUG-025
      const b = button(`${CONSUMABLES[id].glyph} ${CONSUMABLES[id].name}`, () => onSwap(i), 'ghost small');
      swap.appendChild(b);
    });
    $('panel').querySelector('.panel-sub').after(swap);
  }
  run.reward.cards.forEach((id, i) => {
    const el = cardFace({ id }, { tag: 'button' });
    el.addEventListener('click', () => onChoose(i));
    body.appendChild(el);
  });
  actions.appendChild(button('건너뛰기', () => onChoose(null), 'ghost'));
}

// ── 고수 보상: 보물 고르기 ─────────────────────────
export function renderTreasure(run, onPick) {
  const { body, actions } = openPanel('보물', '고수가 지니고 있던 것들이다. 하나를 챙기시오 (판이 끝날 때까지 효과가 이어짐)');
  body.classList.add('item-row');
  run.treasureChoice.forEach((id, i) => {
    const el = itemFace('treasure', id, { tag: 'button' });
    el.addEventListener('click', () => onPick(i));
    body.appendChild(el);
  });
  actions.appendChild(button('건너뛰기', () => onPick(null), 'ghost'));
}

// ── 운기조식 ─────────────────────────
export function renderRest(run, { onHeal, onUpgrade, onLeave }) {
  const heal = Math.min(run.maxHp - run.hp, restHealAmount(run));
  const { body } = openPanel('운기조식', '조용한 곳에서 기혈을 고른다. 한 가지만 할 수 있다.');
  body.classList.add('choice-row');
  const full = !canRestHeal(run);
  const a = button(full ? '<b>息</b><span>휴식</span><small>기혈이 이미 충만하다</small>'
    : `<b>息</b><span>휴식</span><small>체력 +${heal} (${run.hp} → ${run.hp + heal})</small>`, onHeal, 'choice');
  a.disabled = full;
  const upgradable = run.deck.filter(canUpgrade);
  const b = button('<b>鍊</b><span>초식 연마</span><small>카드 1장을 강화(+)</small>', () => {
    pickCard(run, '연마할 초식을 고르시오', upgradable, { preview: true }, onUpgrade, () => renderRest(run, { onHeal, onUpgrade, onLeave }));
  }, 'choice');
  b.disabled = upgradable.length === 0;
  body.append(a, b);
  // 휴식도 연마도 못 하면 그냥 지나가기 (막다른 화면 방지)
  if (a.disabled && b.disabled) {
    $('panel').querySelector('.panel-actions').appendChild(button('지나간다', onLeave, 'ghost'));
  }
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
  const { body, actions } = openPanel('객잔', `가진 은자 <b class="gold">${run.gold}냥</b> · 무공을 가르치는 떠돌이, 행낭 물품과 보물을 파는 장사꾼`);
  body.classList.add('shop-body');
  const cardRow = document.createElement('div');
  cardRow.className = 'card-row shop';
  const goodsRow = document.createElement('div');
  goodsRow.className = 'item-row shop';
  body.append(cardRow, goodsRow);
  run.shop.items.forEach((item, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'shop-item';
    const el = item.kind === 'card' || !item.kind
      ? cardFace({ id: item.id }, { tag: 'button' })
      : itemFace(item.kind, item.id, { tag: 'button' });
    const cant = !canBuy(run, i);
    el.disabled = cant;
    if (item.sold) wrap.classList.add('sold');
    el.addEventListener('click', () => onBuy(i));
    const price = document.createElement('div');
    price.className = `price${run.gold < item.price && !item.sold ? ' short' : ''}`;
    price.textContent = item.sold ? '팔림'
      : item.kind === 'item' && run.bag.length >= BAG_SIZE ? `${item.price}냥 · 행낭 가득`
        : `${item.price}냥`;
    wrap.append(el, price);
    (item.kind === 'card' || !item.kind ? cardRow : goodsRow).appendChild(wrap);
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
    if (!optionKnown(run, opt)) return; // 아직 모르는 미래
    const b = button(`<span>${opt.needClue ? '<b class="foresight">回</b> ' : ''}${opt.label}</span><small>${opt.hint}</small>`, () => onChoose(i), `option${opt.needClue ? ' foresight' : ''}`);
    b.disabled = !!opt.disabled?.(run);
    list.appendChild(b);
  });
  body.appendChild(list);
}

// ── 판의 끝 ─────────────────────────
export function renderEnd(run, onRestart) {
  const win = run.phase === 'victory';
  const floor = run.floor ?? runFloor(run);
  const { body, actions } = openPanel(
    !win ? '쓰러졌다' : run.trueWin ? '진엔딩 · 백 일 뒤의 아침' : '그날 밤을 넘기다',
    !win ? '눈앞이 어두워진다…'
      : run.trueWin ? '배신자 백리현을 쓰러뜨리고, 밀서와 진소하를 지켜 냈다.\n원한이 풀리자 백일취도 깼다. 떠돌이는 처음으로 백 일 뒤의 아침을 맞았다.'
        : '귀면을 쓰러뜨리고 처음으로 살아서 새벽을 보았다.\n그러나 원한은 풀리지 않았다. 눈을 감으면, 다시 백 일 전이다. (일반 엔딩)\n진상의 조각은 세 세력의 길에 흩어져 있다.',
  );
  $('panel').querySelector('.panel-box').classList.add(win ? 'win' : 'lose');
  body.innerHTML = `
    <div class="end-stats">
      <div><b>${floor}</b><span>도달한 층</span></div>
      <div><b>${run.battlesWon}</b><span>이긴 전투</span></div>
      <div><b>${run.deck.length}</b><span>덱 장수</span></div>
      <div><b>${run.gold}</b><span>남은 은자</span></div>
    </div>`;
  actions.appendChild(button('처음 화면으로', onRestart));
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
