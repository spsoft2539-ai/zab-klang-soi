import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cashier · แซ่บกลางซอย",
};

export default function CashierLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
