import { NextResponse } from "next/server";
import { serverStore, type StoreOrderItem } from "@/lib/server-store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = Number(searchParams.get("since") ?? 0);
  const tableId = searchParams.get("tableId");

  let result = since > 0
    ? serverStore.orders.since(since)
    : serverStore.orders.getAll();

  if (tableId) result = result.filter((o) => o.tableId === tableId);

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    tableId: string;
    items: StoreOrderItem[];
  };

  if (!body.tableId || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "invalid order" }, { status: 400 });
  }

  const order = serverStore.orders.submit(body.tableId, body.items);
  return NextResponse.json(order, { status: 201 });
}
