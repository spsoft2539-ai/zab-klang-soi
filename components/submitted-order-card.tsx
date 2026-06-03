import Image from "next/image";
import {
  IconChefHat,
  IconCircleCheck,
  IconClockHour4,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type SubmittedOrderStatus = "queued" | "preparing" | "served";

export interface SubmittedOrderItem {
  id: string;
  name: string;
  note: string;
  price: number;
  quantity: number;
  image: string;
  orderedAt: string;
  status: SubmittedOrderStatus;
}

interface SubmittedOrderCardProps {
  item: SubmittedOrderItem;
}

const statusStyles: Record<
  SubmittedOrderStatus,
  {
    label: string;
    pill: string;
    Icon: typeof IconClockHour4;
    iconColor: string;
  }
> = {
  queued: {
    label: "รอรับออเดอร์",
    pill: "bg-[#FFF1D6] text-[#8A5300] ring-1 ring-[#F5D89A]/60",
    Icon: IconClockHour4,
    iconColor: "text-[#B97A12]",
  },
  preparing: {
    label: "กำลังทำ",
    pill: "bg-[#FCE3DF] text-[#A32D1F] ring-1 ring-[#F2BBB3]/60",
    Icon: IconChefHat,
    iconColor: "text-[#C53A2B]",
  },
  served: {
    label: "เสิร์ฟแล้ว",
    pill: "bg-[#E0F0CB] text-[#3B6D11] ring-1 ring-[#BCD89F]/60",
    Icon: IconCircleCheck,
    iconColor: "text-[#5C8E25]",
  },
};

export function SubmittedOrderCard({ item }: SubmittedOrderCardProps) {
  const { label, pill, Icon, iconColor } = statusStyles[item.status];

  return (
    <article className="rounded-[22px] bg-white p-4 ring-1 ring-black/[0.04] shadow-[0_6px_18px_rgba(44,23,19,0.04)]">
      <div className="flex gap-3.5">
        <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-2xl bg-[#F4ECE3] ring-1 ring-black/[0.04]">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="64px"
            unoptimized
            className="object-cover"
          />
          <span className="absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2C1713] px-1 text-[10px] font-semibold text-white">
            ×{item.quantity}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-[#2C1713]">
                {item.name}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-[#A98671]">
                {item.note}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium",
                pill,
              )}
            >
              <Icon size={11} className={iconColor} />
              {label}
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-[#F0E2D4] pt-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#A98671]">
              <IconClockHour4 size={12} className="text-[#C8A48B]" />
              <span>ส่งครัว {item.orderedAt}</span>
            </div>
            <span className="text-[14px] font-semibold text-[#2C1713]">
              ฿{(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
