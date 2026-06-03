"use client";

import Link from "next/link";
import { IconShoppingBag, IconArrowRight } from "@tabler/icons-react";

interface CartBottomBarProps {
  itemCount: number;
  total: number;
  href?: string;
}

export function CartBottomBar({
  itemCount,
  total,
  href = "/cart",
}: CartBottomBarProps) {
  // ไม่มีของในตะกร้า — ไม่ต้องโชว์แถบ
  if (itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-sm p-4">
      <Link
        href={href}
        className="flex items-center justify-between rounded-[22px] bg-red-500 px-[18px] py-[14px] shadow-lg transition-transform active:scale-[0.99]"
      >
        <div className="flex items-center gap-[10px]">
          <span className="relative">
            <IconShoppingBag size={24} className="text-white" />
            <span className="absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-medium text-[#0F6E56]">
              {itemCount}
            </span>
          </span>
          <span className="text-xs text-[#E1F5EE]">{itemCount} รายการ</span>
        </div>

        <span className="flex items-center gap-1.5 text-sm font-medium text-white">
          ดูตะกร้า · ฿{total.toLocaleString()}
          <IconArrowRight size={16} />
        </span>
      </Link>
    </div>
  );
}