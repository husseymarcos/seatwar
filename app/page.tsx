import { TeamRivalryGrid } from "@/components/rivalry/TeamRivalryGrid"
import { buildTeamRivalryCardsFromOpenF1 } from "@/lib/rivalry/cards-from-rivalries"
import { OpenF1Error } from "@/lib/openf1/client"
import { getTeammateRivalries } from "@/lib/teammate-rivalries"
import type { TeamRivalryCard } from "@/lib/rivalry/team-rivalry-card"

const DEFAULT_SCOPE_YEAR = new Date().getFullYear()

export const dynamic = "force-dynamic"

export default async function Page() {
  let cards: TeamRivalryCard[] = []
  let seasonLabel = String(DEFAULT_SCOPE_YEAR)
  let errorMessage: string | null = null

  try {
    const rivalries = await getTeammateRivalries({
      sessionKey: "latest",
      revalidate: 60,
    })
    if (rivalries.length > 0) {
      cards = await buildTeamRivalryCardsFromOpenF1(rivalries, {
        mode: "season",
        year: DEFAULT_SCOPE_YEAR,
      })
    }
  } catch (e) {
    if (e instanceof OpenF1Error) {
      errorMessage = e.message + (e.status ? ` (${e.status})` : "")
    } else if (e instanceof Error) {
      errorMessage = e.message
    } else {
      errorMessage = "Error al cargar datos de OpenF1."
    }
  }

  return (
    <div className="min-h-svh bg-zinc-950">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(39,39,42,0.9),transparent_55%)]"
        aria-hidden
      />
      <main className="relative mx-auto min-h-svh max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {errorMessage ? (
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
            <div className="rounded-3xl border border-red-500/20 bg-red-950/20 px-6 py-8 text-center">
              <p className="font-medium text-red-200">No se pudieron cargar los datos</p>
              <p className="mt-2 text-sm text-zinc-400">{errorMessage}</p>
            </div>
          </section>
        ) : (
          <TeamRivalryGrid seasonLabel={seasonLabel} cards={cards} />
        )}
      </main>
    </div>
  )
}
