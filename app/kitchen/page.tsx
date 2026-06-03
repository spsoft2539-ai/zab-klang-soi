"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBell,
  IconBellOff,
  IconCheck,
  IconChefHat,
  IconCircleCheck,
  IconClockHour4,
  IconFlame,
  IconMinus,
  IconPackage,
  IconPlus,
  IconPrinter,
  IconReceipt2,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type ItemStatus = "pending" | "cooking" | "done";
type TabKey = "incoming" | "cooking" | "stock";

interface KitchenItem {
  id: string;
  name: string;
  note?: string;
  quantity: number;
  status: ItemStatus;
}

interface PendingOrder {
  id: string;
  table: string;
  receivedAt: string;
  items: KitchenItem[];
  customerNote?: string;
}

interface ActiveTicket extends PendingOrder {
  acceptedAt: string;
}

interface StockItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  threshold: number;
  linkedDishes: string[];
  outOfStock: boolean;
}

const TEAR_TOP = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 12'><polygon points='0,12 14,12 14,8 7,0 0,8' fill='white'/></svg>")`;
const TEAR_BOTTOM = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 12'><polygon points='0,0 14,0 14,4 7,12 0,4' fill='white'/></svg>")`;

const INITIAL_PENDING: PendingOrder[] = [
  {
    id: "KOT-000147",
    table: "A12",
    receivedAt: "19:42",
    customerNote: "ลูกค้ารีบ มีคนแพ้กุ้ง 1 ที่",
    items: [
      { id: "p1-1", name: "ต้มยำกุ้งน้ำข้น", note: "เผ็ดน้อย · ไม่ใส่ผักชี", quantity: 1, status: "pending" },
      { id: "p1-2", name: "ข้าวสวย", quantity: 2, status: "pending" },
      { id: "p1-3", name: "น้ำเปล่าเย็น", note: "ขวดใหญ่", quantity: 1, status: "pending" },
    ],
  },
  {
    id: "KOT-000148",
    table: "B04",
    receivedAt: "19:44",
    items: [
      { id: "p2-1", name: "หมูกระทะรวมมิตร", note: "เพิ่มไข่ 2 ฟอง", quantity: 2, status: "pending" },
      { id: "p2-2", name: "ผัดผักรวมมิตร", quantity: 1, status: "pending" },
    ],
  },
  {
    id: "KOT-000149",
    table: "C02",
    receivedAt: "19:45",
    customerNote: "ฉลองวันเกิด ใส่เทียนด้วย",
    items: [
      { id: "p3-1", name: "ปลาทับทิมนึ่งมะนาว", quantity: 1, status: "pending" },
      { id: "p3-2", name: "ข้าวผัดปู", note: "ไม่ใส่หอม", quantity: 1, status: "pending" },
      { id: "p3-3", name: "เบียร์สิงห์", quantity: 4, status: "pending" },
    ],
  },
];

const INITIAL_ACTIVE: ActiveTicket[] = [
  {
    id: "KOT-000145",
    table: "A03",
    receivedAt: "19:30",
    acceptedAt: "19:31",
    items: [
      { id: "a1-1", name: "หมูกระทะรวมมิตร", note: "เพิ่มไข่ 2 ฟอง", quantity: 2, status: "cooking" },
      { id: "a1-2", name: "ข้าวสวย", quantity: 2, status: "done" },
      { id: "a1-3", name: "น้ำมะนาวโซดา", quantity: 2, status: "cooking" },
    ],
  },
  {
    id: "KOT-000146",
    table: "B02",
    receivedAt: "19:36",
    acceptedAt: "19:37",
    items: [
      { id: "a2-1", name: "ปลาทับทิมนึ่งมะนาว", quantity: 1, status: "cooking" },
      { id: "a2-2", name: "ผัดผักรวมมิตร", quantity: 1, status: "done" },
    ],
  },
];

const INITIAL_STOCK: StockItem[] = [
  { id: "s1", name: "กุ้งแม่น้ำ", unit: "กก.", quantity: 3.2, threshold: 2, linkedDishes: ["ต้มยำกุ้งน้ำข้น"], outOfStock: false },
  { id: "s2", name: "หมูสไลซ์", unit: "กก.", quantity: 1.4, threshold: 3, linkedDishes: ["หมูกระทะรวมมิตร"], outOfStock: false },
  { id: "s3", name: "ปลาทับทิม", unit: "ตัว", quantity: 0, threshold: 4, linkedDishes: ["ปลาทับทิมนึ่งมะนาว"], outOfStock: true },
  { id: "s4", name: "ผักรวม", unit: "กก.", quantity: 5.8, threshold: 2, linkedDishes: ["ผัดผักรวมมิตร"], outOfStock: false },
  { id: "s5", name: "ข้าวหอมมะลิ", unit: "กก.", quantity: 18, threshold: 5, linkedDishes: ["ข้าวสวย", "ข้าวผัดปู"], outOfStock: false },
  { id: "s6", name: "ไข่ไก่", unit: "ฟอง", quantity: 24, threshold: 30, linkedDishes: ["หมูกระทะรวมมิตร", "ข้าวผัดปู"], outOfStock: false },
  { id: "s7", name: "เบียร์สิงห์", unit: "ขวด", quantity: 12, threshold: 6, linkedDishes: ["เบียร์สิงห์"], outOfStock: false },
];

const REJECT_REASONS = [
  "วัตถุดิบหมด",
  "ครัวแน่นเกินไป",
  "เลยเวลาปิดครัว",
  "ระบุเอง...",
];

export default function KitchenPage() {
  const [tab, setTab] = useState<TabKey>("incoming");
  const [pending, setPending] = useState<PendingOrder[]>(INITIAL_PENDING);
  const [active, setActive] = useState<ActiveTicket[]>(INITIAL_ACTIVE);
  const [stock, setStock] = useState<StockItem[]>(INITIAL_STOCK);
  const [soundOn, setSoundOn] = useState(true);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [stockQuery, setStockQuery] = useState("");

  const lowStockCount = useMemo(
    () => stock.filter((s) => s.outOfStock || s.quantity <= s.threshold).length,
    [stock],
  );

  const acceptOrder = (id: string) => {
    setPending((prev) => {
      const order = prev.find((p) => p.id === id);
      if (!order) return prev;
      const ticket: ActiveTicket = {
        ...order,
        acceptedAt: nowLabel(),
        items: order.items.map((it) => ({ ...it, status: "cooking" as const })),
      };
      setActive((a) => [ticket, ...a]);
      return prev.filter((p) => p.id !== id);
    });
  };

  const rejectOrder = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    setRejecting(null);
  };

  const toggleItemDone = (ticketId: string, itemId: string) => {
    setActive((prev) =>
      prev.map((t) =>
        t.id !== ticketId
          ? t
          : {
              ...t,
              items: t.items.map((it) =>
                it.id !== itemId
                  ? it
                  : { ...it, status: it.status === "done" ? "cooking" : "done" },
              ),
            },
      ),
    );
  };

  const serveTicket = (id: string) => {
    setActive((prev) => prev.filter((t) => t.id !== id));
  };

  const adjustStock = (id: string, delta: number) => {
    setStock((prev) =>
      prev.map((s) =>
        s.id !== id
          ? s
          : {
              ...s,
              quantity: Math.max(0, Math.round((s.quantity + delta) * 10) / 10),
              outOfStock: s.outOfStock && s.quantity + delta <= 0,
            },
      ),
    );
  };

  const toggleOutOfStock = (id: string) => {
    setStock((prev) =>
      prev.map((s) => (s.id === id ? { ...s, outOfStock: !s.outOfStock } : s)),
    );
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[1280px] flex-col px-6 py-5">
      <Header
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((v) => !v)}
        pendingCount={pending.length}
        cookingCount={active.length}
        lowStockCount={lowStockCount}
      />

      <TabBar
        tab={tab}
        onChange={setTab}
        counts={{
          incoming: pending.length,
          cooking: active.length,
          stock: lowStockCount,
        }}
      />

      <div className="mt-6 flex-1">
        {tab === "incoming" && (
          <IncomingTab
            orders={pending}
            rejecting={rejecting}
            onStartReject={setRejecting}
            onCancelReject={() => setRejecting(null)}
            onAccept={acceptOrder}
            onReject={rejectOrder}
          />
        )}

        {tab === "cooking" && (
          <CookingTab
            tickets={active}
            onToggleItem={toggleItemDone}
            onServe={serveTicket}
          />
        )}

        {tab === "stock" && (
          <StockTab
            stock={stock}
            query={stockQuery}
            onQueryChange={setStockQuery}
            onAdjust={adjustStock}
            onToggle={toggleOutOfStock}
          />
        )}
      </div>
    </main>
  );
}

function nowLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ---------------- Header ---------------- */

function Header({
  soundOn,
  onToggleSound,
  pendingCount,
  cookingCount,
  lowStockCount,
}: {
  soundOn: boolean;
  onToggleSound: () => void;
  pendingCount: number;
  cookingCount: number;
  lowStockCount: number;
}) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-[#F2D9D5] pb-5">
      <div className="flex items-center gap-4">
        <Link
          href="/cashier"
          aria-label="กลับ"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#1A1110] shadow-[0_2px_8px_rgba(200,32,28,0.08)] ring-1 ring-[#F2D9D5] transition-transform active:scale-95"
        >
          <IconArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C8201C] text-white shadow-[0_4px_12px_rgba(200,32,28,0.25)]">
            <IconChefHat size={24} />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C8201C]">
              Kitchen Display
            </div>
            <h1 className="text-2xl font-bold text-[#1A1110]">
              ครัวแซ่บกลางซอย
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Stat label="ออเดอร์รอรับ" value={pendingCount} tone="red" />
        <Stat label="กำลังทำ" value={cookingCount} tone="dark" />
        <Stat label="สต็อกใกล้หมด" value={lowStockCount} tone="ghost" />
        <button
          onClick={onToggleSound}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition active:scale-95",
            soundOn
              ? "bg-[#C8201C] text-white ring-[#C8201C] shadow-[0_4px_12px_rgba(200,32,28,0.25)]"
              : "bg-white text-[#6B5A57] ring-[#F2D9D5]",
          )}
          aria-label="แจ้งเตือนเสียง"
        >
          {soundOn ? <IconBell size={18} /> : <IconBellOff size={18} />}
        </button>
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "dark" | "ghost";
}) {
  const styles = {
    red: "bg-[#FFF1EE] text-[#C8201C] ring-[#FADADA]",
    dark: "bg-[#1A1110] text-white ring-[#1A1110]",
    ghost: "bg-white text-[#1A1110] ring-[#F2D9D5]",
  }[tone];
  return (
    <div
      className={cn(
        "flex min-w-[120px] items-center gap-3 rounded-2xl px-4 py-2.5 ring-1",
        styles,
      )}
    >
      <div className="text-2xl font-bold leading-none tabular-nums">{value}</div>
      <div className="text-[11px] font-medium leading-tight opacity-80">
        {label}
      </div>
    </div>
  );
}

/* ---------------- Tabs ---------------- */

function TabBar({
  tab,
  onChange,
  counts,
}: {
  tab: TabKey;
  onChange: (t: TabKey) => void;
  counts: Record<TabKey, number>;
}) {
  const tabs: { key: TabKey; label: string; Icon: typeof IconClockHour4 }[] = [
    { key: "incoming", label: "ออเดอร์เข้าใหม่", Icon: IconClockHour4 },
    { key: "cooking", label: "กำลังทำ", Icon: IconFlame },
    { key: "stock", label: "สต็อกวัตถุดิบ", Icon: IconPackage },
  ];
  return (
    <div className="mt-5 flex items-center gap-1.5 rounded-2xl bg-[#FBEEEC] p-1.5 ring-1 ring-[#F2D9D5] self-start">
      {tabs.map(({ key, label, Icon }) => {
        const isActive = key === tab;
        const count = counts[key];
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              isActive
                ? "bg-white text-[#C8201C] shadow-[0_2px_8px_rgba(200,32,28,0.12)]"
                : "text-[#7A4541] hover:text-[#C8201C]",
            )}
          >
            <Icon size={16} stroke={2.2} />
            <span>{label}</span>
            {count > 0 && (
              <span
                className={cn(
                  "ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                  isActive
                    ? "bg-[#C8201C] text-white"
                    : "bg-white text-[#C8201C] ring-1 ring-[#F2D9D5]",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Incoming tab ---------------- */

function IncomingTab({
  orders,
  rejecting,
  onStartReject,
  onCancelReject,
  onAccept,
  onReject,
}: {
  orders: PendingOrder[];
  rejecting: string | null;
  onStartReject: (id: string) => void;
  onCancelReject: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (orders.length === 0) {
    return <EmptyState icon={IconCircleCheck} title="ไม่มีออเดอร์รอรับ" sub="ทำต่อได้สบาย ๆ" />;
  }
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((o) => (
        <IncomingCard
          key={o.id}
          order={o}
          rejecting={rejecting === o.id}
          onStartReject={() => onStartReject(o.id)}
          onCancelReject={onCancelReject}
          onAccept={() => onAccept(o.id)}
          onReject={() => onReject(o.id)}
        />
      ))}
    </div>
  );
}

function IncomingCard({
  order,
  rejecting,
  onStartReject,
  onCancelReject,
  onAccept,
  onReject,
}: {
  order: PendingOrder;
  rejecting: boolean;
  onStartReject: () => void;
  onCancelReject: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);
  return (
    <article className="relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-[#F2D9D5] shadow-[0_6px_24px_rgba(200,32,28,0.08)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C8201C] via-[#E63946] to-[#C8201C]" />

      <header className="flex items-start gap-3 p-5 pb-3">
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-[#C8201C] text-white shadow-[0_4px_12px_rgba(200,32,28,0.25)]">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-90">
            โต๊ะ
          </span>
          <span className="text-xl font-bold leading-none">{order.table}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#6B5A57]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8201C] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C8201C]" />
            </span>
            <span>เข้ามา {order.receivedAt}</span>
          </div>
          <div className="mt-0.5 truncate font-mono text-sm font-semibold text-[#1A1110]">
            {order.id}
          </div>
          <div className="mt-1 text-[12px] text-[#6B5A57]">
            ทั้งหมด <span className="font-bold text-[#1A1110]">{totalQty}</span>{" "}
            รายการ
          </div>
        </div>
      </header>

      {order.customerNote && (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-2xl bg-[#FFF1EE] px-3 py-2 ring-1 ring-[#FADADA]">
          <IconAlertTriangle size={14} className="mt-0.5 shrink-0 text-[#C8201C]" />
          <p className="text-[12px] leading-relaxed text-[#8B1410]">
            {order.customerNote}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-2 px-5 pb-4">
        {order.items.map((it) => (
          <li
            key={it.id}
            className="flex items-start gap-3 rounded-2xl bg-[#FBF5F4] px-3 py-2.5"
          >
            <span className="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-white text-sm font-bold text-[#C8201C] ring-1 ring-[#F2D9D5] tabular-nums">
              {it.quantity}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#1A1110]">
                {it.name}
              </div>
              {it.note && (
                <div className="mt-0.5 text-[11px] italic text-[#6B5A57]">
                  {it.note}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {!rejecting ? (
        <div className="mt-auto flex gap-2 border-t border-dashed border-[#F2D9D5] bg-[#FFFAF9] p-3">
          <button
            onClick={onStartReject}
            className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white text-sm font-bold text-[#8B1410] ring-1 ring-[#F2D9D5] transition active:scale-[0.98] hover:bg-[#FFF1EE]"
          >
            <IconX size={16} />
            ปฏิเสธ
          </button>
          <button
            onClick={onAccept}
            className="flex h-12 flex-[2] items-center justify-center gap-1.5 rounded-2xl bg-[#C8201C] text-sm font-bold text-white shadow-[0_4px_12px_rgba(200,32,28,0.25)] transition active:scale-[0.98] hover:bg-[#B11A17]"
          >
            <IconCheck size={18} />
            รับออเดอร์
          </button>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-2 border-t border-dashed border-[#F2D9D5] bg-[#FFF1EE] p-3">
          <div className="text-[12px] font-medium text-[#8B1410]">
            เลือกเหตุผลที่ปฏิเสธ
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REJECT_REASONS.map((r) => (
              <button
                key={r}
                onClick={onReject}
                className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#8B1410] ring-1 ring-[#F2D9D5] transition hover:bg-[#C8201C] hover:text-white hover:ring-[#C8201C]"
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={onCancelReject}
            className="self-start text-[11px] font-medium text-[#6B5A57] underline-offset-4 hover:underline"
          >
            ยกเลิก
          </button>
        </div>
      )}
    </article>
  );
}

/* ---------------- Cooking tab (receipt tickets) ---------------- */

function CookingTab({
  tickets,
  onToggleItem,
  onServe,
}: {
  tickets: ActiveTicket[];
  onToggleItem: (ticketId: string, itemId: string) => void;
  onServe: (id: string) => void;
}) {
  if (tickets.length === 0) {
    return <EmptyState icon={IconFlame} title="ยังไม่มีออเดอร์ในครัว" sub="กดรับออเดอร์ใหม่จากแท็บก่อนหน้า" />;
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tickets.map((t) => (
        <Ticket
          key={t.id}
          ticket={t}
          onToggleItem={(itemId) => onToggleItem(t.id, itemId)}
          onServe={() => onServe(t.id)}
        />
      ))}
    </div>
  );
}

function Ticket({
  ticket,
  onToggleItem,
  onServe,
}: {
  ticket: ActiveTicket;
  onToggleItem: (itemId: string) => void;
  onServe: () => void;
}) {
  const total = ticket.items.length;
  const done = ticket.items.filter((it) => it.status === "done").length;
  const allDone = done === total;

  return (
    <article className="relative">
      {/* Top tear */}
      <div
        className="h-3 bg-repeat-x"
        style={{ backgroundImage: TEAR_TOP, backgroundSize: "14px 12px" }}
        aria-hidden
      />
      <div className="-mt-px bg-white px-5 pt-3 pb-2 shadow-[0_8px_24px_rgba(200,32,28,0.10)]">
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C8201C]">
            Kitchen Order
          </div>
          <div className="mt-0.5 text-sm font-bold text-[#1A1110]">
            แซ่บกลางซอย
          </div>
        </div>

        <Dashed />

        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#6B5A57]">
            โต๊ะหมายเลข
          </div>
          <div className="text-[40px] font-extrabold leading-none text-[#1A1110]">
            {ticket.table}
          </div>
        </div>

        <div className="mt-3 flex justify-between font-mono text-[11px] text-[#6B5A57]">
          <span>{ticket.id}</span>
          <span>รับ {ticket.acceptedAt}</span>
        </div>

        <Dashed />

        <ul className="flex flex-col gap-1.5 text-[13px]">
          {ticket.items.map((it) => {
            const isDone = it.status === "done";
            return (
              <li key={it.id}>
                <button
                  onClick={() => onToggleItem(it.id)}
                  className={cn(
                    "group flex w-full items-start gap-2 rounded-xl px-2 py-1.5 text-left transition",
                    isDone ? "bg-[#F5F5F4]" : "hover:bg-[#FFF1EE]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 transition",
                      isDone
                        ? "bg-[#1A1110] text-white ring-[#1A1110]"
                        : "bg-white text-transparent ring-[#F2D9D5] group-hover:ring-[#C8201C]",
                    )}
                  >
                    <IconCheck size={12} stroke={3} />
                  </span>
                  <span
                    className={cn(
                      "flex w-7 shrink-0 items-baseline justify-center rounded-md bg-[#C8201C] py-0.5 text-xs font-bold tabular-nums text-white",
                      isDone && "bg-[#A8A29E]",
                    )}
                  >
                    {it.quantity}×
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "truncate font-semibold text-[#1A1110]",
                        isDone && "text-[#A8A29E] line-through",
                      )}
                    >
                      {it.name}
                    </div>
                    {it.note && (
                      <div
                        className={cn(
                          "text-[11px] italic text-[#6B5A57]",
                          isDone && "text-[#C7C2BF]",
                        )}
                      >
                        ↳ {it.note}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <Dashed />

        <div className="flex items-center justify-between text-[11px] text-[#6B5A57]">
          <span>ความคืบหน้า</span>
          <span className="font-mono font-bold text-[#1A1110] tabular-nums">
            {done}/{total}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F5E6E3]">
          <div
            className="h-full bg-[#C8201C] transition-[width]"
            style={{ width: `${total === 0 ? 0 : (done / total) * 100}%` }}
          />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1A1110] ring-1 ring-[#F2D9D5] transition active:scale-95 hover:bg-[#FFF1EE]"
            aria-label="พิมพ์"
          >
            <IconPrinter size={16} />
          </button>
          <button
            onClick={onServe}
            disabled={!allDone}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition active:scale-[0.98]",
              allDone
                ? "bg-[#C8201C] text-white shadow-[0_4px_12px_rgba(200,32,28,0.25)] hover:bg-[#B11A17]"
                : "bg-[#FBEEEC] text-[#C8C0BE] cursor-not-allowed",
            )}
          >
            <IconReceipt2 size={16} />
            {allDone ? "ส่งครัว → เสิร์ฟ" : "ทำยังไม่ครบ"}
          </button>
        </div>
      </div>
      {/* Bottom tear */}
      <div
        className="-mt-px h-3 bg-repeat-x"
        style={{ backgroundImage: TEAR_BOTTOM, backgroundSize: "14px 12px" }}
        aria-hidden
      />
    </article>
  );
}

function Dashed() {
  return <div className="my-2.5 border-t border-dashed border-[#E5C2BD]" />;
}

/* ---------------- Stock tab ---------------- */

function StockTab({
  stock,
  query,
  onQueryChange,
  onAdjust,
  onToggle,
}: {
  stock: StockItem[];
  query: string;
  onQueryChange: (v: string) => void;
  onAdjust: (id: string, delta: number) => void;
  onToggle: (id: string) => void;
}) {
  const filtered = stock.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.linkedDishes.some((d) => d.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-2xl bg-white px-4 ring-1 ring-[#F2D9D5] focus-within:ring-[#C8201C]">
          <IconSearch size={16} className="text-[#6B5A57]" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="ค้นหาวัตถุดิบ หรือชื่อเมนู..."
            className="flex-1 bg-transparent text-sm text-[#1A1110] placeholder:text-[#A8A29E] focus:outline-none"
          />
        </div>
        <button className="flex h-11 items-center gap-2 rounded-2xl bg-[#C8201C] px-4 text-sm font-bold text-white shadow-[0_4px_12px_rgba(200,32,28,0.25)] transition active:scale-95 hover:bg-[#B11A17]">
          <IconPlus size={16} />
          เพิ่มวัตถุดิบ
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#F2D9D5] shadow-[0_4px_16px_rgba(200,32,28,0.06)]">
        <div className="grid grid-cols-[1fr_120px_180px_180px_120px] gap-4 border-b border-[#F2D9D5] bg-[#FBEEEC] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8B1410]">
          <div>วัตถุดิบ</div>
          <div className="text-right">คงเหลือ</div>
          <div>สถานะ</div>
          <div className="text-center">ปรับสต็อก</div>
          <div className="text-right">เมนู</div>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-[#6B5A57]">
            ไม่เจอวัตถุดิบที่ค้นหา
          </div>
        )}
        {filtered.map((s, idx) => {
          const isOut = s.outOfStock || s.quantity === 0;
          const isLow = !isOut && s.quantity <= s.threshold;
          const statusTone = isOut
            ? "bg-[#C8201C] text-white"
            : isLow
              ? "bg-[#FFF1EE] text-[#8B1410] ring-1 ring-[#FADADA]"
              : "bg-[#F0F7EE] text-muted-foreground ring-1 ring-[#D4E7C5]";
          const statusLabel = isOut ? "หมด" : isLow ? "ใกล้หมด" : "พร้อมใช้";
          return (
            <div
              key={s.id}
              className={cn(
                "grid grid-cols-[1fr_120px_180px_180px_120px] items-center gap-4 px-5 py-3.5 text-sm",
                idx !== filtered.length - 1 && "border-b border-[#F7E6E3]",
                isOut && "bg-[#FFFAF9]",
              )}
            >
              <div className="flex items-center gap-3">
                {(isOut || isLow) && (
                  <span className="h-8 w-1 rounded-full bg-[#C8201C]" />
                )}
                <div>
                  <div className="font-semibold text-[#1A1110]">{s.name}</div>
                  <div className="text-[11px] text-[#6B5A57]">
                    เตือนเมื่อต่ำกว่า {s.threshold} {s.unit}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-[#1A1110] tabular-nums">
                  {s.quantity}
                </span>
                <span className="ml-1 text-[11px] text-[#6B5A57]">{s.unit}</span>
              </div>
              <div>
                <button
                  onClick={() => onToggle(s.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold transition",
                    statusTone,
                  )}
                >
                  {statusLabel}
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={() => onAdjust(s.id, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#1A1110] ring-1 ring-[#F2D9D5] transition active:scale-95 hover:bg-[#FFF1EE]"
                  aria-label="ลด"
                >
                  <IconMinus size={14} />
                </button>
                <button
                  onClick={() => onAdjust(s.id, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8201C] text-white transition active:scale-95 hover:bg-[#B11A17]"
                  aria-label="เพิ่ม"
                >
                  <IconPlus size={14} />
                </button>
              </div>
              <div className="text-right text-[11px] text-[#6B5A57]">
                {s.linkedDishes.length > 0 ? (
                  <span title={s.linkedDishes.join(", ")}>
                    {s.linkedDishes[0]}
                    {s.linkedDishes.length > 1 && (
                      <span className="text-[#C8201C]">
                        {" "}
                        +{s.linkedDishes.length - 1}
                      </span>
                    )}
                  </span>
                ) : (
                  "—"
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Empty state ---------------- */

function EmptyState({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof IconCircleCheck;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-3xl bg-white ring-1 ring-[#F2D9D5] py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1EE] text-[#C8201C]">
        <Icon size={28} />
      </div>
      <div className="text-lg font-bold text-[#1A1110]">{title}</div>
      <div className="text-sm text-[#6B5A57]">{sub}</div>
    </div>
  );
}
