import { ORTHODOX_CARDS_EXT } from './cards-orthodox.js';
import { UNORTHODOX_CARDS_EXT } from './cards-unorthodox.js';
import { DEMONIC_CARDS_EXT } from './cards-demonic.js';
// 카드 정의 (검객)
// 방어 개념은 없음: 체력은 깎이기만 하고 지도의 운기조식에서 회복. 대신 경공으로 피한다.
// type: attack(초식) / skill(심법·보법)
// rarity: starter(시작 덱 전용) / common(일반) / uncommon(고급) / rare(희귀)
// 효과 필드
//   damage, hits        피해 (타수, 기본 1)
//   accuracy            명중률 % (기본 90, 상대 회피율만큼 깎임)
//   sure                필중 (반드시 명중)
//   crit                치명 확률 +n% (기본 10%)
//   bonusIfAttacking    적이 이번에 공격을 예고했으면 한 타 피해 +n
//   combo               연계: 이번 턴에 이미 초식을 썼으면 한 타 피해 +n
//   comboHits           연계: 이번 턴에 이미 초식을 썼으면 타수 +n
//   perAttack           이번 턴에 앞서 쓴 초식 한 장마다 한 타 피해 +n
//   point               점혈 게이지 +n (가득 차면 적이 한 차례 굳음)
//   evasion             경공 +n (적의 다음 차례 동안 회피율 +10%씩)
//   insight             간파: 다음 초식 한 장이 반드시 명중하고 치명
//   draw / energy / strength / vulnerable / weak
//   poison              중독 n (초식은 맞았을 때, 심법은 바로)
//   dirty               비열한 수: 적이 흐트러짐·중독·굳음 상태면 한 타 피해 2배 (dirtyBonus: +n)
//   gold                은자 +n (전투가 끝나면 판에 더해짐)
//   faction             그 세력 판에서만 보상·객잔에 나옴 (routes.js)
//   hpCost              체력을 대가로 씀 (남은 체력이 대가보다 많아야 쓸 수 있음)
//   lifesteal           준 피해의 n 비율만큼 체력 회복
// upgrade: 연마(+)했을 때 바뀌는 값

export const CARDS = {
  // ── 시작 덱 ─────────────────
  strike: {
    name: '기본 검법', type: 'attack', rarity: 'starter', glyph: '劍',
    cost: 1, damage: 6,
    upgrade: { damage: 9 },
  },
  feint: {
    name: '견제', type: 'attack', rarity: 'starter', glyph: '牽',
    cost: 1, damage: 4, weak: 1, accuracy: 95,
    upgrade: { damage: 6, weak: 2 },
  },
  yusu: {
    name: '유수검', type: 'attack', rarity: 'starter', glyph: '流',
    cost: 2, damage: 7, hits: 2,
    upgrade: { damage: 9 },
  },
  lightBody: {
    name: '경신법', type: 'skill', rarity: 'starter', glyph: '輕',
    cost: 1, evasion: 3,
    upgrade: { evasion: 5 },
  },

  // ── 일반 ─────────────────
  quick: {
    name: '쾌검', type: 'attack', rarity: 'common', glyph: '快',
    cost: 0, damage: 4, accuracy: 95,
    upgrade: { damage: 6 },
  },
  chain: {
    name: '연환검', type: 'attack', rarity: 'common', glyph: '連',
    cost: 1, damage: 4, hits: 2, comboHits: 1,
    upgrade: { damage: 5 },
  },
  rend: {
    name: '파쇄검', type: 'attack', rarity: 'common', glyph: '破',
    cost: 1, damage: 6, vulnerable: 2,
    upgrade: { damage: 8, vulnerable: 3 },
  },
  sway: {
    name: '흘려베기', type: 'attack', rarity: 'common', glyph: '斜',
    cost: 1, damage: 5, weak: 2,
    upgrade: { damage: 7, weak: 3 },
  },
  footwork: {
    name: '보법', type: 'skill', rarity: 'common', glyph: '步',
    cost: 0, draw: 1, evasion: 1,
    upgrade: { draw: 2 },
  },
  focus: {
    name: '검기 집중', type: 'skill', rarity: 'common', glyph: '集',
    cost: 1, strength: 1, draw: 1,
    upgrade: { draw: 2 },
  },
  pointStrike: {
    name: '점혈수', type: 'attack', rarity: 'common', glyph: '點',
    cost: 1, damage: 4, point: 5, accuracy: 95,
    upgrade: { damage: 6, point: 7 },
  },
  followUp: {
    name: '추혼검', type: 'attack', rarity: 'common', glyph: '追',
    cost: 1, damage: 5, combo: 5,
    upgrade: { damage: 7, combo: 7 },
  },
  cloudStep: {
    name: '운룡보', type: 'skill', rarity: 'common', glyph: '雲',
    cost: 1, evasion: 4, draw: 1,
    upgrade: { evasion: 6 },
  },

  // ── 고급 ─────────────────
  flash: {
    name: '일섬', type: 'attack', rarity: 'uncommon', glyph: '閃',
    cost: 2, damage: 15, accuracy: 85, crit: 15,
    upgrade: { damage: 20 },
  },
  counter: {
    name: '역류검', type: 'attack', rarity: 'uncommon', glyph: '逆',
    cost: 1, damage: 6, bonusIfAttacking: 6,
    upgrade: { damage: 8, bonusIfAttacking: 8 },
  },
  whirl: {
    name: '회선검', type: 'attack', rarity: 'uncommon', glyph: '旋',
    cost: 2, damage: 4, hits: 3,
    upgrade: { damage: 6 },
  },
  breathe: {
    name: '운기행공', type: 'skill', rarity: 'uncommon', glyph: '運',
    cost: 1, strength: 2,
    upgrade: { strength: 3 },
  },
  gather: {
    name: '기 모으기', type: 'skill', rarity: 'uncommon', glyph: '聚',
    cost: 0, energy: 1,
    upgrade: { energy: 1, draw: 1 },
  },
  insight: {
    name: '간파', type: 'skill', rarity: 'uncommon', glyph: '見',
    cost: 1, insight: 1, draw: 1,
    upgrade: { cost: 0 },
  },
  oneFinger: {
    name: '일지선', type: 'attack', rarity: 'uncommon', glyph: '指',
    cost: 2, damage: 7, point: 10, sure: true,
    upgrade: { damage: 9, point: 13 },
  },
  triple: {
    name: '연환삼식', type: 'attack', rarity: 'uncommon', glyph: '三',
    cost: 1, damage: 3, hits: 2, comboHits: 2,
    upgrade: { damage: 4 },
  },
  phantom: {
    name: '이형환위', type: 'skill', rarity: 'uncommon', glyph: '影',
    cost: 2, evasion: 6, strength: 1,
    upgrade: { evasion: 8 },
  },

  // ── 희귀 ─────────────────
  heavenWind: {
    name: '천풍검', type: 'attack', rarity: 'rare', glyph: '天',
    cost: 3, damage: 28, accuracy: 90,
    upgrade: { damage: 36 },
  },
  swordRain: {
    name: '검우', type: 'attack', rarity: 'rare', glyph: '雨',
    cost: 2, damage: 3, hits: 5,
    upgrade: { damage: 4 },
  },
  stillMind: {
    name: '무념무상', type: 'skill', rarity: 'rare', glyph: '無',
    cost: 2, strength: 4,
    upgrade: { strength: 5 },
  },
  meteor: {
    name: '유성낙화', type: 'attack', rarity: 'rare', glyph: '星',
    cost: 1, damage: 4, perAttack: 4,
    upgrade: { damage: 6, perAttack: 5 },
  },
  deathPoint: {
    name: '사혈점', type: 'attack', rarity: 'rare', glyph: '死',
    cost: 2, damage: 13, point: 9, sure: true,
    upgrade: { damage: 17, point: 13 },
  },

  // ══ 사파 무공 (암수) — 독·암기·돈 ══════════════
  dagger: {
    name: '단도 찌르기', type: 'attack', rarity: 'starter', glyph: '匕', faction: 'unorthodox',
    cost: 1, damage: 4, dirtyBonus: 2,
    upgrade: { damage: 6 },
  },
  flyingKnife: {
    name: '비수', type: 'attack', rarity: 'common', glyph: '鏢', faction: 'unorthodox',
    cost: 1, damage: 5, thrown: 5,
    upgrade: { damage: 7, thrown: 8 },
  },
  venomBlade: {
    name: '독 바른 칼', type: 'attack', rarity: 'common', glyph: '毒', faction: 'unorthodox',
    cost: 1, damage: 4, poison: 2,
    upgrade: { damage: 5, poison: 4 },
  },
  sandThrow: {
    name: '모래 뿌리기', type: 'skill', rarity: 'common', glyph: '沙', faction: 'unorthodox',
    cost: 1, weak: 1, draw: 1,
    upgrade: { cost: 0 },
  },
  switchGrip: {
    name: '칼 바꿔 쥐기', type: 'skill', rarity: 'common', glyph: '換', faction: 'unorthodox',
    cost: 0, redraw: true,
    upgrade: { redraw: true, draw: 1 },
  },
  needle: {
    name: '독침', type: 'attack', rarity: 'common', glyph: '針', faction: 'unorthodox',
    cost: 0, damage: 2, poison: 2, thrown: 2, thrownPoison: 3,
    upgrade: { poison: 3, thrownPoison: 4 },
  },
  legSweep: {
    name: '발 걸기', type: 'skill', rarity: 'common', glyph: '絆', faction: 'unorthodox',
    cost: 1, weak: 1, vulnerable: 1, draw: 1,
    upgrade: { vulnerable: 2 },
  },
  caltrops: {
    name: '마름쇠', type: 'skill', rarity: 'common', glyph: '菱', faction: 'unorthodox',
    cost: 1, poison: 2, thrown: 3, thrownPoison: 2,
    upgrade: { poison: 4, thrownPoison: 4 },
  },
  lowBlow: {
    name: '비열한 일격', type: 'attack', rarity: 'uncommon', glyph: '卑', faction: 'unorthodox',
    cost: 1, damage: 6, dirty: true,
    upgrade: { damage: 8 },
  },
  extort: {
    name: '협박', type: 'skill', rarity: 'uncommon', glyph: '脅', faction: 'unorthodox',
    cost: 1, gold: 12, draw: 1,
    upgrade: { gold: 18 },
  },
  bribe: {
    name: '매수', type: 'skill', rarity: 'uncommon', glyph: '賂', faction: 'unorthodox',
    cost: 0, goldCost: 25, bribe: true, exhaust: true,
    upgrade: { goldCost: 15 },
  },
  poisonBurst: {
    name: '독 터뜨리기', type: 'attack', rarity: 'uncommon', glyph: '爆', faction: 'unorthodox',
    cost: 1, burst: 3,
    upgrade: { burst: 4 },
  },
  knifeFan: {
    name: '비도 난사', type: 'skill', rarity: 'uncommon', glyph: '散', faction: 'unorthodox',
    cost: 1, throwAll: true, draw: 2,
    upgrade: { draw: 3 },
  },
  poisonMist: {
    name: '독무', type: 'skill', rarity: 'uncommon', glyph: '瘴', faction: 'unorthodox',
    cost: 2, poison: 8,
    upgrade: { poison: 11 },
  },
  purseThrow: {
    name: '전낭 던지기', type: 'attack', rarity: 'uncommon', glyph: '錢', faction: 'unorthodox',
    cost: 1, goldCost: 10, damage: 17, sure: true,
    upgrade: { damage: 23 },
  },
  backstab: {
    name: '뒤통수', type: 'attack', rarity: 'rare', glyph: '背', faction: 'unorthodox',
    cost: 2, damage: 11, sure: true, crit: 30, dirty: true,
    upgrade: { damage: 14 },
  },
  flowerRain: {
    name: '만천화우', type: 'attack', rarity: 'rare', glyph: '雨', faction: 'unorthodox',
    cost: 2, damage: 3, hits: 4, poison: 3, thrown: 8, thrownPoison: 3,
    upgrade: { hits: 6 },
  },
  fivePoison: {
    name: '오독수', type: 'skill', rarity: 'rare', glyph: '五', faction: 'unorthodox',
    cost: 2, poisonKeep: true, poison: 3, exhaust: true,
    upgrade: { cost: 1 },
  },
  blackDeal: {
    name: '흑도 거래', type: 'skill', rarity: 'rare', glyph: '契', faction: 'unorthodox',
    cost: 0, goldCost: 20, energy: 1, draw: 2,
    upgrade: { energy: 2 },
  },

  // ══ 마교 무공 (혈공) — 피·마기·입마 ══════════════
  // 성능이 좋은 마공은 쓸 때 '입마' 카드가 이번 전투 덱에 섞임 (curse)
  bloodClaw: {
    name: '혈조', type: 'attack', rarity: 'starter', glyph: '爪', faction: 'demonic',
    cost: 1, damage: 7, magi: 1,
    upgrade: { damage: 10, magi: 2 },
  },
  demonHeart: {
    name: '천마심법', type: 'skill', rarity: 'starter', glyph: '心', faction: 'demonic',
    cost: 1, hpCost: 3, magi: 3, draw: 1,
    upgrade: { cost: 0, magi: 4 },
  },
  bloodSword: {
    name: '혈검', type: 'attack', rarity: 'common', glyph: '血', faction: 'demonic',
    cost: 1, hpCost: 3, damage: 12,
    upgrade: { damage: 16 },
  },
  bloodMist: {
    name: '혈무', type: 'skill', rarity: 'common', glyph: '霧', faction: 'demonic',
    cost: 1, evasion: 3, weak: 1,
    upgrade: { evasion: 5 },
  },
  magiAbsorb: {
    name: '마기 흡수', type: 'skill', rarity: 'common', glyph: '吞', faction: 'demonic',
    cost: 1, purge: true, magi: 1, draw: 1,
    upgrade: { magi: 2, draw: 2 },
  },
  magiBlade: {
    name: '마기 일격', type: 'attack', rarity: 'common', glyph: '斬', faction: 'demonic',
    cost: 1, damage: 5, magiSpend: 3,
    upgrade: { magiSpend: 4 },
  },
  lastStand: {
    name: '사생결단', type: 'attack', rarity: 'common', glyph: '決', faction: 'demonic',
    cost: 1, damage: 7, desperate: 7,
    upgrade: { damage: 9, desperate: 9 },
  },
  bloodCycle: {
    name: '혈기 역행', type: 'skill', rarity: 'common', glyph: '逆', faction: 'demonic',
    cost: 0, hpCost: 4, magi: 2, draw: 2,
    upgrade: { hpCost: 2 },
  },
  starSuck: {
    name: '흡성대법', type: 'attack', rarity: 'common', glyph: '吸', faction: 'demonic',
    cost: 1, damage: 5, lifesteal: 1,
    upgrade: { damage: 7 },
  },
  drainStrike: {
    name: '흡혈 일섬', type: 'attack', rarity: 'uncommon', glyph: '飮', faction: 'demonic',
    cost: 2, damage: 13, lifesteal: 0.5, magi: 1,
    upgrade: { damage: 17 },
  },
  bloodRage: {
    name: '마공 폭주', type: 'skill', rarity: 'uncommon', glyph: '狂', faction: 'demonic',
    cost: 0, hpCost: 4, energy: 2, curse: 1,
    upgrade: { energy: 2, draw: 1 },
  },
  magiBurst: {
    name: '마령 폭발', type: 'attack', rarity: 'uncommon', glyph: '爆', faction: 'demonic',
    cost: 2, damage: 10, magiSpend: 5, curse: 1,
    upgrade: { magiSpend: 6 },
  },
  frenzy: {
    name: '혈투 광란', type: 'attack', rarity: 'uncommon', glyph: '亂', faction: 'demonic',
    cost: 2, damage: 5, hits: 3, desperate: 4,
    upgrade: { damage: 6, desperate: 5 },
  },
  demonGuard: {
    name: '마공 호체', type: 'skill', rarity: 'uncommon', glyph: '護', faction: 'demonic',
    cost: 1, evasion: 4, magi: 2,
    upgrade: { evasion: 6 },
  },
  bloodSea: {
    name: '혈해', type: 'skill', rarity: 'uncommon', glyph: '海', faction: 'demonic',
    cost: 1, bloodSea: true, magi: 2, exhaust: true,
    upgrade: { cost: 0 },
  },
  bloodOath: {
    name: '피의 맹세', type: 'skill', rarity: 'rare', glyph: '誓', faction: 'demonic',
    cost: 1, hpCost: 5, strength: 6, curse: 1,
    upgrade: { strength: 8 },
  },
  heavenDemonBlade: {
    name: '천마혈검', type: 'attack', rarity: 'rare', glyph: '魔', faction: 'demonic',
    cost: 2, hpCost: 5, damage: 10, hits: 3, curse: 1,
    upgrade: { damage: 13 },
  },
  dissolution: {
    name: '천마해체대법', type: 'skill', rarity: 'rare', glyph: '解', faction: 'demonic',
    cost: 0, magiDouble: true, energy: 1, curse: 2, exhaust: true,
    upgrade: { energy: 2 },
  },
  demonDescent: {
    name: '마신강림', type: 'attack', rarity: 'rare', glyph: '降', faction: 'demonic',
    cost: 3, damage: 24, magiSpend: 4, sure: true, curse: 2,
    upgrade: { damage: 30 },
  },

  // ── 입마(入魔): 마공의 대가. 이번 전투 동안만 덱에 섞임, 쓸 수 없음 ──
  // 턴이 끝날 때 손에 남아 있으면 체력 -2, 마기 +1
  qiDeviation: {
    name: '입마', type: 'curse', rarity: 'curse', glyph: '魘',
    cost: 0, unplayable: true,
  },
};

Object.assign(CARDS, ORTHODOX_CARDS_EXT, UNORTHODOX_CARDS_EXT, DEMONIC_CARDS_EXT);

for (const [id, c] of Object.entries(CARDS)) {
  c.id = id;
  if (!c.faction && c.rarity !== 'curse') c.faction = 'orthodox';
  if (!c.cls && c.rarity !== 'curse') c.cls = 'sword'; // 8-A 계열 (검객·권사·살수), school = 류파 (schools.js)
}

// 정파 시작 덱: 기본 검법 5 + 견제 3 + 유수검 1 + 경신법 1
export const STARTER_DECK = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'feint', 'feint', 'feint',
  'yusu', 'lightBody',
];
// 사파 시작 덱: 단도 찌르기 5 + 독 바른 칼 2 + 모래 뿌리기 1 + 비수 1 + 칼 바꿔 쥐기 1
export const UNORTHODOX_DECK = [
  'dagger', 'dagger', 'dagger', 'dagger', 'dagger',
  'venomBlade', 'venomBlade', 'sandThrow',
  'flyingKnife', 'switchGrip',
];
// 마교 시작 덱: 혈조 4 + 혈검 2 + 마기 일격 1 + 혈무 1 + 마기 흡수 1 + 천마심법 1 (7-B: 마기를 쓰는 무공을 처음부터)
export const DEMONIC_DECK = [
  'bloodClaw', 'bloodClaw', 'bloodClaw', 'bloodClaw',
  'bloodSword', 'bloodSword', 'magiBlade', 'bloodMist',
  'magiAbsorb', 'demonHeart',
];

export const RARITY_LABEL = { starter: '기본', common: '일반', uncommon: '고급', rare: '희귀', curse: '입마' };
export const TYPE_LABEL = { attack: '초식', skill: '심법', curse: '입마' };

// 카드 한 장(인스턴스)의 실제 수치: 연마했으면 upgrade 값을 덮어씀
export function cardStats(card) {
  const base = CARDS[card.id];
  const stats = card.upgraded ? { ...base, ...base.upgrade } : { ...base };
  stats.upgraded = !!card.upgraded;
  stats.displayName = card.upgraded ? `${base.name}+` : base.name;
  stats.desc = describe(stats);
  return stats;
}

export function describe(c) {
  const lines = [];
  if (c.damage) {
    let line = c.hits > 1 ? `피해 ${c.damage} × ${c.hits}` : `피해 ${c.damage}`;
    if (c.comboHits) line += ` (연계 시 × ${(c.hits ?? 1) + c.comboHits})`;
    lines.push(line);
  }
  if (c.sure) lines.push('필중');
  if (c.crit) lines.push(`치명 +${c.crit}%`);
  if (c.combo) lines.push(`연계: 피해 +${c.combo}`);
  if (c.perAttack) lines.push(`앞선 초식마다 +${c.perAttack}`);
  if (c.bonusIfAttacking) lines.push(`공격 예고 시 +${c.bonusIfAttacking}`);
  if (c.point) lines.push(`점혈 ${c.point}`);
  if (c.poison) lines.push(`중독 ${c.poison}`);
  if (c.dirty) lines.push('약화 시 2배');
  if (c.dirtyBonus) lines.push(`약화 시 +${c.dirtyBonus}`);
  if (c.gold) lines.push(`은자 +${c.gold}`);
  if (c.lifesteal) lines.push(`흡혈 ${Math.round(c.lifesteal * 100)}%`);
  if (c.hpCost) lines.push(`체력 -${c.hpCost}`);
  if (c.goldCost) lines.push(`은자 -${c.goldCost}`);
  if (c.burst) lines.push(`중독 × ${c.burst} 피해\n중독은 사라짐`);
  if (c.desperate) lines.push(`혈투: 체력 절반 이하 +${c.desperate}`);
  if (c.magiSpend) lines.push(`마기 1마다 +${c.magiSpend} (모두 씀)`);
  if (c.vulnerable) lines.push(`내상 ${c.vulnerable}턴`);
  if (c.weak) lines.push(`흐트러짐 ${c.weak}턴`);
  if (c.evasion) lines.push(`경공 +${c.evasion}`);
  if (c.opener) lines.push(`첫 수면 +${c.opener}`);
  if (c.riposte) lines.push(`반격 ${c.riposte}`);
  if (c.guard) lines.push(`호신 ${c.guard}`);
  if (c.insight) lines.push('간파: 다음 초식 필중·치명');
  if (c.strength) lines.push(`기세 +${c.strength}`);
  if (c.energy) lines.push(`내공 +${c.energy}`);
  if (c.swordQi) lines.push(`검기: 앞서 쓴 카드마다 +${c.swordQi}`);
  if (c.bloodPact) lines.push(`혈계 10당 +${c.bloodPact}`);
  if (c.consumeCurse) lines.push(`입마 1장 태워 +${c.consumeCurse}`);
  if (c.steal) lines.push(`적 기세 ${c.steal} 훔치기`);
  if (c.trap) lines.push(`함정: ${fxText(c.trap)}`);
  if (c.power) lines.push(`매 턴: ${fxText(c.power)}`);
  if (c.redraw) lines.push('손패를 버리고 다시 뽑기');
  if (c.throwAll) lines.push('손패의 암기 모두 던지기');
  if (c.draw) lines.push(`카드 ${c.draw}장 뽑기`);
  if (c.bribe) lines.push('묶기 · 두목 亂2');
  if (c.poisonKeep) lines.push('적 중독이 줄지 않음');
  if (c.magi) lines.push(`마기 +${c.magi}`);
  if (c.purge) lines.push('입마 흡수 (마기 +2씩)');
  if (c.bloodSea) lines.push('체력 대가마다 마기 +2');
  if (c.magiDouble) lines.push('마기 두 배');
  if (c.thrown) lines.push(`암기 ${c.thrown}${c.thrownPoison ? ` · 독 ${c.thrownPoison}` : ''}`);
  if (c.curse) lines.push(`입마 +${c.curse}`);
  if (c.unplayable) lines.push('쓸 수 없음\n턴 끝: 체력 -2 · 마기 +1');
  if (c.exhaust) lines.push('소멸');
  return compactLines(lines).join('\n');
}

// 함정·심법 유지 효과를 짧게
const FX_NAME = {
  damage: '피해', poison: '독', weak: '亂', vulnerable: '傷', point: '점혈', strength: '기세', evasion: '경공', riposte: '반격', guard: '호신', draw: '뽑기', insight: '간파', magi: '마기', energy: '내공',
};
function fxText(fx) {
  return Object.entries(fx).map(([k, v]) => (k === 'insight' ? '간파' : `${FX_NAME[k] ?? k} ${v}`)).join(' · ');
}

// 카드 틀에 들어가도록: 4줄 이상이면 짧은 줄끼리 ' · ' 로 붙임 (BUG-027)
const SHORT = 9;
function compactLines(lines) {
  const flat = lines.flatMap((l) => l.split('\n'));
  if (flat.length < 4) return lines;
  const out = [];
  for (const l of flat) {
    const prev = out.at(-1);
    if (prev !== undefined && out.length > 1 && prev.length + l.length + 3 <= SHORT * 2 - 2 && l.length <= SHORT && prev.length <= SHORT * 1.4) out[out.length - 1] = `${prev} · ${l}`;
    else out.push(l);
  }
  return out;
}

// 카드에 짧게 적힌 세력 기믹 용어 풀이 (툴팁)
export function cardKeywords(c) {
  const k = [];
  if (c.dirty || c.dirtyBonus) k.push('약화: 적이 흐트러짐·중독·굳음 중 하나라도 걸린 상태');
  if (c.thrown) k.push(`암기: 쓰지 않고 손에서 버려지면(턴 종료 등) 저절로 던져져 피해 ${c.thrown}${c.thrownPoison ? `, 중독 ${c.thrownPoison}` : ''}`);
  if (c.goldCost || c.bribe) k.push(`은자: 이 판의 은자를 전투 중에 씀${c.bribe ? ' · 매수: 일반·고수는 한 차례 움직이지 않고, 두목은 흐트러짐 2' : ''}`);
  if (c.magi || c.magiSpend || c.purge || c.bloodSea || c.magiDouble || (c.hpCost && c.faction === 'demonic')) k.push('마기: 체력을 대가로 쓰거나 맞으면 쌓임. 마기 6마다 초식 피해 +1, 마기를 쓰는 무공은 한꺼번에 피해로 바꿈');
  if (c.desperate) k.push('혈투: 내 체력이 최대의 절반 이하일 때');
  if (c.curse || c.unplayable) k.push('입마: 이번 전투 덱에 섞이는 쓸 수 없는 카드. 턴 끝에 손에 있으면 체력 -2, 마기 +1 (전투가 끝나면 사라짐)');
  if (c.exhaust) k.push('소멸: 쓰면 이번 전투에서 빠짐');
  if (c.power) k.push('심법 유지: 쓰면 사라지고, 이번 전투 동안 내 턴이 시작될 때마다 효과가 발동');
  if (c.trap) k.push('함정: 적이 다음에 공격하는 순간 먼저 발동 (깔아 둔 함정은 한꺼번에 터짐)');
  if (c.riposte || c.power?.riposte) k.push('반격: 다음 적 차례에 적이 한 타 칠 때마다 이만큼 되받아침, 피하면 2배');
  if (c.guard || c.power?.guard) k.push('호신: 다음 적 차례 동안 받는 피해를 합계 이만큼 막음');
  if (c.opener) k.push(`발도: 이번 턴에 처음 쓰는 카드면 한 타 피해 +${c.opener}`);
  if (c.swordQi) k.push('검기: 이번 턴에 앞서 쓴 카드(초식·심법) 한 장마다 피해 증가');
  if (c.steal) k.push('훔치기: 적의 기세를 깎고, 적에게 있던 만큼 내 기세로');
  if (c.bloodPact) k.push(`혈계: 내가 잃은 체력 10마다 한 타 피해 +${c.bloodPact}`);
  if (c.consumeCurse) k.push('입마 연료: 손패의 입마 1장을 태워 이번 초식을 강하게 (입마가 없으면 기본 피해)');
  return k.join('\n');
}

export function canUpgrade(card) {
  return !card.upgraded && !!CARDS[card.id].upgrade;
}

export function cardsByRarity(rarity) {
  return Object.values(CARDS).filter((c) => c.rarity === rarity && !c.retired).map((c) => c.id);
}
