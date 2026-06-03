"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { IconPlus } from "@tabler/icons-react";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: {
    label: string;
    variant: "spicy" | "hit" | "promo";
  };
}

interface MenuItemCardProps {
  item: MenuItem;
  onAdd?: (id: string) => void;
}

const tagStyles: Record<string, string> = {
  spicy: "bg-[#FCEBEB] text-[#A32D2D]",
  hit: "bg-[#EAF3DE] text-[#3B6D11]",
  promo: "bg-[#FAEEDA] text-[#854F0B]",
};

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <div className="flex gap-[13px] rounded-[22px] border border-border p-[13px]">
      {/* รูปอาหาร */}
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[18px] bg-muted">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="72px"
          className="object-cover"
        />
      </div>

      {/* รายละเอียด */}
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-1.5">
          <span className="text-sm font-medium">{item.name}</span>
          {item.tag && (
            <Badge
              className={`shrink-0 rounded-xl px-[9px] py-[3px] text-[10px] font-normal ${tagStyles[item.tag.variant]}`}
            >
              {item.tag.label}
            </Badge>
          )}
        </div>

        <p className="mt-1 mb-[9px] line-clamp-1 text-[11px] leading-snug text-muted-foreground">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium text-red-500">
            ฿{item.price.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={() => onAdd?.(item.id)}
            aria-label={`เพิ่ม ${item.name}`}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-red-500 text-white transition-transform active:scale-95"
          >
            <IconPlus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}