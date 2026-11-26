// 대사 데이터
// 한 줄: { who: 화자 id, text: 대사 } — who 가 'me' 면 주인공, 'narr' 면 지문(화자 없음)
// thought: true 면 속마음 (괄호로 표시)
// 장면 사이의 전투·연출은 main.js 가 순서대로 이어 붙임

export const SPEAKERS = {
  me: { name: '나', art: 'orthodox-sword' },
  narr: { name: '' },
  boki: { name: '복이', glyph: '福' }, // 그림 없음: 한자 인장으로 표시
  juno: { name: '주노', glyph: '酒' }, // 그림 추가 예정
  thug: { name: '왕삼', art: 'unorthodox-fist' },
  assassin: { name: '혈영대원', art: 'demonic-assassin' },
  gwimyeon: { name: '귀면', art: 'demonic-assassin' },
  sooha: { name: '흰 옷의 사내', glyph: '白' }, // 진소하 (아직 이름 모름)
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
  afterPlay: '상대 머리 위 말풍선이 상대의 다음 행동이다.\n공격이 오는 턴에는 "견제"로 기혈을 흐트러뜨리면 덜 아프다.',
  noEnergy: '내공을 다 썼으면 "턴 종료". 이 세계에 방어는 없다 — 맞기 전에 쓰러뜨려라.',
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
  afterPlay: '"흐트러짐(亂)"에 걸린 상대는 피해가 줄고, "내상(傷)"에 걸린 상대는 더 아프게 맞는다.',
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

// ── 1구역 돌파 (아직 2구역이 없을 때) ─────────────────────────
export const ZONE1_CLEAR = [
  { who: 'me', text: '우승 후보라던 연무혁이… 마교의 첩자였다니.' },
  { who: 'me', text: '그날 밤의 일은 우연이 아니다. 누군가 오래전부터 준비한 판이다.' },
  { who: 'narr', text: '― 2구역 "무림맹 사파 토벌"은 다음 이야기에서 ―' },
];
