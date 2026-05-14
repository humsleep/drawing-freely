import type { ReactNode } from "react";
import Link from "next/link";

/**
 * 랭킹 화면  MVP v0
 *
 * - 기간은 "이번 주" 하나로 고정. 월간/전체는 v1에서.
 * - 닉네임 중심. 실명/생년월일/성별은 절대 노출되지 않는다.
 * - 작품 랭킹에는 작품 자체의 연령대 라벨만 표시(콘텐츠 메타데이터).
 *   사용자 랭킹에는 연령대를 절대 붙이지 않는다(자녀 나이 노출 회피).
 * - 사용자 아바타는 사진이 아니라 추상 이모지/색상으로만.
 *
 * NOTE: 사용자 랭킹(많이 만든 / 많이 받은)은 v1에서 SQL 집계로 실제화.
 * 현재 시드 데이터는 화면 골조 검증용이며, 일부러 동률·짧은 목록을 섞었다.
 */

type AgeBand = "4-6" | "7-9" | "10-12";

type WorkRow = {
  id: string;
  title: string;
  nickname: string;
  ageBand: AgeBand;
  likes: number;
  hue: number;
};

type UserRow = {
  id: string;
  nickname: string;
  count: number;
  hue: number;
};

const POPULAR_WORKS: WorkRow[] = [
  { id: "w1", title: "우리집 강아지", nickname: "토토", ageBand: "4-6", likes: 128, hue: 18 },
  { id: "w2", title: "엄마랑 나", nickname: "민서", ageBand: "7-9", likes: 96, hue: 200 },
  { id: "w3", title: "공룡 친구", nickname: "지호", ageBand: "4-6", likes: 87, hue: 140 },
  { id: "w4", title: "우주 비행", nickname: "하늘", ageBand: "10-12", likes: 71, hue: 260 },
  { id: "w5", title: "내 자전거", nickname: "유나", ageBand: "7-9", likes: 64, hue: 40 },
  { id: "w6", title: "바다 친구들", nickname: "서아", ageBand: "10-12", likes: 52, hue: 180 },
  { id: "w7", title: "벚꽃 길", nickname: "봄이", ageBand: "7-9", likes: 48, hue: 330 },
  { id: "w8", title: "고양이와 별", nickname: "별이", ageBand: "10-12", likes: 41, hue: 250 },
  { id: "w9", title: "우리 가족", nickname: "시우", ageBand: "4-6", likes: 39, hue: 80 },
  { id: "w10", title: "비 오는 날", nickname: "도윤", ageBand: "7-9", likes: 33, hue: 210 },
];

const AGE_BAND_LABEL: Record<AgeBand, string> = {
  "4-6": "4–6세 친구들",
  "7-9": "7–9세 친구들",
  "10-12": "10–12세 친구들",
};

const TOP_MAKERS: UserRow[] = [
  { id: "u1", nickname: "토토", count: 18, hue: 18 },
  { id: "u2", nickname: "민서", count: 14, hue: 200 },
  { id: "u3", nickname: "지호", count: 12, hue: 140 },
  { id: "u4", nickname: "하늘", count: 9, hue: 260 },
  { id: "u5", nickname: "유나", count: 7, hue: 40 },
];

const TOP_COLLECTORS: UserRow[] = [
  { id: "u2", nickname: "민서", count: 22, hue: 200 },
  { id: "u6", nickname: "서아", count: 17, hue: 320 },
  { id: "u9", nickname: "가온", count: 13, hue: 90 },
  { id: "u1", nickname: "토토", count: 10, hue: 18 },
  { id: "u7", nickname: "예준", count: 8, hue: 25 },
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
          이번 주 랭킹 🏆
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          매주 월요일에 다시 시작해요.
        </p>
      </section>

      {/* 1. 좋아요 많이 받은 작품 TOP 10 */}
      <section className="px-5 pt-8">
        <h2 className="text-lg font-extrabold text-stone-900">
          좋아요 많이 받은 작품
        </h2>
        <ol className="mt-3 flex flex-col gap-2">
          {POPULAR_WORKS.map((w, i) => (
            <li key={w.id}>
              <a
                href={`#work-${w.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-stone-200 hover:bg-stone-50"
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
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* 2. 연령대별 인기 — 추천 형태(가로 캐러셀 3줄) */}
      <section className="px-5 pt-10">
        <h2 className="text-lg font-extrabold text-stone-900">
          또래에게 인기 있는 작품
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          비슷한 나이 친구들이 좋아한 작품을 모았어요.
        </p>

        <div className="mt-4 flex flex-col gap-6">
          {(["4-6", "7-9", "10-12"] as AgeBand[]).map((band) => {
            const items = POPULAR_WORKS.filter((w) => w.ageBand === band).slice(
              0,
              5,
            );
            return (
              <div key={band}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-extrabold text-stone-800">
                    {AGE_BAND_LABEL[band]}에게 인기
                  </h3>
                  <a
                    href={`#age-${band}`}
                    className="text-xs font-semibold text-stone-500 hover:text-stone-900"
                  >
                    더 보기 →
                  </a>
                </div>
                <ul className="mt-2 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                  {items.length === 0 ? (
                    <li className="rounded-2xl bg-white px-4 py-6 text-xs text-stone-500 ring-1 ring-stone-200">
                      이번 주는 아직 작품이 모이는 중이에요.
                    </li>
                  ) : (
                    items.map((w) => (
                      <li key={w.id} className="w-32 shrink-0">
                        <a href={`#work-${w.id}`} className="block">
                          <WorkThumbSquare hue={w.hue} />
                          <p className="mt-1.5 truncate text-xs font-bold text-stone-900">
                            {w.title}
                          </p>
                          <p className="truncate text-[11px] text-rose-600">
                            ❤ {w.likes}
                          </p>
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 많이 만든 친구들 */}
      <section className="px-5 pt-10">
        <h2 className="text-lg font-extrabold text-stone-900">
          많이 만든 친구들
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          이번 주에 도안을 가장 많이 만든 친구들이에요.
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {TOP_MAKERS.map((u, i) => (
            <UserRowItem
              key={`${u.id}-mk`}
              rank={i + 1}
              user={u}
              unit="개 만들었어요"
            />
          ))}
        </ol>
      </section>

      {/* 4. 많이 받은 친구들 */}
      <section className="px-5 pt-10">
        <h2 className="text-lg font-extrabold text-stone-900">
          무료 도안 많이 받은 친구들
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          이번 주에 무료 도안을 가장 많이 받은 친구들이에요.
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {TOP_COLLECTORS.map((u, i) => (
            <UserRowItem
              key={`${u.id}-co`}
              rank={i + 1}
              user={u}
              unit="장 받았어요"
            />
          ))}
        </ol>
      </section>

      {/* 안내 */}
      <section className="px-5 pt-10">
        <p className="text-center text-xs text-stone-500">
          랭킹은 닉네임만 보여요. 이름·나이 같은 개인정보는 공개되지 않아요.
        </p>
      </section>

      {/* 하단 탭바 — /, /me, /templates, /ranking 네 곳에서 동일. 다음 PR에서 공통 컴포넌트로. */}
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
          <TabItem href="/#create" label="만들기">
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

function UserRowItem({
  rank,
  user,
  unit,
}: {
  rank: number;
  user: UserRow;
  unit: string;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200">
      <RankBadge rank={rank} />
      <Avatar hue={user.hue} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-stone-900">
          {user.nickname}
        </p>
      </div>
      <span className="shrink-0 text-sm font-extrabold text-stone-700">
        {user.count}
        <span className="ml-1 text-xs font-medium text-stone-500">{unit}</span>
      </span>
    </li>
  );
}

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

function WorkThumbSquare({ hue }: { hue: number }) {
  const bg = `hsl(${hue} 80% 92%)`;
  const stroke = `hsl(${hue} 50% 30%)`;
  return (
    <div
      className="aspect-square w-full overflow-hidden rounded-xl"
      style={{ background: bg }}
      aria-hidden
    >
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

function Avatar({ hue }: { hue: number }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-lg"
      style={{ background: `hsl(${hue} 75% 90%)` }}
      aria-hidden
    >
      🎨
    </span>
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
