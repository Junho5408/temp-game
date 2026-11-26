// 적 정의 (1구역: 후기지수 비무대회)
// pattern 은 순서대로 반복되는 행동 목록. 다음 행동은 전투 화면에서 미리 예고됨.
// 행동 필드: name, damage, hits, strength(자신 기세 +), weak/vulnerable(플레이어에게 n턴)
// 방어 개념은 없음. 공격 없이 기를 모으는 턴이 숨 돌릴 틈이 됨.
// tier: normal(일반) / elite(고수) / boss(두목)
// art 는 src/ui/characters.js 의 디자인 키 (세력-계열)
// 지도에서 위층으로 갈수록 체력과 기세가 붙어서 나옴 (run.js 의 scaleForRow)
export const ENEMIES = {
  // ── 일반 ─────────────────
  ironFist: {
    name: '곽진', title: '철권문 후기지수', art: 'orthodox-fist', tier: 'normal',
    maxHp: 40,
    pattern: [
      { name: '철권 내려치기', damage: 7 },
      { name: '기 모으기', strength: 2 },
      { name: '붕산권', damage: 10 },
    ],
  },
  ronin: {
    name: '마철', title: '비무대에 끼어든 낭인', art: 'unorthodox-sword', tier: 'normal',
    maxHp: 36,
    pattern: [
      { name: '쾌검 이연격', damage: 4, hits: 2 },
      { name: '흘려베기', damage: 5, weak: 1 },
      { name: '난도질', damage: 3, hits: 3 },
    ],
  },
  brawler: {
    name: '왕삼', title: '흑도 주먹패', art: 'unorthodox-fist', tier: 'normal',
    maxHp: 46,
    pattern: [
      { name: '주먹 자랑', strength: 2 },
      { name: '박치기', damage: 8 },
      { name: '난타', damage: 3, hits: 3 },
    ],
  },
  inspector: {
    name: '소영', title: '대회 감찰 밀정', art: 'orthodox-assassin', tier: 'normal',
    maxHp: 34,
    pattern: [
      { name: '암침', damage: 5, weak: 2 },
      { name: '급소 노리기', vulnerable: 2 },
      { name: '급소 찌르기', damage: 9 },
    ],
  },

  // ── 고수 ─────────────────
  oneEye: {
    name: '독안귀', title: '외눈 살수', art: 'unorthodox-assassin', tier: 'elite',
    maxHp: 66,
    pattern: [
      { name: '독비도', damage: 4, hits: 3, vulnerable: 2 },
      { name: '그림자 숨기', strength: 2 },
      { name: '목 베기', damage: 15 },
    ],
  },
  masked: {
    name: '무명', title: '정체불명의 복면객', art: 'demonic-assassin', tier: 'elite',
    maxHp: 64,
    pattern: [
      { name: '혈기 개방', strength: 2 },
      { name: '혈인쌍참', damage: 6, hits: 2 },
      { name: '귀면 위압', damage: 9, weak: 2 },
      { name: '혈인쌍참', damage: 6, hits: 2 },
    ],
  },

  // ── 두목 ─────────────────
  spy: {
    name: '연무혁', title: '우승 후보 · 정체는 마교 첩자', art: 'demonic-sword', tier: 'boss',
    maxHp: 150,
    pattern: [
      { name: '혈마심법', strength: 2 },
      { name: '혈영참', damage: 12 },
      { name: '혈우검', damage: 4, hits: 4 },
      { name: '천마일섬', damage: 20, vulnerable: 2 },
    ],
  },
};

for (const [id, e] of Object.entries(ENEMIES)) e.id = id;

export const ENEMY_IDS = Object.keys(ENEMIES);

// 지도에서 쓰는 적 목록 (층이 낮을 때는 쉬운 상대만)
export const POOLS = {
  easy: ['ironFist', 'ronin'],
  normal: ['ironFist', 'ronin', 'brawler', 'inspector'],
  elite: ['oneEye', 'masked'],
  boss: ['spy'],
};
