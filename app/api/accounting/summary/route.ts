import { NextResponse } from "next/server";
import { serverStore } from "@/lib/server-store";

export async function GET() {
  const allBills = serverStore.bills.getAll();
  const todayBills = serverStore.bills.today();

  const sum = (arr: typeof allBills) =>
    arr.reduce((s, b) => s + b.total, 0);

  // week = last 7 days
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekBills = allBills.filter((b) => b.closedAtMs >= weekAgo);

  const summary = {
    todayRevenue: sum(todayBills),
    todayBills: todayBills.length,
    weekRevenue: sum(weekBills),
    weekBills: weekBills.length,
    allRevenue: sum(allBills),
    allBills: allBills.length,
    avgBill: todayBills.length
      ? Math.round(sum(todayBills) / todayBills.length)
      : 0,
  };

  return NextResponse.json(summary);
}
