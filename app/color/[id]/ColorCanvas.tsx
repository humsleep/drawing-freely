"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";
import {
  ANIMALS,
  ANIMAL_LABEL,
  animalSrc,
  type AnimalId,
} from "@/lib/assets";
import {
  loadPendingColor,
  makeStoredId,
  saveStoredWork,
} from "@/lib/storage";
import type { Work } from "@/lib/types";

type Tool = "brush" | "crayon" | "marker" | "spray" | "stamp" | "bucket" | "eraser";
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

const WIDTHS: { value: Width; label: string }[] = [
  { value: 6, label: "얇게" },
  { value: 12, label: "보통" },
  { value: 24, label: "굵게" },
];

const TOOLS: { id: Tool; label: string; emoji: string }[] = [
  { id: "brush", label: "브러시", emoji: "🖌️" },
  { id: "crayon", label: "크레용", emoji: "🖍️" },
  { id: "marker", label: "마커", emoji: "✏️" },
  { id: "spray", label: "스프레이", emoji: "💨" },
  { id: "stamp", label: "스탬프", emoji: "⭐" },
  { id: "bucket", label: "페인트통", emoji: "🪣" },
  { id: "eraser", label: "지우개", emoji: "🧽" },
];

function resolveLineArt(id: string): string | null {
  if (id.startsWith("animal-")) {
    const name = id.slice("animal-".length) as AnimalId;
    if ((ANIMALS as readonly string[]).includes(name)) return animalSrc(name);
  }
  return null;
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
  // 빌더 결과(localStorage `pendingColor`)에서 가져온 SVG/PNG 마크업
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const [pendingReady, setPendingReady] = useState(id !== "local");

  const paintRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState<string>(COLORS[0].hex);
  const [width, setWidth] = useState<Width>(12);
  const [toast, setToast] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);

  // 멀티터치 관리 — 두 손가락 핀치 시 그리기 중단
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchInitial = useRef<{ dist: number; zoom: number } | null>(null);

  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // 히스토리
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
    const target = historyRef.current[idxRef.current];
    paintRef.current?.getContext("2d")?.putImageData(target, 0, 0);
    setHistoryVer((v) => v + 1);
  }

  function redo() {
    if (idxRef.current >= historyRef.current.length - 1) return;
    idxRef.current += 1;
    const target = historyRef.current[idxRef.current];
    paintRef.current?.getContext("2d")?.putImageData(target, 0, 0);
    setHistoryVer((v) => v + 1);
  }

  // 1) `local` id면 pendingColor 로드, 2) 선화 캔버스에 베이크
  useEffect(() => {
    if (id === "local") {
      const p = loadPendingColor();
      if (p) {
        if (p.format === "svg") {
          const blob = new Blob([p.source], { type: "image/svg+xml" });
          setPendingSrc(URL.createObjectURL(blob));
        } else {
          setPendingSrc(p.source);
        }
      }
      setPendingReady(true);
    }
  }, [id]);

  useEffect(() => {
    const src = id === "local" ? pendingSrc : lineArtSrc;
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
        // 페인트 캔버스 초기화 + 히스토리 시작점
        pctx.clearRect(0, 0, paint.width, paint.height);
        const blank = pctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
        historyRef.current = [blank];
        idxRef.current = 0;
        setHistoryVer((v) => v + 1);
      }
    };
  }, [lineArtSrc, pendingSrc, id]);

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
      // 크레용 — 반투명, 겹치면 진해짐
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    } else if (tool === "marker") {
      // 마커 — 살짝 진한 단단한 선
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = Math.max(3, width - 2);
    } else {
      // brush
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
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
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
    ctx.fillText("⭐", x, y);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!paintRef.current) return;

    // 멀티터치 핀치 시작
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.current.size >= 2) {
      drawing.current = false;
      lastPoint.current = null;
      const pts = Array.from(activePointers.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchInitial.current = { dist, zoom };
      return;
    }

    paintRef.current.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    if (!pos) return;

    if (tool === "bucket") {
      void doBucketFill(pos);
      return;
    }
    if (tool === "stamp") {
      const ctx = paintRef.current.getContext("2d");
      if (!ctx) return;
      drawStamp(ctx, pos.x, pos.y);
      snapshot();
      return;
    }
    if (tool === "spray") {
      const ctx = paintRef.current.getContext("2d");
      if (!ctx) return;
      drawSpray(ctx, pos.x, pos.y);
      drawing.current = true;
      lastPoint.current = pos;
      return;
    }

    const ctx = paintRef.current.getContext("2d");
    if (!ctx) return;
    applyToolStyle(ctx);
    drawing.current = true;
    lastPoint.current = pos;
    // 한 번만 탭해도 점 찍힘
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    // 핀치 줌
    if (activePointers.current.size >= 2 && pinchInitial.current) {
      const pts = Array.from(activePointers.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const ratio = dist / pinchInitial.current.dist;
      const next = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, pinchInitial.current.zoom * ratio),
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
    const isLocal = id === "local";
    const work: Work = {
      id: makeStoredId(),
      title: defaultTitle(id, isLocal),
      ageBand: "7-9",
      nickname: "토토",
      isPublic: false,
      likeCount: 0,
      pngData,
      createdAt: Date.now(),
      sourceId: isLocal ? undefined : id,
    };
    saveStoredWork(work);
    showToast("내 작품에 저장됐어요");
  }

  function zoomIn() {
    setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  }
  function zoomOut() {
    setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  }

  const hasLineArt = id === "local" ? pendingReady && !!pendingSrc : !!lineArtSrc;

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/create" className="text-sm font-medium text-stone-500">
          ← 만들기
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={!hasLineArt}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-stone-800 ring-1 ring-stone-200 disabled:text-stone-400"
          >
            받기
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!hasLineArt}
            className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-bold text-white disabled:bg-stone-400"
          >
            저장
          </button>
        </div>
      </header>

      {!hasLineArt && id !== "local" && (
        <p className="px-5 pt-3 text-xs text-rose-600">
          도안을 찾을 수 없어요.{" "}
          <Link href="/templates" className="underline">
            도안 골라보기
          </Link>
        </p>
      )}
      {id === "local" && pendingReady && !pendingSrc && (
        <p className="px-5 pt-3 text-xs text-rose-600">
          색칠할 그림이 없어요.{" "}
          <Link href="/create" className="underline">
            새로 만들기
          </Link>
        </p>
      )}

      <section className="px-5 pt-3">
        <div
          className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200"
          style={{
            aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
            position: "relative",
          }}
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
          {/* 줌 컨트롤 — 우상단 */}
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              aria-label="확대"
              className="grid size-8 place-items-center rounded-full bg-white/95 text-base font-bold text-stone-700 shadow ring-1 ring-stone-200 disabled:text-stone-300"
            >
              ＋
            </button>
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              aria-label="축소"
              className="grid size-8 place-items-center rounded-full bg-white/95 text-base font-bold text-stone-700 shadow ring-1 ring-stone-200 disabled:text-stone-300"
            >
              −
            </button>
          </div>
        </div>
      </section>

      {/* 도구 + 히스토리 (가로 스크롤 한 줄) */}
      <section className="px-5 pt-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {TOOLS.map((t) => (
            <ToolButton
              key={t.id}
              active={tool === t.id}
              onClick={() => setTool(t.id)}
              label={t.label}
              emoji={t.emoji}
            />
          ))}
          <SmallIconButton onClick={undo} disabled={!canUndo} label="되돌리기">
            ↺
          </SmallIconButton>
          <SmallIconButton onClick={redo} disabled={!canRedo} label="다시하기">
            ↻
          </SmallIconButton>
        </div>
      </section>

      {/* 굵기 — 페인트통/스탬프 외에는 적용 */}
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

      {/* 색 + 전부 지우기 */}
      <section className="px-5 pt-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-block size-6 shrink-0 rounded-full ring-2 ring-stone-200"
            style={{ background: color }}
            aria-label="선택된 색"
          />
          <ul
            className="flex flex-1 gap-2 overflow-x-auto pb-1"
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
                      "size-9 rounded-full transition-all " +
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
          <button
            type="button"
            onClick={clearAll}
            aria-label="전부 지우기"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-600"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
            </svg>
          </button>
        </div>
      </section>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-24 z-20 mx-auto w-fit max-w-[90%] rounded-full bg-stone-900/95 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}

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
        "flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors " +
        (active
          ? "bg-stone-900 text-white"
          : "bg-white text-stone-700 ring-1 ring-stone-200") +
        " min-w-14"
      }
    >
      <span className="text-lg" aria-hidden>
        {emoji}
      </span>
      {label}
    </button>
  );
}

function SmallIconButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-xl font-bold text-stone-700 ring-1 ring-stone-200 disabled:text-stone-300"
    >
      {children}
    </button>
  );
}
