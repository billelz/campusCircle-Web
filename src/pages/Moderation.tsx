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

export function Moderation() {
  const { token, user } = useAuthStore()
  const { isModerator, isAdmin } = useRoles()
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
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")

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
    if (!token || !selectedChannel || !(isModerator || isAdmin)) return
    void api
      .getChannelSubscribers(selectedChannel, token)
      .then((data) => setSubscribers(data))
      .catch(() => setSubscribers([]))
      .finally(() => setLoadingSubscribers(false))
  }, [token, selectedChannel, isModerator, isAdmin])

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

  const handleApprove = async (item: ModerationQueue) => {
    if (!token || !user) return
    setReviewingId(item.id)
    try {
      await api.reviewModerationItem(item.id, user.username, "approved", "none", token)
      setQueue((prev) => prev.filter((q) => q.id !== item.id))
    } catch (error) {
      console.error("Failed to approve:", error)
    }
    setReviewingId(null)
  }

  const handleReject = async (item: ModerationQueue) => {
    if (!token || !user) return
    setReviewingId(item.id)
    try {
      await api.reviewModerationItem(item.id, user.username, "rejected", "content_removed", token)
      setQueue((prev) => prev.filter((q) => q.id !== item.id))
    } catch (error) {
      console.error("Failed to reject:", error)
    }
    setReviewingId(null)
  }

  const handleBanUser = async (item: ModerationQueue) => {
    if (!token || !user) return
    setReviewingId(item.id)
    try {
      await api.reviewModerationItem(item.id, user.username, "rejected", "user_banned", token)
      setQueue((prev) => prev.filter((q) => q.id !== item.id))
    } catch (error) {
      console.error("Failed to ban user:", error)
    }
    setReviewingId(null)
  }

  const filteredQueue = useMemo(() => {
    if (filter === "all") return queue
    return queue.filter((item) => item.status?.toLowerCase() === filter)
  }, [queue, filter])

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
      if (row && (item.status === "approved" || item.status === "rejected")) row.resolved += 1
    })
    return base
  }, [reports, queue])

  const getFlagColor = (flag: string) => {
    const lowerFlag = flag.toLowerCase()
    if (lowerFlag.includes("toxic") || lowerFlag.includes("hate")) return "bg-ember/15 text-ember"
    if (lowerFlag.includes("spam")) return "bg-gold/30 text-ink"
    if (lowerFlag.includes("crisis") || lowerFlag.includes("self")) return "bg-purple-100 text-purple-700"
    return "bg-ink/10 text-ink"
  }

  return (
    <div className="space-y-8">
      {/* AI Moderation Queue */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="AI Moderation Queue" subtitle="Content flagged by AI for review">
          <div className="mb-4 flex gap-2">
            {(["pending", "all", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${
                  filter === f ? "bg-tide text-white" : "border border-ink/10 text-ink"
                }`}
              >
                {f} {f === "pending" && `(${queue.filter((q) => q.status?.toLowerCase() === "pending").length})`}
              </button>
            ))}
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredQueue.length === 0 && (
              <p className="text-sm text-ink/60">No items in queue matching this filter.</p>
            )}
            {filteredQueue.map((item) => (
              <div key={item.id} className="rounded-3xl border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-ink/40">
                        {item.contentType ?? "content"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.status === "pending"
                            ? "bg-gold/30 text-ink"
                            : item.status === "approved"
                              ? "bg-grove/20 text-grove"
                              : "bg-ember/15 text-ember"
                        }`}
                      >
                        {item.status ?? "pending"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-ink">
                      by @{item.authorUsername ?? "unknown"}
                    </p>
                  </div>
                  {item.aiModerationScore !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-ink/40">Toxicity Score</p>
                      <p
                        className={`text-lg font-bold ${
                          item.aiModerationScore > 0.7
                            ? "text-ember"
                            : item.aiModerationScore > 0.4
                              ? "text-gold"
                              : "text-grove"
                        }`}
                      >
                        {(item.aiModerationScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Content preview */}
                <div className="mt-3 rounded-2xl bg-ink/5 p-4">
                  <p className="text-sm text-ink/80 whitespace-pre-wrap">
                    {item.contentText || item.reason || "No content available for preview."}
                  </p>
                </div>

                {/* AI Flags */}
                {item.aiFlags && item.aiFlags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.aiFlags.map((flag, idx) => (
                      <span
                        key={idx}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getFlagColor(flag)}`}
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                )}

                {/* User reports */}
                {item.userReports && item.userReports.length > 0 && (
                  <div className="mt-3 border-t border-ink/10 pt-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40 mb-2">
                      User Reports ({item.userReports.length})
                    </p>
                    <div className="space-y-1">
                      {item.userReports.slice(0, 3).map((report, idx) => (
                        <p key={idx} className="text-xs text-ink/60">
                          @{report.reporter}: {report.reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flagged time */}
                {item.flaggedAt && (
                  <p className="mt-3 text-xs text-ink/40">
                    Flagged {new Date(item.flaggedAt).toLocaleString()}
                  </p>
                )}

                {/* Action buttons */}
                {item.status?.toLowerCase() === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={reviewingId === item.id}
                      className="rounded-full bg-grove px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {reviewingId === item.id ? "Processing..." : "Approve Content"}
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      disabled={reviewingId === item.id}
                      className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Remove Content
                    </button>
                    <button
                      onClick={() => handleBanUser(item)}
                      disabled={reviewingId === item.id}
                      className="rounded-full border border-ember px-4 py-2 text-sm font-semibold text-ember disabled:opacity-50"
                    >
                      Ban User
                    </button>
                  </div>
                )}

                {/* Reviewed info */}
                {item.reviewedBy && (
                  <p className="mt-3 text-xs text-ink/40">
                    Reviewed by @{item.reviewedBy} • Action: {item.moderationAction ?? "none"}
                  </p>
                )}
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
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-ink/5 p-4 text-center">
              <p className="text-2xl font-bold text-ink">{queue.length}</p>
              <p className="text-xs text-ink/60">Total in Queue</p>
            </div>
            <div className="rounded-2xl bg-ink/5 p-4 text-center">
              <p className="text-2xl font-bold text-ember">
                {queue.filter((q) => q.status?.toLowerCase() === "pending").length}
              </p>
              <p className="text-xs text-ink/60">Pending Review</p>
            </div>
          </div>
        </Panel>
      </section>

      {/* User Reports */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title="User Reports" subtitle="Content reported by users">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {reports.length === 0 && <p className="text-sm text-ink/60">No user reports yet.</p>}
            {reports.slice(0, 10).map((report) => (
              <div key={report.id} className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">Report #{report.id}</p>
                  <span className="text-xs text-ink/40">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink/60">by @{report.reporterUsername ?? "anonymous"}</p>
                <p className="mt-2 text-sm text-ink/80">{report.reason ?? report.description ?? "No reason provided"}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Moderation Actions" subtitle="Recent moderation history">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {actions.length === 0 && <p className="text-sm text-ink/60">No moderation actions yet.</p>}
            {actions.slice(0, 10).map((item) => (
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

        <Panel title="Active Bans" subtitle="Currently banned users">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {bans.length === 0 && <p className="text-sm text-ink/60">No active bans.</p>}
            {bans.map((ban) => (
              <div key={ban.id} className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">User ID {ban.userId ?? "N/A"}</p>
                  <span className="rounded-full bg-ember/15 px-3 py-1 text-xs font-semibold text-ember">
                    {ban.banExpiresAt || ban.expiresAt ? "Temporary" : "Permanent"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink/60">{ban.reason ?? "No reason provided"}</p>
                <p className="mt-2 text-xs text-ink/40">
                  Expires: {ban.banExpiresAt || ban.expiresAt 
                    ? new Date(ban.banExpiresAt || ban.expiresAt!).toLocaleDateString() 
                    : "Never"}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {/* Channel Management - for moderators/admins */}
      {(isModerator || isAdmin) && (
        <Panel title="Channel Enrollment & Bans" subtitle="Manage who is enrolled in a channel">
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

            <div className="space-y-3 max-h-80 overflow-y-auto">
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
