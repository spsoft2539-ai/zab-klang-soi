"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowRight,
  IconChevronRight,
  IconDeviceDesktop,
  IconFlame,
  IconLayoutDashboard,
  IconQrcode,
  IconReportMoney,
} from "@tabler/icons-react";

export default function LandingPage() {
  const router = useRouter();
  const [tableId, setTableId] = useState("");

  const goToTable = () => {
    const id = tableId.trim().toUpperCase();
    if (id) router.push(`/menu/${id}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFF9F5] px-5 py-16">
      {/* ── Brand ─────────────────────────────── */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-[30px] bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#C41E0E] shadow-[0_20px_48px_rgba(225,39,23,0.38)]">
          <IconFlame size={42} className="text-white" stroke={1.6} />
        </div>
        <h1 className="text-[30px] font-bold tracking-tight text-[#2C1713]">
          แซ่บกลางซอย
        </h1>
        <p className="mt-1.5 text-[13px] text-[#A98671]">
          อีสาน · ซีฟู้ด · หมูกระทะ
        </p>
      </div>

      {/* ── Cards ─────────────────────────────── */}
      <div className="w-full max-w-sm space-y-3">

        {/* Customer card */}
        <div className="rounded-[24px] border border-[#F0E0D4] bg-white p-5 shadow-[0_8px_24px_rgba(44,23,19,0.07)]">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#E12717]">
              <IconQrcode size={22} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#2C1713]">ลูกค้า</p>
              <p className="text-[12px] text-[#9D7F6A]">สั่งอาหารผ่านมือถือ</p>
            </div>
          </div>

          {/* Hint */}
          <p className="mb-3 rounded-xl bg-[#FFF9F5] px-3.5 py-2.5 text-[12px] leading-5 text-[#9D7F6A]">
            📱 ปกติสแกน QR Code ที่โต๊ะจากแคชเชียร์ <br />
            ทดสอบ: กรอกเลขโต๊ะด้านล่างได้เลย
          </p>

          {/* Table input */}
          <div className="flex gap-2">
            <input
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToTable()}
              placeholder="เลขโต๊ะ เช่น A1, B3"
              maxLength={4}
              className="flex-1 rounded-xl border border-[#F0E0D4] bg-[#FFF9F5] px-4 py-2.5 text-[13px] text-[#2C1713] placeholder:text-[#C4A98A] outline-none transition focus:border-[#E12717] focus:ring-2 focus:ring-[#E12717]/10"
            />
            <button
              type="button"
              onClick={goToTable}
              disabled={!tableId.trim()}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] text-white shadow-[0_8px_16px_rgba(225,39,23,0.28)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconArrowRight size={18} />
            </button>
          </div>

          {/* Quick-pick table buttons */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["A1", "A2", "A3", "A4", "B1", "B2"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => router.push(`/menu/${t}`)}
                className="rounded-lg border border-[#F0E0D4] bg-[#FFF9F5] px-3 py-1 text-[11px] font-medium text-[#7C5B47] transition-colors hover:border-[#E12717]/40 hover:bg-[#FFF3EC] hover:text-[#E12717]"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Cashier card */}
        <Link
          href="/cashier"
          className="flex items-center gap-4 rounded-[24px] bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#C41E0E] p-5 text-white shadow-[0_16px_36px_rgba(225,39,23,0.30)] transition-transform active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <IconDeviceDesktop size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">แคชเชียร์</p>
            <p className="text-[12px] text-white/70">จัดการโต๊ะและบิล</p>
          </div>
          <IconChevronRight size={20} className="text-white/60" />
        </Link>

        {/* Owner / Manager Dashboard card */}
        <Link
          href="/dashboard"
          className="flex items-center gap-4 rounded-[24px] border border-[#1A1D2E]/15 bg-gradient-to-br from-[#1A1D2E] to-[#2D3250] p-5 text-white shadow-[0_8px_24px_rgba(26,29,46,0.25)] transition-transform active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <IconLayoutDashboard size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">เจ้าของร้าน</p>
            <p className="text-[12px] text-white/60">Dashboard · รายงาน · ตั้งค่า</p>
          </div>
          <IconChevronRight size={20} className="text-white/40" />
        </Link>

        {/* Accountant card */}
        <Link
          href="/accounting"
          className="flex items-center gap-4 rounded-[24px] border border-[#D4E4CC] bg-gradient-to-br from-[#F0F7EC] to-[#E4F0DC] p-5 text-[#2D5A1B] shadow-[0_8px_24px_rgba(45,90,27,0.10)] transition-transform active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2D5A1B]/10">
            <IconReportMoney size={22} className="text-[#2D5A1B]" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">นักบัญชี</p>
            <p className="text-[12px] text-[#4A7A35]/80">รายรับ · ประวัติบิล · รายงาน</p>
          </div>
          <IconChevronRight size={20} className="text-[#4A7A35]/50" />
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-10 text-[11px] text-[#C4A98A]">แซ่บกลางซอย · ระบบสั่งอาหาร v0.1</p>
    </main>
  );
}
