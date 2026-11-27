# 주인공 9장 프롬프트 (같은 사람 · 세력 3 × 계열 3)

목표: 세력 선택 화면 9칸이 **한 사람**으로 보이게. 얼굴·체형·머리는 그대로 두고 **흰 옷 + 세력 색 포인트 + 계열 무기·자세**만 바꾼다. (6단계 결정: 주인공은 어느 세력이든 흰 옷)

## 그리는 순서 (Gemini 웹)
1. **새 채팅**에서 0번(얼굴 기준 시트)을 먼저 그린다. 첨부: `docs/reference/orthodox-sword-raw.webp` (지금 전투 화면 주인공과 같은 그림, 초록 배경. `assets/characters/orthodox-sword.webp` 는 배경이 투명해서 검게 보일 수 있으니 raw 를 권함)
2. 마음에 드는 시트를 내려받아 둔다.
3. 1~9번은 **매번 두 장을 첨부**한다: ① `orthodox-sword-raw.webp` ② 0번 시트. 그리고 코드 블록 전체를 붙여 넣는다. 같은 채팅에서 이어 그리면 얼굴이 더 잘 유지된다.
4. 얼굴이 달라지면 같은 채팅에 덧붙인다: `The face drifted. Redraw with the face, hairstyle and body exactly identical to the attached reference; change nothing else.`
5. 다른 규칙은 그대로: 오른쪽 3/4, 전신, 발끝까지, 배경 #00FF00, 글자·테두리 없음, 정사각형.

## 올릴 때 파일 이름
- 0번 시트: `hero-face-sheet.png` (참고용. 게임에는 넣지 않고 `docs/reference/hero-face-sheet.webp` 로 보관)
- 1~9번: `<세력>-<계열>.png` → `orthodox-sword` · `orthodox-fist` · `orthodox-assassin` · `unorthodox-sword` · `unorthodox-fist` · `unorthodox-assassin` · `demonic-sword` · `demonic-fist` · `demonic-assassin`
- 올린 뒤 "`/art 넣기 주인공 9장`" (원본은 `docs/reference/<key>-raw.webp`, 전신 스프라이트 `assets/characters/<key>.webp`, 선택 화면 초상 `assets/portraits/<key>.webp` 도 새 그림에서 다시 자름)

## 공통 인물 문장 (1~9번 모두 같은 문장. 고치지 말 것)
> The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back.

---

## 0. 얼굴 기준 시트 (`hero-face-sheet`)
한 장에 정면 얼굴, 오른쪽 3/4 얼굴, 전신 정면. 옷은 세력 색 없는 흰옷, 무기 없음.
```
Use the attached image as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character reference sheet, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, soft even light from the upper right. Three views of the same man side by side with empty space between them: on the left a front-facing head-and-shoulders close-up, in the middle a three-quarter view head-and-shoulders close-up facing right, on the right a full body front view from head to feet, nothing cropped, standing straight with arms relaxed. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no labels, no frame, no border, no dividing lines. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a plain white cross-collar martial robe with a plain white sash, loose white trousers and black cloth boots, no weapon, neutral calm expression.
```
- 1~9번 내내 얼굴의 기준이 되는 시트. 옷에 색이 없어 세력 색이 섞이지 않음. 배경 처리 필요 없음 (보관용)

---

## 1. 정파 검객 (`orthodox-sword`)
지금 그림과 가장 가깝다. 기존 그림을 그대로 둬도 되지만, 9장의 그림체를 맞추려면 다시 그린다.
```
Use the attached images as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading). Change only the outfit accents, weapon and pose described below.

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar martial robe with a blue collar, a blue sash and blue wrist guards, loose white trousers and black boots, a black scabbard at his hip, holding a straight silver sword in both hands pointed low and forward, calm, upright and disciplined orthodox swordsman.
```
- 흰 도포에 푸른 깃·띠, 곧은 검. 배경 처리 edge

## 2. 정파 권사 (`orthodox-fist`)
```
Use the attached images as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading). Change only the outfit accents, weapon and pose described below.

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar martial robe with a blue collar and a tightly bound blue sash, sleeves tied back with blue cords, forearms wrapped in white cloth under polished silver-steel bracers, loose white trousers and black boots, no weapon. Bare-handed martial artist in a low solid horse stance, right open palm thrust forward and left fist guarding at the waist, focused and steady.
```
- 맨손, 은빛 팔목 보호대, 손바닥을 앞으로 내민 장법 자세. 배경 처리 edge

## 3. 정파 살수 (`orthodox-assassin`)
```
Use the attached images as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading). Change only the outfit accents, weapon and pose described below.

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a fitted short white robe bound tight with dark blue cloth straps at the waist, arms and shins, a dark blue cloth mask pulled down loose around his neck so his whole face is clearly visible, fitted white trousers and black soft boots, a row of thin silver needles on a blue belt. He holds a slim silver dagger in a reverse grip in his right hand and a second dagger low in the left, in a low crouched forward stance, quiet and alert.
```
- 단검 두 자루(역수), 푸른 복면은 목에 내림. 얼굴이 다 보이게. 배경 처리 edge

## 4. 사파 검객 (`unorthodox-sword`)
```
Use the attached images as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading). Change only the outfit accents, weapon and pose described below.

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a travel-worn white cross-collar robe with a frayed hem and dust stains, an ochre-brown collar, a worn brown leather belt with a coin pouch, tan cloth wraps on the forearms, loose white trousers tucked into scuffed brown boots. He holds a plain single-edged broad saber with a cloth-wrapped hilt in his right hand, blade angled forward and low, left hand open at his side, loose confident stance with a faint wry half-smile.
```
- 낡은 흰 도포에 황토색 깃·가죽 띠, 외날 도. 초록 계열 금지. 배경 처리 edge

## 5. 사파 권사 (`unorthodox-fist`)
```
Use the attached images as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading). Change only the outfit accents, weapon and pose described below.

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar robe with torn-off sleeves and a frayed hem, an ochre-brown collar and a rough brown rope belt, both hands and forearms wrapped in dirty tan cloth bandages, scuffed brown leather wrist bands, loose white trousers and brown boots, no weapon. Brawler's stance with both fists raised in front of his chest, weight on the front foot, scrappy and determined.
```
- 소매 뜯은 흰 도포, 붕대 감은 주먹, 거친 싸움꾼 자세. 배경 처리 edge

## 6. 사파 살수 (`unorthodox-assassin`)
```
Use the attached images as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading). Change only the outfit accents, weapon and pose described below.

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a fitted short white robe bound with brown leather straps, a worn brown cloth mask pulled down loose around his neck so his whole face is clearly visible, a brown leather bandolier of small throwing knives across the chest, fitted white trousers and soft brown boots. He holds a short curved knife in each hand, one raised ready to throw, in a low sideways crouch, sly and watchful.
```
- 비도 띠, 곡단검 두 자루, 갈색 복면은 목에 내림. 칼날에 초록 독 표현 금지. 배경 처리 edge

## 7. 마교 검객 (`demonic-sword`)
```
Use the attached images as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading). Change only the outfit accents, weapon and pose described below.

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar martial robe with a blood-red collar, a black sash tied with a red cord, black wrist guards, loose white trousers and black boots. He holds a dark-steel straight sword with a long red tassel, blade drawn back low behind him ready to slash forward, a cold sharp gaze, with only a faint wisp of dark red energy along the blade edge.
```
- 흰 도포에 붉은 깃·검은 띠, 검붉은 기운은 칼날에만 살짝. 얼굴은 그대로(창백·붉은 눈 금지). 배경 처리 all

## 8. 마교 권사 (`demonic-fist`)
```
Use the attached images as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading). Change only the outfit accents, weapon and pose described below.

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar robe with the right sleeve tied back, a blood-red collar and a black sash, forearms wrapped in red cloth under black iron knuckle gauntlets, loose white trousers and black boots, no blade. Aggressive forward stance with the right gauntleted fist drawn back to strike and the left hand clawed forward, intense focused eyes, a faint dark red energy curling around the fists.
```
- 검은 쇠 권갑과 붉은 천 감기, 기운은 주먹 주위에만. 문신·산발 금지(같은 사람이어야 함). 배경 처리 all

## 9. 마교 살수 (`demonic-assassin`)
```
Use the attached images as the character reference: draw exactly the same person — keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical — in the same art style (line weight, coloring, shading). Change only the outfit accents, weapon and pose described below.

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a fitted short white robe bound with black straps, a blood-red inner collar, a black and red cloth mask pulled down loose around his neck so his whole face is clearly visible, no mask on the face, fitted white trousers and black soft boots. He holds a pair of black-bladed daggers in reverse grip with thin red cords trailing from the hilts, in a deep low crouch ready to lunge forward, cold and silent.
```
- 검은 단검 두 자루, 검붉은 복면은 목에 내림. 귀면 가면은 쓰지 않음(주인공을 죽인 자객의 상징이라 겹침). 배경 처리 edge (붉은 기운이 생기면 all)

---

## 점검할 것 (9장을 나란히 놓고)
- 9장의 얼굴·상투와 은관·머리 길이·체형이 같은가 (가장 중요)
- 옷 바탕이 모두 흰색이고, 세력 색은 깃·띠·소품에만 있는가
- 살수 3장 모두 얼굴이 가려지지 않았는가
- 오른쪽 3/4, 발끝까지, 배경이 고른 초록인가
- 흰 옷 가장자리에 초록이 비치면 처리할 때 `--despill all`

## 등록할 때 (/art 넣기)
- `python3 tools/prepare_sprite.py docs/reference/<key>-raw.webp <key> [--despill all]` → `src/ui/characters.js` SPRITES 의 footX 갱신 (demonic-fist 의 `face` 값도 다시 확인)
- 선택 화면 초상 `assets/portraits/<key>.webp` 를 새 전신 그림의 상반신으로 다시 만듦 (지금 초상은 sample-9 에서 잘라 쓴 9명이라 그대로 두면 계속 다른 사람으로 보임)
- `src/ui/characters.js` 21~29줄의 얼굴 메모(귀면 가면·안대·산발 등)를 "같은 얼굴 + 세력 포인트" 내용으로 고침
