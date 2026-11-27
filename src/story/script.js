// 대사 데이터
// 한 줄: { who: 화자 id, text: 대사 } — who 가 'me' 면 주인공, 'narr' 면 지문(화자 없음)
// thought: true 면 속마음 (괄호로 표시)
// 장면 사이의 전투·연출은 main.js 가 순서대로 이어 붙임
import { josa } from '../core/josa.js';

export const SPEAKERS = {
  me: { name: '나', art: 'orthodox-sword' },
  narr: { name: '' },
  boki: { name: '복이', glyph: '福' }, // 그림 없음: 한자 인장으로 표시
  juno: { name: '주노', art: 'npc-juno' },
  thug: { name: '왕삼', art: 'unorthodox-fist' },
  assassin: { name: '혈영대원', art: 'demonic-assassin' },
  gwimyeon: { name: '귀면', art: 'boss-gwimyeon' },
  sooha: { name: '흰 옷의 사내', art: 'npc-sooha' }, // 진소하 (아직 이름 모름)
  clerk: { name: '맹 서기', glyph: '盟' },
  oneEye: { name: '독안귀', art: 'unorthodox-assassin' },
  masked: { name: '무명', art: 'demonic-assassin' },
  spy: { name: '연무혁', art: 'demonic-sword' },
  soohaNamed: { name: '진소하', art: 'npc-sooha' },
  twinBlade: { name: '쌍도귀', art: 'unorthodox-sword' },
  poisonKing: { name: '당철', art: 'unorthodox-assassin' },
  nokrimKing: { name: '곽패', art: 'boss-nokrim' },
  bloodWolf: { name: '혈랑', art: 'demonic-assassin' },
  heavenDemon: { name: '천마검귀', art: 'demonic-sword' },
  bloodElder: { name: '위극', art: 'demonic-fist' },
  officer: { name: '토벌대장', glyph: '令' },
  gangLord: { name: '조광', art: 'boss-gang', glyph: '黑' },
  allianceElder: { name: '우문혁', art: 'boss-elder', glyph: '盟' },
  innkeeper: { name: '객잔 주인', art: 'npc-innkeeper', glyph: '店' },
  axeLord: { name: '마삼', art: 'unorthodox-fist' },
  patrolCaptain: { name: '한소', art: 'orthodox-assassin' },
  gangBro: { name: '흑도 졸개', glyph: '卒' },
  rival: { name: '연화', art: 'boss-rival', glyph: '華' },
  baekri: { name: '백리현', art: 'boss-baekri', glyph: '鶴' },
  cultElder: { name: '혈공 장로', glyph: '魔' },
  cultHerald: { name: '마교 집사', glyph: '令' },
};

// ── 프롤로그 ─────────────────────────
export const PROLOGUE_INTRO = [
  { who: 'narr', text: '비가 사흘째 그치지 않던 밤.\n산길 끝, 청운객잔에만 불이 켜져 있었다.' },
  { who: 'boki', text: '손님! 국수 한 그릇 더 하실래요? 오늘 같은 날엔 뜨끈한 게 최고죠!' },
  { who: 'me', text: '…됐다.' },
  { who: 'boki', text: '에이, 무사님들은 다 그렇게 말씀하시더라. 근데 그 흰 옷, 비 맞으면 얼룩 안 져요?' },
  { who: 'me', text: '(말이 많은 점소이군.)', thought: true },
  { who: 'juno', text: '(딸꾹) 젊은이… 흰 옷은 비 오는 날 입는 게 아니야. 눈에 띄거든.' },
  { who: 'me', text: '(무슨 소리야, 저 노인네.)', thought: true },
  { who: 'thug', text: '어이, 거기 흰둥이! 내 술상에 물 튀었잖아! 이거 어쩔 거야?' },
  { who: 'me', text: '…튄 적 없다.' },
  { who: 'thug', text: '튀었다면 튄 거야! 주먹 맛 좀 볼래?' },
];

// 튜토리얼 전투 1 도움말 (전투 진행에 맞춰 차례로)
export const TUTORIAL_1_HINTS = {
  start: '아래 카드를 눌러 초식을 펼치시오.\n카드 왼쪽 위 숫자는 필요한 내공. 내공은 매 턴 3씩 차오른다.',
  afterPlay: '상대 머리 위 말풍선이 상대의 다음 행동이다. 카드 아래 숫자는 명중률 — 칼은 빗나가기도 한다.\n공격이 오는 턴에는 "견제"로 기혈을 흐트러뜨리면 덜 아프다.',
  noEnergy: '내공을 다 썼으면 "턴 종료". 이 세계에 방어는 없다.\n대신 "경신법"으로 경공을 쌓으면 적의 칼을 피할 수 있다.',
};

export const PROLOGUE_AFTER_THUG = [
  { who: 'thug', text: '크윽… 이, 이거 생각보다 맵네…' },
  { who: 'boki', text: '와아! 손님 대단하세요! 왕삼 형님 저렇게 뻗는 거 처음 봐요!' },
  { who: 'me', text: '…국수가 식었군.' },
  { who: 'narr', text: '쾅―!\n객잔 문이 부서지며 비바람과 함께 검은 그림자들이 들이닥쳤다.' },
  { who: 'assassin', text: '흰 옷에 검을 찬 놈이다! 놓치지 마라!' },
  { who: 'me', text: '…나?' },
  { who: 'boki', text: '으아아! 귀, 귀신이다! 가면 쓴 귀신!' },
  { who: 'juno', text: '…쯧. 그러게 내가 뭐랬나.' },
];

export const TUTORIAL_2_HINTS = {
  start: '적이 "기세(勢)"를 끌어올리면 그만큼 공격이 강해진다.\n기를 모으는 턴은 숨 돌릴 틈 — 그때 몰아쳐라.',
  afterPlay: '"흐트러짐(亂)"에 걸린 상대는 피해가 줄고, "내상(傷)"에 걸린 상대는 더 아프게 맞는다.\n붉게 빛나는 "필살" 예고는, 그 턴에 충분히 때리면 끊을(파기) 수 있다.',
};

export const PROLOGUE_DEATH = [
  { who: 'assassin', text: '크헉… 이놈, 생각보다…' },
  { who: 'narr', text: '그 순간, 등 뒤에서 차가운 것이 가슴을 꿰뚫었다.' },
  { who: 'gwimyeon', text: '…시간 끌지 마라. 밀서부터 찾아.' },
  { who: 'me', text: '(밀…서…? 무슨…)', thought: true },
  { who: 'narr', text: '쓰러지는 눈에 비친 것은, 뒷문으로 빠져나가는 사내.\n나와 똑같은 흰 옷에, 똑같이 검을 찬.' },
  { who: 'assassin', text: '대주님, 이놈 품에 아무것도 없습니다!' },
  { who: 'gwimyeon', text: '…가짜인가. 쫓아라!' },
  { who: 'me', text: '…나는… 그냥 국수를 먹고 있었을 뿐인데…' },
  { who: 'narr', text: '억울하다.\n억울해서, 이대로는 눈을 감을 수가 없다―' },
];

// ── 회귀 직후 (회차에 따라) ─────────────────────────
export function wakeLines(runNumber) {
  if (runNumber === 1) {
    return [
      { who: 'narr', text: '― 百日前 ―' },
      { who: 'me', text: '…햇빛?' },
      { who: 'me', text: '(가슴을 만져 본다. 구멍이 없다. 피도 없다.)', thought: true },
      { who: 'narr', text: '낯익은 여인숙 천장. 벽에 걸린 달력은 그날 밤으로부터 꼭 백 일 전을 가리키고 있었다.' },
      { who: 'me', text: '꿈이었나…? 아니. 그 칼의 차가움은 진짜였다.' },
      { who: 'me', text: '흰 옷의 사내, 밀서, 귀면 가면… 그리고 나는 엉뚱하게 죽었다.' },
      { who: 'me', text: '…좋다. 백 일이다. 이번엔 그냥 당하지 않는다.' },
    ];
  }
  if (runNumber === 2) {
    return [
      { who: 'narr', text: '― 百日前 ―' },
      { who: 'me', text: '…또다.' },
      { who: 'me', text: '죽는 감각은 몇 번을 겪어도 익숙해지지 않는군.' },
      { who: 'me', text: '그래도 몸이 기억하는 초식이 있다. 이걸로 다시 간다.' },
    ];
  }
  const pool = [
    ['다시 아침. 이번이 몇 번째더라.', '세다 보면 미쳐 버릴 것 같으니, 세지 말자.'],
    ['국수는… 당분간 먹지 말자.', '…아니, 그건 국수 잘못이 아니지.'],
    ['백 일. 길다면 길고, 짧다면 짧다.', '이번 생은 조금 더 멀리 가 보자.'],
    ['손에 익은 검이 조금 가볍게 느껴진다.', '죽으면서도 배우는 게 있긴 한가 보군.'],
  ];
  const [a, b] = pool[runNumber % pool.length];
  return [
    { who: 'narr', text: `― 百日前 · ${runNumber}번째 아침 ―` },
    { who: 'me', text: a },
    { who: 'me', text: b },
  ];
}

// ── 죽음 ─────────────────────────
export function deathLines(enemyName) {
  return [
    { who: 'me', text: `…${enemyName}에게… 여기서…` },
    { who: 'narr', text: '눈앞이 어두워진다.\n그러나 이번에도, 억울함이 숨을 놓아주지 않았다.' },
  ];
}

// ── 단서 (회귀해도 남음) ─────────────────────────
export const CLUES = {
  mask: { title: '귀면 가면 = 혈영대', text: '그날 밤 자객들이 쓴 뿔 달린 귀면 가면은 마교 혈영대의 표식이다.' },
  envoy: { title: '흰 옷의 사내 = 무림맹', text: '나 대신 살아 나간 흰 옷의 사내는 무림맹의 패를 지니고 있었다.' },
  note: { title: '백 일 뒤, 청운객잔', text: '객잔 습격은 백 일 전부터 계획된 일이다. 노린 것은 흰 옷의 밀사와 그가 가진 밀서.' },
  leak: { title: '무림맹 안에서 정보가 샌다', text: '녹림 총채주는 토벌대의 진로를 미리 알고 있었다. 맹 안의 누군가가 흘렸다.' },
  traitor: { title: '배신자는 맹의 높은 자리', text: '혈마 장로는 "맹의 높으신 분"과 약속을 했다고 했다. 배신자는 말단이 아니다.' },
  innkeeper: { title: '객잔 주인이 돈을 받았다', text: '청운객잔 주인은 "그날 밤 문을 잠그면 큰돈을 준다"는 말에 넘어갔다. 습격은 안에서부터 준비되어 있었다.' },
  payer: { title: '돈을 준 쪽은 정파', text: '무림맹 장로의 품에서 흰 학 문양 전낭과 "청운객잔 주인에게 은자 오백 냥" 이라 적힌 장부가 나왔다. 흰 학은 무림맹 수뇌부의 문양이다.' },
  request: { title: '혈영대를 부른 것은 무림맹', text: '혈영대 막사의 서찰: "백 일 뒤 청운객잔, 흰 옷의 밀사. 밀서를 회수해 주면 약조대로 관문을 열겠소." 찍힌 인장은 흰 학 — 무림맹이었다.' },
  traitorName: { title: '배신자는 부맹주 백리현', text: '밀서의 첩자 명단 맨 위에 적힌 이름 — 무림맹 부맹주 백리현. 그날 밤 객잔의 문, 혈영대, 밀사의 길은 모두 그의 손에서 나왔다.' },
  sender: { title: '귀면을 보낸 자', text: '귀면은 죽기 전에 "누가 우리를 보냈는지 아느냐"고 물었다. 혈영대를 움직인 것은 교주가 아니다.' },
};

// ── 구역 시작 (2구역부터) ─────────────────────────
// 세력별 구역 이름·배경 (마지막은 그날 밤의 객잔)
export const ROUTE_TEXT = {
  orthodox: {
    zones: ['제1구역 · 후기지수 비무대회', '제2구역 · 녹림 토벌', '제3구역 · 마교 침공 저지', '그날 밤 · 청운객잔'],
    backgrounds: ['arena', 'forest', 'gate', 'inn'],
    // 지도 안내: 구역 끝에서 기다리는 자 (BUG-028)
    bosses: ['우승 후보', '녹림 총채주', '혈마 장로'],
  },
  unorthodox: {
    zones: ['제1구역 · 흑도 패권 다툼', '제2구역 · 녹림 통합', '제3구역 · 무림맹 지부 습격', '그날 밤 · 청운객잔'],
    backgrounds: ['alley', 'forest', 'hall', 'inn'],
    bosses: ['흑도 맹주', '녹림 총채주', '무림맹 장로'],
  },
  demonic: {
    zones: ['제1구역 · 서열 혈투', '제2구역 · 중원 진출', '제3구역 · 정마 결전', '그날 밤 · 청운객잔'],
    backgrounds: ['altar', 'forest', 'gate', 'inn'],
    bosses: ['서열 1위', '흑도 맹주', '무림맹 장로'],
  },
};
export const ZONE_NAMES = ROUTE_TEXT.orthodox.zones;
export const ZONE_BACKGROUNDS = ROUTE_TEXT.orthodox.backgrounds;

export function zoneName(faction, zone) {
  return (ROUTE_TEXT[faction] ?? ROUTE_TEXT.orthodox).zones[zone];
}

// 지도 화면의 제목·안내 (BUG-028)
export function mapHeader(faction, zone) {
  const t = ROUTE_TEXT[faction] ?? ROUTE_TEXT.orthodox;
  const boss = t.bosses?.[zone];
  return {
    title: t.zones[zone],
    hint: `갈 곳을 고르시오 · 방어는 없다, 운기조식(息)에서 회복하라${boss ? ` · 마지막에는 ${josa(boss, '이/가')} 기다린다` : ''}`,
  };
}

export function zoneBackground(faction, zone) {
  return (ROUTE_TEXT[faction] ?? ROUTE_TEXT.orthodox).backgrounds[zone];
}

// 사파 루트 구역 대사
const UNORTHODOX_TEXT = {
  start: (meta) => [
    { who: 'narr', text: '흑도의 밤거리. 도박장과 주먹패가 골목마다 영역을 다툰다.' },
    { who: 'me', text: '(정파의 길은 이미 걸어 봤다. 이번엔 그늘에서 그날 밤을 본다.)', thought: true },
    { who: 'gangBro', text: '어이, 흰 옷. 여긴 조광 맹주님 땅이다. 통행세 내고 가.' },
    { who: 'me', text: '…통행세는 칼로 내지.' },
    ...(meta.clues.includes('innkeeper')
      ? [{ who: 'me', text: '(청운객잔 주인이 이 근처 도박장에 드나든다. 이번에도.)', thought: true }]
      : []),
  ],
  intro: {
    1: (meta) => [
      { who: 'narr', text: '흑도를 손에 넣자 녹림 칠십이채가 술렁였다.\n산채들을 하나로 묶으면, 그날 밤까지 누구도 함부로 못 한다.' },
      { who: 'me', text: '(녹림 총채주 곽패. 정파의 길에서는 토벌할 적이었지. 이번엔 자리를 두고 겨룰 상대다.)', thought: true },
      ...(meta.clues.includes('payer') ? [{ who: 'me', text: '(흰 학의 전낭. 끝은 무림맹이다.)', thought: true }] : []),
    ],
    2: () => [
      { who: 'narr', text: '녹림을 묶은 사파 연합이 무림맹 지부로 향한다.\n명분은 복수, 속셈은 약탈. 내 목적은 하나다.' },
      { who: 'me', text: '그날 밤 객잔에 돈을 댄 자. 그 흔적이 맹 안에 있다.' },
    ],
  },
  clear: {
    0: [
      { who: 'narr', text: '조광이 쓰러지고, 흑도의 골목들이 새 주인을 맞았다.' },
      { who: 'me', text: '흑도는 손에 넣었다. 하지만 그날 밤의 돈줄은 이보다 높은 곳에 있다.' },
    ],
    1: [
      { who: 'narr', text: '곽패가 무릎을 꿇었다. 녹림 칠십이채의 깃발이 하나로 바뀌었다.' },
      { who: 'me', text: '이제 무림맹이다. 그날 밤 돈을 댄 자가 거기 있다.' },
    ],
    2: [
      { who: 'narr', text: '불타는 지부를 뒤로하고, 하늘에서 비가 내리기 시작했다.\n사흘 동안 그치지 않을 비가.' },
      { who: 'me', text: '…오늘 밤이다. 이번엔 객잔 문이 잠기기 전에 간다.' },
    ],
  },
};

// 마교 루트 구역 대사
const DEMONIC_TEXT = {
  start: (meta) => [
    { who: 'narr', text: '마교 총단. 핏빛 등불 아래 젊은 고수들이 서열을 두고 생사 비무를 벌인다.' },
    { who: 'cultHerald', text: '이름 없는 떠돌이가 서열전에 들겠다고? 죽어도 원망 말거라.' },
    { who: 'me', text: '(그날 밤 나를 벤 귀면 가면. 그 뿌리가 이곳이다. 안에서부터 본다.)', thought: true },
    ...(meta.clues.includes('request')
      ? [{ who: 'me', text: '(혈영대를 부른 건 교주가 아니었다. 이번엔 그 서찰을 더 빨리 손에 넣는다.)', thought: true }]
      : []),
  ],
  intro: {
    1: () => [
      { who: 'narr', text: '서열 1위를 꺾은 이름 없는 자. 마교는 그를 앞세워 중원으로 나섰다.' },
      { who: 'me', text: '(정파와 사파를 동시에 상대해야 한다. …그날 밤 객잔을 둘러싼 것도 이 셋이었지.)', thought: true },
    ],
    2: () => [
      { who: 'narr', text: '정파와 마교가 마침내 정면으로 부딪친다. 그런데 혈영대 일부가 교주의 명을 따르지 않고 따로 움직인다.' },
      { who: 'me', text: '혈영대를 움직이는 다른 손. 그 서찰을 찾는다.' },
    ],
  },
  clear: {
    0: [
      { who: 'narr', text: '서열전이 끝났다. 총단의 젊은 고수들이 이름 없는 자에게 고개를 숙였다.' },
      { who: 'me', text: '마교 안에서도 혈영대는 따로 논다. 누가 그들을 부리는지 알아야 한다.' },
    ],
    1: [
      { who: 'narr', text: '중원 흑도가 무너지고, 마교의 깃발이 강을 건넜다.' },
      { who: 'me', text: '이제 정마 결전이다. 그 판 위에서 혈영대가 어디로 가는지 본다.' },
    ],
    2: [
      { who: 'narr', text: '결전의 불길이 잦아들었다. 그리고 비가 내리기 시작했다. 사흘 동안 그치지 않을 비가.' },
      { who: 'me', text: '…오늘 밤이다. 이번엔 귀면이 누구의 부름을 받고 왔는지 알고 간다.' },
    ],
  },
};

export function zoneIntro(zone, meta, faction = 'orthodox') {
  if (faction === 'demonic') return DEMONIC_TEXT.intro[zone]?.(meta) ?? [];
  if (faction === 'unorthodox') return UNORTHODOX_TEXT.intro[zone]?.(meta) ?? [];
  if (zone === 1) {
    return [
      { who: 'narr', text: '비무대회가 끝나고 한 달.\n무림맹은 녹림 칠십이채를 치기 위해 토벌대를 꾸렸다.' },
      { who: 'officer', text: '비무대회에서 이름 없이 올라온 자가 너인가. 쓸 만한 칼이면 신분은 묻지 않는다.' },
      { who: 'me', text: '(연무혁의 쪽지. 마교는 맹 안까지 손을 뻗고 있다. 맹 가까이에 있어야 한다.)', thought: true },
      ...(meta.clues.includes('leak')
        ? [{ who: 'me', text: '(이번엔 안다. 이 토벌대의 진로는 이미 새어 나가 있다.)', thought: true }]
        : [{ who: 'officer', text: '산채는 험하다. 독을 쓰는 놈들이 많으니 해독산을 챙겨라.' }]),
    ];
  }
  if (zone === 2) {
    return [
      { who: 'narr', text: '녹림을 친 지 보름 만에, 북쪽 관문에서 봉화가 올랐다.\n마교가 움직였다.' },
      { who: 'me', text: '백 일이 거의 다 됐다. 그날 밤까지, 이제 얼마 남지 않았다.' },
      { who: 'me', text: '(혈영대도 이 전장 어딘가에 있다. 그리고 맹 안의 누군가도.)', thought: true },
    ];
  }
  return [];
}

// 구역을 깬 뒤 넘어가는 대사
export function zoneClearLines(zone, faction = 'orthodox') {
  if (faction === 'demonic') return DEMONIC_TEXT.clear[zone] ?? [];
  if (faction === 'unorthodox') return UNORTHODOX_TEXT.clear[zone] ?? [];
  if (zone === 0) {
    return [
      { who: 'narr', text: '비무대회는 주인 없는 우승으로 끝났다.\n누구도 무명씨의 이름을 기억하지 못했다.' },
      { who: 'me', text: '마교 첩자, 혈영대, 흰 옷의 밀사. 실마리는 무림맹으로 이어진다.' },
    ];
  }
  if (zone === 1) {
    return [
      { who: 'narr', text: '녹림 칠십이채가 무너졌다. 그러나 토벌대도 절반을 잃었다.' },
      { who: 'me', text: '진로를 아는 자가 산적들에게 흘렸다. …맹 안에 쥐가 있다.' },
    ];
  }
  return [
    { who: 'narr', text: '관문의 불길이 잦아들었다.\n그리고 하늘에서 비가 내리기 시작했다. 사흘 동안 그치지 않을 비가.' },
    { who: 'me', text: '…오늘 밤이다.' },
  ];
}

// ── 최종 결전: 그날 밤의 청운객잔 ─────────────────────────
export const FINAL_INTRO = [
  { who: 'narr', text: '비가 사흘째 그치지 않던 밤.\n산길 끝, 청운객잔에만 불이 켜져 있었다.' },
  { who: 'boki', text: '손님! 국수 한 그릇 하실래요? 오늘 같은 날엔 뜨끈한 게 최고죠!' },
  { who: 'me', text: '…그래. 이번엔 다 먹고 싶군.' },
  { who: 'juno', text: '(딸꾹) 흰 옷은 비 오는 날 입는 게 아니라니까. …뭐, 이번엔 괜찮겠지.' },
  { who: 'narr', text: '구석 자리, 흰 옷의 사내가 품속의 서찰을 감싸 쥐고 있다.' },
  { who: 'narr', text: '쾅―!\n문이 부서지며 비바람과 함께 귀면 가면이 들어섰다.' },
  { who: 'gwimyeon', text: '흰 옷에 검을 찬 놈. …둘이군. 둘 다 벤다.' },
  { who: 'me', text: '백 일을 기다렸다. 이번엔 앞에서 와라.' },
];

// ── 진엔딩 ─────────────────────────
// 귀면이 쓰러진 뒤 (세 길의 단서를 모두 모은 판)
export const TRUE_BRIDGE = [
  { who: 'gwimyeon', text: '크윽… 어리석은 놈. 누가 우리를 보냈는지… 아느냐…' },
  { who: 'me', text: '안다.' },
  { who: 'narr', text: '빗소리 사이로, 느린 박수 소리가 들려왔다.\n문간에 흰 학 문양의 도포를 입은 사내가 서 있었다.' },
  { who: 'baekri', text: '수고했네, 귀면. …아니, 이젠 쓸모가 없겠군.' },
  { who: 'soohaNamed', text: '부맹주님…? 어째서 여기에…' },
  { who: 'me', text: '흰 학 문양 전낭. 객잔 주인에게 건넨 은자 오백 냥. 혈영대를 부른 서찰의 인장.' },
  { who: 'me', text: '그리고 맹의 높은 자리. 백 일을 몇 번이나 다시 살면서 모은 조각이다.' },
  { who: 'baekri', text: '…재미있는 떠돌이로군. 밀서만 조용히 넘어왔으면 아무도 다치지 않았을 텐데.' },
  { who: 'baekri', text: '좋네. 오늘 밤 이 객잔에서 일어난 일은, 마교의 습격으로 기록될 걸세. 자네들 모두의 이름과 함께.' },
];

export const TRUE_ENDING = [
  { who: 'baekri', text: '크헉… 백 일… 백 일 전부터 짠 판이… 이름 없는 놈에게…' },
  { who: 'narr', text: '진소하가 떨리는 손으로 밀서를 펼쳤다.\n마교가 맹에 심어 둔 첩자 명단. 그 맨 위에 적힌 이름.' },
  { who: 'soohaNamed', text: '…백리현. 부맹주가 첩자의 우두머리였다니.' },
  { who: 'soohaNamed', text: '당신이 아니었으면 이 밀서는 오늘 밤 사라졌을 거요. 대체 당신은 누구요?' },
  { who: 'me', text: '국수 먹던 떠돌이.' },
  { who: 'boki', text: '소, 손님…! 국수가 아직 따뜻해요! 한 그릇 더 하실래요?' },
  { who: 'me', text: '…그래. 이번엔 다 먹고 가지.' },
  { who: 'juno', text: '(딸꾹) 백 일이란 건 말이야… 이번엔 술이 잘 익었군.' },
  { who: 'me', text: '(…역시 알고 있었던 건가, 이 노인네.)', thought: true },
  { who: 'narr', text: '비가 그쳤다.\n그리고 나는 처음으로, 백 일 뒤의 아침을 맞았다.' },
  { who: 'narr', text: '― 진엔딩 · 백일회귀 ―' },
];

export const ENDING = [
  { who: 'gwimyeon', text: '크윽… 이름도 없는 놈에게…' },
  { who: 'gwimyeon', text: '…어리석은 놈. 누가 우리를 보냈는지… 아느냐…' },
  { who: 'narr', text: '귀면은 끝내 대답하지 않고 숨을 거두었다.\n깨진 가면 아래의 얼굴은, 아무도 알아보지 못했다.' },
  { who: 'soohaNamed', text: '…목숨을 빚졌소. 당신은 대체 누구요?' },
  { who: 'me', text: '국수 먹던 떠돌이.' },
  { who: 'juno', text: '허허. 이번엔 국수가 식지 않았구먼.' },
  { who: 'narr', text: '그날 밤, 나는 처음으로 살아서 아침을 맞았다.\n그러나 혈영대를 보낸 자는 여전히 무림맹 어딘가에 있다.' },
  { who: 'narr', text: '― 일반 엔딩 · 그날 밤을 넘기다 ―\n(진엔딩: 세 세력의 길에서 단서를 모두 모아야 한다)' },
];


// ── 1구역 · 후기지수 비무대회 ─────────────────────────
// 구역 시작: 처음 / 그 뒤
export function zone1Start(meta, faction = 'orthodox') {
  if (faction === 'demonic') return DEMONIC_TEXT.start(meta);
  if (faction === 'unorthodox') return UNORTHODOX_TEXT.start(meta);
  if (meta.runs <= 1) {
    return [
      { who: 'narr', text: '무림맹이 주최하는 후기지수 비무대회.\n이름을 알리려는 젊은 고수들이 구름처럼 모여들었다.' },
      { who: 'me', text: '(백 일 뒤, 그 객잔. 그때까지 할 수 있는 건 강해지는 것뿐이다.)', thought: true },
      { who: 'clerk', text: '다음! 이름과 소속은?' },
      { who: 'me', text: '…없다. 그냥 떠돌이다.' },
      { who: 'clerk', text: '(한숨) "무명 소속 무명씨"라고 적겠소. 다음!' },
    ];
  }
  const lines = [
    { who: 'clerk', text: '다음! 이름과 소속은?' },
    { who: 'me', text: '…무명. 떠돌이.' },
    { who: 'clerk', text: '어째 낯익은 얼굴인데… 우리 어디서 본 적 있소?' },
    { who: 'me', text: `(${meta.runs}번은 봤을 거다.)`, thought: true },
  ];
  if (meta.clues.includes('note')) lines.push({ who: 'me', text: '(연무혁. 이번에도 결승에서 기다리고 있겠지.)', thought: true });
  return lines;
}

// 고수·두목 전투 전 (known = 그 적의 단서를 이미 알고 있음)
export function battleIntro(enemyId, known) {
  switch (enemyId) {
    case 'oneEye':
      return [
        { who: 'narr', text: '외눈의 사내가 비도를 손끝에서 굴리며 히죽 웃는다.' },
        { who: 'oneEye', text: '흰 옷이라… 피 묻히기 딱 좋겠군.' },
      ];
    case 'masked':
      return known
        ? [
          { who: 'narr', text: '복면객이 천천히 가면을 고쳐 쓴다.' },
          { who: 'me', text: '혈영대. 이번엔 처음부터 알고 있다.' },
        ]
        : [
          { who: 'narr', text: '복면객이 천천히 가면을 고쳐 쓴다. 뿔 달린 귀면 가면.' },
          { who: 'me', text: '(저 가면… 어디서 봤더라. 등줄기가 서늘하다.)', thought: true },
        ];
    case 'spy':
      return known
        ? [
          { who: 'narr', text: '결승 비무대. 연무혁이 부채를 접으며 올라선다.' },
          { who: 'spy', text: '무명 소속 무명씨라… 여기까지 올라올 줄은 몰랐소.' },
          { who: 'me', text: '쪽지는 잘 간직하고 있나.' },
          { who: 'spy', text: '…! 무슨 소리를―' },
          { who: 'me', text: '말은 끝나고 하자.' },
        ]
        : [
          { who: 'narr', text: '결승 비무대. 우승 후보 연무혁이 부채를 접으며 올라선다.\n관중석이 떠나갈 듯 함성이 터진다.' },
          { who: 'spy', text: '무명 소속 무명씨라… 재미있군. 여기까지 올라올 줄은 몰랐소.' },
          { who: 'me', text: '(웃고 있는데 눈이 웃지 않는다. 저건 정파의 눈빛이 아니다.)', thought: true },
          { who: 'spy', text: '마지막 비무요. 손속에 사정은 두지 않겠소.' },
        ];
    case 'twinBlade':
      return [{ who: 'twinBlade', text: '맹의 개가 하나 더 왔군. 칼 두 자루면 충분하다!' }];
    case 'poisonKing':
      return [
        { who: 'poisonKing', text: '숨 쉬는 것도 조심하게. 이 산채의 공기엔 내 독이 섞여 있으니까.' },
      ];
    case 'nokrimKing':
      return known
        ? [
          { who: 'nokrimKing', text: '토벌대가 올 줄 알고 있었다! 길까지 다 알려 줬거든!' },
          { who: 'me', text: '누가 알려 줬는지, 이번엔 끝나고 듣겠다.' },
        ]
        : [
          { who: 'narr', text: '산채 꼭대기. 거한이 도끼를 어깨에 걸치고 기다리고 있었다.' },
          { who: 'nokrimKing', text: '크하하! 토벌대가 올 줄 알고 있었다. 길목마다 함정을 파 뒀지!' },
          { who: 'me', text: '(알고 있었다…? 진로는 토벌대장만 알았을 텐데.)', thought: true },
          { who: 'nokrimKing', text: '네놈 목을 걸어 두면 맹의 높으신 분들도 정신 좀 차리겠지!' },
        ];
    case 'bloodWolf':
      return [{ who: 'bloodWolf', text: '흰 옷에 검… 대주님이 찾던 그 얼굴이군. 여기서 끝내 주마.' }];
    case 'heavenDemon':
      return [{ who: 'heavenDemon', text: '정파의 검이라… 피 맛이 싱겁겠구나.' }];
    case 'bloodElder':
      return known
        ? [
          { who: 'bloodElder', text: '여기까지 왔느냐. 맹의 개들은 다 죽었을 텐데.' },
          { who: 'me', text: '약속한 분께 안부 전해라. 이번엔 직접 찾아가겠다고.' },
        ]
        : [
          { who: 'narr', text: '불타는 관문 위, 백발의 노인이 핏빛 기운을 두르고 서 있다.' },
          { who: 'bloodElder', text: '관문은 이미 열렸다. 안에서 열어 준 자가 있었으니까. 크크크.' },
          { who: 'me', text: '(안에서…? 맹 안에서 마교를 들였다고?)', thought: true },
          { who: 'bloodElder', text: '네 피로 이 혈마공을 마무리하마!' },
        ];
    case 'axeLord':
      return [{ who: 'axeLord', text: '흰 옷 입은 애송이가 도끼파 구역을 휘젓고 다닌다고? 도끼 맛을 보여 주마!' }];
    case 'gangLord':
      return [
        { who: 'narr', text: '도박장 이층. 금니를 번뜩이며 곰방대를 문 사내가 웃는다.' },
        { who: 'gangLord', text: '내 골목을 이렇게 시끄럽게 만든 놈이 너냐. 배짱 하나는 마음에 드는군.' },
        { who: 'me', text: '청운객잔. 그 주인장이 누구한테 돈을 빌렸지?' },
        { who: 'gangLord', text: '크크. 그걸 알고 싶으면 내 목부터 가져가 봐라!' },
      ];
    case 'nokrimRival':
      return [
        { who: 'nokrimKing', text: '흑도에서 굴러먹던 놈이 녹림 총채주 자리를 넘봐? 크하하, 배짱은 인정하마!' },
        { who: 'me', text: '자리는 관심 없다. 산채들이 그날 밤까지 내 말을 들으면 된다.' },
      ];
    case 'patrolCaptain':
      return [{ who: 'patrolCaptain', text: '사파 잡배가 맹의 문턱을 넘다니. 여기서 끝이다.' }];
    case 'allianceElder':
      return known
        ? [
          { who: 'allianceElder', text: '사파 잡배가 맹의 장로 앞에 서다니.' },
          { who: 'me', text: '흰 학 문양 전낭. 품에 있겠지. 오늘은 그것만 가져간다.' },
        ]
        : [
          { who: 'narr', text: '불길 속 지부 대청. 백발의 장로가 쇠지팡이를 짚고 서 있다.' },
          { who: 'allianceElder', text: '맹의 지부를 불태우다니. 사파 잡배의 죄는 목숨으로 씻어야 한다.' },
          { who: 'me', text: '(이 노인의 품에서 무언가가 반짝였다. 흰 학 문양…?)', thought: true },
          { who: 'allianceElder', text: '정의는 맹에 있다. 오너라.' },
        ];
    case 'rivalProdigy':
      return [
        { who: 'narr', text: '서열전 마지막 비무대. 붉은 끈으로 머리를 묶은 여인이 곡도를 늘어뜨리고 서 있다.' },
        { who: 'rival', text: '이름도 없는 떠돌이가 여기까지? 서열 1위 자리는 그렇게 싸지 않아.' },
        { who: 'me', text: '자리는 필요 없다. 혈영대를 누가 움직이는지만 알면 된다.' },
        { who: 'rival', text: '…혈영대? 흥, 그건 이기고 나서 물어봐.' },
      ];
    case 'gangLordD':
      return [
        { who: 'gangLord', text: '마교 놈들이 중원까지 밀고 들어와? 흑도도 만만하진 않다!' },
        { who: 'me', text: '(조광… 사파의 길에서 만났던 얼굴이다. 이번엔 적의 편에서.)', thought: true },
      ];
    case 'allianceElderD':
      return [
        { who: 'allianceElder', text: '마교의 앞잡이가 된 정파 출신이라니. 맹의 이름으로 너를 벤다.' },
        { who: 'me', text: '맹의 이름이라. 그 맹이 혈영대를 불렀다는 건 아나?' },
        { who: 'allianceElder', text: '…무슨 헛소리를!' },
      ];
    case 'baekri':
      return [{ who: 'baekri', text: '청명검이 무엇인지 보여 주지. 맹의 이름으로.' }];
    case 'gwimyeon':
      return FINAL_INTRO;
    default:
      return null;
  }
}

// 고수·두목을 쓰러뜨린 뒤 (known = 이번에 얻기 전부터 알던 단서)
export function battleOutro(enemyId, known) {
  switch (enemyId) {
    case 'masked':
      return known
        ? [
          { who: 'masked', text: '크윽… 혈영대는… 네 얼굴을 기억할 것이다…' },
          { who: 'me', text: '기억하는 쪽은 나다.' },
        ]
        : [
          { who: 'narr', text: '쓰러진 복면객의 가면이 비무대 바닥을 구른다.' },
          { who: 'me', text: '그 가면…! 그날 밤 객잔에 들이닥친 놈들과 같은…' },
          { who: 'masked', text: '…혈영대의 일에… 끼어들지 마라…' },
          { who: 'me', text: '(혈영대. 마교의 살수 집단. 그놈들이 나를 죽였다.)', thought: true },
          { who: 'narr', text: '― 단서: 귀면 가면 = 마교 혈영대 ―' },
        ];
    case 'spy':
      return known
        ? [
          { who: 'spy', text: '…어떻게… 내 초식을… 전부…' },
          { who: 'me', text: '몇 번 맞아 봤거든.' },
          { who: 'narr', text: '품에서 떨어진 쪽지에는 이미 아는 글귀가 적혀 있었다.\n『백 일 뒤, 청운객잔.』' },
        ]
        : [
          { who: 'spy', text: '크헉… 이 내가… 이름도 없는 놈에게…' },
          { who: 'narr', text: '쓰러진 연무혁의 품에서 접힌 쪽지 한 장이 떨어졌다.' },
          { who: 'narr', text: '『백 일 뒤, 청운객잔.\n흰 옷의 밀사. 밀서를 회수할 것.』' },
          { who: 'me', text: '…백 일 뒤. 그날 밤이다.' },
          { who: 'me', text: '우연이 아니었어. 그날의 습격은 처음부터 계획된 거다.' },
          { who: 'narr', text: '― 단서: 백 일 뒤, 청운객잔 ―' },
        ];
    case 'nokrimKing':
      return known
        ? [
          { who: 'nokrimKing', text: '크윽… 맹 안의 그놈이… 이번엔 왜 말이 없었지…' },
          { who: 'me', text: '말이 없었던 게 아니다. 이번엔 내가 먼저 왔을 뿐.' },
        ]
        : [
          { who: 'nokrimKing', text: '크헉… 젠장… 길을 알려 준 놈이… 너 같은 게 있다는 말은 안 했는데…' },
          { who: 'me', text: '누구냐. 누가 토벌대의 길을 알려 줬지?' },
          { who: 'nokrimKing', text: '맹에서… 서찰이 왔다… 그 이상은… 몰라…' },
          { who: 'narr', text: '― 단서: 무림맹 안에서 정보가 샌다 ―' },
        ];
    case 'bloodElder':
      return known
        ? [
          { who: 'bloodElder', text: '크크… 늦었다… 오늘 밤… 객잔에서…' },
          { who: 'me', text: '알고 있다. 그래서 가는 거다.' },
        ]
        : [
          { who: 'bloodElder', text: '크헉… 이 혈마가… 애송이에게…' },
          { who: 'bloodElder', text: '…맹의 높으신 분께 전해라… 약속은 지켰다고… 관문도 열었고… 밀사의 길도 알려 줬다고…' },
          { who: 'me', text: '(밀사의 길… 그날 밤의 일까지 다 한 줄로 이어져 있다. 높은 자리의 누군가가.)', thought: true },
          { who: 'narr', text: '― 단서: 배신자는 맹의 높은 자리 ―' },
        ];
    case 'gangLord':
      return [
        { who: 'gangLord', text: '크윽… 졌다, 졌어. 흑도는 네 것이다.' },
        { who: 'gangLord', text: '청운객잔 주인장 말이냐… 그 노름꾼한테 큰손이 붙었다더군. 정파 냄새가 나는 놈이었다고 하던데…' },
        { who: 'me', text: '(정파… 사파의 길에서도 결국 그쪽으로 이어진다.)', thought: true },
      ];
    case 'nokrimRival':
      return [
        { who: 'nokrimKing', text: '크윽… 좋다, 녹림은 네 깃발을 따르마. 대신 무림맹 놈들 목은 우리가 먼저다!' },
      ];
    case 'allianceElder':
      return known
        ? [
          { who: 'allianceElder', text: '크헉… 이 늙은이가… 사파에게…' },
          { who: 'narr', text: '품에서 떨어진 흰 학 문양 전낭. 이미 아는 장부가 들어 있다.' },
        ]
        : [
          { who: 'allianceElder', text: '크헉… 이 늙은이가… 사파 잡배에게…' },
          { who: 'narr', text: '쓰러진 장로의 품에서 전낭 하나가 굴러 나왔다. 흰 학 문양이 수놓아져 있다.' },
          { who: 'narr', text: '안에는 접힌 장부 한 장.\n『청운객잔 주인에게 은자 오백 냥. 문은 그날 밤 해시에.』' },
          { who: 'me', text: '…객잔에 돈을 댄 건 정파였다. 흰 학은 맹 수뇌부의 문양이다.' },
          { who: 'narr', text: '― 단서: 돈을 준 쪽은 정파 ―' },
        ];
    case 'rivalProdigy':
      return [
        { who: 'rival', text: '…졌네. 좋아, 약속은 약속이지.' },
        { who: 'rival', text: '혈영대는 요즘 교주님 명이 아니라 대주의 판단으로 움직여. 대주에게 서찰이 자주 온다던데… 어디서 오는지는 아무도 몰라.' },
      ];
    case 'gangLordD':
      return [{ who: 'gangLord', text: '크윽… 마교가 중원을 먹는다고 끝날 것 같으냐… 정파 높으신 분들도 다 제 몫을 챙기고 있다고…' }];
    case 'allianceElderD':
      return [
        { who: 'allianceElder', text: '크헉… 마교가… 맹의 요청으로 움직였다고…? 그런 일은… 부맹주께서 허락하실 리가…' },
        { who: 'me', text: '(부맹주…)', thought: true },
      ];
    case 'baekri':
      return TRUE_ENDING;
    case 'gwimyeon':
      return ENDING;
    default:
      return null;
  }
}

// 이야기 기연 앞 대사 (n = 이번 포함 만난 횟수, 회차를 넘어 누적)
export function npcIntro(npc, n, meta) {
  if (npc === 'juno') {
    if (n === 1) {
      return [
        { who: 'narr', text: '비무대 뒤편 술독 옆에, 낯익은 노인이 드러누워 있다.' },
        { who: 'me', text: '(…객잔의 그 노인이다. 백 일 전인데 왜 여기에?)', thought: true },
        { who: 'juno', text: '(딸꾹) 응? 자네… 어디서 본 것 같은데… 꿈에서였나?' },
        { who: 'me', text: '…흰 옷은 비 오는 날 입지 말라고 하셨죠.' },
        { who: 'juno', text: '내가? 허허, 좋은 말을 했구먼. 근데 오늘은 해가 쨍쨍한데?' },
      ];
    }
    if (n === 2) {
      return [
        { who: 'juno', text: '또 그 얼굴이군. 이상하지, 자네만 보면 술이 확 깨는 기분이야.' },
        { who: 'me', text: '(이 노인… 정말 기억하는 건가?)', thought: true },
        { who: 'juno', text: '표정을 보니 한 번 크게 데였구먼. 앉게, 앉아.' },
      ];
    }
    const pool = [
      [
        { who: 'juno', text: '(딸꾹) 왔나. 이번엔 몇 번째지? …아니, 대답하지 말게. 숫자는 술맛을 버려.' },
        { who: 'me', text: '…정말 아시는 겁니까.' },
        { who: 'juno', text: '늙은이가 아는 건 술 익는 냄새뿐일세. 허허.' },
      ],
      [
        { who: 'juno', text: '자네 검, 지난번보다 조금 덜 정직해졌군. 좋아, 좋아.' },
        { who: 'me', text: '(지난번…?)', thought: true },
      ],
      [
        { who: 'juno', text: '백 일이란 건 말이야, 술 한 독 익히기에 딱 좋은 시간이지.' },
        { who: 'me', text: '…그 말, 무슨 뜻입니까.' },
        { who: 'juno', text: '뜻은 무슨. 술 얘기지. (딸꾹)' },
      ],
    ];
    return pool[n % pool.length];
  }
  if (npc === 'soohaCamp') {
    return [
      { who: 'narr', text: '토벌대 막사. 낯익은 흰 옷이 지도를 들여다보고 있다.' },
      { who: 'me', text: '(그 사내다. 그날 밤 뒷문으로 빠져나가던.)', thought: true },
      { who: 'soohaNamed', text: '…어디서 본 얼굴 같소만. 무림맹 순찰사 진소하라 하오.' },
      { who: 'me', text: '(진소하. 드디어 이름을 알았다.)', thought: true },
    ];
  }
  if (npc === 'cultElder') {
    return [
      { who: 'narr', text: '총단 지하, 비린내가 진동하는 수련실. 늙은 장로가 핏빛 단지를 젓고 있다.' },
      { who: 'cultElder', text: '서열전에 든 떠돌이로군. 혈공을 알고 싶나? 대가는 피다.' },
    ];
  }
  if (npc === 'bloodCamp') {
    return [
      { who: 'narr', text: '결전의 함성이 멀어진 틈, 혈영대 막사에 불이 꺼져 있다.' },
      { who: 'me', text: '(대주의 탁자. 그날 밤의 명령이 여기 있을 것이다.)', thought: true },
    ];
  }
  if (npc === 'innkeeperDebt') {
    return [
      { who: 'narr', text: '자욱한 담배 연기 속, 낯익은 얼굴이 빚쟁이들에게 둘러싸여 있다.' },
      { who: 'me', text: '(청운객잔 주인… 그날 밤 객잔 문은 왜 잠겨 있었을까.)', thought: true },
      { who: 'innkeeper', text: '조, 조금만! 석 달만 기다려 주시오! 큰돈이 들어올 데가 있다니까!' },
    ];
  }
  if (npc === 'soohaAmbush') {
    return [
      { who: 'narr', text: '산길 아래로 무림맹 행렬이 지나간다. 녹림 무리가 숨을 죽이고 신호를 기다린다.' },
      { who: 'me', text: '(행렬 맨 앞의 흰 옷… 진소하다. 여기서 죽으면 그날 밤도 없다.)', thought: true },
    ];
  }
  if (npc === 'junoGate') {
    return [
      { who: 'narr', text: '불타는 관문 뒤, 무너진 담벼락에 노인이 기대앉아 있다.' },
      { who: 'juno', text: '(딸꾹) 또 만났군. 이번 생은 꽤 멀리까지 왔어.' },
      { who: 'me', text: '…이번 생이라고 하셨습니까.' },
      { who: 'juno', text: '내가? 술김에 헛소리를 했나 보구먼. 허허.' },
    ];
  }
  if (npc === 'sooha') {
    if (meta.clues.includes('envoy')) {
      return [
        { who: 'narr', text: '관중석 끝, 흰 옷의 사내가 서둘러 자리를 뜬다.' },
        { who: 'me', text: '(무림맹의 그 사내다. 이번 생에서도 아무것도 모르는 얼굴이군.)', thought: true },
      ];
    }
    return [
      { who: 'narr', text: '관중석 끝, 흰 옷에 검을 찬 사내가 서둘러 자리를 뜬다.' },
      { who: 'me', text: '(흰 옷… 검… 그날 밤 뒷문으로 빠져나가던 그 사내?!)', thought: true },
      { who: 'sooha', text: '……' },
      { who: 'narr', text: '눈이 마주치자, 사내는 품속의 무언가를 감싸 쥐고 몸을 돌렸다.' },
    ];
  }
  return [];
}

