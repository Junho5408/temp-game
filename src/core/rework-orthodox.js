// 8-B 류파 재편 (orthodox). cards.js 가 불러 CARDS 에 적용
// 검객: 기본 9 (시작 덱 4종 + 일반 5) + 화산 11 · 무당 12 · 남궁 12 = 44
// 권사로 옮김 13 (소림 1 · 개방 3 · 팔괘 9), 살수로 옮김 13 (점창 6 · 비영 7), retire 0
export const REWORK_ORTHODOX = {
  // 새 카드
  cards: {
    // 화산: 타수가 많아 기세가 여러 번 붙음
    oPlumBlossom: {
      name: '매화낙검', type: 'attack', rarity: 'common', glyph: '梅', faction: 'orthodox', cls: 'sword', school: 'hwasan',
      cost: 1, damage: 2, hits: 3,
      upgrade: { damage: 3 },
    },
    // 무당: 반격·호신
    oTaijiSword: {
      name: '태극검', type: 'attack', rarity: 'common', glyph: '極', faction: 'orthodox', cls: 'sword', school: 'mudang',
      cost: 1, damage: 4, riposte: 3,
      upgrade: { damage: 6, riposte: 4 },
    },
    oCottonGuard: {
      name: '면면호신', type: 'skill', rarity: 'common', glyph: '綿', faction: 'orthodox', cls: 'sword', school: 'mudang',
      cost: 1, guard: 7, evasion: 1,
      upgrade: { guard: 10 },
    },
    oTaijiHeart: {
      name: '양의심법', type: 'skill', rarity: 'uncommon', glyph: '儀', faction: 'orthodox', cls: 'sword', school: 'mudang',
      cost: 1, power: { riposte: 2 },
      upgrade: { cost: 0 },
    },
    oTaijiReturn: {
      name: '태극귀원', type: 'skill', rarity: 'rare', glyph: '圓', faction: 'orthodox', cls: 'sword', school: 'mudang',
      cost: 2, riposte: 6, guard: 8, evasion: 2,
      upgrade: { riposte: 8, guard: 11 },
    },
  },
  // 기존 카드 분류 (정파 65장 전부)
  tags: {
    // ── 검객 기본 (시작 덱 4종 + 일반 5: 연계·점혈·간파 맛보기) ──
    strike: { cls: 'sword', school: null },
    feint: { cls: 'sword', school: null },
    yusu: { cls: 'sword', school: null },
    lightBody: { cls: 'sword', school: null },
    oPineWind: { cls: 'sword', school: null },
    rend: { cls: 'sword', school: null },
    followUp: { cls: 'sword', school: null },
    pointStrike: { cls: 'sword', school: null },
    oContemplate: { cls: 'sword', school: null },

    // ── 화산: 기세 + 연타 ──
    oTwinBlossom: { cls: 'sword', school: 'hwasan' },
    chain: { cls: 'sword', school: 'hwasan' },
    focus: { cls: 'sword', school: 'hwasan' },
    whirl: { cls: 'sword', school: 'hwasan' },
    breathe: { cls: 'sword', school: 'hwasan' },
    oMountainRoot: { cls: 'sword', school: 'hwasan' },
    oRelaySword: { cls: 'sword', school: 'hwasan', name: '매화연검' },
    swordRain: { cls: 'sword', school: 'hwasan', name: '매화검우' },
    oPhoenixDance: { cls: 'sword', school: 'hwasan' },
    stillMind: { cls: 'sword', school: 'hwasan' },

    // ── 무당: 경공·반격, 적이 공격할 때 이득 ──
    oRiposte: { cls: 'sword', school: 'mudang' },
    oFallingLeaf: { cls: 'sword', school: 'mudang' },
    cloudStep: { cls: 'sword', school: 'mudang' },
    counter: { cls: 'sword', school: 'mudang' },
    oParry: { cls: 'sword', school: 'mudang' },
    oCalmSea: { cls: 'sword', school: 'mudang' },
    oTurnHeaven: { cls: 'sword', school: 'mudang' },
    oVoidStep: { cls: 'sword', school: 'mudang' },

    // ── 남궁: 검기 마무리 + 0~1비용·뽑기 ──
    oClearBreeze: { cls: 'sword', school: 'namgung' },
    oClosingBow: { cls: 'sword', school: 'namgung' },
    oOpeningForm: { cls: 'sword', school: 'namgung' },
    footwork: { cls: 'sword', school: 'namgung' },
    oRegulateBreath: { cls: 'sword', school: 'namgung' },
    oRiverHome: { cls: 'sword', school: 'namgung' },
    oMoonlitPair: { cls: 'sword', school: 'namgung' },
    oAfterglow: { cls: 'sword', school: 'namgung' },
    oDawnCall: { cls: 'sword', school: 'namgung' },
    oManyToOne: { cls: 'sword', school: 'namgung' },
    oSkyOpen: { cls: 'sword', school: 'namgung' },
    meteor: { cls: 'sword', school: 'namgung' },

    // ── 권사로 옮김 ──
    oUprightHeart: { cls: 'fist', school: 'sorim' },
    heavenWind: { cls: 'fist', school: 'gaebang', name: '천풍장' },
    oSplitStone: { cls: 'fist', school: 'gaebang', name: '개석장' },
    gather: { cls: 'fist', school: 'gaebang' },
    sway: { cls: 'fist', school: 'palgwae', name: '흘려치기' },
    oneFinger: { cls: 'fist', school: 'palgwae' },
    deathPoint: { cls: 'fist', school: 'palgwae' },
    oMeridianTap: { cls: 'fist', school: 'palgwae' },
    oFixingFinger: { cls: 'fist', school: 'palgwae' },
    oLockMeridian: { cls: 'fist', school: 'palgwae' },
    oPulseReading: { cls: 'fist', school: 'palgwae' },
    oHeavenEarth: { cls: 'fist', school: 'palgwae' },
    oSealHundred: { cls: 'fist', school: 'palgwae' },

    // ── 살수로 옮김 ──
    quick: { cls: 'assassin', school: 'jeomchang' },
    triple: { cls: 'assassin', school: 'jeomchang' },
    flash: { cls: 'assassin', school: 'jeomchang' },
    oWindDraw: { cls: 'assassin', school: 'jeomchang' },
    oThreadNeedle: { cls: 'assassin', school: 'jeomchang' },
    oLowSweep: { cls: 'assassin', school: 'jeomchang' },
    oFirstHand: { cls: 'assassin', school: 'biyeong' },
    oSwallowStep: { cls: 'assassin', school: 'biyeong' },
    oMistStep: { cls: 'assassin', school: 'biyeong' },
    phantom: { cls: 'assassin', school: 'biyeong' },
    oKeenEye: { cls: 'assassin', school: 'biyeong' },
    insight: { cls: 'assassin', school: 'biyeong' },
    oClearSword: { cls: 'assassin', school: 'biyeong', name: '통명심법' },
  },
  retire: [],
  decks: {
    sword: [
      'strike', 'strike', 'strike', 'strike', 'strike',
      'feint', 'feint', 'feint',
      'yusu', 'lightBody',
    ],
  },
  basic: { sword: 'strike' },
};
