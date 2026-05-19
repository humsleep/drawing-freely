import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";
import { ANIMALS, ANIMAL_LABEL, animalSrc } from "@/lib/assets";

/**
 * 무료 도안 — MVP에선 10마리 동물 라인아트를 "색칠할 수 있는 도안"으로 노출.
 * 각 카드 탭 → /color/animal-<name> 으로 진입.
 */
export default function TemplatesPage() {
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-stone-500">
          ← 둘러보기
        </Link>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          전부 무료
        </span>
      </header>

      <section className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          색칠할 도안
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          마음에 드는 그림을 골라 손가락으로 색칠해 보세요.
        </p>
      </section>

      <section className="px-5 pt-6">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ANIMALS.map((id) => (
            <li key={id}>
              <Link
                href={`/color/animal-${id}`}
                className="block overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 active:bg-stone-50"
              >
                {/* 정적 SVG. 다른 데서도 동일 패턴이지만 카드 한 곳 한정. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={animalSrc(id)}
                  alt={ANIMAL_LABEL[id]}
                  className="aspect-square w-full bg-white object-contain p-3"
                />
                <div className="flex items-center justify-between px-3 py-2.5">
                  <p className="text-sm font-bold text-stone-900">
                    {ANIMAL_LABEL[id]}
                  </p>
                  <span className="text-xs font-semibold text-stone-500">
                    색칠하기 →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 pt-10">
        <p className="text-center text-xs text-stone-500">
          모든 도안은 무료예요. 더 많은 도안은 곧 추가돼요.
        </p>
      </section>

      <TabBar />
    </>
  );
}
