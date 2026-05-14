"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

/**
 * 만들기 (Create)  MVP v0
 *
 * 세 단계: pick → converting → result.
 * 핵심은 "흐름이 닫혀 있다"는 것. 실제 변환 API는 lib/convert.ts 추가 후 연결.
 *
 * 의도적으로 안 한 것:
 * - 사진 미리보기 (선택한 사진을 가짜로 도안인 척 보여주는 것 X)
 * - "저장됨" 알림 (백엔드 없이 거짓말 X)
 * - 자녀 프로필 모달 (첫 만들기 시점 정의는 백엔드 후)
 */

type Stage = "pick" | "converting" | "result";

export default function CreatePage() {
  const [stage, setStage] = useState<Stage>("pick");

  function onPick(file: File | null) {
    if (!file) return;
    // 실제 변환 호출은 /api/convert 추가 시 lib/convert.ts 한 곳에서.
    setStage("converting");
    window.setTimeout(() => setStage("result"), 1500);
  }

  function reset() {
    setStage("pick");
  }

  return (
    <main className="mx-auto max-w-md pb-28 sm:max-w-2xl">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-stone-500">
          ← 둘러보기
        </Link>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          새로 만들기
        </span>
      </header>

      {stage === "pick" && <PickStage onPick={onPick} />}
      {stage === "converting" && <ConvertingStage />}
      {stage === "result" && <ResultStage onReset={reset} />}

      {/* 하단 탭바 — /, /me, /templates, /ranking, /create 다섯 곳에서 동일. 다음 PR에서 추출. */}
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
          <TabItem href="/create" label="만들기" active>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </TabItem>
          <TabItem href="/templates" label="도안">
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

/* ---------- 단계별 화면 ---------- */

function PickStage({ onPick }: { onPick: (file: File | null) => void }) {
  return (
    <>
      <section className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          사진으로 도안 만들기
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          사진 한 장이면 색칠 도안으로 바꿔드려요.
        </p>
      </section>

      <section className="px-5 pt-6">
        <div className="rounded-3xl bg-gradient-to-br from-orange-200 via-amber-100 to-rose-100 p-6 shadow-sm">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-4 text-base font-bold text-white shadow-md transition active:scale-[0.98]">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            사진 고르기
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              aria-label="사진 선택"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="mt-2 text-center text-xs text-stone-700">
            저장된 사진을 고르거나, 바로 찍어도 돼요.
          </p>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-stone-700">
          <Tip emoji="📸">또렷한 한 명·한 마리·한 물건이 가장 잘 나와요.</Tip>
          <Tip emoji="🗑️">올린 사진은 도안을 만든 뒤 자동으로 지워요.</Tip>
          <Tip emoji="🖨️">완성된 도안은 A4로 인쇄해서 색칠할 수 있어요.</Tip>
        </ul>
      </section>
    </>
  );
}

function Tip({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden>{emoji}</span>
      <span>{children}</span>
    </li>
  );
}

function ConvertingStage() {
  return (
    <section className="flex flex-col items-center px-5 pt-16">
      <div
        className="grid size-20 animate-bounce place-items-center rounded-full bg-amber-100 text-4xl"
        aria-hidden
      >
        🎨
      </div>
      <p
        className="mt-6 text-lg font-bold text-stone-900"
        role="status"
        aria-live="polite"
      >
        도안을 그리고 있어요…
      </p>
      <p className="mt-1 text-sm text-stone-600">
        잠시만 기다려 주세요.
      </p>
      <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-stone-200">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-stone-900" />
      </div>
    </section>
  );
}

function ResultStage({ onReset }: { onReset: () => void }) {
  return (
    <section className="px-5 pt-4">
      <p className="text-sm font-semibold text-emerald-700">완성!</p>
      <h2 className="text-xl font-extrabold text-stone-900">
        이렇게 그려졌어요
      </h2>

      <div
        className="mt-4 aspect-square w-full overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200"
        aria-label="도안 미리보기"
      >
        <SamplePreview />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/me"
          className="rounded-2xl bg-stone-900 px-5 py-3.5 text-center text-base font-bold text-white shadow-sm active:scale-[0.98]"
        >
          내 작품으로 가기
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl bg-white px-5 py-3.5 text-base font-bold text-stone-900 ring-1 ring-stone-200 active:scale-[0.98]"
        >
          다시 만들기
        </button>
      </div>
    </section>
  );
}

/* 결과 자리에 들어갈 임시 라인 드로잉. 실제 변환 결과로 교체될 자리. */
function SamplePreview() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <rect x="0" y="0" width="200" height="200" fill="white" />
      {/* 해 */}
      <circle cx="160" cy="40" r="14" fill="none" stroke="#1f1b16" strokeWidth="2" />
      <g stroke="#1f1b16" strokeWidth="2" strokeLinecap="round">
        <line x1="160" y1="18" x2="160" y2="10" />
        <line x1="160" y1="62" x2="160" y2="70" />
        <line x1="138" y1="40" x2="130" y2="40" />
        <line x1="182" y1="40" x2="190" y2="40" />
        <line x1="145" y1="25" x2="139" y2="19" />
        <line x1="175" y1="25" x2="181" y2="19" />
        <line x1="145" y1="55" x2="139" y2="61" />
        <line x1="175" y1="55" x2="181" y2="61" />
      </g>
      {/* 아이 */}
      <circle cx="80" cy="80" r="22" fill="none" stroke="#1f1b16" strokeWidth="2.5" />
      <circle cx="72" cy="78" r="2" fill="#1f1b16" />
      <circle cx="88" cy="78" r="2" fill="#1f1b16" />
      <path d="M72 88 Q80 95 88 88" fill="none" stroke="#1f1b16" strokeWidth="2" strokeLinecap="round" />
      <line x1="80" y1="102" x2="80" y2="150" stroke="#1f1b16" strokeWidth="2.5" />
      <line x1="80" y1="118" x2="55" y2="135" stroke="#1f1b16" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="80" y1="118" x2="110" y2="130" stroke="#1f1b16" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="80" y1="150" x2="62" y2="180" stroke="#1f1b16" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="80" y1="150" x2="98" y2="180" stroke="#1f1b16" strokeWidth="2.5" strokeLinecap="round" />
      {/* 잔디 */}
      <path d="M0 188 Q30 178 60 188 Q90 178 120 188 Q150 178 180 188 Q200 183 200 188 L200 200 L0 200 Z" fill="none" stroke="#1f1b16" strokeWidth="2" />
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
