// 8-C 류파 재편 (orthodox · 권사). cards.js 가 불러 CARDS 에 적용
// 권사: 기본 9 (시작 덱 4종 + 일반 5) + 소림 12 · 개방 11 · 팔괘 11 = 43
// 8-B 에서 옮겨 온 13장(소림 1 · 개방 3 · 팔괘 9) 그대로 + 새 30장, retire 0
export const REWORK_ORTHODOX_FIST = {
  // 새 카드
  cards: {
    // ── 권사 기본: 시작 덱 4종 (검객 시작 덱과 비슷한 세기) ──
    oFistStrike: {
      name: '기본 권법', type: 'attack', rarity: 'starter', glyph: '拳', faction: 'orthodox', cls: 'fist',
      cost: 1, damage: 6,
      upgrade: { damage: 9 },
    },
    // 견제 자리: 흐트러짐 + 점혈 맛보기
    oCheckPalm: {
      name: '견제장', type: 'attack', rarity: 'starter', glyph: '牽', faction: 'orthodox', cls: 'fist',
      cost: 1, damage: 4, weak: 1, point: 2,
      upgrade: { damage: 6, weak: 2, point: 3 },
    },
    // 2비용 자리: 짧은 연타 + 연계
    oLinkFist: {
      name: '연환권', type: 'attack', rarity: 'starter', glyph: '環', faction: 'orthodox', cls: 'fist',
      cost: 2, damage: 4, hits: 3, combo: 1,
      upgrade: { damage: 5 },
    },
    // 심법 자리: 경신법 대신 호신
    oIronBody: {
      name: '호신강기', type: 'skill', rarity: 'starter', glyph: '護', faction: 'orthodox', cls: 'fist',
      cost: 1, guard: 5,
      upgrade: { guard: 8 },
    },

    // ── 권사 기본: 일반 5 (연계·점혈·간파) ──
    oFollowFist: {
      name: '이어치기', type: 'attack', rarity: 'common', glyph: '續', faction: 'orthodox', cls: 'fist',
      cost: 1, damage: 5, combo: 4,
      upgrade: { damage: 7, combo: 6 },
    },
    oPressPalm: {
      name: '압혈장', type: 'attack', rarity: 'common', glyph: '壓', faction: 'orthodox', cls: 'fist',
      cost: 1, damage: 5, point: 3, vulnerable: 1,
      upgrade: { damage: 7, point: 5 },
    },
    oStillGaze: {
      name: '정관', type: 'skill', rarity: 'common', glyph: '觀', faction: 'orthodox', cls: 'fist',
      cost: 1, insight: 1, guard: 4,
      upgrade: { guard: 7 },
    },
    oSteadyBreath: {
      name: '조식', type: 'skill', rarity: 'common', glyph: '息', faction: 'orthodox', cls: 'fist',
      cost: 0, draw: 1, guard: 2,
      upgrade: { draw: 2 },
    },
    oTwinPalm: {
      name: '쌍장', type: 'attack', rarity: 'common', glyph: '雙', faction: 'orthodox', cls: 'fist',
      cost: 2, damage: 7, hits: 2, vulnerable: 1,
      upgrade: { damage: 9 },
    },

    // ── 소림: 막고 버틴 뒤 되돌려 준다 (호신·반격·공격 예고 시 +) ──
    oArhatFist: {
      name: '나한권', type: 'attack', rarity: 'common', glyph: '羅', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 1, damage: 5, guard: 4,
      upgrade: { damage: 7, guard: 5 },
    },
    oVajraGuard: {
      name: '금강호체', type: 'skill', rarity: 'common', glyph: '剛', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 1, guard: 8,
      upgrade: { guard: 11 },
    },
    oRebound: {
      name: '반탄강기', type: 'skill', rarity: 'common', glyph: '彈', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 1, riposte: 4, guard: 3,
      upgrade: { riposte: 6, guard: 4 },
    },
    oLionRoar: {
      name: '사자후', type: 'attack', rarity: 'common', glyph: '吼', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 1, damage: 5, weak: 1, bonusIfAttacking: 3,
      upgrade: { damage: 7, bonusIfAttacking: 4 },
    },
    oBellShirt: {
      name: '금종조', type: 'skill', rarity: 'uncommon', glyph: '鐘', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 1, power: { guard: 3 },
      upgrade: { cost: 0 },
    },
    oTigerFist: {
      name: '복호권', type: 'attack', rarity: 'uncommon', glyph: '伏', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 2, damage: 10, bonusIfAttacking: 6, guard: 5,
      upgrade: { damage: 13, bonusIfAttacking: 8 },
    },
    oGreatPalm: {
      name: '대력금강장', type: 'attack', rarity: 'uncommon', glyph: '力', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 2, damage: 12, riposte: 4,
      upgrade: { damage: 15, riposte: 6 },
    },
    oUnmoved: {
      name: '부동심', type: 'skill', rarity: 'uncommon', glyph: '不', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 1, guard: 5, riposte: 3, draw: 1,
      upgrade: { guard: 7, riposte: 4 },
    },
    oDiamondBody: {
      name: '금강불괴', type: 'skill', rarity: 'rare', glyph: '金', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 2, guard: 12, riposte: 7,
      upgrade: { guard: 15, riposte: 9 },
    },
    oSinewClassic: {
      name: '역근경', type: 'skill', rarity: 'rare', glyph: '易', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 2, power: { guard: 3, riposte: 2 },
      upgrade: { cost: 1 },
    },
    oBuddhaPalm: {
      name: '여래신장', type: 'attack', rarity: 'rare', glyph: '佛', faction: 'orthodox', cls: 'fist', school: 'sorim',
      cost: 3, damage: 18, bonusIfAttacking: 12, sure: true,
      upgrade: { damage: 22, bonusIfAttacking: 14 },
    },

    // ── 개방: 내공을 모아 크게 한 방 (내상 걸고 큰 장풍, 내공·뽑기) ──
    oVoidPalm: {
      name: '벽공장', type: 'attack', rarity: 'common', glyph: '空', faction: 'orthodox', cls: 'fist', school: 'gaebang',
      cost: 1, damage: 6, sure: true,
      upgrade: { damage: 8 },
    },
    oDragonField: {
      name: '현룡재전', type: 'attack', rarity: 'common', glyph: '見', faction: 'orthodox', cls: 'fist', school: 'gaebang',
      cost: 1, damage: 5, vulnerable: 2,
      upgrade: { damage: 7, vulnerable: 3 },
    },
    oBreathDraw: {
      name: '토납법', type: 'skill', rarity: 'common', glyph: '納', faction: 'orthodox', cls: 'fist', school: 'gaebang',
      cost: 1, draw: 2,
      upgrade: { draw: 3 },
    },
    oRegretDragon: {
      name: '항룡유회', type: 'attack', rarity: 'uncommon', glyph: '悔', faction: 'orthodox', cls: 'fist', school: 'gaebang',
      cost: 2, damage: 18, accuracy: 80,
      upgrade: { damage: 24 },
    },
    oDrunkStep: {
      name: '취팔선보', type: 'skill', rarity: 'uncommon', glyph: '醉', faction: 'orthodox', cls: 'fist', school: 'gaebang',
      cost: 1, evasion: 3, energy: 1,
      upgrade: { evasion: 5 },
    },
    oFlyingDragon: {
      name: '비룡재천', type: 'attack', rarity: 'uncommon', glyph: '飛', faction: 'orthodox', cls: 'fist', school: 'gaebang',
      cost: 2, damage: 12, draw: 2,
      upgrade: { damage: 15 },
    },
    oHiddenDragon: {
      name: '잠룡심법', type: 'skill', rarity: 'rare', glyph: '潛', faction: 'orthodox', cls: 'fist', school: 'gaebang',
      cost: 3, power: { energy: 1 },
      upgrade: { cost: 2 },
    },
    oPrimalQi: {
      name: '혼원일기', type: 'skill', rarity: 'rare', glyph: '元', faction: 'orthodox', cls: 'fist', school: 'gaebang',
      cost: 1, energy: 2, draw: 2, exhaust: true,
      upgrade: { cost: 0 },
    },

    // ── 팔괘: 점혈·흐트러짐으로 굳힌다 ──
    oCircleStep: {
      name: '팔괘유신보', type: 'skill', rarity: 'common', glyph: '卦', faction: 'orthodox', cls: 'fist', school: 'palgwae',
      cost: 1, evasion: 2, point: 4,
      upgrade: { evasion: 3, point: 6 },
    },
    oTurningPalm: {
      name: '팔괘전장', type: 'skill', rarity: 'uncommon', glyph: '轉', faction: 'orthodox', cls: 'fist', school: 'palgwae',
      cost: 1, weak: 2, point: 4, draw: 1,
      upgrade: { weak: 3, point: 6 },
    },
  },
  // 이번 계열에서 바꿀 기존 카드만
  tags: {
    // 소림에 맞게 경공 대신 호신
    oUprightHeart: { guard: 4, evasion: 0, upgrade: { evasion: 0, guard: 6 } },
  },
  retire: [],
  decks: {
    fist: [
      'oFistStrike', 'oFistStrike', 'oFistStrike', 'oFistStrike', 'oFistStrike',
      'oCheckPalm', 'oCheckPalm', 'oCheckPalm',
      'oLinkFist', 'oIronBody',
    ],
  },
  basic: { fist: 'oFistStrike' },
};
