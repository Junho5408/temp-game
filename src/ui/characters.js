// 캐릭터 디자인 데이터 (세력 × 계열)
// 정파: 백색·청색 / 마교: 흑색·적색 / 사파: 갈색·암녹색·무채색
//
// 필드 설명
//  skin/hair/robe 등 배열: [기본, 그림자, 더 어두운 그림자 또는 밝은 면]
//  hairStyle: topknotCrown(상투+도관) headband(말액) hood(두건) hoodPattern(문양 두건)
//             longLoose(긴 생머리) wild(산발) hat(삿갓) cropped(짧은 머리) raggedBand(낡은 천 두건)
//  eyes: calm(차분) stern(굵고 단호) sanpaek(삼백안) crazed(광기) thin(가는 눈매)
//        messy(반쯤 내리깐 눈) heavy(무거운 눈두덩) wary(흘겨봄)
//  mouth: neutral firm grin dark sneer none
//  extras: 얼굴/몸 장식 목록
//  outfit: robe(긴 도포) tunic(짧은 무복 + 넓은 바지 + 각반) tight(짧고 몸에 붙는 옷)

export const FACTIONS = {
  orthodox: { name: '정파', color: '#3e7cc8' },
  demonic: { name: '마교', color: '#c22a36' },
  unorthodox: { name: '사파', color: '#8e7050' },
};

export const CLASSES = {
  sword: { name: '검객' },
  fist: { name: '권사' },
  assassin: { name: '살수' },
};

// 세력별 공통 색
const ORTHODOX = {
  robe: ['#e4e6ea', '#b4bac8', '#848ca0', '#f8f9fb'],
  inner: '#2c4f8a',
  belt: ['#2c4f8a', '#1c355e'],
  accent: ['#3e7cc8', '#24508a'],
  pants: ['#3a4258', '#2a3044'],
  boot: '#1a1820',
  skin: ['#ecc8a4', '#c99c7a', '#a07458'],
  hair: ['#1a1620', '#0f0c14', '#3a3448'],
};

const DEMONIC = {
  robe: ['#2e2830', '#1e1a20', '#141016', '#4a3e48'],
  inner: '#a3242c',
  belt: ['#5a1418', '#3a0c10'],
  accent: ['#c22a36', '#8a1c24'],
  pants: ['#1e1a20', '#141016'],
  boot: '#0e0a10',
  skin: ['#ecdcd2', '#c4aea4', '#9a8278'], // 창백한 안색
  hair: ['#141016', '#0a080c', '#3a2e3a'],
};

const UNORTHODOX = {
  robe: ['#6e5438', '#523e28', '#3a2c1c', '#8e7050'],
  inner: '#3e4a36',
  belt: ['#3e4a36', '#2a3224'],
  accent: ['#5a6a4a', '#3e4a36'],
  pants: ['#4a4a44', '#34342e'],
  boot: '#1e1a14',
  skin: ['#d6a880', '#ad7e5c', '#865a40'], // 볕에 그을린 피부
  hair: ['#2a221c', '#1a1410', '#4a3e34'],
};

export const DESIGNS = {
  // ── 정파 ─────────────────────────
  'orthodox-sword': {
    ...ORTHODOX, faction: 'orthodox', cls: 'sword',
    title: '정파 검객', note: '깔끔하게 올린 상투(도관), 잡티 없는 피부, 반듯한 이목구비',
    outfit: 'robe', hairStyle: 'topknotCrown', eyes: 'calm', mouth: 'neutral',
    iris: '#2a3048', irisHi: '#5a6a8a', extras: [],
  },
  'orthodox-fist': {
    ...ORTHODOX, faction: 'orthodox', cls: 'fist',
    title: '정파 권사', note: '굵은 눈썹, 다부진 턱선, 이마를 드러낸 말액',
    outfit: 'tunic', hairStyle: 'headband', eyes: 'stern', mouth: 'firm',
    wrap: '#e8e2d4', wrapS: '#b8b0a0', extras: ['strong_jaw'],
  },
  'orthodox-assassin': {
    ...ORTHODOX, faction: 'orthodox', cls: 'assassin',
    title: '정파 살수', note: '푸른 회색 두건과 복면으로 하관을 가리고 차분한 눈빛만 드러냄',
    robe: ['#4a5468', '#343c4c', '#262c38', '#66728a'],
    pants: ['#2e3544', '#222834'],
    hood: ['#3e4c66', '#2a3448', '#56688a'],
    outfit: 'tight', hairStyle: 'hood', eyes: 'calm', mouth: 'none',
    iris: '#3a6aa8', irisHi: '#8ab0e0', extras: ['mask'],
  },

  // ── 마교 ─────────────────────────
  'demonic-sword': {
    ...DEMONIC, faction: 'demonic', cls: 'sword',
    title: '마교 검객', note: '창백한 안색, 치켜올라간 삼백안, 붉은 눈화장과 이마의 교단 문양',
    outfit: 'robe', hairStyle: 'longLoose', eyes: 'sanpaek', mouth: 'neutral',
    iris: '#8a1c24', guard: '#5a1418', extras: ['red_liner', 'forehead_mark'],
  },
  'demonic-fist': {
    ...DEMONIC, faction: 'demonic', cls: 'fist',
    title: '마교 권사', note: '핏줄 선 거친 피부, 산발, 붉은 문신, 광기 어린 표정',
    skin: ['#d4a088', '#a8745e', '#7e5040'],
    hair: ['#2a1a1a', '#160e0e', '#4a3030'],
    outfit: 'tunic', hairStyle: 'wild', eyes: 'crazed', mouth: 'grin',
    iris: '#c22a36', wrap: '#6a1a20', wrapS: '#3a0c10',
    extras: ['veins', 'tattoo', 'rough_skin', 'strong_jaw'],
  },
  'demonic-assassin': {
    ...DEMONIC, faction: 'demonic', cls: 'assassin',
    title: '마교 살수', note: '가느다란 눈매, 어두운 입술, 붉은 문양이 새겨진 검은 두건',
    hood: ['#1e1a20', '#121014', '#342e36'],
    outfit: 'tight', hairStyle: 'hoodPattern', eyes: 'thin', mouth: 'dark',
    iris: '#c22a36', extras: [],
  },

  // ── 사파 ─────────────────────────
  'unorthodox-sword': {
    ...UNORTHODOX, faction: 'unorthodox', cls: 'sword',
    title: '사파 검객', note: '흐트러진 잔머리, 거친 수염 자국, 뺨의 칼자국, 챙 넓은 삿갓',
    robe: ['#4e5a46', '#3a4434', '#2a3224', '#6a7860'],
    inner: '#6e5438',
    hat: ['#b89a64', '#8e7448', '#6a5434'],
    outfit: 'robe', hairStyle: 'hat', eyes: 'messy', mouth: 'sneer',
    iris: '#3a2a1e', guard: '#6a5434', extras: ['stubble', 'scar_cheek'],
  },
  'unorthodox-fist': {
    ...UNORTHODOX, faction: 'unorthodox', cls: 'fist',
    title: '사파 권사', note: '뭉툭한 코, 굵은 주름, 부러진 코뼈를 감은 붕대',
    hair: ['#3a3028', '#2a221c', '#5a4a3c'],
    outfit: 'tunic', hairStyle: 'cropped', eyes: 'heavy', mouth: 'firm',
    wrap: '#cfc4ae', wrapS: '#a09680',
    extras: ['blunt_nose', 'wrinkles', 'nose_bandage', 'strong_jaw'],
  },
  'unorthodox-assassin': {
    ...UNORTHODOX, faction: 'unorthodox', cls: 'assassin',
    title: '사파 살수', note: '비대칭 흉터, 한쪽 눈을 가린 안대, 낡은 천 복면, 경계하는 눈빛',
    robe: ['#52504a', '#3a3834', '#282624', '#6e6a62'],
    accent: ['#6a5a46', '#4a3e30', '#7e6c56'],
    rag: ['#7a7c70', '#585a50'], // 빛바랜 회색 천 복면
    outfit: 'tight', hairStyle: 'raggedBand', eyes: 'wary', mouth: 'none',
    iris: '#4a3a2a', extras: ['eyepatch', 'scar_asym', 'rag_mask'],
  },
};

export const DESIGN_IDS = Object.keys(DESIGNS);
