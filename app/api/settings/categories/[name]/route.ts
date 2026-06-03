import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const { newName } = (await req.json()) as { newName: string };
  if (!newName?.trim()) return NextResponse.json({ error: "newName required" }, { status: 400 });
  const ok = serverStore.categories.rename(decoded, newName.trim());
  if (!ok) return NextResponse.json({ error: "not found or name conflict" }, { status: 409 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const ok = serverStore.categories.remove(decoded);
  if (!ok)
    return NextResponse.json(
      { error: "category not found or still in use by menu items" },
      { status: 409 },
    );
  return NextResponse.json({ ok: true });
}
