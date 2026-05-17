"use client";

import { useState } from "react";
import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";
import type { Template } from "@/lib/types";

const TEMPLATES: Template[] = [
  { id: "t1", title: "사자 가족", ageBand: "4-6", hue: 35, emoji: "🦁" },
  { id: "t2", title: "기차 여행", ageBand: "7-9", hue: 215, emoji: "🚂", isNew: true },
  { id: "t3", title: "벚꽃 거리", ageBand: "all", hue: 330, emoji: "🌸" },
  { id: "t4", title: "우주 비행", ageBand: "10-12", hue: 250, emoji: "🚀" },
  { id: "t5", title: "정글 친구", ageBand: "4-6", hue: 120, emoji: "🐯" },
  { id: "t6", title: "바닷가", ageBand: "7-9", hue: 200, emoji: "🏖️" },
  { id: "t7", title: "유니콘 마법", ageBand: "all", hue: 300, emoji: "🦄", isNew: true },
  { id: "t8", title: "우리 집", ageBand: "4-6", hue: 25, emoji: "🏡" },
  { id: "t9", title: "공룡 세상", ageBand: "7-9", hue: 95, emoji: "🦖" },
];

export default function TemplatesPage() {
  const [toast, setToast] = useState("");

  function onDownload(t: Template) {
    // v0: 실제 다운로드 없음. 백엔드 연결 후 /api/templates/[id]/download 로 교체.
    setToast(`"${t.title}" 도안을 받았어요`);
    window.setTimeout(() => setToast(""), 1800);
  }

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-stone-500">
          ← 둘러보기
        </Link>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          전부 무료
        </span>
      </header>

      <section className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">무료 도안</h1>
        <p className="mt-1 text-sm text-stone-600">
          마음에 드는 그림을 골라 인쇄해서, 아이와 함께 색칠해 보세요.
        </p>
      </section>

      <section className="px-5 pt-6">
        <h3 className="text-lg font-extrabold text-stone-900">새로 올라온 도안</h3>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <li key={t.id}>
              <TemplateCard template={t} onDownload={() => onDownload(t)} />
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 pt-10">
        <p className="text-center text-xs text-stone-500">
          모든 도안은 무료로 인쇄/색칠 용도로 자유롭게 쓸 수 있어요.
        </p>
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

function TemplateCard({
  template,
  onDownload,
}: {
  template: Template;
  onDownload: () => void;
}) {
  const bg = `hsl(${template.hue ?? 0} 75% 94%)`;
  const stroke = `hsl(${template.hue ?? 0} 45% 35%)`;
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
      <div className="relative aspect-square w-full overflow-hidden" style={{ background: bg }} aria-hidden>
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <rect x="6" y="6" width="48" height="48" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-5xl">
          {template.emoji}
        </span>
        {template.isNew && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-stone-900">
            NEW
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-stone-900">{template.title}</p>
          <p className="truncate text-[11px] text-stone-500">
            {template.ageBand === "all" ? "모든 나이" : `${template.ageBand}세`}
          </p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          aria-label={`${template.title} 받기`}
          className="flex shrink-0 items-center justify-center rounded-full bg-stone-900 p-2 text-white active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 4v12" />
            <path d="M6 12l6 6 6-6" />
            <path d="M5 20h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

