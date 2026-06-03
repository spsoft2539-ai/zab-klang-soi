"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconBuildingBank,
  IconCash,
  IconDownload,
  IconTrendingUp,
} from "@tabler/icons-react";
import { apiFetchBills, type StoreBill } from "@/lib/api";

function fmt(n: number) { return `฿${n.toLocaleString("th-TH")}`; }

function exportCsv(bills: StoreBill[]) {
  const rows = [
    ["บิล", "โต๊ะ", "เวลา", "ชำระด้วย", "ยอดสุทธิ", "VAT", "รวม"],
    ...bills.map((b) => [
      b.id, b.tableId, b.closedAt,
      b.paymentMethod === "transfer" ? "โอนเงิน" : "เงินสด",
      b.subtotal, b.vat, b.total,
    ]),
  ];
  const blob = new Blob(["﻿" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `revenue_${new Date().toISOString().slice(0, 10)}.csv`,
  });
  a.click();
}

/* ─── Simple bar chart (CSS) ────────────────────────────────── */
function BarChart({ bills }: { bills: StoreBill[] }) {
  const days = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "Asia/Bangkok" });
      map.set(key, 0);
    }
    bills.forEach((b) => {
      const key = new Date(b.closedAtMs).toLocaleDateString("th-TH", {
        day: "numeric", month: "short", timeZone: "Asia/Bangkok",
      });
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + b.total);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [bills]);

  const max = Math.max(...days.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-36 pt-2">
      {days.map(({ label, value }) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {value > 0 ? `฿${(value / 1000).toFixed(1)}k` : ""}
          </span>
          <div className="relative w-full flex-1 flex items-end">
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-[#E12717] to-[#FF6B5B] transition-all duration-500"
              style={{ height: `${Math.max(4, (value / max) * 100)}%`, minHeight: value > 0 ? "8px" : "3px",
                opacity: value > 0 ? 1 : 0.2 }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground whitespace-nowrap">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function RevenuePage() {
  const [bills, setBills] = useState<StoreBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchBills()
      .then((b) => { setBills(b); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cashTotal   = bills.filter((b) => b.paymentMethod !== "transfer").reduce((s, b) => s + b.total, 0);
  const transTotal  = bills.filter((b) => b.paymentMethod === "transfer").reduce((s, b) => s + b.total, 0);
  const allTotal    = bills.reduce((s, b) => s + b.total, 0);
  const cashCount   = bills.filter((b) => b.paymentMethod !== "transfer").length;
  const transCount  = bills.filter((b) => b.paymentMethod === "transfer").length;

  return (
    <div className="p-6 max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">รายรับ / จ่าย</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">ภาพรวมการเงินร้าน</p>
        </div>
        <button type="button" onClick={() => exportCsv(bills)}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-[12px] font-medium text-muted-foreground hover:bg-muted transition-colors shrink-0">
          <IconDownload size={14} />
          Export CSV
        </button>
      </div>

      {loading ? (
        <p className="text-[13px] text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#E12717] to-[#C41E0E] p-4 text-white shadow-[0_8px_24px_rgba(225,39,23,0.3)]">
              <IconTrendingUp size={18} className="mb-2 text-white/70" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">รายรับทั้งหมด</p>
              <p className="mt-1 text-[20px] font-bold tabular-nums">{fmt(allTotal)}</p>
              <p className="text-[10px] text-white/60">{bills.length} บิล</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-border">
              <IconCash size={18} className="mb-2 text-emerald-500" />
              <p className="text-[10px] font-medium text-muted-foreground">เงินสด</p>
              <p className="mt-1 text-[18px] font-bold tabular-nums text-foreground">{fmt(cashTotal)}</p>
              <p className="text-[10px] text-muted-foreground">{cashCount} บิล</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-border">
              <IconBuildingBank size={18} className="mb-2 text-blue-500" />
              <p className="text-[10px] font-medium text-muted-foreground">โอนเงิน</p>
              <p className="mt-1 text-[18px] font-bold tabular-nums text-foreground">{fmt(transTotal)}</p>
              <p className="text-[10px] text-muted-foreground">{transCount} บิล</p>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-border">
            <p className="mb-4 text-[13px] font-semibold text-foreground">รายรับ 7 วันที่ผ่านมา</p>
            <BarChart bills={bills} />
          </div>

          {/* Payment method breakdown */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-border">
            <p className="mb-3 text-[13px] font-semibold text-foreground">สัดส่วนวิธีชำระ</p>
            <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-muted">
              <div className="bg-emerald-400 transition-all"
                style={{ width: allTotal > 0 ? `${(cashTotal / allTotal) * 100}%` : "50%" }} />
              <div className="flex-1 bg-blue-400" />
            </div>
            <div className="flex justify-between text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-muted-foreground">เงินสด</span>
                <span className="font-semibold text-foreground">
                  {allTotal > 0 ? `${Math.round((cashTotal / allTotal) * 100)}%` : "—"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">
                  {allTotal > 0 ? `${Math.round((transTotal / allTotal) * 100)}%` : "—"}
                </span>
                <span className="text-muted-foreground">โอนเงิน</span>
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
              </div>
            </div>
          </div>

          {/* Expenses — coming soon */}
          <div className="rounded-2xl border border-dashed border-border bg-white p-5 text-center">
            <p className="text-[13px] font-semibold text-foreground">บันทึกรายจ่าย</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              ฟีเจอร์บันทึกค่าใช้จ่ายร้าน (วัตถุดิบ, ค่าจ้าง ฯลฯ) กำลังพัฒนา
            </p>
            <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-600">
              Coming soon
            </span>
          </div>
        </>
      )}
    </div>
  );
}
