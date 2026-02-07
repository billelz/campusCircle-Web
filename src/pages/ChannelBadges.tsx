import { useEffect, useState } from "react"
import { Panel } from "../components/Panel"
import { api, type Channel, type Subscription, type Badge, type UserProfile } from "../lib/api"
import { useAuthStore } from "../stores/auth"

type SubscriberWithBadges = {
  subscription: Subscription
  user?: UserProfile
  badges: Badge[]
}

const BADGE_TYPES = [
  "MODERATOR",
  "TOP_CONTRIBUTOR",
  "VERIFIED",
  "HELPER",
  "VETERAN",
]

export function ChannelBadges() {
  const { token, user } = useAuthStore()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [subscribers, setSubscribers] = useState<SubscriberWithBadges[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribersLoading, setSubscribersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load channels created by current user
  useEffect(() => {
    if (!token || !user?.username) return
    setLoading(true)
    api.getChannelsByCreator(user.username, token)
      .then((data) => {
        setChannels(data)
        if (data.length > 0) {
          setSelectedChannel(data[0])
        }
        setLoading(false)
      })
      .catch((err) => {
        setError("No channels found")
        setLoading(false)
        console.error(err)
      })
  }, [token, user?.username])

  // Load subscribers when channel changes
  useEffect(() => {
    if (!token || !selectedChannel) return
    setSubscribersLoading(true)
    
    api.getChannelSubscribers(selectedChannel.id, token)
      .then(async (subs) => {
        // For each subscriber, get their user info and badges
        const subscribersWithBadges: SubscriberWithBadges[] = await Promise.all(
          subs.map(async (sub) => {
            try {
              const [userInfo, badges] = await Promise.all([
                api.getUserById(sub.userId, token),
                api.getBadges(sub.userId, token),
              ])
              // Filter badges to only those for this channel
              const channelBadges = badges.filter(b => b.channelId === selectedChannel.id)
              return { subscription: sub, user: userInfo, badges: channelBadges }
            } catch {
              return { subscription: sub, badges: [] }
            }
          })
        )
        setSubscribers(subscribersWithBadges)
        setSubscribersLoading(false)
      })
      .catch((err) => {
        setError("No channels found")
        setSubscribersLoading(false)
        console.error(err)
      })
  }, [token, selectedChannel])

  const handleAwardBadge = async (userId: number, badgeType: string) => {
    if (!token || !selectedChannel) return
    try {
      await api.awardBadge({
        userId,
        badgeType,
        channelId: selectedChannel.id,
      }, token)
      // Refresh subscribers list
      const updatedBadges = await api.getBadges(userId, token)
      setSubscribers(prev => prev.map(sub => {
        if (sub.subscription.userId === userId) {
          return { ...sub, badges: updatedBadges.filter(b => b.channelId === selectedChannel.id) }
        }
        return sub
      }))
    } catch (err) {
      console.error("Failed to award badge:", err)
      alert("Failed to award badge")
    }
  }

  const handleRevokeBadge = async (userId: number, badgeType: string) => {
    if (!token || !selectedChannel) return
    try {
      await api.revokeBadge(userId, badgeType, token)
      // Refresh subscribers list
      const updatedBadges = await api.getBadges(userId, token)
      setSubscribers(prev => prev.map(sub => {
        if (sub.subscription.userId === userId) {
          return { ...sub, badges: updatedBadges.filter(b => b.channelId === selectedChannel.id) }
        }
        return sub
      }))
    } catch (err) {
      console.error("Failed to revoke badge:", err)
      alert("Failed to revoke badge")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <Panel title="Error">
        <p className="text-red-500">{error}</p>
      </Panel>
    )
  }

  if (channels.length === 0) {
    return (
      <Panel title="Channel Badge Management">
        <p className="text-ink/60">You haven't created any channels yet. Create a channel to manage badges for its members.</p>
      </Panel>
    )
  }

  return (
    <div className="space-y-8">
      <Panel title="Channel Badge Management" subtitle="Award and manage badges for your channel members">
        <div className="space-y-6">
          {/* Channel Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-ink/70">Select Channel</label>
            <select
              value={selectedChannel?.id ?? ""}
              onChange={(e) => {
                const channel = channels.find(c => c.id === Number(e.target.value))
                setSelectedChannel(channel ?? null)
              }}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
            >
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subscribers List */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Channel Members ({subscribers.length})</h3>
            {subscribersLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : subscribers.length === 0 ? (
              <p className="text-ink/60">No subscribers in this channel yet.</p>
            ) : (
              <div className="space-y-4">
                {subscribers.map((sub) => (
                  <div key={sub.subscription.id} className="rounded-xl border border-ink/10 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sub.user?.username ?? `User #${sub.subscription.userId}`}</p>
                        <p className="text-sm text-ink/60">{sub.user?.email ?? ""}</p>
                        {sub.badges.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {sub.badges.map((badge) => (
                              <span
                                key={badge.id}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                              >
                                {badge.badgeType}
                                <button
                                  onClick={() => handleRevokeBadge(sub.subscription.userId, badge.badgeType)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                  title="Revoke badge"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAwardBadge(sub.subscription.userId, e.target.value)
                              e.target.value = ""
                            }
                          }}
                        >
                          <option value="">Award badge...</option>
                          {BADGE_TYPES.filter(
                            (type) => !sub.badges.some((b) => b.badgeType === type)
                          ).map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Badge Types" subtitle="Available badges you can award">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_TYPES.map((type) => (
            <div key={type} className="rounded-xl border border-ink/10 bg-gradient-to-br from-white to-ink/5 p-4">
              <p className="font-medium">{type}</p>
              <p className="text-sm text-ink/60">
                {type === "MODERATOR" && "Channel moderator with special privileges"}
                {type === "TOP_CONTRIBUTOR" && "Highly active and helpful member"}
                {type === "VERIFIED" && "Verified community member"}
                {type === "HELPER" && "Regularly helps other members"}
                {type === "VETERAN" && "Long-standing channel member"}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
