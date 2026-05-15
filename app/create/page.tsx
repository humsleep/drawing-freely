"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TabBar } from "@/app/_components/TabBar";
import { convertErrorMessage } from "@/lib/convert";

type Stage = "pick" | "converting" | "result" | "error";

export default function CreatePage() {
  const [stage, setStage] = useState<Stage>("pick");
  const [svg, setSvg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  async function onPick(file: File | null) {
    if (!file) return;
    setStage("converting");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/convert", { method: "POST", body: fd });
      if (!res.ok) throw new Error("convert_failed");
      const { svg } = (await res.json()) as { svg: string };
      if (abortRef.current) return;
      setSvg(svg);
      setStage("result");
    } catch {
      if (abortRef.current) return;
      setErrorMsg(convertErrorMessage());
      setStage("error");
    }
  }

  function reset() {
    setSvg("");
    setErrorMsg("");
    setStage("pick");
  }

  function onDownload() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "그림자유-도안.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/" className="text-sm font-medium text-stone-500">
          ← 둘러보기
        </Link>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          새로 만들기
        </span>
      </header>

      {stage === "pick" && <PickStage onPick={onPick} />}
      {stage === "converting" && <ConvertingStage />}
      {stage === "result" && (
        <ResultStage svg={svg} onDownload={onDownload} onReset={reset} />
      )}
      {stage === "error" && <ErrorStage message={errorMsg} onReset={reset} />}

      <TabBar />
    </>
  );
}

function PickStage({ onPick }: { onPick: (file: File | null) => void }) {
  return (
    <>
      <section className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          사진으로 도안 만들기
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          사진 한 장이면 색칠 도안으로 바꿔드려요.
        </p>
      </section>

      <section className="px-5 pt-6">
        <div className="rounded-3xl bg-gradient-to-br from-orange-200 via-amber-100 to-rose-100 p-6 shadow-sm">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-4 text-base font-bold text-white shadow-md transition active:scale-[0.98]">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            사진 고르기
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              aria-label="사진 선택"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="mt-2 text-center text-xs text-stone-700">
            저장된 사진을 고르거나, 바로 찍어도 돼요.
          </p>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-stone-700">
          <li className="flex items-start gap-2">
            <span aria-hidden>📸</span>
            <span>또렷한 한 명·한 마리·한 물건이 가장 잘 나와요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden>🗑️</span>
            <span>올린 사진은 도안을 만든 뒤 자동으로 지워요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden>🖨️</span>
            <span>완성된 도안은 A4로 인쇄해서 색칠할 수 있어요.</span>
          </li>
        </ul>
      </section>
    </>
  );
}

function ConvertingStage() {
  return (
    <section className="flex flex-col items-center px-5 pt-16">
      <div className="grid size-20 animate-bounce place-items-center rounded-full bg-amber-100 text-4xl" aria-hidden>
        🎨
      </div>
      <p className="mt-6 text-lg font-bold text-stone-900" role="status" aria-live="polite">
        도안을 그리고 있어요…
      </p>
      <p className="mt-1 text-sm text-stone-600">잠시만 기다려 주세요.</p>
      <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-stone-200">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-stone-900" />
      </div>
    </section>
  );
}

function ResultStage({
  svg,
  onDownload,
  onReset,
}: {
  svg: string;
  onDownload: () => void;
  onReset: () => void;
}) {
  return (
    <section className="px-5 pt-4">
      <p className="text-sm font-semibold text-emerald-700">완성!</p>
      <h2 className="text-xl font-extrabold text-stone-900">이렇게 그려졌어요</h2>

      <div
        className="mt-4 aspect-square w-full overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200"
        aria-label="도안 미리보기"
        // 변환 결과는 어댑터가 반환한 SVG 문자열을 그대로 그린다.
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="flex items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3.5 text-base font-bold text-white shadow-sm active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 4v12" />
            <path d="M6 12l6 6 6-6" />
            <path d="M5 20h14" />
          </svg>
          도안 받기
        </button>
        <p className="text-center text-xs text-stone-600">
          A4로 인쇄해서 색칠할 수 있어요.
        </p>
        <Link
          href="/me"
          className="mt-1 rounded-2xl bg-white px-5 py-3.5 text-center text-base font-bold text-stone-900 ring-1 ring-stone-200 active:scale-[0.98]"
        >
          내 작품으로 가기
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl px-5 py-2 text-sm font-medium text-stone-500 hover:text-stone-900"
        >
          다시 만들기
        </button>
      </div>
    </section>
  );
}

function ErrorStage({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <section className="flex flex-col items-center px-5 pt-16">
      <div className="grid size-20 place-items-center rounded-full bg-rose-100 text-4xl" aria-hidden>
        🙏
      </div>
      <p className="mt-6 text-lg font-bold text-stone-900" role="alert">
        {message}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-2xl bg-stone-900 px-5 py-3 text-base font-bold text-white"
      >
        다시 해보기
      </button>
    </section>
  );
}
