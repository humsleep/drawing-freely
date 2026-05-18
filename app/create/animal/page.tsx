"use client";

import dynamic from "next/dynamic";

// react-konva는 SSR에서 window를 참조해 빌드 단계에서 깨진다.
// 클라이언트에서만 로드되도록 dynamic import.
const AnimalBuilder = dynamic(() => import("./AnimalBuilder"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[60vh] place-items-center px-5 text-stone-500">
      <p>캔버스 준비 중…</p>
    </div>
  ),
});

export default function AnimalBuilderPage() {
  return <AnimalBuilder />;
}
