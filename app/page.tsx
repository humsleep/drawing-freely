import type { ReactNode } from "react";

/**
 * 랜딩 페이지 (MVP v0)
 *
 * - 한 화면에 핵심 진입점 5개: 업로드 / 인기 작품 / 연령대 인기 / 무료 도안 / 랭킹
 * - 자랑하기/공개 갤러리 = "인기 작품" 섹션
 * - 랭킹 진입점 = "이번 주 인기" 헤더의 "전체 보기"
 * - 컴포넌트 분리 없이 한 파일에 인라인 (두 번째 사용처가 생기면 그때 분리)
 *
 * NOTE: 이 화면은 정적 더미 데이터만 사용한다. 변환/저장/좋아요는 다음 화면에서.
 */

const AGE_BANDS = [
  { id: "all", label: "전체" },
  { id: "4-6", label: "4–6세" },
  { id: "7-9", label: "7–9세" },
  { id: "10-12", label: "10–12세" },
] as const;

const POPULAR_WORKS = [
  { id: 1, title: "우리집 강아지", nickname: "토토", ageBand: "4-6", likes: 128, hue: 18 },
  { id: 2, title: "엄마랑 나", nickname: "민서", ageBand: "7-9", likes: 96, hue: 200 },
  { id: 3, title: "공룡 친구", nickname: "지호", ageBand: "4-6", likes: 87, hue: 140 },
  { id: 4, title: "우주 비행", nickname: "하늘", ageBand: "10-12", likes: 71, hue: 260 },
  { id: 5, title: "내 자전거", nickname: "유나", ageBand: "7-9", likes: 64, hue: 40 },
  { id: 6, title: "바다 친구들", nickname: "서아", ageBand: "10-12", likes: 52, hue: 180 },
];

const FREE_TEMPLATES = [
  { id: 1, title: "사자 가족", ageBand: "4-6", hue: 35 },
  { id: 2, title: "기차 여행", ageBand: "7-9", hue: 215 },
  { id: 3, title: "정원의 꽃", ageBand: "4-6", hue: 320 },
  { id: 4, title: "별자리", ageBand: "10-12", hue: 250 },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-md pb-28 sm:max-w-2xl">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-6">
        <h1 className="text-lg font-extrabold tracking-tight">
          <span aria-hidden>🎨</span> 그림자유
        </h1>
        <a
          href="#login"
          className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
        >
          로그인
        </a>
      </header>

      {/* 히어로 + 업로드 */}
      <section className="px-5 pt-6">
        <div className="rounded-3xl bg-gradient-to-br from-orange-200 via-amber-100 to-rose-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-700">사진 한 장으로</p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight text-stone-900 sm:text-3xl">
            우리 아이 그림 도안,
            <br />1분 안에 완성!
          </h2>
          <p className="mt-2 text-sm text-stone-700">
            찍은 사진을 색칠 도안으로 바꿔, 인쇄해서 같이 색칠해요.
          </p>

          {/* 업로드 CTA — 라벨이 input을 감싸 JS 없이도 동작 */}
          <label className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-4 text-base font-bold text-white shadow-md transition active:scale-[0.98]">
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
            사진으로 그림 만들기
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              aria-label="사진 선택"
            />
          </label>
          <p className="mt-2 text-center text-xs text-stone-600">
            저장된 사진을 고르거나, 바로 찍어도 돼요.
          </p>
        </div>
      </section>

      {/* 빠른 메뉴 */}
      <section className="grid grid-cols-3 gap-3 px-5 pt-6">
        <QuickLink href="#templates" emoji="📄" label="무료 도안" />
        <QuickLink href="#popular" emoji="⭐" label="인기 작품" />
        <QuickLink href="/ranking" emoji="🏆" label="랭킹" />
      </section>

      {/* 인기 작품 — 자랑하기 갤러리 */}
      <section id="popular" className="px-5 pt-10">
        <SectionHeader title="이번 주 인기 작품" actionLabel="전체 보기" actionHref="/ranking" />

        {/* 연령대 탭 — 연령대별 인기 콘텐츠 진입점 */}
        <div
          className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="연령대별 인기"
        >
          {AGE_BANDS.map((band, i) => (
            <button
              key={band.id}
              role="tab"
              aria-selected={i === 0}
              className={
                i === 0
                  ? "shrink-0 rounded-full bg-stone-900 px-4 py-1.5 text-sm font-semibold text-white"
                  : "shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-stone-700 ring-1 ring-stone-200"
              }
            >
              {band.label}
            </button>
          ))}
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {POPULAR_WORKS.map((w) => (
            <li key={w.id}>
              <a href={`#work-${w.id}`} className="group block">
                <WorkThumb hue={w.hue} />
                <div className="mt-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {w.title}
                    </p>
                    <p className="truncate text-xs text-stone-500">
                      {w.nickname} · {w.ageBand}세
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                    ❤ {w.likes}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 무료 도안 */}
      <section id="templates" className="px-5 pt-10">
        <SectionHeader title="무료 도안" actionLabel="모두 보기" actionHref="#templates-all" />
        <p className="mt-1 text-sm text-stone-600">
          인쇄해서 바로 색칠할 수 있어요.
        </p>

        <ul className="mt-4 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {FREE_TEMPLATES.map((t) => (
            <li key={t.id} className="w-40 shrink-0 sm:w-48">
              <a href={`#template-${t.id}`} className="block">
                <TemplateThumb hue={t.hue} />
                <p className="mt-2 truncate text-sm font-semibold text-stone-900">
                  {t.title}
                </p>
                <p className="text-xs text-stone-500">추천 {t.ageBand}세</p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 랭킹 진입 카드 */}
      <section id="ranking" className="px-5 pt-10">
        <a
          href="/ranking"
          className="flex items-center justify-between rounded-2xl bg-stone-900 px-5 py-4 text-white shadow-sm"
        >
          <div>
            <p className="text-xs font-semibold text-amber-300">🏆 이번 주 랭킹</p>
            <p className="mt-0.5 text-base font-bold">가장 많이 좋아요 받은 작품</p>
          </div>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </a>
      </section>

      {/* 안전 안내 */}
      <section className="px-5 pt-10">
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">아이와 함께, 안전하게.</p>
          <p className="mt-1 text-emerald-800">
            업로드한 사진은 도안 변환 후 자동으로 지워져요. 작품은 부모님이
            공개를 켤 때만 다른 사람에게 보여요.
          </p>
        </div>
      </section>

      {/* 하단 탭 바 */}
      <nav
        aria-label="주요 메뉴"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/90 backdrop-blur"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 sm:max-w-2xl">
          <TabItem href="#home" label="둘러보기" active>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11.5L12 4l9 7.5" />
              <path d="M5 10v9h14v-9" />
            </svg>
          </TabItem>
          <TabItem href="#create" label="만들기">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </TabItem>
          <TabItem href="#templates" label="도안">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h9l5 5v13H6z" />
              <path d="M14 3v6h6" />
            </svg>
          </TabItem>
          <TabItem href="#me" label="내 작품">
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

/* ---------- 인라인 소품들 (이 페이지에서만 쓰임) ---------- */

function SectionHeader({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <h3 className="text-lg font-extrabold text-stone-900">{title}</h3>
      <a
        href={actionHref}
        className="text-sm font-semibold text-stone-500 hover:text-stone-900"
      >
        {actionLabel} →
      </a>
    </div>
  );
}

function QuickLink({
  href,
  emoji,
  label,
}: {
  href: string;
  emoji: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white px-3 py-4 text-sm font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50"
    >
      <span className="text-2xl" aria-hidden>
        {emoji}
      </span>
      {label}
    </a>
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
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium " +
        (active ? "text-stone-900" : "text-stone-400")
      }
    >
      {children}
      <span>{label}</span>
    </a>
  );
}

/* 더미 썸네일 — 실제 이미지는 v1 이후. 색상은 hue로 변주. */
function WorkThumb({ hue }: { hue: number }) {
  const bg = `hsl(${hue} 80% 92%)`;
  const stroke = `hsl(${hue} 50% 30%)`;
  return (
    <div
      className="aspect-square w-full overflow-hidden rounded-2xl"
      style={{ background: bg }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="42" r="22" fill="none" stroke={stroke} strokeWidth="2.5" />
        <path
          d="M22 86 Q50 60 78 86"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="42" cy="40" r="2" fill={stroke} />
        <circle cx="58" cy="40" r="2" fill={stroke} />
        <path
          d="M44 50 Q50 55 56 50"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function TemplateThumb({ hue }: { hue: number }) {
  const bg = `hsl(${hue} 70% 95%)`;
  const stroke = `hsl(${hue} 45% 35%)`;
  return (
    <div
      className="aspect-[3/4] w-full overflow-hidden rounded-2xl ring-1 ring-stone-200"
      style={{ background: bg }}
      aria-hidden
    >
      <svg viewBox="0 0 60 80" className="h-full w-full">
        <rect x="6" y="6" width="48" height="68" rx="4" fill="white" stroke={stroke} strokeWidth="1.5" />
        <path d="M14 30 Q30 14 46 30" fill="none" stroke={stroke} strokeWidth="2" />
        <circle cx="22" cy="46" r="6" fill="none" stroke={stroke} strokeWidth="2" />
        <circle cx="38" cy="46" r="6" fill="none" stroke={stroke} strokeWidth="2" />
        <path d="M16 62 H44" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
