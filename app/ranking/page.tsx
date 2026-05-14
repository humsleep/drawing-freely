import type { ReactNode } from "react";
import Link from "next/link";

/**
 * 랭킹 화면  MVP v0
 *
 * 신뢰 회복 후 단순화:
 * - "좋아요 많이 받은 작품 TOP 5" 한 섹션만.
 * - 연령대 3행, 사용자 랭킹(많이 만든/받은) 모두 제거 → 출시 후 데이터·UX 검증 후 v1.
 * - 기간은 "이번 주" 고정. 닉네임만 노출.
 *
 * NOTE: 작품 카드는 상세 페이지가 없는 동안 클릭 불가(div).
 */

type WorkRow = {
  id: string;
  title: string;
  nickname: string;
  ageBand: "4-6" | "7-9" | "10-12";
  likes: number;
  hue: number;
};

const POPULAR_WORKS: WorkRow[] = [
  { id: "w1", title: "우리집 강아지", nickname: "토토", ageBand: "4-6", likes: 128, hue: 18 },
  { id: "w2", title: "엄마랑 나", nickname: "민서", ageBand: "7-9", likes: 96, hue: 200 },
  { id: "w3", title: "공룡 친구", nickname: "지호", ageBand: "4-6", likes: 87, hue: 140 },
  { id: "w4", title: "우주 비행", nickname: "하늘", ageBand: "10-12", likes: 71, hue: 260 },
  { id: "w5", title: "내 자전거", nickname: "유나", ageBand: "7-9", likes: 64, hue: 40 },
];

export default function RankingPage() {
  return (
    <main className="mx-auto max-w-md pb-28 sm:max-w-2xl">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-stone-500">
          ← 둘러보기
        </Link>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          이번 주
        </span>
      </header>

      <section className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          이번 주 인기 작품 🏆
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          좋아요를 많이 받은 작품 다섯 개를 모았어요.
        </p>
      </section>

      {/* 좋아요 많이 받은 작품 TOP 5 */}
      <section className="px-5 pt-6">
        <ol className="flex flex-col gap-2">
          {POPULAR_WORKS.map((w, i) => (
            <li
              key={w.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-stone-200"
            >
              <RankBadge rank={i + 1} />
              <WorkThumb hue={w.hue} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-stone-900">
                  {w.title}
                </p>
                <p className="truncate text-xs text-stone-500">
                  {w.nickname} · {w.ageBand}세 작품
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-extrabold text-rose-600">
                ❤ {w.likes}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* 안내 */}
      <section className="px-5 pt-10">
        <p className="text-center text-xs text-stone-500">
          랭킹은 닉네임만 보여요. 이름·나이 같은 개인정보는 공개되지 않아요.
        </p>
      </section>

      {/* 하단 탭바 */}
      <nav
        aria-label="주요 메뉴"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/90 backdrop-blur"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 sm:max-w-2xl">
          <TabItem href="/" label="둘러보기" active>
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

/* ---------- 인라인 소품들 ---------- */

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <BadgeChar>🥇</BadgeChar>;
  if (rank === 2) return <BadgeChar>🥈</BadgeChar>;
  if (rank === 3) return <BadgeChar>🥉</BadgeChar>;
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-extrabold text-stone-600"
      aria-label={`${rank}위`}
    >
      {rank}
    </span>
  );
}

function BadgeChar({ children }: { children: ReactNode }) {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xl"
      aria-hidden
    >
      {children}
    </span>
  );
}

function WorkThumb({ hue }: { hue: number }) {
  const bg = `hsl(${hue} 80% 92%)`;
  const stroke = `hsl(${hue} 50% 30%)`;
  return (
    <div
      className="size-14 shrink-0 overflow-hidden rounded-xl"
      style={{ background: bg }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="42" r="22" fill="none" stroke={stroke} strokeWidth="3" />
        <path d="M22 86 Q50 60 78 86" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <circle cx="42" cy="40" r="2.5" fill={stroke} />
        <circle cx="58" cy="40" r="2.5" fill={stroke} />
        <path d="M44 50 Q50 55 56 50" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
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
