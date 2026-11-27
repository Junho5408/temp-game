// 8-D 류파 재편 (orthodox · 살수). cards.js 가 불러 CARDS 에 적용
// 살수: 기본 9 (시작 덱 4종 + 일반 5) + 당가 12 · 점창 12 · 비영 11 = 44
// 8-B 에서 옮겨 온 13장(점창 6 · 비영 7) 그대로 + 새 31장, retire 0
export const REWORK_ORTHODOX_ASSASSIN = {
  // 새 카드
  cards: {
    // ── 살수 기본: 시작 덱 4종 (검객 시작 덱과 비슷한 세기) ──
    oDaggerStab: {
      name: '기본 단검술', type: 'attack', rarity: 'starter', glyph: '匕', faction: 'orthodox', cls: 'assassin',
      cost: 1, damage: 6,
      upgrade: { damage: 9 },
    },
    // 견제 자리: 흐트러짐 + 발도 맛보기
    oFeintStab: {
      name: '암습', type: 'attack', rarity: 'starter', glyph: '暗', faction: 'orthodox', cls: 'assassin',
      cost: 1, damage: 4, weak: 1, opener: 2,
      upgrade: { damage: 6, weak: 2, opener: 3 },
    },
    // 2비용 자리: 두 번 찌르고 치명이 잘 난다
    oTwinDagger: {
      name: '쌍비수', type: 'attack', rarity: 'starter', glyph: '雙', faction: 'orthodox', cls: 'assassin',
      cost: 2, damage: 6, hits: 2, crit: 20,
      upgrade: { damage: 8 },
    },
    // 심법 자리: 경신법 대신 은신 (연마하면 간파)
    oHideStep: {
      name: '은신보', type: 'skill', rarity: 'starter', glyph: '隱', faction: 'orthodox', cls: 'assassin',
      cost: 1, evasion: 3,
      upgrade: { evasion: 4, insight: 1 },
    },

    // ── 살수 기본: 일반 5 (연계·점혈·간파) ──
    oFollowStab: {
      name: '연수', type: 'attack', rarity: 'common', glyph: '續', faction: 'orthodox', cls: 'assassin',
      cost: 0, damage: 3, combo: 3,
      upgrade: { damage: 4, combo: 4 },
    },
    oNeedlePoint: {
      name: '점혈침', type: 'attack', rarity: 'common', glyph: '點', faction: 'orthodox', cls: 'assassin',
      cost: 1, damage: 4, point: 4, sure: true,
      upgrade: { damage: 5, point: 6 },
    },
    oVitalStab: {
      name: '급소 찌르기', type: 'attack', rarity: 'common', glyph: '急', faction: 'orthodox', cls: 'assassin',
      cost: 1, damage: 5, crit: 25,
      upgrade: { damage: 7, crit: 30 },
    },
    oReadGap: {
      name: '허점 읽기', type: 'skill', rarity: 'common', glyph: '虛', faction: 'orthodox', cls: 'assassin',
      cost: 1, insight: 1, evasion: 2,
      upgrade: { evasion: 3, draw: 1 },
    },
    oSilentDraw: {
      name: '무성발도', type: 'attack', rarity: 'common', glyph: '拔', faction: 'orthodox', cls: 'assassin',
      cost: 1, damage: 4, opener: 4,
      upgrade: { damage: 5, opener: 6 },
    },

    // ── 당가: 사천의 암기 세가 — 비수와 독 (암기·중독, 점혈과 이어짐) ──
    oTangDart: {
      name: '당문비수', type: 'attack', rarity: 'common', glyph: '鏢', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 1, damage: 4, thrown: 4,
      upgrade: { damage: 5, thrown: 6 },
    },
    oPlumNeedle: {
      name: '매화침', type: 'attack', rarity: 'common', glyph: '針', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 0, damage: 2, poison: 2, thrown: 2,
      upgrade: { poison: 3, thrown: 3 },
    },
    oVenomEdge: {
      name: '독인', type: 'attack', rarity: 'common', glyph: '毒', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 1, damage: 4, poison: 3,
      upgrade: { damage: 5, poison: 4 },
    },
    oSoulPowder: {
      name: '산혼분', type: 'skill', rarity: 'common', glyph: '散', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 1, poison: 3, weak: 1,
      upgrade: { poison: 5, weak: 2 },
    },
    oSleeveNeedle: {
      name: '수전침', type: 'skill', rarity: 'common', glyph: '袖', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 0, draw: 1, thrown: 2, thrownPoison: 2,
      upgrade: { thrown: 3, thrownPoison: 3 },
    },
    oTangSeal: {
      name: '당가 봉혈침', type: 'attack', rarity: 'uncommon', glyph: '封', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 1, damage: 3, poison: 3, point: 5,
      upgrade: { damage: 4, poison: 4, point: 7 },
    },
    oDartCase: {
      name: '비천낭', type: 'skill', rarity: 'uncommon', glyph: '囊', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 1, draw: 2, thrown: 4, thrownPoison: 2,
      upgrade: { thrown: 6, thrownPoison: 3 },
    },
    oBoneRot: {
      name: '부골산', type: 'skill', rarity: 'uncommon', glyph: '腐', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 2, poison: 7, vulnerable: 1,
      upgrade: { poison: 10 },
    },
    oTangVenomArt: {
      name: '당가 독공', type: 'skill', rarity: 'uncommon', glyph: '蠱', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 1, power: { poison: 1 },
      upgrade: { cost: 0 },
    },
    oStormNeedles: {
      name: '폭우이화침', type: 'attack', rarity: 'rare', glyph: '雨', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 2, damage: 3, hits: 4, poison: 3, thrown: 6,
      upgrade: { hits: 5 },
    },
    oNinePoison: {
      name: '구독침', type: 'attack', rarity: 'rare', glyph: '九', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 1, damage: 4, poison: 5, thrown: 3, thrownPoison: 5,
      upgrade: { poison: 7, thrownPoison: 7 },
    },
    oVenomLock: {
      name: '독혈봉쇄', type: 'skill', rarity: 'rare', glyph: '鎖', faction: 'orthodox', cls: 'assassin', school: 'danga',
      cost: 1, poison: 4, point: 8, weak: 2, exhaust: true,
      upgrade: { poison: 6, point: 10 },
    },

    // ── 점창: 번개 같은 쾌검 — 0~1비용 초식을 잇달아 (perAttack·comboHits·뽑기) ──
    oLightningJab: {
      name: '섬전자', type: 'attack', rarity: 'common', glyph: '電', faction: 'orthodox', cls: 'assassin', school: 'jeomchang',
      cost: 0, damage: 3, comboHits: 1,
      upgrade: { damage: 4 },
    },
    oGaleStab: {
      name: '질풍검', type: 'attack', rarity: 'common', glyph: '疾', faction: 'orthodox', cls: 'assassin', school: 'jeomchang',
      cost: 1, damage: 3, hits: 2, draw: 1,
      upgrade: { damage: 4 },
    },
    oSwiftHeart: {
      name: '쾌의심법', type: 'skill', rarity: 'uncommon', glyph: '迅', faction: 'orthodox', cls: 'assassin', school: 'jeomchang',
      cost: 1, power: { draw: 1 },
      upgrade: { cost: 0 },
    },
    oReturnGoose: {
      name: '회풍낙안검', type: 'attack', rarity: 'rare', glyph: '雁', faction: 'orthodox', cls: 'assassin', school: 'jeomchang',
      cost: 1, damage: 2, hits: 3, perAttack: 1,
      upgrade: { damage: 3 },
    },
    oSplitLight: {
      name: '분광검', type: 'attack', rarity: 'rare', glyph: '分', faction: 'orthodox', cls: 'assassin', school: 'jeomchang',
      cost: 2, damage: 8, hits: 2, perAttack: 2,
      upgrade: { damage: 10 },
    },
    oThunderStep: {
      name: '뇌정보', type: 'skill', rarity: 'rare', glyph: '雷', faction: 'orthodox', cls: 'assassin', school: 'jeomchang',
      cost: 0, energy: 1, draw: 2, exhaust: true,
      upgrade: { energy: 2 },
    },

    // ── 비영: 그림자처럼 — 피하고 빈틈을 찌른다 (경공·반격·간파·발도) ──
    oShadowCut: {
      name: '영살', type: 'attack', rarity: 'common', glyph: '殺', faction: 'orthodox', cls: 'assassin', school: 'biyeong',
      cost: 1, damage: 4, opener: 4, evasion: 1,
      upgrade: { damage: 6, opener: 5 },
    },
    oSideShadow: {
      name: '측영보', type: 'skill', rarity: 'common', glyph: '側', faction: 'orthodox', cls: 'assassin', school: 'biyeong',
      cost: 1, evasion: 2, riposte: 3,
      upgrade: { evasion: 3, riposte: 5 },
    },
    oShadowNet: {
      name: '천라영보', type: 'skill', rarity: 'rare', glyph: '羅', faction: 'orthodox', cls: 'assassin', school: 'biyeong',
      cost: 2, evasion: 4, riposte: 6, insight: 1,
      upgrade: { evasion: 5, riposte: 8 },
    },
    oTracelessKill: {
      name: '무영살', type: 'attack', rarity: 'rare', glyph: '無', faction: 'orthodox', cls: 'assassin', school: 'biyeong',
      cost: 2, damage: 12, opener: 8, crit: 25,
      upgrade: { damage: 15, opener: 10 },
    },
  },
  // 이번 계열에서 바꿀 기존 카드만
  tags: {
    // 검 이름 → 단검·쾌검 느낌
    quick: { name: '쾌수' },
    oThreadNeedle: { name: '연자비', glyph: '燕' },
    oLowSweep: { name: '소퇴자' },
  },
  retire: [],
  decks: {
    assassin: [
      'oDaggerStab', 'oDaggerStab', 'oDaggerStab', 'oDaggerStab', 'oDaggerStab',
      'oFeintStab', 'oFeintStab', 'oFeintStab',
      'oTwinDagger', 'oHideStep',
    ],
  },
  basic: { assassin: 'oDaggerStab' },
};
