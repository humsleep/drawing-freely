"use client";

import { useState } from "react";
import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";
import { requiresPublishConfirm } from "@/lib/policy";

type Work = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  likeCount: number;
  hue: number;
};

const SEED_WORKS: Work[] = [
  { id: "w1", title: "우리집 강아지", description: "토토가 제일 좋아하는 인형이랑 같이!", isPublic: true, likeCount: 12, hue: 18 },
  { id: "w2", title: "비 오는 날", description: "", isPublic: false, likeCount: 0, hue: 210 },
  { id: "w3", title: "우주 비행", description: "별나라까지 슝~", isPublic: false, likeCount: 0, hue: 260 },
];

export default function MyWorksPage() {
  const [works, setWorks] = useState<Work[]>(SEED_WORKS);
  const [toast, setToast] = useState<string>("");

  function update(id: string, patch: Partial<Work>) {
    setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }

  function onTogglePublic(w: Work) {
    const next = !w.isPublic;
    if (requiresPublishConfirm(w.isPublic, next)) {
      const ok = window.confirm("다른 사람들도 이 작품을 볼 수 있어요. 공개할까요?");
      if (!ok) return;
    }
    update(w.id, { isPublic: next });
    showToast(next ? "갤러리에 공개됐어요." : "이제 나만 볼 수 있어요.");
  }

  async function onShare(w: Work) {
    const url = `${window.location.origin}/work/${w.id}`;
    const text = w.description ? `${w.title} — ${w.description}` : w.title;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: w.title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("주소를 복사했어요.");
    } catch {
      // 사용자가 공유 취소 — 조용히 무시
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  }

  const publicCount = works.filter((w) => w.isPublic).length;

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-stone-500">
          ← 둘러보기
        </Link>
      </header>

      <section className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">내 작품</h1>
        <p className="mt-1 text-sm text-stone-600">
          <span className="font-semibold text-stone-800">토토</span> · 7–9세 · 공개 {publicCount}개
        </p>

        <Link
          href="/create"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3.5 text-base font-bold text-white shadow-sm active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          새로 만들기
        </Link>
      </section>

      <section className="px-5 pt-6">
        {works.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-10 text-center ring-1 ring-stone-200">
            <div className="mx-auto size-14 rounded-full bg-amber-100 p-3 text-2xl" aria-hidden>🎨</div>
            <p className="mt-3 text-base font-semibold text-stone-900">아직 만든 작품이 없어요</p>
            <p className="mt-1 text-sm text-stone-600">사진 한 장으로 도안을 만들어 보세요.</p>
            <Link
              href="/create"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-bold text-white"
            >
              새로 만들기
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {works.map((w) => (
              <li key={w.id}>
                <WorkCard
                  work={w}
                  onTogglePublic={() => onTogglePublic(w)}
                  onShare={() => onShare(w)}
                  onChangeDescription={(d) => update(w.id, { description: d })}
                />
              </li>
            ))}
          </ul>
        )}
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

function WorkCard({
  work,
  onTogglePublic,
  onShare,
  onChangeDescription,
}: {
  work: Work;
  onTogglePublic: () => void;
  onShare: () => void;
  onChangeDescription: (d: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
      <div className="flex gap-3 p-3">
        <Thumb hue={work.hue} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h2 className="truncate text-base font-bold text-stone-900">{work.title}</h2>
            <span
              className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600"
              aria-label={`좋아요 ${work.likeCount}개`}
            >
              ❤ {work.likeCount}
            </span>
          </div>

          <label className="mt-2 block">
            <span className="sr-only">작품 설명 한 줄</span>
            <input
              type="text"
              value={work.description}
              onChange={(e) => onChangeDescription(e.target.value)}
              placeholder="작품 설명 한 줄 (선택)"
              maxLength={40}
              className="w-full rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-2 focus:outline-stone-300"
            />
          </label>

          {work.isPublic && (
            <p className="mt-2 text-xs text-emerald-700">
              갤러리에 보이는 중 · 좋아요가 쌓이면 인기 작품에 올라갈 수 있어요
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-stone-100 px-3 py-2">
        <PublicToggle isPublic={work.isPublic} onToggle={onTogglePublic} />
        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
            <path d="M16 6l-4-4-4 4" />
            <path d="M12 2v14" />
          </svg>
          공유
        </button>
      </div>
    </article>
  );
}

function PublicToggle({ isPublic, onToggle }: { isPublic: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPublic}
      onClick={onToggle}
      className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold hover:bg-stone-100"
    >
      <span
        className={
          "relative inline-block h-6 w-11 rounded-full transition-colors " +
          (isPublic ? "bg-emerald-500" : "bg-stone-300")
        }
        aria-hidden
      >
        <span
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " +
            (isPublic ? "left-[22px]" : "left-0.5")
          }
        />
      </span>
      <span className={isPublic ? "text-emerald-700" : "text-stone-600"}>
        {isPublic ? "공개" : "비공개"}
      </span>
    </button>
  );
}

function Thumb({ hue }: { hue: number }) {
  const bg = `hsl(${hue} 80% 92%)`;
  const stroke = `hsl(${hue} 50% 30%)`;
  return (
    <div className="size-24 shrink-0 overflow-hidden rounded-xl" style={{ background: bg }} aria-hidden>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="42" r="22" fill="none" stroke={stroke} strokeWidth="2.5" />
        <path d="M22 86 Q50 60 78 86" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="42" cy="40" r="2" fill={stroke} />
        <circle cx="58" cy="40" r="2" fill={stroke} />
        <path d="M44 50 Q50 55 56 50" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
