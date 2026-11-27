// 기연 (지도의 ? 칸): 선택지가 있는 짧은 사건
// option.effect(run, rng) 는 run 상태를 바꾸고 결과 문장을 돌려줌
import { CARDS, canUpgrade, cardsByRarity } from './cards.js';
import { BAG_SIZE, CONSUMABLES, TREASURES } from './items.js';

// 관문의 주노가 가르쳐 주는 보물 (아직 없는 것부터)
const JUNO_TEACHES = ['taiji', 'farSight', 'silkArmor', 'drunkenFist', 'chainArt', 'mirror'];

function heal(run, n) {
  const before = run.hp;
  run.hp = Math.min(run.maxHp, run.hp + n);
  return run.hp - before;
}

function damage(run, n) {
  run.hp = Math.max(1, run.hp - n); // 기연으로는 죽지 않음
}

export const EVENTS = {
  fallenManual: {
    title: '떨어진 무공서',
    text: '비무대 뒤편 수풀 속에 낡은 책 한 권이 떨어져 있다.\n누군가 일부러 숨겨 둔 것 같기도 하다.',
    options: [
      {
        label: '집어 든다',
        hint: '고급 무공 1장 얻음 · 체력 -6',
        effect(run, rng, api) {
          const pool = cardsByRarity('uncommon');
          const id = pool[Math.floor(rng() * pool.length)];
          api.addCard(id);
          damage(run, 6);
          return `숨어 있던 암기에 손을 베였지만, 『${CARDS[id].name}』 무공서를 손에 넣었다.`;
        },
      },
      {
        label: '모른 척 지나간다',
        hint: '아무 일도 없음',
        effect() {
          return '괜한 일에 휘말리지 않기로 했다.';
        },
      },
    ],
  },
  // ── 이야기 기연: 판마다 조건이 맞으면 먼저 나옴. 앞뒤 대사는 src/story/script.js ──
  juno: {
    story: true,
    npc: 'juno',
    title: '술독 옆의 노인',
    text: '노인이 호리병을 흔들며 실눈을 뜬다.\n"마침 술이 떨어져 가던 참인데 말이야…"',
    options: [
      {
        label: '술을 한 잔 따라 드린다',
        hint: '은자 -20 · 무작위 카드 1장 연마',
        disabled: (run) => run.gold < 20,
        effect(run, rng) {
          run.gold -= 20;
          const options = run.deck.filter(canUpgrade);
          if (options.length === 0) return '노인은 술만 마시고 코를 골았다.';
          const card = options[Math.floor(rng() * options.length)];
          card.upgraded = true;
          return `"검끝이 너무 정직해. 한 번 속이고 들어가게." 취중에 한 말이었지만, 『${CARDS[card.id].name}』이(가) 연마되었다.`;
        },
      },
      {
        label: '그날 밤에 대해 묻는다',
        hint: '체력 +14',
        effect(run) {
          const healed = heal(run, 14);
          return `노인은 대답 대신 호리병을 내밀었다. "목부터 축이게. 얼굴이 송장 같구먼."\n이상하게 몸이 따뜻해졌다. 체력을 ${healed} 회복했다.`;
        },
      },
      {
        label: '내기 한 판 청한다',
        hint: '절반 확률로 은자 +60, 아니면 체력 -10',
        effect(run, rng) {
          if (rng() < 0.5) {
            run.gold += 60;
            return '노인의 허점을 찔렀다. "허허, 제법이군! 전에도 이렇게 졌던 것 같은데?" 은자 60냥을 얻었다.';
          }
          damage(run, 10);
          return '지팡이가 번개처럼 정강이를 때렸다. "아직 멀었네." 체력을 10 잃었다.';
        },
      },
    ],
  },
  sooha: {
    story: true,
    npc: 'sooha',
    minRow: 5, // 대회 중반 이후
    title: '흰 옷의 사내',
    text: '사내는 인파 속으로 빠르게 멀어지고 있다.\n품속에 무언가를 소중히 감싸 쥔 채.',
    options: [
      {
        label: '뒤를 쫓는다',
        hint: '체력 -6 · 단서를 얻을지도',
        effect(run, rng, api) {
          damage(run, 6);
          api.addClue('envoy');
          return '골목 끝에서 사내가 돌아서며 검을 반쯤 뽑았다. 칼등에 손등을 맞았다.\n사내는 품에서 패 하나를 내보였다. 무림맹의 패였다.\n"맹의 일이오. 물러나시오." 그는 그대로 사라졌다.';
        },
      },
      {
        label: '내버려 둔다',
        hint: '체력 +6',
        effect(run) {
          heal(run, 6);
          return '지금 쫓아 봐야 얻을 것은 없다. 숨을 고르고 다음 비무를 준비했다.';
        },
      },
    ],
  },
  // 2구역: 토벌대 막사에서 흰 옷의 사내와 다시 만남 — 이름이 밝혀짐
  soohaCamp: {
    story: true,
    npc: 'sooha',
    intro: 'soohaCamp',
    zone: 1,
    minRow: 2,
    title: '토벌대 막사의 진소하',
    text: '"무림맹 순찰사 진소하요." 사내가 짧게 포권한다.\n백 일 뒤 그 객잔에서, 나 대신 살아 나갈 사내.',
    options: [
      {
        label: '그날 밤에 대해 경고한다',
        hint: '행낭에 연막탄 · 그는 믿을까?',
        effect(run, rng, api) {
          const kept = api.addItem('smoke');
          return `"백 일 뒤 청운객잔에 가지 마시오." 진소하는 한참 나를 보더니 연막탄 하나를 건넸다.\n"이상한 사람이군. 쓸 일이 생기면 쓰시오."${kept ? '' : '\n(행낭이 가득 차서 돌려주었다.)'}`;
        },
      },
      {
        label: '검을 섞어 본다',
        hint: '체력 -8 · 무작위 카드 2장 연마',
        effect(run, rng) {
          damage(run, 8);
          const names = [];
          for (let i = 0; i < 2; i++) {
            const options = run.deck.filter(canUpgrade);
            if (options.length === 0) break;
            const card = options[Math.floor(rng() * options.length)];
            card.upgraded = true;
            names.push(CARDS[card.id].name);
          }
          return `정파의 정석 같은 검이었다. 몇 번 베였지만 배운 것이 있다.${names.length ? `\n『${names.join('』, 『')}』 연마.` : ''}`;
        },
      },
    ],
  },
  // 3구역: 불타는 관문 뒤에서 주노와 다시 만남
  junoGate: {
    story: true,
    npc: 'juno',
    intro: 'junoGate',
    zone: 2,
    minRow: 3,
    title: '관문 뒤의 주노',
    text: '연기 속에서 노인이 호리병을 흔든다.\n"백 일이 거의 다 됐군. 술 익을 때가 됐어."',
    options: [
      {
        label: '약을 받는다',
        hint: '체력 +25',
        effect(run) {
          const healed = heal(run, 25);
          return `노인이 내민 호리병의 술은 쓰고, 뜨거웠다. 체력을 ${healed} 회복했다.`;
        },
      },
      {
        label: '한 수 배운다',
        hint: '은자 -30 · 보물 하나',
        disabled: (run) => run.gold < 30 || JUNO_TEACHES.every((t) => run.treasures.includes(t)),
        effect(run, rng, api) {
          run.gold -= 30;
          const id = JUNO_TEACHES.find((t) => !run.treasures.includes(t));
          if (!id) return '"자네한테 더 가르칠 게 없구먼." 노인은 술값만 받아 갔다.';
          api.addTreasure(id);
          return `"잘 봐 두게. 두 번은 안 보여 줘." — 보물 『${TREASURES[id].name}』을(를) 얻었다.`;
        },
      },
    ],
  },
  herbSeller: {
    title: '약초 파는 노파',
    text: '등이 굽은 노파가 바구니 가득 약을 팔고 있다.\n"상처엔 금창약, 몸을 보하는 덴 소환단이라오. 소환단은 한 번 먹으면 평생 가지."',
    options: [
      {
        label: '소환단을 산다',
        hint: '은자 -45 · 보물(영약) 소환단: 최대 체력 +10',
        disabled: (run) => run.gold < 45 || run.treasures.includes('soHwan'),
        effect(run, rng, api) {
          run.gold -= 45;
          api.addTreasure('soHwan');
          return '쌉쌀한 환약을 삼키자 단전이 뜨거워졌다. 최대 체력이 10 늘었다.';
        },
      },
      {
        label: '금창약을 산다',
        hint: '은자 -25 · 행낭에 금창약 2개 (자리만큼)',
        disabled: (run) => run.gold < 25 || run.bag.length >= BAG_SIZE,
        effect(run, rng, api) {
          run.gold -= 25;
          const got = [api.addItem('geumchang'), api.addItem('geumchang')].filter(Boolean).length;
          return got
            ? `금창약 ${got}개를 행낭에 넣었다.`
            : '값은 치렀는데 행낭이 가득 차서 넣을 데가 없다… 노파가 혀를 찼다.';
        },
      },
      {
        label: '거절한다',
        hint: '아무 일도 없음',
        effect() {
          return '"아쉽구려." 노파는 다음 손님을 찾아 떠났다.';
        },
      },
    ],
  },
  bundle: {
    title: '수상한 보따리',
    text: '비무대 아래 그늘에 주인 없는 보따리가 놓여 있다.\n누군가 급히 두고 간 것 같다.',
    options: [
      {
        label: '열어 본다',
        hint: '행낭 물품 2개 · 함정일 수도',
        effect(run, rng, api) {
          const names = [];
          for (let i = 0; i < 2; i++) {
            const id = api.randomItem();
            if (api.addItem(id)) names.push(CONSUMABLES[id].name);
          }
          let text = names.length ? `${names.join(', ')}을(를) 챙겼다.` : '쓸 만한 게 있었지만 행낭이 가득 찼다.';
          if (rng() < 0.35) {
            damage(run, 7);
            text = `매듭에 숨겨진 독침에 찔렸다! 체력 -7.\n그래도 ${text}`;
          }
          return text;
        },
      },
      {
        label: '손대지 않는다',
        hint: '아무 일도 없음',
        effect() {
          return '남의 물건에 손댈 이유는 없다.';
        },
      },
    ],
  },
  cave: {
    title: '수련동',
    text: '산비탈에 이끼 낀 동굴이 있다. 벽에 검흔이 가득하다.\n누군가 오래 수련한 자리다.',
    options: [
      {
        label: '명상한다',
        hint: '기본 검법 1장 제거 · 체력 +8',
        effect(run, rng, api) {
          const removed = api.removeFirst('strike');
          heal(run, 8);
          return removed
            ? '잡념을 비웠다. 덱에서 기본 검법 1장을 덜어 내고, 체력을 8 회복했다.'
            : '마음을 가다듬으니 체력이 8 회복되었다.';
        },
      },
      {
        label: '검흔을 따라 수련한다',
        hint: '체력 -8 · 무작위 카드 2장 연마',
        effect(run, rng) {
          damage(run, 8);
          const names = [];
          for (let i = 0; i < 2; i++) {
            const options = run.deck.filter(canUpgrade);
            if (options.length === 0) break;
            const card = options[Math.floor(rng() * options.length)];
            card.upgraded = true;
            names.push(CARDS[card.id].name);
          }
          return names.length
            ? `몸이 부서질 듯했지만 『${names.join('』, 『')}』을(를) 연마했다.`
            : '더 연마할 것이 없었다. 체력만 잃었다.';
        },
      },
      {
        label: '떠난다',
        hint: '아무 일도 없음',
        effect() {
          return '갈 길이 바쁘다.';
        },
      },
    ],
  },
};

export const EVENT_IDS = Object.keys(EVENTS);
