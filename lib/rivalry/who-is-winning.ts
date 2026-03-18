import type { ChampionshipDriverStanding } from "@/lib/openf1/championship-drivers"
import type { SessionResultRow } from "@/lib/openf1/session-result"
import type { SessionSummary } from "@/lib/openf1/sessions"
import { getChampionshipDrivers } from "@/lib/openf1/championship-drivers"
import { getSessionResults } from "@/lib/openf1/session-result"
import { getSessions } from "@/lib/openf1/sessions"
import { throttleAll, type BehaviorOptions } from "@/lib/openf1/client"

export type RivalrySide = "A" | "B" | "tie"

export type StatKind = "points" | "raceFinishes" | "qualifying"

export type TimeScope =
  | { mode: "lastNRaces"; n: number; anchorDate?: string }
  | { mode: "lastMonths"; months: number; anchorDate?: string }
  | { mode: "season"; year: number }

export type PerStatWinners = Record<StatKind, RivalrySide>

export type WhoIsWinningResult = {
  perStat: PerStatWinners
  overall: RivalrySide
  breakdown?: {
    points: { driverA: number; driverB: number }
    raceFinishes: { driverAWins: number; driverBWins: number; ties: number }
    qualifying: { driverAWins: number; driverBWins: number; ties: number }
  }
}

export type RivalryPair = {
  driverNumberA: number
  driverNumberB: number
}

function pickPointsByDriver(
  standings: ChampionshipDriverStanding[],
  driverA: number,
  driverB: number
): { a: number | null; b: number | null } {
  const byDriver = new Map<number, ChampionshipDriverStanding[]>()
  for (const row of standings) {
    const n = row.driver_number
    const list = byDriver.get(n)
    if (list) list.push(row)
    else byDriver.set(n, [row])
  }
  const latest = (rows: ChampionshipDriverStanding[]) =>
    rows.reduce(
      (best, r) => ((r.session_key ?? 0) > (best.session_key ?? 0) ? r : best),
      rows[0]
    )

  const rowsA = byDriver.get(driverA)
  const rowsB = byDriver.get(driverB)
  return {
    a: rowsA ? (latest(rowsA).points_current ?? 0) : null,
    b: rowsB ? (latest(rowsB).points_current ?? 0) : null,
  }
}

export function comparePoints(
  standings: ChampionshipDriverStanding[],
  driverA: number,
  driverB: number
): {
  side: RivalrySide
  driverAPoints: number | null
  driverBPoints: number | null
} {
  const { a, b } = pickPointsByDriver(standings, driverA, driverB)
  if (a == null && b == null)
    return { side: "tie", driverAPoints: null, driverBPoints: null }
  if (a == null) return { side: "B", driverAPoints: null, driverBPoints: b }
  if (b == null) return { side: "A", driverAPoints: a, driverBPoints: null }
  if (a > b) return { side: "A", driverAPoints: a, driverBPoints: b }
  if (b > a) return { side: "B", driverAPoints: a, driverBPoints: b }
  return { side: "tie", driverAPoints: a, driverBPoints: b }
}

const UNCLASSIFIED_POSITION = 999

function effectivePosition(row: SessionResultRow): number {
  if (row.dnf || row.dns || row.dsq) return UNCLASSIFIED_POSITION
  return row.position ?? UNCLASSIFIED_POSITION
}

export function headToHeadOneSession(
  rows: SessionResultRow[],
  driverA: number,
  driverB: number
): RivalrySide {
  const rowA = rows.find((r) => r.driver_number === driverA)
  const rowB = rows.find((r) => r.driver_number === driverB)
  if (!rowA || !rowB) return "tie"
  const posA = effectivePosition(rowA)
  const posB = effectivePosition(rowB)
  if (posA < posB) return "A"
  if (posB < posA) return "B"
  return "tie"
}

export function aggregateHeadToHead(
  sessionsResults: SessionResultRow[][],
  driverA: number,
  driverB: number
): { driverAWins: number; driverBWins: number; ties: number } {
  let driverAWins = 0
  let driverBWins = 0
  let ties = 0
  for (const rows of sessionsResults) {
    const outcome = headToHeadOneSession(rows, driverA, driverB)
    if (outcome === "A") driverAWins++
    else if (outcome === "B") driverBWins++
    else ties++
  }
  return { driverAWins, driverBWins, ties }
}

function sideFromCounts(aWins: number, bWins: number): RivalrySide {
  if (aWins > bWins) return "A"
  if (bWins > aWins) return "B"
  return "tie"
}

export function computeOverall(perStat: PerStatWinners): RivalrySide {
  let a = 0
  let b = 0
  for (const k of Object.keys(perStat) as StatKind[]) {
    if (perStat[k] === "A") a++
    else if (perStat[k] === "B") b++
  }
  if (a > b) return "A"
  if (b > a) return "B"
  return perStat.points
}

export function buildWhoIsWinningResult(input: {
  standings: ChampionshipDriverStanding[]
  raceSessionsResults: SessionResultRow[][]
  qualifyingSessionsResults: SessionResultRow[][]
  driverA: number
  driverB: number
}): WhoIsWinningResult {
  const {
    standings,
    raceSessionsResults,
    qualifyingSessionsResults,
    driverA,
    driverB,
  } = input

  const pointsCmp = comparePoints(standings, driverA, driverB)
  const raceAgg = aggregateHeadToHead(raceSessionsResults, driverA, driverB)
  const qualAgg = aggregateHeadToHead(
    qualifyingSessionsResults,
    driverA,
    driverB
  )

  const perStat: PerStatWinners = {
    points: pointsCmp.side,
    raceFinishes: sideFromCounts(raceAgg.driverAWins, raceAgg.driverBWins),
    qualifying: sideFromCounts(qualAgg.driverAWins, qualAgg.driverBWins),
  }

  return {
    perStat,
    overall: computeOverall(perStat),
    breakdown: {
      points: {
        driverA: pointsCmp.driverAPoints ?? 0,
        driverB: pointsCmp.driverBPoints ?? 0,
      },
      raceFinishes: {
        driverAWins: raceAgg.driverAWins,
        driverBWins: raceAgg.driverBWins,
        ties: raceAgg.ties,
      },
      qualifying: {
        driverAWins: qualAgg.driverAWins,
        driverBWins: qualAgg.driverBWins,
        ties: qualAgg.ties,
      },
    },
  }
}

export function winSharesFromWhoIsWinning(result: WhoIsWinningResult): {
  driverA: number
  driverB: number
} {
  const b = result.breakdown
  if (!b) return { driverA: 50, driverB: 50 }

  const { driverA: ptsA, driverB: ptsB } = b.points
  const sumPts = ptsA + ptsB
  if (sumPts > 0) {
    const driverA = Math.round((100 * ptsA) / sumPts)
    return { driverA, driverB: 100 - driverA }
  }

  const rA = b.raceFinishes.driverAWins
  const rB = b.raceFinishes.driverBWins
  const rSum = rA + rB
  if (rSum > 0) {
    const driverA = Math.round((100 * rA) / rSum)
    return { driverA, driverB: 100 - driverA }
  }

  const qA = b.qualifying.driverAWins
  const qB = b.qualifying.driverBWins
  const qSum = qA + qB
  if (qSum > 0) {
    const driverA = Math.round((100 * qA) / qSum)
    return { driverA, driverB: 100 - driverA }
  }

  if (result.overall === "A") return { driverA: 55, driverB: 45 }
  if (result.overall === "B") return { driverA: 45, driverB: 55 }
  return { driverA: 50, driverB: 50 }
}

function parseDateStart(s: SessionSummary): number {
  return new Date(s.date_start ?? "").getTime()
}

export function selectRaceSessionKeys(
  allSessions: SessionSummary[],
  scope: TimeScope
): number[] {
  const raceSessions = allSessions
    .filter((s) => s.session_type === "Race")
    .sort((a, b) => parseDateStart(a) - parseDateStart(b))

  if (scope.mode === "season") {
    return raceSessions
      .filter((s) => s.year === scope.year)
      .map((s) => s.session_key)
  }

  if (scope.mode === "lastNRaces") {
    const n = Math.max(1, scope.n)
    const slice = raceSessions.slice(-n)
    return slice.map((s) => s.session_key)
  }

  const months = Math.max(1, scope.months)
  const anchor = scope.anchorDate ? new Date(scope.anchorDate) : new Date()
  const cutoff = new Date(anchor)
  cutoff.setMonth(cutoff.getMonth() - months)
  const cutoffMs = cutoff.getTime()
  return raceSessions
    .filter((s) => parseDateStart(s) >= cutoffMs)
    .map((s) => s.session_key)
}

export function qualifyingSessionKeysForMeetings(
  allSessions: SessionSummary[],
  meetingKeys: Set<number>
): number[] {
  const quali = allSessions.filter(
    (s) =>
      s.session_type === "Qualifying" && meetingKeys.has(s.meeting_key ?? 0)
  )
  const byMeeting = new Map<number, SessionSummary>()
  for (const s of quali) {
    const meetingKey = s.meeting_key ?? 0
    const existing = byMeeting.get(meetingKey)
    if (!existing || parseDateStart(s) < parseDateStart(existing)) {
      byMeeting.set(meetingKey, s)
    }
  }
  return Array.from(byMeeting.values())
    .sort((a, b) => parseDateStart(a) - parseDateStart(b))
    .map((s) => s.session_key)
}

export type GetWhoIsWinningParams = {
  pair: RivalryPair
  scope: TimeScope
}

export async function getWhoIsWinning(
  params: GetWhoIsWinningParams,
  behavior: BehaviorOptions = {}
): Promise<WhoIsWinningResult> {
  const { pair, scope } = params
  const { driverNumberA, driverNumberB } = pair

  const currentYear = new Date().getFullYear()
  const year = scope.mode === "season" ? scope.year : currentYear

  let allSessions: SessionSummary[]
  const today = new Date().toISOString().split("T")[0]

  if (scope.mode === "season") {
    // Use date range from Jan 1 of the year to today
    allSessions = await getSessions(
      {
        dateStart: `${scope.year}-01-01`,
        dateEnd: today,
      },
      behavior
    )
    // Filter to only include sessions from the requested year
    allSessions = allSessions.filter((s) => s.year === scope.year)
  } else {
    // For lastNRaces and lastMonths, get sessions from last year until today
    const thisYearStart = `${year}-01-01`
    const prevYearStart = `${year - 1}-01-01`

    const [thisYearSessions, prevYearSessions] = await Promise.all([
      getSessions({ dateStart: thisYearStart, dateEnd: today }, behavior),
      getSessions({ dateStart: prevYearStart, dateEnd: today }, behavior),
    ])
    const byKey = new Map<number, SessionSummary>()
    for (const s of prevYearSessions) byKey.set(s.session_key, s)
    for (const s of thisYearSessions) byKey.set(s.session_key, s)
    allSessions = Array.from(byKey.values())
  }

  const raceKeys = selectRaceSessionKeys(allSessions, scope)
  const meetingKeys = new Set<number>()
  for (const key of raceKeys) {
    const session = allSessions.find((s) => s.session_key === key)
    if (session && session.meeting_key) meetingKeys.add(session.meeting_key)
  }
  const qualKeys = qualifyingSessionKeysForMeetings(allSessions, meetingKeys)

  // Fetch standings first, then throttle race results to avoid rate limiting
  const standings = await getChampionshipDrivers(
    {
      sessionKey: "latest",
      driverNumbers: [driverNumberA, driverNumberB],
    },
    behavior
  )

  // Throttle race results with 100ms delay between each request
  const raceResults = (await throttleAll(
    raceKeys,
    (sessionKey) => getSessionResults({ sessionKey }, behavior),
    100
  )) as SessionResultRow[][]

  // Throttle qualifying results with 100ms delay between each request
  const qualifyingResults = (await throttleAll(
    qualKeys,
    (sessionKey) => getSessionResults({ sessionKey }, behavior),
    100
  )) as SessionResultRow[][]

  return buildWhoIsWinningResult({
    standings,
    raceSessionsResults: raceResults,
    qualifyingSessionsResults: qualifyingResults,
    driverA: driverNumberA,
    driverB: driverNumberB,
  })
}
