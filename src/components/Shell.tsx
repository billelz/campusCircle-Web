import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuthStore, useRoles } from "../stores/auth"

const navItems = [
  { to: "/dashboard", label: "User Dashboard" },
  { to: "/search", label: "Advanced Search" },
  { to: "/moderation", label: "Moderation" },
  { to: "/university", label: "University Intel" },
  { to: "/profile", label: "Profile Customization" },
  { to: "/leaderboards", label: "Leaderboards" },
  { to: "/channel-analytics", label: "Channel Analytics" },
]

export function Shell() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, token, logout } = useAuthStore()
  const { isModerator, isUniversityAdmin } = useRoles()

  const filteredNav = navItems.filter((item) => {
    if (item.to === "/moderation") return isModerator
    if (item.to === "/university") return isUniversityAdmin
    if (item.to === "/dashboard" || item.to === "/profile") return Boolean(token)
    return true
  })

  return (
    <div className="flex min-h-screen bg-transparent text-ink">
      <aside className="hidden w-72 flex-col gap-8 bg-ink px-6 py-8 text-white lg:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">CampusCircle</p>
          <h1 className="mt-2 font-display text-2xl leading-tight">Community Intelligence Hub</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-white text-ink shadow-soft" : "text-white/80 hover:bg-white/10"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
          <p className="text-white/70">{user ? "Signed in as" : "Guest session"}</p>
          <p className="mt-1 font-semibold">{user?.username ?? "Visitor"}</p>
          <p className="text-xs text-white/60">
            {isModerator ? "Moderator" : isUniversityAdmin ? "University admin" : "Member"}
          </p>
          <div className="mt-4 flex gap-2">
            {token ? (
              <button
                className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink"
                onClick={() => logout()}
              >
                Sign out
              </button>
            ) : (
              <button
                className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink"
                onClick={() => navigate("/auth")}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/50 bg-white/70 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Dashboard</p>
            <h2 className="font-display text-2xl">Live campus signals</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm shadow-soft">
              <span className="h-2 w-2 rounded-full bg-grove" />
              <span>Syncing every 5 min</span>
            </div>
            <button className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink/90">
              New Report
            </button>
            <button
              className="flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              Menu
            </button>
          </div>
        </header>
        {mobileOpen && (
          <div className="border-b border-white/50 bg-white/90 px-6 py-4 lg:hidden">
            <nav className="grid gap-2">
              {filteredNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "bg-ink text-white" : "border border-ink/10 text-ink"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
        <main className="flex-1 px-6 py-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/50 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3 overflow-x-auto">
            {filteredNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${
                    isActive ? "bg-ink text-white" : "border border-ink/10 text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
