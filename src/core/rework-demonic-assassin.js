// 8-D 류파 재편 (demonic · 살수). cards.js 가 불러 CARDS 에 적용
// 살수: 기본 9 (시작 4종 + 일반 5) / 혈영대 12 / 독혈 11 / 그림자 마공 12 = 44
// 8-B 에서 옮겨 온 10장 + 새 34장. 혈랑조(dWolfDrain)는 흡혈이라 혈영대 → 독혈로 옮김. retire 없음
export const REWORK_DEMONIC_ASSASSIN = {
  cards: {
    // ── 기본: 시작 덱 (마영 비수 중심 + 0비용 피칼·경공·간파) ──
    dDemonDagger: {
      name: '마영 비수', type: 'attack', rarity: 'starter', glyph: '匕', faction: 'demonic', cls: 'assassin',
      cost: 1, damage: 6, crit: 10, magi: 1,
      upgrade: { damage: 9 },
    },
    dBloodKnife: {
      name: '혈비도', type: 'attack', rarity: 'starter', glyph: '刃', faction: 'demonic', cls: 'assassin',
      cost: 0, hpCost: 2, damage: 5,
      upgrade: { damage: 7 },
    },
    dShadowSlip: {
      name: '마영보', type: 'skill', rarity: 'starter', glyph: '步', faction: 'demonic', cls: 'assassin',
      cost: 1, evasion: 4, magi: 1,
      upgrade: { evasion: 6 },
    },
    dKillIntent: {
      name: '살기 응집', type: 'skill', rarity: 'starter', glyph: '殺', faction: 'demonic', cls: 'assassin',
      cost: 0, hpCost: 2, magi: 2, insight: 1,
      upgrade: { hpCost: 1, magi: 3 },
    },
    // ── 기본: 일반 ──
    dTwinFang: {
      name: '쌍아 연살', type: 'attack', rarity: 'common', glyph: '雙', faction: 'demonic', cls: 'assassin',
      cost: 2, damage: 4, hits: 3, crit: 10,
      upgrade: { damage: 5 },
    },
    dMagiNeedle: {
      name: '마기침', type: 'attack', rarity: 'common', glyph: '針', faction: 'demonic', cls: 'assassin',
      cost: 1, damage: 4, magiSpend: 2,
      upgrade: { damage: 5, magiSpend: 3 },
    },
    dAmbushDraw: {
      name: '암영 발도', type: 'attack', rarity: 'common', glyph: '拔', faction: 'demonic', cls: 'assassin',
      cost: 1, damage: 4, opener: 4, magi: 1,
      upgrade: { damage: 6, opener: 5 },
    },
    dBlackPin: {
      name: '흑침', type: 'attack', rarity: 'common', glyph: '黑', faction: 'demonic', cls: 'assassin',
      cost: 0, damage: 3, magi: 1,
      upgrade: { damage: 5 },
    },
    dDarkStep: {
      name: '흑영 보법', type: 'skill', rarity: 'common', glyph: '暗', faction: 'demonic', cls: 'assassin',
      cost: 1, evasion: 2, draw: 1, magi: 1,
      upgrade: { evasion: 3, draw: 2 },
    },

    // ── 혈영대: 피를 흘려 벼랑 끝(혈투)에서 치명·발도로 끊는다 ──
    dRedDraw: {
      name: '혈발도', type: 'attack', rarity: 'common', glyph: '發', faction: 'demonic', cls: 'assassin', school: 'hyeolyeong',
      cost: 1, damage: 5, opener: 3, desperate: 3,
      upgrade: { damage: 7, opener: 4, desperate: 4 },
    },
    dKillerEdge: {
      name: '살수의 칼', type: 'attack', rarity: 'common', glyph: '刀', faction: 'demonic', cls: 'assassin', school: 'hyeolyeong',
      cost: 1, damage: 5, crit: 30,
      upgrade: { damage: 7 },
    },
    dBloodScent: {
      name: '혈향 추적', type: 'skill', rarity: 'common', glyph: '嗅', faction: 'demonic', cls: 'assassin', school: 'hyeolyeong',
      cost: 1, hpCost: 4, insight: 1, draw: 2,
      upgrade: { hpCost: 2 },
    },
    dCrimsonAmbush: {
      name: '혈영 습격', type: 'attack', rarity: 'uncommon', glyph: '襲', faction: 'demonic', cls: 'assassin', school: 'hyeolyeong',
      cost: 2, damage: 6, hits: 2, opener: 3, desperate: 3,
      upgrade: { damage: 8 },
    },
    dBloodMoon: {
      name: '혈월참', type: 'attack', rarity: 'rare', glyph: '月', faction: 'demonic', cls: 'assassin', school: 'hyeolyeong',
      cost: 2, damage: 12, desperate: 10, crit: 40,
      upgrade: { damage: 15, desperate: 12 },
    },
    dHuntArt: {
      name: '혈영추살공', type: 'skill', rarity: 'rare', glyph: '獵', faction: 'demonic', cls: 'assassin', school: 'hyeolyeong',
      cost: 2, hpCost: 4, power: { insight: 1 },
      upgrade: { cost: 1 },
    },
    dBloodRush: {
      name: '혈영 폭주', type: 'skill', rarity: 'rare', glyph: '暴', faction: 'demonic', cls: 'assassin', school: 'hyeolyeong',
      cost: 0, hpCost: 6, energy: 2, draw: 1, exhaust: true,
      upgrade: { hpCost: 4 },
    },

    // ── 독혈: 독을 넣고 피를 빨아 서서히 말린다 ──
    dVenomMist: {
      name: '혈독무', type: 'skill', rarity: 'common', glyph: '毒', faction: 'demonic', cls: 'assassin', school: 'dokhyeol',
      cost: 1, poison: 4, weak: 1,
      upgrade: { poison: 6 },
    },
    dVenomFang: {
      name: '독아 흡혈', type: 'attack', rarity: 'uncommon', glyph: '牙', faction: 'demonic', cls: 'assassin', school: 'dokhyeol',
      cost: 1, damage: 4, poison: 2, lifesteal: 0.5,
      upgrade: { damage: 6, poison: 3 },
    },
    dVenomTransfer: {
      name: '혈독 전이', type: 'skill', rarity: 'uncommon', glyph: '移', faction: 'demonic', cls: 'assassin', school: 'dokhyeol',
      cost: 0, hpCost: 3, poison: 5,
      upgrade: { poison: 7 },
    },
    dBleedNeedles: {
      name: '혈침 연사', type: 'attack', rarity: 'uncommon', glyph: '連', faction: 'demonic', cls: 'assassin', school: 'dokhyeol',
      cost: 1, damage: 2, hits: 3, poison: 2,
      upgrade: { damage: 3, poison: 3 },
    },
    dVenomKiss: {
      name: '천독흡혈', type: 'attack', rarity: 'rare', glyph: '吻', faction: 'demonic', cls: 'assassin', school: 'dokhyeol',
      cost: 1, damage: 4, poison: 6, lifesteal: 0.5,
      upgrade: { damage: 5, poison: 8 },
    },
    dWitherCut: {
      name: '고혈참', type: 'attack', rarity: 'rare', glyph: '枯', faction: 'demonic', cls: 'assassin', school: 'dokhyeol',
      cost: 2, damage: 5, hits: 3, lifesteal: 0.75,
      upgrade: { damage: 7 },
    },
    dVenomBloodArt: {
      name: '만독혈경', type: 'skill', rarity: 'rare', glyph: '經', faction: 'demonic', cls: 'assassin', school: 'dokhyeol',
      cost: 2, power: { poison: 3, magi: 1 },
      upgrade: { cost: 1 },
    },

    // ── 그림자 마공: 입마를 들여 그림자에 숨고, 입마를 태워 찌른다 ──
    dShadowStab: {
      name: '마영자', type: 'attack', rarity: 'common', glyph: '刺', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 1, damage: 8, crit: 15, curse: 1,
      upgrade: { damage: 11 },
    },
    dShadowFeed: {
      name: '식영', type: 'attack', rarity: 'common', glyph: '食', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 1, damage: 4, consumeCurse: 4, evasion: 1,
      upgrade: { damage: 5, consumeCurse: 6 },
    },
    dShadowHide: {
      name: '마영 은신', type: 'skill', rarity: 'common', glyph: '隱', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 1, evasion: 4, curse: 1,
      upgrade: { evasion: 6 },
    },
    dShadowCleanse: {
      name: '흑영 정화', type: 'skill', rarity: 'common', glyph: '淨', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 1, purge: true, evasion: 2, draw: 1,
      upgrade: { evasion: 3, draw: 2 },
    },
    dShadowPricks: {
      name: '영침', type: 'attack', rarity: 'common', glyph: '影', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 0, damage: 2, hits: 2, consumeCurse: 2,
      upgrade: { damage: 3 },
    },
    dShadowCounter: {
      name: '영반', type: 'skill', rarity: 'uncommon', glyph: '反', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 1, evasion: 3, riposte: 3, curse: 1,
      upgrade: { riposte: 5 },
    },
    dSplitShadow: {
      name: '분영살', type: 'attack', rarity: 'uncommon', glyph: '分', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 1, damage: 3, hits: 2, consumeCurse: 3,
      upgrade: { damage: 4, consumeCurse: 4 },
    },
    dDarkEye: {
      name: '마안 은형', type: 'skill', rarity: 'uncommon', glyph: '眼', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 0, curse: 1, insight: 1, evasion: 1,
      upgrade: { evasion: 3 },
    },
    dShadowDevour: {
      name: '흑영탄마', type: 'attack', rarity: 'rare', glyph: '呑', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 2, damage: 10, consumeCurse: 10, sure: true,
      upgrade: { damage: 13 },
    },
    dMyriadShadow: {
      name: '만영마공', type: 'skill', rarity: 'rare', glyph: '萬', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 1, purge: true, evasion: 5, draw: 2,
      upgrade: { evasion: 7 },
    },
    dShadowSelf: {
      name: '천마영신', type: 'skill', rarity: 'rare', glyph: '身', faction: 'demonic', cls: 'assassin', school: 'geurimja',
      cost: 1, curse: 2, power: { evasion: 1, draw: 1 },
      upgrade: { cost: 0 },
    },
  },

  // 이번 계열에서 바꿀 기존 카드만 (나머지는 rework-demonic.js 의 분류 그대로)
  tags: {
    dWolfDrain: { cls: 'assassin', school: 'dokhyeol', name: '혈랑쌍비' }, // 혈영대 → 독혈: 흡혈 몫, 손톱 이름을 쌍비수로
    dFatalClaw: { name: '절명비' }, // 손톱(조) → 비수
    dBloodWhip: { name: '혈사편' }, // 독혈 쪽 이름 (채찍 → 피 실 채찍)
  },
  retire: [],
  // 마교 살수 시작 덱: 마영 비수 4 + 혈비도 2 + 쌍아 연살 1 + 마기침 1 + 마영보 1 + 살기 응집 1
  decks: {
    assassin: [
      'dDemonDagger', 'dDemonDagger', 'dDemonDagger', 'dDemonDagger',
      'dBloodKnife', 'dBloodKnife', 'dTwinFang', 'dMagiNeedle',
      'dShadowSlip', 'dKillIntent',
    ],
  },
  basic: { assassin: 'dDemonDagger' }, // 동굴 기연에서 덜어 내는 기본 무공
};
