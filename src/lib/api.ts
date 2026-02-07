const API_URL = import.meta.env.VITE_API_URL ?? "/api"

export class ApiError extends Error {
  status: number
  payload?: unknown
  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  token?: string | null
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let payload: unknown = undefined
    try {
      payload = await response.json()
    } catch {
      payload = await response.text()
    }
    const message =
      typeof payload === "object" && payload && "error" in (payload as Record<string, unknown>)
        ? String((payload as Record<string, unknown>).error)
        : response.statusText
    throw new ApiError(message, response.status, payload)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export type AuthTokens = {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
}

export type UserInfo = {
  id: number
  username: string
  email: string
  realName?: string
  universityId?: number | null
  universityName?: string | null
  verificationStatus?: string | null
}

export type AuthResponse = AuthTokens & {
  user?: UserInfo
}

export const api = {
  login: (payload: { usernameOrEmail: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: payload }),
  register: (payload: {
    username: string
    email: string
    password: string
    universityId?: number | null
    realName?: string
  }) => apiFetch<AuthResponse>("/auth/register", { method: "POST", body: payload }),
  me: (token: string) => apiFetch<UserInfo>("/auth/me", { token }),
  getBadges: (userId: number, token: string) => apiFetch<Badge[]>(`/badges/user/${userId}`, { token }),
  getBadgeTypes: (token: string) => apiFetch<string[]>(`/badges/types`, { token }),
  awardBadge: (payload: AwardBadgeRequest, token: string) =>
    apiFetch<Badge>(`/badges/award`, { method: "POST", body: payload, token }),
  revokeBadge: (userId: number, badgeType: string, token: string) =>
    apiFetch<void>(`/badges/user/${userId}/type/${badgeType}`, { method: "DELETE", token }),
  getLeaderboard: () => apiFetch<LeaderboardEntry[]>("/karma/leaderboard"),
  getKarma: (userId: number, token: string) => apiFetch<Karma>(`/karma/user/${userId}`, { token }),
  getNotifications: (username: string, token: string) =>
    apiFetch<Notification[]>(`/notifications/user/${username}`, { token }),
  getSavedPosts: (username: string, token: string) =>
    apiFetch<SavedPost>(`/saved-posts/username/${username}`, { token }),
  getModerationQueue: (token: string) => apiFetch<ModerationQueue[]>(`/moderation-queue`, { token }),
  getModerationQueueByStatus: (status: string, token: string) => 
    apiFetch<ModerationQueue[]>(`/moderation-queue/status/${status}`, { token }),
  reviewModerationItem: (id: string, reviewedBy: string, status: string, action: string, token: string) =>
    apiFetch<ModerationQueue>(`/moderation-queue/${id}/review?reviewedBy=${encodeURIComponent(reviewedBy)}&status=${status}&action=${action}`, 
      { method: "PATCH", token }),
  deleteModerationItem: (id: string, token: string) =>
    apiFetch<void>(`/moderation-queue/${id}`, { method: "DELETE", token }),
  getModerationActions: (token: string) => apiFetch<ModerationAction[]>(`/moderation-actions`, { token }),
  getReports: (token: string) => apiFetch<Report[]>(`/reports`, { token }),
  getBans: (token: string) => apiFetch<Ban[]>(`/bans`, { token }),
  createBan: (payload: BanCreate, token: string) =>
    apiFetch<Ban>(`/bans`, { method: "POST", body: payload, token }),
  getChannels: (page = 0, size = 50) =>
    apiFetch<Channel[]>(`/channels?page=${page}&size=${size}`),
  getChannelsByCreator: (username: string, token: string) =>
    apiFetch<Channel[]>(`/channels/created-by/${username}`, { token }),
  getChannelSubscribers: (channelId: number, token: string) =>
    apiFetch<Subscription[]>(`/subscriptions/channel/${channelId}`, { token }),
  unsubscribeUser: (userId: number, channelId: number, token: string) =>
    apiFetch<{ status: string; message: string }>(
      `/subscriptions/unsubscribe?userId=${userId}&channelId=${channelId}`,
      { method: "DELETE", token }
    ),
  getUserById: (userId: number, token: string) => apiFetch<UserProfile>(`/users/${userId}`, { token }),
  getUniversities: () => apiFetch<University[]>(`/universities`),
  searchPosts: (query: string, limit = 50) =>
    apiFetch<PostResult[]>(`/search/posts?q=${encodeURIComponent(query)}&limit=${limit}`),
  getAnalyticsByUser: (userId: number, token: string) =>
    apiFetch<AnalyticsEvent[]>(`/analytics/events/user/${userId}`, { token }),
  getAnalyticsByUniversity: (universityId: number, token: string) =>
    apiFetch<AnalyticsEvent[]>(`/analytics/events/university/${universityId}`, { token }),
  getAnalyticsByChannel: (channelId: number, token: string) =>
    apiFetch<AnalyticsEvent[]>(`/analytics/events/channel/${channelId}`, { token }),
  getTrendingByUniversity: (universityId: number) =>
    apiFetch<TrendingCache[]>(`/trending/university/${universityId}`),
  getUserPreferences: (username: string, token: string) =>
    apiFetch<UserPreference>(`/user-preferences/${username}`, { token }),
  upsertUserPreferences: (payload: UserPreference, token: string) =>
    apiFetch<UserPreference>(`/user-preferences`, { method: "POST", body: payload, token }),
}

export type Badge = {
  id: number
  userId: number
  badgeType: string
  earnedAt?: string
  channelId?: number | null
}

export type AwardBadgeRequest = {
  userId: number
  badgeType: string
  channelId?: number | null
}

export type Karma = {
  id: number
  userId: number
  karmaScore: number
  postKarma: number
  commentKarma: number
  karmaByChannel?: Record<string, number>
  updatedAt?: string
}

export type SavedPost = {
  id: string
  userId: number
  username: string
  savedItems: SavedPostItem[]
}

export type SavedPostItem = {
  postId: number
  postTitle: string
  channelId: number
  channelName: string
  savedAt?: string
  folder?: string
}

export type Notification = {
  id: string
  type: string
  title: string
  message: string
  isRead?: boolean
  createdAt?: string
}

export type ModerationQueue = {
  id: string
  contentId?: string
  contentType?: string
  contentText?: string
  authorUsername?: string
  flaggedAt?: string
  aiModerationScore?: number
  aiFlags?: string[]
  userReports?: Array<{ reporter: string; reason: string }>
  status?: string
  reviewedBy?: string
  reviewedAt?: string
  moderationAction?: string
  // Legacy fields for compatibility
  reason?: string
  score?: number
}

export type ModerationAction = {
  id: number
  moderatorUsername?: string
  actionType?: string
  reason?: string
  createdAt?: string
}

export type Report = {
  id: number
  reason?: string
  description?: string
  createdAt?: string
  reporterUsername?: string
}

export type Ban = {
  id: number
  userId?: number
  reason?: string
  banExpiresAt?: string
  expiresAt?: string
  createdAt?: string
}

export type BanCreate = {
  userId: number
  bannedBy?: number
  reason?: string
  duration?: number | null
  expiresAt?: string | null
  createdAt?: string
}

export type Subscription = {
  id: number
  userId: number
  channelId: number
  subscribedAt?: string
  notificationEnabled?: boolean
}

export type UserProfile = {
  id: number
  username: string
  email?: string
  realName?: string
  universityId?: number | null
  universityName?: string | null
  graduationYear?: number | null
  major?: string | null
  totalKarma?: number | null
  badges?: string[]
}

export type Channel = {
  id: number
  name: string
  description?: string
  universityId?: number | null
  universityName?: string | null
  category?: string | null
  subscriberCount?: number | null
}

export type University = {
  id: number
  name: string
}

export type PostResult = {
  id: number
  authorUsername: string
  channelId: number
  channelName?: string
  title: string
  content?: string
  upvoteCount?: number
  downvoteCount?: number
  netScore?: number
  commentCount?: number
  createdAt?: string
}

export type AnalyticsEvent = {
  id: string
  eventType: string
  eventCategory?: string
  userId?: number
  username?: string
  channelId?: number
  universityId?: number
  contentId?: number
  contentType?: string
  timestamp?: string
}

export type TrendingCache = {
  id: string
  cacheType: string
  universityId: number
  timeframe: string
  items?: Array<{
    name?: string
    value?: number
    score?: number
  }>
}

export type LeaderboardEntry = {
  id: number
  username: string
  profilePictureUrl?: string
  totalUpvotes?: number
  totalKarma?: number
  postKarma?: number
  commentKarma?: number
}

export type UserPreference = {
  id?: string
  username?: string
  interests?: string[]
  major?: string
  graduationYear?: number
  showMajor?: boolean
  showGraduationYear?: boolean
  allowDirectMessages?: boolean
  shareSentimentData?: boolean
}
