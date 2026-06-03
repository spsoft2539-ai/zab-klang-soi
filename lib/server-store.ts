// Server-only in-memory singleton.
// globalThis ensures the singleton survives Next.js hot-reload in dev.
// Do NOT import this file in client components.

export type TableStatus = "available" | "active" | "preparing" | "billing";
export type Zone = "A" | "B" | "C" | "D";

export interface StoreTable {
  id: string;
  zone: Zone;
  seats: number;
  status: TableStatus;
  openedAt?: string;
  guests?: number;
}

export interface StoreOrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface StoreOrder {
  id: string;
  tableId: string;
  items: StoreOrderItem[];
  orderedAt: string; // human-readable "HH:MM"
  createdAt: number; // unix ms — used for ?since= polling
  printed: boolean;
}

export interface StoreMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tag?: "เผ็ด" | "ฮิต" | "โปร";
  image: string;
}

export interface StoreSettings {
  restaurantName: string;
  cuisine: string;
  openTime: string;
  closeTime: string;
  vatRate: number; // percentage e.g. 7
  serviceCharge: number; // percentage e.g. 0
}

export interface StoreBill {
  id: string;           // "BILL-{timestamp}"
  tableId: string;
  closedAt: string;     // "HH:MM"
  closedAtMs: number;   // unix ms — for sorting & since-filtering
  items: StoreOrderItem[];
  subtotal: number;
  vatRate: number;      // snapshot of rate at close time
  vat: number;
  serviceCharge: number; // snapshot of rate
  serviceAmt: number;
  total: number;
  guests?: number;
  paymentMethod?: "cash" | "transfer";
  cashReceived?: number;
  change?: number;
}

// ─── Seed data ────────────────────────────────────────────────

const INITIAL_TABLES: StoreTable[] = [
  { id: "A1", zone: "A", seats: 2, status: "available" },
  { id: "A2", zone: "A", seats: 2, status: "available" },
  { id: "A3", zone: "A", seats: 2, status: "available" },
  { id: "A4", zone: "A", seats: 4, status: "available" },
  { id: "B1", zone: "B", seats: 4, status: "available" },
  { id: "B2", zone: "B", seats: 4, status: "available" },
  { id: "B3", zone: "B", seats: 4, status: "available" },
  { id: "B4", zone: "B", seats: 4, status: "available" },
  { id: "C1", zone: "C", seats: 6, status: "available" },
  { id: "C2", zone: "C", seats: 6, status: "available" },
  { id: "C3", zone: "C", seats: 6, status: "available" },
  { id: "C4", zone: "C", seats: 6, status: "available" },
  { id: "D1", zone: "D", seats: 2, status: "available" },
  { id: "D2", zone: "D", seats: 2, status: "available" },
  { id: "D3", zone: "D", seats: 4, status: "available" },
  { id: "D4", zone: "D", seats: 4, status: "available" },
];

const INITIAL_MENU: StoreMenuItem[] = [
  { id: "tom-yum-goong", name: "ต้มยำกุ้งน้ำข้น", description: "กุ้งแม่น้ำ น้ำข้นหอมอบอุ่น เผ็ดกำลังดี", price: 189, category: "ยอดฮิต", tag: "เผ็ด", image: "https://placehold.co/160x160/FADADD/E12717?text=🍲" },
  { id: "moo-kratha", name: "หมูกระทะรวมมิตร", description: "หมูโสร่ง หมู กุ้ง แกะสด พร้อมน้ำจิ้ม", price: 259, category: "ยอดฮิต", tag: "ฮิต", image: "https://placehold.co/160x160/FAE0C8/C45C00?text=🥘" },
  { id: "seafood-set", name: "ชุดซีฟู้ดแซ่บ", description: "กุ้ง หอย ปลาหมึก เสิร์ฟพร้อมน้ำจิ้มซีฟู้ด", price: 899, category: "ยอดฮิต", tag: "โปร", image: "https://placehold.co/160x160/D0EAF8/0066AA?text=🦐" },
  { id: "tilapia-steam", name: "ปลากะพงนึ่งมะนาว", description: "ปลาสดนึ่งร้อน ราดน้ำมะนาวพริกสด", price: 320, category: "ทะเล", image: "https://placehold.co/160x160/D5F0D5/2E7D32?text=🐟" },
  { id: "seafood-hotpot", name: "หม้อไฟทะเล", description: "รวมอาหารทะเลสดในน้ำซุปแซ่บ", price: 459, category: "ทะเล", image: "https://placehold.co/160x160/FAE8D0/C45C00?text=🍜" },
  { id: "salt-fish", name: "ปลาเผาเกลือ", description: "ปลาสดเผาเกลือ หอมกรอบนอกนุ่มใน", price: 380, category: "ทะเล", image: "https://placehold.co/160x160/F5F0DC/8D6E00?text=🐠" },
  { id: "grilled-shrimp", name: "กุ้งเผา", description: "กุ้งสดเผาไฟ เสิร์ฟพร้อมน้ำจิ้มซีฟู้ด", price: 420, category: "ทะเล", image: "https://placehold.co/160x160/FADADD/E12717?text=🦞" },
  { id: "somtum", name: "ส้มตำไทย", description: "ส้มตำสูตรต้นตำรับ เผ็ดถึงใจ", price: 80, category: "ทานเล่น", tag: "เผ็ด", image: "https://placehold.co/160x160/EAF5DA/4CAF50?text=🥗" },
  { id: "stir-veg", name: "ผัดผักรวมมิตร", description: "ผักสดหลากหลาย ผัดน้ำมันหอย", price: 120, category: "ทานเล่น", image: "https://placehold.co/160x160/E8F5E9/388E3C?text=🥦" },
  { id: "grilled-chicken", name: "ไก่ย่างสมุนไพร", description: "ไก่หมักน้ำมัน เครื่องเทศ ย่างหอมอบอุ่น", price: 220, category: "เนื้อสัตว์", image: "https://placehold.co/160x160/FFF3CD/FF8F00?text=🍗" },
  { id: "crab-rice", name: "ข้าวผัดปู", description: "ข้าวผัดผัดกับ เนื้อปูก้อน ไข่ไก่สด", price: 189, category: "ข้าว/เส้น", image: "https://placehold.co/160x160/FEF9E0/F57F17?text=🍚" },
  { id: "shrimp-rice", name: "ข้าวผัดกุ้ง", description: "ข้าวผัดหอม กุ้งสด ไข่ดาวด้านบน", price: 160, category: "ข้าว/เส้น", image: "https://placehold.co/160x160/FFF8E1/F9A825?text=🍛" },
  { id: "water-melon", name: "น้ำมะนาวโซดา", description: "มะนาวสด ซ่าเย็น เติมมิ้นต์โซดา", price: 65, category: "เครื่องดื่ม", image: "https://placehold.co/160x160/E8F5E9/1B5E20?text=🍋" },
  { id: "cold-water", name: "น้ำปล่าเย็น", description: "บรรจุขวด เย็นพร้อมน้ำแข็ง", price: 35, category: "เครื่องดื่ม", image: "https://placehold.co/160x160/E3F2FD/1565C0?text=💧" },
];

const INITIAL_SETTINGS: StoreSettings = {
  restaurantName: "แซ่บกลางซอย",
  cuisine: "อีสาน · ซีฟู้ด · หมูกระทะ",
  openTime: "11:00",
  closeTime: "22:00",
  vatRate: 7,
  serviceCharge: 0,
};

// ─── GlobalThis store ─────────────────────────────────────────

const g = globalThis as typeof globalThis & {
  _zabTables?: StoreTable[];
  _zabOrders?: StoreOrder[];
  _zabBills?: StoreBill[];
  _zabMenu?: StoreMenuItem[];
  _zabCategories?: string[];
  _zabSettings?: StoreSettings;
};

function thaiTime(): string {
  return new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  });
}

function tables(): StoreTable[] {
  if (!g._zabTables) g._zabTables = structuredClone(INITIAL_TABLES);
  return g._zabTables;
}

function orders(): StoreOrder[] {
  if (!g._zabOrders) g._zabOrders = [];
  return g._zabOrders;
}

function bills(): StoreBill[] {
  if (!g._zabBills) g._zabBills = [];
  return g._zabBills;
}

function menuItems(): StoreMenuItem[] {
  if (!g._zabMenu) g._zabMenu = structuredClone(INITIAL_MENU);
  return g._zabMenu;
}

function categories(): string[] {
  if (!g._zabCategories) {
    g._zabCategories = [...new Set(menuItems().map((m) => m.category))];
  }
  return g._zabCategories;
}

function settings(): StoreSettings {
  if (!g._zabSettings) g._zabSettings = structuredClone(INITIAL_SETTINGS);
  return g._zabSettings;
}

// ─── Store ────────────────────────────────────────────────────

export const serverStore = {
  tables: {
    getAll: () => tables(),
    get: (id: string) => tables().find((t) => t.id === id),

    open(id: string, guests: number): StoreTable | null {
      const t = this.get(id);
      if (!t || t.status !== "available") return null;
      Object.assign(t, { status: "active" as TableStatus, openedAt: thaiTime(), guests });
      return t;
    },

    setStatus(id: string, status: TableStatus): StoreTable | null {
      const t = this.get(id);
      if (!t) return null;
      t.status = status;
      return t;
    },

    close(
      id: string,
      payment?: { method?: "cash" | "transfer"; cashReceived?: number },
    ): boolean {
      const list = tables();
      const idx = list.findIndex((t) => t.id === id);
      if (idx === -1) return false;
      const tableRow = list[idx];

      // Collect all items from all orders for this table
      const tableOrders = orders().filter((o) => o.tableId === id);
      const allItems: StoreOrderItem[] = tableOrders.flatMap((o) => o.items);

      if (allItems.length > 0) {
        const s = settings();
        const subtotal = allItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const vatRate = s.vatRate;
        const serviceCharge = s.serviceCharge;
        const vat = Math.round(subtotal * (vatRate / 100));
        const serviceAmt = Math.round(subtotal * (serviceCharge / 100));
        const total = subtotal + vat + serviceAmt;
        const nowMs = Date.now();
        const bill: StoreBill = {
          id: `BILL-${nowMs}`,
          tableId: id,
          closedAt: thaiTime(),
          closedAtMs: nowMs,
          items: allItems,
          subtotal,
          vatRate,
          vat,
          serviceCharge,
          serviceAmt,
          total,
          guests: tableRow.guests,
          paymentMethod: payment?.method,
          cashReceived: payment?.cashReceived,
          change:
            payment?.method === "cash" && payment.cashReceived !== undefined
              ? Math.max(0, payment.cashReceived - total)
              : undefined,
        };
        bills().push(bill);
      }

      const { id: tid, zone, seats } = tableRow;
      list[idx] = { id: tid, zone, seats, status: "available" };
      g._zabOrders = orders().filter((o) => o.tableId !== id);
      return true;
    },

    add(id: string, zone: Zone, seats: number): StoreTable | null {
      if (tables().find((t) => t.id === id)) return null; // duplicate
      const t: StoreTable = { id, zone, seats, status: "available" };
      tables().push(t);
      return t;
    },

    update(id: string, patch: Partial<Pick<StoreTable, "seats" | "zone">>): StoreTable | null {
      const t = this.get(id);
      if (!t) return null;
      if (patch.seats !== undefined) t.seats = patch.seats;
      if (patch.zone !== undefined) t.zone = patch.zone;
      return t;
    },

    remove(id: string): boolean {
      const t = this.get(id);
      if (!t || t.status !== "available") return false; // only delete available tables
      g._zabTables = tables().filter((t) => t.id !== id);
      return true;
    },
  },

  orders: {
    getAll: () => orders(),
    since: (ts: number) => orders().filter((o) => o.createdAt > ts),
    byTable: (tableId: string) => orders().filter((o) => o.tableId === tableId),

    submit(tableId: string, items: StoreOrderItem[]): StoreOrder {
      const now = Date.now();
      const order: StoreOrder = {
        id: `ORD-${now}`,
        tableId,
        items,
        orderedAt: thaiTime(),
        createdAt: now,
        printed: false,
      };
      orders().push(order);

      // Auto-promote table status
      const t = serverStore.tables.get(tableId);
      if (t && (t.status === "active" || t.status === "available")) {
        t.status = "preparing";
        if (!t.openedAt) { t.openedAt = order.orderedAt; t.guests = 1; }
      }
      return order;
    },

    markPrinted(id: string) {
      const o = orders().find((o) => o.id === id);
      if (o) o.printed = true;
    },
  },

  categories: {
    getAll: () => categories(),

    add(name: string): boolean {
      const cats = categories();
      if (cats.includes(name)) return false;
      cats.push(name);
      return true;
    },

    rename(oldName: string, newName: string): boolean {
      const cats = categories();
      const idx = cats.indexOf(oldName);
      if (idx === -1 || cats.includes(newName)) return false;
      cats[idx] = newName;
      menuItems().forEach((m) => { if (m.category === oldName) m.category = newName; });
      return true;
    },

    remove(name: string): boolean {
      // Prevent deletion if any menu item still uses this category
      if (menuItems().some((m) => m.category === name)) return false;
      const cats = categories();
      const idx = cats.indexOf(name);
      if (idx === -1) return false;
      cats.splice(idx, 1);
      return true;
    },
  },

  menu: {
    getAll: () => menuItems(),
    get: (id: string) => menuItems().find((m) => m.id === id),
    categories: () => [...new Set(menuItems().map((m) => m.category))],

    add(item: Omit<StoreMenuItem, "id">): StoreMenuItem {
      const id = `menu-${Date.now()}`;
      const m: StoreMenuItem = { id, ...item };
      menuItems().push(m);
      // Auto-register the category if new
      if (!categories().includes(item.category)) categories().push(item.category);
      return m;
    },

    update(id: string, patch: Partial<Omit<StoreMenuItem, "id">>): StoreMenuItem | null {
      const m = this.get(id);
      if (!m) return null;
      Object.assign(m, patch);
      return m;
    },

    remove(id: string): boolean {
      if (!this.get(id)) return false;
      g._zabMenu = menuItems().filter((m) => m.id !== id);
      return true;
    },
  },

  bills: {
    getAll: () => bills(),
    since: (ts: number) => bills().filter((b) => b.closedAtMs > ts),
    today: () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return bills().filter((b) => b.closedAtMs >= startOfDay.getTime());
    },
  },

  settings: {
    get: () => settings(),
    update(patch: Partial<StoreSettings>): StoreSettings {
      Object.assign(settings(), patch);
      return settings();
    },
  },
};
