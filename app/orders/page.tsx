"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCash,
  IconCheck,
  IconChefHat,
  IconCircleCheck,
  IconClockHour4,
  IconPlus,
  IconQrcode,
  IconReceipt2,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { SubmittedOrderItem } from "@/components/submitted-order-card";

type PaymentMethod = "promptpay" | "counter";

const VAT_RATE = 0.07;
const TEAR_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 12'><polygon points='0,0 14,0 14,4 7,12 0,4' fill='%23FCF7EF'/></svg>")`;

const orderedItems: SubmittedOrderItem[] = [
  {
    id: "1",
    name: "ต้มยำกุ้งน้ำข้น",
    note: "เผ็ดกลาง · ไม่ใส่ผักชี",
    price: 189,
    quantity: 1,
    image: "https://placehold.co/120x120.png",
    orderedAt: "19:12",
    status: "served",
  },
  {
    id: "2",
    name: "หมูกระทะรวมมิตร",
    note: "เพิ่มไข่ 2 ฟอง",
    price: 224,
    quantity: 2,
    image: "https://placehold.co/120x120.png",
    orderedAt: "19:18",
    status: "preparing",
  },
  {
    id: "3",
    name: "น้ำเปล่าเย็น",
    note: "ขวดใหญ่ 1 ขวด",
    price: 35,
    quantity: 1,
    image: "https://placehold.co/120x120.png",
    orderedAt: "19:18",
    status: "queued",
  },
];

const paymentLabels: Record<PaymentMethod, string> = {
  promptpay: "พร้อมเพย์",
  counter: "จ่ายที่เคาน์เตอร์",
};

const sectionMeta = {
  queued: {
    label: "เพิ่งส่งเข้าครัว",
    Icon: IconClockHour4,
    color: "text-[#B97A12]",
  },
  preparing: {
    label: "กำลังทำ",
    Icon: IconChefHat,
    color: "text-[#C53A2B]",
  },
  served: {
    label: "เสิร์ฟแล้ว",
    Icon: IconCircleCheck,
    color: "text-[#5C8E25]",
  },
} as const;

const ORDER_SECTIONS: Array<keyof typeof sectionMeta> = [
  "queued",
  "preparing",
  "served",
];

export default function OrdersPage() {
  const [payment, setPayment] = useState<PaymentMethod>("promptpay");
  const [isBillingSheetOpen, setIsBillingSheetOpen] = useState(false);
  const [billingRequested, setBillingRequested] = useState(false);

  const subtotal = orderedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;
  const itemCount = orderedItems.reduce((sum, item) => sum + item.quantity, 0);

  const openBillingSheet = () => setIsBillingSheetOpen(true);
  const closeBillingSheet = () => setIsBillingSheetOpen(false);

  const requestBilling = () => {
    setBillingRequested(true);
    setIsBillingSheetOpen(false);
  };

  const cancelBillingRequest = () => setBillingRequested(false);

  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#FFF9F5]">
        <div className="sticky top-0 z-30 border-b border-[#F0E2D4]/60 bg-[#FFF9F5]/85 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="ย้อนกลับ"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#2C1713] shadow-[0_4px_12px_rgba(44,23,19,0.06)] ring-1 ring-black/5 transition-transform active:scale-95"
            >
              <IconArrowLeft size={18} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#B89A82]">
                โต๊ะ A12
              </p>
              <h1 className="text-[17px] font-semibold text-[#2C1713]">
                รายการที่สั่งแล้ว
              </h1>
            </div>
            <div className="flex h-10 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-medium text-[#2C1713] shadow-[0_4px_12px_rgba(44,23,19,0.06)] ring-1 ring-black/5">
              {itemCount} ชิ้น
            </div>
          </div>
        </div>

        {/* Receipt paper */}
        <section className="px-5 pt-5">
          <div className="[filter:drop-shadow(0_10px_24px_rgba(44,23,19,0.07))]">
            <div className="bg-[#FCF7EF] px-6 pt-7 pb-5 rounded-t-[4px]">
              {/* Restaurant logo */}
              <div className="flex flex-col items-center">
                <Image
                  src="/logo.png"
                  alt="แซ่บกลางซอย"
                  width={96}
                  height={96}
                  priority
                  className="h-24 w-24 object-contain"
                />
              </div>

              <div className="mt-5 flex items-center gap-2.5">
                <div className="h-px flex-1 border-t border-dashed border-[#D9C4B0]" />
                <span className="text-[8px] text-[#C8A48B]">◆ ◆ ◆</span>
                <div className="h-px flex-1 border-t border-dashed border-[#D9C4B0]" />
              </div>

              {/* Order meta */}
              <dl className="mt-4 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <dt className="text-[#9D7F6A]">โต๊ะ</dt>
                  <dd className="font-medium text-[#2C1713]">A12</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#9D7F6A]">เปิดโต๊ะ</dt>
                  <dd className="font-medium text-[#2C1713] tabular-nums">
                    28/05/2026 · 19:12
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#9D7F6A]">พนักงาน</dt>
                  <dd className="font-medium text-[#2C1713]">มะลิ · ML</dd>
                </div>
              </dl>

              {/* Items header */}
              <div className="mt-4 border-t border-dashed border-[#D9C4B0] pt-3">
                <div className="flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.2em] text-[#B89A82]">
                  <span>รายการ · Item</span>
                  <span>ยอด · Amount</span>
                </div>
              </div>

              {/* Items grouped by status */}
              <div className="mt-3 space-y-5">
                {ORDER_SECTIONS.map((key) => {
                  const items = orderedItems.filter(
                    (item) => item.status === key,
                  );
                  if (items.length === 0) return null;

                  const meta = sectionMeta[key];
                  const Icon = meta.Icon;

                  return (
                    <div key={key}>
                      <div className="flex items-center gap-1.5">
                        <Icon size={11} className={meta.color} />
                        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#9D7F6A]">
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-[#C8A48B]">
                          · {items.length} รายการ
                        </span>
                      </div>

                      <ul className="mt-2 space-y-3">
                        {items.map((item) => (
                          <li key={item.id}>
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-[13px] font-medium leading-snug text-[#2C1713]">
                                {item.name}
                              </p>
                              <span className="shrink-0 text-[13px] font-semibold text-[#2C1713] tabular-nums">
                                ฿{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                            {item.note && (
                              <p className="mt-0.5 text-[11px] leading-snug text-[#9D7F6A]">
                                {item.note}
                              </p>
                            )}
                            <p className="mt-1 text-[10px] text-[#9D7F6A] tabular-nums">
                              ฿{item.price.toLocaleString()} × {item.quantity}{" "}
                              <span className="text-[#C8A48B]">
                                · ส่งครัว {item.orderedAt}
                              </span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Bill breakdown */}
              <div className="mt-5 border-t border-dashed border-[#D9C4B0] pt-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#9D7F6A]">ยอดอาหาร</span>
                  <span className="font-medium text-[#5A4338] tabular-nums">
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-[#9D7F6A]">VAT 7%</span>
                  <span className="font-medium text-[#5A4338] tabular-nums">
                    ฿{vat.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-3 border-t-2 border-double border-[#D9C4B0] pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-[#2C1713]">
                    รวมต้องชำระ
                  </span>
                  <span className="text-[24px] font-bold leading-none text-[#E12717] tabular-nums">
                    ฿{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center gap-2.5">
                <div className="h-px flex-1 border-t border-dashed border-[#D9C4B0]" />
                <span className="text-[8px] tracking-[0.3em] text-[#C8A48B]">
                  THANK YOU
                </span>
                <div className="h-px flex-1 border-t border-dashed border-[#D9C4B0]" />
              </div>
              <p className="mt-2 text-center text-[10px] text-[#9D7F6A]">
                สแกน QR เพื่อรีวิวร้านได้นะคะ
              </p>
            </div>

            {/* Jagged tear edge */}
            <div
              className="block h-3 w-full"
              style={{
                backgroundImage: TEAR_BG,
                backgroundSize: "14px 12px",
                backgroundRepeat: "repeat-x",
              }}
              aria-hidden="true"
            />
          </div>
        </section>

        {billingRequested && (
          <section className="mx-5 mt-4 overflow-hidden rounded-[18px] bg-gradient-to-br from-[#FFF6E1] to-[#FFEFCC] p-4 ring-1 ring-[#F5D89A]/60">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#B97A12] ring-1 ring-[#F5D89A]/80">
                <IconReceipt2 size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#7A5300]">
                  ส่งคำขอปิดบิลแล้ว
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#8B6B35]">
                  พนักงานจะเข้ามาที่โต๊ะ A12 เพื่อรับชำระด้วย
                  <span className="font-medium"> {paymentLabels[payment]} </span>
                  หากต้องการสั่งเพิ่ม สามารถยกเลิกคำขอได้ก่อน
                </p>
                <button
                  type="button"
                  onClick={cancelBillingRequest}
                  className="mt-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#7A5300] ring-1 ring-[#F1D091] transition-transform active:scale-[0.98]"
                >
                  ยกเลิกคำขอปิดบิล
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="h-36" />

        <div className="fixed inset-x-0 bottom-0 z-40">
          <div className="mx-auto max-w-sm">
            <div className="pointer-events-none h-6 bg-gradient-to-t from-[#FFF9F5] via-[#FFF9F5]/85 to-transparent" />
            <div className="bg-[#FFF9F5] px-5 pb-5 pt-2">
              {billingRequested ? (
                <button
                  type="button"
                  disabled
                  className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-br from-[#E5C481] to-[#C9A45D] py-4 text-[14px] font-semibold text-white shadow-[0_12px_24px_rgba(201,164,93,0.32)]"
                >
                  <IconClockHour4 size={17} />
                  รอพนักงานมาปิดบิล
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-[20px] border border-[#E8D6C6] bg-white py-4 text-[13px] font-medium text-[#2C1713] shadow-[0_4px_12px_rgba(44,23,19,0.04)] transition-transform active:scale-[0.98]"
                  >
                    <IconPlus size={16} />
                    สั่งเพิ่ม
                  </Link>
                  <button
                    type="button"
                    onClick={openBillingSheet}
                    className="relative flex flex-[1.4] items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_rgba(225,39,23,0.32),0_2px_4px_rgba(225,39,23,0.18)] transition-transform active:scale-[0.98]"
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/16 to-transparent" />
                    <span className="relative">
                      ปิดบิล · ฿{total.toLocaleString()}
                    </span>
                    <IconArrowRight size={18} className="relative" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isBillingSheetOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="ปิดหน้าต่างปิดบิล"
            onClick={closeBillingSheet}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="absolute inset-x-0 bottom-0 mx-auto max-w-sm overflow-hidden rounded-t-[32px] bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.28)]"
          >
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-[#E8D6C6]" />
            </div>

            <div className="px-5 pb-5 pt-3">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[17px] font-semibold text-[#2C1713]">
                    ยืนยันปิดบิล
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-[#9D7F6A]">
                    หลังยืนยัน ระบบจะเรียกพนักงานมาที่โต๊ะเพื่อรับชำระเงิน
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeBillingSheet}
                  aria-label="ปิด"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7EFE7] text-[#2C1713] transition-transform active:scale-95"
                >
                  <IconX size={18} />
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#FFF5F0] to-[#FFE9DE] p-4 ring-1 ring-[#F2D1BD]/50">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FFB293]/20 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between text-[12px] text-[#7C5B47]">
                    <span>ยอดอาหาร</span>
                    <span className="font-medium tabular-nums">
                      ฿{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#7C5B47]">
                    <span>VAT 7%</span>
                    <span className="font-medium tabular-nums">
                      ฿{vat.toLocaleString()}
                    </span>
                  </div>
                  <div className="my-3 h-px bg-[#EFD9CC]" />
                  <div className="flex items-end justify-between">
                    <span className="text-[13px] font-medium text-[#2C1713]">
                      รวมต้องชำระ
                    </span>
                    <span className="text-[22px] font-semibold leading-none text-[#E12717] tabular-nums">
                      ฿{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 px-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#A98671]">
                  เลือกวิธีชำระ
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <PaymentOption
                    selected={payment === "promptpay"}
                    onClick={() => setPayment("promptpay")}
                    Icon={IconQrcode}
                    title="พร้อมเพย์"
                    description="สแกนชำระจากมือถือได้ทันที"
                  />
                  <PaymentOption
                    selected={payment === "counter"}
                    onClick={() => setPayment("counter")}
                    Icon={IconCash}
                    title="จ่ายที่เคาน์เตอร์"
                    description="เรียกพนักงานมารับชำระที่โต๊ะ"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={closeBillingSheet}
                  className="flex-1 rounded-[18px] border border-[#E8D6C6] bg-white py-3.5 text-[13px] font-medium text-[#2C1713] transition-transform active:scale-[0.98]"
                >
                  ยังไม่ปิด
                </button>
                <button
                  type="button"
                  onClick={requestBilling}
                  className="relative flex flex-[1.5] items-center justify-center gap-2 overflow-hidden rounded-[18px] bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] py-3.5 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(225,39,23,0.28)] transition-transform active:scale-[0.98]"
                >
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/16 to-transparent" />
                  <span className="relative">ยืนยันปิดบิล</span>
                  <IconArrowRight size={16} className="relative" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface PaymentOptionProps {
  selected: boolean;
  onClick: () => void;
  Icon: typeof IconQrcode;
  title: string;
  description: string;
}

function PaymentOption({
  selected,
  onClick,
  Icon,
  title,
  description,
}: PaymentOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-[20px] border bg-white p-4 text-left transition-all",
        selected
          ? "border-[#E12717] bg-gradient-to-br from-white to-[#FFF5F0] shadow-[0_8px_20px_rgba(225,39,23,0.12)]"
          : "border-[#E8D6C6]",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
          selected ? "bg-[#FFE5DE] text-[#E12717]" : "bg-[#F7EFE7] text-[#9D7F6A]",
        )}
      >
        <Icon size={18} />
      </div>
      <p className="mt-3 text-[13px] font-semibold text-[#2C1713]">{title}</p>
      <p className="mt-0.5 text-[10px] leading-4 text-[#9D7F6A]">{description}</p>
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#E12717] text-white shadow-[0_4px_10px_rgba(225,39,23,0.32)]">
          <IconCheck size={12} />
        </span>
      )}
    </button>
  );
}
