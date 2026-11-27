---
name: story
description: 백일회귀(temp-game) 스토리 담당 (Story Director). 전체 게임 스토리를 점검하거나(설정 감수·대사 감수 → 보고서·STORY 티켓), 새 장면·루트·인물·엔딩 이야기를 작성하거나(작가 → 감수 → 사용자 승인 → 게임에 반영), 스토리 티켓을 고친다. 사용자가 "/story", "스토리 점검", "대사 검수", "/story write …", "이야기 써줘", "/story fix" 등을 요청할 때.
---

# Story Director — 이야기 작성·점검

너(메인 세션)가 Story Director 다. 서브 에이전트는 다른 에이전트를 부를 수 없으므로 **순서와 판단은 네가 맡는다.**
서브 에이전트는 파일을 쓸 수 없다: 각 에이전트는 문서 전체를 답변에 `===== <파일> =====` … `===== end =====` 로 돌려주고, **너가 그대로 저장한다.**
형식·심각도: `docs/story/README.md`. 정본: `docs/STORY.md`.

## 모드 (ARGUMENTS 로 판단)
- 비어 있거나 `check` → **점검**
- `write <요청>` 또는 "…를 써줘/만들어줘" → **작성**
- `fix` / `fix STORY-###` → **수정**

---

## 점검
0. run 이름 `story-YYYYMMDD-HHMM`. `git status --short` 확인(변경이 있으면 알리고 그 상태로 점검). 사용자에게 한 줄로 시작을 알림.
1. `node tools/story/dump.mjs --run=<run>` 실행 → 오류/주의 수를 확인 (결과 `qa-output/<run>/story/`).
2. Agent 도구로 **한 응답에서 동시에** (백그라운드):
   - `story-lore` — "run 이름은 <run>. 점검 모드. findings-lore.md 내용을 돌려줘."
   - `story-reader` — "run 이름은 <run>. 점검 모드. findings-dialogue.md 내용을 돌려줘."
   - 끝날 때마다 답변의 문서를 `qa-output/<run>/story/findings-<lore|dialogue>.md` 로 저장. 실패하면 한 번만 다시 시도, 그래도 안 되면 보고서에 "미실시".
3. `story-editor` 실행 (기다림) — "run 이름은 <run>. 보고서와 티켓 내용을 돌려줘." → `===== FILE: <경로> =====` 블록을 각 경로에 저장, APPEND 는 해당 티켓 끝에 덧붙임.
4. `docs/story/reports/<run>.md` 를 직접 읽고 확인: 티켓마다 위치·원문·제안이 있는지, 근거 없는 티켓이 없는지. 필요하면 직접 고친다 (게임 코드는 건드리지 않음).
5. `docs/story/` 만 커밋 & 푸시 (`Story <run>: 티켓 n건`). 보고서를 사용자에게 보내고(SendUserFile) 짧게:
   한 줄 결론 / 새 티켓 표(번호·제목·심각도) / 좋았던 장면 1줄 / "고치려면 `/story fix` 또는 `/story fix STORY-003`".
   **이 단계에서 대사를 고치지 않는다.**

## 작성
0. 요청이 모호하면(어느 루트·구역·분량인지) 한 번만 묻는다. 분명하면 바로 진행. run 이름 `story-write-YYYYMMDD-HHMM`.
1. `story-writer` 실행 (기다림) — "run 이름은 <run>. 요청: <사용자 요청 그대로 + 필요한 맥락>. 초안을 돌려줘." → `docs/story/drafts/draft-<이름>.md` 로 저장.
2. `story-lore` 와 `story-reader` 를 동시에 (작성 검토 모드) — "작성 검토 모드. 초안: docs/story/drafts/draft-<이름>.md. 검토 결과를 돌려줘."
   - 고칠 점이 있으면 네가 초안에 반영하거나, 크면 `story-writer` 에게 검토 결과를 주고 한 번 더 쓰게 한다 (최대 1회).
3. **사용자에게 초안을 보여 주고 승인을 받는다** (CLAUDE.md: 단계 전 계획 승인). 장면 대본 요약 + 정본 변경 제안 + 필요한 그림 + 넣을 곳. 초안 파일도 보냄.
4. 승인되면 네가 코드에 넣는다: `src/story/script.js` / `src/core/events.js` / `src/core/enemies.js` 등. 규칙은 src/core 에만.
   - `npm test`, `node tools/story/dump.mjs --run=<run>` (오류 0), 필요하면 브라우저로 장면 확인.
   - 정본이 바뀌면 `docs/STORY.md` 갱신, `docs/PROGRESS.md` 에 결정과 이유 기록, 초안 파일에 "반영됨 (커밋)" 표시.
   - 커밋 & 푸시.

## 수정
- `docs/story/tickets/INDEX.md` 에서 열린 티켓을 심각도순으로(인자로 번호를 주면 그것만).
- 분류가 "정본"이거나 상태가 "사용자 결정 필요"면 고치기 전에 사용자에게 묻는다.
- 티켓의 "고칠 문장"대로 대사를 고치고 → `npm test` → `node tools/story/dump.mjs` 오류 0 → 티켓 상태 `수정됨` + 처리 기록(커밋 해시·한 줄) → INDEX 갱신 → 커밋 & 푸시.
- 끝나면 고친 티켓 표를 짧게 보고.
