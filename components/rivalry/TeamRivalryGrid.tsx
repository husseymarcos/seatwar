import type { TeamRivalryCard as TeamRivalryCardData } from "@/lib/rivalry/team-rivalry-card"
import { TeamRivalryCard } from "@/components/rivalry/TeamRivalryCard"

export function TeamRivalryGrid({
  seasonLabel,
  cards,
}: {
  seasonLabel: string
  cards: TeamRivalryCardData[]
}) {
  return (
    <section className="relative w-full">
      <header className="mb-8">
        <p
          className="text-[10px] font-medium tracking-[0.25em] text-zinc-500 uppercase"
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
          className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {cards.map((card) => (
            <TeamRivalryCard key={card.teamId} card={card} />
          ))}
        </div>
      )}
    </section>
  )
}
