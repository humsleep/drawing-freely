"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

/**
 * 무료 도안 화면  MVP v0
 *
 * 신뢰 회복 후 단순화:
 * - 연령대 필터 탭 제거 (출시 직후 데이터 적음 → 빈 그리드 부각 위험)
 * - 이벤트 카드, 테마 카드의 죽은 앵커 제거 (보이는 만큼만 약속)
 * - 카드별 "받기" 버튼은 유지 — 토스트로 흐름 마감 (v1에서 실제 PDF로 교체)
 */

type Template = {
  id: string;
  title: string;
  ageBand: "4-6" | "7-9" | "10-12" | "all";
  hue: number;
  emoji: string;
  isNew?: boolean;
};

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
    <main className="mx-auto max-w-md pb-28 sm:max-w-2xl">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-stone-500">
          ← 둘러보기
        </Link>
        <span
          className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
          aria-label="전부 무료"
        >
          전부 무료
        </span>
      </header>

      {/* 타이틀 */}
      <section className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          무료 도안
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          마음에 드는 그림을 골라 인쇄해서, 아이와 함께 색칠해 보세요.
        </p>
      </section>

      {/* 시즌/이벤트 하이라이트 — 클릭 가능한 진입점이 없는 동안 div로 */}
      <section className="px-5 pt-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-700">5월 특별 모음</p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight text-stone-900">
                봄맞이 도안 8장
              </h2>
              <p className="mt-1 text-sm text-stone-700">
                꽃, 나비, 봄 동산 — 곧 한 번에 받을 수 있어요.
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-1.5" aria-hidden>
              <MiniThumb hue={330} emoji="🌸" />
              <MiniThumb hue={120} emoji="🦋" />
              <MiniThumb hue={50} emoji="🌼" />
              <MiniThumb hue={200} emoji="🐝" />
            </div>
          </div>
        </div>
      </section>

      {/* 도안 그리드 — 필터 없이 전체 */}
      <section className="px-5 pt-8">
        <h3 className="text-lg font-extrabold text-stone-900">
          새로 올라온 도안
        </h3>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <li key={t.id}>
              <TemplateCard template={t} onDownload={() => onDownload(t)} />
            </li>
          ))}
        </ul>
      </section>

      {/* 안내 */}
      <section className="px-5 pt-10">
        <p className="text-center text-xs text-stone-500">
          모든 도안은 무료로 인쇄/색칠 용도로 자유롭게 쓸 수 있어요.
        </p>
      </section>

      {/* 토스트 */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-24 z-20 mx-auto w-fit max-w-[90%] rounded-full bg-stone-900/95 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {/* 하단 탭바 */}
      <nav
        aria-label="주요 메뉴"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/90 backdrop-blur"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 sm:max-w-2xl">
          <TabItem href="/" label="둘러보기">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11.5L12 4l9 7.5" />
              <path d="M5 10v9h14v-9" />
            </svg>
          </TabItem>
          <TabItem href="/create" label="만들기">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </TabItem>
          <TabItem href="/templates" label="도안" active>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h9l5 5v13H6z" />
              <path d="M14 3v6h6" />
            </svg>
          </TabItem>
          <TabItem href="/me" label="내 작품">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0116 0" />
            </svg>
          </TabItem>
        </div>
      </nav>
    </main>
  );
}

/* ---------- 인라인 소품들 ---------- */

function TemplateCard({
  template,
  onDownload,
}: {
  template: Template;
  onDownload: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
      <TemplateThumb
        hue={template.hue}
        emoji={template.emoji}
        badge={template.isNew ? "NEW" : undefined}
      />
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-stone-900">
            {template.title}
          </p>
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
          <DownloadIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

function TemplateThumb({
  hue,
  emoji,
  badge,
}: {
  hue: number;
  emoji: string;
  badge?: string;
}) {
  const bg = `hsl(${hue} 75% 94%)`;
  const stroke = `hsl(${hue} 45% 35%)`;
  return (
    <div
      className="relative aspect-square w-full overflow-hidden"
      style={{ background: bg }}
      aria-hidden
    >
      <svg viewBox="0 0 60 60" className="h-full w-full">
        <rect x="6" y="6" width="48" height="48" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-5xl">
        {emoji}
      </span>
      {badge && (
        <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-stone-900">
          {badge}
        </span>
      )}
    </div>
  );
}

function MiniThumb({ hue, emoji }: { hue: number; emoji: string }) {
  return (
    <span
      className="flex size-14 items-center justify-center rounded-xl ring-1 ring-white/60"
      style={{ background: `hsl(${hue} 75% 92%)` }}
    >
      <span className="text-2xl" aria-hidden>
        {emoji}
      </span>
    </span>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v12" />
      <path d="M6 12l6 6 6-6" />
      <path d="M5 20h14" />
    </svg>
  );
}

function TabItem({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium " +
        (active ? "text-stone-900" : "text-stone-400")
      }
    >
      {children}
      <span>{label}</span>
    </Link>
  );
}
