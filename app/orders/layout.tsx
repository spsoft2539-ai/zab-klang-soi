import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "รายการที่สั่งแล้ว | แซ่บกลางซอย",
};

export default function OrdersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
