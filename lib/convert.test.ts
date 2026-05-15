import { describe, it, expect } from "vitest";
import { convert, convertErrorMessage } from "./convert";

function fakeFile(opts: { type?: string; sizeBytes?: number; name?: string } = {}): File {
  const type = opts.type ?? "image/png";
  const size = opts.sizeBytes ?? 100;
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], opts.name ?? "photo.png", { type });
}

describe("convert (어댑터 계약)", () => {
  it("성공 시 svg 문자열을 반환한다", async () => {
    const result = await convert({ file: fakeFile() });
    expect(result.svg.startsWith("<svg")).toBe(true);
  });

  it("이미지가 아닌 파일은 unsupported_format 으로 거부한다", async () => {
    await expect(
      convert({ file: fakeFile({ type: "application/pdf" }) }),
    ).rejects.toThrow("unsupported_format");
  });

  it("10MB 초과 파일은 too_large 로 거부한다", async () => {
    await expect(
      convert({ file: fakeFile({ sizeBytes: 11 * 1024 * 1024 }) }),
    ).rejects.toThrow("too_large");
  });
});

describe("convertErrorMessage", () => {
  it("사용자에게는 항상 친근한 한 문장을 돌려준다 (기술 메시지 노출 금지)", () => {
    expect(convertErrorMessage()).toBe("다시 시도해 주세요.");
  });
});
