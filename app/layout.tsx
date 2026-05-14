import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "그림자유 · 사진을 그림으로",
  description:
    "사진 한 장으로 색칠 도안을 만들고, 내 작품을 자랑하고, 무료 도안을 받는 어린이 그림 놀이터.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffaf3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
