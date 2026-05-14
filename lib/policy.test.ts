import { describe, it, expect } from "vitest";
import { isVisibleInGallery, requiresPublishConfirm } from "./policy";

describe("requiresPublishConfirm", () => {
  it("비공개 → 공개일 때만 확인이 필요하다", () => {
    expect(requiresPublishConfirm(false, true)).toBe(true);
  });

  it("공개 → 비공개는 즉시 적용 (확인 불필요)", () => {
    expect(requiresPublishConfirm(true, false)).toBe(false);
  });

  it("같은 상태 유지는 확인 불필요", () => {
    expect(requiresPublishConfirm(true, true)).toBe(false);
    expect(requiresPublishConfirm(false, false)).toBe(false);
  });
});

describe("isVisibleInGallery", () => {
  it("공개 작품만 갤러리에 노출된다", () => {
    expect(isVisibleInGallery({ isPublic: true })).toBe(true);
    expect(isVisibleInGallery({ isPublic: false })).toBe(false);
  });
});
