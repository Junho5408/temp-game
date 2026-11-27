---
name: art
description: 백일회귀(temp-game) 그림 담당 (Art Director). 반자동(기본) — 그림 에이전트가 프롬프트를 만들어 주면 사용자가 Gemini 웹에서 그려 올리고, 에이전트가 점검·배경 제거·미리보기 → 승인 뒤 등록. 자동 — API 결제가 있으면 Gemini API 로 직접 생성. 사용자가 "/art 프롬프트 <인물>", "/art 넣기 <인물>", "/art <인물>", "그림 프롬프트 줘", "그림 올렸어" 등을 요청할 때.
---

# Art Director — 그림 만들기

## 모드 (ARGUMENTS 로 판단)
- **`프롬프트 <인물들>`** (반자동 1단계, 기본): Gemini API 결제가 없을 때. 아래 "반자동"을 따른다.
- **`넣기 <인물>`** 또는 사용자가 그림을 올리며 "넣어줘/올렸어" (반자동 2단계): 아래 "반자동"을 따른다.
- **`<인물>`** 만 있으면: `node tools/art/gemini.mjs --list-models` 가 되고 한 장 생성이 되는(결제 있음) 경우 자동, 429(무료 한도 0)면 반자동 1단계로 넘어가 그렇게 알린다.

## 반자동 (사용자가 Gemini 웹에서 그림)
### 1단계 — 프롬프트
1. run 이름 `art-YYYYMMDD-HHMM`. 인물·key 를 정한다 (아래 "0. 준비"의 key 규칙).
2. Agent `art-maker` (기다림): "프롬프트 모드. run 이름은 <run>. key 는 <key>. 인물: <설정 요약>. 프롬프트를 돌려줘." (여러 명이면 한 번에 묶어서)
3. 사용자에게 인물마다:
   - **붙여 넣을 프롬프트 전체** (코드 블록, 공통 스타일 포함 — 그대로 복사하면 됨)
   - **같이 올릴 참고 그림**: SendUserFile 로 해당 `docs/reference/*-raw.webp` 1~2장을 보낸다 ("화풍 참고용으로 Gemini 에 같이 올리세요")
   - 순서 안내: Gemini 웹 → 참고 그림 첨부 + 프롬프트 붙여 넣기 → 마음에 드는 것 내려받기(여러 장 가능) → 이 채팅에 올리고 "`/art 넣기 <인물>`" 또는 "<인물> 그림 올렸어"
### 2단계 — 넣기
1. 사용자가 올린 그림은 세션 이미지 폴더(`/tmp/claude-0/<세션 경로>/images/`, 최근 파일)에 있다. `ls -t` 로 찾아 `qa-output/<run>/art/<key>/cand-N.<확장자>` 로 복사한다 (어느 그림이 어느 인물인지 모호하면 Read 로 보고 판단, 그래도 모호하면 묻는다).
2. Agent `art-maker` (기다림): "점검 모드. run 이름은 <run>. key 는 <key>. 후보: <경로들>. 인물: <설정 요약>. art-<key>.md 내용을 돌려줘." → `qa-output/<run>/art/<key>/art-<key>.md` 저장.
3. 에이전트가 모두 탈락시키면: 이유와 **고친 프롬프트**를 사용자에게 주고 다시 그려 달라고 한다.
4. 통과하면 아래 "2. 사용자 승인" → "3. 반영" 을 그대로 따른다.

## 자동 (Gemini API, 결제 필요)

너(메인 세션)가 Art Director 다. 그림 에이전트(art-maker)가 Gemini 로 후보를 만들어 점검하고, **게임에 넣는 건 사용자 승인 뒤 네가 한다.**
그림 규칙: `docs/art/STYLE.md`. 도구: `tools/art/gemini.mjs`(생성) · `tools/art/sheet.py`(비교 시트) · `tools/art/preview.cjs`(전투 화면 미리보기) · `tools/prepare_sprite.py`(배경 제거).

## 0. 준비
- run 이름 `art-YYYYMMDD-HHMM`. ARGUMENTS 에서 인물(여러 명 가능)과 key 를 정한다:
  - 이미 게임에 있는 인물(그림 없음 = characters.js 의 `sprite: null`, SPEAKERS 의 glyph 만 있는 인물)이면 그 key.
  - 새 인물이면 `npc-<영문>` / `boss-<영문>` / `<세력>-<계열>`. `/story write` 초안이 있으면 그 "필요한 그림"을 따른다.
- 연결 확인: `node tools/art/gemini.mjs --list-models` 한 번.
  - 키 오류(400 API key / 401 / 403)면 멈추고 사용자에게: "환경 설정 → 네트워크 비밀에 호스트 `generativelanguage.googleapis.com`, 헤더 `x-goog-api-key` 로 Gemini 키를 넣고 새 세션에서 다시" (키를 채팅에 붙여 넣지 말라고). 
  - 한도 오류(429)면 사용자에게 알리고 멈춘다.
- 사용자에게 한 줄: "그림 <인물들> 생성 시작 (인물당 2~6장)".

## 1. 생성 (인물마다, 여러 명이면 동시에 — 최대 3명씩)
Agent `art-maker` (백그라운드): "run 이름은 <run>. key 는 <key>. 인물: <이름·세력·역할·설정 요약, 초안 경로가 있으면 경로>. 지시대로 후보를 만들고 art-<key>.md 내용을 돌려줘."
- 끝나면 답변의 문서를 `qa-output/<run>/art/<key>/art-<key>.md` 로 저장.
- 실패(키·한도)면 그 이유를 그대로 사용자에게 전하고 멈춘다. 다른 오류면 한 번만 다시.

## 2. 사용자 승인 (꼭)
- 인물마다 추천 후보의 **원본·처리된 스프라이트·전투 화면 미리보기**를 보낸다 (SendUserFile, 비교 시트가 있으면 함께).
- 짧게: 인물 / 추천 후보와 이유 / 아쉬운 점. "이걸로 넣을까요? 다른 후보(cand-N)나 다시 그리기(무엇을 바꿀지)도 가능".
- 사용자가 다시 그려 달라고 하면 그 요청을 덧붙여 1단계를 그 인물만 다시.

## 3. 반영 (승인된 것만)
1. 원본을 `docs/reference/<key>-raw.png` 로 복사.
2. `python3 tools/prepare_sprite.py docs/reference/<key>-raw.png <key> [--despill all]` → `assets/characters/<key>.webp`, footX.
3. `src/ui/characters.js` 에 등록: 이야기 인물·두목은 NPCS (`sprite: null` 이던 인물은 sprite 만 채움), 세력 계열 디자인은 SPRITES. 대사 초상화가 필요하면 `src/story/script.js` SPEAKERS 의 art 를 key 로.
4. 확인: `npm test`, `node tools/art/preview.cjs assets/characters/<key>.webp <scratchpad>/check.png` 를 보고, 도감(characters.html)에도 나오는지.
5. `docs/art/STYLE.md` 의 "지금 그림이 있는 인물의 설명" 표에 쓴 설명을 추가, `docs/PROGRESS.md` 에 기록 → 커밋 & 푸시.
6. 짧게 보고: 넣은 그림, 커밋.
