import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";
import { ANIMALS, ANIMAL_LABEL, animalSrc } from "@/lib/assets";
import type { Work } from "@/lib/types";

/** 시드 — 백엔드 연결 후 실 데이터로 교체 */
const POPULAR_WORKS: Work[] = [
  { id: "w1", title: "우리집 강아지", nickname: "토토", ageBand: "4-6",  isPublic: true, likeCount: 128, hue: 18 },
  { id: "w2", title: "엄마랑 나",    nickname: "민서", ageBand: "7-9",  isPublic: true, likeCount: 96,  hue: 200 },
  { id: "w3", title: "공룡 친구",    nickname: "지호", ageBand: "4-6",  isPublic: true, likeCount: 87,  hue: 140 },
  { id: "w4", title: "우주 비행",    nickname: "하늘", ageBand: "10-12", isPublic: true, likeCount: 71,  hue: 260 },
  { id: "w5", title: "내 자전거",    nickname: "유나", ageBand: "7-9",  isPublic: true, likeCount: 64,  hue: 40 },
  { id: "w6", title: "바다 친구들",  nickname: "서아", ageBand: "10-12", isPublic: true, likeCount: 52,  hue: 180 },
];

/** 도안 미리보기 — animal SVG 4개를 그대로 활용 */
const PREVIEW_TEMPLATES = ANIMALS.slice(0, 4);

export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <h1 className="text-lg font-extrabold tracking-tight">
          <span aria-hidden>🎨</span> 그림자유
        </h1>
      </header>

      {/* 히어로 — 카피 갱신: 사진 변환 X → 직접 만들고 색칠 */}
      <section className="px-5 pt-6">
        <div className="rounded-[2rem] bg-gradient-to-br from-violet-200 via-fuchsia-100 to-amber-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-violet-700">손가락으로 만들고</p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight text-stone-900 sm:text-3xl">
            나만의 캐릭터,
            <br />색칠해서 자랑해요!
          </h2>
          <p className="mt-2 text-sm text-stone-700">
            동물·얼굴을 직접 만들고, 손가락으로 색칠하고, 갤러리에 자랑해요.
          </p>

          <Link
            href="/create"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-md transition active:scale-[0.98]"
          >
            <span className="text-lg" aria-hidden>🎨</span>
            지금 만들기
          </Link>
        </div>
      </section>

      {/* 빠른 메뉴 */}
      <section className="grid grid-cols-2 gap-3 px-5 pt-6">
        <Link
          href="/templates"
          className="flex flex-col items-center justify-center gap-1 rounded-3xl bg-white px-3 py-5 text-sm font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50"
        >
          <span className="text-3xl" aria-hidden>📄</span>
          무료 도안
        </Link>
        <Link
          href="/ranking"
          className="flex flex-col items-center justify-center gap-1 rounded-3xl bg-white px-3 py-5 text-sm font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50"
        >
          <span className="text-3xl" aria-hidden>🏆</span>
          랭킹
        </Link>
      </section>

      {/* 인기 작품 */}
      <section className="px-5 pt-10">
        <div className="flex items-end justify-between">
          <h3 className="text-lg font-extrabold text-stone-900">이번 주 인기 작품</h3>
          <Link href="/ranking" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
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

      {/* 무료 도안 — 실제 동물 SVG로 미리보기 (이전 시드 hue 더미 X) */}
      <section className="px-5 pt-10">
        <div className="flex items-end justify-between">
          <h3 className="text-lg font-extrabold text-stone-900">색칠할 도안</h3>
          <Link href="/templates" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            모두 보기 →
          </Link>
        </div>
        <p className="mt-1 text-sm text-stone-600">탭하면 바로 색칠 시작해요.</p>

        <ul className="mt-4 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {PREVIEW_TEMPLATES.map((id) => (
            <li key={id} className="w-40 shrink-0 sm:w-48">
              <Link
                href={`/color/animal-${id}`}
                className="block aspect-square w-full overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 active:bg-stone-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={animalSrc(id)}
                  alt={ANIMAL_LABEL[id]}
                  className="h-full w-full object-contain p-3"
                />
              </Link>
              <p className="mt-2 truncate text-sm font-semibold text-stone-900">
                {ANIMAL_LABEL[id]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 랭킹 진입 카드 */}
      <section className="px-5 pt-10">
        <Link
          href="/ranking"
          className="flex items-center justify-between rounded-[2rem] bg-violet-600 px-5 py-5 text-white shadow-md"
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

      {/* 안전 안내 — 사진 업로드 X 사실에 맞춘 카피 */}
      <section className="px-5 pt-10">
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">아이와 함께, 안전하게.</p>
          <p className="mt-1 text-emerald-800">
            사진은 받지 않아요. 작품은 부모님이 공개를 켤 때만 다른 사람에게 보여요.
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
