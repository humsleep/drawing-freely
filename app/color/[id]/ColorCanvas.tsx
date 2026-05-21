"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";
import { ANIMALS, ANIMAL_LABEL, animalSrc, type AnimalId } from "@/lib/assets";
import {
  getStoredWork,
  loadPendingColor,
  makeStoredId,
  saveStoredWork,
} from "@/lib/storage";
import type { Work } from "@/lib/types";

const STAMPS = ["⭐", "❤️", "☺️", "🌟", "🌸", "🦋", "🌈", "🐾"] as const;

type Tool =
  | "bucket"
  | "brush"
  | "crayon"
  | "marker"
  | "spray"
  | "stamp"
  | "eraser";
type Width = 6 | 12 | 24;

const CANVAS_W = 800;
const CANVAS_H = 1000;
const LINE_ART_SIZE = 640;
const LINE_ART_X = (CANVAS_W - LINE_ART_SIZE) / 2;
const LINE_ART_Y = (CANVAS_H - LINE_ART_SIZE) / 2;

const MAX_HISTORY = 10;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.5;

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

/** 페인트 통이 첫 자리. 페인트통이 핵심 액션, 나머지는 보조. (Happy Color 패턴) */
const TOOLS: { id: Tool; emoji: string; label: string }[] = [
  { id: "bucket", emoji: "🪣", label: "페인트통" },
  { id: "brush", emoji: "🖌️", label: "브러시" },
  { id: "crayon", emoji: "🖍️", label: "크레용" },
  { id: "marker", emoji: "✏️", label: "마커" },
  { id: "spray", emoji: "💨", label: "스프레이" },
  { id: "stamp", emoji: "⭐", label: "스탬프" },
  { id: "eraser", emoji: "🧽", label: "지우개" },
];

function resolveLineArt(id: string): string | null {
  if (id.startsWith("animal-")) {
    const name = id.slice("animal-".length) as AnimalId;
    if ((ANIMALS as readonly string[]).includes(name)) return animalSrc(name);
  }
  return null;
}

function imageSrcFromBuilderData(data: string): string {
  if (data.startsWith("<svg") || data.startsWith("<?xml")) {
    const blob = new Blob([data], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
  }
  return data;
}

function defaultTitle(id: string, isLocal: boolean): string {
  if (isLocal) return "내가 만든 작품";
  if (id.startsWith("animal-")) {
    const name = id.slice("animal-".length) as AnimalId;
    const label = ANIMAL_LABEL[name];
    if (label) return `${label} 그림`;
  }
  return "내가 만든 작품";
}

export default function ColorCanvas({ id }: { id: string }) {
  const lineArtSrc = resolveLineArt(id);
  const [builderSrc, setBuilderSrc] = useState<string | null>(null);
  const builderRawRef = useRef<string | null>(null);
  const [builderReady, setBuilderReady] = useState(
    id !== "local" && !id.startsWith("local-"),
  );

  const paintRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);

  /** 기본 도구 = 페인트통 (Happy Color 패턴). */
  const [tool, setTool] = useState<Tool>("bucket");
  const [color, setColor] = useState<string>(COLORS[0].hex);
  const [width, setWidth] = useState<Width>(12);
  const [stampEmoji, setStampEmoji] = useState<string>(STAMPS[0]);
  const [toast, setToast] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);

  const activePointers = useRef<Map<number, { x: number; y: number }>>(
    new Map(),
  );
  const pinchInitial = useRef<{ dist: number; zoom: number } | null>(null);

  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const historyRef = useRef<ImageData[]>([]);
  const idxRef = useRef<number>(-1);
  const [, setHistoryVer] = useState(0);
  const canUndo = idxRef.current > 0;
  const canRedo = idxRef.current < historyRef.current.length - 1;

  function snapshot() {
    const ctx = paintRef.current?.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    historyRef.current = historyRef.current.slice(0, idxRef.current + 1);
    historyRef.current.push(data);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    idxRef.current = historyRef.current.length - 1;
    setHistoryVer((v) => v + 1);
  }

  function undo() {
    if (idxRef.current <= 0) return;
    idxRef.current -= 1;
    paintRef.current
      ?.getContext("2d")
      ?.putImageData(historyRef.current[idxRef.current], 0, 0);
    setHistoryVer((v) => v + 1);
  }

  function redo() {
    if (idxRef.current >= historyRef.current.length - 1) return;
    idxRef.current += 1;
    paintRef.current
      ?.getContext("2d")
      ?.putImageData(historyRef.current[idxRef.current], 0, 0);
    setHistoryVer((v) => v + 1);
  }

  useEffect(() => {
    if (id === "local") {
      const p = loadPendingColor();
      if (p) {
        builderRawRef.current = p.source;
        setBuilderSrc(imageSrcFromBuilderData(p.source));
      }
      setBuilderReady(true);
    } else if (id.startsWith("local-")) {
      const w = getStoredWork(id);
      if (w?.lineArtData) {
        builderRawRef.current = w.lineArtData;
        setBuilderSrc(imageSrcFromBuilderData(w.lineArtData));
      }
      setBuilderReady(true);
    }
  }, [id]);

  useEffect(() => {
    const src = id.startsWith("local") ? builderSrc : lineArtSrc;
    if (!src) return;
    const lineCanvas = lineRef.current;
    const paint = paintRef.current;
    if (!lineCanvas || !paint) return;

    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      const ctx = lineCanvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
      ctx.drawImage(img, LINE_ART_X, LINE_ART_Y, LINE_ART_SIZE, LINE_ART_SIZE);

      const pctx = paint.getContext("2d");
      if (pctx) {
        pctx.clearRect(0, 0, paint.width, paint.height);
        const blank = pctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
        historyRef.current = [blank];
        idxRef.current = 0;
        setHistoryVer((v) => v + 1);
      }
    };
  }, [lineArtSrc, builderSrc, id]);

  function getPos(e: React.PointerEvent): { x: number; y: number } | null {
    const canvas = paintRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function applyToolStyle(ctx: CanvasRenderingContext2D) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = width;
    ctx.globalAlpha = 1;
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else if (tool === "crayon") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    } else if (tool === "marker") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = Math.max(3, width - 2);
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
  }

  function drawSpray(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const radius = width * 2;
    const count = 12;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawStamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.font = `${width * 4}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(stampEmoji, x, y);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!paintRef.current) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.current.size >= 2) {
      drawing.current = false;
      lastPoint.current = null;
      const pts = Array.from(activePointers.current.values());
      pinchInitial.current = {
        dist: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y),
        zoom,
      };
      return;
    }
    paintRef.current.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    if (!pos) return;

    if (tool === "bucket") {
      void doBucketFill(pos);
      return;
    }
    const ctx = paintRef.current.getContext("2d");
    if (!ctx) return;
    if (tool === "stamp") {
      drawStamp(ctx, pos.x, pos.y);
      snapshot();
      return;
    }
    if (tool === "spray") {
      drawSpray(ctx, pos.x, pos.y);
      drawing.current = true;
      lastPoint.current = pos;
      return;
    }
    applyToolStyle(ctx);
    drawing.current = true;
    lastPoint.current = pos;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (activePointers.current.size >= 2 && pinchInitial.current) {
      const pts = Array.from(activePointers.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const next = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, pinchInitial.current.zoom * (dist / pinchInitial.current.dist)),
      );
      setZoom(next);
      return;
    }
    if (!drawing.current) return;
    const pos = getPos(e);
    if (!pos || !lastPoint.current) return;
    const ctx = paintRef.current?.getContext("2d");
    if (!ctx) return;
    if (tool === "spray") {
      drawSpray(ctx, pos.x, pos.y);
    } else {
      applyToolStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPoint.current = pos;
  }

  function onPointerUp(e: React.PointerEvent) {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) pinchInitial.current = null;
    if (drawing.current) {
      drawing.current = false;
      lastPoint.current = null;
      const ctx = paintRef.current?.getContext("2d");
      if (ctx) ctx.globalAlpha = 1;
      snapshot();
    }
  }

  async function doBucketFill(pos: { x: number; y: number }) {
    const paint = paintRef.current;
    const line = lineRef.current;
    if (!paint || !line) return;
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
    fill.fill(color, Math.floor(pos.x), Math.floor(pos.y), 30);
    tctx.putImageData(fill.imageData, 0, 0);
    const pctx = paint.getContext("2d");
    if (!pctx) return;
    pctx.globalCompositeOperation = "source-over";
    pctx.globalAlpha = 1;
    pctx.drawImage(temp, 0, 0);
    snapshot();
  }

  function clearAll() {
    const ctx = paintRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    snapshot();
  }

  function composeImage(): HTMLCanvasElement | null {
    const paint = paintRef.current;
    const line = lineRef.current;
    if (!paint || !line) return null;
    const temp = document.createElement("canvas");
    temp.width = CANVAS_W;
    temp.height = CANVAS_H;
    const ctx = temp.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, temp.width, temp.height);
    ctx.drawImage(paint, 0, 0);
    ctx.drawImage(line, 0, 0);
    return temp;
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  }

  function onDownload() {
    const temp = composeImage();
    if (!temp) return;
    temp.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "그림자유-작품.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function onSave() {
    const temp = composeImage();
    if (!temp) return;
    const pngData = temp.toDataURL("image/png");
    const isFromBuilder = id === "local" || id.startsWith("local-");
    const newId = makeStoredId();
    const work: Work = {
      id: newId,
      title: defaultTitle(id, id === "local"),
      ageBand: "7-9",
      nickname: "토토",
      isPublic: false,
      likeCount: 0,
      pngData,
      createdAt: Date.now(),
      sourceId: isFromBuilder ? newId : id,
      lineArtData: isFromBuilder ? builderRawRef.current ?? undefined : undefined,
    };
    saveStoredWork(work);
    showToast("저장됐어요");
  }

  function zoomIn() {
    setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  }
  function zoomOut() {
    setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  }

  const hasLineArt = id.startsWith("local")
    ? builderReady && !!builderSrc
    : !!lineArtSrc;

  return (
    <>
      {/* HEADER — 아이콘만 */}
      <header className="flex items-center justify-between px-5 pt-6">
        <Link
          href="/create"
          aria-label="뒤로"
          className="grid size-10 place-items-center rounded-full bg-white text-stone-700 ring-1 ring-stone-200"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={!hasLineArt}
            aria-label="받기"
            className="grid size-10 place-items-center rounded-full bg-white text-stone-700 ring-1 ring-stone-200 disabled:text-stone-300"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 4v12M6 12l6 6 6-6M5 20h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!hasLineArt}
            aria-label="내 작품에 저장"
            className="grid size-10 place-items-center rounded-full bg-violet-600 text-white shadow-md disabled:bg-stone-400"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 4h14v16l-7-4-7 4z" />
            </svg>
          </button>
        </div>
      </header>

      {/* CANVAS */}
      <section className="px-5 pt-3">
        <div
          className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200"
          style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: "transform 0.15s",
            }}
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
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              aria-label="확대"
              className="grid size-8 place-items-center rounded-full bg-white/95 text-base font-bold text-stone-700 shadow ring-1 ring-stone-200 disabled:text-stone-300"
            >＋</button>
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              aria-label="축소"
              className="grid size-8 place-items-center rounded-full bg-white/95 text-base font-bold text-stone-700 shadow ring-1 ring-stone-200 disabled:text-stone-300"
            >−</button>
          </div>
        </div>
      </section>

      {/* 히스토리 + 지우기 — 작은 아이콘 줄 */}
      <section className="px-5 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              aria-label="되돌리기"
              className="grid size-10 place-items-center rounded-full bg-white text-xl font-bold text-stone-700 ring-1 ring-stone-200 disabled:text-stone-300"
            >↺</button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              aria-label="다시하기"
              className="grid size-10 place-items-center rounded-full bg-white text-xl font-bold text-stone-700 ring-1 ring-stone-200 disabled:text-stone-300"
            >↻</button>
          </div>
          <button
            type="button"
            onClick={clearAll}
            aria-label="전부 지우기"
            className="grid size-10 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-stone-200"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
            </svg>
          </button>
        </div>
      </section>

      {/* 색 팔레트 — 화면 폭 가득, 큰 swatch (Happy Color 패턴) */}
      <section className="px-5 pt-3">
        <ul
          className="grid grid-cols-6 gap-2"
          role="radiogroup"
          aria-label="색"
        >
          {COLORS.map((c) => {
            const isSelected = color === c.hex;
            return (
              <li key={c.hex}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={c.label}
                  onClick={() => setColor(c.hex)}
                  className={
                    "block aspect-square w-full rounded-full transition-all " +
                    (isSelected
                      ? "ring-4 ring-violet-600 ring-offset-2 ring-offset-[#fffaf3]"
                      : "ring-1 ring-stone-200 active:scale-95")
                  }
                  style={{ background: c.hex }}
                />
              </li>
            );
          })}
        </ul>
      </section>

      {/* 도구 — 선택된 도구가 크고 라벤더 (페인트통이 기본) */}
      <section className="px-5 pt-4 pb-3">
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          {TOOLS.map((t) => {
            const isSelected = tool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                aria-pressed={isSelected}
                aria-label={t.label}
                className={
                  "relative shrink-0 grid place-items-center rounded-2xl transition-all " +
                  (isSelected
                    ? "size-14 bg-violet-600 text-3xl shadow-md ring-2 ring-violet-600"
                    : "size-10 bg-white text-xl ring-1 ring-stone-200 active:scale-95")
                }
              >
                <span aria-hidden>{t.emoji}</span>
                {isSelected && (
                  <span
                    className="absolute -bottom-1 right-0 size-4 rounded-full ring-2 ring-white"
                    style={{ background: color }}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 스탬프 종류 picker — 스탬프 선택 시만 */}
      {tool === "stamp" && (
        <section className="px-5 pb-2">
          <ul
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            role="radiogroup"
            aria-label="스탬프 종류"
          >
            {STAMPS.map((s) => {
              const isSelected = stampEmoji === s;
              return (
                <li key={s} className="shrink-0">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`스탬프 ${s}`}
                    onClick={() => setStampEmoji(s)}
                    className={
                      "grid size-10 place-items-center rounded-2xl text-xl transition-colors " +
                      (isSelected
                        ? "bg-violet-600 ring-2 ring-violet-600"
                        : "bg-white ring-1 ring-stone-200 active:scale-95")
                    }
                  >
                    {s}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 굵기 — 페인트통/스탬프 외에만, 아이콘만 */}
      {tool !== "bucket" && tool !== "stamp" && (
        <section className="px-5 pb-2">
          <div className="flex items-center gap-2">
            {[6, 12, 24].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWidth(w as Width)}
                aria-pressed={width === w}
                aria-label={`굵기 ${w}`}
                className={
                  "grid h-10 flex-1 place-items-center rounded-2xl transition-colors " +
                  (width === w
                    ? "bg-violet-600"
                    : "bg-white ring-1 ring-stone-200")
                }
              >
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: w / 1.5,
                    height: w / 1.5,
                    background: width === w ? "white" : "#57534e",
                  }}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-24 z-20 mx-auto w-fit max-w-[90%] rounded-full bg-violet-600/95 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      <TabBar />
    </>
  );
}
