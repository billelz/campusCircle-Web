import { useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Shell } from "./components/Shell"
import { RequireAuth, RequireRole } from "./components/RequireAuth"
import { AdvancedSearch } from "./pages/AdvancedSearch"
import { Auth } from "./pages/Auth"
import { ChannelAnalytics } from "./pages/ChannelAnalytics"
import { ChannelBadges } from "./pages/ChannelBadges"
import { Dashboard } from "./pages/Dashboard"
import { Landing } from "./pages/Landing"
import { Leaderboards } from "./pages/Leaderboards"
import { Moderation } from "./pages/Moderation"
import { Profile } from "./pages/Profile"
import { University } from "./pages/University"
import { useAuthStore } from "./stores/auth"

function App() {
  const init = useAuthStore((state) => state.init)

  useEffect(() => {
    void init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route element={<Shell />}>
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="/search" element={<AdvancedSearch />} />
          <Route
            path="/moderation"
            element={
              <RequireRole role="moderator">
                <Moderation />
              </RequireRole>
            }
          />
          <Route
            path="/university"
            element={
              <RequireRole role="university">
                <University />
              </RequireRole>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/channel-analytics" element={<ChannelAnalytics />} />
          <Route
            path="/channel-badges"
            element={
              <RequireAuth>
                <ChannelBadges />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
