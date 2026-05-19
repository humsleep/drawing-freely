import ColorCanvas from "./ColorCanvas";

/**
 * 색칠 화면 — `[id]` 포맷:
 *   - `animal-<name>` (예: `animal-elephant`) — 동물 도안
 *   - `template-<id>` — 무료 도안 (다음 단계)
 *   - `work-<id>`     — 내 작품 다시 색칠 (다음 단계)
 *   - `local`         — 빌더 결과 (localStorage)  (다음 단계)
 *
 * v0(이번 PR): `animal-*` 만 지원. 나머지는 빈 캔버스로 fallback.
 */
export default async function ColorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ColorCanvas id={id} />;
}
