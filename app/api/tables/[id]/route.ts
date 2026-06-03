import { NextResponse } from "next/server";
import { serverStore, type TableStatus } from "@/lib/server-store";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as {
    action?: "open" | "close";
    status?: TableStatus;
    guests?: number;
    paymentMethod?: "cash" | "transfer";
    cashReceived?: number;
  };

  if (body.action === "open") {
    const t = serverStore.tables.open(id, body.guests ?? 1);
    if (!t) return NextResponse.json({ error: "cannot open" }, { status: 400 });
    return NextResponse.json(t);
  }

  if (body.action === "close") {
    serverStore.tables.close(id, {
      method: body.paymentMethod,
      cashReceived: body.cashReceived,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.status) {
    const t = serverStore.tables.setStatus(id, body.status);
    if (!t) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(t);
  }

  return NextResponse.json({ error: "invalid body" }, { status: 400 });
}
