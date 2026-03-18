/**
 * Rivalry Domain - Unified Entry Point
 *
 * This module consolidates all rivalry-related types and functions.
 *
 * Public API (use these in consuming code):
 * - Types: TeamRivalryCard, TimeScope, WhoIsWinningResult, TeammateRivalry
 * - Functions: getTeamRivalryCards, parseTimeScopeFromQuery, getWhoIsWinning, getTeammateRivalries
 * - Error: OpenF1Error
 *
 * Internal types (do not use directly):
 * - RivalrySide, StatKind, PerStatWinners, RivalryPair
 */

import type { TeamRivalryCard } from "@/lib/rivalry/team-rivalry-card"
import type {
  TimeScope,
  WhoIsWinningResult,
} from "@/lib/rivalry/who-is-winning"
import type { TeammateRivalry } from "@/lib/teammate-rivalries"
import { OpenF1Error } from "@/lib/openf1/client"
import { getTeammateRivalries } from "@/lib/teammate-rivalries"
import { getWhoIsWinning } from "@/lib/rivalry/who-is-winning"
import { buildTeamRivalryCardsFromOpenF1 } from "@/lib/rivalry/cards-from-rivalries"

// Public types
export type { TeamRivalryCard, TimeScope, WhoIsWinningResult, TeammateRivalry }

// Public errors
export { OpenF1Error }

// Low-level functions for advanced use
export {
  getTeammateRivalries,
  getWhoIsWinning,
  buildTeamRivalryCardsFromOpenF1,
}

/**
 * Orchestrates fetching teammate rivalries and building rivalry cards.
 * This is the "happy path" function that handles the common case:
 * - Fetches rivalries for the latest session
 * - Builds cards with the specified time scope
 * - Returns cards and the resolved year
 *
 * @param scope - Optional time scope (defaults to current season)
 * @returns Cards with year information
 */
export async function getTeamRivalryCards(
  scope?: TimeScope
): Promise<{ cards: TeamRivalryCard[]; year: number }> {
  const resolvedScope = scope ?? {
    mode: "season" as const,
    year: new Date().getFullYear(),
  }

  const { rivalries, year } = await getTeammateRivalries({
    sessionKey: "latest",
    revalidate: 60,
  })

  if (rivalries.length === 0) {
    return { cards: [], year }
  }

  const cards = await buildTeamRivalryCardsFromOpenF1(rivalries, resolvedScope)

  return { cards, year }
}

/**
 * Parses URL search params into a TimeScope discriminated union.
 * Centralizes the parsing logic that was duplicated in API routes.
 *
 * Supported query params:
 * - scope=season&year=YYYY → { mode: "season", year: YYYY }
 * - scope=lastNRaces&n=5 → { mode: "lastNRaces", n: 5 }
 * - scope=lastMonths&months=12 → { mode: "lastMonths", months: 12 }
 * - (default) → { mode: "lastNRaces", n: 5 }
 *
 * @param params - URLSearchParams from the request
 * @returns Parsed TimeScope
 */
export function parseTimeScopeFromQuery(params: URLSearchParams): TimeScope {
  const scopeMode = params.get("scope") ?? "lastNRaces"

  if (scopeMode === "season") {
    const year = Number(params.get("year"))
    if (!Number.isFinite(year)) {
      throw new Error("scope=season requires year=YYYY")
    }
    return { mode: "season" as const, year }
  }

  if (scopeMode === "lastMonths") {
    const months = Number(params.get("months") ?? 12)
    return { mode: "lastMonths" as const, months: Math.max(1, months) }
  }

  // Default: lastNRaces
  const n = Number(params.get("n") ?? 5)
  return { mode: "lastNRaces" as const, n: Math.max(1, n) }
}
