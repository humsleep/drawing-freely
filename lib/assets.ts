/**
 * 자산 매니페스트 — `/public/assets/`의 SVG 파일들을 코드에서 참조하기 위한 인덱스.
 * 파일을 추가/제거하면 여기 카운트도 함께 갱신한다.
 */

export const ANIMALS = [
  "elephant",
  "tiger",
  "giraffe",
  "lion",
  "bear",
  "rabbit",
  "panda",
  "fox",
  "owl",
  "dolphin",
] as const;

export type AnimalId = (typeof ANIMALS)[number];

export const ANIMAL_LABEL: Record<AnimalId, string> = {
  elephant: "코끼리",
  tiger: "호랑이",
  giraffe: "기린",
  lion: "사자",
  bear: "곰",
  rabbit: "토끼",
  panda: "팬더",
  fox: "여우",
  owl: "부엉이",
  dolphin: "돌고래",
};

export function animalSrc(id: AnimalId): string {
  return `/assets/animals/${id}.svg`;
}

export type FaceSlot =
  | "shape"
  | "hair"
  | "eyebrows"
  | "eyes"
  | "nose"
  | "mouth"
  | "top"
  | "bottom";

export const FACE_SLOTS: { id: FaceSlot; label: string; count: number }[] = [
  { id: "shape", label: "얼굴형", count: 5 },
  { id: "hair", label: "머리", count: 6 },
  { id: "eyebrows", label: "눈썹", count: 5 },
  { id: "eyes", label: "눈", count: 6 },
  { id: "nose", label: "코", count: 5 },
  { id: "mouth", label: "입", count: 6 },
  { id: "top", label: "상의", count: 5 },
  { id: "bottom", label: "하의", count: 4 },
];

export function facePartSrc(slot: FaceSlot, index: number): string {
  return `/assets/face/${slot}/${index}.svg`;
}
