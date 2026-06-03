import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";
import type { Zone } from "@/lib/server-store";

export async function POST(req: Request) {
  const { id, zone, seats } = await req.json() as { id: string; zone: Zone; seats: number };
  const t = serverStore.tables.add(id, zone, seats);
  if (!t) return NextResponse.json({ error: "id already exists" }, { status: 409 });
  return NextResponse.json(t, { status: 201 });
}
