import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";
import type { Template, Work } from "@/lib/types";

const POPULAR_WORKS: Work[] = [
  { id: "w1", title: "우리집 강아지", nickname: "토토", ageBand: "4-6",  isPublic: true, likeCount: 128, hue: 18 },
  { id: "w2", title: "엄마랑 나",    nickname: "민서", ageBand: "7-9",  isPublic: true, likeCount: 96,  hue: 200 },
  { id: "w3", title: "공룡 친구",    nickname: "지호", ageBand: "4-6",  isPublic: true, likeCount: 87,  hue: 140 },
  { id: "w4", title: "우주 비행",    nickname: "하늘", ageBand: "10-12", isPublic: true, likeCount: 71,  hue: 260 },
  { id: "w5", title: "내 자전거",    nickname: "유나", ageBand: "7-9",  isPublic: true, likeCount: 64,  hue: 40 },
  { id: "w6", title: "바다 친구들",  nickname: "서아", ageBand: "10-12", isPublic: true, likeCount: 52,  hue: 180 },
];

const FREE_TEMPLATES: Template[] = [
  { id: "t1", title: "사자 가족",  ageBand: "4-6",   hue: 35 },
  { id: "t2", title: "기차 여행",  ageBand: "7-9",   hue: 215 },
  { id: "t3", title: "정원의 꽃",  ageBand: "4-6",   hue: 320 },
  { id: "t4", title: "별자리",     ageBand: "10-12", hue: 250 },
];

export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <h1 className="text-lg font-extrabold tracking-tight">
          <span aria-hidden>🎨</span> 그림자유
        </h1>
      </header>

      {/* 히어로 + 업로드 CTA */}
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

          <Link
            href="/create"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-md transition active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            사진으로 그림 만들기
          </Link>
        </div>
      </section>

      {/* 빠른 메뉴 */}
      <section className="grid grid-cols-2 gap-3 px-5 pt-6">
        <Link
          href="/templates"
          className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white px-3 py-4 text-sm font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50"
        >
          <span className="text-2xl" aria-hidden>📄</span>
          무료 도안
        </Link>
        <Link
          href="/ranking"
          className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white px-3 py-4 text-sm font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50"
        >
          <span className="text-2xl" aria-hidden>🏆</span>
          랭킹
        </Link>
      </section>

      {/* 인기 작품 */}
      <section className="px-5 pt-10">
        <div className="flex items-end justify-between">
          <h3 className="text-lg font-extrabold text-stone-900">이번 주 인기 작품</h3>
          <Link href="/ranking" className="text-sm font-semibold text-stone-500 hover:text-stone-900">
            전체 보기 →
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {POPULAR_WORKS.map((w) => (
            <li key={w.id}>
              <WorkThumb hue={w.hue ?? 0} />
              <div className="mt-2 flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-semibold text-stone-900">
                  {w.title}
                </p>
                <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                  ❤ {w.likeCount}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 무료 도안 */}
      <section className="px-5 pt-10">
        <div className="flex items-end justify-between">
          <h3 className="text-lg font-extrabold text-stone-900">무료 도안</h3>
          <Link href="/templates" className="text-sm font-semibold text-stone-500 hover:text-stone-900">
            모두 보기 →
          </Link>
        </div>
        <p className="mt-1 text-sm text-stone-600">인쇄해서 바로 색칠할 수 있어요.</p>

        <ul className="mt-4 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {FREE_TEMPLATES.map((t) => (
            <li key={t.id} className="w-40 shrink-0 sm:w-48">
              <PortraitThumb hue={t.hue ?? 0} />
              <p className="mt-2 truncate text-sm font-semibold text-stone-900">{t.title}</p>
              <p className="text-xs text-stone-500">
                추천 {t.ageBand === "all" ? "모든 나이" : `${t.ageBand}세`}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 랭킹 진입 카드 */}
      <section className="px-5 pt-10">
        <Link
          href="/ranking"
          className="flex items-center justify-between rounded-2xl bg-violet-600 px-5 py-4 text-white shadow-sm"
        >
          <div>
            <p className="text-xs font-semibold text-amber-300">🏆 이번 주 랭킹</p>
            <p className="mt-0.5 text-base font-bold">가장 많이 좋아요 받은 작품</p>
          </div>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      </section>

      {/* 안전 안내 */}
      <section className="px-5 pt-10">
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">아이와 함께, 안전하게.</p>
          <p className="mt-1 text-emerald-800">
            업로드한 사진은 도안 변환 후 자동으로 지워져요. 작품은 부모님이 공개를 켤 때만 다른 사람에게 보여요.
          </p>
        </div>
      </section>

      <TabBar />
    </>
  );
}

function WorkThumb({ hue }: { hue: number }) {
  const bg = `hsl(${hue} 80% 92%)`;
  const stroke = `hsl(${hue} 50% 30%)`;
  return (
    <div className="aspect-square w-full overflow-hidden rounded-2xl" style={{ background: bg }} aria-hidden>
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

function PortraitThumb({ hue }: { hue: number }) {
  const bg = `hsl(${hue} 70% 95%)`;
  const stroke = `hsl(${hue} 45% 35%)`;
  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl ring-1 ring-stone-200" style={{ background: bg }} aria-hidden>
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
