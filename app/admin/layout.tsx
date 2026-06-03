import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แอดมิน | แซ่บกลางซอย",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-[#FBF7F6]">{children}</div>;
}
