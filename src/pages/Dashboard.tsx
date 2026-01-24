import { useEffect, useMemo, useState } from "react"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts"
import { Panel } from "../components/Panel"
import { StatCard } from "../components/StatCard"
import { api, type AnalyticsEvent, type Channel, type Karma, type SavedPostItem } from "../lib/api"
import { useAuthStore } from "../stores/auth"

const emptyTrend = [
  { day: "Mon", views: 0, engagement: 0 },
  { day: "Tue", views: 0, engagement: 0 },
  { day: "Wed", views: 0, engagement: 0 },
  { day: "Thu", views: 0, engagement: 0 },
  { day: "Fri", views: 0, engagement: 0 },
  { day: "Sat", views: 0, engagement: 0 },
  { day: "Sun", views: 0, engagement: 0 },
]

export function Dashboard() {
  const { user, token } = useAuthStore()
  const [karma, setKarma] = useState<Karma | null>(null)
  const [savedItems, setSavedItems] = useState<SavedPostItem[]>([])
  const [notifications, setNotifications] = useState<{ title: string; tone: string }[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [events, setEvents] = useState<AnalyticsEvent[]>([])

  useEffect(() => {
    if (!token || !user) return
    void api.getKarma(user.id, token).then(setKarma).catch(() => setKarma(null))
    void api.getSavedPosts(user.username, token).then((data) => setSavedItems(data.savedItems ?? [])).catch(() => {
      setSavedItems([])
    })
    void api.getNotifications(user.username, token).then((data) => {
      setNotifications(
        data.slice(0, 3).map((note) => ({
          title: note.title ?? note.message ?? "Notification",
          tone: note.isRead ? "bg-ink/10 text-ink" : "bg-grove/15 text-grove",
        }))
      )
    })
    void api.getAnalyticsByUser(user.id, token).then(setEvents).catch(() => setEvents([]))
  }, [token, user])

  useEffect(() => {
    void api.getChannels().then(setChannels).catch(() => setChannels([]))
  }, [])

  const karmaByTopic = useMemo(() => {
    if (!karma?.karmaByChannel) return []
    return Object.entries(karma.karmaByChannel).map(([channelId, value]) => ({
      name: channels.find((channel) => channel.id === Number(channelId))?.name ?? `Channel ${channelId}`,
      value,
    }))
  }, [karma, channels])

  const engagementTrend = useMemo(() => {
    if (!events.length) return emptyTrend
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const base = emptyTrend.map((entry) => ({ ...entry }))
    events.forEach((event) => {
      if (!event.timestamp) return
      const date = new Date(event.timestamp)
      const day = dayMap[date.getDay()]
      const row = base.find((item) => item.day === day)
      if (!row) return
      if (event.eventType === "POST_VIEW") row.views += 1
      if (["UPVOTE", "COMMENT_CREATE", "SHARE"].includes(event.eventType)) row.engagement += 1
    })
    return base
  }, [events])

  const stats = {
    totalKarma: karma?.karmaScore ?? 0,
    activeThreads: channels.length,
    weeklyEngagement: engagementTrend.reduce((sum, item) => sum + item.engagement, 0),
    savedItems: savedItems.length,
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Karma" value={`${stats.totalKarma}`} change="Synced" tone="positive" />
        <StatCard label="Active Threads" value={`${stats.activeThreads}`} change="Live" tone="neutral" />
        <StatCard label="Weekly Engagement" value={`${stats.weeklyEngagement}`} change="Last 7d" tone="positive" />
        <StatCard label="Saved Items" value={`${stats.savedItems}`} change="Library" tone="warning" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Personal karma breakdown by topic" subtitle="Live channel karma totals">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={karmaByTopic}>
                <Tooltip cursor={{ fill: "rgba(15, 17, 21, 0.05)" }} />
                <Bar dataKey="value" fill="#1b4965" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel title="Saved content library" subtitle="Quick access to your bookmarks">
            <div className="space-y-4">
              {savedItems.length === 0 && (
                <p className="text-sm text-ink/60">No saved posts yet. Start bookmarking content.</p>
              )}
              {savedItems.slice(0, 3).map((item) => (
                <div key={item.postId} className="rounded-2xl border border-ink/5 bg-white p-4">
                  <p className="font-medium text-ink">{item.postTitle}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-ink/60">
                    <span>{item.channelName}</span>
                    <span>{item.folder ?? "Saved"}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Notification center" subtitle="Alerts, replies, and system updates">
            <div className="space-y-3">
              {notifications.length === 0 && (
                <p className="text-sm text-ink/60">No new notifications.</p>
              )}
              {notifications.map((note) => (
                <div key={note.title} className={`rounded-2xl px-4 py-3 text-sm ${note.tone}`}>
                  {note.title}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <Panel title="Post analytics" subtitle="Views and engagement from your activity stream">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={engagementTrend}>
              <Tooltip cursor={{ fill: "rgba(15, 17, 21, 0.04)" }} />
              <Area type="monotone" dataKey="views" stroke="#1b4965" fill="#1b4965" fillOpacity={0.12} />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="#e76f51"
                fill="#e76f51"
                fillOpacity={0.18}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  )
}
