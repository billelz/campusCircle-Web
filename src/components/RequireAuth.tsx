import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { Panel } from "./Panel"
import { useAuthStore, useRoles } from "../stores/auth"

type RequireAuthProps = {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { token } = useAuthStore()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

type RequireRoleProps = {
  role: "moderator" | "university"
  children: ReactNode
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { token } = useAuthStore()
  const { isModerator, isUniversityAdmin } = useRoles()

  if (!token) {
    return <Navigate to="/auth" replace />
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
