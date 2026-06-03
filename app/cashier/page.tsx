"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingBank,
  IconCash,
  IconCheck,
  IconChefHat,
  IconChevronRight,
  IconClockHour4,
  IconDeviceDesktop,
  IconMinus,
  IconPlus,
  IconPrinter,
  IconQrcode,
  IconReceipt2,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import {
  apiFetchTables,
  apiFetchOrders,
  apiOpenTable,
  apiSetTableStatus,
  apiCloseTable,
  apiFetchMenu,
  type StoreOrder,
  type StoreMenuItem,
} from "@/lib/api";

const VAT_RATE = 0.07;

const TEAR_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 12'><polygon points='0,0 14,0 14,4 7,12 0,4' fill='%23FCF7EF'/></svg>")`;

type TableStatus = "available" | "active" | "preparing" | "billing";
type ItemStatus = "queued" | "preparing" | "served";

interface OrderItem {
  id: string;
  name: string;
  note?: string;
  price: number;
  quantity: number;
  status: ItemStatus;
}

interface CafeTable {
  id: string;
  zone: "A" | "B" | "C" | "D";
  seats: number;
  status: TableStatus;
  openedAt?: string;
  guests?: number;
  items: OrderItem[];
}

interface MenuOption {
  id: string;
  name: string;
  price: number;
  category: string;
}

const STATUS_META: Record<
  TableStatus,
  {
    label: string;
    short: string;
    dot: string;
    cardBg: string;
    cardRing: string;
    cardBorder: string;
    text: string;
    pill: string;
    icon: string;
    statBg: string;
    statIconBg: string;
    statIconColor: string;
  }
> = {
  available: {
    label: "ว่าง",
    short: "ว่าง",
    dot: "bg-emerald-400",
    cardBg: "bg-white",
    cardRing: "ring-emerald-200",
    cardBorder: "border-l-emerald-400",
    text: "text-emerald-500",
    pill: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    icon: "users",
    statBg: "bg-emerald-50",
    statIconBg: "bg-emerald-100",
    statIconColor: "text-emerald-500",
  },
  active: {
    label: "ใช้บริการ",
    short: "ทาน",
    dot: "bg-gray-400",
    cardBg: "bg-white",
    cardRing: "ring-gray-200",
    cardBorder: "border-l-gray-400",
    text: "text-gray-500",
    pill: "bg-gray-100 text-gray-600 ring-gray-200",
    icon: "users",
    statBg: "bg-gray-50",
    statIconBg: "bg-gray-100",
    statIconColor: "text-gray-500",
  },
  preparing: {
    label: "รออาหาร",
    short: "ทำ",
    dot: "bg-blue-500",
    cardBg: "bg-blue-50/50",
    cardRing: "ring-blue-200",
    cardBorder: "border-l-blue-500",
    text: "text-blue-600",
    pill: "bg-blue-500 text-white ring-blue-500",
    icon: "chef",
    statBg: "bg-gradient-to-br from-blue-50 to-blue-100",
    statIconBg: "bg-blue-100",
    statIconColor: "text-blue-600",
  },
  billing: {
    label: "รอชำระ",
    short: "บิล",
    dot: "bg-white",
    cardBg: "bg-red-700",
    cardRing: "ring-red-700",
    cardBorder: "border-l-red-800",
    text: "text-white",
    pill: "bg-white text-red-700 ring-white",
    icon: "receipt",
    statBg: "bg-gradient-to-br from-red-700 to-red-800",
    statIconBg: "bg-white/20",
    statIconColor: "text-white",
  },
};

const ZONES = ["A", "B", "C", "D"] as const;
type Zone = (typeof ZONES)[number];

const INITIAL_TABLES: CafeTable[] = [
  { id: "A1", zone: "A", seats: 2, status: "available", items: [] },
  {
    id: "A2",
    zone: "A",
    seats: 2,
    status: "active",
    openedAt: "18:45",
    guests: 2,
    items: [
      { id: "a2-1", name: "ต้มยำกุ้งน้ำข้น", note: "เผ็ดกลาง · ไม่ใส่ผักชี", price: 189, quantity: 1, status: "served" },
      { id: "a2-2", name: "ข้าวสวย", price: 20, quantity: 2, status: "served" },
    ],
  },
  {
    id: "A3",
    zone: "A",
    seats: 2,
    status: "preparing",
    openedAt: "19:12",
    guests: 2,
    items: [
      { id: "a3-1", name: "หมูกระทะรวมมิตร", note: "เพิ่มไข่ 2 ฟอง", price: 224, quantity: 2, status: "preparing" },
      { id: "a3-2", name: "เบียร์", price: 95, quantity: 2, status: "served" },
    ],
  },
  {
    id: "A4",
    zone: "A",
    seats: 4,
    status: "billing",
    openedAt: "18:20",
    guests: 4,
    items: [
      { id: "a4-1", name: "หม้อไฟทะเล", price: 459, quantity: 1, status: "served" },
      { id: "a4-2", name: "ข้าวผัดปู", price: 189, quantity: 1, status: "served" },
      { id: "a4-3", name: "น้ำเปล่าเย็น", note: "ขวดใหญ่ ×3", price: 25, quantity: 3, status: "served" },
    ],
  },
  { id: "B1", zone: "B", seats: 4, status: "available", items: [] },
  {
    id: "B2",
    zone: "B",
    seats: 4,
    status: "preparing",
    openedAt: "19:02",
    guests: 3,
    items: [
      { id: "b2-1", name: "ปลาทับทิมนึ่งมะนาว", price: 320, quantity: 1, status: "queued" },
      { id: "b2-2", name: "ผัดผักรวมมิตร", price: 120, quantity: 1, status: "preparing" },
    ],
  },
  { id: "B3", zone: "B", seats: 4, status: "available", items: [] },
  {
    id: "B4",
    zone: "B",
    seats: 4,
    status: "active",
    openedAt: "19:30",
    guests: 4,
    items: [
      { id: "b4-1", name: "ข้าวผัดกุ้ง", price: 160, quantity: 2, status: "served" },
    ],
  },
  {
    id: "C1",
    zone: "C",
    seats: 6,
    status: "active",
    openedAt: "18:50",
    guests: 5,
    items: [
      { id: "c1-1", name: "ชุดซีฟู้ดแซ่บ", price: 899, quantity: 1, status: "served" },
      { id: "c1-2", name: "ข้าวสวย", price: 20, quantity: 5, status: "served" },
    ],
  },
  { id: "C2", zone: "C", seats: 6, status: "available", items: [] },
  {
    id: "C3",
    zone: "C",
    seats: 6,
    status: "billing",
    openedAt: "18:00",
    guests: 6,
    items: [
      { id: "c3-1", name: "ปลาเผาเกลือ", price: 380, quantity: 1, status: "served" },
      { id: "c3-2", name: "กุ้งเผา", price: 420, quantity: 1, status: "served" },
      { id: "c3-3", name: "น้ำเปล่า", price: 25, quantity: 4, status: "served" },
    ],
  },
  { id: "C4", zone: "C", seats: 6, status: "available", items: [] },
  { id: "D1", zone: "D", seats: 2, status: "available", items: [] },
  { id: "D2", zone: "D", seats: 2, status: "available", items: [] },
  {
    id: "D3",
    zone: "D",
    seats: 4,
    status: "active",
    openedAt: "19:25",
    guests: 3,
    items: [
      { id: "d3-1", name: "ส้มตำไทย", price: 80, quantity: 1, status: "served" },
      { id: "d3-2", name: "ไก่ย่าง", price: 220, quantity: 1, status: "preparing" },
    ],
  },
  { id: "D4", zone: "D", seats: 4, status: "available", items: [] },
];

const MENU: MenuOption[] = [
  { id: "m1", name: "ต้มยำกุ้งน้ำข้น", price: 189, category: "ยอดฮิต" },
  { id: "m2", name: "หมูกระทะรวมมิตร", price: 259, category: "ยอดฮิต" },
  { id: "m3", name: "ชุดซีฟู้ดแซ่บ", price: 899, category: "ยอดฮิต" },
  { id: "m4", name: "ปลาทับทิมนึ่งมะนาว", price: 320, category: "ทะเล" },
  { id: "m5", name: "หม้อไฟทะเล", price: 459, category: "ทะเล" },
  { id: "m6", name: "ปลาเผาเกลือ", price: 380, category: "ทะเล" },
  { id: "m7", name: "กุ้งเผา", price: 420, category: "ทะเล" },
  { id: "m8", name: "ส้มตำไทย", price: 80, category: "ทานเล่น" },
  { id: "m9", name: "ผัดผักรวมมิตร", price: 120, category: "ทานเล่น" },
  { id: "m10", name: "ไก่ย่าง", price: 220, category: "เนื้อสัตว์" },
  { id: "m11", name: "ข้าวผัดปู", price: 189, category: "ข้าว/เส้น" },
  { id: "m12", name: "ข้าวผัดกุ้ง", price: 160, category: "ข้าว/เส้น" },
  { id: "m13", name: "ข้าวสวย", price: 20, category: "ข้าว/เส้น" },
  { id: "m14", name: "น้ำเปล่าเย็น", price: 25, category: "เครื่องดื่ม" },
  { id: "m15", name: "เบียร์", price: 95, category: "เครื่องดื่ม" },
  { id: "m16", name: "โซดา", price: 35, category: "เครื่องดื่ม" },
];

/* ─── Notification sound (Web Audio API) ───────────────────── */
function playOrderAlert() {
  try {
    const ctx = new AudioContext();
    const play = (freq: number, startSec: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + startSec);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startSec + dur);
      osc.start(ctx.currentTime + startSec);
      osc.stop(ctx.currentTime + startSec + dur + 0.05);
    };
    play(880, 0, 0.12);
    play(1100, 0.14, 0.12);
    play(1320, 0.28, 0.22);
  } catch {
    // Audio not available (e.g. no user gesture yet) — fail silently
  }
}

function bangkokTimeNow(): string {
  const bkk = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
  const d = new Date(bkk);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

function useThaiClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return { dateLabel: "—", timeLabel: "—" };
  }

  const thai = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const day = thai.getDate();
  const month = THAI_MONTHS[thai.getMonth()];
  const year = thai.getFullYear() + 543;
  const weekday = THAI_DAYS[thai.getDay()];
  const time = thai.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return {
    dateLabel: `${day} ${month} ${year} · ${weekday}`,
    timeLabel: time,
  };
}

function minutesBetween(opened: string | undefined): number {
  if (!opened) return 0;
  const [h, m] = opened.split(":").map(Number);
  const [nowH, nowM] = bangkokTimeNow().split(":").map(Number);
  return Math.max(0, nowH * 60 + nowM - (h * 60 + m));
}

function durationLabel(opened: string | undefined): string {
  const mins = minutesBetween(opened);
  if (mins < 60) return `${mins} นาที`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} ชม. ${m} นาที`;
}

export default function CashierPage() {
  const { dateLabel, timeLabel } = useThaiClock();
  const [tables, setTables] = useState<CafeTable[]>(INITIAL_TABLES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = useState<"all" | Zone>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TableStatus>("all");
  const [searchQ, setSearchQ] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [openTableSeats, setOpenTableSeats] = useState(2);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [printQueue, setPrintQueue] = useState<StoreOrder[]>([]);
  const lastPollRef = useRef(0);

  // Fetch initial table state + existing orders from server
  useEffect(() => {
    Promise.all([apiFetchTables(), apiFetchOrders(0)])
      .then(([apiTables, existingOrders]) => {
        const newTables = apiTables.map((api) => ({
          id: api.id,
          zone: api.zone as Zone,
          seats: api.seats,
          status: api.status as TableStatus,
          openedAt: api.openedAt,
          guests: api.guests,
          items: [] as OrderItem[],
        }));

        // Hydrate tables with existing customer orders
        for (const order of existingOrders) {
          const t = newTables.find((t) => t.id === order.tableId);
          if (!t) continue;
          const newItems: OrderItem[] = order.items.map((item) => ({
            id: `${order.id}-${item.menuId}`,
            name: item.name,
            note: item.note,
            price: item.price,
            quantity: item.quantity,
            status: "queued" as const,
          }));
          t.items.push(...newItems);
        }

        setTables(newTables);
        // Queue unprinted orders so cashier can still print kitchen tickets
        const unprinted = existingOrders.filter((o) => !o.printed);
        if (unprinted.length > 0) setPrintQueue(unprinted);
        lastPollRef.current = Date.now();
      })
      .catch(() => {});
  }, []);

  // Poll for new customer orders every 3 s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const newOrders = await apiFetchOrders(lastPollRef.current);
        if (newOrders.length === 0) return;
        lastPollRef.current = Date.now();

        setTables((prev) =>
          prev.map((t) => {
            const tableOrders = newOrders.filter((o) => o.tableId === t.id);
            if (tableOrders.length === 0) return t;
            const newItems: OrderItem[] = tableOrders.flatMap((order) =>
              order.items.map((item) => ({
                id: `${order.id}-${item.menuId}`,
                name: item.name,
                note: item.note,
                price: item.price,
                quantity: item.quantity,
                status: "queued" as const,
              })),
            );
            return {
              ...t,
              status: "preparing" as TableStatus,
              openedAt: t.openedAt ?? bangkokTimeNow(),
              guests: t.guests ?? 1,
              items: [...t.items, ...newItems],
            };
          }),
        );
        setPrintQueue((prev) => [...prev, ...newOrders]);
        playOrderAlert();
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const counts: Record<TableStatus, number> = {
      available: 0,
      active: 0,
      preparing: 0,
      billing: 0,
    };
    tables.forEach((t) => {
      counts[t.status]++;
    });
    return counts;
  }, [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      if (zoneFilter !== "all" && t.zone !== zoneFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (searchQ && !t.id.toLowerCase().includes(searchQ.toLowerCase()))
        return false;
      return true;
    });
  }, [tables, zoneFilter, statusFilter, searchQ]);

  const selectedTable = tables.find((t) => t.id === selectedId) ?? null;

  const subtotal = (selectedTable?.items ?? []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;
  const itemCount = (selectedTable?.items ?? []).reduce(
    (sum, i) => sum + i.quantity,
    0,
  );

  const openBill = () => {
    if (!selectedTable || selectedTable.status !== "available") return;
    apiOpenTable(selectedTable.id, openTableSeats).catch(() => {});
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? {
              ...t,
              status: "active",
              openedAt: bangkokTimeNow(),
              guests: openTableSeats,
              items: [],
            }
          : t,
      ),
    );
  };

  const addItem = (menu: MenuOption, qty = 1, note = "") => {
    if (!selectedTable) return;
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTable.id) return t;
        // Only merge if same name + same note + queued (no note = merge, with note = always new line)
        const existing = !note
          ? t.items.find((i) => i.name === menu.name && !i.note && i.status === "queued")
          : null;
        if (existing) {
          return {
            ...t,
            items: t.items.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: Math.min(99, i.quantity + qty) }
                : i,
            ),
          };
        }
        return {
          ...t,
          status: t.status === "billing" ? "preparing" : t.status,
          items: [
            ...t.items,
            {
              id: `${t.id}-${Date.now()}`,
              name: menu.name,
              price: menu.price,
              quantity: qty,
              note: note || undefined,
              status: "queued" as const,
            },
          ],
        };
      }),
    );
  };

  const updateGuests = (newCount: number) => {
    if (!selectedTable) return;
    const clamped = Math.min(Math.max(1, newCount), selectedTable.seats);
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id ? { ...t, guests: clamped } : t,
      ),
    );
  };

  const updateQty = (itemId: string, delta: number) => {
    if (!selectedTable) return;
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTable.id) return t;
        return {
          ...t,
          items: t.items
            .map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity + delta } : i,
            )
            .filter((i) => i.quantity > 0),
        };
      }),
    );
  };

  const removeItem = (itemId: string) => {
    if (!selectedTable) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id !== selectedTable.id
          ? t
          : { ...t, items: t.items.filter((i) => i.id !== itemId) },
      ),
    );
  };

  const requestBill = () => {
    if (!selectedTable) return;
    apiSetTableStatus(selectedTable.id, "billing").catch(() => {});
    setTables((prev) =>
      prev.map((t) =>
        t.id !== selectedTable.id ? t : { ...t, status: "billing" },
      ),
    );
    setIsPrintOpen(true);
  };

  const backToActive = () => {
    if (!selectedTable) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id !== selectedTable.id ? t : { ...t, status: "active" },
      ),
    );
  };

  const closeBillFinalize = (payment: { method: "cash" | "transfer"; cashReceived?: number }) => {
    if (!selectedTable) return;
    apiCloseTable(selectedTable.id, payment).catch(() => {});
    setTables((prev) =>
      prev.map((t) =>
        t.id !== selectedTable.id
          ? t
          : {
              id: t.id,
              zone: t.zone,
              seats: t.seats,
              status: "available",
              items: [],
            },
      ),
    );
    setIsCloseOpen(false);
  };

  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-white px-5">
        <Link
          href="/"
          aria-label="ออกจากแคชเชียร์"
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-foreground ring-1 ring-border transition-transform active:scale-95"
        >
          <IconArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl object-cover ring-1 ring-border"
          />
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Cashier · POS
            </p>
            <h1 className="text-[15px] font-semibold text-foreground">
              แซ่บกลางซอย
            </h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden rounded-2xl bg-red-50 px-4 py-2 text-right text-[11px] leading-tight ring-1 ring-red-100 md:block">
            <p className="font-semibold text-red-900/70">{dateLabel}</p>
            <p className="mt-0.5 font-mono text-[13px] font-bold tabular-nums text-red-700">{timeLabel}</p>
          </div>
          <Link
            href="/cashier/settings"
            aria-label="ตั้งค่าร้าน"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconSettings size={18} />
          </Link>
          <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 px-3.5 py-2 ring-1 ring-red-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-700 text-white">
              <IconDeviceDesktop size={16} />
            </div>
            <div className="leading-tight">
              <p className="text-[12px] font-bold text-red-900">เครื่อง 01</p>
              <p className="text-[10px] font-medium text-red-400">Cashier · POS</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — tables */}
        <main className="flex flex-1 flex-col overflow-hidden border-r border-border">
          {/* Stats + filters */}
          <div className="border-b border-red-100 bg-white px-6 py-5">
            <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr] gap-3">
              <SalesCard total={12580} bills={8} />
              <StatusStat status="available" count={stats.available} />
              <StatusStat status="active" count={stats.active} />
              <StatusStat status="preparing" count={stats.preparing} />
              <StatusStat status="billing" count={stats.billing} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex h-9 flex-1 min-w-[180px] items-center gap-2 rounded-2xl bg-background px-3 ring-1 ring-border">
                <IconSearch size={15} className="text-muted-foreground" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="ค้นโต๊ะ A1, B2..."
                  className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <div className="flex h-9 items-center gap-1 rounded-2xl bg-background p-1 ring-1 ring-border">
                <FilterChip
                  active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                  label="ทั้งหมด"
                />
                {(Object.keys(STATUS_META) as TableStatus[]).map((s) => (
                  <FilterChip
                    key={s}
                    active={statusFilter === s}
                    onClick={() => setStatusFilter(s)}
                    label={STATUS_META[s].label}
                    dot={STATUS_META[s].dot}
                  />
                ))}
              </div>

              <div className="flex h-9 items-center gap-1 rounded-2xl bg-background p-1 ring-1 ring-border">
                <FilterChip
                  active={zoneFilter === "all"}
                  onClick={() => setZoneFilter("all")}
                  label="ทุกโซน"
                />
                {ZONES.map((z) => (
                  <FilterChip
                    key={z}
                    active={zoneFilter === z}
                    onClick={() => setZoneFilter(z)}
                    label={z}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tables grid */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {filteredTables.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white ring-1 ring-border">
                  <IconSearch size={24} className="text-muted-foreground" />
                </div>
                <p className="mt-4 text-[14px] font-medium text-foreground">
                  ไม่พบโต๊ะตามเงื่อนไข
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  ลองล้างฟิลเตอร์หรือเปลี่ยนคำค้นดู
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredTables.map((t) => (
                  <TableCard
                    key={t.id}
                    table={t}
                    selected={t.id === selectedId}
                    onClick={() => setSelectedId(t.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right panel — detail */}
        <aside className="flex w-[400px] shrink-0 flex-col overflow-hidden bg-background xl:w-[460px]">
          {selectedTable ? (
            <DetailPanel
              table={selectedTable}
              subtotal={subtotal}
              vat={vat}
              total={total}
              itemCount={itemCount}
              seatsValue={openTableSeats}
              onSeatsChange={setOpenTableSeats}
              onOpenBill={openBill}
              onAddItem={() => setIsMenuOpen(true)}
              onUpdateGuests={updateGuests}
              onUpdateQty={updateQty}
              onRemoveItem={removeItem}
              onPrintPreview={() => setIsPrintOpen(true)}
              onRequestBill={requestBill}
              onBackToActive={backToActive}
              onCloseBill={() => setIsCloseOpen(true)}
              onShowQr={() => setIsQrOpen(true)}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white ring-1 ring-border">
                <IconReceipt2 size={26} className="text-muted-foreground" />
              </div>
              <p className="mt-4 text-[14px] font-medium text-foreground">
                เลือกโต๊ะจากด้านซ้าย
              </p>
              <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                แตะการ์ดโต๊ะเพื่อดูรายละเอียดและจัดการบิล
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Menu Picker */}
      {isMenuOpen && selectedTable && (
        <MenuPickerSheet
          table={selectedTable}
          onAdd={(m, qty, note) => addItem(m, qty, note)}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      {/* Print Bill preview */}
      {isPrintOpen && selectedTable && (
        <PrintBillModal
          table={selectedTable}
          subtotal={subtotal}
          vat={vat}
          total={total}
          onClose={() => setIsPrintOpen(false)}
        />
      )}

      {/* Close Bill */}
      {isCloseOpen && selectedTable && (
        <CloseBillModal
          table={selectedTable}
          subtotal={subtotal}
          vat={vat}
          total={total}
          onConfirm={closeBillFinalize}
          onClose={() => setIsCloseOpen(false)}
        />
      )}

      {/* QR Modal */}
      {isQrOpen && selectedTable && (
        <QrModal
          tableId={selectedTable.id}
          onClose={() => setIsQrOpen(false)}
        />
      )}

      {/* Kitchen ticket notification */}
      {printQueue.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {printQueue.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 rounded-2xl bg-[#1C1007] px-4 py-3 text-white shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E12717]">
                <IconPrinter size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold">
                  ออเดอร์ใหม่ · โต๊ะ {order.tableId}
                </p>
                <p className="text-[10px] text-white/60 tabular-nums">
                  {order.items.length} รายการ · {order.orderedAt} น.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  printKitchenTicket(order);
                  setPrintQueue((prev) => prev.filter((o) => o.id !== order.id));
                }}
                className="rounded-xl bg-[#E12717] px-3 py-1.5 text-[11px] font-semibold text-white active:scale-95"
              >
                พิมพ์
              </button>
              <button
                type="button"
                onClick={() =>
                  setPrintQueue((prev) => prev.filter((o) => o.id !== order.id))
                }
                className="rounded-full p-1 text-white/40 hover:text-white/70"
              >
                <IconX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function SalesCard({ total, bills }: { total: number; bills: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-800 via-red-700 to-red-900 p-5 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]">
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-red-400/20 blur-xl" />
      <div className="relative flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
          <IconCash size={16} />
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-wider text-white/70">
          ยอดขายวันนี้
        </p>
      </div>
      <p className="relative mt-3 text-[30px] font-bold leading-none tabular-nums">
        ฿{total.toLocaleString()}
      </p>
      <p className="relative mt-2 text-[12px] font-medium text-white/60">
        {bills} บิลปิดแล้ว
      </p>
    </div>
  );
}

function StatusStat({
  status,
  count,
}: {
  status: TableStatus;
  count: number;
}) {
  const meta = STATUS_META[status];
  const isBilling = status === "billing";
  const isPreparing = status === "preparing";

  const StatusIcon = {
    available: IconUsers,
    active: IconUsers,
    preparing: IconChefHat,
    billing: IconReceipt2,
  }[status];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 ring-1 transition-all",
        meta.statBg,
        isBilling ? "ring-red-700 shadow-[0_6px_20px_rgba(220,38,38,0.2)]" : meta.cardRing,
        isPreparing && "ring-2 ring-blue-400",
      )}
    >
      {isPreparing && (
        <div className="pointer-events-none absolute inset-0 animate-pulse rounded-2xl ring-2 ring-blue-400/50" />
      )}
      <div className="relative flex items-center gap-2.5">
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          meta.statIconBg,
          meta.statIconColor,
        )}>
          <StatusIcon size={18} />
        </div>
        <p className={cn(
          "text-[13px] font-bold",
          isBilling ? "text-white/80" : "text-red-900/70",
        )}>{meta.label}</p>
      </div>
      <p
        className={cn(
          "relative mt-3 text-[30px] font-bold leading-none tabular-nums",
          isBilling ? "text-white" : meta.text,
        )}
      >
        {count}
        <span className={cn(
          "ml-1.5 text-[13px] font-semibold",
          isBilling ? "text-white/50" : "text-red-300",
        )}>โต๊ะ</span>
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-medium transition-all",
        active
          ? "bg-foreground text-white shadow-[0_4px_10px_rgba(44,23,19,0.18)]"
          : "text-muted-foreground hover:bg-white/70",
      )}
    >
      {dot && <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dot)} />}
      {label}
    </button>
  );
}

function TableCard({
  table,
  selected,
  onClick,
}: {
  table: CafeTable;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = STATUS_META[table.status];
  const total = table.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = table.items.reduce((s, i) => s + i.quantity, 0);
  const mins = minutesBetween(table.openedAt);
  const isBilling = table.status === "billing";
  const isPreparing = table.status === "preparing";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border-l-4 p-3.5 text-left ring-1 transition-all",
        meta.cardBg,
        meta.cardRing,
        meta.cardBorder,
        selected
          ? "scale-[1.02] shadow-[0_12px_28px_rgba(225,39,23,0.25)] ring-[2.5px] ring-red-600"
          : "hover:scale-[1.01] hover:shadow-[0_6px_16px_rgba(44,23,19,0.08)] active:scale-[0.99]",
        isPreparing && "animate-[pulse-ring_2s_ease-in-out_infinite]",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-[9px] font-medium uppercase tracking-[0.18em]",
            isBilling ? "text-white/60" : "text-gray-400",
          )}>
            โซน {table.zone}
          </p>
          <p className={cn(
            "mt-0.5 text-[22px] font-bold leading-none tracking-tight",
            isBilling ? "text-white" : "text-foreground",
          )}>
            {table.id}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1",
            meta.pill,
          )}
        >
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              meta.dot,
              isPreparing && "animate-pulse",
            )}
          />
          {meta.short}
        </span>
      </div>

      {table.status === "available" ? (
        <div className="mt-4 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-400">
            <IconUsers size={13} />
            {table.seats} ที่นั่ง
          </div>
          <span className="font-semibold text-emerald-500">พร้อมเปิดบิล</span>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={cn(
              "text-[17px] font-bold tabular-nums",
              isBilling ? "text-white" : "text-foreground",
            )}>
              ฿{total.toLocaleString()}
            </span>
            <span className={cn(
              "text-[10px] font-medium tabular-nums",
              isBilling ? "text-white/60" : "text-gray-400",
            )}>
              {itemCount} รายการ
            </span>
          </div>
          <div className={cn(
            "mt-2 flex items-center justify-between border-t pt-2 text-[10px]",
            isBilling ? "border-white/20 text-white/60" : "border-red-100 text-gray-400",
          )}>
            <span className="flex items-center gap-1">
              <IconUsers size={11} />
              {table.guests}/{table.seats}
            </span>
            <span className="flex items-center gap-1 tabular-nums">
              <IconClockHour4 size={11} />
              {mins} นาที
            </span>
          </div>
        </>
      )}
    </button>
  );
}

function DetailPanel({
  table,
  subtotal,
  vat,
  total,
  itemCount,
  seatsValue,
  onSeatsChange,
  onOpenBill,
  onAddItem,
  onUpdateGuests,
  onUpdateQty,
  onRemoveItem,
  onPrintPreview,
  onRequestBill,
  onBackToActive,
  onCloseBill,
  onShowQr,
}: {
  table: CafeTable;
  subtotal: number;
  vat: number;
  total: number;
  itemCount: number;
  seatsValue: number;
  onSeatsChange: (n: number) => void;
  onOpenBill: () => void;
  onAddItem: () => void;
  onUpdateGuests: (n: number) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onPrintPreview: () => void;
  onRequestBill: () => void;
  onBackToActive: () => void;
  onCloseBill: () => void;
  onShowQr: () => void;
}) {
  const meta = STATUS_META[table.status];

  if (table.status === "available") {
    const clampedSeats = Math.min(Math.max(seatsValue, 1), table.seats);
    return (
      <>
        <div className="border-b border-border bg-white px-6 py-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            โซน {table.zone}
          </p>
          <h2 className="mt-1 text-[28px] font-bold text-foreground">
            โต๊ะ {table.id}
          </h2>
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1",
              meta.pill,
            )}
          >
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full", meta.dot)} />
            {meta.label}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-[12px] font-medium text-muted-foreground">เปิดบิลใหม่</p>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            ระบุจำนวนแขกที่โต๊ะ ระบบจะเริ่มบิลใหม่ที่เวลา {bangkokTimeNow()} น.
          </p>

          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">จำนวนแขก</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  รับได้สูงสุด {table.seats} ที่นั่ง
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                <button
                  type="button"
                  onClick={() => onSeatsChange(Math.max(1, clampedSeats - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-transform active:scale-95"
                >
                  <IconMinus size={15} />
                </button>
                <span className="min-w-[28px] text-center text-[15px] font-semibold text-foreground tabular-nums">
                  {clampedSeats}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onSeatsChange(Math.min(table.seats, clampedSeats + 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[0_2px_5px_rgba(225,39,23,0.32)] transition-transform active:scale-95"
                >
                  <IconPlus size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-orange-50/60 p-3 ring-1 ring-orange-200/40">
            <p className="text-[11px] leading-5 text-orange-700">
              <span className="font-semibold">ทิป:</span> หลังเปิดบิล กดเพิ่มรายการเพื่อสั่งแทนลูกค้าได้ทันที
              และพิมพ์บิลให้ลูกค้าตรวจสอบยอดได้ก่อนปิด
            </p>
          </div>
        </div>

        <div className="border-t border-border bg-white px-6 py-4">
          <button
            type="button"
            onClick={onOpenBill}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/90 py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_rgba(225,39,23,0.32)] transition-transform active:scale-[0.98]"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/16 to-transparent" />
            <IconSparkles size={17} className="relative" />
            <span className="relative">เปิดบิลโต๊ะ {table.id}</span>
            <IconArrowRight size={17} className="relative" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="border-b border-border bg-white px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              โซน {table.zone} · {table.seats} ที่นั่ง
            </p>
            <h2 className="mt-1 text-[28px] font-bold text-foreground">
              โต๊ะ {table.id}
            </h2>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1",
              meta.pill,
            )}
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                meta.dot,
                table.status === "preparing" && "animate-pulse",
              )}
            />
            {meta.label}
          </span>
        </div>

        {/* QR button for customer ordering */}
        {(table.status === "active" || table.status === "preparing") && (
          <button
            type="button"
            onClick={onShowQr}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-white active:scale-95"
          >
            <IconQrcode size={14} />
            แสดง QR ให้ลูกค้าสั่ง
          </button>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-xl bg-muted px-3 py-2">
            <p className="text-[10px] text-muted-foreground">เปิดโต๊ะ</p>
            <p className="mt-0.5 font-semibold text-foreground tabular-nums">
              {table.openedAt}
            </p>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2">
            <p className="text-[10px] text-muted-foreground">ใช้เวลา</p>
            <p className="mt-0.5 font-semibold text-foreground tabular-nums">
              {durationLabel(table.openedAt)}
            </p>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2">
            <p className="text-[10px] text-muted-foreground">แขก</p>
            <div className="mt-0.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdateGuests((table.guests ?? 1) - 1)}
                disabled={(table.guests ?? 1) <= 1}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border disabled:opacity-30"
              >
                <IconMinus size={10} />
              </button>
              <span className="min-w-[28px] text-center text-[13px] font-semibold text-foreground tabular-nums">
                {table.guests ?? 1}/{table.seats}
              </span>
              <button
                type="button"
                onClick={() => onUpdateGuests((table.guests ?? 1) + 1)}
                disabled={(table.guests ?? 1) >= table.seats}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border disabled:opacity-30"
              >
                <IconPlus size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-foreground">
            รายการในบิลนี้
          </p>
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-white shadow-[0_4px_10px_rgba(44,23,19,0.18)] transition-transform active:scale-[0.98]"
          >
            <IconPlus size={13} />
            เพิ่มรายการ
          </button>
        </div>

        {table.items.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[#E0CFBE] bg-white/40 py-8 text-center">
            <p className="text-[12px] text-muted-foreground">ยังไม่มีรายการในบิล</p>
            <button
              type="button"
              onClick={onAddItem}
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-foreground ring-1 ring-border"
            >
              <IconPlus size={13} />
              เลือกเมนู
            </button>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {table.items.map((item) => (
              <DetailItemRow
                key={item.id}
                item={item}
                onUpdateQty={onUpdateQty}
                onRemove={onRemoveItem}
              />
            ))}
          </ul>
        )}

        {table.items.length > 0 && (
          <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-border">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">รวม {itemCount} รายการ</span>
              <span className="font-medium text-muted-foreground tabular-nums">
                ฿{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">VAT 7%</span>
              <span className="font-medium text-muted-foreground tabular-nums">
                ฿{vat.toLocaleString()}
              </span>
            </div>
            <div className="my-3 h-px border-t border-dashed border-border" />
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold text-foreground">
                ยอดต้องชำระ
              </span>
              <span className="text-[22px] font-bold text-primary tabular-nums">
                ฿{total.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-white px-6 py-4">
        {table.status === "billing" ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onPrintPreview}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-white py-3.5 text-[12px] font-medium text-foreground transition-transform active:scale-[0.98]"
              >
                <IconPrinter size={15} />
                พิมพ์บิลซ้ำ
              </button>
              <button
                type="button"
                onClick={onBackToActive}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-white py-3.5 text-[12px] font-medium text-foreground transition-transform active:scale-[0.98]"
              >
                <IconArrowLeft size={15} />
                กลับไปแก้ไข
              </button>
            </div>
            <button
              type="button"
              onClick={onCloseBill}
              disabled={table.items.length === 0}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/90 py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_rgba(225,39,23,0.32)] transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/16 to-transparent" />
              <IconCash size={17} className="relative" />
              <span className="relative">
                ปิดบิลรับชำระ · ฿{total.toLocaleString()}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPrintPreview}
              disabled={table.items.length === 0}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-white py-3.5 text-[12px] font-medium text-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <IconPrinter size={15} />
              ดูใบเสร็จ
            </button>
            <button
              type="button"
              onClick={onRequestBill}
              disabled={table.items.length === 0}
              className="relative flex flex-[1.4] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/90 py-3.5 text-[13px] font-semibold text-white shadow-[0_14px_28px_rgba(225,39,23,0.32)] transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/16 to-transparent" />
              <IconReceipt2 size={15} className="relative" />
              <span className="relative">เรียกพิมพ์บิล</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function DetailItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: OrderItem;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  const statusMeta = {
    queued: { label: "รอรับ", color: "text-orange-700", bg: "bg-orange-100" },
    preparing: { label: "ทำอยู่", color: "text-red-700", bg: "bg-red-100" },
    served: { label: "เสิร์ฟ", color: "text-muted-foreground", bg: "bg-muted" },
  }[item.status];

  return (
    <li className="rounded-2xl bg-white p-3 ring-1 ring-border">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-foreground">
            {item.name}
          </p>
          {item.note && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
              {item.note}
            </p>
          )}
        </div>
        <span className="shrink-0 text-[13px] font-semibold text-foreground tabular-nums">
          ฿{(item.price * item.quantity).toLocaleString()}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-medium",
              statusMeta.bg,
              statusMeta.color,
            )}
          >
            {statusMeta.label}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            ฿{item.price.toLocaleString()} × {item.quantity}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label="ลบรายการ"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted"
          >
            <IconTrash size={13} />
          </button>
          <div className="flex items-center gap-1 rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => onUpdateQty(item.id, -1)}
              aria-label="ลดจำนวน"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-transform active:scale-95"
            >
              <IconMinus size={11} />
            </button>
            <span className="min-w-[16px] text-center text-[11px] font-semibold text-foreground tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(item.id, 1)}
              aria-label="เพิ่มจำนวน"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-[0_2px_5px_rgba(225,39,23,0.32)] transition-transform active:scale-95"
            >
              <IconPlus size={11} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function MenuPickerSheet({
  table,
  onAdd,
  onClose,
}: {
  table: CafeTable;
  onAdd: (m: MenuOption, qty: number, note: string) => void;
  onClose: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<MenuOption | null>(null);
  const [pickQty, setPickQty] = useState(1);
  const [pickNote, setPickNote] = useState("");
  const [apiMenu, setApiMenu] = useState<StoreMenuItem[]>([]);

  useEffect(() => {
    apiFetchMenu().then((items) => setApiMenu(items)).catch(() => {});
  }, []);

  const menuList: MenuOption[] = apiMenu.length > 0
    ? apiMenu.map((m) => ({ id: m.id, name: m.name, price: m.price, category: m.category }))
    : MENU;

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuList.map((m) => m.category)));
    return cats;
  }, [menuList]);

  const filtered = menuList.filter((m) => {
    if (activeCategory !== "ทั้งหมด" && m.category !== activeCategory) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectItem = (m: MenuOption) => {
    setPicked(m);
    setPickQty(1);
    setPickNote("");
  };

  const confirmAdd = () => {
    if (!picked) return;
    onAdd(picked, pickQty, pickNote.trim());
    setPicked(null);
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="ปิดเมนู"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden bg-background shadow-[-20px_0_50px_rgba(0,0,0,0.2)]"
      >
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-border bg-white px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background ring-1 ring-border">
            <IconChefHat size={18} className="text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              เพิ่มเมนู · โต๊ะ {table.id}
            </p>
            <h2 className="text-[15px] font-semibold text-foreground">
              เลือกเมนูส่งครัว
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border"
          >
            <IconX size={17} />
          </button>
        </header>

        {/* Search + categories */}
        <div className="space-y-3 border-b border-border bg-white px-5 pb-3 pt-3">
          <div className="flex h-10 items-center gap-2 rounded-2xl bg-background px-3 ring-1 ring-border">
            <IconSearch size={16} className="text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นเมนู..."
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {["ทั้งหมด", ...categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
                  activeCategory === c
                    ? "bg-foreground text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Menu list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-[12px] text-muted-foreground">
              ไม่พบเมนูตามคำค้น
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((m) => {
                const inBill = table.items
                  .filter((i) => i.name === m.name)
                  .reduce((s, i) => s + i.quantity, 0);
                const isSelected = picked?.id === m.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => selectItem(m)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left ring-1 transition-all",
                        isSelected
                          ? "bg-[#FFF3EC] ring-[#E12717]/40 shadow-[0_6px_16px_rgba(225,39,23,0.1)]"
                          : "bg-white ring-border hover:shadow-[0_6px_16px_rgba(44,23,19,0.08)]",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {m.name}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {m.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {inBill > 0 && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            ในบิล ×{inBill}
                          </span>
                        )}
                        <span className="text-[13px] font-semibold text-foreground tabular-nums">
                          ฿{m.price.toLocaleString()}
                        </span>
                        <span className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-white shadow-[0_2px_5px_rgba(225,39,23,0.32)]",
                          isSelected ? "bg-[#E12717]" : "bg-primary",
                        )}>
                          {isSelected ? <IconCheck size={14} /> : <IconPlus size={14} />}
                        </span>
                      </div>
                    </button>

                    {/* Inline qty + note panel */}
                    {isSelected && (
                      <div className="mx-1 mt-1 rounded-2xl border border-[#E12717]/20 bg-white p-4 shadow-[0_4px_14px_rgba(225,39,23,0.08)]">
                        {/* Qty */}
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-foreground">จำนวน</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setPickQty((q) => Math.max(1, q - 1))}
                              disabled={pickQty <= 1}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground ring-1 ring-border disabled:opacity-30"
                            >
                              <IconMinus size={14} />
                            </button>
                            <span className="w-6 text-center text-[16px] font-bold tabular-nums">
                              {pickQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPickQty((q) => Math.min(99, q + 1))}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground ring-1 ring-border"
                            >
                              <IconPlus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Note */}
                        <div className="mt-3">
                          <label className="text-[12px] font-medium text-foreground">
                            โน้ตพิเศษ (ถ้ามี)
                          </label>
                          <input
                            type="text"
                            value={pickNote}
                            onChange={(e) => setPickNote(e.target.value)}
                            placeholder="เช่น ไม่เผ็ด, ไม่ใส่ผักชี..."
                            maxLength={80}
                            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-[#E12717] focus:outline-none focus:ring-2 focus:ring-[#E12717]/10"
                          />
                        </div>

                        {/* Confirm */}
                        <button
                          type="button"
                          onClick={confirmAdd}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(225,39,23,0.25)] active:scale-[0.98]"
                        >
                          <IconPlus size={15} />
                          เพิ่ม {pickQty} รายการ · ฿{(m.price * pickQty).toLocaleString()}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(44,23,19,0.18)]"
          >
            <IconCheck size={16} />
            เสร็จ · กลับไปที่บิล
          </button>
        </div>
      </div>
    </div>
  );
}

function PrintBillModal({
  table,
  subtotal,
  vat,
  total,
  onClose,
}: {
  table: CafeTable;
  subtotal: number;
  vat: number;
  total: number;
  onClose: () => void;
}) {
  const itemCount = table.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10">
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[90vh] w-full max-w-[380px] flex-col"
      >
        <div className="flex items-center justify-between pb-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
            พรีวิวใบเสร็จ · โต๊ะ {table.id}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md ring-1 ring-white/20"
          >
            <IconX size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-t-[4px] [filter:drop-shadow(0_10px_24px_rgba(0,0,0,0.3))]">
          <div className="bg-card px-6 pt-6 pb-5">
            <div className="flex flex-col items-center">
              <Image
                src="/logo.png"
                alt="แซ่บกลางซอย"
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
              />
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.36em] text-muted-foreground">
                Table Receipt
              </p>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              <div className="h-px flex-1 border-t border-dashed border-border" />
              <span className="text-[8px] text-muted-foreground">◆ ◆ ◆</span>
              <div className="h-px flex-1 border-t border-dashed border-border" />
            </div>

            <dl className="mt-4 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">โต๊ะ</dt>
                <dd className="font-medium text-foreground">
                  {table.id} · โซน {table.zone}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">เปิดโต๊ะ</dt>
                <dd className="font-medium text-foreground tabular-nums">
                  28/05/2026 · {table.openedAt}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">แคชเชียร์</dt>
                <dd className="font-medium text-foreground">มะลิ · ML</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-dashed border-border pt-3">
              <div className="flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                <span>รายการ · Item</span>
                <span>ยอด · Amount</span>
              </div>
            </div>

            <ul className="mt-3 space-y-3">
              {table.items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] font-medium leading-snug text-foreground">
                      {item.name}
                    </p>
                    <span className="shrink-0 text-[13px] font-semibold text-foreground tabular-nums">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  {item.note && (
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {item.note}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground tabular-nums">
                    ฿{item.price.toLocaleString()} × {item.quantity}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-dashed border-border pt-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">
                  รวม {itemCount} รายการ
                </span>
                <span className="font-medium text-muted-foreground tabular-nums">
                  ฿{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">VAT 7%</span>
                <span className="font-medium text-muted-foreground tabular-nums">
                  ฿{vat.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-3 border-t-2 border-double border-border pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-foreground">
                  รวมต้องชำระ
                </span>
                <span className="text-[24px] font-bold leading-none text-primary tabular-nums">
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              <div className="h-px flex-1 border-t border-dashed border-border" />
              <span className="text-[8px] tracking-[0.3em] text-muted-foreground">
                THANK YOU
              </span>
              <div className="h-px flex-1 border-t border-dashed border-border" />
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              ขอบคุณที่ใช้บริการค่ะ
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

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex flex-1 items-center justify-center rounded-2xl bg-white/15 py-3.5 text-[13px] font-medium text-white backdrop-blur-md ring-1 ring-white/20"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={() => {
              window.print?.();
            }}
            className="flex flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[13px] font-semibold text-foreground shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
          >
            <IconPrinter size={16} />
            พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseBillModal({
  table,
  subtotal,
  vat,
  total,
  onConfirm,
  onClose,
}: {
  table: CafeTable;
  subtotal: number;
  vat: number;
  total: number;
  onConfirm: (payment: { method: "cash" | "transfer"; cashReceived?: number }) => void;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<"cash" | "transfer">("cash");
  const [received, setReceived] = useState(total);
  const change = Math.max(0, received - total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10">
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.32)]"
      >
        <div className="border-b border-border px-6 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                ปิดบิลโต๊ะ {table.id}
              </p>
              <h2 className="mt-1 text-[19px] font-semibold text-foreground">
                รับชำระเงิน
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิด"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border"
            >
              <IconX size={17} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FFF5F0] to-[#FFE9DE] p-4 ring-1 ring-[#F2D1BD]/50">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FFB293]/22 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <span>ยอดอาหาร</span>
                <span className="font-medium tabular-nums">
                  ฿{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>VAT 7%</span>
                <span className="font-medium tabular-nums">
                  ฿{vat.toLocaleString()}
                </span>
              </div>
              <div className="my-3 h-px bg-border" />
              <div className="flex items-end justify-between">
                <span className="text-[13px] font-medium text-foreground">
                  รวมต้องรับ
                </span>
                <span className="text-[24px] font-bold leading-none text-primary tabular-nums">
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#A98671]">
              วิธีชำระ
            </p>
            <div className="grid grid-cols-2 gap-2">
              <PaymentChoice
                selected={method === "cash"}
                onClick={() => { setMethod("cash"); setReceived(total); }}
                Icon={IconCash}
                label="เงินสด"
              />
              <PaymentChoice
                selected={method === "transfer"}
                onClick={() => { setMethod("transfer"); setReceived(total); }}
                Icon={IconBuildingBank}
                label="โอน / แอพธนาคาร"
              />
            </div>
          </div>

          {method === "cash" && (
            <div className="rounded-2xl bg-muted p-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-muted-foreground">
                  รับเงินสด
                </p>
                <div className="flex items-center gap-1.5">
                  {[total, 1000, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setReceived(amt)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 transition-colors",
                        received === amt
                          ? "bg-foreground text-white ring-[#2C1713]"
                          : "bg-white text-muted-foreground ring-border",
                      )}
                    >
                      ฿{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">฿</span>
                <input
                  type="number"
                  value={received}
                  onChange={(e) => setReceived(Number(e.target.value) || 0)}
                  className="flex-1 rounded-xl bg-white px-3 py-2 text-[15px] font-semibold text-foreground tabular-nums ring-1 ring-border focus:outline-none focus:ring-primary"
                />
              </div>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-border">
                <span className="text-[11px] text-muted-foreground">เงินทอน</span>
                <span className="text-[15px] font-semibold text-foreground tabular-nums">
                  ฿{change.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {method === "transfer" && (
            <div className="rounded-2xl bg-[#F0F7FF] p-4 ring-1 ring-blue-100">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border">
                  <QRCode
                    value={`promptpay|0812345678|${total}`}
                    size={140}
                    level="M"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-[#1A3A6E]">
                    สแกนจ่ายผ่านแอพธนาคาร
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#4A6FA5]">
                    ยอด{" "}
                    <span className="font-bold tabular-nums text-[#1A3A6E]">
                      ฿{total.toLocaleString()}
                    </span>
                    {" "}· โต๊ะ {table.id}
                  </p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    รอลูกค้าโอนเสร็จ แล้วกด &ldquo;ยืนยันปิดบิล&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-border bg-background px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border bg-white py-3.5 text-[13px] font-medium text-foreground transition-transform active:scale-[0.98]"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm({
                method,
                cashReceived: method === "cash" ? received : undefined,
              })
            }
            disabled={method === "cash" && received < total}
            className="relative flex flex-[1.5] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/90 py-3.5 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(225,39,23,0.28)] transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/16 to-transparent" />
            <IconCheck size={16} className="relative" />
            <span className="relative">ยืนยันปิดบิล</span>
            <IconChevronRight size={15} className="relative" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentChoice({
  selected,
  onClick,
  Icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  Icon: typeof IconCash;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-2xl border bg-white py-3 transition-all",
        selected
          ? "border-[#E12717] bg-gradient-to-br from-white to-[#FFF5F0] shadow-[0_6px_16px_rgba(225,39,23,0.12)]"
          : "border-border",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon size={17} />
      </div>
      <p className="text-[11px] font-semibold text-foreground">{label}</p>
      {selected && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
          <IconCheck size={10} />
        </span>
      )}
    </button>
  );
}

/* ─── QR Modal ───────────────────────────────────────────────── */

function QrModal({
  tableId,
  onClose,
}: {
  tableId: string;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use current origin so QR works on local network (e.g. 192.168.x.x:3000)
    setUrl(`${window.location.origin}/menu/${tableId}`);
  }, [tableId]);

  const printQrCard = () => {
    const svgHtml = qrRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank", "width=420,height=620");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>QR โต๊ะ ${tableId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap');
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Sarabun', sans-serif;
      background: #fff;
      display: flex; flex-direction: column; align-items: center;
      padding: 28px 24px 32px;
      min-height: 100vh;
    }
    .brand { font-size: 20px; font-weight: 800; color: #2C1713; letter-spacing: -0.3px; }
    .brand-sub { font-size: 12px; color: #A98671; margin-top: 2px; }
    .divider { width: 100%; border: none; border-top: 1.5px dashed #E8D6C6; margin: 18px 0; }
    .table-label { font-size: 13px; color: #9D7F6A; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
    .table-num {
      font-size: 52px; font-weight: 800; color: #E12717;
      line-height: 1; letter-spacing: -1px;
    }
    .qr-wrap {
      margin-top: 20px;
      padding: 16px; background: #fff;
      border: 1.5px solid #F0E0D4; border-radius: 20px;
      box-shadow: 0 6px 24px rgba(44,23,19,0.08);
    }
    .qr-wrap svg { display: block; }
    .scan-hint { margin-top: 18px; font-size: 14px; font-weight: 600; color: #2C1713; }
    .scan-sub { margin-top: 4px; font-size: 12px; color: #9D7F6A; text-align: center; }
    .url-box {
      margin-top: 14px; background: #FFF9F5; border: 1px solid #F0E0D4;
      border-radius: 10px; padding: 7px 14px;
      font-size: 10px; color: #A98671; font-family: monospace;
      word-break: break-all; text-align: center; max-width: 260px;
    }
    .footer { margin-top: 22px; font-size: 10px; color: #C4A98A; }
  </style>
</head>
<body>
  <p class="brand">🔥 แซ่บกลางซอย</p>
  <p class="brand-sub">อีสาน · ซีฟู้ด · หมูกระทะ</p>
  <hr class="divider">
  <p class="table-label">โต๊ะของคุณ</p>
  <p class="table-num">${tableId}</p>
  <div class="qr-wrap">${svgHtml}</div>
  <p class="scan-hint">📱 สแกน QR เพื่อสั่งอาหาร</p>
  <p class="scan-sub">ใช้กล้องมือถือสแกน QR Code นี้<br>เพื่อเปิดเมนูและสั่งอาหารได้เลย</p>
  <div class="url-box">${url}</div>
  <p class="footer">แซ่บกลางซอย · ระบบสั่งอาหารออนไลน์</p>
</body>
</html>`);
    win.document.close();
    win.onload = () => win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[340px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              สแกนเพื่อสั่งอาหาร
            </p>
            <h2 className="text-[17px] font-bold text-foreground">
              โต๊ะ {tableId}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border"
          >
            <IconX size={17} />
          </button>
        </div>

        <div className="flex flex-col items-center px-6 py-8">
          {url && (
            <div
              ref={qrRef}
              className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-border"
            >
              <QRCode value={url} size={200} />
            </div>
          )}
          <p className="mt-5 text-center text-[12px] leading-5 text-muted-foreground">
            ให้ลูกค้าสแกน QR นี้ด้วยกล้องมือถือ
            <br />
            เพื่อเปิดเมนูและสั่งอาหารได้เลย
          </p>
          <div className="mt-3 w-full rounded-xl bg-muted px-4 py-2">
            <p className="truncate text-center font-mono text-[10px] text-muted-foreground">
              {url}
            </p>
          </div>

          {/* Print button */}
          <button
            type="button"
            onClick={printQrCard}
            disabled={!url}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(225,39,23,0.28)] transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            <IconPrinter size={18} />
            พิมพ์ QR ส่งให้ลูกค้า
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Print kitchen ticket (opens new window) ────────────────── */

function printKitchenTicket(order: StoreOrder) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <div class="item">
        <span class="qty">${item.quantity}×</span>
        <div class="item-detail">
          <span class="name">${item.name}</span>
          ${item.note ? `<span class="note">${item.note}</span>` : ""}
        </div>
      </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>ใบครัว · โต๊ะ ${order.tableId}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', Courier, monospace; padding: 16px 14px; font-size: 14px; background: #fff; }
  .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 14px; }
  .shop { font-size: 13px; letter-spacing: 3px; color: #555; margin-bottom: 6px; }
  .table-no { font-size: 48px; font-weight: 900; letter-spacing: 2px; line-height: 1; }
  .order-meta { font-size: 12px; color: #555; margin-top: 4px; }
  .item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px dashed #ddd; align-items: flex-start; }
  .item:last-child { border-bottom: none; }
  .qty { font-size: 26px; font-weight: 900; min-width: 36px; line-height: 1.2; }
  .item-detail { flex: 1; }
  .name { font-size: 20px; font-weight: bold; display: block; line-height: 1.3; }
  .note { font-size: 13px; color: #444; margin-top: 3px; display: block; background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
  .footer { border-top: 2px dashed #000; margin-top: 14px; padding-top: 8px; text-align: center; font-size: 12px; color: #666; }
  @media print { body { padding: 8px; } }
</style>
</head>
<body>
<div class="header">
  <div class="shop">แซ่บกลางซอย</div>
  <div class="table-no">โต๊ะ ${order.tableId}</div>
  <div class="order-meta">${order.id} &nbsp;·&nbsp; ${order.orderedAt} น.</div>
</div>
${itemsHtml}
<div class="footer">*** ใบครัว — Kitchen Order ***</div>
<script>
  window.onload = function () {
    window.print();
    setTimeout(function () { window.close(); }, 800);
  };
</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=380,height=640,toolbar=0,menubar=0,scrollbars=0");
  if (!win) {
    alert("กรุณาอนุญาต popup เพื่อพิมพ์ใบครัว");
    return;
  }
  win.document.write(html);
  win.document.close();
}
