# 주인공 공격 자세 프롬프트 (세력 3 × 계열 3)

쓰임: 공격하는 순간 전투 화면에서 기본 자세 그림(`assets/characters/<세력>-<계열>.webp`) 대신 이 그림을 잠깐 바꿔 끼운다. 격투 게임처럼 자세가 딱 바뀌어야 손맛이 난다. 큰 기술 컷신에서는 이 그림을 크게 확대해 쓴다.
그래서 **기본 자세 그림과 같은 사람·같은 옷·같은 무기·같은 크기·같은 화풍**이어야 하고, 바뀌는 것은 자세뿐이다.

## 그리는 순서 (Gemini 웹)
1. 칸마다 **새 채팅**을 연다. 같은 세력 세 칸은 한 채팅에서 이어 그려도 된다.
2. 첨부는 **두 장**이다. ① 그 칸의 기본 자세 원본 `docs/reference/<key>-raw.webp` ② 얼굴 기준 시트
   - 정파·마교: `docs/reference/hero-face-sheet-orthodox.webp`
   - 사파: `docs/reference/hero-face-sheet-unorthodox.webp`
3. 코드 블록 전체를 붙여 넣는다.
4. 사파 검객은 **4-0(기본 전투 자세)을 먼저** 그린다. 그다음 4번(공격)을 그릴 때 ① 자리에 방금 받은 4-0 그림을 붙인다.
5. 고칠 때 같은 채팅에 덧붙일 말
   - 얼굴이 달라지면: `The face drifted. Redraw with the face, hairstyle and body exactly identical to the attached reference; change only the pose.`
   - 옷·무기가 달라지면: `The outfit or weapon changed. Keep the outfit colors, accessories and weapon exactly as in the first attached image; change only the pose.`
   - 동작선·번쩍임이 생기면: `Remove all motion lines, speed lines, blur, sparks and impact effects. Clean character only on flat #00FF00.`
   - 발이나 칼끝이 잘리면: `Zoom out slightly so the whole figure, both feet and the full blade fit inside the square with empty green space around.`
   - 왼쪽을 보면: `Mirror the pose so he faces and attacks toward the right side of the image.`

## 올릴 때 파일 이름
- 공격 자세: `<세력>-<계열>-attack.png`
  → `orthodox-sword-attack` · `orthodox-fist-attack` · `orthodox-assassin-attack` · `unorthodox-sword-attack` · `unorthodox-fist-attack` · `unorthodox-assassin-attack` · `demonic-sword-attack` · `demonic-fist-attack` · `demonic-assassin-attack`
- 사파 검객 기본 전투 자세(얼굴 시트에서 자른 임시 그림을 바꿈): `unorthodox-sword.png`
- 올린 뒤 `/art 넣기 주인공 공격 자세`

## 공통 인물 문장 (prompts-hero.md 와 같음. 고치지 말 것)
> The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back.

## 공격 자세용 스타일 문장 (STYLE.md 공통 문장에서 자세 부분만 바꿈)
> Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

---

## 1. 정파 검객 공격 (`orthodox-sword-attack`)
첨부: `docs/reference/orthodox-sword-raw.webp` + `docs/reference/hero-face-sheet-orthodox.webp`
```
Same person, same outfit and same weapon as the attached images; change only the pose. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar martial robe with a blue collar, a blue sash and blue wrist guards, loose white trousers and black boots, a black scabbard at his hip, holding the same straight silver sword. He takes a deep forward lunge toward the right, front knee deeply bent, rear leg stretched long behind him, both boots on the ground, having just swung the sword down in a big arc with both hands on the hilt, the blade extended forward to the right with the tip at waist height in front of him. His robe hem, blue sash ends and loose hair sweep back with the movement, focused determined eyes, disciplined and precise.
```
- 깊게 내디딘 앞발, 두 손으로 내려 벤 직후, 칼끝은 오른쪽 앞. 배경 처리 edge

## 2. 정파 권사 공격 (`orthodox-fist-attack`)
첨부: `docs/reference/orthodox-fist-raw.webp` + `docs/reference/hero-face-sheet-orthodox.webp`
```
Same person, same outfit and same weapon as the attached images; change only the pose. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar martial robe with a blue collar and a tightly bound blue sash, sleeves tied back with blue cords, forearms wrapped in white cloth under polished silver-steel bracers, loose white trousers and black boots, no weapon. He steps far forward toward the right into a long low bow stance, front knee bent over the front foot, rear leg straight, both boots planted on the ground, his right arm fully extended straight out to the right in an open palm strike with the palm facing forward and fingers up, the left fist pulled back hard to the waist, hips and shoulders turned into the strike. Sash ends and loose hair swing back with the movement, sharp focused eyes, steady and powerful.
```
- 앞발 크게 내딛고 오른쪽으로 장(손바닥)을 쭉 뻗음. 배경 처리 edge

## 3. 정파 살수 공격 (`orthodox-assassin-attack`)
첨부: `docs/reference/orthodox-assassin-raw.webp` + `docs/reference/hero-face-sheet-orthodox.webp`
```
Same person, same outfit and same weapon as the attached images; change only the pose. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a fitted short white robe bound tight with dark blue cloth straps at the waist, arms and shins, a dark blue cloth mask pulled down loose around his neck so his whole face is clearly visible, fitted white trousers and black soft boots, a row of thin silver needles on a blue belt. He lunges low and fast toward the right, body leaning far forward close to the ground, front knee deeply bent, rear leg stretched straight behind pushing off, both boots still touching the ground, his right arm thrust straight forward to the right driving a slim silver dagger point-first, the second silver dagger held in reverse grip close to his left hip. Loose hair and the mask cloth stream back with the speed, quiet cold focused eyes.
```
- 낮게 몸을 날려 오른손 단검으로 찌름, 왼손 단검은 역수로 허리. 두 발은 땅에 닿게(게임에서 발 위치 기준). 배경 처리 edge

---

## 4-0. 사파 검객 기본 전투 자세 (`unorthodox-sword`)
지금 기본 그림은 얼굴 시트에서 자른 정면 서 있는 임시 그림이다. 다른 8칸처럼 오른쪽 3/4 전투 자세로 다시 그린다. 이 그림은 공격 그림이 아니라 기본 자세이므로 STYLE.md 공통 문장을 그대로 쓴다.
첨부: ① `docs/reference/hero-face-sheet-unorthodox.webp` (얼굴·옷·도) ② `docs/reference/orthodox-sword-raw.webp` (각도·자세 크기 참고만)
```
Same person, same outfit and same weapon as the first attached image (the character sheet); use the second attached image only for the camera angle, stance width and figure scale, not for the outfit. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, standing in a ready combat stance, three-quarter view facing right, centered with empty space around. Plain flat solid pure green (#00FF00) background, no ground shadow, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a travel-worn white cross-collar robe with a frayed hem and dust stains, an ochre-brown collar, a worn brown leather belt with a coin pouch, tan cloth wraps on the forearms, loose white trousers tucked into scuffed brown boots. He holds a plain single-edged broad saber with a cloth-wrapped hilt in his right hand, blade angled forward and low toward the right, left hand open at his side, body turned three-quarters to the right, not front-facing, feet set wide apart with knees slightly bent, loose confident fighting stance with a faint wry half-smile.
```
- 정면 금지, 오른쪽 3/4, 다리를 벌린 전투 자세. 초록 계열 금지. 배경 처리 edge

## 4. 사파 검객 공격 (`unorthodox-sword-attack`)
첨부: ① 4-0 에서 받은 `unorthodox-sword.png` ② `docs/reference/hero-face-sheet-unorthodox.webp`
```
Same person, same outfit and same weapon as the attached images; change only the pose. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a travel-worn white cross-collar robe with a frayed hem and dust stains, an ochre-brown collar, a worn brown leather belt with a coin pouch, tan cloth wraps on the forearms, loose white trousers tucked into scuffed brown boots. He takes a deep forward lunge toward the right, front knee deeply bent, rear leg stretched long behind him, both boots on the ground, having just hacked the plain single-edged broad saber down in a big one-handed arc with his right hand, the blade extended forward to the right with the tip at waist height in front of him, left arm flung back behind him for balance. The frayed hem, coin pouch and loose hair swing back with the movement, a fierce grin, rough and reckless.
```
- 한 손으로 크게 내려친 직후, 왼팔은 뒤로 뻗어 균형. 초록 계열 금지. 배경 처리 edge

## 5. 사파 권사 공격 (`unorthodox-fist-attack`)
첨부: `docs/reference/unorthodox-fist-raw.webp` + `docs/reference/hero-face-sheet-unorthodox.webp`
```
Same person, same outfit and same weapon as the attached images; change only the pose. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar robe with torn-off sleeves and a frayed hem, an ochre-brown collar and a rough brown rope belt, both hands and forearms wrapped in dirty tan cloth bandages, scuffed brown leather wrist bands, loose white trousers and brown boots, no weapon. He steps far forward toward the right with his front foot, front knee bent, rear leg pushing off behind, both boots on the ground, throwing a full-power straight punch with his right bandaged fist extended all the way out to the right at chin height, shoulder and hips twisted into the punch, left fist pulled back tight by his ribs. Loose hair and the frayed hem fly back with the movement, gritted teeth, scrappy and fierce.
```
- 앞발 내딛고 오른주먹을 쭉 뻗은 정권. 붕대 색은 황토(초록 금지). 배경 처리 edge

## 6. 사파 살수 공격 (`unorthodox-assassin-attack`)
첨부: `docs/reference/unorthodox-assassin-raw.webp` + `docs/reference/hero-face-sheet-unorthodox.webp`
```
Same person, same outfit and same weapon as the attached images; change only the pose. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a fitted short white robe bound with brown leather straps, a worn brown cloth mask pulled down loose around his neck so his whole face is clearly visible, a brown leather bandolier of small throwing knives across the chest, fitted white trousers and soft brown boots. He darts low and fast toward the right, body leaning far forward close to the ground, front knee deeply bent, rear leg stretched straight behind pushing off, both boots still touching the ground, his right arm thrust straight forward to the right stabbing with a short curved knife point-first, the other curved knife held low and back in his left hand. Loose hair and the mask cloth stream back with the speed, sly sharp eyes.
```
- 낮게 날아들며 곡단검으로 찌름. 칼날에 독 색(초록) 금지. 배경 처리 edge

---

## 7. 마교 검객 공격 (`demonic-sword-attack`)
첨부: `docs/reference/demonic-sword-raw.webp` + `docs/reference/hero-face-sheet-orthodox.webp`
```
Same person, same outfit and same weapon as the attached images; change only the pose. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar martial robe with a blood-red collar, a black sash tied with a red cord, black wrist guards, loose white trousers and black boots. He takes a deep forward lunge toward the right, front knee deeply bent, rear leg stretched long behind him, both boots on the ground, having just slashed the dark-steel straight sword down in a big arc, the blade extended forward to the right with the tip at waist height in front of him, the long red tassel whipping back from the hilt. A faint wisp of dark red energy clings only along the blade edge. Sash ends, red cord and loose hair sweep back with the movement, cold sharp gaze; his face stays the same as the reference, normal skin tone and dark eyes.
```
- 검붉은 기운은 칼날에만 조금. 얼굴은 그대로(창백한 얼굴·붉은 눈 금지). 배경 처리 all

## 8. 마교 권사 공격 (`demonic-fist-attack`)
첨부: `docs/reference/demonic-fist-raw.webp` + `docs/reference/hero-face-sheet-orthodox.webp`
```
Same person, same outfit and same weapon as the attached images; change only the pose. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a white cross-collar martial robe with a blood-red collar and a black sash tied with a red cord, both forearms wrapped in red cloth under black iron knuckle gauntlets, loose white trousers and black boots, no blade. He steps far forward toward the right with his front foot into a long low stance, front knee bent, rear leg straight behind, both boots on the ground, driving his right gauntleted fist straight out to the right with the arm fully extended at chest height, shoulder and hips twisted into the blow, left fist pulled back to the waist. A faint dark red energy curls only around the striking fist. Sash ends, red cord and loose hair swing back with the movement, intense focused eyes; his face stays the same as the reference, normal skin tone and dark eyes.
```
- 원본 그림처럼 두 팔뚝 모두 붉은 천과 검은 권갑. 기운은 뻗은 주먹 주위에만. 문신·산발 금지. 배경 처리 all

## 9. 마교 살수 공격 (`demonic-assassin-attack`)
첨부: `docs/reference/demonic-assassin-raw.webp` + `docs/reference/hero-face-sheet-orthodox.webp`
```
Same person, same outfit and same weapon as the attached images; change only the pose. Keep his face, facial proportions, eyes, eyebrows, hairstyle, hair length, age and body build identical, in the same art style (line weight, coloring, shading).

Semi-realistic Korean wuxia game character illustration, bold clean ink outlines, cel shading with soft painted highlights, muted desaturated colors, dramatic light from the upper right. Full body from head to feet, nothing cropped, a dynamic attack pose frozen at the exact moment of impact, three-quarter view facing right, attacking toward the right side of the image. The whole figure including both feet and the full weapon fits inside the frame with empty space around; same head size, body proportions and figure scale as in the first attached image. Plain flat solid pure green (#00FF00) background, no ground shadow, no motion lines, no speed lines, no motion blur, no sparks, no impact effects, no text, no frame, no border. Square image.

The same young man around twenty, slender athletic build, calm symmetrical handsome face with clean flawless skin, straight dark eyebrows and calm dark eyes, long straight black hair tied in a high neat topknot with a small silver hair crown and the rest falling loose down his back. He wears a fitted short white robe bound with black straps, a blood-red inner collar, a black and red cloth mask pulled down loose around his neck so his whole face is clearly visible, no mask on the face, fitted white trousers and black soft boots. He lunges low and fast toward the right, body leaning far forward close to the ground, front knee deeply bent, rear leg stretched straight behind pushing off, both boots still touching the ground, his right arm thrust straight forward to the right stabbing with a black-bladed dagger point-first, the second black dagger held in reverse grip low at his left side, thin red cords trailing back from both hilts. A faint wisp of dark red energy clings only to the striking blade. Loose hair and the mask cloth stream back with the speed, cold and silent; his face stays the same as the reference.
```
- 귀면 가면 금지(주인공을 죽인 자객의 상징과 겹침). 기운은 찌르는 칼날에만. 배경 처리 all (기운이 없으면 edge)

---

## 점검할 것 (기본 자세 그림과 공격 그림을 나란히 놓고)
- 얼굴·상투와 은관·머리 길이·체형이 기본 그림과 같은가 (가장 중요)
- 옷 색·소품·무기가 기본 그림과 같은가 (정파 푸른 깃·띠, 사파 황토 깃·가죽 띠, 마교 붉은 깃·검은 띠)
- 머리 크기·키가 기본 그림과 비슷한가. 바꿔 끼울 때 몸집이 커지거나 줄면 어색하다
- 오른쪽을 향해 공격하는가, 두 발과 칼끝까지 다 들어왔는가
- 동작선·모션 블러·번쩍임·바닥 그림자가 없는가 (게임이 그림)
- 살수 3장 모두 얼굴이 가려지지 않았는가
- 마교 3장: 기운이 칼날·주먹에만 조금 있고, 얼굴은 창백하지 않고 눈도 붉지 않은가

## 등록할 때 (/art 넣기)
- `python3 tools/prepare_sprite.py docs/reference/<key>-attack-raw.webp <key>-attack [--despill all]` 로 처리한다. 마교 검객·권사는 all, 마교 살수는 기운이 있으면 all, 나머지는 edge
- 공격 그림은 앞으로 크게 내디뎌서 footX 가 기본 그림과 다르게 나온다. 바꿔 끼울 때 몸이 옆으로 튀지 않도록 **뒷발 또는 몸 중심**이 기본 그림의 발 위치와 겹치게 맞춘다. 미리보기 `node tools/art/preview.cjs … --as=player` 로 기본 그림과 번갈아 보며 확인한다
- 머리 크기가 다르면 그림 쪽 배율(scale)도 맞춘다
- 사파 검객 `unorthodox-sword.png` 를 넣으면 `docs/reference/unorthodox-sword-raw.webp`, `assets/characters/unorthodox-sword.webp`, 선택 화면 초상 `assets/portraits/unorthodox-sword.webp` 를 새 그림으로 바꾸고 SPRITES footX 를 다시 잰다. CLAUDE.md 의 "사파 검객은 얼굴 시트에서 자른 임시" 메모도 지운다
