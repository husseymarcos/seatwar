import type { TeamRivalryCard as TeamRivalryCardData } from "@/lib/mvp/mock-rivalry"
import { cn } from "@/lib/utils"

function ThinSplitBar({
  leftPct,
  rightPct,
  color,
}: {
  leftPct: number
  rightPct: number
  color: string
}) {
  const a = Math.round(Math.min(100, Math.max(0, leftPct)))
  const b = Math.round(Math.min(100, Math.max(0, rightPct)))
  const total = a + b || 1
  const leftWidth = total === 100 ? a : Math.round((a / total) * 100)
  const rightWidth = 100 - leftWidth

  return (
    <div
      className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-800 sm:h-2.5"
      role="img"
      aria-label={`Split ${leftWidth}% and ${rightWidth}%`}
    >
      <div
        className="h-full shrink-0 transition-[width] duration-500 ease-out"
        style={{
          width: `${leftWidth}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}55`,
        }}
      />
      <div
        className="h-full shrink-0 transition-[width] duration-500 ease-out"
        style={{
          width: `${rightWidth}%`,
          backgroundColor: color,
          opacity: 0.45,
          boxShadow: `0 0 8px ${color}33`,
        }}
      />
    </div>
  )
}

export function TeamRivalryCard({ card }: { card: TeamRivalryCardData }) {
  const { teamName, teamColor, driverA, driverB } = card
  const a = driverA.winShare
  const b = driverB.winShare

  return (
    <article
      className={cn(
        "flex min-h-[160px] flex-col justify-center gap-5 rounded-3xl border border-white/5 bg-zinc-900/60 p-6 shadow-lg sm:min-h-[180px] sm:p-8",
        "backdrop-blur-sm transition-shadow hover:border-white/10 hover:shadow-xl"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className="size-3.5 shrink-0 rounded-full ring-2 ring-white/15 sm:size-4"
          style={{ backgroundColor: teamColor }}
          aria-hidden
        />
        <h2 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
          {teamName}
        </h2>
      </div>

      <ThinSplitBar leftPct={a} rightPct={b} color={teamColor} />

      <div className="flex justify-between gap-4 text-sm sm:text-base">
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium text-zinc-200">{driverA.shortName}</span>
          <span
            className="font-serif text-xl tabular-nums text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {a}%
          </span>
        </div>
        <div className="min-w-0 flex-1 text-right">
          <span className="block truncate font-medium text-zinc-200">{driverB.shortName}</span>
          <span
            className="font-serif text-xl tabular-nums text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {b}%
          </span>
        </div>
      </div>
    </article>
  )
}
