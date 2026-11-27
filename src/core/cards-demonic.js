// 7-C 무공 확장 (demonic). cards.js 의 CARDS 에 합쳐짐 — 필드 설명은 cards.js 맨 위와 battle.js 주석
export const DEMONIC_CARDS_EXT = {
  // ── 혈공: 피를 내주고 세게 (체력 대가) ──
  dBloodFang: {
    name: '혈아', type: 'attack', rarity: 'common', glyph: '牙', faction: 'demonic',
    cost: 1, hpCost: 2, damage: 8,
    upgrade: { damage: 10 },
  },
  dRedTide: {
    name: '적조참', type: 'attack', rarity: 'common', glyph: '潮', faction: 'demonic',
    cost: 2, hpCost: 4, damage: 16,
    upgrade: { damage: 19 },
  },
  dCrimsonPalm: {
    name: '혈수장', type: 'attack', rarity: 'common', glyph: '掌', faction: 'demonic',
    cost: 1, hpCost: 3, damage: 5, hits: 2,
    upgrade: { damage: 6 },
  },
  dRendFlesh: {
    name: '열혈참', type: 'attack', rarity: 'common', glyph: '裂', faction: 'demonic',
    cost: 2, hpCost: 3, damage: 6, hits: 2, magi: 1,
    upgrade: { damage: 8 },
  },
  dBloodVow: {
    name: '혈약', type: 'skill', rarity: 'common', glyph: '約', faction: 'demonic',
    cost: 1, hpCost: 4, strength: 2,
    upgrade: { strength: 3 },
  },
  dBloodChant: {
    name: '혈주', type: 'skill', rarity: 'common', glyph: '呪', faction: 'demonic',
    cost: 0, hpCost: 2, energy: 1,
    upgrade: { draw: 1 },
  },
  dBloodVein: {
    name: '혈맥 개방', type: 'skill', rarity: 'common', glyph: '脈', faction: 'demonic',
    cost: 1, hpCost: 3, draw: 3, magi: 1,
    upgrade: { draw: 4 },
  },
  dSlaughter: {
    name: '혈살', type: 'attack', rarity: 'uncommon', glyph: '殺', faction: 'demonic',
    cost: 1, hpCost: 4, damage: 6, hits: 2,
    upgrade: { damage: 8 },
  },
  dSkyCleave: {
    name: '혈천참', type: 'attack', rarity: 'uncommon', glyph: '天', faction: 'demonic',
    cost: 2, hpCost: 6, damage: 19,
    upgrade: { damage: 26 },
  },
  dCrimsonVeil: {
    name: '혈갑', type: 'skill', rarity: 'uncommon', glyph: '甲', faction: 'demonic',
    cost: 1, hpCost: 2, evasion: 6,
    upgrade: { evasion: 8 },
  },
  dBloodGod: {
    name: '혈신', type: 'skill', rarity: 'rare', glyph: '神', faction: 'demonic',
    cost: 0, hpCost: 6, strength: 2, energy: 1, curse: 1,
    upgrade: { strength: 4 },
  },

  // ── 흡혈: 체력 대가 없이 피를 되찾음 ──
  dSeizeBlood: {
    name: '탈혈장', type: 'attack', rarity: 'common', glyph: '奪', faction: 'demonic',
    cost: 1, damage: 5, lifesteal: 0.5,
    upgrade: { damage: 7 },
  },
  dSoulSip: {
    name: '흡혼', type: 'attack', rarity: 'common', glyph: '魂', faction: 'demonic',
    cost: 0, damage: 2, lifesteal: 0.5,
    upgrade: { damage: 4 },
  },
  dWolfDrain: {
    name: '혈랑조', type: 'attack', rarity: 'common', glyph: '狼', faction: 'demonic',
    cost: 2, damage: 4, hits: 2, lifesteal: 0.5, magi: 1,
    upgrade: { damage: 5 },
  },
  dBoneBreak: {
    name: '쇄골수', type: 'attack', rarity: 'common', glyph: '骨', faction: 'demonic',
    cost: 1, damage: 4, vulnerable: 2, lifesteal: 0.5,
    upgrade: { damage: 5, vulnerable: 3 },
  },
  dDrainAura: {
    name: '흡혈강기', type: 'attack', rarity: 'uncommon', glyph: '罡', faction: 'demonic',
    cost: 2, damage: 6, hits: 2, lifesteal: 0.5,
    upgrade: { damage: 8 },
  },
  dSoulDevour: {
    name: '천마흡혼', type: 'attack', rarity: 'rare', glyph: '魄', faction: 'demonic',
    cost: 2, damage: 10, lifesteal: 0.5, curse: 1,
    upgrade: { damage: 12 },
  },

  // ── 혈투: 벼랑 끝에서 몰아치기 ──
  dDeathGrip: {
    name: '필사수', type: 'attack', rarity: 'common', glyph: '死', faction: 'demonic',
    cost: 1, damage: 4, desperate: 6, lifesteal: 0.5,
    upgrade: { damage: 5, desperate: 8 },
  },
  dRedRain: {
    name: '혈우', type: 'attack', rarity: 'common', glyph: '雨', faction: 'demonic',
    cost: 1, damage: 2, hits: 3, desperate: 2,
    upgrade: { damage: 3, desperate: 3 },
  },
  dFatalClaw: {
    name: '절명조', type: 'attack', rarity: 'uncommon', glyph: '絶', faction: 'demonic',
    cost: 1, damage: 4, desperate: 8, sure: true,
    upgrade: { damage: 5, desperate: 10 },
  },
  dNarrowEscape: {
    name: '구사일생', type: 'attack', rarity: 'rare', glyph: '生', faction: 'demonic',
    cost: 2, damage: 5, hits: 2, desperate: 7, lifesteal: 0.5,
    upgrade: { damage: 6 },
  },

  // ── 혈계: 잃은 체력이 곧 힘 (bloodPact) ──
  dScarBlade: {
    name: '상흔검', type: 'attack', rarity: 'common', glyph: '痕', faction: 'demonic',
    cost: 1, damage: 4, bloodPact: 2,
    upgrade: { damage: 4, bloodPact: 3 },
  },
  dWoundFist: {
    name: '혈계권', type: 'attack', rarity: 'common', glyph: '拳', faction: 'demonic',
    cost: 0, hpCost: 2, damage: 4, bloodPact: 1,
    upgrade: { damage: 5 },
  },
  dPactBlade: {
    name: '혈맹검', type: 'attack', rarity: 'uncommon', glyph: '盟', faction: 'demonic',
    cost: 2, damage: 5, hits: 2, bloodPact: 2,
    upgrade: { damage: 7 },
  },
  dBloodDebt: {
    name: '혈채', type: 'attack', rarity: 'uncommon', glyph: '債', faction: 'demonic',
    cost: 1, hpCost: 3, damage: 5, bloodPact: 2,
    upgrade: { bloodPact: 3 },
  },
  dBloodWhip: {
    name: '혈편', type: 'attack', rarity: 'uncommon', glyph: '鞭', faction: 'demonic',
    cost: 1, damage: 2, hits: 2, bloodPact: 1, lifesteal: 0.5,
    upgrade: { damage: 3 },
  },
  dBloodCalamity: {
    name: '혈겁', type: 'attack', rarity: 'rare', glyph: '劫', faction: 'demonic',
    cost: 2, damage: 7, hits: 2, bloodPact: 3, curse: 1,
    upgrade: { damage: 9 },
  },
  dLastDrop: {
    name: '혈진', type: 'attack', rarity: 'rare', glyph: '盡', faction: 'demonic',
    cost: 1, hpCost: 5, damage: 9, bloodPact: 3,
    upgrade: { damage: 11 },
  },

  // ── 입마 연료: 손패의 입마를 태워 위력으로 (consumeCurse) ──
  dCurseFlare: {
    name: '마염', type: 'attack', rarity: 'common', glyph: '炎', faction: 'demonic',
    cost: 1, damage: 4, consumeCurse: 4,
    upgrade: { damage: 5, consumeCurse: 5 },
  },
  dCurseFeast: {
    name: '마식', type: 'attack', rarity: 'uncommon', glyph: '食', faction: 'demonic',
    cost: 1, damage: 5, consumeCurse: 5, lifesteal: 0.5,
    upgrade: { damage: 6, consumeCurse: 7 },
  },
  dCurseBurn: {
    name: '마연참', type: 'attack', rarity: 'uncommon', glyph: '燃', faction: 'demonic',
    cost: 2, damage: 9, consumeCurse: 7,
    upgrade: { damage: 11, consumeCurse: 9 },
  },
  dCurseGreed: {
    name: '탐마수', type: 'attack', rarity: 'uncommon', glyph: '貪', faction: 'demonic',
    cost: 0, damage: 3, consumeCurse: 4, magi: 1,
    upgrade: { damage: 4, consumeCurse: 5 },
  },
  dDemonEye: {
    name: '마안 개방', type: 'skill', rarity: 'uncommon', glyph: '眼', faction: 'demonic',
    cost: 0, magi: 3, draw: 1, curse: 1,
    upgrade: { draw: 2 },
  },
  dCurseGnaw: {
    name: '식마대법', type: 'attack', rarity: 'rare', glyph: '噬', faction: 'demonic',
    cost: 1, damage: 7, hits: 1, consumeCurse: 9,
    upgrade: { damage: 9 },
  },
  dGhostCleave: {
    name: '입마광참', type: 'attack', rarity: 'rare', glyph: '鬼', faction: 'demonic',
    cost: 2, damage: 12, consumeCurse: 10, sure: true,
    upgrade: { damage: 17 },
  },

  // ── 마기: 쌓고 터뜨리기 ──
  dMagiSpark: {
    name: '마화', type: 'attack', rarity: 'common', glyph: '火', faction: 'demonic',
    cost: 0, damage: 2, magi: 2,
    upgrade: { damage: 3, magi: 3 },
  },
  dMagiEdge: {
    name: '마기참', type: 'attack', rarity: 'common', glyph: '刃', faction: 'demonic',
    cost: 1, damage: 3, magiSpend: 2, draw: 1,
    upgrade: { magiSpend: 3 },
  },
  dDarkFocus: {
    name: '마심 집중', type: 'skill', rarity: 'common', glyph: '念', faction: 'demonic',
    cost: 1, magi: 2, weak: 2,
    upgrade: { magi: 3, weak: 3 },
  },
  dShadowStep: {
    name: '혈영보', type: 'skill', rarity: 'common', glyph: '影', faction: 'demonic',
    cost: 1, evasion: 3, magi: 1,
    upgrade: { evasion: 4, magi: 2 },
  },
  dMagiSurge: {
    name: '마도', type: 'attack', rarity: 'uncommon', glyph: '濤', faction: 'demonic',
    cost: 2, damage: 4, hits: 2, magiSpend: 1,
    upgrade: { damage: 5 },
  },
  dMagiAmplify: {
    name: '마기 증폭', type: 'skill', rarity: 'uncommon', glyph: '增', faction: 'demonic',
    cost: 1, magiDouble: true, draw: 1, curse: 1,
    upgrade: { cost: 0 },
  },
  dMagiRelease: {
    name: '마기 해방', type: 'attack', rarity: 'rare', glyph: '放', faction: 'demonic',
    cost: 2, damage: 4, hits: 2, magiSpend: 2, curse: 1,
    upgrade: { damage: 6 },
  },
  dReturnOrigin: {
    name: '정마귀원', type: 'skill', rarity: 'rare', glyph: '元', faction: 'demonic',
    cost: 1, purge: true, magiDouble: true, exhaust: true,
    upgrade: { cost: 0 },
  },

  // ── 심법 유지: 매 턴 마기가 차오름 (power) ──
  dMagiCycle: {
    name: '마기 순환', type: 'skill', rarity: 'uncommon', glyph: '環', faction: 'demonic',
    cost: 1, power: { magi: 1 },
    upgrade: { cost: 0 },
  },
  dBloodShadowArt: {
    name: '혈영신공', type: 'skill', rarity: 'uncommon', glyph: '幻', faction: 'demonic',
    cost: 1, hpCost: 3, power: { magi: 1, evasion: 1 },
    upgrade: { power: { magi: 2, evasion: 1 } },
  },
  dUndyingDemon: {
    name: '천마불멸공', type: 'skill', rarity: 'rare', glyph: '滅', faction: 'demonic',
    cost: 2, power: { magi: 2, strength: 1 }, curse: 1,
    upgrade: { cost: 1 },
  },
};
