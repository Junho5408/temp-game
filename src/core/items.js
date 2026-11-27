// 아이템 두 종류
//
// 1) 행낭(行囊) 물품 — 일시적. 전투 중에 한 번 쓰면 사라짐. 최대 BAG_SIZE 개까지 들고 다님
//    내공을 쓰지 않고, 내 차례에만 사용
// 2) 보물(寶物) — 영구적. 얻은 순간부터 그 판이 끝날 때까지 계속 효과
//    kind: elixir(영약 — 먹으면 몸에 남는 약) / art(비급 — 몸에 익힌 심법·비결) / gear(보구 — 몸에 지니는 물건)
//    효과는 battle.js / run.js 가 id 로 확인해서 적용 (아래 desc 와 같은 내용)
//
// rarity: common / uncommon / rare / boss(두목 보상 전용)

export const BAG_SIZE = 3;

export const CONSUMABLES = {
  geumchang: {
    name: '금창약', glyph: '瘡', rarity: 'common',
    desc: '체력 15 회복', heal: 15,
  },
  antidote: {
    name: '해독산', glyph: '解', rarity: 'common',
    desc: '중독·내상·흐트러짐을 모두 푼다', cleanse: true,
  },
  smoke: {
    name: '연막탄', glyph: '煙', rarity: 'common',
    desc: '경공 +5', evasion: 5,
  },
  flyingDagger: {
    name: '비도', glyph: '刀', rarity: 'common',
    desc: '피해 10 (필중)', damage: 10,
  },
  poisonNeedle: {
    name: '독침', glyph: '針', rarity: 'common',
    desc: '적에게 중독 6', poison: 6,
  },
  ginseng: {
    name: '홍삼편', glyph: '蔘', rarity: 'uncommon',
    desc: '내공 +2', energy: 2,
  },
  pointNeedle: {
    name: '점혈침', glyph: '穴', rarity: 'uncommon',
    desc: '점혈 +10', point: 10,
  },
  wakeHerb: {
    name: '성신초', glyph: '醒', rarity: 'uncommon',
    desc: '카드 3장 뽑기', draw: 3,
  },
  thunderBomb: {
    name: '벽력탄', glyph: '雷', rarity: 'rare',
    desc: '피해 20 (필중)', damage: 20,
  },
};

export const TREASURE_KIND = { elixir: '영약', art: '비급', gear: '보구' };

export const TREASURES = {
  // ── 영약: 먹으면 몸에 남는다 ─────────────────
  soHwan: {
    name: '소환단', glyph: '丹', kind: 'elixir', rarity: 'common',
    desc: '최대 체력 +10, 체력 10 회복', maxHp: 10,
  },
  stoneMilk: {
    name: '공청석유', glyph: '乳', kind: 'elixir', rarity: 'uncommon',
    desc: '전투 시작 시 기세 +1',
  },
  snowLotus: {
    name: '천산설련', glyph: '蓮', kind: 'elixir', rarity: 'uncommon',
    desc: '전투에서 이길 때마다 체력 6 회복',
  },
  daeHwan: {
    name: '대환단', glyph: '還', kind: 'elixir', rarity: 'boss',
    desc: '최대 내공 +1',
  },

  // ── 비급: 몸에 익힌 심법·비결 ─────────────────
  taiji: {
    name: '태극심법', glyph: '極', kind: 'art', rarity: 'uncommon',
    desc: '매 턴 시작 시 경공 +1',
  },
  meridianChart: {
    name: '혈도도해', glyph: '圖', kind: 'art', rarity: 'common',
    desc: '점혈을 거는 카드의 점혈 +3',
  },
  chainArt: {
    name: '연환결', glyph: '環', kind: 'art', rarity: 'common',
    desc: '연계 상태에서 쓰는 초식의 피해 +2 (한 타마다)',
  },
  drunkenFist: {
    name: '취팔선 비결', glyph: '醉', kind: 'art', rarity: 'uncommon',
    desc: '빗나간 뒤 다음 초식은 빗나간 횟수 × 3 피해가 더해짐',
  },
  farSight: {
    name: '천리안', glyph: '眼', kind: 'art', rarity: 'rare',
    desc: '전투 첫 턴에 간파 1',
  },
  poisonProof: {
    name: '만독불침', glyph: '毒', kind: 'art', rarity: 'uncommon',
    desc: '중독에 걸리지 않는다',
  },

  // ── 보구: 몸에 지니는 물건 ─────────────────
  silkArmor: {
    name: '천잠보의', glyph: '衣', kind: 'gear', rarity: 'rare',
    desc: '전투마다 처음 맞는 일격을 무효로 한다',
  },
  mirror: {
    name: '호심경', glyph: '鏡', kind: 'gear', rarity: 'common',
    desc: '적의 치명타를 받지 않는다',
  },
  // ── 사파 고유 ─────────────────
  gangSeal: {
    name: '흑도 인장', glyph: '印', kind: 'gear', rarity: 'common', faction: 'unorthodox',
    desc: '전투에서 이길 때마다 은자 +8',
  },
  poisonSac: {
    name: '독낭', glyph: '囊', kind: 'gear', rarity: 'uncommon', faction: 'unorthodox',
    desc: '적에게 거는 중독 +2',
  },
  blueSteel: {
    name: '청강검', glyph: '鋼', kind: 'gear', rarity: 'uncommon',
    desc: '치명 확률 +10%',
  },
};

for (const [id, it] of Object.entries(CONSUMABLES)) it.id = id;
for (const [id, it] of Object.entries(TREASURES)) it.id = id;

export function consumablesByRarity(rarity) {
  return Object.values(CONSUMABLES).filter((c) => c.rarity === rarity).map((c) => c.id);
}

export function treasuresByRarity(rarity) {
  return Object.values(TREASURES).filter((t) => t.rarity === rarity).map((t) => t.id);
}
