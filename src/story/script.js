// 대사 데이터
// 한 줄: { who: 화자 id, text: 대사 } — who 가 'me' 면 주인공, 'narr' 면 지문(화자 없음)
// thought: true 면 속마음 (괄호로 표시)
// 장면 사이의 전투·연출은 main.js 가 순서대로 이어 붙임

export const SPEAKERS = {
  me: { name: '나', art: 'orthodox-sword' },
  narr: { name: '' },
  boki: { name: '복이', glyph: '福' }, // 그림 없음: 한자 인장으로 표시
  juno: { name: '주노', art: 'npc-juno' },
  thug: { name: '왕삼', art: 'unorthodox-fist' },
  assassin: { name: '혈영대원', art: 'demonic-assassin' },
  gwimyeon: { name: '귀면', art: 'demonic-assassin' },
  sooha: { name: '흰 옷의 사내', art: 'npc-sooha' }, // 진소하 (아직 이름 모름)
  clerk: { name: '맹 서기', glyph: '盟' },
  oneEye: { name: '독안귀', art: 'unorthodox-assassin' },
  masked: { name: '무명', art: 'demonic-assassin' },
  spy: { name: '연무혁', art: 'demonic-sword' },
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

// ── 단서 (회귀해도 남음) ─────────────────────────
export const CLUES = {
  mask: { title: '귀면 가면 = 혈영대', text: '그날 밤 자객들이 쓴 뿔 달린 귀면 가면은 마교 혈영대의 표식이다.' },
  envoy: { title: '흰 옷의 사내 = 무림맹', text: '나 대신 살아 나간 흰 옷의 사내는 무림맹의 패를 지니고 있었다.' },
  note: { title: '백 일 뒤, 청운객잔', text: '객잔 습격은 백 일 전부터 계획된 일이다. 노린 것은 흰 옷의 밀사와 그가 가진 밀서.' },
};

// ── 1구역 · 후기지수 비무대회 ─────────────────────────
// 구역 시작: 처음 / 그 뒤
export function zone1Start(meta) {
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

// ── 1구역 돌파 (아직 2구역이 없을 때) ─────────────────────────
export const ZONE1_CLEAR = [
  { who: 'narr', text: '비무대회는 주인 없는 우승으로 끝났다.\n누구도 무명씨의 이름을 기억하지 못했다.' },
  { who: 'me', text: '혈영대, 흰 옷의 밀사, 그리고 밀서. 실마리는 무림맹으로 이어진다.' },
  { who: 'narr', text: '― 2구역 "무림맹 사파 토벌"은 다음 이야기에서 ―' },
];
