// 8-B 류파 재편 (demonic). cards.js 가 불러 CARDS 에 적용
// 검객: 기본 9 (시작 3종 + 일반 6) / 천마검 12 / 혈검 12 / 마검 11 = 44
// 손톱·장법·주먹·혈계·혈투 몰아치기 → 권사(hyeolsu/maryeong/hyeoltu), 혈투 치명·흡혈 암습·입마 손속임 → 살수(hyeolyeong/dokhyeol/geurimja)
export const REWORK_DEMONIC = {
  // 새 카드 (id: d + camelCase, 기존과 겹치지 않게)
  cards: {
    // ── 기본: 시작 덱의 검 (혈조 자리) ──
    dMaCut: {
      name: '마검 베기', type: 'attack', rarity: 'starter', glyph: '劈', faction: 'demonic', cls: 'sword',
      cost: 1, damage: 7, magi: 1,
      upgrade: { damage: 10, magi: 2 },
    },
    // ── 천마검: 마기를 모으는 검 ──
    dHeavenCut: {
      name: '천마일검', type: 'attack', rarity: 'common', glyph: '一', faction: 'demonic', cls: 'sword', school: 'cheonma',
      cost: 1, damage: 5, magi: 2,
      upgrade: { damage: 7, magi: 3 },
    },
    // ── 혈검: 피를 바쳐 매 턴 강해짐 (심법 유지) ──
    dBloodDrinkArt: {
      name: '음혈검결', type: 'skill', rarity: 'uncommon', glyph: '訣', faction: 'demonic', cls: 'sword', school: 'hyeolgeom',
      cost: 1, hpCost: 4, power: { strength: 1 },
      upgrade: { hpCost: 2 },
    },
    // ── 마검: 입마를 들이고 태운다 ──
    dMadBlade: {
      name: '광마참', type: 'attack', rarity: 'common', glyph: '瘋', faction: 'demonic', cls: 'sword', school: 'magum',
      cost: 1, damage: 9, curse: 1,
      upgrade: { damage: 12 },
    },
    dCurseNick: {
      name: '마검 찌르기', type: 'attack', rarity: 'common', glyph: '刺', faction: 'demonic', cls: 'sword', school: 'magum',
      cost: 0, damage: 3, consumeCurse: 3,
      upgrade: { damage: 4, consumeCurse: 4 },
    },
    dDemonAwaken: {
      name: '마성 각성', type: 'skill', rarity: 'common', glyph: '醒', faction: 'demonic', cls: 'sword', school: 'magum',
      cost: 1, curse: 1, magi: 1, draw: 2,
      upgrade: { draw: 3 },
    },
    dSwordSoul: {
      name: '마검심법', type: 'skill', rarity: 'uncommon', glyph: '妖', faction: 'demonic', cls: 'sword', school: 'magum',
      cost: 1, curse: 2, power: { draw: 1 },
      upgrade: { cost: 0 },
    },
  },

  // 기존 카드 분류 + 바꿀 값 (마교 기존 65장 전부)
  tags: {
    // ── 검객 기본 (시작 덱: 마검 베기·천마심법·마기 일격 / 일반 6) ──
    demonHeart: { cls: 'sword', school: null },
    magiBlade: { cls: 'sword', school: null, rarity: 'starter' }, // 7-B: 마기를 쓰는 무공을 처음부터 — 시작 덱 전용으로
    bloodSword: { cls: 'sword', school: null, name: '혈참' }, // 류파 '혈검' 과 이름이 겹쳐서
    bloodMist: { cls: 'sword', school: null },
    magiAbsorb: { cls: 'sword', school: null },
    bloodCycle: { cls: 'sword', school: null },
    dBloodChant: { cls: 'sword', school: null },
    dShadowStep: { cls: 'sword', school: null },

    // ── 천마검: 마기 모으기 → magiSpend·magiDouble ──
    dMagiSpark: { cls: 'sword', school: 'cheonma' },
    dMagiEdge: { cls: 'sword', school: 'cheonma' },
    dDarkFocus: { cls: 'sword', school: 'cheonma' },
    demonGuard: { cls: 'sword', school: 'cheonma', rarity: 'common' }, // 류파 일반 몫 (경공 4·마기 2, 혈영보보다 조금 셈)
    magiBurst: { cls: 'sword', school: 'cheonma' },
    dMagiSurge: { cls: 'sword', school: 'cheonma' },
    dMagiAmplify: { cls: 'sword', school: 'cheonma' },
    dMagiCycle: { cls: 'sword', school: 'cheonma' },
    dissolution: { cls: 'sword', school: 'cheonma' },
    demonDescent: { cls: 'sword', school: 'cheonma' },
    dMagiRelease: { cls: 'sword', school: 'cheonma' },

    // ── 혈검: 흡혈·체력 대가 ──
    starSuck: { cls: 'sword', school: 'hyeolgeom', name: '흡성검' },
    dRedTide: { cls: 'sword', school: 'hyeolgeom' },
    dRendFlesh: { cls: 'sword', school: 'hyeolgeom' },
    dScarBlade: { cls: 'sword', school: 'hyeolgeom' },
    dBloodFang: { cls: 'sword', school: 'hyeolgeom', name: '혈아검' },
    drainStrike: { cls: 'sword', school: 'hyeolgeom' },
    dSkyCleave: { cls: 'sword', school: 'hyeolgeom' },
    dDrainAura: { cls: 'sword', school: 'hyeolgeom', name: '흡혈검강' },
    bloodOath: { cls: 'sword', school: 'hyeolgeom' },
    heavenDemonBlade: { cls: 'sword', school: 'hyeolgeom' },
    dSoulDevour: { cls: 'sword', school: 'hyeolgeom' },

    // ── 마검: 입마를 섞고 consumeCurse·purge 로 연료 ──
    dCurseFlare: { cls: 'sword', school: 'magum' },
    dCurseBurn: { cls: 'sword', school: 'magum' },
    dDemonEye: { cls: 'sword', school: 'magum' },
    dCurseFeast: { cls: 'sword', school: 'magum' },
    dCurseGnaw: { cls: 'sword', school: 'magum' },
    dGhostCleave: { cls: 'sword', school: 'magum' },
    dReturnOrigin: { cls: 'sword', school: 'magum' },

    // ── 권사로 옮김 ──
    bloodClaw: { cls: 'fist', school: null }, // 혈조: 권사 시작 덱 몫 (손톱)
    // 혈수: 체력 대가·혈계
    dCrimsonPalm: { cls: 'fist', school: 'hyeolsu' },
    dBloodVow: { cls: 'fist', school: 'hyeolsu' },
    dBloodVein: { cls: 'fist', school: 'hyeolsu' },
    dCrimsonVeil: { cls: 'fist', school: 'hyeolsu' },
    dWoundFist: { cls: 'fist', school: 'hyeolsu' },
    dPactBlade: { cls: 'fist', school: 'hyeolsu', name: '혈맹장' },
    dBloodDebt: { cls: 'fist', school: 'hyeolsu' },
    bloodSea: { cls: 'fist', school: 'hyeolsu' },
    bloodRage: { cls: 'fist', school: 'hyeolsu' },
    dBloodGod: { cls: 'fist', school: 'hyeolsu' },
    dBloodCalamity: { cls: 'fist', school: 'hyeolsu' },
    dLastDrop: { cls: 'fist', school: 'hyeolsu' },
    // 마령장: 쌓인 마기가 늘 힘
    dUndyingDemon: { cls: 'fist', school: 'maryeong' },
    // 혈투권: 벼랑 끝 몰아치기
    frenzy: { cls: 'fist', school: 'hyeoltu' },
    dDeathGrip: { cls: 'fist', school: 'hyeoltu' },
    dBoneBreak: { cls: 'fist', school: 'hyeoltu' },
    dNarrowEscape: { cls: 'fist', school: 'hyeoltu' },

    // ── 살수로 옮김 ──
    // 혈영대: 혈투·치명
    lastStand: { cls: 'assassin', school: 'hyeolyeong' },
    dSlaughter: { cls: 'assassin', school: 'hyeolyeong' },
    dRedRain: { cls: 'assassin', school: 'hyeolyeong' },
    dFatalClaw: { cls: 'assassin', school: 'hyeolyeong' },
    dWolfDrain: { cls: 'assassin', school: 'hyeolyeong' },
    dBloodShadowArt: { cls: 'assassin', school: 'hyeolyeong' },
    // 독혈: 흡혈로 서서히 (독 카드는 살수 단계에서)
    dSeizeBlood: { cls: 'assassin', school: 'dokhyeol', name: '탈혈침' },
    dSoulSip: { cls: 'assassin', school: 'dokhyeol' },
    dBloodWhip: { cls: 'assassin', school: 'dokhyeol' },
    // 그림자 마공: 입마를 연료로
    dCurseGreed: { cls: 'assassin', school: 'geurimja' },
  },
  retire: [],
  // 마교 검객 시작 덱: 마검 베기 4 + 혈참 2 + 마기 일격 1 + 혈무 1 + 마기 흡수 1 + 천마심법 1 (옛 혈조 자리를 검으로)
  decks: {
    sword: [
      'dMaCut', 'dMaCut', 'dMaCut', 'dMaCut',
      'bloodSword', 'bloodSword', 'magiBlade', 'bloodMist',
      'magiAbsorb', 'demonHeart',
    ],
  },
  basic: { sword: 'dMaCut' }, // 동굴 기연에서 덜어 내는 기본 무공
};
