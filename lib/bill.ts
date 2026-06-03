// Shared bill types, data, and cookie helpers used by both
// the menu page (/) and the cart page (/cart).

export type Category =
  | "ทั้งหมด"
  | "ยอดฮิต"
  | "โปรโมชั่น"
  | "ชุดสุดคุ้ม"
  | "เนื้อสัตว์"
  | "ทะเล"
  | "ของทานเล่น"
  | "เครื่องดื่ม";

export type BillStatus = "open" | "ordered" | "closing";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, "ทั้งหมด">;
  price: number;
  image: string;
  tag?: "เผ็ด" | "ฮิต" | "โปร";
}

export interface BillLine {
  id: string;
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  addedAt: string;
}

export interface BillState {
  version: 1;
  billNo: string;
  tableNo: string;
  openedAt: string;
  updatedAt: string;
  status: BillStatus;
  orderedAt?: string;
  billingRequestedAt?: string;
  lines: BillLine[];
}

export const COOKIE_NAME = "zab_klang_soi_bill";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const VAT_RATE = 0.07;

export const CATEGORIES: Category[] = [
  "ทั้งหมด",
  "ยอดฮิต",
  "โปรโมชั่น",
  "ชุดสุดคุ้ม",
  "เนื้อสัตว์",
  "ทะเล",
  "ของทานเล่น",
  "เครื่องดื่ม",
];

export const MENU: MenuItem[] = [
  {
    id: "tom-yum-goong",
    name: "ต้มยำกุ้งน้ำข้น",
    description: "กุ้งแม่น้ำ น้ำข้นหอมมัน เผ็ดกำลังดี",
    category: "ยอดฮิต",
    price: 189,
    image: "https://placehold.co/160x160/fee2e2/7f1d1d.png",
    tag: "เผ็ด",
  },
  {
    id: "moo-kratha",
    name: "หมูกระทะรวมมิตร",
    description: "หมูสไลซ์ หมึก กุ้ง ผักสด พร้อมน้ำจิ้ม",
    category: "ชุดสุดคุ้ม",
    price: 259,
    image: "https://placehold.co/160x160/ffedd5/7c2d12.png",
    tag: "ฮิต",
  },
  {
    id: "seafood-set",
    name: "ชุดซีฟู้ดแซ่บ",
    description: "กุ้ง หอย ปลาหมึก เสิร์ฟพร้อมน้ำจิ้มซีฟู้ด",
    category: "โปรโมชั่น",
    price: 899,
    image: "https://placehold.co/160x160/dbeafe/1e3a8a.png",
    tag: "โปร",
  },
  {
    id: "steamed-fish",
    name: "ปลาทับทิมนึ่งมะนาว",
    description: "ปลาสดนึ่งร้อน ราดน้ำมะนาวพริกสด",
    category: "ทะเล",
    price: 320,
    image: "https://placehold.co/160x160/dcfce7/14532d.png",
  },
  {
    id: "som-tam-thai",
    name: "ส้มตำไทย",
    description: "เปรี้ยวหวานนัว ถั่วคั่วใหม่ มะละกอกรอบ",
    category: "ของทานเล่น",
    price: 80,
    image: "https://placehold.co/160x160/fef9c3/713f12.png",
    tag: "เผ็ด",
  },
  {
    id: "grilled-chicken",
    name: "ไก่ย่างสมุนไพร",
    description: "ไก่หมักข้ามคืน ย่างหนังตึง เนื้อนุ่ม",
    category: "เนื้อสัตว์",
    price: 220,
    image: "https://placehold.co/160x160/fef3c7/78350f.png",
  },
  {
    id: "crab-fried-rice",
    name: "ข้าวผัดปู",
    description: "ข้าวหอมผัดแห้ง เนื้อปูก้อน ไข่แน่น",
    category: "ทะเล",
    price: 189,
    image: "https://placehold.co/160x160/e0f2fe/0c4a6e.png",
  },
  {
    id: "lime-soda",
    name: "น้ำมะนาวโซดา",
    description: "มะนาวสด ซ่าเย็น ตัดเผ็ดได้ดี",
    category: "เครื่องดื่ม",
    price: 65,
    image: "https://placehold.co/160x160/ecfccb/365314.png",
  },
  {
    id: "water",
    name: "น้ำเปล่าเย็น",
    description: "ขวดใหญ่ แช่เย็นพร้อมน้ำแข็ง",
    category: "เครื่องดื่ม",
    price: 35,
    image: "https://placehold.co/160x160/e0f2fe/075985.png",
  },
];

// ─── Helpers ────────────────────────────────────────────────

export function nowLabel() {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function createBillNo() {
  return `T1-${String(Date.now()).slice(-6)}`;
}

export function createFreshBill(): BillState {
  const openedAt = nowLabel();
  return {
    version: 1,
    billNo: createBillNo(),
    tableNo: "1",
    openedAt,
    updatedAt: openedAt,
    status: "open",
    lines: [],
  };
}

export function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : undefined;
}

export function writeBillCookie(bill: BillState) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(bill),
  )}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
}

function isBillStatus(value: unknown): value is BillStatus {
  return value === "open" || value === "ordered" || value === "closing";
}

function normalizeBill(value: unknown): BillState | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Partial<BillState>;
  const lines: BillLine[] = [];

  if (Array.isArray(raw.lines)) {
    raw.lines.forEach((line) => {
      const match = MENU.find((item) => item.id === line?.menuId);
      const quantity = Number(line?.quantity);

      if (!match || !Number.isFinite(quantity) || quantity <= 0) return;

      lines.push({
        id: match.id,
        menuId: match.id,
        name: match.name,
        price: match.price,
        quantity: Math.min(99, Math.floor(quantity)),
        image: match.image,
        category: match.category,
        addedAt: typeof line?.addedAt === "string" ? line.addedAt : nowLabel(),
      });
    });
  }

  return {
    version: 1,
    billNo: typeof raw.billNo === "string" ? raw.billNo : createBillNo(),
    tableNo: typeof raw.tableNo === "string" ? raw.tableNo : "1",
    openedAt: typeof raw.openedAt === "string" ? raw.openedAt : nowLabel(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : nowLabel(),
    status: isBillStatus(raw.status) ? raw.status : "open",
    orderedAt: typeof raw.orderedAt === "string" ? raw.orderedAt : undefined,
    billingRequestedAt:
      typeof raw.billingRequestedAt === "string"
        ? raw.billingRequestedAt
        : undefined,
    lines,
  };
}

export function readStoredBill(): BillState {
  const value = readCookie(COOKIE_NAME);
  if (!value) return createFreshBill();
  try {
    const bill = normalizeBill(JSON.parse(value));
    return bill ?? createFreshBill();
  } catch {
    return createFreshBill();
  }
}

export function formatCurrency(value: number) {
  return `฿${value.toLocaleString("th-TH")}`;
}

export function getLineCount(lines: BillLine[]) {
  return lines.reduce((sum, item) => sum + item.quantity, 0);
}

export function getSubtotal(lines: BillLine[]) {
  return lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
