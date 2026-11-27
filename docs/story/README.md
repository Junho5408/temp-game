# 스토리 체계

이야기를 **쓰고(작성)**, 게임에 들어간 대사를 **점검**하고, 고칠 일을 티켓으로 주고받는다. QA 체계(docs/qa)와 같은 방식.

```
/story            (Story Director = 메인 세션) — 점검
 ├─ tools/story/dump.mjs  → qa-output/<run>/story/script-*.md (게임 순서대로 뽑은 대본) + checks.json (기계 검사)
 ├─ story-lore    ─┐ 동시에 → qa-output/<run>/story/findings-lore.md      (설정·단서·진엔딩·모순)
 └─ story-reader  ─┘        → qa-output/<run>/story/findings-dialogue.md  (말투·맞춤법·길이·재미)
        ↓
 story-editor     → docs/story/reports/<run>.md + docs/story/tickets/STORY-###.md
        ↓
/story fix [STORY-###]  → 대사 수정 → 테스트·dump 검사 → 커밋 → 티켓 닫기

/story write <요청>     — 작성
 story-writer  → docs/story/drafts/draft-<이름>.md (장면 대본 + 바로 넣을 데이터 초안)
 story-lore · story-reader → 초안 검토 (설정 / 대사)
 사용자 승인 → 메인 세션이 코드에 넣고 PROGRESS.md 기록
```

- 정본: `docs/STORY.md` (✅ 확정 설정). 정본을 바꾸는 일은 항상 사용자 승인
- 게임 속 글: `src/story/script.js`(대사·단서·구역 이름), `src/core/events.js`(기연), `src/core/enemies.js`(적의 단서), `src/core/routes.js`(TRUE_CLUES)
- 도구: `npm run story:dump -- --run=이름` — 세 루트·공통 대본 추출과 기계 검사(화자·그림·단서 출처·진엔딩 단서 도달·긴 줄)

## 발견 사항 형식
설정 감수 `S-LR-##`, 대사 감수 `S-DL-##` — 형식은 각 에이전트 파일(.claude/agents/story-*.md) 참고.

## 스토리 티켓 형식
파일: `docs/story/tickets/STORY-###.md`

```
# STORY-### <한 줄 제목>
- 상태: 열림 | 수정됨 | 보류 | 사용자 결정 필요
- 심각도: 치명 | 높음 | 보통 | 낮음
- 분류: 모순 | 단서 흐름 | 진엔딩 | 인물 | 말투 | 맞춤법 | 길이·반복 | 재미 | 정본
- 발견: <run 이름> · <발견 사항 ID>

## 문제
## 위치
<src/story/script.js:줄 등 — 여러 곳이면 모두>
## 고칠 문장 (원문 → 제안)
## 완료 조건
- <예: dump 검사 오류 0, 해당 장면 대사가 제안대로, 관련 테스트 통과>

## 처리 기록
```

## 심각도 기준
| 심각도 | 기준 |
|---|---|
| 치명 | 진엔딩·핵심 단서를 얻을 수 없음, 이야기가 성립하지 않는 모순 |
| 높음 | 플레이어가 확실히 걸리는 모순·스포일러·오타, 핵심 장면이 맥 빠짐 |
| 보통 | 작은 설정 어긋남, 어색한 문장, 반복, 너무 긴 대사 |
| 낮음 | 다듬으면 좋아지는 정도, 문서 불일치 |
