// 무작위 플레이 (Exploratory QA 용): 시드에 따라 아무 데나 누르고, 가끔 새로고침하며 오류·멈춤을 찾음
// 실행: node tools/qa/monkey.cjs [--seed=1] [--steps=400] [--reload=0.03] [--run=이름]
// 결과: qa-output/<run>/monkey-<seed>/result.json (+ 문제 순간의 스크린샷, 직전 행동 기록)
// 같은 시드면 같은 순서로 행동함 → 재현용
const path = require('path');
const fs = require('fs');
const {
  startServer, outDir, argNum, openGame, setSave, META_AFTER_PROLOGUE,
} = require('./lib.cjs');

const seed = argNum('seed', 1);
const STEPS = argNum('steps', 400);
const RELOAD = argNum('reload', 0.03);

let a = seed >>> 0;
const rnd = () => {
  a = (a + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

(async () => {
  const dir = outDir(`monkey-${seed}`);
  const { server, url } = await startServer();
  const { browser, page, errors } = await openGame(url);
  // 시드에 따라 처음부터(프롤로그) 또는 프롤로그 이후에서 시작
  await setSave(page, seed % 3 === 0 ? null : { ...META_AFTER_PROLOGUE, runs: 1 + (seed % 7), memories: seed % 2 ? ['flash'] : [] });
  page.on('dialog', (d) => d.accept()); // confirm 창은 수락

  const trace = [];
  const problems = [];
  let lastSig = '';
  let sameFor = 0;
  let errorsSeen = 0;

  const snapshot = () => page.evaluate(() => {
    const g = window.__game;
    const sc = document.getElementById('stage').dataset.screen;
    return {
      screen: sc,
      phase: g.run?.phase ?? null,
      zone: g.run?.zone ?? null,
      pos: g.run?.position ?? null,
      hp: g.battle ? g.battle.player.hp : g.run?.hp ?? null,
      ehp: g.battle?.enemy.hp ?? null,
      turn: g.battle?.turn ?? null,
      gold: g.run?.gold ?? null,
      dialogue: document.getElementById('dialogue').hidden ? null : (document.querySelector('#dialogue .dlg-text')?.textContent ?? '').slice(0, 30),
      hand: g.battle?.hand.length ?? null,
      energy: g.battle?.player.energy ?? null,
    };
  });

  async function record(kind, detail) {
    const shot = path.join(dir, `problem-${problems.length + 1}.png`);
    await page.screenshot({ path: shot }).catch(() => {});
    problems.push({ kind, detail, step: trace.length, state: await snapshot().catch(() => null), lastActions: trace.slice(-25), screenshot: shot });
    console.log(`문제 ${kind}: ${detail}`);
  }

  for (let step = 0; step < STEPS; step++) {
    let action = '';
    try {
      if (rnd() < RELOAD) {
        action = 'reload';
        await page.reload();
        await page.waitForTimeout(700);
      } else {
        // 지금 누를 수 있는 것들 중 하나
        const targets = await page.$$eval(
          '#dialogue:not([hidden]) .dlg-box, #dialogue:not([hidden]) .dlg-skip, #flow:not([hidden]) button:not(:disabled), #panel:not([hidden]) button:not(:disabled), #deck-modal:not([hidden]) button, #map-screen:not([hidden]) .map-node.available, #stage[data-screen="battle"] #hand .card:not(.disabled), #stage[data-screen="battle"] #end-turn:not(:disabled), #stage[data-screen="battle"] #bag .bag-slot:not(:disabled), #deck-button',
          (els) => {
            document.querySelectorAll('[data-mk]').forEach((e) => e.removeAttribute('data-mk'));
            // 덱 보기 창이 열려 있으면 그 안의 버튼만 (뒤에 가려진 것은 사람도 못 누름)
            const modal = document.getElementById('deck-modal');
            const visible = els.filter((e) => e.offsetParent !== null && (modal.hidden || modal.contains(e)));
            return visible.map((e, i) => {
            e.dataset.mk = String(i);
              return { i, label: (e.innerText || e.className).replace(/\s+/g, ' ').slice(0, 40), id: e.id, cls: e.className };
            });
          },
        );
        if (targets.length === 0) {
          action = 'wait';
          await page.waitForTimeout(400);
        } else {
          // 대사창은 자주 넘기고, 덱 보기는 가끔만
          const dlg = targets.filter((t) => t.cls.includes('dlg-box'));
          const pool = dlg.length && rnd() < 0.9 ? dlg : targets.filter((t) => t.id !== 'deck-button' || rnd() < 0.05);
          const t = pick(pool.length ? pool : targets);
          action = `click ${t.id ? `#${t.id}` : t.cls.split(' ')[0]} "${t.label}"`;
          await page.click(`[data-mk="${t.i}"]`, { timeout: 2000 });
          await page.waitForTimeout(t.cls.includes('card') || t.id === 'end-turn' ? 900 : 180);
        }
      }
    } catch (e) {
      action += ` (실패: ${String(e.message).split('\n')[0].slice(0, 80)})`;
    }
    const st = await snapshot().catch(() => null);
    trace.push({ step, action, state: st });

    if (errors.length > errorsSeen) {
      await record('error', errors.slice(errorsSeen).join(' | '));
      errorsSeen = errors.length;
    }
    // 같은 상태로 오래 머묾 = 멈춤 의심 (전투 중 적 차례 연출 시간 고려)
    const sig = JSON.stringify(st);
    sameFor = sig === lastSig ? sameFor + 1 : 0;
    lastSig = sig;
    if (sameFor === 25) await record('stuck', `25번 행동하는 동안 상태 변화 없음: ${sig}`);
    if (st?.hp !== null && st?.hp < 0) await record('invalid', `체력이 음수: ${st.hp}`);
    if (st?.gold !== null && st?.gold < 0) await record('invalid', `은자가 음수: ${st.gold}`);
  }

  const end = await snapshot().catch(() => null);
  const meta = await page.evaluate(() => window.__game.meta).catch(() => null);
  await browser.close();
  server.close();
  const result = { seed, steps: STEPS, problems, end, meta, reached: [...new Set(trace.map((t) => t.state?.screen))], trace: trace.slice(-60) };
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(result, null, 2));
  console.log(`시드 ${seed}: ${STEPS}걸음, 문제 ${problems.length}건, 마지막 ${JSON.stringify(end)} · 결과: ${path.relative(process.cwd(), dir)}/result.json`);
})();
