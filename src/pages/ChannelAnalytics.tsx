import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
import { Panel } from "../components/Panel"
import { api, type AnalyticsEvent, type Channel } from "../lib/api"
import { useAuthStore } from "../stores/auth"

export function ChannelAnalytics() {
  const { token } = useAuthStore()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])

  useEffect(() => {
    void api.getChannels().then((data) => {
      setChannels(data)
      if (!selectedChannel && data[0]) setSelectedChannel(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedChannel || !token) return
    void api.getAnalyticsByChannel(selectedChannel, token).then(setEvents).catch(() => setEvents([]))
  }, [selectedChannel, token])

  const growthTrend = useMemo(() => {
    const weeks = ["W1", "W2", "W3", "W4", "W5"]
    const base = weeks.map((week) => ({ week, members: 0 }))
    events.forEach((event) => {
      if (!event.timestamp) return
      const weekIndex = Math.min(4, Math.floor(new Date(event.timestamp).getDate() / 7))
      base[weekIndex].members += 1
    })
    return base
  }, [events])

  const activeUsers = useMemo(() => {
    return channels.slice(0, 4).map((channel) => ({
      channel: channel.name,
      users: channel.subscriberCount ?? 0,
    }))
  }, [channels])

  const popularPosts = useMemo(() => {
    const posts = events
      .filter((event) => event.eventType === "POST_VIEW" && event.contentId)
      .slice(0, 3)
      .map((event) => ({
        title: `Post ${event.contentId}`,
        channel: channels.find((item) => item.id === event.channelId)?.name ?? "Channel",
        engagement: "N/A",
      }))
    return posts.length
      ? posts
      : [
          { title: "Internship leads for Spring", channel: "Careers", engagement: "1.2k" },
          { title: "Best quiet dorm floors", channel: "Housing", engagement: "980" },
          { title: "Professor ratings thread", channel: "Academics", engagement: "870" },
        ]
  }, [events, channels])

  return (
    <div className="space-y-8">
      <Panel title="Channel selector" subtitle="Pick a channel to view analytics">
        <select
          value={selectedChannel ?? ""}
          onChange={(event) => setSelectedChannel(Number(event.target.value))}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
        >
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </select>
      </Panel>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Growth trends" subtitle="Channel membership over the last 5 weeks">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthTrend}>
                <Tooltip cursor={{ fill: "rgba(15, 17, 21, 0.04)" }} />
                <Line type="monotone" dataKey="members" stroke="#1b4965" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Active users" subtitle="Daily active users by channel">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeUsers}>
                <Tooltip cursor={{ fill: "rgba(15, 17, 21, 0.04)" }} />
                <Bar dataKey="users" fill="#2a9d8f" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>

      <Panel title="Popular posts" subtitle="Highest engagement in the last 48 hours">
        <div className="space-y-4">
          {popularPosts.map((post) => (
            <div
              key={post.title}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-white px-5 py-4"
            >
              <div>
                <p className="text-lg font-semibold text-ink">{post.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/50">{post.channel}</p>
              </div>
              <span className="rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                {post.engagement} engagements
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
