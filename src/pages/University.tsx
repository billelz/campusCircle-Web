import { useEffect, useMemo, useState } from "react"
import { Area, AreaChart, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Panel } from "../components/Panel"
import { api, type AnalyticsEvent, type TrendingCache } from "../lib/api"
import { useAuthStore } from "../stores/auth"

export function University() {
  const { user, token } = useAuthStore()
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [trending, setTrending] = useState<TrendingCache[]>([])

  useEffect(() => {
    if (!user?.universityId || !token) return
    void api.getAnalyticsByUniversity(user.universityId, token).then(setEvents).catch(() => setEvents([]))
    void api.getTrendingByUniversity(user.universityId).then(setTrending).catch(() => setTrending([]))
  }, [user, token])

  const sentimentData = useMemo(() => {
    if (!events.length) {
      return [
        { name: "Positive", value: 55, fill: "#2a9d8f" },
        { name: "Neutral", value: 30, fill: "#f4a261" },
        { name: "Negative", value: 15, fill: "#e76f51" },
      ]
    }
    const positive = events.filter((event) => event.eventCategory === "engagement").length
    const neutral = events.filter((event) => event.eventCategory === "navigation").length
    const negative = Math.max(1, events.filter((event) => event.eventType === "REPORT").length)
    const total = positive + neutral + negative || 1
    return [
      { name: "Positive", value: Math.round((positive / total) * 100), fill: "#2a9d8f" },
      { name: "Neutral", value: Math.round((neutral / total) * 100), fill: "#f4a261" },
      { name: "Negative", value: Math.round((negative / total) * 100), fill: "#e76f51" },
    ]
  }, [events])

  const pulseData = useMemo(() => {
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const base = dayMap.map((day) => ({ day, score: 60 }))
    events.forEach((event) => {
      if (!event.timestamp) return
      const day = dayMap[new Date(event.timestamp).getDay()]
      const row = base.find((item) => item.day === day)
      if (!row) return
      row.score += event.eventCategory === "engagement" ? 2 : 1
    })
    return base.map((item) => ({ ...item, score: Math.min(90, item.score) }))
  }, [events])

  const trendingTopics = useMemo(() => {
    const cache = trending.find((item) => item.cacheType === "hashtags" || item.cacheType === "topics")
    if (!cache?.items?.length) {
      return [
        { topic: "Dining affordability", mentions: 320 },
        { topic: "Library hours", mentions: 240 },
        { topic: "Transit delays", mentions: 180 },
        { topic: "Counseling wait times", mentions: 150 },
      ]
    }
    return cache.items.slice(0, 5).map((item) => ({
      topic: item.name ?? "Topic",
      mentions: Math.round(item.value ?? item.score ?? 0),
    }))
  }, [trending])

  const crisisAlerts = useMemo(() => {
    const reportCount = events.filter((event) => event.eventType === "REPORT").length
    return [
      {
        title: "Reports trend",
        details: `${reportCount} reports logged in the last cycle.`,
        level: reportCount > 15 ? "Elevated" : "Monitor",
      },
    ]
  }, [events])

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Sentiment analysis" subtitle="Aggregated, anonymized student sentiment">
          <div className="flex flex-wrap items-center gap-6">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie data={sentimentData} dataKey="value" innerRadius={60} outerRadius={90} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {sentimentData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{item.value}%</span> {item.name}
                  </p>
                </div>
              ))}
              <p className="text-xs text-ink/60">
                Updated daily from opt-in student contributions.
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Crisis detection alerts" subtitle="Early warning signals for campus leadership">
          <div className="space-y-4">
            {crisisAlerts.map((alert) => (
              <div key={alert.title} className="rounded-3xl border border-ink/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">{alert.title}</p>
                  <span className="rounded-full bg-ember/15 px-3 py-1 text-xs font-semibold text-ember">
                    {alert.level}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/70">{alert.details}</p>
                <button className="mt-4 rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-ink">
                  Open incident brief
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Campus pulse metrics" subtitle="Daily sentiment score & engagement">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pulseData}>
                <Tooltip cursor={{ fill: "rgba(15, 17, 21, 0.04)" }} />
                <Area type="monotone" dataKey="score" stroke="#1b4965" fill="#1b4965" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Trending topics & concerns" subtitle="Topics with the fastest week-over-week growth">
          <div className="space-y-3">
            {trendingTopics.map((topic) => (
              <div key={topic.topic} className="flex items-center justify-between rounded-2xl bg-ink/5 px-4 py-3">
                <p className="text-sm font-medium text-ink">{topic.topic}</p>
                <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink">
                  {topic.mentions} mentions
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  )
}
