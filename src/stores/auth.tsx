import { create } from "zustand"
import { api, type Badge, type UserInfo } from "../lib/api"

type AuthState = {
  token: string | null
  refreshToken: string | null
  user: UserInfo | null
  badges: Badge[]
  loading: boolean
  initialized: boolean
  error: string | null
  init: () => Promise<void>
  login: (usernameOrEmail: string, password: string) => Promise<void>
  register: (payload: {
    username: string
    email: string
    password: string
    universityId?: number | null
    realName?: string
  }) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

const STORAGE_KEY = "campuscircle_auth"

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  badges: [],
  loading: false,
  initialized: false,
  error: null,
  init: async () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      set({ initialized: true })
      return
    }
    try {
      const stored = JSON.parse(raw) as { token: string; refreshToken?: string; user?: UserInfo }
      if (!stored.token) {
        set({ initialized: true })
        return
      }
      set({ token: stored.token, refreshToken: stored.refreshToken ?? null, user: stored.user ?? null })
      await get().fetchMe()
      set({ initialized: true })
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      set({ token: null, refreshToken: null, user: null, initialized: true })
    }
  },
  login: async (usernameOrEmail, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.login({ usernameOrEmail, password })
      set({
        token: response.accessToken,
        refreshToken: response.refreshToken ?? null,
        user: response.user ?? null,
        loading: false,
      })
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: response.accessToken, refreshToken: response.refreshToken, user: response.user })
      )
      await get().fetchMe()
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Login failed" })
      throw error
    }
  },
  register: async (payload) => {
    set({ loading: true, error: null })
    try {
      const response = await api.register(payload)
      set({
        token: response.accessToken,
        refreshToken: response.refreshToken ?? null,
        user: response.user ?? null,
        loading: false,
      })
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: response.accessToken, refreshToken: response.refreshToken, user: response.user })
      )
      await get().fetchMe()
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Register failed" })
      throw error
    }
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ token: null, refreshToken: null, user: null, badges: [], error: null })
  },
  fetchMe: async () => {
    const token = get().token
    if (!token) return
    set({ loading: true, error: null })
    try {
      const user = await api.me(token)
      let badges: Badge[] = []
      try {
        badges = await api.getBadges(user.id, token)
      } catch {
        badges = []
      }
      set({ user, badges, loading: false })
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, refreshToken: get().refreshToken, user }))
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Failed to fetch user" })
    }
  },
}))

export const useRoles = () => {
  const { badges, user } = useAuthStore()
  const badgeTypes = new Set(badges.map((badge) => badge.badgeType))
  const isModerator = badgeTypes.has("MODERATOR")
  const isAdmin = badgeTypes.has("ADMIN") || user?.email === "admin@campuscircle.com"
  const isVerified = user?.verificationStatus === "VERIFIED"
  const hasUniversity = Boolean(user?.universityId)
  const isUniversityAdmin = isVerified && hasUniversity

  return { isModerator, isAdmin, isUniversityAdmin }
}
