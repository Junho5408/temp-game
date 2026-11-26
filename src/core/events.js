// 기연 (지도의 ? 칸): 선택지가 있는 짧은 사건
// option.effect(run, rng) 는 run 상태를 바꾸고 결과 문장을 돌려줌
import { CARDS, canUpgrade, cardsByRarity } from './cards.js';

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
    title: '떨어진 비급',
    text: '비무대 뒤편 수풀 속에 낡은 책 한 권이 떨어져 있다.\n누군가 일부러 숨겨 둔 것 같기도 하다.',
    options: [
      {
        label: '집어 든다',
        hint: '고급 비급 1장 얻음 · 체력 -6',
        effect(run, rng, api) {
          const pool = cardsByRarity('uncommon');
          const id = pool[Math.floor(rng() * pool.length)];
          api.addCard(id);
          damage(run, 6);
          return `숨어 있던 암기에 손을 베였지만, 『${CARDS[id].name}』 비급을 손에 넣었다.`;
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
  drunkMaster: {
    title: '취한 노고수',
    text: '객잔 앞에서 술에 취한 노인이 손짓한다.\n"젊은이, 나와 내기 한 판 어떤가? 이기면 은자를 주지."',
    options: [
      {
        label: '내기에 응한다',
        hint: '절반 확률로 은자 +60, 아니면 체력 -10',
        effect(run, rng) {
          if (rng() < 0.5) {
            run.gold += 60;
            return '노인의 허점을 찔렀다. "허허, 제법이군!" 은자 60냥을 얻었다.';
          }
          damage(run, 10);
          return '노인의 지팡이가 번개처럼 날아왔다. 체력을 10 잃었다.';
        },
      },
      {
        label: '술을 한 잔 대접한다',
        hint: '은자 -20 · 무작위 카드 1장 연마',
        disabled: (run) => run.gold < 20,
        effect(run, rng) {
          run.gold -= 20;
          const options = run.deck.filter(canUpgrade);
          if (options.length === 0) return '노인은 술만 마시고 코를 골았다.';
          const card = options[Math.floor(rng() * options.length)];
          card.upgraded = true;
          return `노인이 취중에 한 수를 일러 주었다. 『${CARDS[card.id].name}』이(가) 연마되었다.`;
        },
      },
      {
        label: '지나간다',
        hint: '아무 일도 없음',
        effect() {
          return '노인은 혀를 차며 다시 술잔을 들었다.';
        },
      },
    ],
  },
  herbSeller: {
    title: '약초 파는 노파',
    text: '등이 굽은 노파가 바구니 가득 약초를 팔고 있다.\n"기혈을 보하는 귀한 것이라오."',
    options: [
      {
        label: '산다',
        hint: '은자 -30 · 최대 체력 +5, 체력 +5',
        disabled: (run) => run.gold < 30,
        effect(run) {
          run.gold -= 30;
          run.maxHp += 5;
          heal(run, 5);
          return '쌉쌀한 약초를 씹자 단전이 따뜻해졌다. 최대 체력이 5 늘었다.';
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
