import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function GET() {
  return NextResponse.json(serverStore.categories.getAll());
}

export async function POST(req: Request) {
  const { name } = (await req.json()) as { name: string };
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const ok = serverStore.categories.add(name.trim());
  if (!ok) return NextResponse.json({ error: "already exists" }, { status: 409 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
