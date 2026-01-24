import { useEffect, useState } from "react"
import { Panel } from "../components/Panel"
import { api, type UserPreference } from "../lib/api"
import { useAuthStore } from "../stores/auth"

const interestTags = ["AI & ML", "Student Housing", "Startup Life", "Wellness", "Campus Events", "Scholarships"]

export function Profile() {
  const { user, token } = useAuthStore()
  const [preferences, setPreferences] = useState<UserPreference>({
    interests: [],
    major: "",
    graduationYear: undefined,
    showMajor: true,
    showGraduationYear: true,
    allowDirectMessages: true,
    shareSentimentData: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.username || !token) return
    void api
      .getUserPreferences(user.username, token)
      .then((data) => setPreferences((prev) => ({ ...prev, ...data })))
      .catch(() => {
        setPreferences((prev) => ({ ...prev, username: user.username }))
      })
  }, [user, token])

  const toggleInterest = (interest: string) => {
    setPreferences((prev) => {
      const list = new Set(prev.interests ?? [])
      if (list.has(interest)) list.delete(interest)
      else list.add(interest)
      return { ...prev, interests: Array.from(list) }
    })
  }

  const handleSave = async () => {
    if (!token || !user?.username) return
    setSaving(true)
    try {
      const payload = { ...preferences, username: user.username }
      const saved = await api.upsertUserPreferences(payload, token)
      setPreferences((prev) => ({ ...prev, ...saved }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <Panel title="Profile customization" subtitle="All fields are optional and can be hidden anytime.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Major</label>
              <input
                type="text"
                placeholder="Computer Science"
                value={preferences.major ?? ""}
                onChange={(event) => setPreferences((prev) => ({ ...prev, major: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Graduation year</label>
              <input
                type="number"
                placeholder="2027"
                value={preferences.graduationYear ?? ""}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    graduationYear: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Interests</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {interestTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                      preferences.interests?.includes(tag)
                        ? "border-ink bg-ink text-white"
                        : "border-ink/10 text-ink hover:bg-ink/5"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                <button className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white">
                  + Add
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-ink/10 bg-white p-5">
            <p className="text-sm font-semibold text-ink">Visibility preferences</p>
            <div className="space-y-3 text-sm text-ink/70">
              {[
                { label: "Show major on profile", key: "showMajor" },
                { label: "Show graduation year", key: "showGraduationYear" },
                { label: "Allow followers to DM", key: "allowDirectMessages" },
                { label: "Share anonymous sentiment data", key: "shareSentimentData" },
              ].map((option) => (
                <label key={option.key} className="flex items-center justify-between gap-3">
                  <span>{option.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean((preferences as Record<string, boolean>)[option.key])}
                    onChange={(event) =>
                      setPreferences((prev) => ({ ...prev, [option.key]: event.target.checked }))
                    }
                    className="h-4 w-4 accent-ink"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
          <button className="rounded-full border border-ink/10 px-6 py-2 text-sm font-semibold text-ink">
            Reset
          </button>
        </div>
      </Panel>
    </div>
  )
}
