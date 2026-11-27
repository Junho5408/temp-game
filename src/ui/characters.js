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

// 주인공 한 사람(회귀자)을 세력 × 계열로 — 같은 얼굴, 흰 옷 + 세력 색 (8단계, docs/art/prompts-hero.md)
const NOTES = {
  'orthodox-sword': '깔끔하게 올린 상투(도관), 잡티 없는 피부, 좌우 대칭이 반듯한 이목구비',
  'orthodox-fist': '같은 얼굴(주인공) · 흰 도포에 푸른 깃·띠, 은빛 팔목 보호대, 장법 자세',
  'orthodox-assassin': '같은 얼굴(주인공) · 푸른 복면을 목에 내리고 단검 두 자루, 허리에 은침',
  'demonic-sword': '같은 얼굴(주인공) · 흰 도포에 붉은 깃·검은 띠, 검붉은 기운이 서린 검',
  'demonic-fist': '같은 얼굴(주인공) · 붉은 천을 감은 팔에 검은 쇠 권갑, 주먹에 검붉은 기운',
  'demonic-assassin': '같은 얼굴(주인공) · 검붉은 복면을 목에 내리고 검은 단검 두 자루',
  'unorthodox-sword': '같은 얼굴(주인공) · 낡은 흰 도포에 황토 깃, 외날 도 (임시: 얼굴 시트의 서 있는 그림)',
  'unorthodox-fist': '같은 얼굴(주인공) · 소매를 뜯은 흰 옷, 붕대 감은 주먹, 새끼줄 띠',
  'unorthodox-assassin': '같은 얼굴(주인공) · 갈색 복면을 목에 내리고 가슴에 비도 띠, 곡단검 두 자루',
};

// 전신 그림 등록 (prepare_sprite.py 가 출력한 footX 값)
const SPRITES = {
  'orthodox-sword': { image: 'assets/characters/orthodox-sword.webp', footX: 0.4073 },
  'orthodox-fist': { image: 'assets/characters/orthodox-fist.webp', footX: 0.4856 },
  'orthodox-assassin': { image: 'assets/characters/orthodox-assassin.webp', footX: 0.508 },
  'demonic-sword': { image: 'assets/characters/demonic-sword.webp', footX: 0.6196 },
  'demonic-assassin': { image: 'assets/characters/demonic-assassin.webp', footX: 0.5228 },
  'unorthodox-sword': { image: 'assets/characters/unorthodox-sword.webp', footX: 0.6678 },
  'unorthodox-fist': { image: 'assets/characters/unorthodox-fist.webp', footX: 0.4995 },
  'unorthodox-assassin': { image: 'assets/characters/unorthodox-assassin.webp', footX: 0.4988 },
  'demonic-fist': { image: 'assets/characters/demonic-fist.webp', footX: 0.4562 },
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
  // sprite: null 이면 그림 대기 중 (전투는 실루엣, 대사는 한자 인장)
  'boss-gang': {
    title: '흑도 맹주 조광', note: '사파 1구역 두목. 곰방대와 대감도, 금니', cls: 'sword', color: '#8e7050',
    sprite: { image: 'assets/characters/boss-gang.webp', footX: 0.4409 },
  },
  'boss-elder': {
    title: '무림맹 장로 우문혁', note: '사파·마교 3구역 두목. 쇠지팡이와 호신강기', cls: 'fist', color: '#3e7cc8',
    sprite: { image: 'assets/characters/boss-elder.webp', footX: 0.4883 },
  },
  'boss-baekri': {
    title: '무림맹 부맹주 백리현', note: '진엔딩 최종 두목. 청명검이라 불리는 존경받는 고수, 흰 학 문양', cls: 'sword', color: '#d8dde4',
    sprite: { image: 'assets/characters/boss-baekri.webp', footX: 0.6488 },
  },
  'boss-rival': {
    title: '마교 서열 1위 연화', note: '마교 1구역 두목. 붉은 곡도를 쓰는 젊은 천재', cls: 'sword', color: '#c22a36',
    sprite: { image: 'assets/characters/boss-rival.webp', footX: 0.5391 },
  },
  'npc-boki': {
    title: '청운객잔 점소이 복이', note: '겁 많고 수다스러운 점소이. "손님, 국수 한 그릇 더 하실래요?"', cls: 'fist', color: '#c8a878',
    sprite: { image: 'assets/characters/npc-boki.webp', footX: 0.4033 },
  },
  'npc-clerk': {
    title: '무림맹 서기', note: '비무대회 접수를 맡은 지친 관리', cls: 'sword', color: '#d8dde4',
    sprite: { image: 'assets/characters/npc-clerk.webp', footX: 0.4196 },
  },
  'npc-officer': {
    title: '녹림 토벌대장', note: '정파 2구역 토벌대를 이끄는 맹의 장수', cls: 'sword', color: '#6f8fb8',
    sprite: { image: 'assets/characters/npc-officer.webp', footX: 0.6066 },
  },
  'npc-gangbro': {
    title: '흑도 졸개', note: '이쑤시개를 문 뒷골목 졸개', cls: 'fist', color: '#8e7050',
    sprite: { image: 'assets/characters/npc-gangbro.webp', footX: 0.535 },
  },
  'npc-cult-elder': {
    title: '혈공 장로', note: '마교 총단 지하에서 피의 단지를 젓는 노인', cls: 'fist', color: '#a83040',
    sprite: { image: 'assets/characters/npc-cult-elder.webp', footX: 0.5104 },
  },
  'npc-cult-herald': {
    title: '마교 집사', note: '서열전을 진행하는 냉정한 집사', cls: 'sword', color: '#5a2030',
    sprite: { image: 'assets/characters/npc-cult-herald.webp', footX: 0.3659 },
  },
  'boss-spy': {
    title: '비무대회 우승 후보 연무혁', note: '정파 1구역 두목. 우승 후보로 위장한 마교 첩자, 검과 철선', cls: 'sword', color: '#9aa0b8',
    sprite: { image: 'assets/characters/boss-spy.webp', footX: 0.4233 },
  },
  'boss-blood-elder': {
    title: '혈마 장로 위극', note: '정파 3구역 두목. 팔꿈치까지 핏빛으로 물든 장법', cls: 'fist', color: '#7a1a28',
    sprite: { image: 'assets/characters/boss-blood-elder.webp', footX: 0.4519 },
  },
  'elite-masked': {
    title: '정체불명의 복면객 무명', note: '정파 1구역 고수. 그날 밤 자객들과 같은 귀면 가면', cls: 'assassin', color: '#b83040',
    sprite: { image: 'assets/characters/elite-masked.webp', footX: 0.5301, face: { x: 0.56, y: 0.12 } },
  },
  'elite-one-eye': {
    title: '외눈 살수 독안귀', note: '꿰맨 흉터 눈, 독 바른 비도', cls: 'assassin', color: '#6a5a48',
    sprite: { image: 'assets/characters/elite-one-eye.webp', footX: 0.4381, face: { x: 0.46, y: 0.1 } },
  },
  'elite-axe-lord': {
    title: '도끼파 두목 마삼', note: '사파 1구역 고수. 배불뚝이, 손도끼 두 자루', cls: 'fist', color: '#a0603a',
    sprite: { image: 'assets/characters/elite-axe-lord.webp', footX: 0.4386 },
  },
  'elite-heaven-demon': {
    title: '마교 검각 장로 천마검귀', note: '정파 3구역 고수. 은발 노검객, 붉은 기운의 검은 검', cls: 'sword', color: '#8a1a2a',
    sprite: { image: 'assets/characters/elite-heaven-demon.webp', footX: 0.2748 },
  },
  'elite-blood-wolf': {
    title: '혈영대 부대주 혈랑', note: '3구역 고수. 늑대 털 깃, 귀면 가면을 허리에 참', cls: 'assassin', color: '#7a2a30',
    sprite: { image: 'assets/characters/elite-blood-wolf.webp', footX: 0.4823, face: { x: 0.64, y: 0.1 } },
  },
  'elite-poison-king': {
    title: '만독수 당철', note: '2구역 고수. 보라색으로 물든 독 손, 약병 주머니', cls: 'fist', color: '#7a5aa0',
    sprite: { image: 'assets/characters/elite-poison-king.webp', footX: 0.4108 },
  },
  'elite-twin-blade': {
    title: '녹림 행동대장 쌍도귀', note: '2구역 고수. 흉터투성이 팔, 대도 두 자루', cls: 'sword', color: '#8a6040',
    sprite: { image: 'assets/characters/elite-twin-blade.webp', footX: 0.4996, face: { x: 0.47, y: 0.05 } },
  },
  'elite-patrol-captain': {
    title: '무림맹 순찰대장 한소', note: '사파 3구역 고수. 흰 학 견장, 은빛 비도와 승표', cls: 'assassin', color: '#6f8fb8',
    sprite: { image: 'assets/characters/elite-patrol-captain.webp', footX: 0.4839 },
  },
  'elite-iron-instructor': {
    title: '철권문 교두 석무', note: '3구역 고수. 철장갑, 깊은 마보 자세', cls: 'fist', color: '#d8dde4',
    sprite: { image: 'assets/characters/elite-iron-instructor.webp', footX: 0.4772 },
  },
  'elite-twin-fang': {
    title: '혈영대 견습 살수 쌍아', note: '마교 1구역 고수. 쌍상투 소녀, 송곳니 단검 두 자루', cls: 'assassin', color: '#7a1a28',
    sprite: { image: 'assets/characters/elite-twin-fang.webp', footX: 0.4904, face: { x: 0.47, y: 0.02 } },
  },
  'elite-red-lash': {
    title: '마교 검각 제자 적편', note: '마교 1구역 고수. 붉은 기운의 채찍검', cls: 'sword', color: '#c22a36',
    sprite: { image: 'assets/characters/elite-red-lash.webp', footX: 0.4643 },
  },
  'npc-drunk-thug': {
    title: '술 취한 흑도 주먹패 왕삼', note: '프롤로그 첫 상대. 호리병을 든 주정뱅이', cls: 'fist', color: '#8e7050',
    sprite: { image: 'assets/characters/npc-drunk-thug.webp', footX: 0.4868 },
  },
  'npc-innkeeper': {
    title: '청운객잔 주인', note: '사파 단서 인물. 주판을 끌어안은 소심한 주인장', cls: 'fist', color: '#a08a6a',
    sprite: { image: 'assets/characters/npc-innkeeper.webp', footX: 0.4919 },
  },
  'boss-nokrim': {
    title: '녹림 총채주 곽패', note: '2구역 두목. 개산부를 휘두르는 산군',
    cls: 'fist', color: '#8e7050', sprite: { image: 'assets/characters/boss-nokrim.webp', footX: 0.4055, face: { x: 0.33, y: 0.1 } },
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
    portrait: n.sprite?.image ?? null, sprite: n.sprite, factionColor: n.color, fxColor: '#e8dcc0',
  };
}
export const NPC_IDS = Object.keys(NPCS);

// ── 적으로 나오는 세력 무인 (8단계: 예전 세력×계열 그림 9장) ─────────
// 세력×계열 그림은 이제 주인공(같은 얼굴)이라, 일반 적은 예전 그림을 foe-<세력>-<계열> 로 씀
const FOES = {
  'foe-orthodox-sword': { title: '정파 검객', footX: 0.4073 },
  'foe-orthodox-fist': { title: '정파 권사', footX: 0.5286 },
  'foe-orthodox-assassin': { title: '정파 살수', footX: 0.5028 },
  'foe-unorthodox-sword': { title: '사파 검객', footX: 0.5138 },
  'foe-unorthodox-fist': { title: '사파 권사', footX: 0.4995 },
  'foe-unorthodox-assassin': { title: '사파 살수', footX: 0.5143 },
  'foe-demonic-sword': { title: '마교 검객', footX: 0.4371 },
  'foe-demonic-fist': { title: '마교 권사', footX: 0.5332, face: { x: 0.5, y: 0.1 } },
  'foe-demonic-assassin': { title: '혈영대원', footX: 0.5465 },
};
for (const [key, f] of Object.entries(FOES)) {
  const [fid, cls] = key.slice(4).split('-');
  DESIGNS[key] = {
    key, faction: fid, cls, title: f.title, note: '적으로 나오는 세력 무인',
    portrait: `assets/characters/${key}.webp`,
    sprite: { image: `assets/characters/${key}.webp`, footX: f.footX, ...(f.face ? { face: f.face } : {}) },
    factionColor: FACTIONS[fid].color, fxColor: FX_COLOR[fid],
  };
}

// 주인공 그림: 같은 얼굴로 새로 그린 것 (9칸 모두. 사파 검객은 얼굴 시트에서 자른 임시 그림)
export const HERO_READY = new Set(['orthodox-sword', 'orthodox-fist', 'orthodox-assassin', 'unorthodox-sword', 'unorthodox-fist', 'unorthodox-assassin', 'demonic-sword', 'demonic-fist', 'demonic-assassin']);
export function heroArt(faction, cls) {
  const key = `${faction}-${cls}`;
  return HERO_READY.has(key) ? key : 'orthodox-sword';
}
