import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function GET() {
  return NextResponse.json(serverStore.settings.get());
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const updated = serverStore.settings.update(body);
  return NextResponse.json(updated);
}
