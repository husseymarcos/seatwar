import { NextResponse } from "next/server";
import {
  getWhoIsWinning,
  type TimeScope,
} from "@/lib/rivalry/who-is-winning";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const a = Number(searchParams.get("a"));
  const b = Number(searchParams.get("b"));
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return NextResponse.json(
      { error: "Query params a and b (driver numbers) are required." },
      { status: 400 },
    );
  }

  const scopeMode = searchParams.get("scope") ?? "lastNRaces";
  let scope: TimeScope;
  if (scopeMode === "season") {
    const year = Number(searchParams.get("year"));
    if (!Number.isFinite(year)) {
      return NextResponse.json(
        { error: "scope=season requires year=YYYY" },
        { status: 400 },
      );
    }
    scope = { mode: "season", year };
  } else if (scopeMode === "lastMonths") {
    const months = Number(searchParams.get("months") ?? 12);
    scope = { mode: "lastMonths", months: Math.max(1, months) };
  } else {
    const n = Number(searchParams.get("n") ?? 5);
    scope = { mode: "lastNRaces", n: Math.max(1, n) };
  }

  try {
    const result = await getWhoIsWinning({
      pair: { driverNumberA: a, driverNumberB: b },
      scope,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
