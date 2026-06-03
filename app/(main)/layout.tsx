export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-[#FFF9F5]">{children}</div>;
}
