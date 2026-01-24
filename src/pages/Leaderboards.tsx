import { useEffect, useState } from "react"
import { Panel } from "../components/Panel"
import { api, type LeaderboardEntry } from "../lib/api"

export function Leaderboards() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    void api.getLeaderboard().then(setEntries).catch(() => setEntries([]))
  }, [])

  return (
    <div className="space-y-8">
      <Panel title="Top contributors by karma" subtitle="Celebrate students shaping the conversation">
        <div className="flex flex-wrap gap-3">
          {["Weekly", "Monthly", "All-time"].map((label, index) => (
            <button
              key={label}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                index === 0 ? "bg-ink text-white" : "border border-ink/10 text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-white">
          <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr] gap-2 border-b border-ink/10 px-6 py-4 text-xs uppercase tracking-[0.2em] text-ink/50">
            <span>Rank</span>
            <span>Username</span>
            <span>Karma</span>
            <span>Trend</span>
          </div>
          {entries.length === 0 && (
            <div className="px-6 py-6 text-sm text-ink/60">No leaderboard data available yet.</div>
          )}
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="grid grid-cols-[0.5fr_2fr_1fr_1fr] items-center gap-2 px-6 py-4 text-sm"
            >
              <span className="font-display text-lg">{index + 1}</span>
              <span className="font-semibold">@{entry.username}</span>
              <span>{entry.totalKarma ?? entry.totalUpvotes ?? 0}</span>
              <span className="rounded-full bg-grove/15 px-3 py-1 text-xs font-semibold text-grove">
                +{entry.totalUpvotes ?? 0}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
