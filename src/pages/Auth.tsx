import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Panel } from "../components/Panel"
import { useAuthStore } from "../stores/auth"
import logo from "../assets/logo.png"

export function Auth() {
  const navigate = useNavigate()
  const { login, register, loading, error } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<"login" | "register">(() => {
    const modeParam = searchParams.get("mode")
    return modeParam === "login" || modeParam === "register" ? modeParam : "login"
  })
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    usernameOrEmail: "",
    realName: "",
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      if (mode === "login") {
        await login(form.usernameOrEmail, form.password)
      } else {
        await register({
          username: form.username,
          email: form.email,
          password: form.password,
          realName: form.realName || undefined,
        })
      }
      navigate("/dashboard")
    } catch {
      // handled by store
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 shadow-soft">
              <img src={logo} alt="CampusCircle logo" className="h-8 w-8" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">CampusCircle</p>
          </div>
          <h1 className="font-display text-4xl leading-tight text-ink">
            Welcome back to the community intelligence hub.
          </h1>
          <p className="text-sm text-ink/70">
            Sign in to access dashboards, moderation queues, and university insights.
          </p>
          <div className="flex gap-3">
            <button
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                mode === "login" ? "bg-tide text-white" : "border border-ink/10 text-ink"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                mode === "register" ? "bg-tide text-white" : "border border-ink/10 text-ink"
              }`}
              onClick={() => setMode("register")}
              type="button"
            >
              Create account
            </button>
          </div>
        </div>

        <Panel title={mode === "login" ? "Sign in" : "Create your account"} subtitle={mode === "register" ? "Use your university email" : undefined}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Username</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(event) => handleChange("username", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink/60">University email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Real name (optional)</label>
                  <input
                    type="text"
                    value={form.realName}
                    onChange={(event) => handleChange("realName", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
                  />
                </div>
              </>
            )}

            {mode === "login" && (
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Username or email</label>
                <input
                  type="text"
                  required
                  value={form.usernameOrEmail}
                  onChange={(event) => handleChange("usernameOrEmail", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) => handleChange("password", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
              />
            </div>

            {error && <p className="text-sm text-ember">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-tide px-6 py-3 text-sm font-semibold text-white hover:bg-tide/90 disabled:opacity-70"
            >
              {loading ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </Panel>
      </div>
    </div>
  )
}
