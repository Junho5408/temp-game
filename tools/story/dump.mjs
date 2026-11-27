// 스토리 점검 도구: 게임 코드에 들어 있는 대사·기연·단서를 세력 루트 순서대로 뽑아 읽기 좋은 대본으로 만들고,
// 기계적으로 확인할 수 있는 것(화자·그림·단서 연결·진엔딩 도달 가능성·줄 길이)을 검사한다.
// 사용: node tools/story/dump.mjs --run=<이름>
// 결과: qa-output/<run>/story/script-<세력>.md, script-common.md, checks.json (git 제외)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from '../../src/story/script.js';
import { EVENTS } from '../../src/core/events.js';
import { ENEMIES, TRUE_BOSS } from '../../src/core/enemies.js';
import { ROUTES, FACTION_IDS, TRUE_CLUES } from '../../src/core/routes.js';
import { createMeta } from '../../src/core/meta.js';
import { createRun } from '../../src/core/run.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (name, def) => process.argv.find((x) => x.startsWith(`--${name}=`))?.split('=')[1] ?? def;
const RUN = arg('run', `story-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`);
const OUT = path.join(ROOT, 'qa-output', RUN, 'story');
fs.mkdirSync(OUT, { recursive: true });

const LONG_LINE = 90; // 대사창 한 줄로 읽기 버거운 길이 (글자)
const problems = []; // { level: 'error'|'warn', where, msg }
const report = (level, where, msg) => problems.push({ level, where, msg });

const artExists = (art) => fs.existsSync(path.join(ROOT, 'assets', 'characters', `${art}.webp`));

// 대사 묶음 → 마크다운 + 검사
function lines(where, arr) {
  if (!arr || arr.length === 0) return '_(대사 없음)_\n';
  if (!Array.isArray(arr)) {
    report('error', where, '대사가 배열이 아님');
    return '';
  }
  return `${arr.map((l, i) => {
    const at = `${where} #${i + 1}`;
    if (!l || typeof l.text !== 'string' || !l.text.trim()) report('error', at, '빈 대사');
    const sp = S.SPEAKERS[l?.who];
    if (!sp) report('error', at, `화자 "${l?.who}" 가 SPEAKERS 에 없음`);
    for (const part of (l?.text ?? '').split('\n')) {
      if (part.length > LONG_LINE) report('warn', at, `한 줄이 ${part.length}자 (권장 ${LONG_LINE}자 이하)`);
    }
    const who = l?.who === 'narr' ? '지문' : (sp?.name ?? l?.who);
    const text = (l?.text ?? '').replace(/\n/g, ' / ');
    return `- **${who}**${l?.thought ? ' (속마음)' : ''}: ${text}`;
  }).join('\n')}\n`;
}

// ── 화자·그림 ─────────────────
for (const [id, sp] of Object.entries(S.SPEAKERS)) {
  if (sp.art && !artExists(sp.art) && !sp.glyph) report('warn', `SPEAKERS.${id}`, `그림 ${sp.art}.webp 가 없고 한자 인장(glyph)도 없음`);
}

// ── 단서: 정의·얻는 곳 ─────────────────
const clueSources = {}; // clue → [어디서]
const addSource = (clue, where) => { (clueSources[clue] ??= []).push(where); };
for (const [id, e] of Object.entries(ENEMIES)) if (e.clue) addSource(e.clue, `적 ${id}`);
const eventsSrc = fs.readFileSync(path.join(ROOT, 'src/core/events.js'), 'utf8');
for (const [id, ev] of Object.entries(EVENTS)) {
  for (const opt of ev.options ?? []) {
    for (const m of String(opt.effect).matchAll(/addClue\('([^']+)'\)/g)) addSource(m[1], `기연 ${id}`);
  }
}
for (const m of eventsSrc.matchAll(/addClue\('([^']+)'\)/g)) if (!clueSources[m[1]]) addSource(m[1], 'events.js');
for (const id of Object.keys(clueSources)) if (!S.CLUES[id]) report('error', `단서 ${id}`, `${clueSources[id].join(', ')} 에서 주는데 CLUES 에 정의 없음`);
for (const id of Object.keys(S.CLUES)) if (!clueSources[id]) report('warn', `CLUES.${id}`, '정의는 있는데 얻는 곳이 없음');

// 세력별로 실제로 만날 수 있는 적·기연
function routeContent(f) {
  const pools = ROUTES[f].pools;
  const enemies = new Set();
  pools.forEach((z) => Object.values(z).flat().forEach((id) => enemies.add(id)));
  enemies.add(ROUTES[f].finalBoss);
  const events = Object.entries(EVENTS).filter(([, ev]) => ev.story && (ev.route ?? 'orthodox') === f).map(([id]) => id);
  return { enemies, events };
}
for (const [f, clue] of Object.entries(TRUE_CLUES)) {
  const { enemies, events } = routeContent(f);
  const ok = (clueSources[clue] ?? []).some((w) => (w.startsWith('적 ') && enemies.has(w.slice(2))) || (w.startsWith('기연 ') && events.includes(w.slice(3))));
  if (!ok) report('error', `진엔딩 단서 ${f}`, `핵심 단서 "${clue}" 를 ${ROUTES[f].name} 판에서 얻을 수 없음 → 진엔딩 불가`);
}

// ── 세력 대본 ─────────────────
const metaNone = createMeta();
const metaAll = createMeta();
metaAll.clues = Object.keys(S.CLUES);
metaAll.runs = 8;

function factionScript(f) {
  const { enemies } = routeContent(f);
  const name = ROUTES[f].name;
  let md = `# ${name} 루트 대본\n\n> 자동 추출 (tools/story/dump.mjs). 게임 안 순서대로: 판 시작 → 구역마다 (구역 소개 · 이야기 기연 · 고수/두목 전후 대사 · 구역 돌파) → 그날 밤\n\n`;
  md += `## 판 시작 (첫 판 / 단서를 모두 모은 뒤)\n${lines(`${f} 판 시작`, S.zone1Start(metaNone, f))}\n${lines(`${f} 판 시작(단서)`, S.zone1Start(metaAll, f))}\n`;
  const pools = ROUTES[f].pools;
  for (let z = 0; z < pools.length; z++) {
    md += `## ${S.zoneName(f, z)} (배경 ${S.zoneBackground(f, z)})\n\n### 구역 소개\n${lines(`${f} ${z + 1}구역 소개`, S.zoneIntro(z, metaNone, f))}\n`;
    const evs = Object.entries(EVENTS).filter(([, ev]) => ev.story && (ev.route ?? 'orthodox') === f && (ev.zone ?? 0) === z);
    for (const [id, ev] of evs) {
      md += `### 이야기 기연: ${ev.title} (${id}, ${ev.minRow ?? 0}층 이후)\n`;
      for (const n of [1, 2, 3]) {
        let intro = null;
        try { intro = S.npcIntro(ev.intro ?? ev.npc, n, metaAll); } catch (err) { report('error', `기연 ${id}`, `npcIntro 오류: ${err.message}`); }
        if (intro) md += `#### 만남 ${n}번째\n${lines(`기연 ${id} 만남${n}`, intro)}`;
      }
      md += `\n> ${ev.text.replace(/\n/g, ' / ')}\n\n`;
      for (const opt of ev.options) {
        let result = '';
        try {
          const run = createRun({ seed: 1, faction: f });
          run.gold = 999;
          run.zone = z;
          const api = { addClue: () => {}, removeFirst: () => true, addCard: () => {}, addItem: () => true };
          result = opt.effect(run, run.rng, api) ?? '';
        } catch (err) {
          result = `(결과 문구를 뽑지 못함: ${err.message})`;
        }
        md += `- 선택 **${opt.label}** (${opt.hint ?? ''}) → ${String(result).replace(/\n/g, ' / ')}\n`;
      }
      md += '\n';
    }
    const ids = [...new Set(Object.values(pools[z]).flat())].filter((id) => ENEMIES[id].tier !== 'normal' || S.battleIntro(id, false));
    for (const id of ids) {
      const e = ENEMIES[id];
      const intro = S.battleIntro(id, false);
      const outro = S.battleOutro(id, false);
      const outroKnown = S.battleOutro(id, true);
      if (!intro && !outro) {
        if (e.tier === 'boss') report('warn', `${f} 두목 ${id}`, '두목인데 전후 대사가 없음');
        continue;
      }
      md += `### ${e.tier === 'boss' ? '두목' : e.tier === 'elite' ? '고수' : '적'} ${e.name} (${e.title})${e.clue ? ` — 단서 ${e.clue}` : ''}\n`;
      md += `전투 전\n${lines(`${f} ${id} 전`, intro)}전투 후\n${lines(`${f} ${id} 후`, outro)}`;
      if (JSON.stringify(outroKnown) !== JSON.stringify(outro)) md += `전투 후 (단서를 이미 알 때)\n${lines(`${f} ${id} 후(앎)`, outroKnown)}`;
      md += '\n';
    }
    md += `### 구역 돌파\n${lines(`${f} ${z + 1}구역 돌파`, S.zoneClearLines(z, f))}\n`;
  }
  if (!enemies.has(ROUTES[f].finalBoss)) report('error', f, '최종 두목이 없음');
  return md;
}

for (const f of FACTION_IDS) fs.writeFileSync(path.join(OUT, `script-${f}.md`), factionScript(f));

// ── 공통 (프롤로그·회귀·죽음·그날 밤·엔딩) ─────────────────
let common = '# 공통 대본\n\n';
common += `## 프롤로그\n${lines('프롤로그 시작', S.PROLOGUE_INTRO)}\n### 첫 싸움 뒤\n${lines('프롤로그 첫 싸움 뒤', S.PROLOGUE_AFTER_THUG)}\n### 죽음\n${lines('프롤로그 죽음', S.PROLOGUE_DEATH)}\n`;
common += '## 회귀 직후 (회차별)\n';
for (const n of [2, 3, 4, 5, 6, 10]) common += `### ${n}번째 생\n${lines(`회귀 ${n}`, S.wakeLines(n))}`;
common += `\n## 죽음\n${lines('죽음', S.deathLines('두칠'))}\n`;
common += `## 그날 밤 (귀면)\n${lines('그날 밤', S.FINAL_INTRO)}\n### 일반 엔딩\n${lines('일반 엔딩', S.ENDING)}\n`;
common += `## 진엔딩 (세 길의 핵심 단서: ${Object.entries(TRUE_CLUES).map(([f, c]) => `${ROUTES[f].name} ${c}`).join(', ')})\n### 백리현 등장\n${lines('진엔딩 등장', S.TRUE_BRIDGE)}\n### 백리현 전투 전\n${lines('백리현 전', S.battleIntro(TRUE_BOSS, false))}\n### 진엔딩\n${lines('진엔딩', S.TRUE_ENDING)}\n`;
common += '## 단서 목록\n';
for (const [id, c] of Object.entries(S.CLUES)) common += `- **${id}** · ${c.title} — ${c.text} _(얻는 곳: ${(clueSources[id] ?? ['없음']).join(', ')})_\n`;
fs.writeFileSync(path.join(OUT, 'script-common.md'), common);

const errors = problems.filter((p) => p.level === 'error');
fs.writeFileSync(path.join(OUT, 'checks.json'), JSON.stringify({ run: RUN, errors: errors.length, warnings: problems.length - errors.length, problems }, null, 2));
console.log(`스토리 대본·검사 → ${path.relative(ROOT, OUT)}/`);
console.log(`  오류 ${errors.length}건, 주의 ${problems.length - errors.length}건`);
for (const p of problems.slice(0, 15)) console.log(`  [${p.level}] ${p.where}: ${p.msg}`);
if (problems.length > 15) console.log(`  … 나머지는 checks.json`);
