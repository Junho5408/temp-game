// 캐릭터 디자인 데이터 (세력 × 계열)
// 그림: assets/portraits/<세력>-<계열>.webp (사용자가 만든 샘플 일러스트에서 잘라낸 상반신 초상화)
// 정파: 백색·청색 / 마교: 흑색·적색 / 사파: 갈색·암녹색·무채색

export const FACTIONS = {
  orthodox: { name: '정파', color: '#3e7cc8' },
  demonic: { name: '마교', color: '#c22a36' },
  unorthodox: { name: '사파', color: '#8e7050' },
};

export const CLASSES = {
  sword: { name: '검객' },
  fist: { name: '권사' },
  assassin: { name: '살수' },
};

const NOTES = {
  'orthodox-sword': '깔끔하게 올린 상투(도관), 잡티 없는 피부, 좌우 대칭이 반듯한 이목구비',
  'orthodox-fist': '굵은 눈썹, 다부진 턱선, 이마를 드러낸 머리띠(말액)',
  'orthodox-assassin': '푸른 복면·두건으로 하관을 가리고 차분한 눈빛만 강조한 정파 밀정',
  'demonic-sword': '창백한 안색, 치켜올라간 삼백안, 붉은 눈빛',
  'demonic-fist': '핏줄 선 거친 피부, 산발, 붉은 문신, 광기 어린 표정',
  'demonic-assassin': '뿔 달린 귀면 가면, 붉은 눈, 검은 두건',
  'unorthodox-sword': '흐트러진 잔머리, 거친 수염 자국, 챙 넓은 삿갓',
  'unorthodox-fist': '뭉툭한 코, 굵은 주름, 붕대 감은 주먹',
  'unorthodox-assassin': '한쪽 눈 안대, 낡은 천 복면, 경계하는 눈빛',
};

export const DESIGNS = {};
for (const [fid, f] of Object.entries(FACTIONS)) {
  for (const [cid, c] of Object.entries(CLASSES)) {
    const key = `${fid}-${cid}`;
    DESIGNS[key] = {
      key,
      faction: fid,
      cls: cid,
      title: `${f.name} ${c.name}`,
      note: NOTES[key],
      portrait: `assets/portraits/${key}.webp`,
    };
  }
}

export const DESIGN_IDS = Object.keys(DESIGNS);
