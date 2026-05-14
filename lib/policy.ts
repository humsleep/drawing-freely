/**
 * 정책 함수들 — UI/API 어디서든 같은 규칙을 쓰기 위해 한 곳에.
 * 어떤 화면에도 의존하지 않는 순수 함수만 둔다.
 */

/**
 * 작품의 공개 상태를 바꿀 때, 부모에게 한 번 확인을 받아야 하는지 여부.
 * 비공개 → 공개로 갈 때만 true. 반대는 즉시 적용.
 */
export function requiresPublishConfirm(
  prevIsPublic: boolean,
  nextIsPublic: boolean,
): boolean {
  return prevIsPublic === false && nextIsPublic === true;
}

/**
 * 작품이 공개 갤러리·랭킹에 노출 가능한 상태인지.
 * is_public이 true일 때만. (백엔드 RLS와 동일한 기준)
 */
export function isVisibleInGallery(work: { isPublic: boolean }): boolean {
  return work.isPublic === true;
}
