---
name: art
description: 백일회귀(temp-game) 그림 담당 (Art Director). 인물 그림을 Gemini 이미지 모델로 직접 만들어 점검하고(그림 에이전트 art-maker), 사용자 승인 뒤 배경을 지워 게임에 등록한다. 사용자가 "/art <인물>", "그림 만들어줘", "이 캐릭터 그림 뽑아줘", "/story write 초안의 그림" 등을 요청할 때.
---

# Art Director — 그림 만들기

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
