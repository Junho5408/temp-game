// 8-B 류파 재편 (unorthodox). cards.js 가 불러 CARDS 에 적용
export const REWORK_UNORTHODOX = {
  // 새 카드 (id: u + 류파 느낌 camelCase, 기존과 겹치지 않게)
  cards: {
    // ══ 검객 기본 무공 (school 없음) ══════════════
    // ── 시작 덱 ──
    uSaber: {
      name: '기본 도법', type: 'attack', rarity: 'starter', glyph: '刀', faction: 'unorthodox', cls: 'sword',
      cost: 1, damage: 6, dirtyBonus: 2,
      upgrade: { damage: 8, dirtyBonus: 3 },
    },
    uBladeBack: {
      name: '칼등 치기', type: 'attack', rarity: 'starter', glyph: '擊', faction: 'unorthodox', cls: 'sword',
      cost: 1, damage: 5, weak: 2, accuracy: 95,
      upgrade: { damage: 7, weak: 3 },
    },
    uGutCut: {
      name: '막베기', type: 'attack', rarity: 'starter', glyph: '斫', faction: 'unorthodox', cls: 'sword',
      cost: 2, damage: 6, hits: 2, dirtyBonus: 3,
      upgrade: { damage: 8, dirtyBonus: 4 },
    },
    uSideStep: {
      name: '눈치 걸음', type: 'skill', rarity: 'starter', glyph: '避', faction: 'unorthodox', cls: 'sword',
      cost: 1, evasion: 3, gold: 3,
      upgrade: { evasion: 5, gold: 5 },
    },
    // ── 일반 기본 무공 ──
    uSweepCut: {
      name: '휘둘러 베기', type: 'attack', rarity: 'common', glyph: '揮', faction: 'unorthodox', cls: 'sword',
      cost: 1, damage: 7, accuracy: 85,
      upgrade: { damage: 10 },
    },
    uTwinCut: {
      name: '두 번 베기', type: 'attack', rarity: 'common', glyph: '雙', faction: 'unorthodox', cls: 'sword',
      cost: 1, damage: 3, hits: 2, dirtyBonus: 2,
      upgrade: { damage: 4, dirtyBonus: 3 },
    },
    uBladeGuard: {
      name: '칼 세워 막기', type: 'skill', rarity: 'common', glyph: '防', faction: 'unorthodox', cls: 'sword',
      cost: 1, guard: 7,
      upgrade: { guard: 10 },
    },
    uSneer: {
      name: '비웃기', type: 'skill', rarity: 'common', glyph: '嘲', faction: 'unorthodox', cls: 'sword',
      cost: 0, weak: 1, exhaust: true,
      upgrade: { weak: 2 },
    },

    // ══ 흑도 (heukdo) — 약화 걸고 두 배 ══════════════
    uMudSlash: {
      name: '흙탕 베기', type: 'attack', rarity: 'common', glyph: '泥', faction: 'unorthodox', cls: 'sword', school: 'heukdo',
      cost: 1, damage: 5, weak: 1, accuracy: 95,
      upgrade: { damage: 7, weak: 2 },
    },
    uWristCut: {
      name: '손목 긋기', type: 'attack', rarity: 'common', glyph: '腕', faction: 'unorthodox', cls: 'sword', school: 'heukdo',
      cost: 0, damage: 3, dirtyBonus: 2,
      upgrade: { damage: 4, dirtyBonus: 3 },
    },
    uBladeWave: {
      name: '칼끝 흔들기', type: 'skill', rarity: 'common', glyph: '搖', faction: 'unorthodox', cls: 'sword', school: 'heukdo',
      cost: 1, weak: 2, evasion: 2,
      upgrade: { weak: 3, evasion: 3 },
    },
    uVenomEdge: {
      name: '독기 서린 도', type: 'skill', rarity: 'uncommon', glyph: '瘴', faction: 'unorthodox', cls: 'sword', school: 'heukdo',
      cost: 1, power: { poison: 1 },
      upgrade: { cost: 0 },
    },
    uHackApart: {
      name: '난도질', type: 'attack', rarity: 'rare', glyph: '亂', faction: 'unorthodox', cls: 'sword', school: 'heukdo',
      cost: 2, damage: 4, hits: 3, dirtyBonus: 3,
      upgrade: { damage: 5, dirtyBonus: 4 },
    },

    // ══ 녹림 (nokrim) — 빼앗고 내리찍는다 ══════════════
    uMountainChop: {
      name: '산도 내려찍기', type: 'attack', rarity: 'common', glyph: '山', faction: 'unorthodox', cls: 'sword', school: 'nokrim',
      cost: 2, damage: 13, accuracy: 85,
      upgrade: { damage: 17 },
    },
    uBanditPride: {
      name: '산채의 기세', type: 'skill', rarity: 'uncommon', glyph: '寨', faction: 'unorthodox', cls: 'sword', school: 'nokrim',
      cost: 2, power: { strength: 1 },
      upgrade: { cost: 1 },
    },
    uSplitMountain: {
      name: '개산도', type: 'attack', rarity: 'rare', glyph: '開', faction: 'unorthodox', cls: 'sword', school: 'nokrim',
      cost: 3, damage: 22, steal: 2,
      upgrade: { damage: 28, steal: 3 },
    },

    // ══ 낭인 (nangin) — 첫 칼에 치명 ══════════════
    uIaido: {
      name: '발도', type: 'attack', rarity: 'common', glyph: '拔', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 1, damage: 4, opener: 5,
      upgrade: { damage: 5, opener: 7 },
    },
    uWanderCut: {
      name: '낭인 일도', type: 'attack', rarity: 'common', glyph: '浪', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 1, damage: 6, crit: 20,
      upgrade: { damage: 8, crit: 25 },
    },
    uStareDown: {
      name: '눈빛 겨루기', type: 'skill', rarity: 'common', glyph: '睨', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 1, insight: 1, evasion: 2,
      upgrade: { evasion: 4 },
    },
    uReverseDraw: {
      name: '역발도', type: 'attack', rarity: 'common', glyph: '逆', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 2, damage: 9, opener: 6,
      upgrade: { damage: 12, opener: 8 },
    },
    uFlashDraw: {
      name: '섬광 발도', type: 'attack', rarity: 'uncommon', glyph: '光', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 2, damage: 12, opener: 6, crit: 15,
      upgrade: { damage: 15, opener: 8 },
    },
    uReturnCut: {
      name: '귀도', type: 'attack', rarity: 'uncommon', glyph: '歸', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 1, damage: 6, opener: 4, crit: 15,
      upgrade: { damage: 8, opener: 5 },
    },
    uKillStance: {
      name: '살기 갈무리', type: 'skill', rarity: 'uncommon', glyph: '殺', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 1, strength: 1, insight: 1,
      upgrade: { strength: 2 },
    },
    uSingleBlade: {
      name: '일도양단', type: 'attack', rarity: 'uncommon', glyph: '斷', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 2, damage: 14, crit: 30, accuracy: 85,
      upgrade: { damage: 18 },
    },
    uLoneWolf: {
      name: '외로운 늑대', type: 'skill', rarity: 'rare', glyph: '狼', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 2, power: { insight: 1 },
      upgrade: { cost: 1 },
    },
    uGodDraw: {
      name: '신속 발도', type: 'attack', rarity: 'rare', glyph: '神', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 1, damage: 6, opener: 10, sure: true,
      upgrade: { damage: 8, opener: 13 },
    },
    uNamelessFlash: {
      name: '무명 일섬', type: 'attack', rarity: 'rare', glyph: '無', faction: 'unorthodox', cls: 'sword', school: 'nangin',
      cost: 3, damage: 18, opener: 10, crit: 40,
      upgrade: { damage: 24 },
    },
  },

  // 기존 카드 분류 + 바꿀 값 (기존 사파 65장 전부)
  tags: {
    // ── 검객 기본 ──
    uShiftyEyes: { cls: 'sword', school: null },
    // ── 검객 · 흑도 ──
    uRustyKnife: { cls: 'sword', school: 'heukdo' },
    lowBlow: { cls: 'sword', school: 'heukdo' },
    uHamstring: { cls: 'sword', school: 'heukdo' },
    uPoisonRub: { cls: 'sword', school: 'heukdo', name: '독 묻힌 칼' },
    backstab: { cls: 'sword', school: 'heukdo' },
    uCutThroat: { cls: 'sword', school: 'heukdo' },
    // ── 검객 · 녹림 ──
    uSnatch: { cls: 'sword', school: 'nokrim' },
    uToll: { cls: 'sword', school: 'nokrim' },
    uPickpocket: { cls: 'sword', school: 'nokrim' },
    uStealMove: { cls: 'sword', school: 'nokrim' },
    uRobRobber: { cls: 'sword', school: 'nokrim' },
    extort: { cls: 'sword', school: 'nokrim' },
    uHighwayman: { cls: 'sword', school: 'nokrim' },
    uDivineThief: { cls: 'sword', school: 'nokrim' },

    // ── 살수 기본 (지금 사파 시작 덱 → 살수 시작 덱) ──
    dagger: { cls: 'assassin', school: null },
    venomBlade: { cls: 'assassin', school: null },
    sandThrow: { cls: 'assassin', school: null },
    flyingKnife: { cls: 'assassin', school: null },
    switchGrip: { cls: 'assassin', school: null },
    // ── 살수 · 하오문 (암기) ──
    needle: { cls: 'assassin', school: 'haomun' },
    caltrops: { cls: 'assassin', school: 'haomun' },
    knifeFan: { cls: 'assassin', school: 'haomun' },
    flowerRain: { cls: 'assassin', school: 'haomun' },
    uThrowingStar: { cls: 'assassin', school: 'haomun' },
    uSleeveDart: { cls: 'assassin', school: 'haomun' },
    uIronLotus: { cls: 'assassin', school: 'haomun' },
    uFlyingSickle: { cls: 'assassin', school: 'haomun' },
    uHiddenBlades: { cls: 'assassin', school: 'haomun' },
    uBeeNeedles: { cls: 'assassin', school: 'haomun' },
    uKnifeSpin: { cls: 'assassin', school: 'haomun' },
    uLimeBag: { cls: 'assassin', school: 'haomun' },
    uPourHidden: { cls: 'assassin', school: 'haomun' },
    uPoisonHammer: { cls: 'assassin', school: 'haomun' },
    // ── 살수 · 독문 (독 터뜨리기) ──
    poisonBurst: { cls: 'assassin', school: 'dokmun' },
    poisonMist: { cls: 'assassin', school: 'dokmun' },
    fivePoison: { cls: 'assassin', school: 'dokmun' },
    uSnakeBite: { cls: 'assassin', school: 'dokmun' },
    uToadVenom: { cls: 'assassin', school: 'dokmun' },
    uPoisonWell: { cls: 'assassin', school: 'dokmun' },
    uVenomSqueeze: { cls: 'assassin', school: 'dokmun' },
    uPoisonJar: { cls: 'assassin', school: 'dokmun' },
    uMyriadVenom: { cls: 'assassin', school: 'dokmun' },
    // ── 살수 · 함정꾼 ──
    uTripWire: { cls: 'assassin', school: 'hamjeong' },
    uPitfall: { cls: 'assassin', school: 'hamjeong' },
    uNailBoard: { cls: 'assassin', school: 'hamjeong' },
    uSmokeBomb: { cls: 'assassin', school: 'hamjeong' },
    uBearTrap: { cls: 'assassin', school: 'hamjeong' },
    uPoisonSpike: { cls: 'assassin', school: 'hamjeong' },
    uAmbush: { cls: 'assassin', school: 'hamjeong' },
    uSnareNet: { cls: 'assassin', school: 'hamjeong' },
    uKillingGround: { cls: 'assassin', school: 'hamjeong' },
    uBait: { cls: 'assassin', school: 'hamjeong' },

    // ── 권사 · 철사장 (독장) ──
    uCorpseFlower: { cls: 'fist', school: 'cheolsa' },
    // ── 권사 · 흑호권 (거리의 주먹·발) ──
    legSweep: { cls: 'fist', school: 'heukho' },
    uEyeGouge: { cls: 'fist', school: 'heukho' },
    uKneeKick: { cls: 'fist', school: 'heukho' },
    uStomp: { cls: 'fist', school: 'heukho' },
    // ── 권사 · 전장권 (은자) ──
    bribe: { cls: 'fist', school: 'jeonjang' },
    purseThrow: { cls: 'fist', school: 'jeonjang' },
    blackDeal: { cls: 'fist', school: 'jeonjang' },
    uHiredThug: { cls: 'fist', school: 'jeonjang' },
    uHireAssassin: { cls: 'fist', school: 'jeonjang' },
    uLoanShark: { cls: 'fist', school: 'jeonjang' },
    uGoldRain: { cls: 'fist', school: 'jeonjang' },
  },
  retire: [],
  // 시작 덱: 기본 도법 5 + 칼등 치기 3 + 막베기 1 + 눈치 걸음 1 (칼등 치기로 흐트러뜨려 막베기 약화 보너스, 눈치 걸음 은자)
  decks: {
    sword: [
      'uSaber', 'uSaber', 'uSaber', 'uSaber', 'uSaber',
      'uBladeBack', 'uBladeBack', 'uBladeBack',
      'uGutCut', 'uSideStep',
    ],
  },
  basic: { sword: 'uSaber' }, // 동굴 기연에서 덜어 내는 기본 무공
};
