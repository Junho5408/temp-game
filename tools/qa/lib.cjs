// QA 도구 공용: 정적 서버, 브라우저, 결과 폴더
// Playwright 는 이 환경에 미리 설치되어 있음 (require('playwright'))
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml',
};

// 게임 폴더를 그대로 내보내는 작은 서버 (빈 포트 자동)
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, url === '/' ? 'index.html' : url);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}/index.html` }));
  });
}

// 결과 폴더: qa-output/<run>/<name>  (run 은 인자 --run 또는 날짜시각)
function outDir(name) {
  const arg = process.argv.find((a) => a.startsWith('--run='));
  const run = arg ? arg.slice(6) : new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dir = path.join(ROOT, 'qa-output', run, name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function argNum(name, def) {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? Number(a.split('=')[1]) : def;
}

async function openGame(url) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 960, height: 540 } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  await page.goto(url);
  return { browser, page, errors };
}

// 저장 상태를 정해서 다시 불러오기
async function setSave(page, meta, run = null) {
  await page.evaluate(([m, r]) => {
    localStorage.clear();
    if (m) localStorage.setItem('temp-game.meta.v1', JSON.stringify(m));
    if (r) localStorage.setItem('temp-game.run.v1', r);
  }, [meta, run]);
  await page.reload();
  await page.waitForTimeout(900);
}

const META_AFTER_PROLOGUE = {
  version: 1, prologueDone: true, runs: 1, deaths: 0, clears: { zone1: 0 }, memories: [], clues: [], bestFloor: 0, met: {},
};

// 대사창 넘기기 (끝나면 돌아옴)
async function skipDialogue(page, max = 120) {
  for (let i = 0; i < max; i++) {
    if (!(await page.isVisible('#dialogue'))) {
      await page.waitForTimeout(350);
      if (!(await page.isVisible('#dialogue'))) return;
    }
    await page.click('#dialogue .dlg-box').catch(() => {});
    await page.waitForTimeout(70);
  }
}

module.exports = { ROOT, startServer, outDir, argNum, openGame, setSave, skipDialogue, META_AFTER_PROLOGUE };
