"use client";

import Link from "next/link";
import {
  IconArrowUpRight,
  IconCircleCheck,
  IconDeviceDesktop,
  IconDeviceTablet,
  IconWifi,
} from "@tabler/icons-react";

const MACHINES = [
  {
    id: "เครื่อง 01",
    type: "desktop",
    location: "เคาน์เตอร์หน้าร้าน",
    status: "online",
    lastActive: "เมื่อสักครู่",
    ip: "192.168.1.10",
  },
];

export default function PosPage() {
  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">จัดการเครื่อง POS</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            อุปกรณ์ที่เชื่อมต่อกับระบบ
          </p>
        </div>
      </div>

      {/* Active machines */}
      <div className="space-y-3">
        {MACHINES.map((m) => (
          <div key={m.id}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-border">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0EE] text-[#E12717]">
              {m.type === "desktop"
                ? <IconDeviceDesktop size={24} />
                : <IconDeviceTablet size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold text-foreground">{m.id}</p>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
                  <IconCircleCheck size={10} />
                  ออนไลน์
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{m.location}</p>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconWifi size={11} />
                  {m.ip}
                </span>
                <span>ใช้งานล่าสุด: {m.lastActive}</span>
              </div>
            </div>
            <Link href="/cashier"
              className="flex items-center gap-1 rounded-xl border border-border bg-muted px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-muted/80 transition-colors shrink-0">
              เปิด POS
              <IconArrowUpRight size={13} />
            </Link>
          </div>
        ))}
      </div>

      {/* Coming soon features */}
      <div className="rounded-2xl border border-dashed border-border bg-white p-5">
        <p className="mb-3 text-[13px] font-semibold text-foreground">ฟีเจอร์ที่กำลังพัฒนา</p>
        <div className="space-y-2">
          {[
            "เพิ่มเครื่อง POS หลายเครื่องพร้อมกัน",
            "กำหนดสิทธิ์แต่ละเครื่อง (ดูได้ / แก้ไขได้ / จัดการบิลได้)",
            "ดูออเดอร์แยกตามเครื่อง",
            "ตั้งชื่อและ PIN สำหรับแต่ละเครื่อง",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              {f}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-600">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
