import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นักบัญชี · แซ่บกลางซอย",
};

export default function AccountingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
