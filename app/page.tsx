import { TeamRivalryGrid } from "@/components/rivalry/TeamRivalryGrid"
import { MOCK_TEAM_RIVALRIES } from "@/lib/mvp/mock-rivalry"

export default function Page() {
  return (
    <div className="min-h-svh bg-zinc-950">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(39,39,42,0.9),transparent_55%)]"
        aria-hidden
      />
      <main className="relative mx-auto min-h-svh max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <TeamRivalryGrid seasonLabel="2025" cards={MOCK_TEAM_RIVALRIES} />
      </main>
    </div>
  )
}
