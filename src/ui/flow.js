// 판 바깥의 흐름 화면: 타이틀, 기록, 세력·계열 선택, 무공 기억, 회귀 연출
import { CARDS } from '../core/cards.js';
import { memorySlots } from '../core/meta.js';
import { ROUTES, PASSIVE_TEXT, isFactionOpen, TRUE_CLUES } from '../core/routes.js';
import { CLUES } from '../story/script.js';
import { CLASSES, DESIGNS, FACTIONS } from './characters.js';
import { cardFace } from './screens.js';

const $ = (id) => document.getElementById(id);

function overlay() {
  const el = $('flow');
  el.hidden = false;
  el.className = '';
  return el;
}

export function hideFlow() {
  $('flow').hidden = true;
  $('flow').innerHTML = '';
}

function btn(label, onClick, cls = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `btn ${cls}`;
  b.innerHTML = label;
  b.addEventListener('click', onClick);
  return b;
}

// ── 타이틀 ─────────────────────────
export function renderTitle(meta, {
  saved, onContinue, onStart, onRecord, onReset,
}) {
  const el = overlay();
  el.classList.add('title-screen');
  const fresh = !meta.prologueDone;
  el.innerHTML = `
    <div class="title-wrap">
      <div class="title-seal">百日</div>
      <h1>백일회귀</h1>
      <p class="title-sub">억울하게 죽은 그날로부터, 백 일 전</p>
      <div class="title-actions"></div>
      ${fresh ? '' : `<p class="title-meta">${meta.runs}번째 생 · 쓰러진 횟수 ${meta.deaths} · 기억한 무공 ${meta.memories.length}</p>`}
      <p class="title-note">임시 제목 · temp-game</p>
    </div>`;
  const actions = el.querySelector('.title-actions');
  if (saved) {
    actions.appendChild(btn(`이어하기 <small>${saved.zone} · 체력 ${saved.hp}/${saved.maxHp}</small>`, onContinue));
    actions.appendChild(btn('이 생을 버리고 백 일 전으로', () => {
      if (window.confirm('진행 중인 판을 포기할까요? 쓰러진 것으로 기록되고, 이번 생의 무공은 기억하지 못합니다.')) onStart();
    }, 'ghost'));
  } else {
    actions.appendChild(btn(fresh ? '시작하기' : '다시 백 일 전으로', onStart));
  }
  if (!fresh) {
    actions.appendChild(btn('기록', onRecord, 'ghost'));
    actions.appendChild(btn('처음부터', () => {
      if (window.confirm('모든 기록(회차, 기억한 무공, 단서)을 지우고 프롤로그부터 다시 할까요?')) onReset();
    }, 'ghost small'));
  }
}

// ── 기록 ─────────────────────────
export function renderRecord(meta, onBack) {
  const el = overlay();
  el.classList.add('flow-panel');
  el.innerHTML = `
    <div class="panel-box record">
      <h2>회귀의 기록</h2>
      <div class="end-stats">
        <div><b>${meta.runs}</b><span>살아 본 생</span></div>
        <div><b>${meta.deaths}</b><span>쓰러진 횟수</span></div>
        <div><b>${meta.bestFloor}</b><span>가장 높이 오른 층</span></div>
        <div><b>${meta.clears.zone1}</b><span>1구역 돌파</span></div>
        <div><b>${meta.clears.zone2 ?? 0}</b><span>2구역 돌파</span></div>
        <div><b>${meta.clears.zone3 ?? 0}</b><span>3구역 돌파</span></div>
        <div><b>${meta.clears.final ?? 0}</b><span>그날 밤을 넘김</span></div>
      </div>
      <div class="route-stats">
        ${Object.entries(ROUTES).filter(([f]) => meta.routeStats?.[f]?.runs).map(([f, r]) => {
    const st = meta.routeStats[f];
    return `<span><b>${r.name}</b> ${st.runs}번 · 최고 ${st.bestZone >= 3 ? '그날 밤' : `${st.bestZone}구역 돌파`} · 넘김 ${st.wins}</span>`;
  }).join('')}
      </div>
      <h3>기억한 무공</h3>
      <div class="card-grid small"></div>
      <h3>그날 밤의 진상 <small>${Object.values(TRUE_CLUES).filter((id) => meta.clues.includes(id)).length} / 3</small></h3>
      <p class="truth">${Object.entries(TRUE_CLUES).map(([f, id]) => `<span class="${meta.clues.includes(id) ? 'got' : ''}">${ROUTES[f].name}: ${meta.clues.includes(id) ? CLUES[id].title : '? ? ?'}</span>`).join('')}</p>
      ${meta.clears.trueEnd ? `<p class="truth-done">진엔딩 ${meta.clears.trueEnd}번 — ${CLUES.traitorName.title}</p>` : ''}
      <h3>알아낸 단서</h3>
      ${meta.clues.length
    ? `<ul class="clue-list">${meta.clues.map((id) => `<li><b>${CLUES[id]?.title ?? id}</b><span>${CLUES[id]?.text ?? ''}</span></li>`).join('')}</ul>`
    : '<p class="panel-sub">아직 없다. 그날 밤의 일은 여전히 안개 속이다.</p>'}
      <div class="panel-actions"></div>
    </div>`;
  const grid = el.querySelector('.card-grid');
  if (meta.memories.length === 0) grid.outerHTML = '<p class="panel-sub">아직 없다. 죽음은 아무것도 남기지 않았다.</p>';
  for (const id of meta.memories) grid.appendChild(cardFace({ id }));
  el.querySelector('.panel-actions').appendChild(btn('돌아가기', onBack, 'ghost'));
}

// ── 세력 · 계열 선택 + 들고 갈 기억 ─────────────────────────
// 지금은 계열 중 검객만, 세력은 회귀 기록에 따라 열림 (routes.js)
const OPEN_CLASSES = new Set(['sword']);

export function renderSelect(meta, onDepart) {
  const el = overlay();
  el.classList.add('flow-panel');
  const slots = memorySlots(meta, 1); // 곧 시작할 판 기준
  const chosen = new Set(meta.memories.slice(0, slots));
  let pick = 'orthodox-sword';

  el.innerHTML = `
    <div class="panel-box select">
      <h2>이번 생은 어디로 갈 것인가</h2>
      <p class="panel-sub">세력과 무공 계열을 고르시오 · <span class="passive">${PASSIVE_TEXT.orthodox}</span></p>
      <div class="select-body">
        <div class="select-grid"></div>
        <div class="memory-area">
          <h3>들고 갈 기억 <small>${slots}개까지</small></h3>
          <div class="memory-row"></div>
          <div class="panel-actions"></div>
        </div>
      </div>
    </div>`;

  const grid = el.querySelector('.select-grid');
  grid.append(document.createElement('div'));
  for (const c of Object.values(CLASSES)) {
    const h = document.createElement('div');
    h.className = 'sg-head';
    h.textContent = c.name;
    grid.append(h);
  }
  for (const [fid, f] of Object.entries(FACTIONS)) {
    const label = document.createElement('div');
    label.className = 'sg-faction';
    label.textContent = f.name;
    label.style.color = f.color;
    grid.append(label);
    for (const cid of Object.keys(CLASSES)) {
      const key = `${fid}-${cid}`;
      const d = DESIGNS[key];
      const open = OPEN_CLASSES.has(cid) && isFactionOpen(meta, fid);
      const why = !OPEN_CLASSES.has(cid) ? '아직 열리지 않은 길'
        : ROUTES[fid].ready ? ROUTES[fid].unlock?.text ?? '' : '준비 중인 길';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `sg-cell${open ? '' : ' locked'}${key === pick ? ' picked' : ''}`;
      b.disabled = !open;
      b.innerHTML = `<img src="${d.portrait}" alt=""><span>${d.title}</span>${open ? '' : `<em>${why}</em>`}`;
      b.addEventListener('click', () => {
        pick = key;
        grid.querySelectorAll('.sg-cell').forEach((x) => x.classList.toggle('picked', x === b));
        el.querySelector('.passive').textContent = PASSIVE_TEXT[fid];
      });
      grid.append(b);
    }
  }

  const row = el.querySelector('.memory-row');
  if (meta.memories.length === 0) {
    row.innerHTML = '<p class="panel-sub">아직 기억한 무공이 없다. 죽음에서 무언가를 건져 오면 여기에 남는다.</p>';
  }
  for (const id of meta.memories) {
    const face = cardFace({ id }, { tag: 'button' });
    face.classList.toggle('chosen', chosen.has(id));
    face.addEventListener('click', () => {
      if (chosen.has(id)) chosen.delete(id);
      else if (chosen.size < slots) chosen.add(id);
      face.classList.toggle('chosen', chosen.has(id));
    });
    row.appendChild(face);
  }

  el.querySelector('.panel-actions').appendChild(btn('출발', () => onDepart(pick, [...chosen])));
}

// ── 죽은 뒤: 기억할 무공 고르기 ─────────────────────────
export function renderMemoryPick(candidates, meta, onPick) {
  const el = overlay();
  el.classList.add('flow-panel', 'dark');
  el.innerHTML = `
    <div class="panel-box memory">
      <h2>무엇을 기억할 것인가</h2>
      <p class="panel-sub">이번 생에서 익힌 무공 하나는 회귀해도 몸이 잊지 않는다</p>
      <div class="card-row"></div>
      <div class="panel-actions"></div>
    </div>`;
  const row = el.querySelector('.card-row');
  if (candidates.length === 0) {
    row.innerHTML = '<p class="panel-sub">이번 생에서는 새로 익힌 무공이 없다…</p>';
    el.querySelector('.panel-actions').appendChild(btn('눈을 감는다', () => onPick(null)));
    return;
  }
  for (const id of candidates) {
    const wrap = document.createElement('div');
    wrap.className = 'shop-item';
    const face = cardFace({ id }, { tag: 'button' });
    face.addEventListener('click', () => onPick(id));
    wrap.appendChild(face);
    if (meta.memories.includes(id)) {
      const tag = document.createElement('div');
      tag.className = 'price';
      tag.textContent = '이미 기억함';
      wrap.appendChild(tag);
    }
    row.appendChild(wrap);
  }
}

// ── 회귀 연출 ─────────────────────────
export function playRegression() {
  return new Promise((resolve) => {
    const el = $('regress');
    el.hidden = false;
    el.innerHTML = '<div class="rg-text">百日前</div>';
    el.classList.remove('run');
    void el.offsetWidth;
    el.classList.add('run');
    setTimeout(() => {
      el.hidden = true;
      el.classList.remove('run');
      resolve();
    }, 2600);
  });
}

export function cardNameOf(id) {
  return CARDS[id]?.name ?? id;
}
