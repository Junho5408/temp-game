// 밸런스 시뮬레이션 (Balance QA 용): 규칙 코드(src/core)로 봇이 한 판을 끝까지 여러 번 진행
// 실행: node tools/qa/balance.mjs [--n=400] [--run=이름]
// 결과: qa-output/<run>/balance/result.json (+ 콘솔 요약)
// 봇은 "단순한 초보" 기준: 점수 높은 카드부터 쓰고, 행낭 물품은 위급할 때만, 파기·반격 회피는 고려 안 함
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createRun, availableNodes, enterNode, startEncounter, finishBattle, chooseReward, chooseTreasure,
  restHeal, restUpgrade, leaveRest, buyCard, canBuy, leaveShop, chooseEventOption, leaveEvent, advanceZone,
} from '../../src/core/run.js';
import {
  startPlayerTurn, playCard, endPlayerTurn, runEnemyTurn, intentPreview, useItem,
} from '../../src/core/battle.js';
import { cardStats, CARDS } from '../../src/core/cards.js';
import { ENEMIES } from '../../src/core/enemies.js';
import { EVENTS } from '../../src/core/events.js';
import { CONSUMABLES, TREASURES } from '../../src/core/items.js';
import { TRUE_CLUES } from '../../src/core/routes.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (name, def) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=')[1] : def;
};
const N = Number(arg('n', 400));
const FACTION = arg('faction', 'orthodox'); // 세력 루트 (routes.js)
const TRUE_RUN = arg('true', '0') === '1'; // 1 이면 진엔딩 판 (세 길의 단서를 다 모은 회귀 — 귀면 뒤 백리현)
const RUN = arg('run', new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));
const OUT = path.join(ROOT, 'qa-output', RUN, 'balance');
fs.mkdirSync(OUT, { recursive: true });

function score(card, attacking) {
  const c = cardStats(card);
  const v = (c.damage ?? 0) * (c.hits ?? 1) + (c.strength ?? 0) * 6 + (c.draw ?? 0) * 3 + (c.energy ?? 0) * 8
    + (c.weak ?? 0) * (attacking ? 4 : 1.5) + (c.vulnerable ?? 0) * 3
    + (c.evasion ?? 0) * (attacking ? 3 : 0.5) + (c.point ?? 0) * 0.7 + (c.insight ?? 0) * 6
    + (c.poison ?? 0) * 1.5 + (c.gold ?? 0) * 0.3
    - (c.hpCost ?? 0) * 0.8 + (c.lifesteal ? (c.damage ?? 0) * c.lifesteal : 0);
  return v / Math.max(1, c.cost);
}

const stats = {
  enemies: {}, // id → { fights, hpLost, deaths, turns }
  cards: {}, // id → { picked, inWinningDeck, inDeck }
  treasures: {}, // id → { runs, cleared }
  items: {}, // id → used
  zoneEnter: [0, 0, 0, 0],
  zoneClear: [0, 0, 0, 0],
  earlyDeaths: 0,
  battles: 0,
};
const bump = (obj, key, field, n = 1) => {
  obj[key] ??= {};
  obj[key][field] = (obj[key][field] ?? 0) + n;
};

function autoBattle(b) {
  startPlayerTurn(b);
  let guard = 0;
  while (b.phase === 'player' && guard++ < 200) {
    // 위급하면 행낭 물품 (회복·해독 먼저), 아니면 공격 물품은 아낌없이
    for (let i = b.bag.length - 1; i >= 0; i--) {
      const it = CONSUMABLES[b.bag[i]];
      const low = b.player.hp < b.player.maxHp * 0.4;
      if ((it.heal && low) || (it.cleanse && b.player.status.poison >= 4) || (!it.heal && !it.cleanse && low)) {
        bump(stats.items, b.bag[i], 'used');
        useItem(b, i);
      }
    }
    const attacking = intentPreview(b).damage > 0;
    let played = true;
    while (played && b.phase === 'player') {
      played = false;
      for (const c of [...b.hand].sort((x, y) => score(y, attacking) - score(x, attacking))) {
        if (playCard(b, c.uid)) { played = true; break; }
      }
    }
    if (b.phase !== 'player') break;
    endPlayerTurn(b);
    runEnemyTurn(b);
  }
}

for (let seed = 1; seed <= N; seed++) {
  const run = createRun({ seed, faction: FACTION });
  const picked = [];
  let steps = 0;
  stats.zoneEnter[0]++;
  while (!['victory', 'defeat'].includes(run.phase) && steps++ < 400) {
    if (run.phase === 'zoneClear') {
      stats.zoneClear[run.zone]++;
      advanceZone(run, TRUE_RUN ? { clues: Object.values(TRUE_CLUES) } : null);
      stats.zoneEnter[run.zone]++;
      continue;
    }
    if (run.phase === 'map') {
      const o = availableNodes(run);
      const pref = run.hp < run.maxHp * 0.45 ? ['rest', 'shop', 'event', 'battle', 'elite', 'boss'] : ['battle', 'event', 'elite', 'shop', 'rest', 'boss'];
      o.sort((a, b) => pref.indexOf(a.type) - pref.indexOf(b.type));
      enterNode(run, o[0].id);
    } else if (run.phase === 'battle') {
      const id = run.encounter.enemyId;
      const before = run.hp;
      const b = startEncounter(run);
      autoBattle(b);
      finishBattle(run, b);
      stats.battles++;
      bump(stats.enemies, id, 'fights');
      bump(stats.enemies, id, 'hpLost', before - run.hp);
      bump(stats.enemies, id, 'turns', b.turn);
      if (run.phase === 'defeat') bump(stats.enemies, id, 'deaths');
      if (run.phase === 'victory') stats.zoneClear[3]++;
    } else if (run.phase === 'treasure') {
      chooseTreasure(run, 0);
    } else if (run.phase === 'reward') {
      const id = run.reward.cards[0];
      picked.push(id);
      chooseReward(run, 0);
    } else if (run.phase === 'rest') {
      const up = run.deck.find((c) => !c.upgraded);
      if (run.hp < run.maxHp && (run.hp < run.maxHp * 0.75 || !up)) restHeal(run);
      else if (up) restUpgrade(run, up.uid);
      else leaveRest(run);
    } else if (run.phase === 'shop') {
      const i = run.shop.items.findIndex((_, k) => canBuy(run, k));
      if (i >= 0) buyCard(run, i);
      leaveShop(run);
    } else if (run.phase === 'event') {
      const ev = EVENTS[run.event.id];
      chooseEventOption(run, ev.options.findIndex((o) => !o.disabled?.(run)));
      leaveEvent(run);
    }
  }
  if (run.phase === 'defeat' && run.zone === 0 && Number(run.position?.split('-')[0] ?? 0) <= 2) stats.earlyDeaths++;
  const won = run.zonesCleared >= 1; // 카드·보물 평가는 "1구역 돌파" 기준
  for (const id of new Set(run.deck.map((c) => c.id))) {
    bump(stats.cards, id, 'inDeck');
    if (won) bump(stats.cards, id, 'inClearDeck');
  }
  for (const id of picked) bump(stats.cards, id, 'picked');
  for (const id of run.treasures) {
    bump(stats.treasures, id, 'runs');
    if (run.zonesCleared >= 2) bump(stats.treasures, id, 'clearedZone2');
  }
}

// ── 요약 · 이상 신호 ─────────────────────────
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const zones = [0, 1, 2, 3].map((z) => ({
  zone: z === 3 ? '최종 결전' : `${z + 1}구역`, entered: stats.zoneEnter[z], cleared: stats.zoneClear[z], rate: pct(stats.zoneClear[z], stats.zoneEnter[z]),
}));
const enemies = Object.entries(stats.enemies).map(([id, e]) => ({
  id, name: ENEMIES[id].name, tier: ENEMIES[id].tier, fights: e.fights, avgHpLost: Math.round((e.hpLost / e.fights) * 10) / 10,
  deathRate: pct(e.deaths ?? 0, e.fights), avgTurns: Math.round((e.turns / e.fights) * 10) / 10,
})).sort((a, b) => b.deathRate - a.deathRate);
const baseClear = pct(stats.zoneClear[0], N);
const cards = Object.entries(stats.cards).filter(([id]) => CARDS[id].rarity !== 'starter').map(([id, c]) => ({
  id, name: CARDS[id].name, rarity: CARDS[id].rarity, inDeck: c.inDeck ?? 0, clearRateWith: pct(c.inClearDeck ?? 0, c.inDeck ?? 0),
})).sort((a, b) => b.clearRateWith - a.clearRateWith);
const treasures = Object.entries(stats.treasures).map(([id, t]) => ({
  id, name: TREASURES[id].name, runs: t.runs, zone2ClearRate: pct(t.clearedZone2 ?? 0, t.runs),
})).sort((a, b) => b.zone2ClearRate - a.zone2ClearRate);

const flags = [];
if (baseClear < 12 || baseClear > 60) flags.push(`1구역 돌파율 ${baseClear}% (기준 12~60%)`);
if (stats.earlyDeaths > N * 0.05) flags.push(`3층 이하 사망 ${stats.earlyDeaths}판 (기준 ${N * 0.05} 이하)`);
for (const z of zones.slice(1)) if (z.entered >= 20 && (z.rate < 20 || z.rate > 80)) flags.push(`${z.zone} 돌파율 ${z.rate}% (들어간 판 기준, 기준 20~80%)`);
for (const e of enemies) {
  if (e.tier === 'normal' && e.fights >= 30 && e.deathRate > 15) flags.push(`일반 적 ${e.name}(${e.id}) 사망률 ${e.deathRate}% — 너무 셈`);
  if (e.tier === 'normal' && e.fights >= 30 && e.avgHpLost < 3) flags.push(`일반 적 ${e.name}(${e.id}) 평균 피해 ${e.avgHpLost} — 너무 약함`);
  if (e.tier === 'elite' && e.fights >= 30 && e.deathRate > 35) flags.push(`고수 ${e.name}(${e.id}) 사망률 ${e.deathRate}% — 너무 셈`);
}
for (const c of cards) if (c.inDeck >= 40 && c.clearRateWith > baseClear * 2.2) flags.push(`무공 ${c.name}(${c.id}) 가진 판 돌파율 ${c.clearRateWith}% (전체 ${baseClear}%) — 너무 강할 수 있음`);

const result = {
  n: N, bot: '단순 봇 (점수순 카드 사용, 위급 시 물품)', zones, earlyDeaths: stats.earlyDeaths, avgBattles: Math.round((stats.battles / N) * 10) / 10,
  enemies, cards, treasures, items: stats.items, flags,
};
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(result, null, 2));

console.log(`봇 ${N}판 · ${FACTION}${TRUE_RUN ? ' · 진엔딩 판' : ''}`);
for (const z of zones) console.log(`  ${z.zone}: 들어간 ${z.entered} → 돌파 ${z.cleared} (${z.rate}%)`);
console.log(`  3층 이하 사망 ${stats.earlyDeaths}판, 판당 전투 ${result.avgBattles}회`);
console.log('사망률 높은 적:', enemies.slice(0, 6).map((e) => `${e.name} ${e.deathRate}%`).join(', '));
console.log(flags.length ? `이상 신호 ${flags.length}건:\n  - ${flags.join('\n  - ')}` : '이상 신호 없음');
console.log(`결과: ${path.relative(process.cwd(), OUT)}/result.json`);
