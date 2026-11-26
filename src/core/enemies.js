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

for (const [id, e] of Object.entries(ENEMIES)) e.id = id;

export const ENEMY_IDS = Object.keys(ENEMIES);

// 지도에서 쓰는 적 목록 (층이 낮을 때는 쉬운 상대만)
export const POOLS = {
  easy: ['ironFist', 'ronin'],
  normal: ['ironFist', 'ronin', 'brawler', 'inspector'],
  elite: ['oneEye', 'masked'],
  boss: ['spy'],
};
