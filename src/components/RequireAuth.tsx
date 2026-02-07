import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { Panel } from "./Panel"
import { useAuthStore, useRoles } from "../stores/auth"

type RequireAuthProps = {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { token, initialized, loading } = useAuthStore()
  const location = useLocation()

  // Wait for auth initialization before redirecting
  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-ink/60">Loading...</div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

type RequireRoleProps = {
  role: "moderator" | "university" | "admin"
  children: ReactNode
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { token, initialized, loading } = useAuthStore()
  const { isModerator, isUniversityAdmin, isAdmin } = useRoles()

  // Wait for auth initialization before checking roles
  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-ink/60">Loading...</div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/auth" replace />
  }

  // Admin has access to everything
  if (isAdmin) {
    return <>{children}</>
  }

  if (role === "moderator" && !isModerator) {
    return (
      <Panel title="Access restricted" subtitle="Moderator access is required for this dashboard.">
        <p className="text-sm text-ink/70">
          Ask an admin to grant the MODERATOR badge or use another account with moderator access.
        </p>
      </Panel>
    )
  }

  if (role === "admin" && !isAdmin) {
    return (
      <Panel title="Access restricted" subtitle="Admin access is required for this dashboard.">
        <p className="text-sm text-ink/70">
          This dashboard is only accessible to administrators.
        </p>
      </Panel>
    )
  }

  if (role === "university" && !isUniversityAdmin) {
    return (
      <Panel title="University access only" subtitle="This dashboard is limited to verified university staff.">
        <p className="text-sm text-ink/70">
          Verify your university account to unlock aggregated campus insights.
        </p>
      </Panel>
    )
  }

  return <>{children}</>
}
