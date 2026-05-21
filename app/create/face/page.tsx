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
  accessory: 1, // 1번 = 안 함 (빈 SVG)
};

export default function FaceBuilderPage() {
  const router = useRouter();
  const [picks, setPicks] = useState<SlotState>(INITIAL);
  const [activeTab, setActiveTab] = useState<FaceSlot>("shape");
  const [saving, setSaving] = useState(false);

  const activeSlot = FACE_SLOTS.find((s) => s.id === activeTab) ?? FACE_SLOTS[0];

  function pick(slot: FaceSlot, idx: number) {
    setPicks((prev) => ({ ...prev, [slot]: idx }));
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
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/create" className="text-sm font-medium text-stone-500">
          ← 만들기
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={saving}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-stone-800 ring-1 ring-stone-200 disabled:text-stone-400"
          >
            {saving ? "…" : "받기"}
          </button>
          <button
            type="button"
            onClick={onColor}
            disabled={saving}
            className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white disabled:bg-stone-400"
          >
            색칠하기
          </button>
        </div>
      </header>

      {/* 얼굴 미리보기 — sticky */}
      <section className="sticky top-0 z-10 bg-[#fffaf3] px-5 pt-3 pb-2">
        <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
          {FACE_RENDER_ORDER.map((slotId) => (
            <FacePartLayer
              key={slotId}
              src={facePartSrc(slotId, picks[slotId])}
            />
          ))}
        </div>
      </section>

      {/* 슬롯 탭 — 한 행 가로 스크롤 */}
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
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors " +
                    (isActive
                      ? "bg-violet-600 text-white"
                      : "bg-white text-stone-700 ring-1 ring-stone-200 active:scale-95")
                  }
                >
                  {slot.label}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 선택된 탭의 썸네일 그리드 */}
      <section className="px-5 pb-2">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-stone-200">
          <p className="mb-2 text-xs font-semibold text-stone-500">
            {activeSlot.label} 고르기
          </p>
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
                        "block aspect-square w-full overflow-hidden rounded-xl bg-white transition-all " +
                        (isSelected
                          ? "ring-4 ring-violet-600 ring-offset-2 ring-offset-white"
                          : "ring-1 ring-stone-200 active:scale-95")
                      }
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
 * 슬롯 썸네일 — 자기 부품 + 현재 얼굴형(아주 옅게)을 함께 보여줘
 * 어린이가 직관적으로 "어디에 붙는지" 알게 한다.
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
          className="absolute inset-0 h-full w-full opacity-20"
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
