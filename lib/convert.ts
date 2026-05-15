/**
 * 변환 어댑터 — 사진 → 색칠 도안 SVG.
 *
 * CLAUDE.md 원칙 8번: 변환 호출은 이 한 파일에서만 한다.
 * 실제 외부 API(Replicate/OpenAI 등) 결합 시 `mockConvert` 자리에 어댑터를 끼우고,
 * 호출부(`app/api/convert/route.ts`)는 그대로 둔다.
 */

export type ConvertInput = {
  /** 사용자가 고른 사진 파일 */
  file: File;
};

export type ConvertResult = {
  /** 결과 도안 SVG 마크업 (인쇄·다운로드용) */
  svg: string;
  /** 결과 메타 — 백엔드 결합 시 채워짐 */
  meta?: { takenMs: number };
};

export type ConvertError =
  | { kind: "unsupported_format" }
  | { kind: "too_large" }
  | { kind: "convert_failed" }
  | { kind: "rate_limited" };

/**
 * MVP v0: 외부 API 결합 전 — 입력 파일 메타만 검증하고 고정 SVG를 반환한다.
 * 동작 형태는 실제 어댑터와 동일하게 Promise + 에러 유니온.
 */
export async function convert(input: ConvertInput): Promise<ConvertResult> {
  const { file } = input;

  if (!file.type.startsWith("image/")) {
    throw makeError("unsupported_format");
  }
  // 10 MB 상한 — 모바일에서 흔한 사진 한 장 기준
  if (file.size > 10 * 1024 * 1024) {
    throw makeError("too_large");
  }

  const start = performance.now();
  // 외부 API 호출 자리. v0에선 약간의 인공 지연만.
  await new Promise((r) => setTimeout(r, 1200));
  return {
    svg: SAMPLE_DRAWING_SVG,
    meta: { takenMs: Math.round(performance.now() - start) },
  };
}

/** 사용자에게 보여줄 짧은 한글 메시지로 변환. CLAUDE.md UI 4번에 따라 기술 메시지 금지. */
export function convertErrorMessage(): string {
  return "다시 시도해 주세요.";
}

function makeError(kind: ConvertError["kind"]): Error {
  const e = new Error(kind);
  (e as Error & { kind: ConvertError["kind"] }).kind = kind;
  return e;
}

/* ---------- 임시 결과 자료 — 실제 어댑터 도입 시 제거 ---------- */
const SAMPLE_DRAWING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="white"/>
  <circle cx="160" cy="40" r="14" fill="none" stroke="#1f1b16" stroke-width="2"/>
  <g stroke="#1f1b16" stroke-width="2" stroke-linecap="round">
    <line x1="160" y1="18" x2="160" y2="10"/>
    <line x1="160" y1="62" x2="160" y2="70"/>
    <line x1="138" y1="40" x2="130" y2="40"/>
    <line x1="182" y1="40" x2="190" y2="40"/>
    <line x1="145" y1="25" x2="139" y2="19"/>
    <line x1="175" y1="25" x2="181" y2="19"/>
    <line x1="145" y1="55" x2="139" y2="61"/>
    <line x1="175" y1="55" x2="181" y2="61"/>
  </g>
  <circle cx="80" cy="80" r="22" fill="none" stroke="#1f1b16" stroke-width="2.5"/>
  <circle cx="72" cy="78" r="2" fill="#1f1b16"/>
  <circle cx="88" cy="78" r="2" fill="#1f1b16"/>
  <path d="M72 88 Q80 95 88 88" fill="none" stroke="#1f1b16" stroke-width="2" stroke-linecap="round"/>
  <line x1="80" y1="102" x2="80" y2="150" stroke="#1f1b16" stroke-width="2.5"/>
  <line x1="80" y1="118" x2="55" y2="135" stroke="#1f1b16" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="80" y1="118" x2="110" y2="130" stroke="#1f1b16" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="80" y1="150" x2="62" y2="180" stroke="#1f1b16" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="80" y1="150" x2="98" y2="180" stroke="#1f1b16" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M0 188 Q30 178 60 188 Q90 178 120 188 Q150 178 180 188 Q200 183 200 188 L200 200 L0 200 Z" fill="none" stroke="#1f1b16" stroke-width="2"/>
</svg>`;
