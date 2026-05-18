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
- 흰 면이 필요하면 `fill="white"`로 닫기

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
└── face/                   # 얼굴 빌더용 (각 슬롯 5–6종)
    ├── shape/    1.svg ... 5.svg   (얼굴 윤곽)
    ├── eyes/     1.svg ... 6.svg
    ├── eyebrows/ 1.svg ... 5.svg
    ├── nose/     1.svg ... 5.svg
    ├── mouth/    1.svg ... 6.svg
    ├── hair/     1.svg ... 6.svg
    ├── top/      1.svg ... 5.svg   (상의)
    └── bottom/   1.svg ... 4.svg   (하의)
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
- **bottom (하의)**: 보통 안 보임(상의가 가림). 전신 모드용 예비

> 부품이 자기 위치 밖으로 그려지지 않게 디자이너/AI에게 명시해야 한다.

## AI로 자산 생성하는 법

OpenAI image edit / DALL·E 3 / Replicate의 line-art 모델 어디든 OK.
프롬프트 템플릿:

### 동물

```
A simple black-and-white line drawing of a [ANIMAL] for a children's coloring book.
Clean closed lines only. No shading, no color fill, no patterns.
Centered in a 200x200 pixel square with margin around edges.
Front view, friendly cartoon style, suitable for kids age 4–12.
Suitable for printing on A4 paper and coloring with crayons.
Stroke weight medium, rounded line caps.
White background, transparent areas where coloring goes.
```

치환: `[ANIMAL]` → elephant / tiger / giraffe / ...

### 얼굴 부품

```
A simple black-and-white line drawing of [PART] for a kids' character builder.
Drawn in a 200x200 SVG canvas, positioned [POSITION] of the canvas.
Clean closed lines, no shading, no color fill.
Front-facing, suitable for kids age 4–12, friendly cartoon style.
Stroke weight medium, rounded line caps.
The rest of the canvas is empty/transparent.
```

치환 예:
- `[PART]`: "a round face shape (oval outline only)"
- `[POSITION]`: "centered, occupying the middle 60%"

| 슬롯 | PART 예시 |
|---|---|
| shape | "a round face outline" / "an oval face outline" / "a square face outline" |
| eyes | "two big round eyes" / "two small curved eyes" / "two star-shaped eyes" |
| eyebrows | "straight thick eyebrows" / "curved eyebrows" / "thin arched eyebrows" |
| nose | "a small triangle nose" / "a round button nose" |
| mouth | "a smiling mouth" / "a small round mouth" / "a wide grin showing teeth" |
| hair | "short curly hair" / "long straight hair" / "a ponytail" |
| top | "a t-shirt outline" / "a striped sweater" / "a dress top" |
| bottom | "shorts outline" / "long pants outline" / "a skirt outline" |

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

- **그리드 출력**: AI에게 "Generate a 3×3 grid of 9 different [ANIMAL] options" 시키면 한 호출로 9가지 시안을 얻고, 그중 마음에 드는 것만 분리 사용
- **스타일 시드 고정**: 첫 동물 디자인 마음에 들면, 다른 동물 프롬프트에 "in the same style as the previous image" 추가
- **벡터화는 마지막에**: 마음에 드는 PNG가 모이면 한꺼번에 SVG 변환

## 현재 상태

저장소에 들어있는 SVG들은 **시스템 검증용 placeholder**다.
누가 봐도 "임시 자산"이라는 게 보이도록 일부러 단순하게 두었다.
AI로 진짜 자산을 만들어 같은 파일명으로 덮어쓰면 즉시 반영된다.
