/**
 * 공유 DTO — 모든 페이지·API 라우트·시드 데이터가 이 타입을 따른다.
 * 백엔드(Supabase)가 반환할 모양과 일치시켜, 결합일에 매핑만 하면 되도록.
 *
 * Storage 정책(CLAUDE.md `Storage 정책` 참고)에 따라
 * 작품 이미지는 private 버킷 + signed URL이라 클라이언트는 `drawingUrl`만 받는다.
 */

export type AgeBand = "4-6" | "7-9" | "10-12";
export type TemplateAgeBand = AgeBand | "all";

export type Work = {
  id: string;
  title: string;
  ageBand: AgeBand;
  nickname: string;
  isPublic: boolean;
  likeCount: number;
  /** Storage signed URL(만료 짧음) — v0에선 미사용, hue로 대체 */
  drawingUrl?: string;
  /** v0 시드 시각화용. 백엔드 도입 시 제거. */
  hue?: number;
};

export type Template = {
  id: string;
  title: string;
  ageBand: TemplateAgeBand;
  isNew?: boolean;
  /** Storage public URL */
  fileUrl?: string;
  thumbUrl?: string;
  /** v0 시드 시각화용. 백엔드 도입 시 제거. */
  hue?: number;
  emoji?: string;
};
