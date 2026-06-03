import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ครัว | แซ่บกลางซอย",
};

export default function KitchenLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
