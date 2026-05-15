import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";

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

const MEDALS = ["🥇", "🥈", "🥉"] as const;

export default function RankingPage() {
  return (
    <>
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

      <section className="px-5 pt-6">
        <ol className="flex flex-col gap-2">
          {POPULAR_WORKS.map((w, i) => {
            const rank = i + 1;
            const medal = MEDALS[i];
            return (
              <li
                key={w.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-stone-200"
              >
                {medal ? (
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xl"
                    aria-label={`${rank}위`}
                  >
                    {medal}
                  </span>
                ) : (
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-extrabold text-stone-600"
                    aria-label={`${rank}위`}
                  >
                    {rank}
                  </span>
                )}
                <WorkThumb hue={w.hue} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-stone-900">{w.title}</p>
                  <p className="truncate text-xs text-stone-500">
                    {w.nickname} · {w.ageBand}세 작품
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-extrabold text-rose-600">
                  ❤ {w.likes}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="px-5 pt-10">
        <p className="text-center text-xs text-stone-500">
          랭킹은 닉네임만 보여요. 이름·나이 같은 개인정보는 공개되지 않아요.
        </p>
      </section>

      <TabBar />
    </>
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
