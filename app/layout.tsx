import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "แซ่บกลางซอย | โต๊ะ xx",
  description: "แซ่บกลางซอย Table System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#F7F3EF]">{children}</body>
    </html>
  );
}
