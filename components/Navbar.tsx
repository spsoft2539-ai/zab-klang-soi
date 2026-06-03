"use client";
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { IconMapPin, IconClock, IconStar, IconSearch } from "@tabler/icons-react"

interface MenuHeaderProps {
  restaurantName: string
  tableNumber: string
  closingTime: string
  rating: number
  cuisine: string
  onSearchChange?: (value: string) => void
}

export function MenuHeader({
  restaurantName,
  tableNumber,
  closingTime,
  rating,
  cuisine,
  onSearchChange,
}: MenuHeaderProps) {
  return (
    <header>
      {/* Hero ร้านอาหารพร้อมภาพพื้นหลัง */}
      <div className="relative isolate overflow-hidden px-5 pt-5 pb-8 text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Image
            src="/banner.jpg"
            alt=""
            fill
            priority
            className="scale-105 object-cover object-center blur-[2px] brightness-[0.52] saturate-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/65" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,95,64,0.4),transparent_42%),linear-gradient(135deg,rgba(117,19,12,0.12),rgba(224,64,43,0.26))]" />
        </div>

        <div className="relative z-10 min-h-[168px]">
          {/* แถวบน: badge โต๊ะ + เวลาเปิด */}
          <div className="mb-[18px] flex items-center justify-between">
            <Badge className="gap-1 rounded-2xl border border-white/15 bg-white/14 px-[11px] py-[5px] text-xs font-normal text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              <IconMapPin size={14} />
              โต๊ะ {tableNumber}
            </Badge>
            <Badge className="gap-1 rounded-2xl border border-white/15 bg-white/14 px-[11px] py-[5px] text-xs font-normal text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              <IconClock size={14} />
              เปิดถึง {closingTime}
            </Badge>
          </div>

          {/* ชื่อร้าน + เรตติ้ง */}
          <h1 className="mb-1 pt-9 text-[22px] font-medium text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)]">
            {restaurantName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-white/90">
            <span className="inline-flex items-center gap-1">
              <IconStar size={14} className="fill-current" />
              {rating.toFixed(1)}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/60" />
            <span>{cuisine}</span>
          </div>
        </div>
      </div>

      {/* ช่องค้นหา — ยกขึ้นมาซ้อนเหนือขอบ hero ให้ชัดขึ้น */}
      <div className="relative z-20 -mt-7 px-5">
        <div className="flex items-center gap-[10px] rounded-[18px] border border-white/70 bg-background/96 px-4 py-3 shadow-[0_14px_28px_rgba(35,23,18,0.12)] backdrop-blur-sm">
          <IconSearch size={18} className="text-muted-foreground" />
          <Input
            type="text"
            placeholder="ค้นหาเมนูโปรด..."
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-auto border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0"
          />
        </div>
      </div>
    </header>
  )
}
