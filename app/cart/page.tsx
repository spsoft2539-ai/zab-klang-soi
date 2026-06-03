"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { apiSubmitOrder } from "@/lib/api";
import {
  CART_KEY,
  clearCart,
  type CartEntry,
  type LocalCart,
} from "@/app/menu/[table]/page";

const TEAR_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 12'><polygon points='0,0 14,0 14,4 7,12 0,4' fill='%23FCF7EF'/></svg>")`;

export default function CartPage() {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const [ready, setReady] = useState(false);
  const [tableId, setTableId] = useState("");
  const [items, setItems] = useState<CartEntry[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Partial<LocalCart>;
        setTableId(data.tableId ?? "");
        setItems(data.items ?? []);
      }
    } catch {}
    setReady(true);
  }, []);

  const increase = (menuId: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.menuId === menuId
          ? { ...item, quantity: Math.min(99, item.quantity + 1) }
          : item,
      ),
    );

  const decrease = (menuId: string) =>
    setItems((prev) =>
      prev
        .map((item) =>
          item.menuId === menuId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const submitOrder = () => {
    if (!tableId || items.length === 0) return;
    startTransition(async () => {
      try {
        const order = await apiSubmitOrder(
          tableId,
          items.map((i) => ({
            menuId: i.menuId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        );
        clearCart();
        setOrderId(order.id);
        setSubmitted(true);
      } catch {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    });
  };

  /* ── Success screen ─────────────────────────────────────── */
  if (submitted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center bg-[#FFF9F5] px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] shadow-[0_16px_32px_rgba(225,39,23,0.28)] text-white">
          <IconCheck size={36} />
        </div>
        <h1 className="mt-5 text-[22px] font-bold text-[#2C1713]">
          ส่งออเดอร์แล้ว!
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-[#9D7F6A]">
          ออเดอร์โต๊ะ <span className="font-semibold text-[#2C1713]">{tableId}</span> ถูกส่งไปยังครัวแล้ว
        </p>
        <div className="mt-3 rounded-2xl bg-white px-5 py-3 ring-1 ring-[#F0E0D4]">
          <p className="text-[10px] text-[#9D7F6A] uppercase tracking-widest">เลขออเดอร์</p>
          <p className="mt-0.5 font-mono text-[13px] font-semibold text-[#2C1713]">
            {orderId}
          </p>
        </div>
        <p className="mt-5 text-[12px] text-[#9D7F6A]">
          รอครูน้อย ๆ อาหารกำลังถูกปรุง 🍳
        </p>
        <Link
          href={`/menu/${tableId}`}
          className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-[#2C1713] px-6 py-3 text-[13px] font-medium text-white shadow-[0_12px_28px_rgba(44,23,19,0.18)]"
        >
          <IconSparkles size={16} />
          สั่งเพิ่ม
        </Link>
      </main>
    );
  }

  if (!ready) return null;

  /* ── Empty cart ─────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center bg-[#FFF9F5] px-5 py-16 text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-gradient-to-br from-[#FFE1D2] to-transparent blur-2xl" />
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-[0_12px_30px_rgba(44,23,19,0.08)] ring-1 ring-black/5">
            <IconShoppingBag size={32} className="text-[#C8A48B]" />
          </div>
        </div>
        <p className="mt-5 text-[15px] font-medium text-[#2C1713]">
          ตะกร้ายังว่างอยู่
        </p>
        <p className="mt-1 max-w-[220px] text-[12px] leading-5 text-[#9D7F6A]">
          กลับไปเลือกเมนูเด็ดของร้าน
        </p>
        <Link
          href={tableId ? `/menu/${tableId}` : "/"}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#2C1713] px-5 py-3 text-[13px] font-medium text-white shadow-[0_12px_28px_rgba(44,23,19,0.18)] transition-transform active:scale-[0.98]"
        >
          <IconSparkles size={16} />
          กลับไปดูเมนู
        </Link>
      </main>
    );
  }

  /* ── Cart with items ────────────────────────────────────── */
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#FFF9F5]">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-[#F0E2D4]/60 bg-[#FFF9F5]/85 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href={tableId ? `/menu/${tableId}` : "/"}
            aria-label="ย้อนกลับ"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#2C1713] shadow-[0_4px_12px_rgba(44,23,19,0.06)] ring-1 ring-black/5 transition-transform active:scale-95"
          >
            <IconArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            {tableId && (
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#B89A82]">
                โต๊ะ {tableId}
              </p>
            )}
            <h1 className="text-[17px] font-semibold text-[#2C1713]">
              ตะกร้าของคุณ
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
          <div className="rounded-t-[4px] bg-[#FCF7EF] px-6 pb-5 pt-7">
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

            <dl className="mt-4 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <dt className="text-[#9D7F6A]">โต๊ะ</dt>
                <dd className="font-medium text-[#2C1713]">{tableId || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#9D7F6A]">วัน-เวลา</dt>
                <dd className="font-medium tabular-nums text-[#2C1713]">
                  {new Date().toLocaleString("th-TH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Asia/Bangkok",
                  })}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-dashed border-[#D9C4B0] pt-3">
              <div className="flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.2em] text-[#B89A82]">
                <span>รายการ · Item</span>
                <span>ยอด · Amount</span>
              </div>
            </div>

            <ul className="mt-4 space-y-5">
              {items.map((item) => (
                <li key={item.menuId}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] font-medium leading-snug text-[#2C1713]">
                      {item.name}
                    </p>
                    <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[#2C1713]">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] tabular-nums text-[#9D7F6A]">
                      ฿{item.price.toLocaleString()} × {item.quantity}
                    </span>
                    <div className="flex items-center gap-1 rounded-full bg-white px-1 py-1 ring-1 ring-[#E5D2BC]">
                      <button
                        type="button"
                        onClick={() => decrease(item.menuId)}
                        aria-label={item.quantity === 1 ? "ลบรายการ" : "ลดจำนวน"}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[#5A4338] transition-colors active:bg-[#FBF4ED]"
                      >
                        {item.quantity === 1 ? (
                          <IconTrash size={12} />
                        ) : (
                          <IconMinus size={12} />
                        )}
                      </button>
                      <span className="min-w-[16px] text-center text-[11px] font-semibold tabular-nums text-[#2C1713]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increase(item.menuId)}
                        aria-label="เพิ่มจำนวน"
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E12717] text-white shadow-[0_2px_5px_rgba(225,39,23,0.32)]"
                      >
                        <IconPlus size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href={tableId ? `/menu/${tableId}` : "/"}
              className="mt-5 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#C8A48B] bg-[#FCF7EF] py-2.5 text-[11px] font-medium text-[#7C5B47] transition-colors active:bg-white"
            >
              <IconPlus size={13} />
              เพิ่มเมนูอื่น
            </Link>

            <div className="mt-5 border-t border-dashed border-[#D9C4B0] pt-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#9D7F6A]">จำนวน</span>
                <span className="font-medium tabular-nums text-[#5A4338]">
                  {itemCount} ชิ้น
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[12px]">
                <span className="text-[#9D7F6A]">ยอดอาหาร</span>
                <span className="font-medium tabular-nums text-[#5A4338]">
                  ฿{subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-3 border-t-2 border-double border-[#D9C4B0] pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-[#2C1713]">
                  รวมรอบนี้
                </span>
                <span className="text-[24px] font-bold leading-none tabular-nums text-[#2C1713]">
                  ฿{subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              <div className="h-px flex-1 border-t border-dashed border-[#D9C4B0]" />
              <span className="text-[8px] tracking-[0.3em] text-[#C8A48B]">
                THANK YOU
              </span>
              <div className="h-px flex-1 border-t border-dashed border-[#D9C4B0]" />
            </div>
            <p className="mt-2 text-center text-[10px] text-[#9D7F6A]">
              ขอบคุณที่อุดหนุนค่ะ
            </p>
          </div>

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

      <div className="h-36" />

      {/* Bottom actions */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-sm">
          <div className="pointer-events-none h-6 bg-gradient-to-t from-[#FFF9F5] via-[#FFF9F5]/85 to-transparent" />
          <div className="bg-[#FFF9F5] px-5 pb-5 pt-2">
            <button
              type="button"
              onClick={submitOrder}
              disabled={isSubmitting || items.length === 0}
              className={cn(
                "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[20px] px-4 py-4 text-[14px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-70",
                "bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] shadow-[0_16px_32px_rgba(225,39,23,0.32),0_2px_4px_rgba(225,39,23,0.18)]",
              )}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/16 to-transparent" />
              <span className="relative">
                {isSubmitting
                  ? "กำลังส่งออเดอร์..."
                  : `ยืนยันสั่ง · ฿${subtotal.toLocaleString()}`}
              </span>
              {!isSubmitting && <IconArrowRight size={18} className="relative" />}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
