"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconArrowUpRight,
  IconBuildingBank,
  IconCash,
  IconChevronRight,
  IconCurrencyBaht,
  IconReceipt2,
  IconRefresh,
  IconTableColumn,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  apiFetchTables,
  apiFetchAccountingSummary,
  apiFetchBills,
  type StoreTable,
  type StoreBill,
  type AccountingSummary,
} from "@/lib/api";

function fmt(n: number) {
  return `฿${n.toLocaleString("th-TH")}`;
}

function bangkokNow() {
  return new Date().toLocaleString("th-TH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Asia/Bangkok",
  });
}

const TABLE_STATUS: Record<string, { label: string; color: string; dot: string }> = {
  available: { label: "ว่าง",      color: "bg-emerald-50  text-emerald-700 ring-emerald-200", dot: "bg-emerald-400" },
  active:    { label: "ใช้บริการ", color: "bg-slate-100   text-slate-600   ring-slate-200",   dot: "bg-slate-400"  },
  preparing: { label: "รออาหาร",  color: "bg-blue-50     text-blue-700    ring-blue-200",    dot: "bg-blue-400"   },
  billing:   { label: "รอชำระ",   color: "bg-red-50      text-red-600     ring-red-200",     dot: "bg-red-400"    },
};

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-border">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", accent)}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[20px] font-bold tabular-nums text-foreground leading-none">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function DashboardOverview() {
  const [tables, setTables] = useState<StoreTable[]>([]);
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [bills, setBills] = useState<StoreBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  const load = () =>
    Promise.all([apiFetchTables(), apiFetchAccountingSummary(), apiFetchBills({ today: true })])
      .then(([t, s, b]) => {
        setTables(t);
        setSummary(s);
        setBills(b.slice().reverse().slice(0, 8));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  useEffect(() => {
    Promise.resolve().then(() => setDate(bangkokNow()));
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, []);

  const activeTables = useMemo(
    () => tables.filter((t) => t.status !== "available"),
    [tables],
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">ภาพรวมร้าน</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{date}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={load}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-[12px] font-medium text-muted-foreground hover:bg-muted transition-colors">
            <IconRefresh size={14} />
            รีเฟรช
          </button>
          <Link href="/cashier"
            className="flex items-center gap-1.5 rounded-xl bg-[#E12717] px-3 py-2 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(225,39,23,0.3)] hover:bg-[#C41E0E] transition-colors">
            เปิดหน้าแคชเชียร์
            <IconArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="รายรับวันนี้"
          value={fmt(summary?.todayRevenue ?? 0)}
          sub={`${summary?.todayBills ?? 0} บิล`}
          icon={IconCurrencyBaht}
          accent="bg-[#FFF0EE] text-[#E12717]"
        />
        <StatCard
          label="บิลเฉลี่ยต่อโต๊ะ"
          value={fmt(summary?.avgBill ?? 0)}
          icon={IconReceipt2}
          accent="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="โต๊ะที่ใช้งานอยู่"
          value={`${activeTables.length}`}
          sub={`จาก ${tables.length} โต๊ะ`}
          icon={IconTableColumn}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="รายรับสัปดาห์นี้"
          value={fmt(summary?.weekRevenue ?? 0)}
          sub={`${summary?.weekBills ?? 0} บิล`}
          icon={IconUsers}
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Two columns */}
      <div className="grid gap-4 lg:grid-cols-5">

        {/* Tables */}
        <div className="lg:col-span-3 rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-border">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-foreground">สถานะโต๊ะตอนนี้</p>
            <Link href="/dashboard/tables"
              className="flex items-center gap-1 text-[11px] font-medium text-[#E12717] hover:underline">
              ดูทั้งหมด <IconChevronRight size={12} />
            </Link>
          </div>
          {tables.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-muted-foreground">ไม่มีโต๊ะในระบบ</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {tables.map((t) => {
                const s = TABLE_STATUS[t.status];
                return (
                  <div key={t.id}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl p-3 ring-1 transition-all",
                      s.color,
                    )}>
                    <span className="text-[15px] font-bold">{t.id}</span>
                    <div className="flex items-center gap-1">
                      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                      <span className="text-[10px] font-medium">{s.label}</span>
                    </div>
                    {t.guests && t.status !== "available" && (
                      <span className="text-[10px] opacity-70">{t.guests} คน</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Status legend */}
          <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3">
            {Object.entries(TABLE_STATUS).map(([, { label, dot }]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", dot)} />
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent bills */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-border">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-foreground">บิลวันนี้</p>
            <Link href="/dashboard/history"
              className="flex items-center gap-1 text-[11px] font-medium text-[#E12717] hover:underline">
              ดูทั้งหมด <IconChevronRight size={12} />
            </Link>
          </div>

          {bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <IconReceipt2 size={20} className="text-muted-foreground" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">ยังไม่มีบิลวันนี้</p>
              <p className="mt-1 text-[11px] text-muted-foreground">บิลจะปรากฏเมื่อปิดโต๊ะ</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bills.map((b) => (
                <div key={b.id}
                  className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
                  {/* Payment icon */}
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white text-[10px] font-bold",
                    b.paymentMethod === "transfer" ? "bg-blue-500" : "bg-emerald-500",
                  )}>
                    {b.paymentMethod === "transfer"
                      ? <IconBuildingBank size={14} />
                      : <IconCash size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground truncate">
                      โต๊ะ {b.tableId}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{b.closedAt} น.</p>
                  </div>
                  <span className="text-[13px] font-bold tabular-nums text-foreground">
                    {fmt(b.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-border">
        <p className="mb-3 text-[13px] font-semibold text-foreground">ทางลัด</p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/cashier",          label: "เปิดหน้าแคชเชียร์",   color: "bg-[#FFF0EE] text-[#E12717] hover:bg-[#FFE4E0]" },
            { href: "/dashboard/menu",   label: "จัดการเมนู",           color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
            { href: "/dashboard/tables", label: "จัดการโต๊ะ",           color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
            { href: "/dashboard/revenue",label: "ดูรายรับ",             color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
            { href: "/accounting",       label: "หน้านักบัญชี",         color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
          ].map(({ href, label, color }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-colors",
                color,
              )}>
              {label}
              <IconArrowUpRight size={13} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
