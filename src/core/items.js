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
    name: '혈도도해', glyph: '圖', kind: 'art', rarity: 'common', faction: 'orthodox', // 점혈은 정파 무공에만
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
    desc: '적에게 거는 중독 +1',
  },
  knifePouch: {
    name: '암기 주머니', glyph: '袋', kind: 'gear', rarity: 'common', faction: 'unorthodox',
    desc: '암기가 던져질 때 피해 +3',
  },
  // ── 마교 고유 ─────────────────
  bloodJade: {
    name: '천마 혈옥', glyph: '玉', kind: 'gear', rarity: 'uncommon', faction: 'demonic',
    desc: '체력을 대가로 쓰는 무공의 피해 +3',
  },
  demonMask: {
    name: '마령 가면', glyph: '面', kind: 'gear', rarity: 'common', faction: 'demonic',
    desc: '전투 첫 턴에 적에게 흐트러짐 2',
  },
  magiOrb: {
    name: '마령주', glyph: '珠', kind: 'gear', rarity: 'uncommon', faction: 'demonic',
    desc: '전투를 마기 3 으로 시작',
  },
  blueSteel: {
    name: '청강검', glyph: '鋼', kind: 'gear', rarity: 'uncommon',
    desc: '치명 확률 +10%',
  },
  // ── 7-D 공용 ──
  tigerBoneWine: {
    name: '호골주', glyph: '酒', kind: 'elixir', rarity: 'common',
    desc: '최대 체력 +6, 운기조식 회복 +4', fx: { maxHp: 6, restBonus: 4 },
  },
  fleeceFlower: {
    name: '하수오', glyph: '烏', kind: 'elixir', rarity: 'common',
    desc: '전투에서 이길 때마다 체력 3 회복', fx: { winHeal: 3 },
  },
  oldMoneyBelt: {
    name: '낡은 전대', glyph: '帶', kind: 'gear', rarity: 'common',
    desc: '얻을 때 은자 +50', fx: { gold: 50 },
  },
  wardCharm: {
    name: '호신부', glyph: '符', kind: 'gear', rarity: 'common',
    desc: '전투 첫 턴에 적에게 흐트러짐 1', fx: { startEnemy: { weak: 1 } },
  },
  whetstone: {
    name: '숫돌', glyph: '砥', kind: 'gear', rarity: 'common',
    desc: '모든 초식 한 타마다 피해 +1', fx: { attackBonus: 1 },
  },
  clearIncense: {
    name: '청심향', glyph: '香', kind: 'gear', rarity: 'common',
    desc: '전투 첫 턴에 무공 1장 더 뽑기', fx: { startStatus: { draw: 1 } },
  },
  aimingArt: {
    name: '조준결', glyph: '準', kind: 'art', rarity: 'common',
    desc: '초식 명중 +10%', fx: { accuracyBonus: 10 },
  },
  turtleBreath: {
    name: '귀식대법', glyph: '龜', kind: 'art', rarity: 'uncommon',
    desc: '운기조식 회복 +10', fx: { restBonus: 10 },
  },
  twinDragonTag: {
    name: '쌍룡패', glyph: '雙', kind: 'gear', rarity: 'uncommon',
    desc: '전투 첫 턴에 기세 +1, 내공 +1', fx: { startStatus: { strength: 1, energy: 1 } },
  },
  eagleGlove: {
    name: '응조 장갑', glyph: '爪', kind: 'gear', rarity: 'uncommon',
    desc: '치명 확률 +10%, 명중 +5%', fx: { critBonus: 10, accuracyBonus: 5 },
  },
  breachArt: {
    name: '파진결', glyph: '破', kind: 'art', rarity: 'uncommon',
    desc: '전투 첫 턴에 적에게 내상 2', fx: { startEnemy: { vulnerable: 2 } },
  },
  spiritMushroom: {
    name: '자색 영지', glyph: '芝', kind: 'elixir', rarity: 'uncommon',
    desc: '최대 체력 +12, 이길 때마다 체력 2 회복', fx: { maxHp: 12, winHeal: 2 },
  },
  merchantLedger: {
    name: '상인 장부', glyph: '簿', kind: 'gear', rarity: 'uncommon',
    desc: '객잔 값 20% 할인', fx: { shopDiscount: 0.2 },
  },
  violetQi: {
    name: '자하신공', glyph: '紫', kind: 'art', rarity: 'rare',
    desc: '매 턴 시작 시 기세 +1', fx: { turnStatus: { strength: 1 } },
  },
  fireCarp: {
    name: '천년 화리', glyph: '鯉', kind: 'elixir', rarity: 'rare',
    desc: '최대 체력 +16, 이길 때마다 체력 4 회복', fx: { maxHp: 16, winHeal: 4 },
  },
  cursedBlade: {
    name: '흉도', glyph: '凶', kind: 'gear', rarity: 'rare',
    desc: '최대 체력 -8, 모든 초식 한 타 +3', fx: { maxHp: -8, attackBonus: 3 },
  },

  // ── 7-D 정파 ──
  craneShoes: {
    name: '운학화', glyph: '鶴', kind: 'gear', rarity: 'common', faction: 'orthodox',
    desc: '전투 첫 턴에 경공 +1, 무공 1장 더', fx: { startStatus: { evasion: 1, draw: 1 } },
  },
  bronzeFigure: {
    name: '점혈 동인', glyph: '銅', kind: 'gear', rarity: 'common', faction: 'orthodox',
    desc: '전투 첫 턴에 적 점혈 +4', fx: { startEnemy: { point: 4 } },
  },
  swordTassel: {
    name: '검수', glyph: '穗', kind: 'gear', rarity: 'common', faction: 'orthodox',
    desc: '연계 중 한 타 +1, 명중 +5%', fx: { comboBonus: 1, accuracyBonus: 5 },
  },
  driftingCloud: {
    name: '유운신법', glyph: '雲', kind: 'art', rarity: 'uncommon', faction: 'orthodox',
    desc: '전투 첫 턴에 경공 +2, 내공 +1', fx: { startStatus: { evasion: 2, energy: 1 } },
  },
  soulChaseArt: {
    name: '추풍 검결', glyph: '追', kind: 'art', rarity: 'uncommon', faction: 'orthodox',
    desc: '연계 중 한 타 +2, 명중 +10%', fx: { comboBonus: 2, accuracyBonus: 10 },
  },
  pureSwordArt: {
    name: '태청 검결', glyph: '淸', kind: 'art', rarity: 'rare', faction: 'orthodox',
    desc: '첫 턴 적 점혈 +3, 매 턴 점혈 +1', fx: { startEnemy: { point: 3 }, turnEnemy: { point: 1 } },
  },
  mirrorHeart: {
    name: '명경지심', glyph: '明', kind: 'art', rarity: 'boss', faction: 'orthodox',
    desc: '매 턴 간파 1, 모든 초식 한 타 +1', fx: { turnStatus: { insight: 1 }, attackBonus: 1 },
  },

  // ── 7-D 사파 ──
  ironCaltropBelt: {
    name: '철질려 전대', glyph: '鐵', kind: 'gear', rarity: 'common', faction: 'unorthodox',
    desc: '암기 피해 +2, 얻을 때 은자 +25', fx: { thrownBonus: 2, gold: 25 },
  },
  scorpionVial: {
    name: '전갈 독병', glyph: '蝎', kind: 'gear', rarity: 'common', faction: 'unorthodox',
    desc: '전투 첫 턴에 적에게 중독 4', fx: { startEnemy: { poison: 4 } },
  },
  goldToad: {
    name: '금두꺼비', glyph: '蟾', kind: 'gear', rarity: 'common', faction: 'unorthodox',
    desc: '은자 60 이상이면 한 타 +2', fx: { richBonus: 2 },
  },
  trapManual: {
    name: '기관 비록', glyph: '機', kind: 'art', rarity: 'uncommon', faction: 'unorthodox',
    desc: '함정 피해 +4, 암기 피해 +1', fx: { trapBonus: 4, thrownBonus: 1 },
  },
  shadeWindArt: {
    name: '음풍 비결', glyph: '陰', kind: 'art', rarity: 'uncommon', faction: 'unorthodox',
    desc: '첫 턴 적 흐트러짐 1, 약화된 적에 한 타 +2', fx: { startEnemy: { weak: 1 }, debuffBonus: 2 },
  },
  thousandHandPoison: {
    name: '천수 독경', glyph: '經', kind: 'art', rarity: 'rare', faction: 'unorthodox',
    desc: '매 턴 시작 시 적에게 중독 1', fx: { turnEnemy: { poison: 1 } },
  },
  ghostKingHarness: {
    name: '귀왕 비도갑', glyph: '鬼', kind: 'gear', rarity: 'boss', faction: 'unorthodox',
    desc: '매 턴 적에게 흐트러짐 1, 암기 피해 +2 (살수 아니면 초식 한 타 +1)', fx: { turnEnemy: { weak: 1 }, thrownBonus: 2, nonThrowerAttack: 1 },
  },

  // ── 7-D 마교 ──
  bloodBeads: {
    name: '혈염주', glyph: '念', kind: 'gear', rarity: 'common', faction: 'demonic',
    desc: '전투를 마기 2 로 시작', fx: { startMagi: 2 },
  },
  frenzyTalisman: {
    name: '광혈부', glyph: '狂', kind: 'gear', rarity: 'common', faction: 'demonic',
    desc: '체력 절반 이하면 한 타 +2', fx: { desperateBonus: 2 },
  },
  batFang: {
    name: '박쥐 이빨', glyph: '蝠', kind: 'gear', rarity: 'common', faction: 'demonic',
    desc: '흡혈 +20%, 이길 때마다 체력 2 회복', fx: { lifestealBonus: 0.2, winHeal: 2 },
  },
  madnessSutra: {
    name: '입마 경문', glyph: '魔', kind: 'art', rarity: 'uncommon', faction: 'demonic',
    desc: '입마 대가 때 마기 +2 더(1장당 +3), 시작 마기 1', fx: { curseMagi: 2, startMagi: 1 },
  },
  demonBloodPill: {
    name: '마혈단', glyph: '血', kind: 'elixir', rarity: 'uncommon', faction: 'demonic',
    desc: '최대 체력 -8, 체력 절반 이하면 한 타 +4', fx: { maxHp: -8, desperateBonus: 4 },
  },
  heavenDemonSutra: {
    name: '천마 혈경', glyph: '天', kind: 'art', rarity: 'rare', faction: 'demonic',
    desc: '매 턴 시작 시 마기 +1', fx: { turnStatus: { magi: 1 } },
  },
  demonGodSeal: {
    name: '마신 혈인', glyph: '神', kind: 'art', rarity: 'boss', faction: 'demonic',
    desc: '최대 체력 -5, 매 턴 기세 +1·마기 +1', fx: { maxHp: -5, turnStatus: { strength: 1, magi: 1 } },
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
