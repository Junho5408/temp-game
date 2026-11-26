// 기능 점검 (Functional QA 용): 정해진 길을 따라가며 핵심 기능이 동작하는지 확인
// 실행: node tools/qa/smoke.cjs [--run=이름]
// 결과: qa-output/<run>/smoke/result.json + 실패한 점검의 스크린샷
const path = require('path');
const fs = require('fs');
const {
  startServer, outDir, openGame, setSave, skipDialogue, META_AFTER_PROLOGUE,
} = require('./lib.cjs');

const results = [];

async function check(id, title, page, errors, dir, fn) {
  const before = errors.length;
  const started = Date.now();
  try {
    const note = await fn();
    const newErrors = errors.slice(before);
    results.push({ id, title, ok: newErrors.length === 0, note: note ?? '', errors: newErrors, ms: Date.now() - started });
  } catch (e) {
    const shot = path.join(dir, `${id}.png`);
    await page.screenshot({ path: shot }).catch(() => {});
    results.push({ id, title, ok: false, note: String(e.message).split('\n')[0], errors: errors.slice(before), screenshot: shot, ms: Date.now() - started });
  }
  const r = results.at(-1);
  console.log(`${r.ok ? 'PASS' : 'FAIL'} ${id} ${title}${r.ok ? '' : ` — ${r.note} ${r.errors.join(' | ')}`}`);
}

const state = (page) => page.evaluate(() => {
  const g = window.__game;
  return {
    screen: document.getElementById('stage').dataset.screen,
    phase: g.run?.phase ?? null,
    zone: g.run?.zone ?? null,
    hp: g.run?.hp ?? null,
    battle: g.battle ? { php: g.battle.player.hp, ehp: g.battle.enemy.hp, phase: g.battle.phase } : null,
  };
});

function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}

// 지도에서 다음 줄 칸 종류를 강제로 정하고 들어감
async function enterForced(page, type) {
  await page.evaluate((t) => {
    const r = window.__game.run;
    const rowIdx = r.position ? Number(r.position.split('-')[0]) + 1 : 0;
    r.map.rows[rowIdx]?.forEach((n) => { if (n.type !== 'boss') n.type = t; });
  }, type);
  await page.waitForTimeout(150);
  await page.click('.map-node.available', { timeout: 4000 });
  await page.waitForTimeout(700);
}

// 지금 전투를 바로 이기기 (적 체력 1 + 반드시 명중)
async function winBattle(page) {
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const b = window.__game.battle;
    b.enemy.hp = 1; b.enemy.evasion = 0; b.player.missStreak = 9; b.enemy.traits = []; b.enemy.status.counter = 0; b.enemy.phase2Done = true;
  });
  const card = await page.$('#hand .card.attack:not(.disabled)');
  expect(card, '쓸 수 있는 초식 카드가 없음');
  await card.click();
  for (let i = 0; i < 30 && !(await page.isVisible('#dialogue')) && !(await page.isVisible('#panel')); i++) await page.waitForTimeout(250);
  await skipDialogue(page);
}

async function startLife(page) {
  await page.click('#flow .title-actions .btn');
  await page.waitForTimeout(500);
  await skipDialogue(page);
  await page.waitForSelector('#flow .select-grid', { timeout: 8000 });
  await page.click('#flow .panel-actions .btn');
  await page.waitForTimeout(400);
  await skipDialogue(page);
}

(async () => {
  const dir = outDir('smoke');
  const { server, url } = await startServer();
  const { browser, page, errors } = await openGame(url);

  await check('F01', '타이틀 화면이 뜨고 오류가 없음', page, errors, dir, async () => {
    await setSave(page, null);
    expect(await page.isVisible('#flow .title-actions .btn'), '시작 버튼 없음');
  });

  await check('F02', '프롤로그: 대사 → 튜토리얼 전투 2번 → 죽음 → 회귀 → 세력 선택', page, errors, dir, async () => {
    await page.click('#flow .title-actions .btn');
    let battles = 0;
    let lastEnemy = '';
    for (let step = 0; step < 500; step++) {
      if (await page.isVisible('#flow .select-grid')) break;
      if (await page.isVisible('#dialogue')) { await page.click('#dialogue .dlg-box').catch(() => {}); await page.waitForTimeout(60); continue; }
      const st = await state(page);
      if (st.screen === 'battle') {
        const name = await page.textContent('#enemy-info .name').catch(() => '');
        if (name !== lastEnemy) { battles++; lastEnemy = name; }
        const card = await page.$('#hand .card:not(.disabled)');
        if (card && !(await page.isDisabled('#end-turn'))) { await card.click(); await page.waitForTimeout(500); } else if (!(await page.isDisabled('#end-turn'))) { await page.click('#end-turn'); await page.waitForTimeout(1800); } else await page.waitForTimeout(300);
        continue;
      }
      await page.waitForTimeout(250);
    }
    expect(await page.isVisible('#flow .select-grid'), '세력 선택 화면에 도착하지 못함');
    expect(battles === 2, `튜토리얼 전투 수 ${battles} (기대 2)`);
    const meta = await page.evaluate(() => window.__game.meta);
    expect(meta.prologueDone && meta.runs === 1, `기록 이상: ${JSON.stringify(meta)}`);
  });

  await check('F03', '출발 → 구역 시작 대사 → 지도', page, errors, dir, async () => {
    await page.click('#flow .panel-actions .btn');
    await page.waitForTimeout(400);
    await skipDialogue(page);
    const st = await state(page);
    expect(st.screen === 'map' && st.phase === 'map', `지도가 아님: ${JSON.stringify(st)}`);
    expect((await page.$$('.map-node.available')).length > 0, '갈 수 있는 칸이 없음');
  });

  await check('F04', '일반 전투: 카드 사용 → 턴 종료 → 적 행동 → 다음 턴', page, errors, dir, async () => {
    await enterForced(page, 'battle');
    await skipDialogue(page);
    await page.waitForTimeout(1500);
    const s0 = await state(page);
    expect(s0.screen === 'battle', `전투 화면 아님: ${s0.screen}`);
    const card = await page.$('#hand .card:not(.disabled)');
    await card.click();
    await page.waitForTimeout(1200);
    await page.click('#end-turn');
    await page.waitForTimeout(3500);
    const turn = await page.evaluate(() => window.__game.battle?.turn);
    expect(turn >= 2 || (await state(page)).phase !== 'battle', `턴이 넘어가지 않음 (turn ${turn})`);
    if ((await state(page)).phase === 'battle') await winBattle(page);
  });

  await check('F05', '전투 승리 → 보상 화면 → 무공 고르기 → 지도', page, errors, dir, async () => {
    for (let i = 0; i < 10 && !(await page.isVisible('#panel')); i++) await page.waitForTimeout(300);
    const st = await state(page);
    expect(st.phase === 'reward', `보상 단계 아님: ${st.phase}`);
    const deck = await page.evaluate(() => window.__game.run.deck.length);
    await page.click('#panel .card-row .card');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.__game.run.deck.length);
    expect(after === deck + 1, `덱 수 ${deck} → ${after}`);
    expect((await state(page)).phase === 'map', '지도로 돌아오지 않음');
  });

  await check('F06', '운기조식: 휴식하면 체력 회복', page, errors, dir, async () => {
    await page.evaluate(() => { window.__game.run.hp = 30; });
    await enterForced(page, 'rest');
    await page.click('#panel .choice');
    await page.waitForTimeout(300);
    const st = await state(page);
    expect(st.hp > 30 && st.phase === 'map', `체력 ${st.hp}, 단계 ${st.phase}`);
  });

  await check('F07', '객잔: 무공·행낭 물품·보물 구매, 행낭이 가득 차면 물품 구매 불가', page, errors, dir, async () => {
    await page.evaluate(() => { const r = window.__game.run; r.gold = 999; r.bag = []; });
    await enterForced(page, 'shop');
    const kinds = await page.evaluate(() => window.__game.run.shop.items.map((i) => i.kind));
    expect(kinds.includes('card') && kinds.includes('item') && kinds.includes('treasure'), `진열 ${kinds}`);
    const before = await page.evaluate(() => ({ g: window.__game.run.gold, t: window.__game.run.treasures.length }));
    await page.click('.item-row.shop button.item-face.treasure:not(:disabled)');
    await page.waitForTimeout(300);
    const mid = await page.evaluate(() => ({ g: window.__game.run.gold, t: window.__game.run.treasures.length }));
    expect(mid.t === before.t + 1 && mid.g < before.g, `보물 구매 실패 ${JSON.stringify([before, mid])}`);
    await page.evaluate(() => { const r = window.__game.run; r.bag = ['geumchang', 'geumchang', 'geumchang']; });
    // 화면 갱신을 위해 무공 하나 구매
    await page.click('#panel .card-row.shop .card:not(:disabled)');
    await page.waitForTimeout(300);
    const gold = await page.evaluate(() => window.__game.run.gold);
    const disabled = await page.$$eval('.item-row.shop button.item-face.item', (els) => els.every((e) => e.disabled));
    expect(disabled, '행낭이 가득 찼는데 물품 버튼이 눌림');
    await page.click('.item-row.shop button.item-face.item', { force: true }).catch(() => {});
    expect((await page.evaluate(() => window.__game.run.gold)) === gold, '행낭이 가득 찼는데 은자가 빠짐');
    await page.click('#panel .panel-actions .btn.ghost');
    await page.waitForTimeout(300);
  });

  await check('F08', '기연: 선택 → 결과 → 계속 → 지도', page, errors, dir, async () => {
    await enterForced(page, 'event');
    await skipDialogue(page);
    await page.click('#panel .option:not([disabled])');
    await page.waitForTimeout(300);
    await page.click('#panel .panel-actions .btn');
    await page.waitForTimeout(300);
    expect((await state(page)).phase === 'map', '지도로 돌아오지 않음');
  });

  await check('F09', '전투 중 행낭 물품 사용 (금창약 → 체력 회복, 칸 비움)', page, errors, dir, async () => {
    await page.evaluate(() => { const r = window.__game.run; r.bag = ['geumchang']; r.hp = 30; });
    await enterForced(page, 'battle');
    await skipDialogue(page);
    await page.waitForTimeout(1500);
    await page.click('#bag .bag-slot:not(.empty)');
    await page.waitForTimeout(800);
    const b = await page.evaluate(() => ({ hp: window.__game.battle.player.hp, bag: window.__game.battle.bag.length }));
    expect(b.hp === 45 && b.bag === 0, JSON.stringify(b));
    await winBattle(page);
    for (let i = 0; i < 10 && !(await page.isVisible('#panel')); i++) await page.waitForTimeout(300);
    await page.click('#panel .panel-actions .btn.ghost');
    await page.waitForTimeout(300);
  });

  await check('F10', '두목 → 보물 → 무공 → 2구역 (배경·이름 바뀜)', page, errors, dir, async () => {
    await page.evaluate(() => { window.__game.run.map.rows[Number(window.__game.run.position.split('-')[0]) + 1].forEach((n) => { n.type = 'boss'; }); });
    await page.click('.map-node.available');
    await page.waitForTimeout(800);
    await skipDialogue(page);
    await winBattle(page);
    expect((await state(page)).phase === 'treasure', `보물 단계 아님: ${(await state(page)).phase}`);
    await page.click('#panel button.item-face');
    await page.waitForTimeout(300);
    await page.click('#panel .card-row .card');
    await page.waitForTimeout(300);
    await skipDialogue(page);
    const st = await state(page);
    expect(st.zone === 1 && st.phase === 'map', JSON.stringify(st));
    const zoneText = await page.textContent('#topbar .zone');
    expect(zoneText.includes('2구역'), `구역 이름: ${zoneText}`);
  });

  await check('F11', '새로고침 → 이어하기 → 같은 판 그대로', page, errors, dir, async () => {
    const before = await page.evaluate(() => ({ g: window.__game.run.gold, d: window.__game.run.deck.length, z: window.__game.run.zone }));
    await page.reload();
    await page.waitForTimeout(1000);
    const label = await page.textContent('#flow .title-actions .btn');
    expect(label.includes('이어하기'), `첫 버튼: ${label}`);
    await page.click('#flow .title-actions .btn');
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => ({ g: window.__game.run.gold, d: window.__game.run.deck.length, z: window.__game.run.zone }));
    expect(JSON.stringify(before) === JSON.stringify(after), `${JSON.stringify(before)} → ${JSON.stringify(after)}`);
  });

  await check('F12', '2·3구역 두목 → 최종 결전(객잔) → 엔딩 → 기록 저장, 판 저장 삭제', page, errors, dir, async () => {
    for (let z = 1; z <= 2; z++) {
      await page.evaluate(() => { const r = window.__game.run; const i = r.position ? Number(r.position.split('-')[0]) + 1 : 0; r.map.rows[i].forEach((n) => { n.type = 'boss'; }); });
      await page.click('.map-node.available');
      await page.waitForTimeout(800);
      await skipDialogue(page);
      await winBattle(page);
      await page.click('#panel button.item-face').catch(() => {});
      await page.waitForTimeout(300);
      await page.click('#panel .card-row .card').catch(() => {});
      await page.waitForTimeout(300);
      await skipDialogue(page);
    }
    const st = await state(page);
    expect(st.zone === 3 && st.phase === 'battle', `최종 결전 아님: ${JSON.stringify(st)}`);
    await skipDialogue(page);
    await winBattle(page);
    await page.waitForTimeout(600);
    const end = await page.evaluate(() => ({
      phase: window.__game.run?.phase, clears: window.__game.meta.clears, clues: window.__game.meta.clues,
      save: localStorage.getItem('temp-game.run.v1'),
    }));
    expect(end.phase === 'victory', `승리 아님: ${end.phase}`);
    expect(end.clears.final === 1 && end.clears.zone3 === 1, `기록: ${JSON.stringify(end.clears)}`);
    expect(end.save === null, '엔딩 뒤에도 판 저장이 남음');
    await page.click('#panel .panel-actions .btn');
    await page.waitForTimeout(500);
  });

  await check('F13', '죽음 → 무공 기억 → 회귀 → 선택 화면에 기억이 보임', page, errors, dir, async () => {
    await setSave(page, { ...META_AFTER_PROLOGUE, runs: 3 });
    await startLife(page);
    await enterForced(page, 'battle');
    await skipDialogue(page);
    await page.waitForTimeout(1500);
    await page.evaluate(() => { window.__game.run.deck.push({ uid: 999, id: 'flash', upgraded: false }); window.__game.battle.player.hp = 1; window.__game.battle.enemy.intent = { name: '일격', damage: 30, accuracy: 100 }; });
    await page.click('#end-turn');
    for (let i = 0; i < 40 && !(await page.isVisible('#dialogue')); i++) await page.waitForTimeout(250);
    await skipDialogue(page);
    await page.waitForSelector('#flow .card-row .card', { timeout: 6000 });
    await page.click('#flow .card-row .card');
    await page.waitForTimeout(3000);
    await skipDialogue(page);
    await page.waitForSelector('#flow .select-grid', { timeout: 8000 });
    const meta = await page.evaluate(() => window.__game.meta);
    expect(meta.memories.includes('flash') && meta.deaths === 1, JSON.stringify(meta));
    expect((await page.$$('#flow .memory-row .card')).length === 1, '선택 화면에 기억한 무공이 안 보임');
  });

  await check('F14', '기록 화면과 처음부터(초기화)', page, errors, dir, async () => {
    await page.reload();
    await page.waitForTimeout(900);
    const buttons = await page.$$eval('#flow .title-actions .btn', (els) => els.map((e) => e.textContent));
    const recIdx = buttons.findIndex((t) => t.includes('기록'));
    expect(recIdx >= 0, `버튼: ${buttons}`);
    await (await page.$$('#flow .title-actions .btn'))[recIdx].click();
    await page.waitForTimeout(300);
    expect(await page.isVisible('#flow .record'), '기록 화면 안 뜸');
    await page.click('#flow .panel-actions .btn');
    await page.waitForTimeout(300);
    page.once('dialog', (d) => d.accept());
    const resetIdx = buttons.findIndex((t) => t.includes('처음부터'));
    await (await page.$$('#flow .title-actions .btn'))[resetIdx].click();
    await page.waitForTimeout(600);
    const meta = await page.evaluate(() => window.__game.meta);
    expect(!meta.prologueDone && meta.runs === 0, JSON.stringify(meta));
  });

  await browser.close();
  server.close();
  const summary = { total: results.length, passed: results.filter((r) => r.ok).length, results };
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(summary, null, 2));
  console.log(`\n${summary.passed}/${summary.total} 통과 · 결과: ${path.relative(process.cwd(), dir)}/result.json`);
})();
