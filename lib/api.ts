// Client-side fetch helpers — safe to import in client components.
import type { StoreTable, StoreOrder, StoreOrderItem, StoreMenuItem, StoreSettings, StoreBill, Zone } from "./server-store";
export type { StoreTable, StoreOrder, StoreOrderItem, StoreMenuItem, StoreSettings, StoreBill, Zone };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export function apiFetchTables(): Promise<StoreTable[]> {
  return fetch("/api/tables", { cache: "no-store" }).then(json<StoreTable[]>);
}

export function apiOpenTable(id: string, guests: number): Promise<StoreTable> {
  return fetch(`/api/tables/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "open", guests }),
  }).then(json<StoreTable>);
}

export function apiCloseTable(
  id: string,
  payment?: { method: "cash" | "transfer"; cashReceived?: number },
): Promise<void> {
  return fetch(`/api/tables/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "close",
      ...(payment && { paymentMethod: payment.method, cashReceived: payment.cashReceived }),
    }),
  }).then(() => undefined);
}

export function apiSetTableStatus(
  id: string,
  status: StoreTable["status"],
): Promise<StoreTable> {
  return fetch(`/api/tables/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(json<StoreTable>);
}

export function apiFetchOrders(since = 0): Promise<StoreOrder[]> {
  return fetch(`/api/orders?since=${since}`, { cache: "no-store" }).then(json<StoreOrder[]>);
}

export function apiSubmitOrder(
  tableId: string,
  items: StoreOrderItem[],
): Promise<StoreOrder> {
  return fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableId, items }),
  }).then(json<StoreOrder>);
}

export function apiMarkPrinted(orderId: string): Promise<void> {
  return fetch(`/api/orders/${orderId}/printed`, { method: "PATCH" }).then(
    () => undefined,
  );
}

/* ─── Settings ──────────────────────────────────────────────── */

export function apiFetchSettings(): Promise<StoreSettings> {
  return fetch("/api/settings", { cache: "no-store" }).then(json<StoreSettings>);
}

export function apiUpdateSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  return fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).then(json<StoreSettings>);
}

/* ─── Menu management ───────────────────────────────────────── */

export function apiFetchMenu(): Promise<StoreMenuItem[]> {
  return fetch("/api/settings/menu", { cache: "no-store" }).then(json<StoreMenuItem[]>);
}

export function apiAddMenuItem(item: Omit<StoreMenuItem, "id">): Promise<StoreMenuItem> {
  return fetch("/api/settings/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  }).then(json<StoreMenuItem>);
}

export function apiUpdateMenuItem(id: string, patch: Partial<Omit<StoreMenuItem, "id">>): Promise<StoreMenuItem> {
  return fetch(`/api/settings/menu/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).then(json<StoreMenuItem>);
}

export function apiDeleteMenuItem(id: string): Promise<void> {
  return fetch(`/api/settings/menu/${id}`, { method: "DELETE" }).then(() => undefined);
}

/* ─── Table management ──────────────────────────────────────── */

export function apiAddTable(id: string, zone: Zone, seats: number): Promise<StoreTable> {
  return fetch("/api/settings/tables", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, zone, seats }),
  }).then(json<StoreTable>);
}

export function apiUpdateTableConfig(id: string, patch: { seats?: number; zone?: Zone }): Promise<StoreTable> {
  return fetch(`/api/settings/tables/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).then(json<StoreTable>);
}

export function apiDeleteTable(id: string): Promise<void> {
  return fetch(`/api/settings/tables/${id}`, { method: "DELETE" }).then(() => undefined);
}

/* ─── Category management ───────────────────────────────────── */

export function apiFetchCategories(): Promise<string[]> {
  return fetch("/api/settings/categories", { cache: "no-store" }).then(json<string[]>);
}

export function apiAddCategory(name: string): Promise<{ ok: boolean }> {
  return fetch("/api/settings/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }).then(json<{ ok: boolean }>);
}

export function apiRenameCategory(oldName: string, newName: string): Promise<void> {
  return fetch(`/api/settings/categories/${encodeURIComponent(oldName)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newName }),
  }).then(() => undefined);
}

export function apiDeleteCategory(name: string): Promise<void> {
  return fetch(`/api/settings/categories/${encodeURIComponent(name)}`, {
    method: "DELETE",
  }).then(() => undefined);
}

/* ─── Accounting ────────────────────────────────────────────── */

export interface AccountingSummary {
  todayRevenue: number;
  todayBills: number;
  weekRevenue: number;
  weekBills: number;
  allRevenue: number;
  allBills: number;
  avgBill: number;
}

export function apiFetchBills(opts: { today?: boolean; since?: number } = {}): Promise<StoreBill[]> {
  const params = new URLSearchParams();
  if (opts.today) params.set("today", "1");
  if (opts.since) params.set("since", String(opts.since));
  return fetch(`/api/accounting/bills?${params}`, { cache: "no-store" }).then(json<StoreBill[]>);
}

export function apiFetchAccountingSummary(): Promise<AccountingSummary> {
  return fetch("/api/accounting/summary", { cache: "no-store" }).then(json<AccountingSummary>);
}
