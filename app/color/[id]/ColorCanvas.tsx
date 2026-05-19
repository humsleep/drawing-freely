"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Line as KonvaLine,
} from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { TabBar } from "@/app/_components/TabBar";
import { ANIMALS, animalSrc, type AnimalId } from "@/lib/assets";

/**
 * 색칠 캔버스 — 최소 골조 (#2 단계).
 *
 * 레이어 순서 (아래 → 위):
 *   1. 색칠 레이어 — 사용자의 선들을 그림 (현재: 빨강·굵기 12 고정)
 *   2. 선화 레이어 — 도안 SVG. fill="none"이라 색이 비쳐 보인다.
 *
 * 향후 단계:
 *   #3 — 브러시(perfect-freehand) + 지우개 + 굵기 슬라이더
 *   #4 — 페인트 통 (q-floodfill)
 *   #5 — 크레용·마커·스프레이·스탬프
 *   #6 — 색 팔레트
 *   #7 — undo/redo
 *   #8 — 받기·내 작품 저장·공개 토글
 */

const STAGE_W = 400;
const STAGE_H = 500;
const BRUSH_WIDTH = 12;

/** 어린이용 12색 팔레트 — Tailwind 500 톤 기준, 채도 높고 흰 배경 위에서 잘 보임. */
const COLORS = [
  { label: "빨강", hex: "#ef4444" },
  { label: "주황", hex: "#f97316" },
  { label: "노랑", hex: "#eab308" },
  { label: "연두", hex: "#84cc16" },
  { label: "초록", hex: "#22c55e" },
  { label: "하늘", hex: "#06b6d4" },
  { label: "파랑", hex: "#3b82f6" },
  { label: "보라", hex: "#a855f7" },
  { label: "분홍", hex: "#ec4899" },
  { label: "갈색", hex: "#a16207" },
  { label: "회색", hex: "#6b7280" },
  { label: "검정", hex: "#1f1b16" },
] as const;

type Stroke = { points: number[]; color: string; width: number };

function resolveLineArt(id: string): string | null {
  if (id.startsWith("animal-")) {
    const name = id.slice("animal-".length) as AnimalId;
    if ((ANIMALS as readonly string[]).includes(name)) {
      return animalSrc(name);
    }
  }
  return null;
}

export default function ColorCanvas({ id }: { id: string }) {
  const lineArtSrc = resolveLineArt(id);
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState<string>(COLORS[0].hex);
  const drawing = useRef(false);

  // 선화 이미지 로드
  useEffect(() => {
    if (!lineArtSrc) return;
    const img = new window.Image();
    img.src = lineArtSrc;
    const onLoad = () => setImage(img);
    img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
  }, [lineArtSrc]);

  function startStroke(e: KonvaEventObject<MouseEvent | TouchEvent>) {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    drawing.current = true;
    setStrokes((prev) => [
      ...prev,
      { points: [pos.x, pos.y], color, width: BRUSH_WIDTH },
    ]);
  }

  function extendStroke(e: KonvaEventObject<MouseEvent | TouchEvent>) {
    if (!drawing.current) return;
    // 모바일에서 손가락 드래그 시 스크롤 차단
    if (e.evt && "preventDefault" in e.evt) e.evt.preventDefault();
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    setStrokes((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      return [
        ...prev.slice(0, -1),
        { ...last, points: [...last.points, pos.x, pos.y] },
      ];
    });
  }

  function endStroke() {
    drawing.current = false;
  }

  function clear() {
    setStrokes([]);
  }

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/create" className="text-sm font-medium text-stone-500">
          ← 만들기
        </Link>
        <button
          type="button"
          onClick={clear}
          disabled={strokes.length === 0}
          className="rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium text-stone-700 disabled:text-stone-400"
        >
          전부 지우기
        </button>
      </header>

      <section className="flex items-center justify-between px-5 pt-4">
        <h1 className="text-lg font-extrabold text-stone-900">색칠하기</h1>
        {/* 현재 색 미리보기 — 스크롤로 팔레트가 안 보일 때 확인용 */}
        <span
          className="inline-block size-6 rounded-full ring-2 ring-stone-200"
          style={{ background: color }}
          aria-label={`선택된 색`}
        />
      </section>
      {!lineArtSrc && (
        <p className="px-5 pt-1 text-xs text-rose-600">
          도안을 찾을 수 없어요.{" "}
          <Link href="/create" className="underline">새로 만들기</Link>
        </p>
      )}

      <section className="px-5 pt-4">
        <div
          className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200"
          style={{ touchAction: "none" }}
        >
          <Stage
            width={STAGE_W}
            height={STAGE_H}
            onMouseDown={startStroke}
            onMouseMove={extendStroke}
            onMouseUp={endStroke}
            onMouseLeave={endStroke}
            onTouchStart={startStroke}
            onTouchMove={extendStroke}
            onTouchEnd={endStroke}
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: `${STAGE_W} / ${STAGE_H}`,
            }}
          >
            {/* 색칠 레이어 (아래) */}
            <Layer listening={false}>
              {strokes.map((s, i) => (
                <KonvaLine
                  key={i}
                  points={s.points}
                  stroke={s.color}
                  strokeWidth={s.width}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="source-over"
                />
              ))}
            </Layer>
            {/* 선화 레이어 (위) — fill="none" 이라 색이 비쳐 보인다 */}
            <Layer listening={false}>
              {image && (
                <KonvaImage
                  image={image}
                  x={STAGE_W / 2 - 160}
                  y={STAGE_H / 2 - 160}
                  width={320}
                  height={320}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </section>

      {/* 색 팔레트 — 가로 스크롤, 선택된 색은 검정 링 */}
      <section className="px-5 pt-4">
        <h2 className="sr-only">색 고르기</h2>
        <ul
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="radiogroup"
          aria-label="색"
        >
          {COLORS.map((c) => {
            const isSelected = color === c.hex;
            return (
              <li key={c.hex} className="shrink-0">
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={c.label}
                  onClick={() => setColor(c.hex)}
                  className={
                    "size-10 rounded-full transition-all " +
                    (isSelected
                      ? "ring-4 ring-stone-900 ring-offset-2 ring-offset-white"
                      : "ring-1 ring-stone-200 active:scale-95")
                  }
                  style={{ background: c.hex }}
                />
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-center text-xs text-stone-500">
          다음 단계: 지우개·페인트 통·굵기 슬라이더
        </p>
      </section>

      <TabBar />
    </>
  );
}
