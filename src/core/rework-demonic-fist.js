// 8-C 류파 재편 (demonic · 권사). cards.js 가 불러 CARDS 에 적용
// 권사: 기본 9 (시작 4종 + 일반 5) / 혈수 11 / 마령장 12 / 혈투권 12 = 44
// 8-B 에서 옮겨 온 18장 + 새 26장. 혈해(bloodSea)는 마령장으로, 혈갑(dCrimsonVeil)은 혈투권으로 옮김. retire 없음
export const REWORK_DEMONIC_FIST = {
  cards: {
    // ── 기본: 시작 덱 (혈조 중심 + 연타·호신·마기) ──
    dBloodCombo: {
      name: '혈권 연타', type: 'attack', rarity: 'starter', glyph: '捶', faction: 'demonic', cls: 'fist',
      cost: 1, hpCost: 1, damage: 4, hits: 2,
      upgrade: { damage: 5 },
    },
    dBloodGuard: {
      name: '혈기 호신', type: 'skill', rarity: 'starter', glyph: '守', faction: 'demonic', cls: 'fist',
      cost: 1, guard: 7, magi: 1,
      upgrade: { guard: 10 },
    },
    dMagiBreath: {
      name: '마기 운공', type: 'skill', rarity: 'starter', glyph: '氣', faction: 'demonic', cls: 'fist',
      cost: 0, hpCost: 2, magi: 2, draw: 1,
      upgrade: { draw: 2 },
    },
    // ── 기본: 일반 ──
    dBlackPalm: {
      name: '흑살장', type: 'attack', rarity: 'common', glyph: '黑', faction: 'demonic', cls: 'fist',
      cost: 2, damage: 12, magi: 2,
      upgrade: { damage: 16, magi: 3 },
    },
    dRecoilFist: {
      name: '반탄권', type: 'attack', rarity: 'common', glyph: '彈', faction: 'demonic', cls: 'fist',
      cost: 1, damage: 4, riposte: 3,
      upgrade: { damage: 6, riposte: 4 },
    },
    dIronBloodFist: {
      name: '철혈권', type: 'attack', rarity: 'common', glyph: '鐵', faction: 'demonic', cls: 'fist',
      cost: 1, damage: 5, guard: 4,
      upgrade: { damage: 7, guard: 5 },
    },
    dDemonBarrage: {
      name: '마권 난타', type: 'attack', rarity: 'common', glyph: '打', faction: 'demonic', cls: 'fist',
      cost: 1, damage: 2, hits: 3, magi: 1,
      upgrade: { damage: 3 },
    },
    dTurtleBreath: {
      name: '귀식 운공', type: 'skill', rarity: 'common', glyph: '龜', faction: 'demonic', cls: 'fist',
      cost: 0, guard: 4, magi: 1,
      upgrade: { guard: 6 },
    },

    // ── 혈수: 체력 대가·혈계 (심법 유지 1) ──
    dBloodHandArt: {
      name: '혈수신공', type: 'skill', rarity: 'uncommon', glyph: '功', faction: 'demonic', cls: 'fist', school: 'hyeolsu',
      cost: 1, hpCost: 5, power: { strength: 1 },
      upgrade: { hpCost: 3 },
    },

    // ── 마령장: 마기를 쌓아 두고 여러 번 치는 장법 (마기 6마다 한 타 +1), 마지막에 쏟기 ──
    dYinDemonPalm: {
      name: '음마장', type: 'attack', rarity: 'common', glyph: '陰', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 1, damage: 3, hits: 2, magi: 2,
      upgrade: { damage: 4, magi: 3 },
    },
    dMagiHoard: {
      name: '마기 축적', type: 'skill', rarity: 'common', glyph: '蓄', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 1, magi: 4, guard: 4,
      upgrade: { magi: 5, guard: 6 },
    },
    dAbsorbFist: {
      name: '흡마권', type: 'attack', rarity: 'common', glyph: '攝', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 1, damage: 5, magi: 1, draw: 1,
      upgrade: { damage: 7 },
    },
    dDemonFlurry: {
      name: '마령 난장', type: 'attack', rarity: 'common', glyph: '舞', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 2, damage: 3, hits: 3, magi: 1,
      upgrade: { damage: 4 },
    },
    dBreakPalm: {
      name: '파마장', type: 'attack', rarity: 'common', glyph: '碎', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 1, damage: 4, magiSpend: 1,
      upgrade: { damage: 5, magiSpend: 2 },
    },
    dMagiGuardArt: {
      name: '마령 호체공', type: 'skill', rarity: 'uncommon', glyph: '體', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 1, power: { magi: 1, guard: 3 },
      upgrade: { cost: 0 },
    },
    dTwinDemonPalm: {
      name: '마령쌍장', type: 'attack', rarity: 'uncommon', glyph: '雙', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 2, damage: 5, hits: 2, magiSpend: 1,
      upgrade: { damage: 7 },
    },
    dMagiRecoil: {
      name: '마기 반탄', type: 'skill', rarity: 'uncommon', glyph: '反', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 1, riposte: 4, magi: 2,
      upgrade: { riposte: 6 },
    },
    dMyriadPalm: {
      name: '만마앙종', type: 'attack', rarity: 'rare', glyph: '萬', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 2, damage: 2, hits: 5, magi: 2,
      upgrade: { damage: 3 },
    },
    dSovereignPalm: {
      name: '천마군림장', type: 'attack', rarity: 'rare', glyph: '君', faction: 'demonic', cls: 'fist', school: 'maryeong',
      cost: 2, damage: 6, hits: 2, magiSpend: 2, curse: 1,
      upgrade: { damage: 8 },
    },

    // ── 혈투권: 체력을 깎아 벼랑 끝으로, 버티며 몰아친다 ──
    dDesperateJab: {
      name: '혈투 연권', type: 'attack', rarity: 'common', glyph: '連', faction: 'demonic', cls: 'fist', school: 'hyeoltu',
      cost: 1, damage: 3, hits: 2, desperate: 3,
      upgrade: { damage: 4, desperate: 4 },
    },
    dDeathStance: {
      name: '사투의 각오', type: 'skill', rarity: 'common', glyph: '覺', faction: 'demonic', cls: 'fist', school: 'hyeoltu',
      cost: 0, hpCost: 5, guard: 6,
      upgrade: { guard: 9 },
    },
    dMadBloodFist: {
      name: '광혈권', type: 'attack', rarity: 'common', glyph: '暴', faction: 'demonic', cls: 'fist', school: 'hyeoltu',
      cost: 1, hpCost: 3, damage: 6, desperate: 4,
      upgrade: { damage: 8, desperate: 5 },
    },
    dUndyingBloodArt: {
      name: '불사혈공', type: 'skill', rarity: 'uncommon', glyph: '不', faction: 'demonic', cls: 'fist', school: 'hyeoltu',
      cost: 1, hpCost: 3, power: { guard: 3 },
      upgrade: { cost: 0 },
    },
    dDeathCounter: {
      name: '혈투 반격', type: 'attack', rarity: 'uncommon', glyph: '搏', faction: 'demonic', cls: 'fist', school: 'hyeoltu',
      cost: 1, damage: 4, desperate: 4, riposte: 3,
      upgrade: { damage: 5, desperate: 5, riposte: 4 },
    },
    dFinalFist: {
      name: '최후의 일권', type: 'attack', rarity: 'rare', glyph: '終', faction: 'demonic', cls: 'fist', school: 'hyeoltu',
      cost: 2, damage: 10, desperate: 12, sure: true,
      upgrade: { damage: 13, desperate: 15 },
    },
    dBrinkFrenzy: {
      name: '광마의 문턱', type: 'skill', rarity: 'rare', glyph: '閾', faction: 'demonic', cls: 'fist', school: 'hyeoltu',
      cost: 0, hpCost: 7, strength: 3, draw: 1, exhaust: true,
      upgrade: { strength: 4 },
    },
  },

  // 이번 계열에서 바꿀 기존 카드만 (나머지는 rework-demonic.js 의 분류 그대로)
  tags: {
    bloodSea: { cls: 'fist', school: 'maryeong' }, // 혈수 → 마령장: 체력 대가마다 마기 +2 로 마기 쌓기 몫
    dCrimsonVeil: { cls: 'fist', school: 'hyeoltu' }, // 혈수 → 혈투권: 피를 내주고 버티는 몫
    dBoneBreak: { cls: 'fist', school: 'hyeoltu', name: '쇄골권' }, // 손속 이름을 주먹으로
  },
  retire: [],
  // 마교 권사 시작 덱: 혈조 4 + 혈권 연타 2 + 반탄권 1 + 흑살장 1 + 혈기 호신 1 + 마기 운공 1
  decks: {
    fist: [
      'bloodClaw', 'bloodClaw', 'bloodClaw', 'bloodClaw',
      'dBloodCombo', 'dBloodCombo', 'dRecoilFist', 'dBlackPalm',
      'dBloodGuard', 'dMagiBreath',
    ],
  },
  basic: { fist: 'bloodClaw' }, // 동굴 기연에서 덜어 내는 기본 무공
};
