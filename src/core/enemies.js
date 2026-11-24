// 적 정의 (1구역: 후기지수 비무대회)
// pattern 은 순서대로 반복되는 행동 목록. 다음 행동은 전투 화면에서 미리 예고됨.
// 행동 type: attack(damage, hits) / defend(block) / attack_defend(damage, block)
export const ENEMIES = {
  ironDisciple: {
    id: 'ironDisciple',
    name: '곽진',
    title: '철검문 후기지수',
    sprite: 'ironDisciple',
    maxHp: 42,
    pattern: [
      { type: 'attack', name: '철검 내려치기', damage: 7 },
      { type: 'defend', name: '철벽세', block: 8 },
      { type: 'attack', name: '철검 일격', damage: 11 },
    ],
  },
  spearMaiden: {
    id: 'spearMaiden',
    name: '연화',
    title: '홍창방 후기지수',
    sprite: 'spearMaiden',
    maxHp: 36,
    pattern: [
      { type: 'attack', name: '연환창', damage: 4, hits: 2 },
      { type: 'attack_defend', name: '회창 막기', damage: 6, block: 5 },
      { type: 'attack', name: '이화난무', damage: 3, hits: 4 },
    ],
  },
};

export const ENEMY_IDS = Object.keys(ENEMIES);
