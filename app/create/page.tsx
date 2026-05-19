import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";

export default function CreatePage() {
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-stone-500">
          ← 둘러보기
        </Link>
      </header>

      <section className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          도안 만들기
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          어떤 도안을 만들까요?
        </p>
      </section>

      <section className="flex flex-col gap-3 px-5 pt-6">
        <Link
          href="/create/animal"
          className="rounded-3xl bg-gradient-to-br from-orange-200 via-amber-100 to-rose-100 p-6 shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden>🐘</span>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-stone-900">
                동물·물건 만들기
              </p>
              <p className="mt-1 text-sm text-stone-700">
                동물을 골라 자유롭게 배치하고 글자도 넣어요.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/create/face"
          className="rounded-3xl bg-gradient-to-br from-sky-200 via-indigo-100 to-violet-100 p-6 shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden>🧑</span>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-stone-900">
                얼굴 만들기
              </p>
              <p className="mt-1 text-sm text-stone-700">
                얼굴형·눈·머리·옷을 골라 친구를 만들어요.
              </p>
            </div>
          </div>
        </Link>

        {/* 임시 색칠 진입점 (개발 중) — 다음 PR에서 빌더 결과·도안에서 자연스럽게 연결됨 */}
        <Link
          href="/color/animal-elephant"
          className="rounded-3xl bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-100 p-6 shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden>🎨</span>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-stone-900">
                색칠하기 <span className="text-xs font-medium text-stone-500">(개발 중)</span>
              </p>
              <p className="mt-1 text-sm text-stone-700">
                도안 위에 손가락으로 직접 색칠해요.
              </p>
            </div>
          </div>
        </Link>
      </section>

      <section className="px-5 pt-10">
        <p className="text-center text-xs text-stone-500">
          만든 도안은 인쇄해서 색칠할 수 있어요.
        </p>
      </section>

      <TabBar />
    </>
  );
}
