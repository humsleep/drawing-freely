/**
 * 로컬 임시 저장 — 백엔드 결합 전 사용자가 만든 작품을 localStorage에 둔다.
 * 백엔드(Supabase) 결합 시 `works` 테이블 + Storage 버킷으로 교체.
 *
 * 한계:
 *   - localStorage ~5MB 상한. 각 PNG dataURL 약 50–150KB 이므로 30개 cap.
 *   - 디바이스/브라우저별 분리. 동기화 없음.
 *
 * 저장된 작품 id는 `local-<timestamp>` prefix 로 구분.
 */

import type { Work } from "./types";

const KEY = "drawingFreely.myWorks";
const MAX = 30;

export function loadStoredWorks(): Work[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Work[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredWork(work: Work): void {
  if (typeof window === "undefined") return;
  const all = loadStoredWorks();
  all.unshift(work);
  if (all.length > MAX) all.length = MAX;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // 용량 초과 — 가장 오래된 것부터 추가로 떨궈서 재시도
    while (all.length > 1) {
      all.pop();
      try {
        localStorage.setItem(KEY, JSON.stringify(all));
        return;
      } catch {
        // continue
      }
    }
  }
}

export function updateStoredWork(id: string, patch: Partial<Work>): void {
  if (typeof window === "undefined") return;
  const all = loadStoredWorks();
  const next = all.map((w) => (w.id === id ? { ...w, ...patch } : w));
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function makeStoredId(): string {
  return `local-${Date.now()}`;
}

/* ---------- 빌더 → 색칠 전달용 임시 슬롯 ---------- */

const PENDING_KEY = "drawingFreely.pendingColor";

export type PendingColor = {
  /** SVG 마크업 또는 PNG dataURL */
  source: string;
  format: "svg" | "png";
};

export function savePendingColor(p: PendingColor): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    // 용량 초과 시 무시. 빌더 결과는 즉시 사용되는 임시 데이터라 폴백 불필요.
  }
}

export function loadPendingColor(): PendingColor | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingColor) : null;
  } catch {
    return null;
  }
}
