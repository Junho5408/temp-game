# 백일회귀 (temp-game)

비 오는 밤, 객잔에서 국수를 먹던 떠돌이 무인이 **흰 옷에 검을 찼다는 이유만으로** 무림맹 밀사로 오인되어 죽는다.
눈을 뜨니 그날로부터 백 일 전. 회귀를 거듭하며 강해지고, 그날 밤의 진상에 다가가는 **무협 카드 배틀 로그라이트**.

- 플레이: https://junho5408.github.io/temp-game/ (GitHub Pages 를 켜면 열림 — 아래 "배포")
- 한 판 약 30분: 1구역 비무대회 → 2구역 녹림 토벌 → 3구역 마교 침공 저지 → 그날 밤의 객잔
- 죽으면 백 일 전으로 회귀: 익힌 무공 하나와 알아낸 단서는 다음 생에도 남음
- 기획 docs/SPEC.md · 스토리 docs/STORY.md · 계획 docs/PLAN.md · 개발 일지 docs/PROGRESS.md

## 조작
| 동작 | 마우스·키보드 | 터치 |
|---|---|---|
| 카드(무공) 사용 | 카드 클릭, 숫자키 1~9 | 카드 탭 |
| 턴 종료 | 버튼, E / Enter | 버튼 탭 |
| 행낭 물품 사용 | 왼쪽 아래 행낭 칸 클릭 | 탭 |
| 설명 보기 | 마우스를 올림 | 보물·상태·특성은 탭, 카드·버튼은 길게 누르기 |
| 덱 보기 / 닫기 | 위쪽 "덱" 버튼 / Esc | 탭 |
| 소리 설정 | 오른쪽 위 "音" | 탭 |

휴대폰은 가로로 들고 하는 게임입니다.

## 실행 (개발)
```
npm start        # http://localhost:8000 (빌드 없음, 정적 파일)
npm test         # 규칙 테스트
npm run qa:smoke # 브라우저 기능 점검
```
캐릭터 도감: characters.html

## 배포 (GitHub Pages)
저장소 Settings → Pages → Source "Deploy from a branch", Branch `main` / `/ (root)` → Save.
몇 분 뒤 https://junho5408.github.io/temp-game/ 에서 열립니다. 이후에는 main 에 푸시할 때마다 자동으로 갱신됩니다.

## 만든 방식
- HTML·JavaScript(ES 모듈), 빌드 도구 없음. 그림은 사용자가 이미지 생성 도구로 만든 일러스트를 처리해 사용 (tools/prepare_sprite.py)
- 소리는 음원 파일 없이 Web Audio 로 합성
- QA 에이전트(.claude/agents, /qa)가 점검하고 /fix-bugs 로 고치는 흐름 (docs/qa/)
