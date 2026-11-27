# 프로젝트: temp-game (임시 이름)

## 개요
- 웹 게임 (HTML/JS), 모바일 터치 지원 예정
- 상세 기획: docs/SPEC.md / 스토리: docs/STORY.md / 계획: docs/PLAN.md / 일지: docs/PROGRESS.md

## 현재 상태
- 진행 중: 7단계 완료 (7-A~7-E 콘텐츠 확장: 주노 기연 세 길, 무공 세력마다 65장, 보물 56개) + QA qa-20261127-1119 티켓 처리
- QA 티켓: BUG-001~049 모두 처리 — docs/qa/tickets/INDEX.md. 기준: 1구역 35~45%, 나머지 30~60% (마교 진엔딩 판 최종 26.6% 경계 아래, 다음 QA 에서 확인)
- 다음 할 일: 사용자와 정할 일 (/qa quick 재확인, 위극 옷 무늬 다시 그리기 검토, GitHub Pages 켜기)
- 회귀: 백일취(STORY.md 회귀의 비밀). 回 선택지 = events 의 needClue (run.knownClues), 회귀 직후 대사 wakeLines(n, meta) 는 meta.lastDeath·lastEnd·clues 로 갈림
- 진엔딩: routes.js TRUE_CLUES(세 길 핵심 단서) → advanceZone(run, meta) 가 run.trueEnding → 귀면 뒤 백리현(enemies.js TRUE_BOSS) → script.js TRUE_BRIDGE/TRUE_ENDING, 기록 clears.trueEnd
- 세력 루트: src/core/routes.js (ROUTES[세력].pools/finalBoss/unlock/passive/deck/basic/ready), 대사 script.js ROUTE_TEXT
- 무공은 세력마다 따로 (공용 0장, cards.js faction + 확장 파일 cards-orthodox/unorthodox/demonic.js). 기믹: 사파 암기(thrown)·독 터뜨리기(burst)·은자(goldCost/bribe)·함정(trap)·훔치기(steal), 마교 마기(magi/magiSpend, 6마다 초식 +1 최대 +3)·혈투(desperate)·입마(curse → qiDeviation)·혈계(bloodPact)·입마 연료(consumeCurse), 정파 검기(swordQi)·심법 유지(power)
- 보물 효과는 items.js 의 fx (battle.js tfx/applyTreasureFx, run.js 획득·승리·휴식·상점 쪽)
- 소리: src/ui/audio.js (Web Audio 합성, sfx(이름) / playMusic(분위기))

## 작업 규칙
- 각 단계 시작 전 계획을 먼저 보여주고 승인받기
- 한 번에 한 단계씩 진행 (MVP → 핵심 재미 → 화면 흐름 → 꾸미기 → 다듬기)
- 단계가 끝나면: PLAN.md 체크 → PROGRESS.md 기록 → 이 파일의 "현재 상태" 갱신 → 커밋 & 푸시
- 중요한 결정은 PROGRESS.md에 이유와 함께 기록
- 기존 게임을 그대로 베끼지 않고 오리지널로 만들기

## 개발 메모
- 실행: `npm start` 후 http://localhost:8000 (빌드 없음, 정적 파일)
- 캐릭터 도감: http://localhost:8000/characters.html (데이터 src/ui/characters.js, 그림 assets/portraits/)
- 그림은 사용자가 이미지 생성 도구로 만들어 제공, 원본은 docs/reference/
- 테스트: `npm test` (src/core 규칙 테스트, Node 기본 테스트 러너)
- 구역: 적 목록 enemies.js 의 ZONE_POOLS, 구역 이름·배경·구역 대사 script.js 의 ZONE_NAMES/ZONE_BACKGROUNDS/zoneIntro, 판 저장 localStorage temp-game.run.v1
- 대사·단서 정의는 src/story/script.js (이야기 기연은 events.js 의 story/npc, 적 단서는 enemies.js 의 clue), 회귀 기록은 src/core/meta.js (localStorage 키 temp-game.meta.v1)
- 게임 규칙은 src/core 에만 두고 화면 코드(src/ui, src/main.js)와 섞지 않기
- 규칙 파일: battle.js(전투) run.js(한 판) map.js(지도) events.js(기연) cards.js enemies.js(적·특성 TRAITS) items.js(행낭 물품·보물)
- 용어: 카드 = 무공, 일시적 아이템 = 행낭 물품, 영구 아이템 = 보물(영약·비급·보구)
- 테스트에서 확률을 끄려면 createBattle({ luck: false }), 규칙 확인용 적은 dummy / dummyMulti
- QA: `/qa` (QA Manager) → 에이전트 .claude/agents/qa-*.md → 보고서 docs/qa/reports, 티켓 docs/qa/tickets → `/fix-bugs` 로 수정. 형식은 docs/qa/README.md, 도구 tools/qa/ (npm run qa:smoke / qa:monkey / qa:balance), 원자료 qa-output/(git 제외)
- 스토리: `/story` (Story Director) 점검 · `/story write <요청>` 작성 · `/story fix` 수정 → 에이전트 .claude/agents/story-*.md (lore 설정 감수, reader 대사 감수, writer 작가, editor 보고) → 보고서 docs/story/reports, 티켓 docs/story/tickets/STORY-###, 초안 docs/story/drafts. 형식 docs/story/README.md, 대본 추출·기계 검사 `npm run story:dump -- --run=이름`
- 그림: `/art 프롬프트 <인물>` → 사용자가 Gemini 웹에서 그려 올림 → `/art 넣기 <인물>` (반자동, 기본). API 결제가 있으면 `/art <인물>` 자동 생성(tools/art/gemini.mjs, 키는 환경 네트워크 비밀 generativelanguage.googleapis.com · x-goog-api-key, 무료 요금제는 이미지 한도 0). 에이전트 .claude/agents/art-maker.md → 사용자 승인 → 등록. 그림 규칙 docs/art/STYLE.md, 후보는 qa-output/<run>/art/
- 새 그림 처리: `python3 tools/prepare_sprite.py <원본> <세력-계열 또는 npc-이름> [--despill all]` 후 src/ui/characters.js 의 SPRITES 에 footX 등록
