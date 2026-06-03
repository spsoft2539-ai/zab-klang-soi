import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = Number(searchParams.get("since") ?? 0);
  const todayOnly = searchParams.get("today") === "1";

  let result;
  if (todayOnly) {
    result = serverStore.bills.today();
  } else if (since > 0) {
    result = serverStore.bills.since(since);
  } else {
    result = serverStore.bills.getAll();
  }

  return NextResponse.json(result);
}
