import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function GET() {
  return NextResponse.json(serverStore.menu.getAll());
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = serverStore.menu.add(body);
  return NextResponse.json(item, { status: 201 });
}
