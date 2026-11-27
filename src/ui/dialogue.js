// 대화 시스템: 대사 목록을 한 줄씩 보여줌
// 클릭·터치·Enter·Space 로 다음 줄 (글자가 나오는 중이면 한 번에 다 보여줌)
// "건너뛰기" 로 장면 전체를 넘김
import { SPEAKERS } from '../story/script.js';
import { getPortrait } from './portraits.js';

const $ = (id) => document.getElementById(id);
const CHAR_MS = 26;

export function playDialogue(lines) {
  const root = $('dialogue');
  root.hidden = false;
  root.innerHTML = `
    <button type="button" class="dlg-skip">건너뛰기 ≫</button>
    <div class="dlg-box">
      <div class="dlg-portrait"></div>
      <div class="dlg-main">
        <div class="dlg-name"></div>
        <div class="dlg-text"></div>
      </div>
      <div class="dlg-next">▼</div>
    </div>`;
  const box = root.querySelector('.dlg-box');
  const portraitEl = root.querySelector('.dlg-portrait');
  const nameEl = root.querySelector('.dlg-name');
  const textEl = root.querySelector('.dlg-text');

  return new Promise((resolve) => {
    let i = -1;
    let typing = null;
    let full = '';

    function finish() {
      cleanup();
      root.hidden = true;
      root.innerHTML = '';
      resolve();
    }

    async function show(idx) {
      const line = lines[idx];
      const sp = SPEAKERS[line.who] ?? { name: line.who };
      const narr = line.who === 'narr';
      box.classList.toggle('narr', narr);
      box.classList.toggle('thought', !!line.thought);
      box.classList.toggle('me', line.who === 'me');
      nameEl.textContent = narr ? '' : sp.name;
      portraitEl.replaceChildren();
      portraitEl.hidden = narr;
      if (!narr) {
        const pic = sp.art ? await getPortrait(sp.art) : null;
        if (pic) {
          if (i === idx) {
            pic.classList.toggle('flip', line.who !== 'me');
            portraitEl.appendChild(pic);
          }
        } else {
          portraitEl.innerHTML = `<span class="seal">${sp.glyph ?? sp.name[0]}</span>`;
        }
      }
      full = line.text;
      textEl.textContent = '';
      let n = 0;
      clearInterval(typing);
      typing = setInterval(() => {
        n += 1;
        textEl.textContent = full.slice(0, n);
        if (n >= full.length) {
          clearInterval(typing);
          typing = null;
        }
      }, CHAR_MS);
    }

    function next() {
      if (typing) {
        clearInterval(typing);
        typing = null;
        textEl.textContent = full;
        return;
      }
      i += 1;
      if (i >= lines.length) finish();
      else show(i);
    }

    function onKey(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'Escape') {
        finish();
      }
    }
    function onClick(e) {
      if (e.target.closest('.dlg-skip')) return;
      next();
    }
    function cleanup() {
      clearInterval(typing);
      window.removeEventListener('keydown', onKey, true);
      root.removeEventListener('click', onClick);
    }

    root.querySelector('.dlg-skip').addEventListener('click', finish);
    root.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey, true);
    next();
  });
}
