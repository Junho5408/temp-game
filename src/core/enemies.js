// 적 정의 (1구역: 후기지수 비무대회)
// pattern 은 순서대로 반복되는 행동 목록. 다음 행동은 전투 화면에서 미리 예고됨.
// 행동 type: attack(damage, hits) / defend(block) / attack_defend(damage, block)
// sprite 는 src/ui/characters.js 의 디자인 키 (세력-계열)
export const ENEMIES = {
  ironFist: {
    id: 'ironFist',
    name: '곽진',
    title: '철권문 후기지수',
    sprite: 'orthodox-fist',
    maxHp: 42,
    pattern: [
      { type: 'attack', name: '철권 내려치기', damage: 7 },
      { type: 'defend', name: '철벽세', block: 8 },
      { type: 'attack', name: '붕산권', damage: 11 },
    ],
  },
  ronin: {
    id: 'ronin',
    name: '마철',
    title: '비무대에 끼어든 낭인',
    sprite: 'unorthodox-sword',
    maxHp: 36,
    pattern: [
      { type: 'attack', name: '쾌검 이연격', damage: 4, hits: 2 },
      { type: 'attack_defend', name: '흘려베기', damage: 6, block: 5 },
      { type: 'attack', name: '난도질', damage: 3, hits: 4 },
    ],
  },
};

export const ENEMY_IDS = Object.keys(ENEMIES);
