"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconChevronRight,
  IconPlus,
  IconSearch,
  IconShoppingBag,
} from "@tabler/icons-react";
import { MenuHeader } from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { VAT_RATE, formatCurrency } from "@/lib/bill";
import { apiFetchMenu, apiFetchSettings, type StoreMenuItem, type StoreSettings } from "@/lib/api";

/* ─── Cart helpers (localStorage) ──────────────────────────── */

export const CART_KEY = "zab_cart";

export interface CartEntry {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface LocalCart {
  tableId: string;
  items: CartEntry[];
}

export function readCart(tableId: string): CartEntry[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Partial<LocalCart>;
    if (data.tableId !== tableId) return [];
    return data.items ?? [];
  } catch {
    return [];
  }
}

export function saveCart(tableId: string, items: CartEntry[]) {
  localStorage.setItem(CART_KEY, JSON.stringify({ tableId, items }));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function MenuPage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table: tableId } = use(params);

  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ทั้งหมด");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [menuItems, setMenuItems] = useState<StoreMenuItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    Promise.all([apiFetchMenu(), apiFetchSettings()])
      .then(([items, s]) => {
        setCart(readCart(tableId));
        setMenuItems(items);
        setSettings(s);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [tableId]);

  useEffect(() => {
    if (!ready) return;
    saveCart(tableId, cart);
  }, [cart, ready, tableId]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category)));
    return cats;
  }, [menuItems]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set("ทั้งหมด", menuItems.length);
    menuItems.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    });
    return counts;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchCat =
        activeCategory === "ทั้งหมด" || item.category === activeCategory;
      const matchQ =
        !q ||
        `${item.name} ${item.description} ${item.category}`
          .toLowerCase()
          .includes(q);
      return matchCat && matchQ;
    });
  }, [activeCategory, query, menuItems]);

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + Math.round(subtotal * VAT_RATE);

  const addItem = (item: StoreMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuId === item.id
            ? { ...c, quantity: Math.min(99, c.quantity + 1) }
            : c,
        );
      }
      return [
        ...prev,
        {
          menuId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
          category: item.category,
        },
      ];
    });
  };

  const closingTime = settings
    ? `${settings.closeTime} น.`
    : "22.00 น.";
  const cuisine = settings?.cuisine ?? "อีสาน · ซีฟู้ด · หมูกระทะ";
  const restaurantName = settings?.restaurantName ?? "แซ่บกลางซอย";

  return (
    <>
      <main className="mx-auto min-h-screen max-w-sm bg-[#FFF9F5] pb-28">
        <MenuHeader
          restaurantName={restaurantName}
          tableNumber={tableId}
          closingTime={closingTime}
          rating={5}
          cuisine={cuisine}
          onSearchChange={setQuery}
        />

        {/* Category nav */}
        <nav className="flex gap-2 overflow-x-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["ทั้งหมด", ...categories].map((category) => {
            const isActive = activeCategory === category;
            const count = categoryCounts.get(category) ?? 0;
            return (
              <button
                key={category}
                type="button"
                disabled={count === 0}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-medium transition-colors disabled:opacity-40",
                  isActive
                    ? "bg-[#E12717] text-white shadow-[0_8px_18px_rgba(225,39,23,0.22)]"
                    : "bg-white text-[#7C5B47] ring-1 ring-[#F0E0D4]",
                )}
              >
                {category}
                <span
                  className={cn(
                    "min-w-[18px] rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#F7EFE7] text-[#A98671]",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Menu list */}
        <section className="space-y-3 px-5">
          {!ready ? (
            <div className="py-10 text-center text-[13px] text-[#9D7F6A]">
              กำลังโหลดเมนู...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#E8D6C6] bg-white px-5 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#E12717]">
                <IconSearch size={22} />
              </div>
              <p className="mt-3 text-[14px] font-semibold text-[#2C1713]">
                ไม่เจอเมนูที่ค้นหา
              </p>
              <p className="mt-1 text-[11px] text-[#9D7F6A]">
                ลองเปลี่ยนคำค้นหรือหมวดอาหาร
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const entry = cart.find((c) => c.menuId === item.id);
              return (
                <MenuCard
                  key={item.id}
                  item={item}
                  quantity={entry?.quantity ?? 0}
                  disabled={!ready}
                  onAdd={() => addItem(item)}
                />
              );
            })
          )}
        </section>
      </main>

      <FloatingCartBar
        itemCount={itemCount}
        total={total}
        ready={ready}
      />
    </>
  );
}

/* ─── Menu Card ─────────────────────────────────────────────── */

function MenuCard({
  item,
  quantity,
  disabled,
  onAdd,
}: {
  item: StoreMenuItem;
  quantity: number;
  disabled: boolean;
  onAdd: () => void;
}) {
  return (
    <article className="flex gap-3 rounded-[22px] border border-[#F0E0D4] bg-white p-3 shadow-[0_8px_20px_rgba(44,23,19,0.04)]">
      <div className="relative h-[82px] w-[82px] shrink-0 overflow-hidden rounded-[18px] bg-[#F7EFE7]">
        <Image
          src={item.image || "https://placehold.co/160x160/fee2e2/7f1d1d.png"}
          alt={item.name}
          fill
          sizes="82px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="line-clamp-1 text-[14px] font-semibold text-[#2C1713]">
              {item.name}
            </h2>
            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#9D7F6A]">
              {item.description}
            </p>
          </div>
          {item.tag && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-[10px] font-medium",
                item.tag === "เผ็ด" && "bg-[#FCEBEB] text-[#A32D2D]",
                item.tag === "ฮิต" && "bg-[#EAF3DE] text-[#3B6D11]",
                item.tag === "โปร" && "bg-[#FAEEDA] text-[#854F0B]",
              )}
            >
              {item.tag}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[15px] font-semibold text-[#E12717] tabular-nums">
            {formatCurrency(item.price)}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={onAdd}
            aria-label={`เพิ่ม ${item.name}`}
            className={cn(
              "relative flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-white transition-transform active:scale-95 disabled:opacity-55",
              "bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] shadow-[0_8px_16px_rgba(225,39,23,0.28)]",
            )}
          >
            {quantity > 0 ? (
              <span className="px-1 text-[12px] font-semibold tabular-nums">
                x{quantity}
              </span>
            ) : (
              <IconPlus size={18} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Floating Cart Bar ─────────────────────────────────────── */

function FloatingCartBar({
  itemCount,
  total,
  ready,
}: {
  itemCount: number;
  total: number;
  ready: boolean;
}) {
  if (!ready) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-sm">
        <div className="pointer-events-none h-5 bg-gradient-to-t from-[#FFF9F5] to-transparent" />
        <div className="bg-[#FFF9F5]/98 px-5 pb-5 backdrop-blur-md">
          {itemCount === 0 ? (
            <div className="flex items-center gap-3 rounded-[20px] border border-dashed border-[#E8D6C6] bg-white px-4 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EC] text-[#E12717]">
                <IconShoppingBag size={18} />
              </div>
              <p className="text-[12px] text-[#9D7F6A]">
                กดปุ่ม + ที่เมนูเพื่อเริ่มสั่งอาหาร
              </p>
            </div>
          ) : (
            <Link
              href="/cart"
              className="flex items-center gap-3 rounded-[20px] bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] px-4 py-3.5 text-white shadow-[0_14px_28px_rgba(225,39,23,0.3)] active:scale-[0.98]"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <IconShoppingBag size={18} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#E12717] tabular-nums">
                  {itemCount}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">ดูรายการสั่งอาหาร</p>
                <p className="mt-0.5 text-[11px] font-medium text-white/70 tabular-nums">
                  {itemCount} รายการ · {formatCurrency(total)}
                </p>
              </div>
              <IconChevronRight size={20} className="shrink-0 text-white/60" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
