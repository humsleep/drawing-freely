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

  function step(slot: FaceSlot, delta: 1 | -1) {
    setPicks((prev) => {
      const slotDef = FACE_SLOTS.find((s) => s.id === slot);
      if (!slotDef) return prev;
      const max = slotDef.count;
      const next = ((prev[slot] - 1 + delta + max) % max) + 1;
      return { ...prev, [slot]: next };
    });
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

      {/* 얼굴 미리보기 — 200x200 좌표계 위에 8개 SVG 스택 */}
      <section className="px-5 pt-4">
        <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200">
          {FACE_SLOTS.map((slot) => (
            <FacePartLayer
              key={slot.id}
              src={facePartSrc(slot.id, picks[slot.id])}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-stone-500">
          A4로 인쇄해서 색칠할 수 있어요.
        </p>
      </section>

      {/* 슬롯 선택기 */}
      <section className="px-5 pt-6">
        <ul className="flex flex-col gap-2">
          {FACE_SLOTS.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200"
            >
              <span className="w-16 shrink-0 text-sm font-bold text-stone-900">
                {slot.label}
              </span>
              <button
                type="button"
                onClick={() => step(slot.id, -1)}
                aria-label={`${slot.label} 이전`}
                className="grid size-9 place-items-center rounded-full bg-stone-100 text-lg font-bold text-stone-700 active:scale-95"
              >
                ‹
              </button>
              <span className="min-w-12 text-center text-sm font-semibold text-stone-600">
                {picks[slot.id]} / {slot.count}
              </span>
              <button
                type="button"
                onClick={() => step(slot.id, 1)}
                aria-label={`${slot.label} 다음`}
                className="grid size-9 place-items-center rounded-full bg-stone-100 text-lg font-bold text-stone-700 active:scale-95"
              >
                ›
              </button>
            </li>
          ))}
        </ul>
      </section>

      <TabBar />
    </>
  );
}

/* eslint-disable-next-line @next/next/no-img-element */
function FacePartLayer({ src }: { src: string }) {
  // 자산은 정적 SVG. next/image 의 lazy/blur 가 의미 없고, 스택형 합성엔 단순한 <img>가 적합.
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
 * 8개 부품 SVG의 내용을 한 번에 받아와 하나의 SVG로 합친다.
 * 다운로드 시점에만 호출 — 미리보기는 stacked <img>로 충분.
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
