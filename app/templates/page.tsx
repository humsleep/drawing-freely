"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

/**
 * 무료 도안 화면  MVP v0
 *
 * - 시즌/이벤트 하이라이트 1개 (큰 카드)
 * - 연령대별 추천 (탭으로 필터 — 복잡한 다중 필터는 만들지 않음)
 * - 테마별 도안 그리드 (동물/탈것/계절/우주/판타지/일상)
 * - 카드별 "받기" 버튼 = MVP에선 토스트만, 백엔드 붙으면 PDF 다운로드로 연결
 *
 * NOTE: 도안 파일/이미지 자산은 아직 없음. 시각만 완성. v1에 실제 파일·다운로드 카운트.
 */

type AgeBand = "4-6" | "7-9" | "10-12" | "all";
type Theme = "animal" | "vehicle" | "season" | "space" | "fantasy" | "daily";

type Template = {
  id: string;
  title: string;
  theme: Theme;
  ageBand: AgeBand;
  hue: number;
  emoji: string;
  isNew?: boolean;
};

const TEMPLATES: Template[] = [
  { id: "t1", title: "사자 가족", theme: "animal", ageBand: "4-6", hue: 35, emoji: "🦁" },
  { id: "t2", title: "기차 여행", theme: "vehicle", ageBand: "7-9", hue: 215, emoji: "🚂", isNew: true },
  { id: "t3", title: "벚꽃 거리", theme: "season", ageBand: "all", hue: 330, emoji: "🌸" },
  { id: "t4", title: "우주 비행", theme: "space", ageBand: "10-12", hue: 250, emoji: "🚀" },
  { id: "t5", title: "정글 친구", theme: "animal", ageBand: "4-6", hue: 120, emoji: "🐯" },
  { id: "t6", title: "바닷가", theme: "season", ageBand: "7-9", hue: 200, emoji: "🏖️" },
  { id: "t7", title: "유니콘 마법", theme: "fantasy", ageBand: "all", hue: 300, emoji: "🦄", isNew: true },
  { id: "t8", title: "우리 집", theme: "daily", ageBand: "4-6", hue: 25, emoji: "🏡" },
  { id: "t9", title: "공룡 세상", theme: "fantasy", ageBand: "7-9", hue: 95, emoji: "🦖" },
];

const THEMES: { id: Theme; label: string; emoji: string }[] = [
  { id: "animal", label: "동물", emoji: "🐶" },
  { id: "vehicle", label: "탈것", emoji: "🚗" },
  { id: "season", label: "계절", emoji: "🌸" },
  { id: "space", label: "우주", emoji: "🚀" },
  { id: "fantasy", label: "판타지", emoji: "🦄" },
  { id: "daily", label: "일상", emoji: "🏡" },
];

const AGE_BANDS: { id: AgeBand; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "4-6", label: "4–6세" },
  { id: "7-9", label: "7–9세" },
  { id: "10-12", label: "10–12세" },
];

export default function TemplatesPage() {
  const [ageBand, setAgeBand] = useState<AgeBand>("all");
  const [toast, setToast] = useState("");

  const recommended = useMemo(
    () =>
      ageBand === "all"
        ? TEMPLATES.slice(0, 6)
        : TEMPLATES.filter((t) => t.ageBand === ageBand || t.ageBand === "all"),
    [ageBand],
  );

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

      {/* 시즌/이벤트 하이라이트 */}
      <section className="px-5 pt-6">
        <a
          href="#event"
          className="block overflow-hidden rounded-3xl bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-700">5월 특별 모음</p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight text-stone-900">
                봄맞이 도안 8장
              </h2>
              <p className="mt-1 text-sm text-stone-700">
                꽃, 나비, 봄 동산 — 한 번에 받아요.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-bold text-white">
                <DownloadIcon className="size-3.5" />
                모음집 받기
              </span>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-1.5" aria-hidden>
              <MiniThumb hue={330} emoji="🌸" />
              <MiniThumb hue={120} emoji="🦋" />
              <MiniThumb hue={50} emoji="🌼" />
              <MiniThumb hue={200} emoji="🐝" />
            </div>
          </div>
        </a>
      </section>

      {/* 연령대별 추천 */}
      <section className="px-5 pt-10">
        <SectionHeader title="우리 아이에게 맞는 도안" />

        <div
          className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="연령대 필터"
        >
          {AGE_BANDS.map((b) => (
            <button
              key={b.id}
              role="tab"
              aria-selected={ageBand === b.id}
              onClick={() => setAgeBand(b.id)}
              className={
                ageBand === b.id
                  ? "shrink-0 rounded-full bg-stone-900 px-4 py-1.5 text-sm font-semibold text-white"
                  : "shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-stone-700 ring-1 ring-stone-200"
              }
            >
              {b.label}
            </button>
          ))}
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {recommended.map((t) => (
            <li key={t.id}>
              <TemplateCard template={t} onDownload={() => onDownload(t)} />
            </li>
          ))}
          {recommended.length === 0 && (
            <li className="col-span-2 sm:col-span-3">
              <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-stone-500 ring-1 ring-stone-200">
                해당 연령대 도안을 준비 중이에요.
              </p>
            </li>
          )}
        </ul>
      </section>

      {/* 테마별 */}
      <section className="px-5 pt-10">
        <SectionHeader title="테마별로 골라보기" />
        <ul className="mt-4 grid grid-cols-3 gap-3">
          {THEMES.map((th) => {
            const count = TEMPLATES.filter((t) => t.theme === th.id).length;
            return (
              <li key={th.id}>
                <a
                  href={`#theme-${th.id}`}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl bg-white px-2 ring-1 ring-stone-200 hover:bg-stone-50"
                >
                  <span className="text-3xl" aria-hidden>
                    {th.emoji}
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    {th.label}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {count}장
                  </span>
                </a>
              </li>
            );
          })}
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

      {/* 하단 탭바 — /, /me, /templates 세 곳에서 동일. 다음 PR에서 공통 컴포넌트로 추출 예정. */}
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
          <TabItem href="/#create" label="만들기">
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

function SectionHeader({ title }: { title: string }) {
  return <h3 className="text-lg font-extrabold text-stone-900">{title}</h3>;
}

function TemplateCard({
  template,
  onDownload,
}: {
  template: Template;
  onDownload: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
      <TemplateThumb hue={template.hue} emoji={template.emoji} badge={template.isNew ? "NEW" : undefined} />
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
