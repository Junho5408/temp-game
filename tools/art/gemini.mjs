// Gemini 이미지 생성 도구: 그림 규칙(docs/art/STYLE.md)의 공통 스타일 + 캐릭터 설명으로 그림을 요청하고 후보를 저장한다.
//
// 사용:
//   node tools/art/gemini.mjs --list-models
//   node tools/art/gemini.mjs --key=npc-boki --desc="A timid young inn server boy ..." [--ref=docs/reference/npc-juno-raw.webp] [--n=2] [--run=이름]
//   node tools/art/gemini.mjs --key=npc-boki --prompt-file=path.txt    (공통 스타일까지 직접 쓴 전체 프롬프트)
//
// 결과: qa-output/<run>/art/<key>/cand-<n>.png (+ prompt.txt, result.json). git 에 올리지 않음.
//   승인된 후보만 docs/reference/<key>-raw.png 로 옮기고 tools/prepare_sprite.py 로 처리한다 (/art 스킬).
//
// API 키: 환경의 네트워크 비밀(generativelanguage.googleapis.com · 헤더 x-goog-api-key)로 프록시가 붙여 줌.
//   키가 환경 변수 GEMINI_API_KEY 에 있으면 그것을 씀. 키 값은 출력하지 않는다.
// 모델: --model= 또는 환경 변수 GEMINI_IMAGE_MODEL, 기본은 DEFAULT_MODEL. 바뀌었으면 --list-models 로 확인.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const API = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.5-flash-image';

const args = process.argv.slice(2);
const arg = (name, def) => args.find((x) => x.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const all = (name) => args.filter((x) => x.startsWith(`--${name}=`)).map((x) => x.slice(name.length + 3));
const flag = (name) => args.includes(`--${name}`);

// curl 로 요청 (Node fetch 는 프록시 설정이 따로 필요해서 curl 을 씀)
function call(method, url, body) {
  const headers = ['-H', 'Content-Type: application/json'];
  // 키는 프록시가 붙임. 로컬 환경 변수에 있으면 그것을 씀 (출력하지 않음)
  headers.push('-H', `x-goog-api-key: ${process.env.GEMINI_API_KEY || 'injected-by-proxy'}`);
  const tmp = body ? path.join(ROOT, 'qa-output', `.gemini-req-${process.pid}.json`) : null;
  if (tmp) {
    fs.mkdirSync(path.dirname(tmp), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(body));
  }
  const r = spawnSync('curl', ['-sS', '-X', method, ...headers, ...(tmp ? ['--data-binary', `@${tmp}`] : []), '-w', '\n%{http_code}', url], {
    encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
  });
  if (tmp) fs.rmSync(tmp, { force: true });
  if (r.status !== 0) throw new Error(`curl 실패: ${r.stderr.trim()}`);
  const cut = r.stdout.lastIndexOf('\n');
  const status = Number(r.stdout.slice(cut + 1));
  let json = null;
  try { json = JSON.parse(r.stdout.slice(0, cut)); } catch { /* 본문이 JSON 이 아님 */ }
  return { status, json, raw: r.stdout.slice(0, Math.min(cut, 600)) };
}

function explain(res) {
  const msg = res.json?.error?.message ?? res.raw;
  if (res.status === 403 || res.status === 401 || /API key/i.test(msg)) {
    return `${res.status} 권한 없음: ${msg}\n→ 환경 설정의 네트워크 비밀(호스트 generativelanguage.googleapis.com, 헤더 x-goog-api-key)에 Gemini API 키가 있는지, 새 세션인지 확인`;
  }
  if (res.status === 429) return `429 사용 한도 초과: ${msg}\n→ Google AI Studio 의 요금제·한도 확인, 잠시 뒤 다시`;
  if (res.status === 404) return `404 모델 없음: ${msg}\n→ --list-models 로 이미지 모델 이름 확인 후 --model= 로 지정`;
  return `${res.status}: ${msg}`;
}

// 그림 규칙의 공통 스타일 문장 (STYLE.md 의 <!-- style --> … <!-- /style --> 사이)
function commonStyle() {
  const md = fs.readFileSync(path.join(ROOT, 'docs/art/STYLE.md'), 'utf8');
  const m = md.match(/<!-- style -->\s*```[^\n]*\n([\s\S]*?)```\s*<!-- \/style -->/);
  if (!m) throw new Error('docs/art/STYLE.md 에서 공통 스타일 블록을 찾지 못함');
  return m[1].trim();
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

if (flag('list-models')) {
  const res = call('GET', `${API}/models?pageSize=200`);
  if (res.status !== 200) {
    console.error(explain(res));
    process.exit(1);
  }
  const models = res.json.models ?? [];
  const image = models.filter((m) => /image/i.test(m.name) || /image/i.test(m.description ?? ''));
  console.log('이미지 관련 모델:');
  for (const m of image) console.log(`  ${m.name.replace('models/', '')}  — ${m.displayName ?? ''} [${(m.supportedGenerationMethods ?? []).join(', ')}]`);
  console.log(`(전체 ${models.length}개 중 ${image.length}개)`);
  process.exit(0);
}

const key = arg('key');
if (!key || !/^[a-z0-9-]+$/.test(key)) {
  console.error('--key=<세력-계열 또는 npc-이름 또는 boss-이름> 이 필요함 (영문 소문자·숫자·-)');
  process.exit(1);
}
const promptFile = arg('prompt-file');
const desc = arg('desc');
if (!promptFile && !desc) {
  console.error('--desc="캐릭터 설명(영문)" 또는 --prompt-file=<전체 프롬프트> 가 필요함');
  process.exit(1);
}
const prompt = promptFile ? fs.readFileSync(promptFile, 'utf8').trim() : `${commonStyle()}\n\n${desc}`;
const refs = all('ref');
const n = Math.max(1, Math.min(4, Number(arg('n', 2))));
const model = arg('model', process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL);
const run = arg('run', `art-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`);
const out = path.join(ROOT, 'qa-output', run, 'art', key);
fs.mkdirSync(out, { recursive: true });

const parts = [];
if (refs.length) {
  parts.push({ text: 'Reference images for art style only (line weight, coloring, shading, proportions). Draw a NEW character as described below, not these characters.' });
  for (const r of refs) {
    const ext = path.extname(r).toLowerCase();
    if (!MIME[ext]) throw new Error(`참고 이미지 형식 모름: ${r}`);
    parts.push({ inline_data: { mime_type: MIME[ext], data: fs.readFileSync(path.resolve(ROOT, r)).toString('base64') } });
  }
}
parts.push({ text: prompt });
fs.writeFileSync(path.join(out, 'prompt.txt'), `${prompt}\n\n# 모델: ${model}\n# 참고 이미지: ${refs.join(', ') || '없음'}\n`);

const results = [];
const existing = fs.readdirSync(out).filter((f) => /^cand-\d+\.png$/.test(f)).length;
for (let i = 0; i < n; i++) {
  const res = call('POST', `${API}/models/${model}:generateContent`, {
    contents: [{ role: 'user', parts }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '1:1' } },
  });
  if (res.status !== 200) {
    console.error(explain(res));
    results.push({ ok: false, status: res.status });
    if ([401, 403, 404, 429].includes(res.status) || /API key/i.test(res.json?.error?.message ?? '')) break;
    continue;
  }
  const outParts = res.json.candidates?.[0]?.content?.parts ?? [];
  const img = outParts.find((p) => p.inlineData || p.inline_data);
  const text = outParts.filter((p) => p.text).map((p) => p.text).join(' ').trim();
  if (!img) {
    const why = res.json.candidates?.[0]?.finishReason ?? res.json.promptFeedback?.blockReason ?? '이미지 없음';
    console.error(`후보 ${i + 1}: 그림이 오지 않음 (${why}) ${text.slice(0, 200)}`);
    results.push({ ok: false, reason: why, text });
    continue;
  }
  const data = (img.inlineData ?? img.inline_data).data;
  const file = path.join(out, `cand-${existing + i + 1}.png`);
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  results.push({ ok: true, file: path.relative(ROOT, file), text });
  console.log(`후보 저장: ${path.relative(ROOT, file)}`);
}
fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ key, model, refs, results }, null, 2));
const ok = results.filter((r) => r.ok).length;
console.log(`${ok}/${n}장 받음 → ${path.relative(ROOT, out)}/`);
process.exit(ok ? 0 : 1);
