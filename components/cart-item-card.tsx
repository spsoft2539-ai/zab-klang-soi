"use client";

import Image from "next/image";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

export interface CartItem {
  id: string;
  name: string;
  options: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItemCardProps {
  item: CartItem;
  onIncrease?: (id: string) => void;
  onDecrease?: (id: string) => void;
}

export function CartItemCard({
  item,
  onIncrease,
  onDecrease,
}: CartItemCardProps) {
  return (
    <div className="flex gap-3.5 p-4">
      <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl bg-[#F4ECE3] ring-1 ring-black/[0.04]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="68px"
          unoptimized
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-[#2C1713]">
              {item.name}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-[#A98671]">
              {item.options}
            </p>
          </div>
          <span className="shrink-0 text-[14px] font-semibold text-[#2C1713]">
            ฿{(item.price * item.quantity).toLocaleString()}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-[#A98671]">
            ฿{item.price.toLocaleString()} / รายการ
          </span>

          <div className="flex items-center gap-1 rounded-full bg-[#F7EFE7] p-1">
            <button
              type="button"
              onClick={() => onDecrease?.(item.id)}
              aria-label={item.quantity === 1 ? "ลบรายการ" : "ลดจำนวน"}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#2C1713] shadow-[0_1px_2px_rgba(44,23,19,0.08)] transition-transform active:scale-95"
            >
              {item.quantity === 1 ? (
                <IconTrash size={13} />
              ) : (
                <IconMinus size={14} />
              )}
            </button>
            <span className="min-w-[20px] text-center text-[13px] font-semibold text-[#2C1713] tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrease?.(item.id)}
              aria-label="เพิ่มจำนวน"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5546] to-[#E12717] text-white shadow-[0_3px_8px_rgba(225,39,23,0.32)] transition-transform active:scale-95"
            >
              <IconPlus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
