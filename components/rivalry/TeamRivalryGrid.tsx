"use client"

import { useMemo, useState } from "react"
import type { TeamRivalryCard as TeamRivalryCardData } from "@/lib/rivalry/team-rivalry-card"
import { TeamRivalryCard } from "@/components/rivalry/TeamRivalryCard"

export function TeamRivalryGrid({
  seasonLabel,
  cards,
}: {
  seasonLabel: string
  cards: TeamRivalryCardData[]
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const selectedCard = useMemo(
    () => cards.find((card) => card.teamId === selectedTeamId) ?? null,
    [cards, selectedTeamId]
  )

  return (
    <section className="relative w-full">
      <header className="mb-8">
        <p
          className="text-base font-semibold tracking-[0.18em] text-zinc-300 uppercase sm:text-lg"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {seasonLabel}
        </p>
        <h1
          className="mt-1 font-serif text-2xl text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          SeatWar
        </h1>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">Whos keeping his seat?</p>
      </header>

      {cards.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-zinc-900/40 px-6 py-12 text-center backdrop-blur-sm">
          <p className="text-zinc-400">
            No team rivalries available. OpenF1 did not return at least two drivers per team for the
            given session, or no cards could be computed. Please try again later or check the
            console/network.
          </p>
        </div>
      ) : (
        <div
          className="mx-auto flex w-full max-w-3xl flex-col gap-6 sm:gap-8"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {cards.map((card) => (
            <TeamRivalryCard
              key={card.teamId}
              card={card}
              onClick={() => setSelectedTeamId(card.teamId)}
            />
          ))}
        </div>
      )}

      {selectedCard ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rivalry-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 id="rivalry-modal-title" className="text-xl font-semibold text-white">
                {selectedCard.teamName} rivalry stats
              </h2>
              <button
                type="button"
                className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5"
                onClick={() => setSelectedTeamId(null)}
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-200">
              <section className="rounded-xl border border-white/8 bg-zinc-950/60 p-4">
                <p className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                  Points
                </p>
                <p className="flex items-center justify-between">
                  <span>{selectedCard.driverA.shortName}</span>
                  <span className="tabular-nums">{selectedCard.stats.points.driverA}</span>
                </p>
                <p className="mt-1 flex items-center justify-between">
                  <span>{selectedCard.driverB.shortName}</span>
                  <span className="tabular-nums">{selectedCard.stats.points.driverB}</span>
                </p>
              </section>

              <section className="rounded-xl border border-white/8 bg-zinc-950/60 p-4">
                <p className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                  Race finishes (head-to-head)
                </p>
                <p className="flex items-center justify-between">
                  <span>{selectedCard.driverA.shortName} wins</span>
                  <span className="tabular-nums">
                    {selectedCard.stats.raceFinishes.driverAWins}
                  </span>
                </p>
                <p className="mt-1 flex items-center justify-between">
                  <span>{selectedCard.driverB.shortName} wins</span>
                  <span className="tabular-nums">
                    {selectedCard.stats.raceFinishes.driverBWins}
                  </span>
                </p>
              </section>

              <section className="rounded-xl border border-white/8 bg-zinc-950/60 p-4">
                <p className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                  Qualifying (head-to-head)
                </p>
                <p className="flex items-center justify-between">
                  <span>{selectedCard.driverA.shortName} wins</span>
                  <span className="tabular-nums">{selectedCard.stats.qualifying.driverAWins}</span>
                </p>
                <p className="mt-1 flex items-center justify-between">
                  <span>{selectedCard.driverB.shortName} wins</span>
                  <span className="tabular-nums">{selectedCard.stats.qualifying.driverBWins}</span>
                </p>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
