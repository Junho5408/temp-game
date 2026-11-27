// 7-C 무공 확장 (unorthodox). cards.js 의 CARDS 에 합쳐짐 — 필드 설명은 cards.js 맨 위와 battle.js 주석
export const UNORTHODOX_CARDS_EXT = {
  // ══ 일반 (20) ══════════════

  // ── 암기 ──
  uThrowingStar: {
    name: '표창', type: 'attack', rarity: 'common', glyph: '星', faction: 'unorthodox',
    cost: 0, damage: 2, thrown: 3,
    upgrade: { damage: 3, thrown: 4 },
  },
  uSleeveDart: {
    name: '수전', type: 'skill', rarity: 'common', glyph: '袖', faction: 'unorthodox',
    cost: 0, draw: 1, thrown: 3,
    upgrade: { thrown: 5 },
  },
  uIronLotus: {
    name: '철연자', type: 'attack', rarity: 'common', glyph: '蓮', faction: 'unorthodox',
    cost: 1, damage: 2, hits: 2, thrown: 3,
    upgrade: { damage: 3, thrown: 4 },
  },
  uFlyingSickle: {
    name: '비겸', type: 'attack', rarity: 'common', glyph: '鎌', faction: 'unorthodox',
    cost: 1, damage: 4, thrown: 4,
    upgrade: { damage: 5, thrown: 5 },
  },

  // ── 독 ──
  uSnakeBite: {
    name: '사독 찌르기', type: 'attack', rarity: 'common', glyph: '蛇', faction: 'unorthodox',
    cost: 1, damage: 2, poison: 4,
    upgrade: { damage: 2, poison: 6 },
  },
  uToadVenom: {
    name: '두꺼비 독', type: 'skill', rarity: 'common', glyph: '蟾', faction: 'unorthodox',
    cost: 0, poison: 3, exhaust: true,
    upgrade: { poison: 5 },
  },
  uPoisonWell: {
    name: '우물에 독', type: 'skill', rarity: 'common', glyph: '井', faction: 'unorthodox',
    cost: 1, poison: 3, weak: 1,
    upgrade: { poison: 5, weak: 2 },
  },
  uRustyKnife: {
    name: '녹슨 칼', type: 'attack', rarity: 'common', glyph: '銹', faction: 'unorthodox',
    cost: 1, damage: 4, poison: 1, vulnerable: 1,
    upgrade: { damage: 5, poison: 2 },
  },

  // ── 은자 ──
  uPickpocket: {
    name: '소매치기', type: 'attack', rarity: 'common', glyph: '摸', faction: 'unorthodox',
    cost: 0, damage: 2, gold: 5,
    upgrade: { damage: 3, gold: 8 },
  },
  uToll: {
    name: '통행세', type: 'skill', rarity: 'common', glyph: '稅', faction: 'unorthodox',
    cost: 1, gold: 8, weak: 1,
    upgrade: { gold: 12 },
  },
  uHiredThug: {
    name: '왈패 부르기', type: 'attack', rarity: 'common', glyph: '傭', faction: 'unorthodox',
    cost: 0, goldCost: 8, damage: 5,
    upgrade: { damage: 8 },
  },

  // ── 약화 노리기 ──
  uEyeGouge: {
    name: '눈 찌르기', type: 'attack', rarity: 'common', glyph: '眼', faction: 'unorthodox',
    cost: 1, damage: 3, weak: 1, dirtyBonus: 3,
    upgrade: { damage: 4, dirtyBonus: 5 },
  },
  uKneeKick: {
    name: '무릎 차기', type: 'attack', rarity: 'common', glyph: '膝', faction: 'unorthodox',
    cost: 1, damage: 4, vulnerable: 1, dirtyBonus: 2,
    upgrade: { damage: 5, vulnerable: 2 },
  },
  uStomp: {
    name: '짓밟기', type: 'attack', rarity: 'common', glyph: '踏', faction: 'unorthodox',
    cost: 0, damage: 2, dirty: true,
    upgrade: { damage: 3 },
  },

  // ── 손패 굴리기 ──
  uShiftyEyes: {
    name: '눈치 보기', type: 'skill', rarity: 'common', glyph: '瞥', faction: 'unorthodox',
    cost: 1, draw: 2, evasion: 1,
    upgrade: { draw: 3 },
  },
  uSmokeBomb: {
    name: '연막 뿌리기', type: 'skill', rarity: 'common', glyph: '煙', faction: 'unorthodox',
    cost: 1, evasion: 2, redraw: true,
    upgrade: { evasion: 4 },
  },

  // ── 함정 ──
  uTripWire: {
    name: '올가미', type: 'skill', rarity: 'common', glyph: '索', faction: 'unorthodox',
    cost: 1, trap: { damage: 5, weak: 1 },
    upgrade: { trap: { damage: 7, weak: 1 } },
  },
  uPitfall: {
    name: '구덩이 파기', type: 'skill', rarity: 'common', glyph: '坑', faction: 'unorthodox',
    cost: 1, trap: { damage: 4, vulnerable: 2 },
    upgrade: { trap: { damage: 5, vulnerable: 3 } },
  },
  uNailBoard: {
    name: '못판', type: 'skill', rarity: 'common', glyph: '釘', faction: 'unorthodox',
    cost: 0, trap: { damage: 4 },
    upgrade: { trap: { damage: 5 } },
  },

  // ── 훔치기 ──
  uSnatch: {
    name: '낚아채기', type: 'attack', rarity: 'common', glyph: '奪', faction: 'unorthodox',
    cost: 1, damage: 4, steal: 1,
    upgrade: { damage: 5, steal: 2 },
  },

  // ══ 고급 (16) ══════════════

  // ── 함정 ──
  uBearTrap: {
    name: '쇠덫', type: 'skill', rarity: 'uncommon', glyph: '鋏', faction: 'unorthodox',
    cost: 1, trap: { damage: 6, point: 4 },
    upgrade: { trap: { damage: 9, point: 6 } },
  },
  uPoisonSpike: {
    name: '독못', type: 'skill', rarity: 'uncommon', glyph: '棘', faction: 'unorthodox',
    cost: 1, trap: { damage: 3, poison: 5 },
    upgrade: { trap: { damage: 4, poison: 8 } },
  },
  uAmbush: {
    name: '매복', type: 'skill', rarity: 'uncommon', glyph: '伏', faction: 'unorthodox',
    cost: 1, trap: { damage: 4 }, evasion: 2, draw: 1,
    upgrade: { trap: { damage: 6 } },
  },
  uSnareNet: {
    name: '그물 치기', type: 'skill', rarity: 'uncommon', glyph: '網', faction: 'unorthodox',
    cost: 1, trap: { weak: 2, vulnerable: 2 }, draw: 1,
    upgrade: { trap: { weak: 3, vulnerable: 3 } },
  },

  // ── 훔치기 ──
  uStealMove: {
    name: '수법 훔치기', type: 'skill', rarity: 'uncommon', glyph: '竊', faction: 'unorthodox',
    cost: 1, steal: 2, draw: 1,
    upgrade: { steal: 3 },
  },
  uRobRobber: {
    name: '강도 털기', type: 'attack', rarity: 'uncommon', glyph: '劫', faction: 'unorthodox',
    cost: 1, damage: 4, steal: 1, gold: 6,
    upgrade: { damage: 5, gold: 10 },
  },

  // ── 암기 ──
  uHiddenBlades: {
    name: '숨긴 칼', type: 'skill', rarity: 'uncommon', glyph: '藏', faction: 'unorthodox',
    cost: 1, draw: 2, thrown: 5,
    upgrade: { thrown: 9 },
  },
  uBeeNeedles: {
    name: '봉침', type: 'attack', rarity: 'uncommon', glyph: '蜂', faction: 'unorthodox',
    cost: 1, damage: 2, hits: 3, thrown: 2, thrownPoison: 3,
    upgrade: { damage: 2, thrownPoison: 5 },
  },
  uKnifeSpin: {
    name: '칼 돌리기', type: 'attack', rarity: 'uncommon', glyph: '輪', faction: 'unorthodox',
    cost: 1, damage: 4, throwAll: true,
    upgrade: { damage: 5 },
  },

  // ── 독 ──
  uCorpseFlower: {
    name: '시화독장', type: 'attack', rarity: 'uncommon', glyph: '屍', faction: 'unorthodox',
    cost: 2, damage: 4, poison: 6,
    upgrade: { damage: 5, poison: 8 },
  },
  uPoisonRub: {
    name: '독 문지르기', type: 'attack', rarity: 'uncommon', glyph: '塗', faction: 'unorthodox',
    cost: 1, damage: 3, poison: 3, dirtyBonus: 3,
    upgrade: { damage: 4, poison: 4, dirtyBonus: 4 },
  },
  uVenomSqueeze: {
    name: '독 쥐어짜기', type: 'attack', rarity: 'uncommon', glyph: '絞', faction: 'unorthodox',
    cost: 0, burst: 1, draw: 1,
    upgrade: { burst: 2 },
  },

  // ── 은자 ──
  uLoanShark: {
    name: '고리대', type: 'skill', rarity: 'uncommon', glyph: '利', faction: 'unorthodox',
    cost: 1, gold: 22, draw: 1, exhaust: true,
    upgrade: { gold: 32 },
  },
  uHireAssassin: {
    name: '살수 고용', type: 'attack', rarity: 'uncommon', glyph: '殺', faction: 'unorthodox',
    cost: 1, goldCost: 15, damage: 6, hits: 2,
    upgrade: { damage: 9 },
  },

  // ── 약화 노리기 ──
  uLimeBag: {
    name: '석회 주머니', type: 'skill', rarity: 'uncommon', glyph: '灰', faction: 'unorthodox',
    cost: 1, weak: 2, vulnerable: 2, thrown: 3,
    upgrade: { weak: 3, vulnerable: 3 },
  },
  uHamstring: {
    name: '힘줄 끊기', type: 'attack', rarity: 'uncommon', glyph: '筋', faction: 'unorthodox',
    cost: 1, damage: 4, weak: 2, dirtyBonus: 3,
    upgrade: { damage: 5, dirtyBonus: 5 },
  },

  // ══ 희귀 (10) ══════════════

  // ── 함정 ──
  uKillingGround: {
    name: '사방 함정', type: 'skill', rarity: 'rare', glyph: '陣', faction: 'unorthodox',
    cost: 2, trap: { damage: 11, poison: 5, vulnerable: 2 }, exhaust: true,
    upgrade: { trap: { damage: 14, poison: 7, vulnerable: 3 } },
  },
  uBait: {
    name: '미끼', type: 'skill', rarity: 'rare', glyph: '餌', faction: 'unorthodox',
    cost: 2, trap: { damage: 5, weak: 2, point: 6 }, draw: 1,
    upgrade: { trap: { damage: 8, weak: 2, point: 9 } },
  },

  // ── 훔치기 ──
  uHighwayman: {
    name: '날강도', type: 'attack', rarity: 'rare', glyph: '盜', faction: 'unorthodox',
    cost: 2, damage: 7, steal: 2, sure: true,
    upgrade: { damage: 9, steal: 3 },
  },
  uDivineThief: {
    name: '신투 묘수', type: 'skill', rarity: 'rare', glyph: '妙', faction: 'unorthodox',
    cost: 1, steal: 2, draw: 2, exhaust: true,
    upgrade: { steal: 3 },
  },

  // ── 암기 ──
  uPourHidden: {
    name: '암기 쏟기', type: 'skill', rarity: 'rare', glyph: '傾', faction: 'unorthodox',
    cost: 1, throwAll: true, energy: 1, draw: 1,
    upgrade: { draw: 3 },
  },
  uPoisonHammer: {
    name: '독성추', type: 'attack', rarity: 'rare', glyph: '錘', faction: 'unorthodox',
    cost: 2, damage: 9, thrown: 5, thrownPoison: 2,
    upgrade: { damage: 11, thrown: 7 },
  },

  // ── 독 ──
  uPoisonJar: {
    name: '독단지', type: 'skill', rarity: 'rare', glyph: '壺', faction: 'unorthodox',
    cost: 2, power: { poison: 2 },
    upgrade: { cost: 1 },
  },
  uMyriadVenom: {
    name: '만독살', type: 'skill', rarity: 'rare', glyph: '萬', faction: 'unorthodox',
    cost: 1, poison: 10, hpCost: 5, exhaust: true,
    upgrade: { poison: 14 },
  },

  // ── 은자 ──
  uGoldRain: {
    name: '돈벼락', type: 'attack', rarity: 'rare', glyph: '金', faction: 'unorthodox',
    cost: 2, goldCost: 30, damage: 21, sure: true,
    upgrade: { damage: 28 },
  },

  // ── 약화 노리기 ──
  uCutThroat: {
    name: '숨통 끊기', type: 'attack', rarity: 'rare', glyph: '絶', faction: 'unorthodox',
    cost: 2, damage: 5, hits: 2, dirty: true, exhaust: true,
    upgrade: { damage: 7 },
  },
};
