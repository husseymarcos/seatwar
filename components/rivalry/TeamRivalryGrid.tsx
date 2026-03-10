import type { TeamRivalryCard as TeamRivalryCardData } from "@/lib/mvp/mock-rivalry"
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

      {/* 2×2 style: two columns only — each card gets ~half width so they read much larger */}
      <div
        className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {cards.map((card) => (
          <TeamRivalryCard key={card.teamId} card={card} />
        ))}
      </div>
    </section>
  )
}
