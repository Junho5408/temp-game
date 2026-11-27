// 8-E 밸런스 (QA qa-20261127-1430 · BUG-056~062, 사용자 승인 "추천 방안으로")
// 류파 재편 뒤 같은 계열 안 류파 격차를 줄이는 수치 조정. cards.js 가 류파 재편 다음에 한 번 적용.
// 규칙: 류파 카드 전체에 같은 폭으로 (연마 값도 같이) — QA 실험(qa-output/.../exp/mods.mjs)과 같은 식
export function applyBalance8E(CARDS) {
  const school = (s, f) => {
    for (const c of Object.values(CARDS)) {
      if (c.school !== s || c.retired) continue;
      f(c, false);
      if (c.upgrade) f(c.upgrade, true);
    }
  };
  const set = (id, patch, up) => {
    Object.assign(CARDS[id], patch);
    if (up) CARDS[id].upgrade = { ...CARDS[id].upgrade, ...up };
  };

  // BUG-056 마교: 독혈 흡혈 0.5→0.4·0.75→0.6, 혈영대·혈수 체력 대가 -2(최소 1), 혈수 혈계 +1
  school('dokhyeol', (c) => {
    if (c.lifesteal === 0.5) c.lifesteal = 0.4;
    if (c.lifesteal === 0.75) c.lifesteal = 0.6;
  });
  school('hyeolyeong', (c, up) => { if (!up && c.hpCost) c.hpCost = Math.max(1, c.hpCost - 2); });
  school('hyeolsu', (c, up) => {
    if (!up && c.hpCost) c.hpCost = Math.max(1, c.hpCost - 2);
    if (c.bloodPact) c.bloodPact += 1;
  });

  // BUG-058 사파 검객: 흑도 약화 보너스 +2·피해 +1, 낭인 피해 +3·발도 +2
  school('heukdo', (c) => {
    if (c.dirtyBonus) c.dirtyBonus += 2;
    if (c.damage) c.damage += 1;
  });
  school('nangin', (c) => {
    if (c.damage) c.damage += 3;
    if (c.opener) c.opener += 2;
  });

  // BUG-059 사파 권사: 전장권 은자 대가↓·수입↑, 흑호권 피해 +1·약화 보너스 +1
  set('uCoinFist', { goldCost: 3 });
  set('purseThrow', { goldCost: 7 });
  set('uHireAssassin', { goldCost: 10 });
  set('uGoldRain', { goldCost: 22 });
  set('uHiredThug', { goldCost: 5 });
  set('uShakedown', { gold: 6 }, { gold: 9 });
  set('uPurseGuard', { gold: 6 }, { gold: 9 });
  school('heukho', (c) => {
    if (c.damage) c.damage += 1;
    if (c.dirtyBonus) c.dirtyBonus += 1;
  });

  // BUG-060 정파 검객: 남궁 검기 +1, 무당 공격 예고 시 +2·반격 +1
  school('namgung', (c) => { if (c.swordQi) c.swordQi += 1; });
  school('mudang', (c) => {
    if (c.bonusIfAttacking) c.bonusIfAttacking += 2;
    if (c.riposte) c.riposte += 1;
  });

  // BUG-061 사파 살수: 독문 터뜨리기 +1
  school('dokmun', (c) => { if (c.burst) c.burst += 1; });

  // BUG-062 반격만 있는 일반·고급 무공: 반격 +2 (골목대장 유지 +1)
  set('uCatchPunch', { riposte: 7 }, { riposte: 9 });
  set('uDirtyCounter', { riposte: 6 }, { riposte: 8 });
  set('dRecoilFist', { riposte: 5 }, { riposte: 6 });
  set('dMagiRecoil', { riposte: 6 }, { riposte: 8 });
  set('uAlleyBoss', { power: { riposte: 3 } }, { power: { riposte: 4 } });
}
