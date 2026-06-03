"use client";

import { useEffect, useState } from "react";
import {
  IconBuildingBank,
  IconCash,
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconReceipt2,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { apiFetchBills, type StoreBill } from "@/lib/api";

function fmt(n: number) { return `฿${n.toLocaleString("th-TH")}`; }

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString("th-TH", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Bangkok",
  });
}

function exportCsv(bills: StoreBill[]) {
  const rows = [
    ["บิล", "โต๊ะ", "วันที่", "เวลา", "ชำระด้วย", "รับเงิน", "เงินทอน", "ยอดก่อน VAT", "VAT", "รวม"],
    ...bills.map((b) => [
      b.id, b.tableId, fmtDate(b.closedAtMs), b.closedAt,
      b.paymentMethod === "transfer" ? "โอนเงิน" : "เงินสด",
      b.cashReceived ?? "", b.change ?? "",
      b.subtotal, b.vat, b.total,
    ]),
  ];
  const blob = new Blob(["﻿" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `history_${new Date().toISOString().slice(0, 10)}.csv`,
  });
  a.click();
}

function BillRow({ bill }: { bill: StoreBill }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] ring-1 ring-border">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white",
          bill.paymentMethod === "transfer" ? "bg-blue-500" : "bg-emerald-500",
        )}>
          {bill.paymentMethod === "transfer"
            ? <IconBuildingBank size={15} />
            : <IconCash size={15} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground">
            โต๊ะ {bill.tableId}
            <span className="ml-2 text-[11px] font-normal text-muted-foreground">{bill.id}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            {fmtDate(bill.closedAtMs)} · {bill.closedAt} น.
            {bill.guests && <span> · <IconUsers size={10} className="inline" /> {bill.guests} คน</span>}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[15px] font-bold tabular-nums text-foreground">{fmt(bill.total)}</p>
          {bill.change !== undefined && bill.change > 0 && (
            <p className="text-[10px] text-muted-foreground">ทอน {fmt(bill.change)}</p>
          )}
        </div>
        {open ? <IconChevronUp size={15} className="shrink-0 text-muted-foreground" />
               : <IconChevronDown size={15} className="shrink-0 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-3 pt-3">
          <div className="mb-2 space-y-1">
            {bill.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[12px]">
                <span className="text-foreground">
                  {item.name}
                  {item.note && <span className="text-muted-foreground"> ({item.note})</span>}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  ×{item.quantity} = {fmt(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t border-dashed border-border pt-2 text-[12px]">
            <div className="flex justify-between text-muted-foreground">
              <span>ยอดอาหาร</span><span>{fmt(bill.subtotal)}</span>
            </div>
            {bill.vat > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>VAT {bill.vatRate}%</span><span>{fmt(bill.vat)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-foreground">
              <span>รวมทั้งสิ้น</span><span>{fmt(bill.total)}</span>
            </div>
            {bill.cashReceived !== undefined && (
              <div className="flex justify-between text-muted-foreground">
                <span>รับเงิน</span><span>{fmt(bill.cashReceived)}</span>
              </div>
            )}
            {bill.change !== undefined && bill.change > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>เงินทอน</span><span>{fmt(bill.change)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [bills, setBills] = useState<StoreBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchBills()
      .then((b) => setBills(b.slice().reverse()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">ประวัติการทำรายการ</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{bills.length} บิลทั้งหมด</p>
        </div>
        <button type="button" onClick={() => exportCsv(bills)}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-[12px] font-medium text-muted-foreground hover:bg-muted transition-colors shrink-0">
          <IconDownload size={14} />
          Export CSV
        </button>
      </div>

      {loading ? (
        <p className="text-[13px] text-muted-foreground">กำลังโหลด...</p>
      ) : bills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-12 text-center">
          <IconReceipt2 size={28} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-[13px] font-semibold text-foreground">ยังไม่มีประวัติ</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            บิลจะบันทึกเมื่อแคชเชียร์ปิดโต๊ะ
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bills.map((b) => <BillRow key={b.id} bill={b} />)}
        </div>
      )}
    </div>
  );
}
