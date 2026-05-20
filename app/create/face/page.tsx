"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TabBar } from "@/app/_components/TabBar";
import { FACE_SLOTS, facePartSrc, type FaceSlot } from "@/lib/assets";
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
};

export default function FaceBuilderPage() {
  const router = useRouter();
  const [picks, setPicks] = useState<SlotState>(INITIAL);
  const [saving, setSaving] = useState(false);

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
            className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-bold text-white disabled:bg-stone-400"
          >
            색칠하기
          </button>
        </div>
      </header>

      {/* 얼굴 미리보기 — sticky로 슬롯을 스크롤해도 항상 보이게 */}
      <section className="sticky top-0 z-10 bg-[#fffaf3] px-5 pt-3 pb-2">
        <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
          {FACE_SLOTS.map((slot) => (
            <FacePartLayer
              key={slot.id}
              src={facePartSrc(slot.id, picks[slot.id])}
            />
          ))}
        </div>
      </section>

      {/* 슬롯 — 각 슬롯이 카드. 라벨 + 가로 썸네일 행. 탭으로 직접 선택. */}
      <section className="px-5 pt-2 pb-2">
        <ul className="flex flex-col gap-3">
          {FACE_SLOTS.map((slot) => (
            <li
              key={slot.id}
              className="rounded-2xl bg-white p-3 ring-1 ring-stone-200"
            >
              <p className="mb-2 text-xs font-bold text-stone-700">
                {slot.label}
              </p>
              <ul
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
                role="radiogroup"
                aria-label={slot.label}
              >
                {Array.from({ length: slot.count }, (_, i) => i + 1).map(
                  (idx) => {
                    const isSelected = picks[slot.id] === idx;
                    return (
                      <li key={idx} className="shrink-0">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`${slot.label} ${idx}번`}
                          onClick={() => pick(slot.id, idx)}
                          className={
                            "block size-16 overflow-hidden rounded-xl bg-white transition-all " +
                            (isSelected
                              ? "ring-4 ring-stone-900 ring-offset-2 ring-offset-white"
                              : "ring-1 ring-stone-200 active:scale-95")
                          }
                        >
                          <SlotThumb
                            slotId={slot.id}
                            idx={idx}
                            currentShape={picks.shape}
                          />
                        </button>
                      </li>
                    );
                  },
                )}
              </ul>
            </li>
          ))}
        </ul>
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
 * 슬롯 썸네일 — 자기 부품 SVG + 현재 얼굴형(아주 옅게)을 함께 보여줘
 * 어린이가 "이게 어떤 부품인지" 직관적으로 알게 한다.
 *  - shape 슬롯은 자기 자신이 얼굴형이라 가이드 안 보임.
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
 * 8개 부품 SVG의 내용을 한 번에 받아와 하나의 SVG로 합친다.
 * 다운로드/색칠 시점에만 호출 — 미리보기는 stacked <img>로 충분.
 */
async function composeFaceSvg(picks: SlotState): Promise<string> {
  const parts = await Promise.all(
    FACE_SLOTS.map(async (slot) => {
      const res = await fetch(facePartSrc(slot.id, picks[slot.id]));
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
