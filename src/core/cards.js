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
//   dirty               비열한 수: 적이 흐트러짐·중독·굳음 상태면 한 타 피해 2배
//   gold                은자 +n (전투가 끝나면 판에 더해짐)
//   faction             그 세력 판에서만 보상·객잔에 나옴 (routes.js)
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

  // ── 사파 고유 (암수) ─────────────────
  venomBlade: {
    name: '독 바른 칼', type: 'attack', rarity: 'common', glyph: '毒', faction: 'unorthodox',
    cost: 1, damage: 4, poison: 3,
    upgrade: { damage: 6, poison: 4 },
  },
  sandThrow: {
    name: '모래 뿌리기', type: 'skill', rarity: 'common', glyph: '沙', faction: 'unorthodox',
    cost: 0, weak: 1,
    upgrade: { weak: 1, draw: 1 },
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
  switchGrip: {
    name: '칼 바꿔 쥐기', type: 'skill', rarity: 'common', glyph: '換', faction: 'unorthodox',
    cost: 0, draw: 1, evasion: 2,
    upgrade: { draw: 2 },
  },
  backstab: {
    name: '뒤통수', type: 'attack', rarity: 'rare', glyph: '背', faction: 'unorthodox',
    cost: 2, damage: 12, sure: true, crit: 30, dirty: true,
    upgrade: { damage: 16 },
  },
};

for (const [id, c] of Object.entries(CARDS)) c.id = id;

// 검객 시작 덱: 기본 검법 5 + 견제 3 + 유수검 1 + 경신법 1
export const STARTER_DECK = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'feint', 'feint', 'feint',
  'yusu', 'lightBody',
];

export const RARITY_LABEL = { starter: '기본', common: '일반', uncommon: '고급', rare: '희귀' };
export const TYPE_LABEL = { attack: '초식', skill: '심법' };

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
  if (c.dirty) lines.push('흐트러짐·중독·굳음이면 2배');
  if (c.gold) lines.push(`은자 +${c.gold}`);
  if (c.vulnerable) lines.push(`내상 ${c.vulnerable}턴`);
  if (c.weak) lines.push(`흐트러짐 ${c.weak}턴`);
  if (c.evasion) lines.push(`경공 +${c.evasion}`);
  if (c.insight) lines.push('간파: 다음 초식 필중·치명');
  if (c.strength) lines.push(`기세 +${c.strength}`);
  if (c.energy) lines.push(`내공 +${c.energy}`);
  if (c.draw) lines.push(`카드 ${c.draw}장 뽑기`);
  return lines.join('\n');
}

export function canUpgrade(card) {
  return !card.upgraded && !!CARDS[card.id].upgrade;
}

export function cardsByRarity(rarity) {
  return Object.values(CARDS).filter((c) => c.rarity === rarity).map((c) => c.id);
}
