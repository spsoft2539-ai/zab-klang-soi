import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  serverStore.orders.markPrinted(id);
  return NextResponse.json({ ok: true });
}
