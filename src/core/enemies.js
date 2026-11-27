// 적 정의 (1구역: 후기지수 비무대회)
// 행동(pattern) 필드
//   name, damage, hits, accuracy(명중 %, 기본 90)
//   strength(자신 기세 +), heal(자신 회복)
//   weak / vulnerable / poison (맞으면 플레이어에게)
//   counter: 반격 자세 — 다음 내 차례 동안 초식을 쓰면 n 피해를 되받음
//   charge + breakAt: 필살기 — 예고된 내 차례에 breakAt 이상 피해를 주면 파기(破氣)되어 굳음
// patternMode: cycle(순서대로, 기본) / random(무작위, 같은 수 연속 없음)
// evasion: 회피율 %, crit: 치명 %(기본 5)
// traits: 아래 TRAITS (화면에 아이콘으로 표시)
// phase2: { at: 체력 비율, title, text, traits, strength, pattern, patternMode } — 두목의 2단계
// tier: normal(일반) / elite(고수) / boss(두목) / tutorial / test
// art 는 src/ui/characters.js 의 디자인 키
// 지도에서 위층으로 갈수록 체력과 기세가 붙어서 나옴 (run.js 의 scaleForRow)

export const TRAITS = {
  ironBody: { name: '철포삼', glyph: '鐵', desc: '매 턴 처음 받는 일격의 피해가 절반' },
  venom: { name: '독수', glyph: '毒', desc: '공격이 맞을 때마다 중독 1' },
  drain: { name: '흡성대법', glyph: '吸', desc: '준 피해의 절반만큼 회복' },
  berserk: { name: '광폭', glyph: '狂', desc: '체력이 절반 아래로 떨어지면 기세 +3' },
  feint: { name: '허초', glyph: '虛', desc: '가끔 다음 수를 숨긴다' },
  killer: { name: '살기', glyph: '殺', desc: '치명 확률 25%' },
};

// 점혈 게이지 최대치 (한 번 굳을 때마다 +6)
export const POINT_MAX = { tutorial: 10, test: 10, normal: 10, elite: 14, boss: 20 };

export const ENEMIES = {
  // ── 일반 ─────────────────
  // 정면 승부형: 철포삼으로 첫 타를 버티고, 기를 모아 붕산권
  ironFist: {
    name: '곽진', title: '철권문 후기지수', art: 'orthodox-fist', tier: 'normal',
    maxHp: 38, traits: ['ironBody'],
    pattern: [
      { name: '철권', damage: 7 },
      { name: '진각 · 기를 모은다', strength: 1 },
      { name: '붕산권', damage: 13, charge: true, breakAt: 10 },
      { name: '연환권', damage: 3, hits: 3 },
    ],
  },
  // 변칙형: 무작위로 칼을 바꾸고, 반격 자세로 성급한 공격을 벌함
  ronin: {
    name: '마철', title: '비무대에 끼어든 낭인', art: 'unorthodox-sword', tier: 'normal',
    maxHp: 36, evasion: 10, patternMode: 'random',
    pattern: [
      { name: '쾌검 이연격', damage: 4, hits: 2 },
      { name: '낭인검', damage: 7, weak: 1 },
      { name: '반격 자세', counter: 4 },
      { name: '난도질', damage: 3, hits: 3 },
    ],
  },
  // 버티기형: 맞을수록 광폭해짐, 박치기는 크지만 잘 빗나감
  brawler: {
    name: '왕삼', title: '흑도 주먹패', art: 'unorthodox-fist', tier: 'normal',
    maxHp: 42, traits: ['berserk'],
    pattern: [
      { name: '주먹질', damage: 7 },
      { name: '술병 던지기', damage: 5, weak: 1 },
      { name: '난타', damage: 3, hits: 3 },
      { name: '박치기', damage: 11, accuracy: 70 },
    ],
  },
  // 회피형: 잘 피하고, 수를 숨기고, 독침을 쓴다
  inspector: {
    name: '소영', title: '대회 감찰 밀정', art: 'orthodox-assassin', tier: 'normal',
    maxHp: 32, evasion: 20, traits: ['feint'], patternMode: 'random',
    pattern: [
      { name: '암침', damage: 4, poison: 2 },
      { name: '급소 노리기', vulnerable: 2 },
      { name: '급소 찌르기', damage: 9 },
    ],
  },

  // ── 고수 ─────────────────
  oneEye: {
    name: '독안귀', title: '외눈 살수', art: 'unorthodox-assassin', tier: 'elite',
    maxHp: 58, evasion: 15, traits: ['venom', 'killer'],
    pattern: [
      { name: '독비도', damage: 3, hits: 3 },
      { name: '그림자 숨기 · 살기를 모은다', strength: 2 },
      { name: '목 베기', damage: 15, charge: true, breakAt: 12 },
    ],
  },
  masked: {
    name: '무명', title: '정체불명의 복면객', art: 'demonic-assassin', tier: 'elite',
    maxHp: 64, evasion: 10, traits: ['feint'],
    clue: 'mask', // 쓰러뜨리면 얻는 단서
    pattern: [
      { name: '혈기 개방', strength: 2 },
      { name: '혈인쌍참', damage: 6, hits: 2 },
      { name: '반격 자세', counter: 6 },
      { name: '귀면 위압', damage: 9, weak: 2 },
    ],
  },

  // ── 두목 ─────────────────
  // 1단계: 정파 검법으로 위장 / 2단계: 체력 절반에서 마공을 드러냄
  spy: {
    name: '연무혁', title: '비무대회 우승 후보', art: 'demonic-sword', tier: 'boss',
    maxHp: 150,
    clue: 'note',
    pattern: [
      { name: '청풍검법', damage: 10 },
      { name: '반격 자세', counter: 6 },
      { name: '정심결', strength: 2 },
      { name: '연환 부채', damage: 5, hits: 2, weak: 1 },
    ],
    phase2: {
      at: 0.5,
      title: '정체를 드러낸 마교 첩자',
      text: '연무혁의 눈이 붉게 물든다 — 숨겨 온 마공을 드러냈다!',
      traits: ['drain'],
      strength: 2,
      pattern: [
        { name: '혈마심법 · 기를 모은다', strength: 2 },
        { name: '천마일섬', damage: 22, charge: true, breakAt: 20, vulnerable: 2 },
        { name: '혈우검', damage: 4, hits: 4 },
        { name: '혈영참', damage: 12 },
      ],
    },
  },
};

// ══ 2구역: 녹림 토벌 (무림맹의 사파 토벌대에 끼어서) ══════════════
Object.assign(ENEMIES, {
  bandit: {
    name: '장칠', title: '녹림 산적', art: 'unorthodox-fist', tier: 'normal',
    maxHp: 58,
    pattern: [
      { name: '도끼질', damage: 9 },
      { name: '함성 · 기를 모은다', strength: 2 },
      { name: '난도질', damage: 4, hits: 3 },
    ],
  },
  snakeWoman: {
    name: '여독사', title: '독사방 독수', art: 'unorthodox-assassin', tier: 'normal',
    maxHp: 42, evasion: 20, traits: ['venom'], patternMode: 'random',
    pattern: [
      { name: '사독침', damage: 3, hits: 2 },
      { name: '사독장', damage: 7, poison: 3 },
      { name: '똬리 틀기 · 반격 자세', counter: 6 },
    ],
  },
  blackWind: {
    name: '흑풍', title: '흑풍채 쾌도', art: 'unorthodox-sword', tier: 'normal',
    maxHp: 54, evasion: 10,
    pattern: [
      { name: '쾌도 이연참', damage: 5, hits: 2 },
      { name: '바람을 모은다', strength: 1 },
      { name: '질풍참', damage: 17, charge: true, breakAt: 12 },
      { name: '반격 자세', counter: 6 },
    ],
  },
  fallenMonk: {
    name: '혜광', title: '파계승', art: 'orthodox-fist', tier: 'normal',
    maxHp: 54, traits: ['ironBody', 'berserk'],
    pattern: [
      { name: '금강권', damage: 10 },
      { name: '사자후', weak: 2, vulnerable: 1 },
      { name: '나한 연타', damage: 4, hits: 3 },
    ],
  },
  twinBlade: {
    name: '쌍도귀', title: '녹림 칠십이채 행동대장', art: 'unorthodox-sword', tier: 'elite',
    maxHp: 88, traits: ['killer'],
    pattern: [
      { name: '쌍도 난무', damage: 6, hits: 2 },
      { name: '살기 개방', strength: 3 },
      { name: '회전 난도', damage: 4, hits: 4 },
      { name: '귀두참', damage: 24, charge: true, breakAt: 16 },
    ],
  },
  poisonKing: {
    name: '당철', title: '만독수', art: 'unorthodox-assassin', tier: 'elite',
    maxHp: 82, evasion: 15, traits: ['venom', 'feint'],
    pattern: [
      { name: '만독장', damage: 7, poison: 4 },
      { name: '독무', weak: 2, poison: 3 },
      { name: '해독 · 흡독공', heal: 12, strength: 1 },
      { name: '칠보단장', damage: 18, charge: true, breakAt: 14, poison: 5 },
    ],
  },
  nokrimKing: {
    name: '곽패', title: '녹림 총채주 · 산군', art: 'boss-nokrim', tier: 'boss',
    maxHp: 210, traits: ['ironBody'],
    clue: 'leak',
    pattern: [
      { name: '개산부', damage: 13 },
      { name: '산적들아! · 기를 모은다', strength: 3 },
      { name: '횡소천군', damage: 5, hits: 3 },
      { name: '반격 자세', counter: 8 },
    ],
    phase2: {
      at: 0.5,
      title: '분노한 산군',
      text: '곽패가 도끼를 바닥에 내리찍는다 — 산채가 울린다!',
      strength: 2,
      pattern: [
        { name: '도끼를 치켜든다', strength: 2 },
        { name: '파천부', damage: 30, charge: true, breakAt: 22 },
        { name: '짓밟기', damage: 11, weak: 2 },
        { name: '연속 도끼질', damage: 6, hits: 3 },
      ],
    },
  },
});

// ══ 3구역: 마교 침공 저지 (불타는 관문) ══════════════
Object.assign(ENEMIES, {
  bloodCultist: {
    name: '혈교도', title: '마교 혈의당', art: 'demonic-assassin', tier: 'normal',
    maxHp: 56, evasion: 15, traits: ['feint'], patternMode: 'random',
    pattern: [
      { name: '혈인', damage: 7, hits: 2 },
      { name: '은신 · 반격 자세', counter: 8 },
      { name: '혈독침', damage: 6, poison: 4 },
    ],
  },
  demonSword: {
    name: '마검수', title: '마교 검대', art: 'demonic-sword', tier: 'normal',
    maxHp: 72, traits: ['killer'],
    pattern: [
      { name: '마검', damage: 12 },
      { name: '혈기', strength: 3 },
      { name: '혈우', damage: 4, hits: 4 },
    ],
  },
  jiangshi: {
    name: '혈강시', title: '마교의 시체 병기', art: 'demonic-fist', tier: 'normal',
    maxHp: 72, traits: ['ironBody', 'drain'],
    pattern: [
      { name: '강시권', damage: 11 },
      { name: '굳은 몸 · 기를 모은다', strength: 2 },
      { name: '강시 돌진', damage: 22, charge: true, breakAt: 14 },
    ],
  },
  renegade: {
    name: '배교자', title: '마교에 투항한 낭인', art: 'unorthodox-sword', tier: 'normal',
    maxHp: 58, evasion: 10, patternMode: 'random',
    pattern: [
      { name: '배신의 칼', damage: 9, vulnerable: 2 },
      { name: '난도질', damage: 4, hits: 3 },
      { name: '반격 자세', counter: 7 },
      { name: '흙뿌리기', weak: 2, damage: 4 },
    ],
  },
  bloodWolf: {
    name: '혈랑', title: '혈영대 부대주', art: 'demonic-assassin', tier: 'elite',
    maxHp: 95, evasion: 20, traits: ['feint', 'killer'],
    pattern: [
      { name: '혈랑 연참', damage: 5, hits: 3 },
      { name: '반격 자세', counter: 9 },
      { name: '혈랑일섬', damage: 28, charge: true, breakAt: 18 },
      { name: '귀면 위압', damage: 10, weak: 2 },
    ],
  },
  heavenDemon: {
    name: '천마검귀', title: '마교 검각 장로', art: 'demonic-sword', tier: 'elite',
    maxHp: 115, traits: ['drain'],
    pattern: [
      { name: '천마검', damage: 14 },
      { name: '마공 운기', strength: 3 },
      { name: '흡혈검', damage: 8, hits: 2 },
      { name: '혈해검막', damage: 6, hits: 3, vulnerable: 2 },
    ],
  },
  bloodElder: {
    name: '위극', title: '혈마 장로', art: 'demonic-fist', tier: 'boss',
    maxHp: 250, traits: ['drain'],
    clue: 'traitor',
    pattern: [
      { name: '혈마장', damage: 15 },
      { name: '혈해 · 기를 모은다', strength: 3 },
      { name: '혈수 연환', damage: 6, hits: 3, weak: 1 },
      { name: '반격 자세', counter: 10 },
    ],
    phase2: {
      at: 0.5,
      title: '마공 폭주',
      text: '위극의 핏줄이 터질 듯 부풀어 오른다 — 마공이 폭주한다!',
      traits: ['berserk'],
      strength: 3,
      pattern: [
        { name: '혈마 해방', strength: 3 },
        { name: '천마혈수', damage: 34, charge: true, breakAt: 28, vulnerable: 2 },
        { name: '혈우 난타', damage: 6, hits: 4 },
        { name: '피를 마신다', heal: 20, damage: 8 },
      ],
    },
  },
});

// ══ 최종 결전: 그날 밤, 청운객잔 ══════════════
Object.assign(ENEMIES, {
  gwimyeon: {
    name: '귀면', title: '혈영대주', art: 'boss-gwimyeon', tier: 'boss',
    maxHp: 235, evasion: 20, traits: ['feint', 'killer'],
    clue: 'sender',
    pattern: [
      { name: '쌍월참', damage: 8, hits: 2 },
      { name: '반격 자세', counter: 10 },
      { name: '귀영보 · 살기를 모은다', strength: 3 },
      { name: '귀면일섬', damage: 30, charge: true, breakAt: 22 },
    ],
    phase2: {
      at: 0.5,
      title: '가면에 금이 간 혈영대주',
      text: '귀면의 가면에 금이 간다 — "…감히. 이름도 없는 놈이."',
      strength: 3,
      pattern: [
        { name: '혈영난무', damage: 5, hits: 5 },
        { name: '살기 폭발', strength: 4 },
        { name: '귀면멸살', damage: 40, charge: true, breakAt: 30, vulnerable: 2 },
        { name: '혈인', damage: 14, weak: 2 },
      ],
    },
  },
});

// ── 프롤로그 (튜토리얼) ─────────────────
// 지도에는 나오지 않음
Object.assign(ENEMIES, {
  drunkThug: {
    name: '왕삼', title: '술 취한 흑도 주먹패', art: 'unorthodox-fist', tier: 'tutorial',
    maxHp: 22,
    pattern: [
      { name: '주먹질', damage: 4 },
      { name: '딸꾹질', strength: 1 },
      { name: '막무가내 난타', damage: 2, hits: 3 },
    ],
  },
  bloodShadow: {
    name: '혈영대원', title: '귀면 가면의 자객', art: 'demonic-assassin', tier: 'tutorial',
    maxHp: 48, evasion: 10,
    pattern: [
      { name: '혈인참', damage: 6 },
      { name: '살기 개방 · 기를 모은다', strength: 2 },
      { name: '귀면 일섬', damage: 12, charge: true, breakAt: 10 },
      { name: '귀면 위압', damage: 5, weak: 2 },
    ],
  },
});

// ── 테스트 전용 (규칙 확인용 목인장) ─────────────────
Object.assign(ENEMIES, {
  dummy: {
    name: '목인장', title: '수련용 나무 인형', art: 'orthodox-fist', tier: 'test',
    maxHp: 40,
    pattern: [
      { name: '타격', damage: 7 },
      { name: '기 모으기', strength: 2 },
      { name: '강타', damage: 10 },
    ],
  },
  dummyMulti: {
    name: '목인장', title: '연타 인형', art: 'orthodox-fist', tier: 'test',
    maxHp: 40,
    pattern: [{ name: '연타', damage: 4, hits: 2 }],
  },
});


// ══ 사파 루트 ══════════════════════════════
// 1구역: 흑도 패권 다툼 (뒷골목·도박장)
Object.assign(ENEMIES, {
  gangThug: {
    name: '두칠', title: '흑도 칼잡이', art: 'unorthodox-sword', tier: 'normal',
    maxHp: 38,
    pattern: [
      { name: '칼질', damage: 6 },
      { name: '침 뱉기', damage: 3, weak: 1 },
      { name: '막칼', damage: 3, hits: 2 },
    ],
  },
  gambler: {
    name: '손씨', title: '도박장 타짜', art: 'unorthodox-assassin', tier: 'normal',
    maxHp: 32, evasion: 15, traits: ['feint'], patternMode: 'random',
    pattern: [
      { name: '주사위 던지기', damage: 4, hits: 2 },
      { name: '속임수', vulnerable: 2 },
      { name: '숨긴 비수', damage: 9 },
    ],
  },
  axeLord: {
    name: '마삼', title: '도끼파 두목', art: 'unorthodox-fist', tier: 'elite',
    maxHp: 70, traits: ['ironBody', 'berserk'],
    pattern: [
      { name: '도끼 내려찍기', damage: 12 },
      { name: '함성 · 기를 모은다', strength: 2 },
      { name: '휘두르기', damage: 4, hits: 3 },
      { name: '돌진', damage: 18, charge: true, breakAt: 12 },
    ],
  },
  gangLord: {
    name: '조광', title: '흑도 맹주', art: 'boss-gang', tier: 'boss',
    maxHp: 170, traits: ['killer'],
    pattern: [
      { name: '대감도', damage: 11 },
      { name: '부하들아! · 기를 모은다', strength: 2 },
      { name: '연환도', damage: 5, hits: 2, weak: 1 },
      { name: '반격 자세', counter: 6 },
    ],
    phase2: {
      at: 0.5,
      title: '본색을 드러낸 흑도 맹주',
      text: '조광이 곰방대를 내던지고 칼에 독을 바른다 — "이제부터는 진짜 싸움이다!"',
      strength: 2,
      pattern: [
        { name: '독 바른 칼', damage: 7, poison: 3 },
        { name: '담배 연기', weak: 2, strength: 2 },
        { name: '파산도', damage: 22, charge: true, breakAt: 18 },
        { name: '막싸움', damage: 4, hits: 4 },
      ],
    },
  },
});

// 2구역: 녹림 통합 — 녹림 무리는 정파 루트와 같고, 두목은 총채주 자리를 지키는 곽패
ENEMIES.nokrimRival = {
  ...ENEMIES.nokrimKing,
  title: '녹림 총채주 · 자리를 지키는 산군',
  clue: null,
};

// 3구역: 무림맹 지부 습격 — 이번엔 정파 고수들이 적
Object.assign(ENEMIES, {
  allianceGuard: {
    name: '맹 위사', title: '무림맹 지부 수비', art: 'orthodox-fist', tier: 'normal',
    maxHp: 60, traits: ['ironBody'],
    pattern: [
      { name: '철권', damage: 11 },
      { name: '정심결', strength: 2 },
      { name: '연환권', damage: 4, hits: 3 },
    ],
  },
  allianceScout: {
    name: '맹 밀정', title: '무림맹 감찰원', art: 'orthodox-assassin', tier: 'normal',
    maxHp: 52, evasion: 20, traits: ['feint'], patternMode: 'random',
    pattern: [
      { name: '암기 연사', damage: 4, hits: 3 },
      { name: '혈도 찌르기', damage: 5, weak: 2 },
      { name: '급소 일격', damage: 13 },
    ],
  },
  shaolinMonk: {
    name: '각성', title: '무림맹 소속 무승', art: 'orthodox-fist', tier: 'normal',
    maxHp: 66, traits: ['ironBody'],
    pattern: [
      { name: '나한권', damage: 9 },
      { name: '금강불괴 · 운기', heal: 10 },
      { name: '사자후', weak: 2, vulnerable: 1 },
      { name: '백보신권', damage: 20, charge: true, breakAt: 16 },
    ],
  },
  patrolCaptain: {
    name: '한소', title: '무림맹 순찰대장', art: 'orthodox-assassin', tier: 'elite',
    maxHp: 105, evasion: 15, traits: ['killer'],
    pattern: [
      { name: '비도 삼연', damage: 5, hits: 3 },
      { name: '반격 자세', counter: 9 },
      { name: '추혼비', damage: 26, charge: true, breakAt: 18 },
      { name: '포박', damage: 8, weak: 2 },
    ],
  },
  ironInstructor: {
    name: '석무', title: '철권문 교두', art: 'orthodox-fist', tier: 'elite',
    maxHp: 112, traits: ['ironBody', 'berserk'],
    pattern: [
      { name: '철권', damage: 13 },
      { name: '진각 · 기를 모은다', strength: 3 },
      { name: '붕산권', damage: 24, charge: true, breakAt: 16 },
      { name: '연환권', damage: 5, hits: 3 },
    ],
  },
  allianceElder: {
    name: '우문혁', title: '무림맹 장로', art: 'boss-elder', tier: 'boss',
    maxHp: 275, traits: ['ironBody'],
    clue: 'payer',
    pattern: [
      { name: '현무장', damage: 15 },
      { name: '정기 회복', heal: 18 },
      { name: '반격 자세', counter: 10 },
      { name: '타구봉법', damage: 6, hits: 3, weak: 1 },
    ],
    phase2: {
      at: 0.5,
      title: '호신강기를 끌어올린 장로',
      text: '우문혁의 몸에서 금빛 기운이 솟는다 — "사파 잡배 따위가 맹을 넘보느냐!"',
      strength: 3,
      pattern: [
        { name: '기 모으기 · 현무진천', strength: 3 },
        { name: '현무진천', damage: 34, charge: true, breakAt: 26 },
        { name: '금강장', damage: 16, vulnerable: 2 },
        { name: '연환장', damage: 7, hits: 3 },
      ],
    },
  },
});

export const UNORTHODOX_POOLS = [
  {
    easy: ['gangThug', 'ronin'],
    normal: ['gangThug', 'ronin', 'brawler', 'gambler'],
    elite: ['oneEye', 'axeLord'],
    boss: ['gangLord'],
  },
  {
    easy: ['bandit', 'blackWind'],
    normal: ['bandit', 'snakeWoman', 'blackWind', 'fallenMonk'],
    elite: ['twinBlade', 'poisonKing'],
    boss: ['nokrimRival'],
  },
  {
    easy: ['allianceGuard', 'allianceScout'],
    normal: ['allianceGuard', 'allianceScout', 'shaolinMonk'],
    elite: ['patrolCaptain', 'ironInstructor'],
    boss: ['allianceElder'],
  },
];


// ══ 마교 루트 ══════════════════════════════
// 1구역: 서열 혈투 (마교 총단 비무장)
Object.assign(ENEMIES, {
  cultNovice: {
    name: '혈수', title: '마교 수련생', art: 'demonic-fist', tier: 'normal',
    maxHp: 36,
    pattern: [
      { name: '혈권', damage: 6 },
      { name: '혈기 끌어올리기', strength: 1 },
      { name: '난타', damage: 3, hits: 2 },
    ],
  },
  cultSword: {
    name: '적검', title: '마검 견습생', art: 'demonic-sword', tier: 'normal',
    maxHp: 38,
    pattern: [
      { name: '마검', damage: 7 },
      { name: '혈기', strength: 1 },
      { name: '혈우', damage: 3, hits: 2 },
    ],
  },
  cultShadow: {
    name: '흑영', title: '혈교도 견습생', art: 'demonic-assassin', tier: 'normal',
    maxHp: 34, evasion: 10, traits: ['feint'], patternMode: 'random',
    pattern: [
      { name: '혈인', damage: 4, hits: 2 },
      { name: '은신 · 반격 자세', counter: 4 },
      { name: '혈독침', damage: 4, poison: 2 },
    ],
  },
  twinFang: {
    name: '쌍아', title: '혈영대 견습 살수', art: 'demonic-assassin', tier: 'elite',
    maxHp: 62, evasion: 20, traits: ['feint', 'venom'],
    pattern: [
      { name: '쌍아 찌르기', damage: 4, hits: 2 },
      { name: '그림자 숨기', strength: 2 },
      { name: '반격 자세', counter: 6 },
      { name: '혈독침', damage: 8, poison: 3 },
    ],
  },
  redLash: {
    name: '적편', title: '마교 검각 제자', art: 'demonic-sword', tier: 'elite',
    maxHp: 66, traits: ['drain'],
    pattern: [
      { name: '혈편검', damage: 7, hits: 2 },
      { name: '마공 운기', strength: 2 },
      { name: '흡혈검', damage: 11 },
      { name: '천마일섬', damage: 18, charge: true, breakAt: 13 },
    ],
  },
  rivalProdigy: {
    name: '연화', title: '마교 서열 1위', art: 'boss-rival', tier: 'boss',
    maxHp: 135, evasion: 10, traits: ['killer'],
    pattern: [
      { name: '혈월참', damage: 6, hits: 2 },
      { name: '반격 자세', counter: 7 },
      { name: '혈기 개방', strength: 2 },
      { name: '적혈검', damage: 12, vulnerable: 1 },
    ],
    phase2: {
      at: 0.5,
      title: '서열 1위의 진심',
      text: '연화의 칼끝에서 붉은 기운이 흘러넘친다 — "재미있네. 이제야 칼을 뽑을 맛이 나."',
      traits: ['drain'],
      strength: 1,
      pattern: [
        { name: '혈화난무', damage: 4, hits: 4 },
        { name: '피의 서약', strength: 3 },
        { name: '천마혈화', damage: 26, charge: true, breakAt: 20 },
        { name: '적혈검', damage: 12, vulnerable: 2 },
      ],
    },
  },
});

// 2구역: 중원 진출 — 정파 문파와 사파 세력을 함께 상대, 두목은 중원 흑도를 지키는 조광
ENEMIES.gangLordD = { ...ENEMIES.gangLord, title: '중원 흑도의 주인', maxHp: 210 };

// 3구역: 정마 결전 — 무림맹 정예와 혈영대 안의 반대파, 두목은 무림맹 장로
ENEMIES.bloodWolfD = { ...ENEMIES.bloodWolf, title: '혈영대 부대주 · 교주를 거스르는 자' };
ENEMIES.allianceElderD = { ...ENEMIES.allianceElder, clue: null, title: '무림맹 장로 · 정마 결전의 선봉', maxHp: 245 };

export const DEMONIC_POOLS = [
  {
    easy: ['cultNovice', 'cultSword'],
    normal: ['cultNovice', 'cultSword', 'cultShadow', 'gangThug'],
    elite: ['twinFang', 'redLash'],
    boss: ['rivalProdigy'],
  },
  {
    easy: ['bandit', 'blackWind'],
    normal: ['bandit', 'snakeWoman', 'blackWind', 'fallenMonk'],
    elite: ['twinBlade', 'poisonKing'],
    boss: ['gangLordD'],
  },
  {
    easy: ['allianceGuard', 'allianceScout'],
    normal: ['allianceGuard', 'allianceScout', 'shaolinMonk', 'renegade'],
    elite: ['bloodWolfD', 'ironInstructor'],
    boss: ['allianceElderD'],
  },
];


// ══ 진엔딩: 귀면 뒤에 숨어 있던 자 ══════════════
ENEMIES.baekri = {
  name: '백리현', title: '무림맹 부맹주 · 청명검', art: 'boss-baekri', tier: 'boss',
  maxHp: 220, evasion: 15, traits: ['feint'],
  clue: 'traitorName',
  pattern: [
    { name: '청명검 · 일검', damage: 12 },
    { name: '반격 자세', counter: 10 },
    { name: '청명검 · 운류', damage: 5, hits: 3, weak: 1 },
    { name: '정심결', strength: 3 },
  ],
  phase2: {
    at: 0.5,
    title: '위선을 벗은 부맹주',
    text: '백리현의 미소가 사라진다 — "백 일 전부터 짜 둔 판이다. 이름 없는 떠돌이 따위가!"',
    traits: ['drain', 'killer'],
    strength: 3,
    pattern: [
      { name: '백학참', damage: 7, hits: 3 },
      { name: '청명 일섬 · 기를 모은다', strength: 2 },
      { name: '천지청명', damage: 38, charge: true, breakAt: 30, vulnerable: 2 },
      { name: '흡정검', damage: 14 },
    ],
  },
};
export const TRUE_BOSS = 'baekri';

for (const [id, e] of Object.entries(ENEMIES)) e.id = id;

export const ENEMY_IDS = Object.keys(ENEMIES);

// 지도에서 쓰는 적 목록 (구역별, 층이 낮을 때는 쉬운 상대만)
export const ZONE_POOLS = [
  {
    easy: ['ironFist', 'ronin'],
    normal: ['ironFist', 'ronin', 'brawler', 'inspector'],
    elite: ['oneEye', 'masked'],
    boss: ['spy'],
  },
  {
    easy: ['bandit', 'blackWind'],
    normal: ['bandit', 'snakeWoman', 'blackWind', 'fallenMonk'],
    elite: ['twinBlade', 'poisonKing'],
    boss: ['nokrimKing'],
  },
  {
    easy: ['demonSword', 'renegade'],
    normal: ['bloodCultist', 'demonSword', 'jiangshi', 'renegade'],
    elite: ['bloodWolf', 'heavenDemon'],
    boss: ['bloodElder'],
  },
];
export const POOLS = ZONE_POOLS[0];
export const FINAL_BOSS = 'gwimyeon';
