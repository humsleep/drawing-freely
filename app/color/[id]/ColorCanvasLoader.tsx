"use client";

import dynamic from "next/dynamic";

// Konva는 SSR에서 깨지므로 dynamic import.
const ColorCanvas = dynamic(() => import("./ColorCanvas"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[60vh] place-items-center px-5 text-stone-500">
      <p>색칠 준비 중…</p>
    </div>
  ),
});

export default function ColorCanvasLoader({ id }: { id: string }) {
  return <ColorCanvas id={id} />;
}
