// 카드 정의
// type: attack(초식) / defense(호신강기) / skill(심법·보법)
// 효과 필드: damage(피해), hits(타수, 기본 1), block(호신강기), draw(카드 뽑기)
export const CARDS = {
  strike: {
    id: 'strike',
    name: '기본 검법',
    type: 'attack',
    glyph: '劍',
    cost: 1,
    damage: 6,
    desc: '피해 6',
  },
  guard: {
    id: 'guard',
    name: '호신강기',
    type: 'defense',
    glyph: '氣',
    cost: 1,
    block: 5,
    desc: '호신강기 5',
  },
  yusu: {
    id: 'yusu',
    name: '유수검',
    type: 'attack',
    glyph: '流',
    cost: 2,
    damage: 9,
    block: 4,
    desc: '피해 9\n호신강기 4',
  },
};

// 검객 시작 덱: 기본 검법 5 + 호신강기 4 + 특수 초식 1
export const STARTER_DECK = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'guard', 'guard', 'guard', 'guard',
  'yusu',
];

export function describeCard(id) {
  return CARDS[id].desc;
}
