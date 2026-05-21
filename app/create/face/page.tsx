"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TabBar } from "@/app/_components/TabBar";
import {
  FACE_RENDER_ORDER,
  FACE_SLOTS,
  facePartSrc,
  type FaceSlot,
} from "@/lib/assets";
import { savePendingColor } from "@/lib/storage";

type SlotState = Record<FaceSlot, number>;

const INITIAL: SlotState = {
  shape: 1,
  hair: 1,
  eyebrows: 1,
  eyes: 1,
  nose: 1,
  mouth: 1,
  top: 1,
  bottom: 1,
  accessory: 1,
};

/** 슬롯별 식별색 — 썸네일 배경에 옅게 깔아 슬롯 정체성 표현 (Picrew 패턴) */
const SLOT_TINT: Record<FaceSlot, string> = {
  shape: "#fde2cd",       // 살구
  hair: "#e8d5b7",        // 옅은 갈색
  eyebrows: "#f1f5f9",    // 옅은 회색
  eyes: "#dbeafe",        // 옅은 하늘
  nose: "#fce7f3",        // 옅은 분홍
  mouth: "#fecaca",       // 옅은 다홍
  top: "#bfdbfe",         // 옅은 파랑
  bottom: "#fef3c7",      // 옅은 노랑
  accessory: "#ede9fe",   // 라벤더
};

/** 슬롯 탭 이모지 — 한글 라벨 옆에 표시. 한눈에 식별 */
const SLOT_EMOJI: Record<FaceSlot, string> = {
  shape: "🙂",
  hair: "💇",
  eyebrows: "✏️",
  eyes: "👀",
  nose: "👃",
  mouth: "👄",
  top: "👕",
  bottom: "👖",
  accessory: "✨",
};

export default function FaceBuilderPage() {
  const router = useRouter();
  const [picks, setPicks] = useState<SlotState>(INITIAL);
  const [activeTab, setActiveTab] = useState<FaceSlot>("shape");
  const [saving, setSaving] = useState(false);

  const activeSlot =
    FACE_SLOTS.find((s) => s.id === activeTab) ?? FACE_SLOTS[0];

  function pick(slot: FaceSlot, idx: number) {
    setPicks((prev) => ({ ...prev, [slot]: idx }));
  }

  function randomize() {
    const next = Object.fromEntries(
      FACE_SLOTS.map((s) => [s.id, Math.floor(Math.random() * s.count) + 1]),
    ) as SlotState;
    setPicks(next);
  }

  async function onDownload() {
    setSaving(true);
    try {
      const svg = await composeFaceSvg(picks);
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "그림자유-얼굴.svg";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  }

  async function onColor() {
    setSaving(true);
    try {
      const svg = await composeFaceSvg(picks);
      savePendingColor({ source: svg, format: "svg" });
      router.push("/color/local");
    } finally {
      setSaving(false);
    }
  }

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
            disabled={saving}
            aria-label="받기"
            className="grid size-10 place-items-center rounded-full bg-white text-stone-700 ring-1 ring-stone-200 disabled:text-stone-300"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 4v12M6 12l6 6 6-6M5 20h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onColor}
            disabled={saving}
            className="rounded-full bg-violet-600 px-3 py-2 text-xs font-bold text-white disabled:bg-stone-400"
          >
            색칠하기
          </button>
        </div>
      </header>

      {/* 미리보기 — sticky, 크게 (w-44 → w-56), 살구 skin 깔린 얼굴 */}
      <section className="sticky top-0 z-10 bg-[#fffaf3] px-5 pt-3 pb-2">
        <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200 shadow-sm">
          {/* 살구 skin backdrop — 라인아트 뒤에 깔려 '색감 있는' 얼굴이 됨 */}
          <div
            className="absolute rounded-[50%] bg-[#fde2cd]"
            style={{ inset: "22% 28% 12% 28%" }}
            aria-hidden
          />
          {FACE_RENDER_ORDER.map((slotId) => (
            <FacePartLayer
              key={slotId}
              src={facePartSrc(slotId, picks[slotId])}
            />
          ))}

          {/* 🎲 랜덤 버튼 — 미리보기 우상단 floating */}
          <button
            type="button"
            onClick={randomize}
            aria-label="랜덤"
            className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-violet-600 text-2xl text-white shadow-md transition-transform active:scale-90"
          >
            🎲
          </button>
        </div>
      </section>

      {/* 슬롯 탭 — 한 행, 이모지 + 라벨 */}
      <section className="px-5 pt-1">
        <ul
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
          role="tablist"
          aria-label="얼굴 부품 종류"
        >
          {FACE_SLOTS.map((slot) => {
            const isActive = activeTab === slot.id;
            return (
              <li key={slot.id} className="shrink-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(slot.id)}
                  className={
                    "flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-colors " +
                    (isActive
                      ? "bg-violet-600 text-white"
                      : "bg-white text-stone-700 ring-1 ring-stone-200 active:scale-95")
                  }
                >
                  <span aria-hidden>{SLOT_EMOJI[slot.id]}</span>
                  <span>{slot.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 선택된 탭의 썸네일 — 슬롯 식별 색 배경 */}
      <section className="px-5 pb-2">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-stone-200">
          <ul
            className="grid grid-cols-4 gap-3"
            role="radiogroup"
            aria-label={activeSlot.label}
          >
            {Array.from({ length: activeSlot.count }, (_, i) => i + 1).map(
              (idx) => {
                const isSelected = picks[activeTab] === idx;
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${activeSlot.label} ${idx}번`}
                      onClick={() => pick(activeTab, idx)}
                      className={
                        "block aspect-square w-full overflow-hidden rounded-xl transition-all " +
                        (isSelected
                          ? "ring-4 ring-violet-600 ring-offset-2 ring-offset-white"
                          : "ring-1 ring-stone-200 active:scale-95")
                      }
                      style={{ background: SLOT_TINT[activeTab] }}
                    >
                      <SlotThumb
                        slotId={activeTab}
                        idx={idx}
                        currentShape={picks.shape}
                      />
                    </button>
                  </li>
                );
              },
            )}
          </ul>
        </div>
      </section>

      <TabBar />
    </>
  );
}

function FacePartLayer({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      className="absolute inset-0 h-full w-full"
      draggable={false}
    />
  );
}

/**
 * 슬롯 썸네일 — 슬롯 식별색 위에 부품 + 옅은 얼굴 가이드.
 */
function SlotThumb({
  slotId,
  idx,
  currentShape,
}: {
  slotId: FaceSlot;
  idx: number;
  currentShape: number;
}) {
  return (
    <div className="relative h-full w-full">
      {slotId !== "shape" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={facePartSrc("shape", currentShape)}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-25"
          draggable={false}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={facePartSrc(slotId, idx)}
        alt=""
        aria-hidden
        className="relative h-full w-full"
        draggable={false}
      />
    </div>
  );
}

/**
 * 9개 부품 SVG를 z-stack 순서대로 합쳐 단일 SVG 반환.
 * 다운로드/색칠 시점에만 호출.
 */
async function composeFaceSvg(picks: SlotState): Promise<string> {
  const parts = await Promise.all(
    FACE_RENDER_ORDER.map(async (slotId) => {
      const res = await fetch(facePartSrc(slotId, picks[slotId]));
      const text = await res.text();
      const match = text.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
      return match ? match[1] : "";
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="800" height="800">
${parts.join("\n")}
</svg>`;
}
