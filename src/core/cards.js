// 카드 정의 (검객)
// 방어(호신강기) 개념은 없음: 체력은 깎이기만 하고 지도의 운기조식에서 회복.
// type: attack(초식) / skill(심법·보법)
// rarity: starter(시작 덱 전용) / common(일반) / uncommon(고급) / rare(희귀)
// 효과 필드
//   damage, hits        피해 (타수, 기본 1)
//   bonusIfAttacking    적이 이번에 공격을 예고했으면 한 타 피해 +n
//   draw                카드 뽑기
//   energy              내공 회복
//   strength            기세 (이번 전투 동안 공격 피해 +n)
//   vulnerable          상대에게 내상 n턴 (받는 피해 1.5배)
//   weak                상대에게 기혈 흐트러짐 n턴 (주는 피해 0.75배)
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
    cost: 1, damage: 4, weak: 1,
    upgrade: { damage: 6, weak: 2 },
  },
  yusu: {
    name: '유수검', type: 'attack', rarity: 'starter', glyph: '流',
    cost: 2, damage: 7, hits: 2,
    upgrade: { damage: 9 },
  },

  // ── 일반 ─────────────────
  quick: {
    name: '쾌검', type: 'attack', rarity: 'common', glyph: '快',
    cost: 0, damage: 4,
    upgrade: { damage: 6 },
  },
  chain: {
    name: '연환검', type: 'attack', rarity: 'common', glyph: '連',
    cost: 1, damage: 4, hits: 2,
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
    cost: 0, draw: 1,
    upgrade: { draw: 2 },
  },
  focus: {
    name: '검기 집중', type: 'skill', rarity: 'common', glyph: '集',
    cost: 1, strength: 1, draw: 1,
    upgrade: { draw: 2 },
  },

  // ── 고급 ─────────────────
  flash: {
    name: '일섬', type: 'attack', rarity: 'uncommon', glyph: '閃',
    cost: 2, damage: 15,
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

  // ── 희귀 ─────────────────
  heavenWind: {
    name: '천풍검', type: 'attack', rarity: 'rare', glyph: '天',
    cost: 3, damage: 28,
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
};

for (const [id, c] of Object.entries(CARDS)) c.id = id;

// 검객 시작 덱: 기본 검법 6 + 견제 3 + 유수검 1
export const STARTER_DECK = [
  'strike', 'strike', 'strike', 'strike', 'strike', 'strike',
  'feint', 'feint', 'feint',
  'yusu',
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
  if (c.damage) lines.push(c.hits > 1 ? `피해 ${c.damage} × ${c.hits}` : `피해 ${c.damage}`);
  if (c.bonusIfAttacking) lines.push(`공격 예고 시 +${c.bonusIfAttacking}`);
  if (c.vulnerable) lines.push(`내상 ${c.vulnerable}턴`);
  if (c.weak) lines.push(`흐트러짐 ${c.weak}턴`);
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
