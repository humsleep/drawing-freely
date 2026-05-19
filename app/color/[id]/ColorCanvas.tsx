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
const BRUSH_COLOR = "#e11d48"; // 빨강 — 구분되게 (다음 단계에서 팔레트로 교체)
const BRUSH_WIDTH = 12;

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
      { points: [pos.x, pos.y], color: BRUSH_COLOR, width: BRUSH_WIDTH },
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

      <section className="px-5 pt-4">
        <h1 className="text-lg font-extrabold text-stone-900">색칠하기</h1>
        {lineArtSrc ? (
          <p className="mt-1 text-xs text-stone-500">
            손가락으로 그려 색칠해요.  (지금은 빨강 한 가지)
          </p>
        ) : (
          <p className="mt-1 text-xs text-rose-600">
            도안을 찾을 수 없어요.{" "}
            <Link href="/create" className="underline">새로 만들기</Link>
          </p>
        )}
      </section>

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
        <p className="mt-3 text-center text-xs text-stone-500">
          다음 PR에서 도구·색·페인트통 추가 예정
        </p>
      </section>

      <TabBar />
    </>
  );
}
