import { NextResponse } from "next/server"
import { getWhoIsWinning, parseTimeScopeFromQuery } from "@/lib/rivalry"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const a = Number(searchParams.get("a"))
  const b = Number(searchParams.get("b"))
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return NextResponse.json(
      { error: "Query params a and b (driver numbers) are required." },
      { status: 400 }
    )
  }

  let scope
  try {
    scope = parseTimeScopeFromQuery(searchParams)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid scope"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    const result = await getWhoIsWinning({
      pair: { driverNumberA: a, driverNumberB: b },
      scope,
    })
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
