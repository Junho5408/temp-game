// 처리된 스프라이트를 실제 전투 화면에 넣어 본 스크린샷 (게임 코드를 바꾸지 않고, 적 그림 요청만 바꿔치기)
// 사용: node tools/art/preview.cjs <assets/characters/새그림.webp> <출력.png> [--as=player]
// 기본은 적 자리(좌우 반전). --as=player 면 주인공 자리. 발 위치는 바꿔치기한 그림의 값을 따르므로 대략적인 모습.
const path = require('path');
const fs = require('fs');
const { startServer, openGame, setSave, META_AFTER_PROLOGUE, ROOT } = require('../qa/lib.cjs');

const [sprite, outFile] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const asPlayer = process.argv.includes('--as=player');
if (!sprite || !outFile) {
  console.error('사용: node tools/art/preview.cjs <스프라이트.webp> <출력.png> [--as=player]');
  process.exit(1);
}

(async () => {
  const { createRun, serializeRun } = await import(path.join(ROOT, 'src/core/run.js'));
  const run = createRun({ seed: 5, faction: 'unorthodox' });
  run.map.rows[0].forEach((n) => { n.type = 'boss'; }); // 사파 1구역 두목 = boss-gang 그림 자리를 빌림
  const { server, url } = await startServer();
  const { browser, page, errors } = await openGame(url);
  const target = asPlayer ? 'orthodox-sword.webp' : 'boss-gang.webp';
  const body = fs.readFileSync(path.resolve(ROOT, sprite));
  await page.route(`**/assets/characters/${target}*`, (route) => route.fulfill({ body, contentType: 'image/webp' }));
  await setSave(page, { ...META_AFTER_PROLOGUE, runs: 3, clears: { zone1: 1 } }, serializeRun(run));
  await page.click('#flow .title-actions .btn');
  for (let i = 0; i < 80; i++) {
    if (await page.evaluate(() => window.__game.battle?.phase === 'player')) break;
    if (await page.isVisible('#dialogue')) await page.click('#dialogue .dlg-box').catch(() => {});
    else if (await page.isVisible('.map-node.available')) await page.click('.map-node.available').catch(() => {});
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(3800); // 두목 이름 띠가 사라질 때까지
  await page.screenshot({ path: outFile });
  console.log(outFile, errors.length ? `오류 ${errors.length}` : '');
  await browser.close();
  server.close();
})();
