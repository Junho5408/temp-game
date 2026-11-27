// 7-C 무공 확장 (orthodox). cards.js 의 CARDS 에 합쳐짐 — 필드 설명은 cards.js 맨 위와 battle.js 주석
export const ORTHODOX_CARDS_EXT = {
  // ── 일반: 정통 검법·연계 ──
  oPineWind: {
    name: '송풍검', type: 'attack', rarity: 'common', glyph: '松', faction: 'orthodox',
    cost: 1, damage: 9, accuracy: 95,
    upgrade: { damage: 12 },
  },
  oTwinBlossom: {
    name: '쌍화검', type: 'attack', rarity: 'common', glyph: '雙', faction: 'orthodox',
    cost: 1, damage: 3, hits: 2, combo: 2,
    upgrade: { damage: 4, combo: 3 },
  },
  oOpeningForm: {
    name: '기수식', type: 'attack', rarity: 'common', glyph: '起', faction: 'orthodox',
    cost: 0, damage: 3, draw: 1,
    upgrade: { damage: 6 },
  },
  oThreadNeedle: {
    name: '연자검', type: 'attack', rarity: 'common', glyph: '續', faction: 'orthodox',
    cost: 1, damage: 4, perAttack: 2,
    upgrade: { damage: 6, perAttack: 3 },
  },
  oLowSweep: {
    name: '소퇴검', type: 'attack', rarity: 'common', glyph: '掃', faction: 'orthodox',
    cost: 1, damage: 6, weak: 1, combo: 2,
    upgrade: { damage: 8, weak: 2, combo: 3 },
  },
  oSplitStone: {
    name: '개석검', type: 'attack', rarity: 'common', glyph: '石', faction: 'orthodox',
    cost: 2, damage: 15, vulnerable: 1,
    upgrade: { damage: 21, vulnerable: 2 },
  },
  // ── 일반: 반격 자세 상대하기 ──
  oRiposte: {
    name: '응수검', type: 'attack', rarity: 'common', glyph: '應', faction: 'orthodox',
    cost: 1, damage: 6, bonusIfAttacking: 4, accuracy: 95,
    upgrade: { damage: 9, bonusIfAttacking: 6 },
  },
  oFirstHand: {
    name: '선수검', type: 'attack', rarity: 'common', glyph: '先', faction: 'orthodox',
    cost: 0, damage: 2, bonusIfAttacking: 4,
    upgrade: { damage: 3, bonusIfAttacking: 6 },
  },
  // ── 일반: 점혈 ──
  oMeridianTap: {
    name: '격혈지', type: 'attack', rarity: 'common', glyph: '穴', faction: 'orthodox',
    cost: 1, damage: 6, point: 4, combo: 3,
    upgrade: { damage: 9, point: 6 },
  },
  oFixingFinger: {
    name: '정혈지', type: 'attack', rarity: 'common', glyph: '定', faction: 'orthodox',
    cost: 1, damage: 3, point: 6, sure: true,
    upgrade: { damage: 4, point: 8 },
  },
  // ── 일반: 경공·간파·심법 ──
  oSwallowStep: {
    name: '비연보', type: 'skill', rarity: 'common', glyph: '燕', faction: 'orthodox',
    cost: 0, evasion: 2,
    upgrade: { evasion: 3 },
  },
  oFallingLeaf: {
    name: '낙엽보', type: 'skill', rarity: 'common', glyph: '葉', faction: 'orthodox',
    cost: 1, evasion: 3, weak: 1,
    upgrade: { evasion: 4, weak: 2 },
  },
  oContemplate: {
    name: '관조', type: 'skill', rarity: 'common', glyph: '觀', faction: 'orthodox',
    cost: 1, insight: 1, point: 4,
    upgrade: { point: 7 },
  },
  oRegulateBreath: {
    name: '조식', type: 'skill', rarity: 'common', glyph: '息', faction: 'orthodox',
    cost: 1, draw: 2, evasion: 1,
    upgrade: { draw: 3 },
  },
  oUprightHeart: {
    name: '정심결', type: 'skill', rarity: 'common', glyph: '正', faction: 'orthodox',
    cost: 1, strength: 1, evasion: 2,
    upgrade: { evasion: 4 },
  },
  // ── 일반: 검기 마무리 ──
  oClearBreeze: {
    name: '청풍일검', type: 'attack', rarity: 'common', glyph: '風', faction: 'orthodox',
    cost: 1, damage: 4, swordQi: 2,
    upgrade: { damage: 8, swordQi: 3 },
  },
  oClosingBow: {
    name: '수검세', type: 'attack', rarity: 'common', glyph: '收', faction: 'orthodox',
    cost: 1, damage: 3, swordQi: 2, sure: true,
    upgrade: { damage: 4, swordQi: 3 },
  },

  // ── 고급: 연계·반격·점혈 ──
  oRelaySword: {
    name: '행운유수', type: 'attack', rarity: 'uncommon', glyph: '行', faction: 'orthodox',
    cost: 2, damage: 4, hits: 3, combo: 2,
    upgrade: { damage: 6, combo: 3 },
  },
  oWindDraw: {
    name: '풍류발검', type: 'attack', rarity: 'uncommon', glyph: '拔', faction: 'orthodox',
    cost: 0, damage: 2, combo: 3, draw: 1,
    upgrade: { damage: 3, combo: 4 },
  },
  oParry: {
    name: '탄검', type: 'attack', rarity: 'uncommon', glyph: '彈', faction: 'orthodox',
    cost: 1, damage: 4, bonusIfAttacking: 5, weak: 1,
    upgrade: { damage: 8, bonusIfAttacking: 7 },
  },
  oLockMeridian: {
    name: '쇄맥수', type: 'attack', rarity: 'uncommon', glyph: '鎖', faction: 'orthodox',
    cost: 2, damage: 8, point: 8, combo: 4,
    upgrade: { damage: 10, point: 11 },
  },
  // ── 고급: 경공·간파 ──
  oMistStep: {
    name: '무영보', type: 'skill', rarity: 'uncommon', glyph: '霧', faction: 'orthodox',
    cost: 2, evasion: 5, insight: 1,
    upgrade: { evasion: 7 },
  },
  oKeenEye: {
    name: '혜안', type: 'skill', rarity: 'uncommon', glyph: '慧', faction: 'orthodox',
    cost: 0, insight: 1, exhaust: true,
    upgrade: { draw: 1 },
  },
  // ── 고급: 검기 마무리 ──
  oRiverHome: {
    name: '대하귀해', type: 'attack', rarity: 'uncommon', glyph: '歸', faction: 'orthodox',
    cost: 2, damage: 8, swordQi: 3,
    upgrade: { damage: 11 },
  },
  oMoonlitPair: {
    name: '월하결검', type: 'attack', rarity: 'uncommon', glyph: '月', faction: 'orthodox',
    cost: 1, damage: 2, hits: 2, swordQi: 2,
    upgrade: { damage: 3 },
  },
  oAfterglow: {
    name: '잔광검', type: 'attack', rarity: 'uncommon', glyph: '殘', faction: 'orthodox',
    cost: 1, damage: 4, swordQi: 2, point: 3,
    upgrade: { damage: 8, point: 5 },
  },
  // ── 고급: 심법 유지 ──
  oCalmSea: {
    name: '정해심법', type: 'skill', rarity: 'uncommon', glyph: '海', faction: 'orthodox',
    cost: 1, power: { evasion: 1 },
    upgrade: { cost: 0 },
  },
  oMountainRoot: {
    name: '태산심법', type: 'skill', rarity: 'uncommon', glyph: '山', faction: 'orthodox',
    cost: 2, power: { strength: 1 },
    upgrade: { cost: 1 },
  },
  oPulseReading: {
    name: '청맥심법', type: 'skill', rarity: 'uncommon', glyph: '脈', faction: 'orthodox',
    cost: 1, power: { point: 3 },
    upgrade: { power: { point: 4 } },
  },
  oDawnCall: {
    name: '계명심법', type: 'skill', rarity: 'uncommon', glyph: '曉', faction: 'orthodox',
    cost: 1, power: { draw: 1 },
    upgrade: { cost: 0 },
  },

  // ── 희귀: 심법 유지 ──
  oClearSword: {
    name: '검심통명', type: 'skill', rarity: 'rare', glyph: '明', faction: 'orthodox',
    cost: 2, power: { insight: 1 },
    upgrade: { cost: 1 },
  },
  oHeavenEarth: {
    name: '건곤심법', type: 'skill', rarity: 'rare', glyph: '乾', faction: 'orthodox',
    cost: 2, power: { evasion: 2, point: 3 },
    upgrade: { cost: 1 },
  },
  // ── 희귀: 검기 마무리 ──
  oManyToOne: {
    name: '만검귀일', type: 'attack', rarity: 'rare', glyph: '萬', faction: 'orthodox',
    cost: 2, damage: 10, swordQi: 3, sure: true,
    upgrade: { damage: 14 },
  },
  oSkyOpen: {
    name: '일검개천', type: 'attack', rarity: 'rare', glyph: '開', faction: 'orthodox',
    cost: 2, damage: 6, hits: 2, swordQi: 3, exhaust: true,
    upgrade: { damage: 9 },
  },
  // ── 희귀: 연계·점혈·경공·반격 ──
  oPhoenixDance: {
    name: '봉황연무', type: 'attack', rarity: 'rare', glyph: '鳳', faction: 'orthodox',
    cost: 2, damage: 3, hits: 3, comboHits: 2, perAttack: 1,
    upgrade: { damage: 4 },
  },
  oSealHundred: {
    name: '천혈봉쇄', type: 'attack', rarity: 'rare', glyph: '封', faction: 'orthodox',
    cost: 2, damage: 10, point: 15, sure: true, exhaust: true,
    upgrade: { damage: 13, point: 20 },
  },
  oVoidStep: {
    name: '허공답보', type: 'skill', rarity: 'rare', glyph: '虛', faction: 'orthodox',
    cost: 1, evasion: 6, draw: 2, exhaust: true,
    upgrade: { evasion: 8 },
  },
  oTurnHeaven: {
    name: '반천검', type: 'attack', rarity: 'rare', glyph: '反', faction: 'orthodox',
    cost: 2, damage: 12, bonusIfAttacking: 10, sure: true,
    upgrade: { damage: 15, bonusIfAttacking: 13 },
  },
};
