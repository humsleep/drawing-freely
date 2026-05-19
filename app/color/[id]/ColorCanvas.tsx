"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";
import { ANIMALS, animalSrc, type AnimalId } from "@/lib/assets";

/**
 * 색칠 캔버스 — 두 캔버스 스택.
 *
 *   하단(paint):  사용자가 손가락으로 그림. pointer 이벤트 받음. 초기 투명.
 *   상단(line):   도안 SVG가 그려진 캔버스. pointer-events: none. 항상 위에 보임.
 *
 * 페인트 통(flood fill)은 paint+line 을 임시 캔버스에 합성한 뒤 q-floodfill 돌리고
 * 결과를 paint 캔버스에 다시 그린다. 선은 그대로 보존된다(상단 캔버스 무변경).
 *
 * 향후 단계:
 *   #5 — 크레용·마커·스프레이·스탬프
 *   #7 — undo/redo
 *   #8 — 받기·내 작품 저장·공개 토글
 */

type Tool = "brush" | "bucket" | "eraser";
type Width = 6 | 12 | 24;

const CANVAS_W = 800;
const CANVAS_H = 1000;
const LINE_ART_SIZE = 640;
const LINE_ART_X = (CANVAS_W - LINE_ART_SIZE) / 2;
const LINE_ART_Y = (CANVAS_H - LINE_ART_SIZE) / 2;

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

const WIDTHS: { value: Width; label: string }[] = [
  { value: 6, label: "얇게" },
  { value: 12, label: "보통" },
  { value: 24, label: "굵게" },
];

function resolveLineArt(id: string): string | null {
  if (id.startsWith("animal-")) {
    const name = id.slice("animal-".length) as AnimalId;
    if ((ANIMALS as readonly string[]).includes(name)) return animalSrc(name);
  }
  return null;
}

export default function ColorCanvas({ id }: { id: string }) {
  const lineArtSrc = resolveLineArt(id);

  const paintRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState<string>(COLORS[0].hex);
  const [width, setWidth] = useState<Width>(12);

  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // 선화 캔버스에 SVG 베이크
  useEffect(() => {
    if (!lineArtSrc) return;
    const canvas = lineRef.current;
    if (!canvas) return;
    const img = new window.Image();
    img.src = lineArtSrc;
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, LINE_ART_X, LINE_ART_Y, LINE_ART_SIZE, LINE_ART_SIZE);
    };
  }, [lineArtSrc]);

  function getPos(e: React.PointerEvent): { x: number; y: number } | null {
    const canvas = paintRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!paintRef.current) return;
    paintRef.current.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    if (!pos) return;

    if (tool === "bucket") {
      void doBucketFill(pos);
      return;
    }

    const ctx = paintRef.current.getContext("2d");
    if (!ctx) return;

    drawing.current = true;
    lastPoint.current = pos;

    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
    // 한 번만 탭해도 점이 찍히도록
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drawing.current) return;
    const pos = getPos(e);
    if (!pos || !lastPoint.current) return;
    const ctx = paintRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPoint.current = pos;
  }

  function onPointerUp() {
    drawing.current = false;
    lastPoint.current = null;
  }

  async function doBucketFill(pos: { x: number; y: number }) {
    const paint = paintRef.current;
    const line = lineRef.current;
    if (!paint || !line) return;

    // 임시 캔버스: 흰 바탕 + 페인트 + 선화 합성 (선이 flood fill의 벽 역할)
    const temp = document.createElement("canvas");
    temp.width = paint.width;
    temp.height = paint.height;
    const tctx = temp.getContext("2d");
    if (!tctx) return;
    tctx.fillStyle = "#ffffff";
    tctx.fillRect(0, 0, temp.width, temp.height);
    tctx.drawImage(paint, 0, 0);
    tctx.drawImage(line, 0, 0);

    const { default: FloodFill } = await import("q-floodfill");
    const imgData = tctx.getImageData(0, 0, temp.width, temp.height);
    const fill = new FloodFill(imgData);
    // tolerance 30: 안티앨리어스된 선 가장자리도 자연스럽게 덮음
    fill.fill(color, Math.floor(pos.x), Math.floor(pos.y), 30);
    tctx.putImageData(fill.imageData, 0, 0);

    // 결과를 페인트 캔버스로 (선은 상단 캔버스에서 그대로 보임)
    const pctx = paint.getContext("2d");
    if (!pctx) return;
    pctx.globalCompositeOperation = "source-over";
    pctx.drawImage(temp, 0, 0);
  }

  function clearAll() {
    const ctx = paintRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/create" className="text-sm font-medium text-stone-500">
          ← 만들기
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="inline-block size-6 rounded-full ring-2 ring-stone-200"
            style={{ background: color }}
            aria-label="선택된 색"
          />
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700"
          >
            전부 지우기
          </button>
        </div>
      </header>

      {!lineArtSrc && (
        <p className="px-5 pt-3 text-xs text-rose-600">
          도안을 찾을 수 없어요.{" "}
          <Link href="/create" className="underline">
            새로 만들기
          </Link>
        </p>
      )}

      <section className="px-5 pt-3">
        <div
          className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200"
          style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
        >
          <canvas
            ref={paintRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="absolute inset-0 h-full w-full"
            style={{ touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          <canvas
            ref={lineRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        </div>
      </section>

      {/* 도구 선택 */}
      <section className="px-5 pt-3">
        <div className="grid grid-cols-3 gap-2">
          <ToolButton
            active={tool === "brush"}
            onClick={() => setTool("brush")}
            label="브러시"
            emoji="🖌️"
          />
          <ToolButton
            active={tool === "bucket"}
            onClick={() => setTool("bucket")}
            label="페인트통"
            emoji="🪣"
          />
          <ToolButton
            active={tool === "eraser"}
            onClick={() => setTool("eraser")}
            label="지우개"
            emoji="🧽"
          />
        </div>
      </section>

      {/* 굵기 — 브러시·지우개일 때만 */}
      {tool !== "bucket" && (
        <section className="px-5 pt-3">
          <div className="grid grid-cols-3 gap-2">
            {WIDTHS.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => setWidth(w.value)}
                aria-pressed={width === w.value}
                className={
                  "flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors " +
                  (width === w.value
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-700 ring-1 ring-stone-200")
                }
              >
                <span
                  className="inline-block rounded-full bg-current"
                  style={{ width: w.value / 1.5, height: w.value / 1.5 }}
                  aria-hidden
                />
                {w.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 색 팔레트 */}
      <section className="px-5 pt-3">
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
      </section>

      <TabBar />
    </>
  );
}

function ToolButton({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2.5 text-xs font-semibold transition-colors " +
        (active
          ? "bg-stone-900 text-white"
          : "bg-white text-stone-700 ring-1 ring-stone-200")
      }
    >
      <span className="text-lg" aria-hidden>
        {emoji}
      </span>
      {label}
    </button>
  );
}
