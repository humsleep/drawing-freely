# 그림자유 자산 라이브러리

캐릭터/도안 빌더가 사용하는 정적 SVG 자산.
**모든 파일은 같은 사양**을 따르고, 파일명·경로 규칙이 코드에 박혀 있으므로
**현재 파일을 같은 이름으로 덮어쓰기만** 하면 디자인이 교체된다.

## 공통 SVG 사양 (모든 자산 동일)

- `viewBox="0 0 200 200"` — 정사각 200×200 좌표계
- 배경 투명 (`fill="none"` 또는 빈 배경)
- 선 색: `#1f1b16` (거의 검정)
- 선 굵기: `stroke-width="3"` (모바일 가독)
- 선 단점: `stroke-linecap="round"`, `stroke-linejoin="round"`
- **음영·그라데이션·패턴 금지** (인쇄 시 잉크 낭비)
- **`fill="white"` 금지 — 반드시 `fill="none"`.**
  앱 안에서 색칠할 때 흰 면이 색을 가린다. 검정 점·작은 검정 도형(눈동자 등)만 `fill="#1f1b16"` 허용.

## 폴더 구조와 파일명

```
public/assets/
├── animals/                # 동물 배치 모드용
│   ├── elephant.svg
│   ├── tiger.svg
│   ├── giraffe.svg
│   ├── lion.svg
│   ├── bear.svg
│   ├── rabbit.svg
│   ├── panda.svg
│   ├── fox.svg
│   ├── owl.svg
│   └── dolphin.svg
└── face/                   # 얼굴 빌더용
    ├── shape/      1.svg ... 5.svg   (얼굴 윤곽)
    ├── hair/       1.svg ... 6.svg
    ├── eyebrows/   1.svg ... 5.svg
    ├── eyes/       1.svg ... 6.svg
    ├── nose/       1.svg ... 5.svg
    ├── mouth/      1.svg ... 6.svg
    ├── top/        1.svg ... 5.svg   (상의 — y=160-185 안에만)
    ├── bottom/     1.svg ... 4.svg   (하의 — y=185-200 좁은 띠)
    └── accessory/  1.svg ... 5.svg   (1번은 빈 SVG = '안 함')
```

새 자산을 추가하려면 같은 폴더에 다음 번호로 추가하고
**`/lib/assets.ts`의 카운트 상수도 함께 갱신**해야 코드가 인식한다.

## 얼굴 부품 위치 (200×200 좌표계 기준)

모든 얼굴 부품 SVG는 같은 200×200 캔버스에 자신의 위치에 그려진다.
빌더는 8개 SVG를 같은 (x,y)에 겹쳐 합성한다.

- **shape (얼굴 윤곽)**: 중앙. `(60–140, 40–170)` 범위
- **hair (머리)**: 머리 위. `(40–160, 0–80)`
- **eyes (눈)**: 윗 1/3. `(70–130, 80–100)` (왼·오 두 눈 한 SVG에)
- **eyebrows (눈썹)**: 눈 위. `(70–130, 70–80)`
- **nose (코)**: 중앙. `(90–110, 95–125)`
- **mouth (입)**: 아랫 1/3. `(80–120, 130–150)`
- **top (상의)**: 캔버스 바닥 부근. `(40–160, 170–200)`
- **top (상의)**: 어깨선. `(45–155, 160–185)` — y=185 위에서 끝나야 하의가 보임
- **bottom (하의)**: 상의 아래 좁은 띠. `(45–155, 185–200)` — 15px 정도만 보임
- **accessory (악세사리)**: 자유 위치. 1번은 빈 SVG('안 함'). 안경/모자/나비넥타이/머리장식 등

> 부품이 자기 위치 밖으로 그려지지 않게 디자이너/AI에게 명시해야 한다.

## AI로 자산 생성하는 법

OpenAI image edit / DALL·E 3 / Recraft / Replicate 어디든 OK.

### 디자인 방향 (이게 가장 중요)

**아이가 보고 "귀엽다"가 1초 안에 나와야 한다.**
프롬프트에 다음 키워드들이 빠지면 결과가 평범해진다:

- **귀여움**: `cute`, `kawaii`, `adorable`, `chibi proportions`
- **장난기**: `playful`, `mischievous`, `cheeky`, `expressive`
- **예쁨**: `charming`, `pretty`, `lovable`, `huggable`
- **비율**: `big round head`, `tiny body`, `oversized features` (전형적 chibi 비율)
- **눈**: `huge sparkly eyes`, `bright highlights`, `long eyelashes`
- **선**: `round soft lines`, `thick rounded line caps`

피해야 할 표현: `realistic`, `detailed`, `professional`, `intricate`
(어른용 그림이 되어버린다)

### 마스터 스타일 프롬프트 (Recraft "Style Library"에 저장)

첫 자산 1개를 이 프롬프트로 만들어 마음에 들 때까지 다듬은 뒤,
**그 스타일을 저장하면 나머지 51개는 같은 톤으로 일관되게 양산됨.**

```
Style: super cute kawaii cartoon for a children's coloring book.
Chibi proportions — big round head, tiny body, oversized expressive features.
Huge sparkly eyes with shiny highlights and long lashes.
Cheerful, playful, mischievous expressions — adorable and huggable.
Black ink outline only, no shading, no color fill, no patterns, no gradients.
Thick rounded line caps, soft round closed shapes.
Centered in 200x200 canvas with margin. White background.
Designed for kids age 4–12 to color with crayons on A4 paper.
```

### 동물 프롬프트

마스터 스타일을 적용한 상태에서, 한 줄만 바꿔서 10번 호출:

```
A super cute, [PLAYFUL_VERB] [ANIMAL] character.
Chibi style with huge sparkly eyes and a cheeky expression.
Black outline only on white background. No shading.
```

`[PLAYFUL_VERB]` 변화로 표정·자세 다양화:
- `smiling` (코끼리·기린·돌고래 — 차분한 동물)
- `waving its paw` (사자·곰)
- `bouncing` (토끼·여우)
- `winking` (팬더·부엉이)
- `sticking its tongue out` (호랑이 — 장난기 더)

10종 매핑:
| 동물 | 추천 표정·자세 |
|---|---|
| elephant 코끼리 | smiling, holding its trunk up cheerfully |
| tiger 호랑이 | sticking its tongue out playfully |
| giraffe 기린 | smiling with its long neck curved cutely |
| lion 사자 | grinning with a fluffy mane |
| bear 곰 | hugging itself with happy closed eyes |
| rabbit 토끼 | bouncing with floppy long ears |
| panda 팬더 | winking, holding a tiny leaf |
| fox 여우 | smirking mischievously |
| owl 부엉이 | wide-eyed with curious tilted head |
| dolphin 돌고래 | jumping with a happy smile |

### 얼굴 부품 프롬프트

```
A [CUTE_DESCRIPTOR] [PART] in cute kawaii style.
Black line drawing only at the [POSITION] of a 200x200 canvas.
Rest of canvas completely empty/transparent.
Exaggerated, playful, expressive. No shading.
```

부품별 추천 표현 (귀여움 강화):

| 슬롯 | CUTE_DESCRIPTOR + PART |
|---|---|
| shape | "round chubby cheeks face outline" / "soft oval face with little dimples" / "heart-shaped face" / "tiny pointy chin face" / "wide friendly round face" |
| hair | "fluffy curly cloud hair" / "long flowing wavy hair" / "cute twin pigtails" / "spiky messy hair" / "neat bob with bangs" / "playful side ponytail" |
| eyebrows | "thin playful arched eyebrows" / "thick bold expressive eyebrows" / "tiny dot eyebrows" / "wavy surprised eyebrows" / "sleepy droopy eyebrows" |
| eyes | "huge sparkly anime eyes with star highlights" / "tiny dot eyes with rosy cheeks" / "winking one-eye-closed expression" / "sleepy half-closed eyes" / "wide surprised eyes" / "heart-shaped love eyes" |
| nose | "tiny button nose" / "barely-visible small dot nose" / "cute curved nose" / "small triangle nose" / "little upturned nose" |
| mouth | "wide cheerful smile showing tiny teeth" / "small round 'o' mouth surprised" / "playful tongue sticking out" / "tiny content smile" / "open belly laugh mouth" / "cheeky smirk" |
| top | "oversized cozy hoodie with hood" / "cute striped t-shirt" / "frilly princess dress top" / "overall straps with buttons" / "puffy sweater" |
| bottom | "puffy little shorts" / "cute overalls bottom" / "ruffled pleated skirt" / "comfy long pants with patches" |

### 위치 (얼굴 부품)

| 슬롯 | POSITION 영문 |
|---|---|
| shape | "centered, occupying the middle 60% vertically" |
| hair | "top of the head area, above the face" |
| eyebrows | "just above the eye area (around y=70-80 in 200x200)" |
| eyes | "upper third, symmetric, around y=85-105" |
| nose | "center, around y=100-125, small" |
| mouth | "lower third, around y=130-150" |
| top | "bottom edge, neck area down" |
| bottom | "very bottom edge of canvas" |

### 생성 후 후처리 체크리스트

자산 한 개당 30초:
- [ ] 200×200 SVG로 변환 (PNG로 받았으면 `vectorizer.ai` 등으로 변환)
- [ ] `viewBox="0 0 200 200"` 확인
- [ ] `stroke="#1f1b16"` 일괄 치환
- [ ] `fill="none"` 또는 `fill="white"` (회색/검정 채움 제거)
- [ ] `stroke-width="3"` 통일
- [ ] 파일 크기 5KB 이하 (큰 경우 `svgo`로 압축)
- [ ] 정해진 파일명으로 `public/assets/...`에 저장

### 한 번에 효율적으로 만드는 팁

- **첫 1개를 신중하게**: 마스터 스타일을 적용한 첫 자산(예: 코끼리)을 8~10번 재생성하며 가장 귀여운 결과를 고른다. 이 한 장이 나머지 51개의 기준이 된다.
- **그리드 출력**: AI에게 "Generate a 3×3 grid of 9 different [ANIMAL] options" 시키면 한 호출로 9가지 시안을 얻고, 그중 가장 귀여운 것만 분리 사용
- **스타일 시드 고정**: Recraft는 Style Library 슬롯에 저장, 다른 도구는 "in the exact same cute style as the previous image" 추가
- **벡터화는 마지막에**: 마음에 드는 PNG가 모이면 한꺼번에 SVG 변환


## 현재 상태

저장소에 들어있는 SVG들은 **시스템 검증용 placeholder**다.
누가 봐도 "임시 자산"이라는 게 보이도록 일부러 단순하게 두었다.
AI로 진짜 자산을 만들어 같은 파일명으로 덮어쓰면 즉시 반영된다.
