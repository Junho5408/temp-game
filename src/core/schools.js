// 8단계 류파(流派): 세력 × 계열마다 기본 무공 + 류파 3개
// 무공의 school 이 류파 id (없으면 기본 무공). 판에서 이미 가진 류파의 무공이 보상·객잔에 더 자주 나옴 (run.js)
// 이름은 무협에서 흔히 쓰는 문파 이름에서 따온 오리지널 해석
export const CLASS_IDS = ['sword', 'fist', 'assassin'];
export const CLASS_NAMES = { sword: '검객', fist: '권사', assassin: '살수' };

export const SCHOOLS = {
  'orthodox-sword': [
    { id: 'hwasan', name: '화산', desc: '매화처럼 흩날리는 검 — 기세를 쌓아 여러 번 벤다' },
    { id: 'mudang', name: '무당', desc: '부드러움으로 굳셈을 이긴다 — 피하고 받아쳐 잡는다' },
    { id: 'namgung', name: '남궁', desc: '제왕의 검 — 앞서 쓴 무공만큼 강해지는 마무리 한 방' },
  ],
  'orthodox-fist': [
    { id: 'sorim', name: '소림', desc: '금강불괴 — 막고 버틴 뒤 그만큼 되돌려 준다' },
    { id: 'gaebang', name: '개방', desc: '항룡의 장풍 — 내공을 모아 크게 한 방' },
    { id: 'palgwae', name: '팔괘', desc: '혈도를 짚어 굳힌다 — 점혈·흐트러짐' },
  ],
  'orthodox-assassin': [
    { id: 'danga', name: '당가', desc: '사천의 암기 세가 — 비수와 독' },
    { id: 'jeomchang', name: '점창', desc: '번개 같은 쾌검 — 가벼운 초식을 잇달아' },
    { id: 'biyeong', name: '비영', desc: '그림자처럼 — 피하고 빈틈을 찌른다' },
  ],
  'unorthodox-sword': [
    { id: 'heukdo', name: '흑도', desc: '비열한 칼 — 약해진 적에게 두 배' },
    { id: 'nokrim', name: '녹림', desc: '산적의 큰 칼 — 빼앗고 내리찍는다' },
    { id: 'nangin', name: '낭인', desc: '떠돌이 발도술 — 첫 칼에 치명' },
  ],
  'unorthodox-fist': [
    { id: 'cheolsa', name: '철사장', desc: '독 모래로 단련한 손 — 독을 쌓는다' },
    { id: 'heukho', name: '흑호권', desc: '거리의 주먹 — 흐트러뜨리고 몰아친다' },
    { id: 'jeonjang', name: '전장권', desc: '돈이 곧 힘 — 은자가 많을수록 세다' },
  ],
  'unorthodox-assassin': [
    { id: 'haomun', name: '하오문', desc: '뒷골목 암기 — 던지고 또 던진다' },
    { id: 'dokmun', name: '독문', desc: '독을 쌓아 한꺼번에 터뜨린다' },
    { id: 'hamjeong', name: '함정꾼', desc: '미리 깔아 둔 덫으로 잡는다' },
  ],
  'demonic-sword': [
    { id: 'cheonma', name: '천마검', desc: '마기를 모아 한꺼번에 쏟는다' },
    { id: 'hyeolgeom', name: '혈검', desc: '피를 마시는 검 — 흡혈' },
    { id: 'magum', name: '마검', desc: '입마를 태워 힘으로 — 위험한 마공' },
  ],
  'demonic-fist': [
    { id: 'hyeolsu', name: '혈수', desc: '피를 대가로 몰아치는 손 — 체력 대가·혈계' },
    { id: 'maryeong', name: '마령장', desc: '쌓인 마기가 늘 힘이 된다' },
    { id: 'hyeoltu', name: '혈투권', desc: '죽기 직전에 가장 세다 — 혈투' },
  ],
  'demonic-assassin': [
    { id: 'hyeolyeong', name: '혈영대', desc: '피 냄새를 쫓는 자객 — 혈투·치명' },
    { id: 'dokhyeol', name: '독혈', desc: '독과 흡혈 — 서서히 말린다' },
    { id: 'geurimja', name: '그림자 마공', desc: '입마를 연료로 쓰는 그림자 술' },
  ],
};

export function schoolsOf(faction, cls) {
  return SCHOOLS[`${faction}-${cls}`] ?? [];
}

export function schoolName(faction, cls, id) {
  return schoolsOf(faction, cls).find((x) => x.id === id)?.name ?? null;
}
