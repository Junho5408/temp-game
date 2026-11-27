# 그림 규칙

게임 속 인물 그림은 모두 같은 규칙으로 만든다. `/art` 의 그림 에이전트(art-maker)와 `tools/art/gemini.mjs` 가 이 문서를 그대로 읽는다.

## 꼭 지킬 것
1. **전신**: 머리부터 발끝까지 잘리지 않게, 주변에 여백
2. **오른쪽을 비스듬히 보는 3/4 각도**, 싸울 준비가 된 자세 (적으로 쓸 때는 게임이 좌우 반전)
3. **배경은 단색 초록 #00FF00** — tools/prepare_sprite.py 가 지움. 땅 그림자 없음
4. **글자·액자·테두리·워터마크 없음**
5. 정사각형 그림
6. 초록 옷·초록 기운이 있으면 배경 제거 때 함께 지워질 수 있음 → 설명에 초록을 쓰지 않거나, 처리할 때 `--despill edge`(기본)
7. 반투명 연기·기운 이펙트가 있고 초록 옷이 없으면 처리할 때 `--despill all`

## 공통 스타일 문장 (프롬프트 앞에 항상 붙임)
<!-- style -->
```
Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.
```
<!-- /style -->

## 화풍 참고 그림 (`--ref` 로 1~2장 함께 보냄)
| 용도 | 참고 그림 |
|---|---|
| 기본 (주인공) | docs/reference/orthodox-sword-raw.webp |
| 노인·조력자 | docs/reference/npc-juno-raw.webp |
| 두목·악역 | docs/reference/boss-gwimyeon-raw.webp, docs/reference/boss-baekri-raw.webp |
| 마교 | docs/reference/demonic-sword-raw.webp |
| 사파 | docs/reference/unorthodox-sword-raw.webp |

참고 그림은 **화풍만** 따르게 한다 (도구가 "이 인물을 그리지 말고 화풍만"이라고 함께 보냄).

## 캐릭터 설명 쓰는 법 (영문, 한두 문장)
`나이·체격 → 얼굴·표정 → 머리 → 옷(색·문양) → 무기·소품 → 자세·분위기` 순서. 세력 색:
- 정파: 흰색·청색·은색, 단정함
- 사파: 갈색·짙은 녹갈색·누더기, 거침 (초록 옷은 피하고 녹갈색으로)
- 마교: 검정·핏빛 붉은색, 날카로움·광기
- 무림맹: 흰색·청색 + 흰 학 문양

### 지금 그림이 있는 인물의 설명 (같은 인물을 다시 그릴 때 그대로 씀)
| 그림 이름 | 설명 |
|---|---|
| orthodox-sword (주인공) | A young orthodox-sect swordsman, neat topknot with a small silver hair crown, clean flawless skin, calm symmetrical handsome face, white robe with blue collar and blue sash, holding a straight sword pointed low and forward. |
| boss-baekri (백리현) | A dignified middle-aged orthodox alliance vice-leader, refined handsome face with a calm benevolent smile that hides coldness in the eyes, neat long black hair with a jade hair crown, immaculate white and silver robe with a subtle embroidered white crane emblem on the chest, holding a slender silver longsword lowered at his side, upright noble stance with a faint chilling aura. |
| boss-gang (조광) | A ruthless underworld gang lord in his forties, slicked-back black hair with a long scar across the cheek, gold teeth showing in a smirk, dark crimson and black brocade robe worn open over a tattooed chest, heavy gold rings, holding a broad-bladed saber over the shoulder, a smoking pipe in the other hand, confident swaggering stance. |
| boss-rival (연화) | A young demonic cult prodigy swordswoman, sharp beautiful face with cold crimson eyes and a faint arrogant smile, long black hair tied high with a red ribbon, sleek black and blood-red fitted martial robe with flowing sleeves, holding a thin curved crimson blade with dark red energy trailing from the edge, poised duelist stance. |
| boss-elder (우문혁) | An elderly orthodox alliance elder grandmaster, long white beard and white eyebrows, stern righteous face, blue and white layered robe with alliance insignia, a heavy iron staff in both hands, solid immovable stance with a faint golden protective qi glowing around the body. |
| npc-innkeeper (객잔 주인) | A nervous middle-aged innkeeper, round face with a thin mustache, sweating with shifty eyes, plain brown apron over a gray shirt, holding an abacus close to his chest, hunched timid stance. |

> 2026-11-27 반자동으로 넣은 10명(복이·맹 서기·토벌대장·흑도 졸개·혈공 장로·마교 집사·연무혁·위극·무명·독안귀)의 설명은 `docs/art/prompts-20261127.md` 에 그대로 있음 (다시 그릴 때 그 블록을 씀)
> 웹에서 받은 그림의 배경이 탁한 초록이면 `prepare_sprite.py … --bg-key` (모서리 색 기준으로 지움)

## 좋은 그림 점검표 (에이전트가 후보마다 확인)
- [ ] 전신이 잘리지 않음 (발끝까지)
- [ ] 오른쪽을 보는 3/4 각도
- [ ] 배경이 고른 초록, 그림자·바닥 없음
- [ ] 글자·워터마크·테두리 없음 (작은 조각은 prepare_sprite 가 지우지만 몸에 붙은 것은 못 지움)
- [ ] 손가락·무기 모양이 크게 망가지지 않음
- [ ] 설명의 핵심 특징(옷 색, 문양, 무기)이 보임
- [ ] 화풍이 참고 그림과 비슷함 (굵은 먹선, 차분한 채색)
- [ ] 다른 작품의 유명 캐릭터를 닮지 않음
