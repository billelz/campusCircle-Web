import { useEffect, useMemo, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
import { Panel } from "../components/Panel"
import {
  api,
  type Ban,
  type ModerationAction,
  type ModerationQueue,
  type Report,
  type Subscription,
  type UserProfile,
} from "../lib/api"
import { useAuthStore, useRoles } from "../stores/auth"

const automodRules = [
  { rule: "Flag posts with 3+ reports in 1 hour", active: true },
  { rule: "Auto-hide suspicious links", active: true },
  { rule: "Slow mode after 5 duplicate posts", active: false },
]

export function Moderation() {
  const { token, user } = useAuthStore()
  const { isModerator } = useRoles()
  const [queue, setQueue] = useState<ModerationQueue[]>([])
  const [actions, setActions] = useState<ModerationAction[]>([])
  const [bans, setBans] = useState<Ban[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [channels, setChannels] = useState<{ id: number; name: string }[]>([])
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const [subscribers, setSubscribers] = useState<Subscription[]>([])
  const [userMap, setUserMap] = useState<Record<number, UserProfile | null>>({})
  const [loadingSubscribers, setLoadingSubscribers] = useState(true)
  const [banReason, setBanReason] = useState("Channel policy violation")

  useEffect(() => {
    if (!token) return
    void api.getModerationQueue(token).then(setQueue).catch(() => setQueue([]))
    void api.getModerationActions(token).then(setActions).catch(() => setActions([]))
    void api.getBans(token).then(setBans).catch(() => setBans([]))
    void api.getReports(token).then(setReports).catch(() => setReports([]))
  }, [token])

  useEffect(() => {
    void api.getChannels().then((data) => {
      const list = data.map((channel) => ({ id: channel.id, name: channel.name }))
      setChannels(list)
      setSelectedChannel((prev) => prev ?? list[0]?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (!token || !selectedChannel || !isModerator) return
    void api
      .getChannelSubscribers(selectedChannel, token)
      .then((data) => setSubscribers(data))
      .catch(() => setSubscribers([]))
      .finally(() => setLoadingSubscribers(false))
  }, [token, selectedChannel, isModerator])

  useEffect(() => {
    if (!token || subscribers.length === 0) return
    const uniqueUserIds = Array.from(new Set(subscribers.map((sub) => sub.userId)))
    void Promise.allSettled(
      uniqueUserIds.map(async (userId) => {
        if (userMap[userId]) return
        const profile = await api.getUserById(userId, token)
        setUserMap((prev) => ({ ...prev, [userId]: profile }))
      })
    )
  }, [subscribers, token, userMap])

  const handleRemove = async (userId: number) => {
    if (!token || !selectedChannel) return
    await api.unsubscribeUser(userId, selectedChannel, token)
    setSubscribers((prev) => prev.filter((item) => item.userId !== userId))
  }

  const handleBan = async (userId: number) => {
    if (!token || !selectedChannel) return
    const channelName = channels.find((channel) => channel.id === selectedChannel)?.name ?? "channel"
    await api.createBan(
      {
        userId,
        bannedBy: user?.id,
        reason: `${banReason} (Channel: ${channelName})`,
        duration: null,
        expiresAt: null,
        createdAt: new Date().toISOString(),
      },
      token
    )
    await api.unsubscribeUser(userId, selectedChannel, token)
    setSubscribers((prev) => prev.filter((item) => item.userId !== userId))
  }

  const healthMetrics = useMemo(() => {
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const base = dayMap.map((day) => ({ day, reports: 0, resolved: 0 }))
    reports.forEach((report) => {
      if (!report.createdAt) return
      const day = dayMap[new Date(report.createdAt).getDay()]
      const row = base.find((item) => item.day === day)
      if (row) row.reports += 1
    })
    queue.forEach((item) => {
      if (!item.flaggedAt) return
      const day = dayMap[new Date(item.flaggedAt).getDay()]
      const row = base.find((metric) => metric.day === day)
      if (row && item.status === "RESOLVED") row.resolved += 1
    })
    return base
  }, [reports, queue])

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Report queue with context" subtitle="Prioritize by impact and urgency">
          <div className="space-y-4">
            {queue.length === 0 && <p className="text-sm text-ink/60">No queued reports right now.</p>}
            {queue.map((report) => (
              <div key={report.id} className="rounded-3xl border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{report.id}</p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {report.contentType ?? "Report"} flagged
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      report.score && report.score > 0.7
                        ? "bg-ember/15 text-ember"
                        : report.score && report.score > 0.4
                          ? "bg-gold/30 text-ink"
                          : "bg-ink/10 text-ink"
                    }`}
                  >
                    {report.status ?? "Open"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink/70">{report.reason ?? "No context available."}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                    Review
                  </button>
                  <button className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                    Request context
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Community health metrics" subtitle="Weekly report load and resolution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthMetrics}>
                <Tooltip cursor={{ fill: "rgba(15, 17, 21, 0.04)" }} />
                <Line type="monotone" dataKey="reports" stroke="#e76f51" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="#2a9d8f" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title="User moderation history" subtitle="Recent actions across campus">
          <div className="space-y-3">
            {actions.length === 0 && <p className="text-sm text-ink/60">No moderation actions yet.</p>}
            {actions.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-ink/5 px-4 py-3">
                <div>
                  <p className="font-medium text-ink">@{item.moderatorUsername ?? "moderator"}</p>
                  <p className="text-xs text-ink/60">{item.reason ?? "No reason recorded"}</p>
                </div>
                <div className="text-right text-xs uppercase tracking-[0.2em] text-ink/50">
                  <p>{item.actionType ?? "Action"}</p>
                  <p>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Ban management" subtitle="Active bans and review cadence">
          <div className="space-y-3">
            {bans.length === 0 && <p className="text-sm text-ink/60">No active bans.</p>}
            {bans.map((ban) => (
              <div key={ban.id} className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">User ID {ban.userId ?? "N/A"}</p>
                  <span className="rounded-full bg-ember/15 px-3 py-1 text-xs font-semibold text-ember">
                    {ban.banExpiresAt ? "Temporary" : "Permanent"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink/60">
                  Expires: {ban.banExpiresAt ? new Date(ban.banExpiresAt).toLocaleDateString() : "N/A"}
                </p>
                <button className="mt-3 rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-ink">
                  Review ban
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Automod rule configuration" subtitle="Toggle triggers based on context">
          <div className="space-y-4">
            {automodRules.map((rule) => (
              <div key={rule.rule} className="flex items-center justify-between rounded-2xl bg-ink/5 px-4 py-3">
                <p className="text-sm text-ink">{rule.rule}</p>
                <button
                  className={`rounded-full px-4 py-1 text-xs font-semibold ${
                    rule.active ? "bg-grove/20 text-grove" : "bg-ink/10 text-ink"
                  }`}
                >
                  {rule.active ? "Active" : "Paused"}
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {isModerator && (
        <Panel title="Channel enrollment & bans" subtitle="Manage who is enrolled in a channel">
          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Channel</label>
                <select
                  value={selectedChannel ?? ""}
                  onChange={(event) => {
                    setLoadingSubscribers(true)
                    setSelectedChannel(Number(event.target.value))
                  }}
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
                >
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Ban reason</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(event) => setBanReason(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
                />
              </div>
              <p className="text-xs text-ink/60">
                This action removes the user from the channel and creates a ban record.
              </p>
            </div>

            <div className="space-y-3">
              {loadingSubscribers && <p className="text-sm text-ink/60">Loading subscribers...</p>}
              {!loadingSubscribers && subscribers.length === 0 && (
                <p className="text-sm text-ink/60">No enrolled users for this channel.</p>
              )}
              {subscribers.map((subscriber) => {
                const profile = userMap[subscriber.userId]
                return (
                  <div
                    key={subscriber.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">@{profile?.username ?? "user"}</p>
                      <p className="text-xs text-ink/60">User ID {subscriber.userId}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-ink"
                        onClick={() => handleRemove(subscriber.userId)}
                      >
                        Remove
                      </button>
                      <button
                        className="rounded-full bg-ember px-4 py-2 text-xs font-semibold text-white"
                        onClick={() => handleBan(subscriber.userId)}
                      >
                        Ban from channel
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}
