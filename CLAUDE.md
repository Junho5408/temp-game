# 프로젝트: temp-game (임시 이름)

## 개요
- 웹 게임 (HTML/JS), 모바일 터치 지원 예정
- 상세 기획: docs/SPEC.md / 스토리: docs/STORY.md / 계획: docs/PLAN.md / 일지: docs/PROGRESS.md

## 현재 상태
- 진행 중: 6단계 — 6-A·6-B 사파·6-C 마교·6-D 진엔딩 완료 → 마지막: 밸런스 + /qa
- QA 티켓: BUG-001~025 모두 처리 (BUG-018 보류) — docs/qa/tickets/INDEX.md
- 다음 할 일: 밸런스(세 루트 + 진엔딩 판, tools/qa/balance.mjs --faction= --true=1) → /qa 한 회차 (계획 docs/PLAN.md 6단계)
- 진엔딩: routes.js TRUE_CLUES(세 길 핵심 단서) → advanceZone(run, meta) 가 run.trueEnding → 귀면 뒤 백리현(enemies.js TRUE_BOSS) → script.js TRUE_BRIDGE/TRUE_ENDING, 기록 clears.trueEnd
- 세력 루트: src/core/routes.js (ROUTES[세력].pools/finalBoss/unlock/passive/starter/ready), 대사 script.js ROUTE_TEXT
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
- 새 그림 처리: `python3 tools/prepare_sprite.py <원본> <세력-계열 또는 npc-이름> [--despill all]` 후 src/ui/characters.js 의 SPRITES 에 footX 등록
