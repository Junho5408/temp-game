# 프로젝트: temp-game (임시 이름)

## 개요
- 웹 게임 (HTML/JS), 모바일 터치 지원 예정
- 상세 기획: docs/SPEC.md / 계획: docs/PLAN.md / 일지: docs/PROGRESS.md

## 현재 상태
- 진행 중: 1단계 완료 → 2단계(한 판 구조: 지도, 보상, 칸 종류) 계획 승인 대기
- 다음 할 일: 1단계 플레이 피드백 반영, 2단계 계획 보여주고 승인받기

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
- 게임 규칙은 src/core 에만 두고 화면 코드(src/ui, src/main.js)와 섞지 않기
