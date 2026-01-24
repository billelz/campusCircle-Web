import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Shell } from "./components/Shell"
import { RequireAuth, RequireRole } from "./components/RequireAuth"
import { AdvancedSearch } from "./pages/AdvancedSearch"
import { Auth } from "./pages/Auth"
import { ChannelAnalytics } from "./pages/ChannelAnalytics"
import { Dashboard } from "./pages/Dashboard"
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
        <Route path="/auth" element={<Auth />} />
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
