"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconArrowUpRight,
  IconChefHat,
  IconPhoto,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { apiFetchMenu, type StoreMenuItem } from "@/lib/api";

export default function MenuPage() {
  const [items, setItems] = useState<StoreMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  useEffect(() => {
    apiFetchMenu()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["ทั้งหมด", ...new Set(items.map((i) => i.category))],
    [items],
  );

  const filtered = activeCategory === "ทั้งหมด"
    ? items
    : items.filter((i) => i.category === activeCategory);

  return (
    <div className="p-6 max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">จัดการเมนู</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {items.length} รายการ · {categories.length - 1} หมวดหมู่
          </p>
        </div>
        <Link href="/cashier/settings"
          className="flex items-center gap-1.5 rounded-xl bg-[#E12717] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(225,39,23,0.3)] hover:bg-[#C41E0E] transition-colors shrink-0">
          เพิ่ม / แก้ไขเมนู
          <IconArrowUpRight size={13} />
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {categories.map((c) => (
          <button key={c} type="button"
            onClick={() => setActiveCategory(c)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
              activeCategory === c
                ? "bg-[#E12717] text-white shadow-[0_4px_10px_rgba(225,39,23,0.25)]"
                : "bg-white text-muted-foreground ring-1 ring-border hover:bg-muted",
            )}>
            {c}
            {c !== "ทั้งหมด" && (
              <span className={cn("ml-1.5 tabular-nums",
                activeCategory === c ? "text-white/70" : "text-muted-foreground/60")}>
                {items.filter((i) => i.category === c).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-[13px] text-muted-foreground">กำลังโหลด...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-10 text-center">
          <IconChefHat size={28} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">ไม่มีเมนู</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id}
              className="flex gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-border">
              {/* Image */}
              <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-xl bg-muted">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <IconPhoto size={18} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <p className="line-clamp-1 text-[13px] font-semibold text-foreground">{item.name}</p>
                  {item.tag && (
                    <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                      item.tag === "เผ็ด" && "bg-red-50 text-red-600",
                      item.tag === "ฮิต" && "bg-green-50 text-green-700",
                      item.tag === "โปร" && "bg-amber-50 text-amber-700",
                    )}>{item.tag}</span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{item.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.category}
                  </span>
                  <span className="text-[14px] font-bold text-[#E12717] tabular-nums">
                    ฿{item.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
