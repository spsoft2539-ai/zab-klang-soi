import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function GET() {
  return NextResponse.json(serverStore.tables.getAll());
}
