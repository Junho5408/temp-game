// 터치 지원: 마우스를 올려야만 보이던 설명(title)을 탭·길게 누르기로도 보이게 함 (BUG-014)
// - 설명 전용 작은 표시(보물 아이콘, 상태, 적 특성, 행낭 개수): 한 번 탭하면 설명
// - 버튼(행낭 칸, 카드 등): 길게 누르면 설명, 그때는 누른 동작을 취소
const TAP_TARGETS = '.tr-chip, .st, .trait, #bag-top, #intent';
const LONG_MS = 450;

let tipEl = null;
let hideTimer = null;

function tipBox() {
  if (!tipEl) {
    tipEl = document.createElement('div');
    tipEl.id = 'touch-tip';
    tipEl.hidden = true;
    document.getElementById('stage').appendChild(tipEl);
  }
  return tipEl;
}

// 요소의 설명 문구: title 이 있으면 그것, 카드는 이름·설명
function textOf(el) {
  const card = el.closest('.card');
  if (card) {
    // 카드: 이름·설명 + 용어 풀이(title)
    const name = card.querySelector('.cname')?.textContent ?? '';
    const desc = card.querySelector('.desc')?.textContent ?? '';
    const kw = card.getAttribute('title');
    return `${name}: ${desc.replace(/\n/g, ', ')}${kw ? `\n${kw}` : ''}`;
  }
  const holder = el.closest('[title]');
  if (holder?.getAttribute('title')) return holder.getAttribute('title');
  return '';
}

export function showTip(el) {
  const text = textOf(el);
  if (!text) return;
  const stage = document.getElementById('stage');
  const box = tipBox();
  box.textContent = text;
  box.hidden = false;
  // 무대 좌표(960×540 기준)로 위치: 눌린 요소 바로 위
  const sr = stage.getBoundingClientRect();
  const scale = sr.width / 960;
  const r = el.getBoundingClientRect();
  const x = (r.left + r.width / 2 - sr.left) / scale;
  const y = (r.top - sr.top) / scale;
  box.style.left = `${Math.max(120, Math.min(840, x))}px`;
  // 위쪽에 붙은 요소(위쪽 막대 등)는 아래로, 나머지는 위로 띄움
  const below = y < 90;
  box.classList.toggle('below', below);
  box.style.top = below ? `${(r.bottom - sr.top) / scale + 8}px` : `${y - 8}px`;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideTip, 2800);
}

export function hideTip() {
  if (tipEl) tipEl.hidden = true;
}

export function installTouchTips() {
  let pressTimer = null;
  let longPressed = false;

  document.addEventListener('pointerdown', (e) => {
    hideTip();
    longPressed = false;
    if (e.pointerType === 'mouse') return;
    const target = e.target.closest('button, .card, [title]');
    if (!target) return;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      longPressed = true;
      showTip(target);
    }, LONG_MS);
  });
  const cancel = () => clearTimeout(pressTimer);
  document.addEventListener('pointerup', cancel);
  document.addEventListener('pointercancel', cancel);
  document.addEventListener('pointermove', (e) => {
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 6) cancel();
  });

  // 길게 누른 뒤의 클릭은 취소 (카드가 나가거나 물품을 쓰지 않게)
  document.addEventListener('click', (e) => {
    if (longPressed) {
      e.preventDefault();
      e.stopPropagation();
      longPressed = false;
      return;
    }
    const chip = e.target.closest(TAP_TARGETS);
    if (chip) showTip(chip);
  }, true);

  // 길게 누를 때 뜨는 브라우저 메뉴 막기
  document.getElementById('stage').addEventListener('contextmenu', (e) => e.preventDefault());
}
