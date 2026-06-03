"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconChefHat,
  IconChevronRight,
  IconCurrencyBaht,
  IconDeviceDesktop,
  IconFlame,
  IconHistory,
  IconLayoutDashboard,
  IconLogout,
  IconMenu2,
  IconTableColumn,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",         label: "ภาพรวม",                 icon: IconLayoutDashboard, exact: true },
  { href: "/dashboard/tables",  label: "จัดการโต๊ะ",              icon: IconTableColumn },
  { href: "/dashboard/menu",    label: "จัดการเมนู",              icon: IconChefHat },
  { href: "/dashboard/revenue", label: "รายรับ / จ่าย",           icon: IconCurrencyBaht },
  { href: "/dashboard/pos",     label: "จัดการเครื่อง POS",      icon: IconDeviceDesktop },
  { href: "/dashboard/history", label: "ประวัติการทำรายการ",     icon: IconHistory },
] as const;

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col bg-[#13151F]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pb-4 pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5546] to-[#C41E0E] shadow-[0_8px_20px_rgba(225,39,23,0.4)]">
          <IconFlame size={20} className="text-white" stroke={1.8} />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-tight text-white">แซ่บกลางซอย</p>
          <p className="text-[10px] font-medium text-white/35 tracking-wide">ระบบจัดการร้าน</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/30 hover:text-white/70">
            <IconX size={16} />
          </button>
        )}
      </div>

      <div className="mx-4 mb-3 h-px bg-white/[0.07]" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const on = active(href, exact);
          return (
            <Link key={href} href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                on
                  ? "bg-white/[0.12] text-white"
                  : "text-white/45 hover:bg-white/[0.06] hover:text-white/75",
              )}>
              <Icon size={17}
                className={cn("shrink-0 transition-colors", on ? "text-[#FF6B5B]" : "group-hover:text-white/60")} />
              <span className="flex-1">{label}</span>
              {on && <IconChevronRight size={13} className="text-white/30" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mx-4 mb-3 mt-2 h-px bg-white/[0.07]" />
      <div className="px-3 pb-5">
        {/* "User" row */}
        <div className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5546] to-[#C41E0E] text-[12px] font-bold text-white shadow-sm">
            ม
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-white/80 truncate">เจ้าของร้าน</p>
            <p className="text-[10px] text-white/30">Manager</p>
          </div>
        </div>
        <Link href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400">
          <IconLogout size={17} />
          ออกจากระบบ
        </Link>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setOpen(false));
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F9]">
      {/* Desktop sidebar */}
      <aside className="hidden w-[220px] shrink-0 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 left-0 w-[220px] shadow-2xl">
            <Sidebar onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <IconMenu2 size={19} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E12717]">
              <IconFlame size={14} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-foreground">แซ่บกลางซอย</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
