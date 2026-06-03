"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft, IconBuilding, IconCheck, IconChefHat,
  IconPencil, IconPhoto, IconPlus, IconTableColumn, IconTag, IconTrash, IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  apiFetchSettings, apiUpdateSettings,
  apiFetchMenu, apiAddMenuItem, apiUpdateMenuItem, apiDeleteMenuItem,
  apiFetchCategories, apiAddCategory, apiRenameCategory, apiDeleteCategory,
  apiFetchTables, apiAddTable, apiUpdateTableConfig, apiDeleteTable,
  type StoreSettings, type StoreMenuItem, type StoreTable, type Zone,
} from "@/lib/api";

type Tab = "info" | "menu" | "tables";

const ZONES: Zone[] = ["A", "B", "C", "D"];
const TAGS = ["", "เผ็ด", "ฮิต", "โปร"] as const;

/* ══════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("info");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-white px-6 py-4">
        <Link
          href="/cashier"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-background ring-1 ring-border transition-colors hover:bg-muted"
        >
          <IconArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Cashier</p>
          <h1 className="text-[17px] font-bold text-foreground">การตั้งค่าร้าน</h1>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border bg-white px-6">
        {([
          { id: "info", label: "ข้อมูลร้าน", icon: IconBuilding },
          { id: "menu", label: "จัดการเมนู", icon: IconChefHat },
          { id: "tables", label: "จัดการโต๊ะ", icon: IconTableColumn },
        ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-3 text-[13px] font-medium transition-colors",
              tab === id
                ? "border-[#E12717] text-[#E12717]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "info" && <InfoTab />}
        {tab === "menu" && <MenuTab />}
        {tab === "tables" && <TablesTab />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* Tab 1 — ข้อมูลร้าน                                           */
/* ══════════════════════════════════════════════════════════════ */
function InfoTab() {
  const [form, setForm] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetchSettings().then(setForm).catch(() => {});
  }, []);

  const set = (key: keyof StoreSettings, value: string | number) =>
    setForm((f) => f ? { ...f, [key]: value } : f);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await apiUpdateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p className="p-8 text-center text-sm text-muted-foreground">กำลังโหลด...</p>;

  return (
    <div className="mx-auto max-w-xl px-6 py-6 space-y-5">
      <Field label="ชื่อร้าน">
        <input value={form.restaurantName} onChange={(e) => set("restaurantName", e.target.value)}
          className={inputCls} />
      </Field>
      <Field label="ประเภทอาหาร / คำอธิบาย">
        <input value={form.cuisine} onChange={(e) => set("cuisine", e.target.value)}
          placeholder="เช่น อีสาน · ซีฟู้ด · หมูกระทะ" className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="เวลาเปิด">
          <input type="time" value={form.openTime} onChange={(e) => set("openTime", e.target.value)}
            className={inputCls} />
        </Field>
        <Field label="เวลาปิด">
          <input type="time" value={form.closeTime} onChange={(e) => set("closeTime", e.target.value)}
            className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="VAT (%)">
          <input type="number" min={0} max={30} value={form.vatRate}
            onChange={(e) => set("vatRate", Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="ค่าบริการ (%)">
          <input type="number" min={0} max={30} value={form.serviceCharge}
            onChange={(e) => set("serviceCharge", Number(e.target.value))} className={inputCls} />
        </Field>
      </div>

      <button type="button" onClick={save} disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(225,39,23,0.25)] disabled:opacity-60">
        {saved ? <><IconCheck size={17} /> บันทึกแล้ว!</> : saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* Tab 2 — จัดการเมนู                                           */
/* ══════════════════════════════════════════════════════════════ */
function MenuTab() {
  const [items, setItems] = useState<StoreMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [editing, setEditing] = useState<StoreMenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showCatMgr, setShowCatMgr] = useState(false);

  const loadMenu = () => apiFetchMenu().then(setItems).catch(() => {});
  const loadCats = () => apiFetchCategories().then(setCategories).catch(() => {});

  useEffect(() => {
    loadMenu();
    loadCats();
  }, []);

  const handleSave = async (data: Omit<StoreMenuItem, "id"> & { id?: string }) => {
    if (data.id) {
      const { id, ...patch } = data;
      await apiUpdateMenuItem(id, patch);
    } else {
      await apiAddMenuItem(data as Omit<StoreMenuItem, "id">);
    }
    await loadMenu();
    await loadCats(); // category might have been added
    setEditing(null);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบเมนูนี้?")) return;
    await apiDeleteMenuItem(id);
    await loadMenu();
  };

  // Group items by category, preserving category order
  const grouped = categories
    .map((cat) => ({ cat, catItems: items.filter((i) => i.category === cat) }))
    .concat(
      // Items with categories not in the list (edge case)
      [...new Set(items.filter((i) => !categories.includes(i.category)).map((i) => i.category))]
        .map((cat) => ({ cat, catItems: items.filter((i) => i.category === cat) })),
    );

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">{items.length} รายการในระบบ</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowCatMgr((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-colors",
              showCatMgr
                ? "border-[#E12717]/30 bg-[#FFF3F0] text-[#E12717]"
                : "border-border bg-white text-muted-foreground hover:text-foreground",
            )}>
            <IconTag size={14} />
            หมวดหมู่
          </button>
          <button type="button" onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(225,39,23,0.25)]">
            <IconPlus size={15} /> เพิ่มเมนูใหม่
          </button>
        </div>
      </div>

      {/* Category manager */}
      {showCatMgr && (
        <CategoryManager
          categories={categories}
          onChanged={() => { loadCats(); loadMenu(); }}
        />
      )}

      {/* Menu list grouped by category */}
      {grouped.map(({ cat, catItems }) => (
        catItems.length === 0 ? null : (
          <div key={cat} className="mb-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{cat}</p>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm">
                  {/* Thumbnail */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name}
                        className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <IconPhoto size={18} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-semibold text-foreground">{item.name}</p>
                      {item.tag && (
                        <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          item.tag === "เผ็ด" && "bg-red-50 text-red-600",
                          item.tag === "ฮิต" && "bg-green-50 text-green-700",
                          item.tag === "โปร" && "bg-amber-50 text-amber-700",
                        )}>{item.tag}</span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="shrink-0 text-[14px] font-bold text-[#E12717] tabular-nums">฿{item.price.toLocaleString()}</p>
                  <button type="button" onClick={() => setEditing(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-foreground ring-1 ring-border">
                    <IconPencil size={14} />
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-red-200">
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {(isAdding || editing) && (
        <MenuFormModal
          initial={editing ?? undefined}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setEditing(null); setIsAdding(false); }}
        />
      )}
    </div>
  );
}

/* ─── Category Manager ──────────────────────────────────────── */
function CategoryManager({
  categories,
  onChanged,
}: {
  categories: string[];
  onChanged: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [error, setError] = useState("");

  const add = async () => {
    setError("");
    if (!newName.trim()) return;
    try {
      await apiAddCategory(newName.trim());
      setNewName("");
      onChanged();
    } catch {
      setError("หมวดหมู่นี้มีอยู่แล้ว");
    }
  };

  const rename = async (old: string) => {
    if (!renameVal.trim() || renameVal.trim() === old) { setRenaming(null); return; }
    try {
      await apiRenameCategory(old, renameVal.trim());
      setRenaming(null);
      onChanged();
    } catch {
      setError("ไม่สามารถเปลี่ยนชื่อได้");
    }
  };

  const remove = async (name: string) => {
    try {
      await apiDeleteCategory(name);
      onChanged();
    } catch {
      setError(`"${name}" ยังมีเมนูอยู่ — ลบเมนูออกก่อน`);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="mb-3 text-[13px] font-semibold text-foreground">จัดการหมวดหมู่</p>

      {/* Add new */}
      <div className="mb-3 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="ชื่อหมวดหมู่ใหม่..."
          className={cn(inputCls, "flex-1")}
        />
        <button type="button" onClick={add}
          className="flex items-center gap-1 rounded-xl bg-foreground px-3 py-2 text-[12px] font-semibold text-white">
          <IconPlus size={14} /> เพิ่ม
        </button>
      </div>

      {error && (
        <p className="mb-2 text-[11px] text-red-500">{error}</p>
      )}

      {/* List */}
      <div className="space-y-1.5">
        {categories.map((cat) => (
          <div key={cat} className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
            {renaming === cat ? (
              <>
                <input
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") rename(cat); if (e.key === "Escape") setRenaming(null); }}
                  autoFocus
                  className="flex-1 rounded-lg border border-border bg-white px-2 py-1 text-[12px] text-foreground focus:outline-none"
                />
                <button type="button" onClick={() => rename(cat)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <IconCheck size={12} />
                </button>
                <button type="button" onClick={() => setRenaming(null)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted-foreground/20 text-foreground">
                  <IconX size={12} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-[13px] font-medium text-foreground">{cat}</span>
                <button type="button"
                  onClick={() => { setRenaming(cat); setRenameVal(cat); setError(""); }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-muted-foreground ring-1 ring-border hover:text-foreground">
                  <IconPencil size={13} />
                </button>
                <button type="button"
                  onClick={() => { setError(""); remove(cat); }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 ring-1 ring-red-200 hover:text-red-600">
                  <IconTrash size={13} />
                </button>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="py-2 text-center text-[12px] text-muted-foreground">ยังไม่มีหมวดหมู่</p>
        )}
      </div>
    </div>
  );
}

/* ─── Menu Form Modal ───────────────────────────────────────── */
function MenuFormModal({
  initial,
  categories,
  onSave,
  onClose,
}: {
  initial?: StoreMenuItem;
  categories: string[];
  onSave: (data: Omit<StoreMenuItem, "id"> & { id?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<StoreMenuItem, "id"> & { id?: string }>({
    id: initial?.id,
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    category: initial?.category ?? (categories[0] ?? ""),
    tag: initial?.tag,
    image: initial?.image ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [imgMode, setImgMode] = useState<"url" | "upload">(
    initial?.image?.startsWith("data:") ? "upload" : "url",
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") set("image", result);
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const allCategories = categories.length > 0 ? categories : ["ทั่วไป"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <button type="button" onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-[3px]" />
      <div className="relative w-full max-w-md rounded-[24px] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-[16px] font-bold">{initial ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}</h2>
          <button type="button" onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted ring-1 ring-border">
            <IconX size={16} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* ── Image ─────────────────────────────── */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              รูปภาพ
            </label>
            <div className="flex gap-3">
              {/* Preview */}
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <IconPhoto size={22} />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                {/* Mode toggle */}
                <div className="flex gap-1">
                  {(["url", "upload"] as const).map((m) => (
                    <button key={m} type="button"
                      onClick={() => setImgMode(m)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                        imgMode === m
                          ? "bg-foreground text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      )}>
                      {m === "url" ? "URL" : "อัปโหลด"}
                    </button>
                  ))}
                </div>

                {imgMode === "url" ? (
                  <input
                    value={form.image}
                    onChange={(e) => set("image", e.target.value)}
                    placeholder="https://..."
                    className={inputCls}
                  />
                ) : (
                  <>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="hidden"
                    />
                    <button type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-muted py-2 text-[12px] font-medium text-muted-foreground hover:bg-muted/80">
                      <IconPhoto size={14} />
                      {form.image?.startsWith("data:") ? "เปลี่ยนรูป" : "เลือกรูปจากเครื่อง"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Name ─────────────────────────────── */}
          <Field label="ชื่อเมนู *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              className={inputCls} placeholder="เช่น ต้มยำกุ้งน้ำข้น" />
          </Field>

          {/* ── Description ──────────────────────── */}
          <Field label="คำอธิบาย">
            <input value={form.description} onChange={(e) => set("description", e.target.value)}
              className={inputCls} placeholder="เช่น กุ้งสด น้ำข้นหอมอบอุ่น" />
          </Field>

          {/* ── Price + Tag ───────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="ราคา (บาท) *">
              <input type="number" min={0} value={form.price}
                onChange={(e) => set("price", Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Tag">
              <select value={form.tag ?? ""} onChange={(e) => set("tag", e.target.value || undefined)}
                className={inputCls}>
                {TAGS.map((t) => <option key={t} value={t}>{t || "ไม่มี"}</option>)}
              </select>
            </Field>
          </div>

          {/* ── Category ─────────────────────────── */}
          <Field label="หมวดหมู่">
            <select value={form.category} onChange={(e) => set("category", e.target.value)}
              className={inputCls}>
              {allCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="border-t border-border px-6 py-4">
          <button type="button" onClick={submit} disabled={saving || !form.name.trim() || !form.price}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] py-3 text-[13px] font-semibold text-white disabled:opacity-50">
            <IconCheck size={16} />
            {saving ? "กำลังบันทึก..." : initial ? "บันทึกการแก้ไข" : "เพิ่มเมนู"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* Tab 3 — จัดการโต๊ะ                                           */
/* ══════════════════════════════════════════════════════════════ */
function TablesTab() {
  const [tables, setTables] = useState<StoreTable[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newId, setNewId] = useState("");
  const [newZone, setNewZone] = useState<Zone>("A");
  const [newSeats, setNewSeats] = useState(4);
  const [addError, setAddError] = useState("");

  const load = () => apiFetchTables().then(setTables).catch(() => {});
  useEffect(() => { load(); }, []);

  const grouped = ZONES.map((z) => ({
    zone: z,
    tables: tables.filter((t) => t.zone === z),
  })).filter((g) => g.tables.length > 0);

  const handleAdd = async () => {
    setAddError("");
    if (!newId.trim()) { setAddError("กรุณากรอกเลขโต๊ะ"); return; }
    try {
      await apiAddTable(newId.toUpperCase(), newZone, newSeats);
      await load();
      setIsAdding(false);
      setNewId("");
    } catch {
      setAddError("เลขโต๊ะนี้มีอยู่แล้ว");
    }
  };

  const handleUpdateSeats = async (id: string, seats: number) => {
    await apiUpdateTableConfig(id, { seats });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`ลบโต๊ะ ${id}?`)) return;
    try {
      await apiDeleteTable(id);
      await load();
    } catch {
      alert("ไม่สามารถลบโต๊ะที่กำลังใช้งานอยู่ได้");
    }
  };

  const statusLabel: Record<string, string> = {
    available: "ว่าง", active: "ใช้บริการ", preparing: "รออาหาร", billing: "รอชำระ",
  };
  const statusColor: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-700",
    active: "bg-gray-100 text-gray-700",
    preparing: "bg-blue-100 text-blue-700",
    billing: "bg-red-100 text-red-700",
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">{tables.length} โต๊ะทั้งหมด</p>
        <button type="button" onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#FF5546] via-[#F23A2B] to-[#D32316] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(225,39,23,0.25)]">
          {isAdding ? <><IconX size={15} /> ยกเลิก</> : <><IconPlus size={15} /> เพิ่มโต๊ะ</>}
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="mb-5 rounded-2xl border border-[#E12717]/20 bg-[#FFF9F5] p-4">
          <p className="mb-3 text-[13px] font-semibold text-foreground">โต๊ะใหม่</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="เลขโต๊ะ">
              <input value={newId} onChange={(e) => setNewId(e.target.value.toUpperCase())}
                placeholder="เช่น E1" maxLength={4} className={inputCls} />
            </Field>
            <Field label="โซน">
              <select value={newZone} onChange={(e) => setNewZone(e.target.value as Zone)} className={inputCls}>
                {ZONES.map((z) => <option key={z}>{z}</option>)}
              </select>
            </Field>
            <Field label="ที่นั่ง">
              <input type="number" min={1} max={20} value={newSeats}
                onChange={(e) => setNewSeats(Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
          {addError && <p className="mt-2 text-[12px] text-red-500">{addError}</p>}
          <button type="button" onClick={handleAdd}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E12717] py-2.5 text-[13px] font-semibold text-white">
            <IconCheck size={15} /> เพิ่มโต๊ะ
          </button>
        </div>
      )}

      {grouped.map(({ zone, tables: zoneTables }) => (
        <div key={zone} className="mb-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">โซน {zone}</p>
          <div className="space-y-2">
            {zoneTables.map((t) => (
              <div key={t.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <span className="text-[14px] font-bold text-foreground">{t.id}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusColor[t.status])}>
                      {statusLabel[t.status]}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-[11px] text-muted-foreground">ที่นั่ง:</p>
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => t.status === "available" && handleUpdateSeats(t.id, Math.max(1, t.seats - 1))}
                        disabled={t.status !== "available" || t.seats <= 1}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] ring-1 ring-border disabled:opacity-30">−</button>
                      <span className="w-6 text-center text-[12px] font-semibold">{t.seats}</span>
                      <button type="button"
                        onClick={() => t.status === "available" && handleUpdateSeats(t.id, Math.min(20, t.seats + 1))}
                        disabled={t.status !== "available"}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] ring-1 ring-border disabled:opacity-30">+</button>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => handleDelete(t.id)}
                  disabled={t.status !== "available"}
                  title={t.status !== "available" ? "ลบได้เฉพาะโต๊ะว่าง" : "ลบโต๊ะ"}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-400 ring-1 ring-red-200 disabled:cursor-not-allowed disabled:opacity-30">
                  <IconTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#E12717] focus:outline-none focus:ring-2 focus:ring-[#E12717]/10";
