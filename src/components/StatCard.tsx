type StatCardProps = {
  label: string
  value: string
  change?: string
  tone?: "neutral" | "positive" | "warning"
}

const toneMap = {
  neutral: "bg-ink/5 text-ink",
  positive: "bg-grove/15 text-grove",
  warning: "bg-ember/15 text-ember",
}

export function StatCard({ label, value, change, tone = "neutral" }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-soft">
      <p className="text-sm uppercase tracking-[0.2em] text-ink/50">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-display text-3xl text-ink">{value}</p>
        {change && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneMap[tone]}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  )
}
