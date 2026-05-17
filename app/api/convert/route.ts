import { NextResponse } from "next/server";
import { convert } from "@/lib/convert";

/**
 * 변환 라우트 — 클라이언트가 사진 파일을 multipart로 보내고 SVG 문자열을 받는다.
 * 외부 API 키는 이 라우트(서버) 안에서만 사용 — CLAUDE.md 원칙 7.
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  try {
    const { svg } = await convert({ file });
    return NextResponse.json({ svg });
  } catch {
    // 상세 사유는 서버 로그로만, 클라이언트엔 단일 메시지.
    return NextResponse.json({ error: "convert_failed" }, { status: 400 });
  }
}
