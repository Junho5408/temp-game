// 8-C 류파 재편 (unorthodox · 권사). cards.js 가 불러 CARDS 에 적용
// 사파 권사: 맨손·장법·거리의 주먹. 짧은 연타 + 버티기(호신·반격), 세력 기믹(약화 dirty·은자)
//   철사장 = 독 모래 손 (주먹으로 독을 쌓고, 중독된 적에게 더 세게)
//   흑호권 = 흐트러뜨리고 몰아치기 (약화·연타·dirty·반격)
//   전장권 = 은자가 곧 힘 (gold 로 벌고 goldCost·bribe 로 쓴다)
export const REWORK_UNORTHODOX_FIST = {
  // 새 카드 (id: u + 류파 느낌 camelCase, 기존과 겹치지 않게)
  cards: {
    // ══ 권사 기본 무공 (school 없음) ══════════════
    // ── 시작 덱 ──
    uFistBasic: {
      name: '기본 권법', type: 'attack', rarity: 'starter', glyph: '拳', faction: 'unorthodox', cls: 'fist',
      cost: 1, damage: 3, hits: 2, dirtyBonus: 1,
      upgrade: { damage: 4, dirtyBonus: 2 },
    },
    uSlap: {
      name: '뺨 후리기', type: 'attack', rarity: 'starter', glyph: '摑', faction: 'unorthodox', cls: 'fist',
      cost: 1, damage: 5, weak: 2, accuracy: 95,
      upgrade: { damage: 7, weak: 3 },
    },
    uBrawl: {
      name: '주먹 난투', type: 'attack', rarity: 'starter', glyph: '鬪', faction: 'unorthodox', cls: 'fist',
      cost: 2, damage: 4, hits: 3, dirtyBonus: 2,
      upgrade: { damage: 5, dirtyBonus: 3 },
    },
    uHunker: {
      name: '몸 웅크리기', type: 'skill', rarity: 'starter', glyph: '蹲', faction: 'unorthodox', cls: 'fist',
      cost: 1, guard: 6, gold: 3,
      upgrade: { guard: 9, gold: 5 },
    },
    // ── 일반 기본 무공 ──
    uShortJab: {
      name: '짧은 주먹', type: 'attack', rarity: 'common', glyph: '短', faction: 'unorthodox', cls: 'fist',
      cost: 0, damage: 3, accuracy: 95,
      upgrade: { damage: 5 },
    },
    uElbow: {
      name: '팔꿈치 치기', type: 'attack', rarity: 'common', glyph: '肘', faction: 'unorthodox', cls: 'fist',
      cost: 1, damage: 6, vulnerable: 1,
      upgrade: { damage: 8, vulnerable: 2 },
    },
    uPummel: {
      name: '두들겨 패기', type: 'attack', rarity: 'common', glyph: '打', faction: 'unorthodox', cls: 'fist',
      cost: 1, damage: 2, hits: 3,
      upgrade: { damage: 3 },
    },
    uStiffen: {
      name: '몸 굳히기', type: 'skill', rarity: 'common', glyph: '硬', faction: 'unorthodox', cls: 'fist',
      cost: 1, guard: 7,
      upgrade: { guard: 10 },
    },
    uCatchPunch: {
      name: '받아치기', type: 'skill', rarity: 'common', glyph: '還', faction: 'unorthodox', cls: 'fist',
      cost: 1, riposte: 5,
      upgrade: { riposte: 7 },
    },

    // ══ 철사장 (cheolsa) — 독 모래로 단련한 손 ══════════════
    uIronSandPalm: {
      name: '철사장', type: 'attack', rarity: 'common', glyph: '鐵', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 1, damage: 4, poison: 2,
      upgrade: { damage: 5, poison: 3 },
    },
    uSandRub: {
      name: '독모래 비비기', type: 'skill', rarity: 'common', glyph: '砂', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 0, poison: 2,
      upgrade: { poison: 3 },
    },
    uPoisonJab: {
      name: '독수 연타', type: 'attack', rarity: 'common', glyph: '連', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 1, damage: 2, hits: 2, poison: 2,
      upgrade: { damage: 3, poison: 3 },
    },
    uToxicGuard: {
      name: '독기 두르기', type: 'skill', rarity: 'common', glyph: '障', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 1, guard: 6, poison: 2,
      upgrade: { guard: 8, poison: 3 },
    },
    uBlackPalm: {
      name: '검은 손바닥', type: 'attack', rarity: 'common', glyph: '黑', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 1, damage: 5, dirtyBonus: 3,
      upgrade: { damage: 7, dirtyBonus: 4 },
    },
    uSandTraining: {
      name: '철사 수련', type: 'skill', rarity: 'uncommon', glyph: '練', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 1, power: { poison: 1, guard: 2 },
      upgrade: { cost: 0 },
    },
    uVenomChain: {
      name: '독장 삼연', type: 'attack', rarity: 'uncommon', glyph: '三', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 2, damage: 3, hits: 3, poison: 3,
      upgrade: { damage: 4, poison: 4 },
    },
    uBlackHandBreak: {
      name: '흑수 파혈', type: 'attack', rarity: 'uncommon', glyph: '破', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 1, damage: 5, poison: 3, vulnerable: 1,
      upgrade: { damage: 7, poison: 4 },
    },
    uSerpentHand: {
      name: '흑사독수', type: 'attack', rarity: 'rare', glyph: '蛇', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 2, damage: 4, hits: 2, poison: 3, dirty: true,
      upgrade: { damage: 5, poison: 4 },
    },
    uPoisonMastery: {
      name: '독공 대성', type: 'skill', rarity: 'rare', glyph: '成', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 2, power: { poison: 2 },
      upgrade: { cost: 1 },
    },
    uMeltBonePalm: {
      name: '화골면장', type: 'attack', rarity: 'rare', glyph: '骨', faction: 'unorthodox', cls: 'fist', school: 'cheolsa',
      cost: 2, burst: 2, damage: 6, poison: 3,
      upgrade: { burst: 3 },
    },

    // ══ 흑호권 (heukho) — 흐트러뜨리고 몰아친다 ══════════════
    uFlurry: {
      name: '난타', type: 'attack', rarity: 'uncommon', glyph: '亂', faction: 'unorthodox', cls: 'fist', school: 'heukho',
      cost: 1, damage: 2, hits: 3, dirtyBonus: 1,
      upgrade: { damage: 3 },
    },
    uHeadbutt: {
      name: '박치기', type: 'attack', rarity: 'uncommon', glyph: '頭', faction: 'unorthodox', cls: 'fist', school: 'heukho',
      cost: 1, damage: 6, weak: 2, dirtyBonus: 2,
      upgrade: { damage: 8, weak: 3 },
    },
    uAlleyBoss: {
      name: '골목대장', type: 'skill', rarity: 'uncommon', glyph: '巷', faction: 'unorthodox', cls: 'fist', school: 'heukho',
      cost: 1, power: { riposte: 2 },
      upgrade: { power: { riposte: 3 } },
    },
    uDirtyCounter: {
      name: '되받아 패기', type: 'skill', rarity: 'uncommon', glyph: '反', faction: 'unorthodox', cls: 'fist', school: 'heukho',
      cost: 1, riposte: 4, weak: 1,
      upgrade: { riposte: 6, weak: 2 },
    },
    uTigerDance: {
      name: '흑호난무', type: 'attack', rarity: 'rare', glyph: '虎', faction: 'unorthodox', cls: 'fist', school: 'heukho',
      cost: 2, damage: 4, hits: 3, dirty: true,
      upgrade: { damage: 5 },
    },
    uTigerLeap: {
      name: '맹호출림', type: 'attack', rarity: 'rare', glyph: '猛', faction: 'unorthodox', cls: 'fist', school: 'heukho',
      cost: 1, damage: 3, hits: 2, comboHits: 2, dirtyBonus: 2,
      upgrade: { damage: 4 },
    },
    uStreetKing: {
      name: '뒷골목 왕', type: 'skill', rarity: 'rare', glyph: '王', faction: 'unorthodox', cls: 'fist', school: 'heukho',
      cost: 2, power: { strength: 1, riposte: 2 },
      upgrade: { cost: 1 },
    },

    // ══ 전장권 (jeonjang) — 돈이 곧 힘 ══════════════
    uShakedown: {
      name: '삥 뜯기', type: 'attack', rarity: 'common', glyph: '奪', faction: 'unorthodox', cls: 'fist', school: 'jeonjang',
      cost: 1, damage: 5, gold: 4,
      upgrade: { damage: 7, gold: 6 },
    },
    uCoinFist: {
      name: '엽전 꿴 주먹', type: 'attack', rarity: 'common', glyph: '錢', faction: 'unorthodox', cls: 'fist', school: 'jeonjang',
      cost: 1, goldCost: 5, damage: 5, hits: 2,
      upgrade: { damage: 6 },
    },
    uPurseGuard: {
      name: '전낭 품기', type: 'skill', rarity: 'common', glyph: '囊', faction: 'unorthodox', cls: 'fist', school: 'jeonjang',
      cost: 1, guard: 6, gold: 4,
      upgrade: { guard: 9, gold: 6 },
    },
    uGoldArmor: {
      name: '돈으로 산 철갑', type: 'skill', rarity: 'rare', glyph: '甲', faction: 'unorthodox', cls: 'fist', school: 'jeonjang',
      cost: 1, goldCost: 20, power: { guard: 4 },
      upgrade: { goldCost: 12 },
    },
  },

  // 바꿀 기존 카드 (이미 cls 'fist' + 류파로 옮겨진 12장 중 이름만 계열에 맞게)
  // 그대로 쓰는 기존 카드: 철사장 uCorpseFlower / 흑호권 legSweep·uEyeGouge·uKneeKick·uStomp
  //                       / 전장권 bribe·purseThrow·blackDeal·uHiredThug·uHireAssassin·uLoanShark·uGoldRain
  tags: {
    purseThrow: { cls: 'fist', school: 'jeonjang', name: '전낭 쥔 주먹' },
    uHireAssassin: { cls: 'fist', school: 'jeonjang', name: '주먹패 부르기' },
  },
  retire: [],
  // 시작 덱: 기본 권법 5 + 뺨 후리기 3 + 주먹 난투 1 + 몸 웅크리기 1
  // (뺨 후리기로 흐트러뜨려 연타의 약화 보너스, 몸 웅크리기로 버티며 은자)
  decks: {
    fist: [
      'uFistBasic', 'uFistBasic', 'uFistBasic', 'uFistBasic', 'uFistBasic',
      'uSlap', 'uSlap', 'uSlap',
      'uBrawl', 'uHunker',
    ],
  },
  basic: { fist: 'uFistBasic' }, // 동굴 기연에서 덜어 내는 기본 무공
};
