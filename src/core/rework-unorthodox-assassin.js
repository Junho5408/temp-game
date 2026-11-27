// 8-D 류파 재편 (unorthodox · 살수). cards.js 가 불러 CARDS 에 적용
// 사파 살수: 단검·암기·그림자. 빠르고 날카롭게, 세력 기믹(약화 dirty·독)
//   하오문 = 뒷골목 암기 (thrown 을 손에 쥐고 있다 버려지며 날아감, throwAll 로 한꺼번에)
//   독문   = 독을 쌓아(poison) 한꺼번에 터뜨린다(burst, poisonKeep)
//   함정꾼 = 미리 깔아 둔 덫(trap)이 적이 칠 때 먼저 터짐 (경공으로 버티고 점혈로 묶기)
// 기존 38장(기본 5 · 하오문 14 · 독문 9 · 함정꾼 10)은 그대로 쓰고,
//   하오문이 넘쳐 표창(uThrowingStar)·석회 주머니(uLimeBag)를 기본 무공으로 돌림.
//   새 카드 6장: 기본 2 (치명·간파 — 살수다운 맛), 독문 3, 함정꾼 1 (심법 유지)
export const REWORK_UNORTHODOX_ASSASSIN = {
  cards: {
    // ══ 살수 기본 무공 (school 없음) ══════════════
    uShadowStab: {
      name: '그림자 찌르기', type: 'attack', rarity: 'common', glyph: '影', faction: 'unorthodox', cls: 'assassin',
      cost: 1, damage: 6, crit: 15,
      upgrade: { damage: 8, crit: 20 },
    },
    uReadOpening: {
      name: '빈틈 엿보기', type: 'skill', rarity: 'common', glyph: '覘', faction: 'unorthodox', cls: 'assassin',
      cost: 0, insight: 1, exhaust: true,
      upgrade: { draw: 1 },
    },

    // ══ 독문 (dokmun) — 쌓고 터뜨린다 ══════════════
    uVenomVein: {
      name: '독맥 찌르기', type: 'attack', rarity: 'common', glyph: '脈', faction: 'unorthodox', cls: 'assassin', school: 'dokmun',
      cost: 1, damage: 4, poison: 1, dirtyBonus: 3,
      upgrade: { damage: 5, dirtyBonus: 4 },
    },
    uBrewVenom: {
      name: '독 달이기', type: 'skill', rarity: 'common', glyph: '煎', faction: 'unorthodox', cls: 'assassin', school: 'dokmun',
      cost: 1, poison: 3, draw: 1,
      upgrade: { poison: 5 },
    },
    uVenomRend: {
      name: '독조 할퀴기', type: 'attack', rarity: 'uncommon', glyph: '爪', faction: 'unorthodox', cls: 'assassin', school: 'dokmun',
      cost: 1, damage: 3, hits: 2, poison: 3,
      upgrade: { damage: 4, poison: 4 },
    },

    // ══ 함정꾼 (hamjeong) — 깔아 두고 기다린다 ══════════════
    uTrapMaster: {
      name: '덫사냥꾼의 눈', type: 'skill', rarity: 'rare', glyph: '獵', faction: 'unorthodox', cls: 'assassin', school: 'hamjeong',
      cost: 1, power: { evasion: 1, point: 2 },
      upgrade: { cost: 0 },
    },
  },

  // 바꿀 기존 카드: 하오문에서 넘친 두 장을 살수 기본으로 (수치는 그대로)
  // 그대로 쓰는 기존 카드:
  //   기본 dagger·venomBlade·sandThrow·flyingKnife·switchGrip
  //   하오문 needle·caltrops·uSleeveDart·uIronLotus·uFlyingSickle / knifeFan·uHiddenBlades·uBeeNeedles·uKnifeSpin / flowerRain·uPourHidden·uPoisonHammer
  //   독문 uSnakeBite·uToadVenom·uPoisonWell / poisonBurst·poisonMist·uVenomSqueeze / fivePoison·uPoisonJar·uMyriadVenom
  //   함정꾼 uSmokeBomb·uTripWire·uPitfall·uNailBoard / uBearTrap·uPoisonSpike·uAmbush·uSnareNet / uKillingGround·uBait
  tags: {
    // 8-D 밸런스: 보상 후보가 살수 무공만으로 좁아져 1구역 30% → 단도 찌르기·독 바른 칼을 조금 올림
    dagger: { damage: 5, upgrade: { damage: 7 } },
    venomBlade: { damage: 5, upgrade: { damage: 6, poison: 4 } },
    uThrowingStar: { cls: 'assassin', school: null },
    uLimeBag: { cls: 'assassin', school: null },
  },
  retire: [],
  // 시작 덱: 예전 사파 시작 덱(UNORTHODOX_DECK) 그대로 — 7-E 까지 1구역 약 44% 로 맞던 덱
  // 단도 찌르기 5 + 독 바른 칼 2 + 모래 뿌리기 1 + 비수 1 + 칼 바꿔 쥐기 1 (약화·독으로 dirty, 비수는 암기 맛보기)
  decks: {
    assassin: [
      'dagger', 'dagger', 'dagger', 'dagger', 'dagger',
      'venomBlade', 'venomBlade', 'sandThrow',
      'flyingKnife', 'switchGrip',
    ],
  },
  basic: { assassin: 'dagger' }, // 동굴 기연에서 덜어 내는 기본 무공
};
