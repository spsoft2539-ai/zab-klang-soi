"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCalendarStats,
  IconChevronDown,
  IconChevronUp,
  IconCoin,
  IconDownload,
  IconFileText,
  IconReceipt2,
  IconReportMoney,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  apiFetchBills,
  apiFetchAccountingSummary,
  type StoreBill,
  type AccountingSummary,
} from "@/lib/api";

function formatCurrency(n: number) {
  return `฿${n.toLocaleString("th-TH")}`;
}

function formatDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
}

/* ─── Export CSV helper ─────────────────────────────────────── */

function exportCsv(bills: StoreBill[]) {
  const rows = [
    ["บิล", "โต๊ะ", "เวลาปิด", "รายการ", "ยอดสุทธิ", "VAT", "รวม"],
    ...bills.map((b) => [
      b.id,
      b.tableId,
      b.closedAt,
      b.items.map((i) => `${i.name}x${i.quantity}`).join(" | "),
      b.subtotal,
      b.vat,
      b.total,
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bills_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Page ──────────────────────────────────────────────────── */

type Tab = "dashboard" | "history" | "report";

export default function AccountingPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [bills, setBills] = useState<StoreBill[]>([]);
  const [loading, setLoading] = useState(true);

  const doFetch = () =>
    Promise.all([apiFetchAccountingSummary(), apiFetchBills()])
      .then(([s, b]) => {
        setSummary(s);
        setBills(b.slice().reverse()); // newest first
        setLoading(false);
      })
      .catch(() => setLoading(false));

  useEffect(() => {
    doFetch();
    const id = setInterval(doFetch, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-white px-5">
        <Link
          href="/"
          aria-label="กลับหน้าหลัก"
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-foreground ring-1 ring-border transition-transform active:scale-95"
        >
          <IconArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <IconReportMoney size={18} />
          </div>
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Accounting
            </p>
            <h1 className="text-[15px] font-semibold text-foreground">
              นักบัญชี
            </h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={doFetch}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted"
          >
            รีเฟรช
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border bg-white px-5">
        {(
          [
            { id: "dashboard", label: "ภาพรวม", icon: IconTrendingUp },
            { id: "history", label: "ประวัติบิล", icon: IconReceipt2 },
            { id: "report", label: "รายงาน", icon: IconFileText },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-3 text-[13px] font-medium transition-colors",
              tab === id
                ? "border-emerald-700 text-emerald-700"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {loading && !summary ? (
          <div className="py-20 text-center text-[13px] text-muted-foreground">
            กำลังโหลด...
          </div>
        ) : tab === "dashboard" ? (
          <DashboardTab summary={summary} bills={bills} />
        ) : tab === "history" ? (
          <HistoryTab bills={bills} onExport={() => exportCsv(bills)} />
        ) : (
          <ReportTab bills={bills} onExport={() => exportCsv(bills)} />
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard Tab ─────────────────────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "emerald",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color?: "emerald" | "blue" | "amber" | "rose";
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  };
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl ring-1", colors[color])}>
        <Icon size={18} />
      </div>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[22px] font-bold tabular-nums text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function DashboardTab({
  summary,
  bills,
}: {
  summary: AccountingSummary | null;
  bills: StoreBill[];
}) {
  const todayBills = useMemo(
    () =>
      bills.filter((b) => {
        const d = new Date(b.closedAtMs);
        const today = new Date();
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      }),
    [bills],
  );

  if (!summary) {
    return (
      <div className="py-20 text-center text-[13px] text-muted-foreground">
        ยังไม่มีข้อมูล
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="รายรับวันนี้"
          value={formatCurrency(summary.todayRevenue)}
          sub={`${summary.todayBills} บิล`}
          icon={IconCoin}
          color="emerald"
        />
        <StatCard
          label="บิลเฉลี่ย (วันนี้)"
          value={formatCurrency(summary.avgBill)}
          icon={IconReceipt2}
          color="blue"
        />
        <StatCard
          label="รายรับสัปดาห์นี้"
          value={formatCurrency(summary.weekRevenue)}
          sub={`${summary.weekBills} บิล`}
          icon={IconCalendarStats}
          color="amber"
        />
        <StatCard
          label="รายรับทั้งหมด"
          value={formatCurrency(summary.allRevenue)}
          sub={`${summary.allBills} บิล`}
          icon={IconTrendingUp}
          color="rose"
        />
      </div>

      {/* Today's bills */}
      <div>
        <p className="mb-3 text-[13px] font-semibold text-foreground">
          บิลวันนี้ ({todayBills.length})
        </p>
        {todayBills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <IconReceipt2 size={22} className="text-muted-foreground" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">ยังไม่มีบิล</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              บิลจะปรากฏเมื่อแคชเชียร์ปิดโต๊ะ
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayBills.slice(0, 5).map((b) => (
              <BillRow key={b.id} bill={b} compact />
            ))}
            {todayBills.length > 5 && (
              <p className="text-center text-[12px] text-muted-foreground">
                และอีก {todayBills.length - 5} บิล — ดูทั้งหมดในแท็บประวัติ
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── History Tab ───────────────────────────────────────────── */

function HistoryTab({
  bills,
  onExport,
}: {
  bills: StoreBill[];
  onExport: () => void;
}) {
  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-foreground">
          ประวัติทั้งหมด ({bills.length} บิล)
        </p>
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted"
        >
          <IconDownload size={14} />
          Export CSV
        </button>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-5 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <IconReceipt2 size={22} className="text-muted-foreground" />
          </div>
          <p className="text-[13px] font-semibold text-foreground">ยังไม่มีประวัติ</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            บิลจะถูกบันทึกเมื่อแคชเชียร์ปิดโต๊ะ
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bills.map((b) => (
            <BillRow key={b.id} bill={b} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Report Tab ────────────────────────────────────────────── */

function ReportTab({
  bills,
  onExport,
}: {
  bills: StoreBill[];
  onExport: () => void;
}) {
  // Group by category from items
  const byCategory = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    bills.forEach((b) => {
      b.items.forEach((item) => {
        const prev = map.get(item.name) ?? { qty: 0, revenue: 0 };
        map.set(item.name, {
          qty: prev.qty + item.quantity,
          revenue: prev.revenue + item.price * item.quantity,
        });
      });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [bills]);

  // Top tables
  const byTable = useMemo(() => {
    const map = new Map<string, { bills: number; revenue: number }>();
    bills.forEach((b) => {
      const prev = map.get(b.tableId) ?? { bills: 0, revenue: 0 };
      map.set(b.tableId, { bills: prev.bills + 1, revenue: prev.revenue + b.total });
    });
    return Array.from(map.entries())
      .map(([tableId, v]) => ({ tableId, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [bills]);

  const totalRevenue = bills.reduce((s, b) => s + b.total, 0);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-foreground">รายงานสรุป</p>
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted"
        >
          <IconDownload size={14} />
          Export CSV
        </button>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-5 py-10 text-center">
          <p className="text-[13px] font-semibold text-foreground">ยังไม่มีข้อมูล</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            รายงานจะปรากฏหลังจากมีบิลปิดโต๊ะ
          </p>
        </div>
      ) : (
        <>
          {/* Menu ranking */}
          <section className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-3 text-[13px] font-semibold text-foreground">
              เมนูยอดนิยม (ตามรายรับ)
            </p>
            <div className="space-y-2">
              {byCategory.slice(0, 10).map((item, i) => {
                const pct = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                return (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-[11px] font-bold tabular-nums text-muted-foreground">
                          {i + 1}
                        </span>
                        <span className="text-[13px] font-medium text-foreground">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          ×{item.qty}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold tabular-nums text-foreground">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Table ranking */}
          <section className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-3 text-[13px] font-semibold text-foreground">
              รายรับตามโต๊ะ
            </p>
            <div className="divide-y divide-border">
              {byTable.map((row) => (
                <div key={row.tableId} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-[12px] font-bold text-foreground">
                      {row.tableId}
                    </div>
                    <span className="text-[12px] text-muted-foreground">
                      {row.bills} บิล
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums text-foreground">
                    {formatCurrency(row.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* ─── Bill Row ──────────────────────────────────────────────── */

function BillRow({ bill, compact = false }: { bill: StoreBill; compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {/* Table badge */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[12px] font-bold text-emerald-700 ring-1 ring-emerald-100">
          {bill.tableId}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground">
            {bill.id}
          </p>
          {!compact && (
            <p className="text-[11px] text-muted-foreground">
              {formatDate(bill.closedAtMs)} · {bill.closedAt} น.
            </p>
          )}
          {compact && (
            <p className="text-[11px] text-muted-foreground">
              {bill.closedAt} น. · {bill.items.length} รายการ
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-[14px] font-bold tabular-nums text-foreground">
            {formatCurrency(bill.total)}
          </p>
          {bill.guests && (
            <p className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
              <IconUsers size={10} />
              {bill.guests} คน
            </p>
          )}
        </div>

        {open ? (
          <IconChevronUp size={16} className="shrink-0 text-muted-foreground" />
        ) : (
          <IconChevronDown size={16} className="shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-3 pt-2">
          {/* Items */}
          <div className="mb-3 space-y-1">
            {bill.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[12px]">
                <span className="text-foreground">
                  {item.name}
                  {item.note && (
                    <span className="ml-1 text-muted-foreground">({item.note})</span>
                  )}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  ×{item.quantity} = {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 border-t border-dashed border-border pt-2 text-[12px]">
            <div className="flex justify-between text-muted-foreground">
              <span>ยอดก่อน VAT</span>
              <span className="tabular-nums">{formatCurrency(bill.subtotal)}</span>
            </div>
            {bill.vat > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>VAT {bill.vatRate}%</span>
                <span className="tabular-nums">{formatCurrency(bill.vat)}</span>
              </div>
            )}
            {bill.serviceAmt > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service {bill.serviceCharge}%</span>
                <span className="tabular-nums">{formatCurrency(bill.serviceAmt)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-foreground">
              <span>รวมทั้งสิ้น</span>
              <span className="tabular-nums">{formatCurrency(bill.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
