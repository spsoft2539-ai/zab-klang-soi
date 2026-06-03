import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ตะกร้า | แซ่บกลางซอย",
};

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
