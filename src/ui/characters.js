// 캐릭터 디자인 데이터 (세력 × 계열)
// 그림
//  - 전투용 전신: assets/characters/<세력>-<계열>.webp (초록 배경 그림을 tools/prepare_sprite.py 로 처리)
//    → 아래 SPRITES 에 발 위치(footX)와 함께 등록. 없으면 전투에서 실루엣으로 대신 나옴
//  - 도감용 상반신: assets/portraits/<세력>-<계열>.webp (스타일 참고 샘플에서 잘라냄)
// 정파: 백색·청색 / 마교: 흑색·적색 / 사파: 갈색·암녹색·무채색

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

const NOTES = {
  'orthodox-sword': '깔끔하게 올린 상투(도관), 잡티 없는 피부, 좌우 대칭이 반듯한 이목구비',
  'orthodox-fist': '굵은 눈썹, 다부진 턱선, 이마를 드러낸 머리띠(말액)',
  'orthodox-assassin': '푸른 복면·두건으로 하관을 가리고 차분한 눈빛만 강조한 정파 밀정',
  'demonic-sword': '창백한 안색, 치켜올라간 삼백안, 붉은 눈빛',
  'demonic-fist': '핏줄 선 거친 피부, 산발, 붉은 문신, 광기 어린 표정',
  'demonic-assassin': '뿔 달린 귀면 가면, 붉은 눈, 검은 두건',
  'unorthodox-sword': '흐트러진 잔머리, 거친 수염 자국, 챙 넓은 삿갓',
  'unorthodox-fist': '뭉툭한 코, 굵은 주름, 붕대 감은 주먹',
  'unorthodox-assassin': '한쪽 눈 안대, 낡은 천 복면, 경계하는 눈빛',
};

// 전신 그림 등록 (prepare_sprite.py 가 출력한 footX 값)
const SPRITES = {
  'orthodox-sword': { image: 'assets/characters/orthodox-sword.webp', footX: 0.4073 },
  'orthodox-fist': { image: 'assets/characters/orthodox-fist.webp', footX: 0.5286 },
  'orthodox-assassin': { image: 'assets/characters/orthodox-assassin.webp', footX: 0.5028 },
  'demonic-sword': { image: 'assets/characters/demonic-sword.webp', footX: 0.4371 },
  'demonic-assassin': { image: 'assets/characters/demonic-assassin.webp', footX: 0.5465 },
  'unorthodox-sword': { image: 'assets/characters/unorthodox-sword.webp', footX: 0.5138 },
  'unorthodox-fist': { image: 'assets/characters/unorthodox-fist.webp', footX: 0.4995 },
  'unorthodox-assassin': { image: 'assets/characters/unorthodox-assassin.webp', footX: 0.5143 },
  'demonic-fist': { image: 'assets/characters/demonic-fist.webp', footX: 0.5332 },
};

// 공격 이펙트 색 (검기/권경/암기)
const FX_COLOR = { orthodox: '#9cc4ff', demonic: '#ff5a5a', unorthodox: '#e8c27a' };

export const DESIGNS = {};
for (const [fid, f] of Object.entries(FACTIONS)) {
  for (const [cid, c] of Object.entries(CLASSES)) {
    const key = `${fid}-${cid}`;
    DESIGNS[key] = {
      key,
      faction: fid,
      cls: cid,
      title: `${f.name} ${c.name}`,
      note: NOTES[key],
      portrait: `assets/portraits/${key}.webp`,
      sprite: SPRITES[key] ?? null,
      factionColor: f.color,
      fxColor: FX_COLOR[fid],
    };
  }
}

export const DESIGN_IDS = Object.keys(DESIGNS);

// ── 이야기 인물 (세력·계열 밖) ─────────────────────────
// 그림 원본: docs/reference/npc-*-raw.webp → tools/prepare_sprite.py <원본> npc-<id>
const NPCS = {
  'boss-nokrim': {
    title: '녹림 총채주 곽패', note: '2구역 두목. 개산부를 휘두르는 산군',
    cls: 'fist', color: '#8e7050', sprite: { image: 'assets/characters/boss-nokrim.webp', footX: 0.4055 },
  },
  'boss-gwimyeon': {
    title: '혈영대주 귀면', note: '그날 밤 나를 벤 자. 뿔 달린 귀면 가면과 쌍도',
    cls: 'assassin', color: '#c22a36', sprite: { image: 'assets/characters/boss-gwimyeon.webp', footX: 0.469 },
  },
  'npc-juno': {
    title: '주노(酒老)', note: '늘 취해 있는 노고수. 회차가 바뀌어도 나를 알아보는 듯하다',
    cls: 'fist', color: '#a08a6a', sprite: { image: 'assets/characters/npc-juno.webp', footX: 0.5025 },
  },
  'npc-sooha': {
    title: '진소하', note: '무림맹 밀사. 나와 똑같이 흰 옷에 검을 찼다',
    cls: 'sword', color: '#3e7cc8', sprite: { image: 'assets/characters/npc-sooha.webp', footX: 0.5111 },
  },
};
for (const [key, n] of Object.entries(NPCS)) {
  DESIGNS[key] = {
    key, faction: 'npc', cls: n.cls, title: n.title, note: n.note,
    portrait: n.sprite.image, sprite: n.sprite, factionColor: n.color, fxColor: '#e8dcc0',
  };
}
export const NPC_IDS = Object.keys(NPCS);
