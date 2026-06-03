"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowUpRight, IconTableColumn } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { apiFetchTables, type StoreTable } from "@/lib/api";

const STATUS: Record<string, { label: string; pill: string }> = {
  available: { label: "ว่าง",      pill: "bg-emerald-100 text-emerald-700" },
  active:    { label: "ใช้บริการ", pill: "bg-slate-100 text-slate-600" },
  preparing: { label: "รออาหาร",  pill: "bg-blue-100 text-blue-700" },
  billing:   { label: "รอชำระ",   pill: "bg-red-100 text-red-600" },
};

export default function TablesPage() {
  const [tables, setTables] = useState<StoreTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchTables()
      .then(setTables)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const zones = [...new Set(tables.map((t) => t.zone))].sort();
  const counts = {
    available: tables.filter((t) => t.status === "available").length,
    active: tables.filter((t) => t.status === "active").length,
    preparing: tables.filter((t) => t.status === "preparing").length,
    billing: tables.filter((t) => t.status === "billing").length,
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">จัดการโต๊ะ</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            ดูสถานะโต๊ะทั้งหมด {tables.length} โต๊ะ
          </p>
        </div>
        <Link href="/cashier/settings"
          className="flex items-center gap-1.5 rounded-xl bg-[#E12717] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(225,39,23,0.3)] hover:bg-[#C41E0E] transition-colors">
          แก้ไขโต๊ะ
          <IconArrowUpRight size={13} />
        </Link>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ring-1",
            k === "available" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
            k === "active"    ? "bg-slate-100 text-slate-600 ring-slate-200" :
            k === "preparing" ? "bg-blue-50 text-blue-700 ring-blue-200" :
                                "bg-red-50 text-red-600 ring-red-200")}>
            <span className="tabular-nums font-bold">{v}</span>
            <span className="font-medium">{STATUS[k].label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-[13px] text-muted-foreground">กำลังโหลด...</p>
      ) : (
        zones.map((zone) => (
          <div key={zone}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              โซน {zone}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {tables.filter((t) => t.zone === zone).map((t) => {
                const s = STATUS[t.status];
                return (
                  <div key={t.id}
                    className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-border">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                        <span className="text-[13px] font-bold text-foreground">{t.id}</span>
                      </div>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", s.pill)}>
                        {s.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      <div className="flex justify-between">
                        <span>ที่นั่ง</span>
                        <span className="font-semibold text-foreground">{t.seats} คน</span>
                      </div>
                      {t.guests && t.status !== "available" && (
                        <div className="flex justify-between">
                          <span>ลูกค้า</span>
                          <span className="font-semibold text-foreground">{t.guests} คน</span>
                        </div>
                      )}
                      {t.openedAt && t.status !== "available" && (
                        <div className="flex justify-between">
                          <span>เปิดเมื่อ</span>
                          <span className="font-semibold text-foreground tabular-nums">{t.openedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Link to full management */}
      <div className="rounded-2xl border border-dashed border-border bg-white p-5 text-center">
        <IconTableColumn size={28} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-[13px] font-semibold text-foreground">เพิ่ม / แก้ไข / ลบโต๊ะ</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          ไปที่หน้าตั้งค่าร้านเพื่อจัดการโต๊ะแบบเต็ม
        </p>
        <Link href="/cashier/settings"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-[12px] font-semibold text-white">
          ไปหน้าตั้งค่า <IconArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
