import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "날씨가 기분이다냥",
  description: "귀여운 고양이와 함께하는 날씨 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
