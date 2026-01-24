import { useEffect, useMemo, useState } from "react"
import { Panel } from "../components/Panel"
import { api, type Channel, type PostResult, type University } from "../lib/api"

export function AdvancedSearch() {
  const [query, setQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState("")
  const [universityFilter, setUniversityFilter] = useState("")
  const [karmaThreshold, setKarmaThreshold] = useState("")
  const [usernameFilter, setUsernameFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [results, setResults] = useState<PostResult[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void api.getChannels().then(setChannels).catch(() => setChannels([]))
    void api.getUniversities().then(setUniversities).catch(() => setUniversities([]))
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await api.searchPosts(query.trim(), 80)
      setResults(data)
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      if (channelFilter && String(result.channelId) !== channelFilter) return false
      if (usernameFilter && !result.authorUsername?.toLowerCase().includes(usernameFilter.toLowerCase())) return false
      const score = result.netScore ?? result.upvoteCount ?? 0
      if (karmaThreshold && score < Number(karmaThreshold)) return false
      if (startDate) {
        const start = new Date(startDate)
        if (result.createdAt && new Date(result.createdAt) < start) return false
      }
      if (endDate) {
        const end = new Date(endDate)
        if (result.createdAt && new Date(result.createdAt) > end) return false
      }
      if (universityFilter) {
        const channel = channels.find((item) => item.id === result.channelId)
        if (!channel?.universityId || String(channel.universityId) !== universityFilter) return false
      }
      return true
    })
  }, [results, channelFilter, usernameFilter, karmaThreshold, startDate, endDate, channels, universityFilter])

  return (
    <div className="space-y-8">
      <Panel title="Advanced Search" subtitle="Filter by topic, campus, and karma thresholds">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Date range</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Channel</label>
            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
            >
              <option value="">All channels</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-ink/60">University</label>
            <select
              value={universityFilter}
              onChange={(event) => setUniversityFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
            >
              <option value="">All universities</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Karma threshold</label>
            <input
              type="number"
              placeholder="50"
              value={karmaThreshold}
              onChange={(event) => setKarmaThreshold(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-ink/60">Username</label>
            <input
              type="text"
              placeholder="@user"
              value={usernameFilter}
              onChange={(event) => setUsernameFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search posts..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-[220px] flex-1 rounded-full border border-ink/10 bg-white px-5 py-2 text-sm"
          />
          <button
            className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Run search"}
          </button>
          <button className="rounded-full border border-ink/10 px-6 py-2 text-sm font-semibold text-ink">
            Save filter set
          </button>
          <button className="rounded-full border border-ink/10 px-6 py-2 text-sm font-semibold text-ink">
            Export results
          </button>
        </div>
      </Panel>

      <Panel title="Search results" subtitle="Top matches based on your filters">
        <div className="space-y-4">
          {filteredResults.length === 0 && (
            <p className="text-sm text-ink/60">No results yet. Run a search to see matches.</p>
          )}
          {filteredResults.map((result) => {
            const channel = channels.find((item) => item.id === result.channelId)
            const universityName =
              universities.find((uni) => uni.id === channel?.universityId)?.name ?? "General"
            const karma = result.netScore ?? result.upvoteCount ?? 0
            return (
            <div
              key={result.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-white px-5 py-4"
            >
              <div>
                <p className="text-lg font-semibold text-ink">{result.title}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-ink/50">
                  <span>{result.channelName ?? channel?.name ?? "Channel"}</span>
                  <span>{universityName}</span>
                  <span>{result.createdAt ? new Date(result.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="rounded-full bg-ink/5 px-3 py-1 font-semibold">+{karma} karma</span>
                <span className="text-ink/70">@{result.authorUsername}</span>
                <button className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                  View thread
                </button>
              </div>
            </div>
          )})}
        </div>
      </Panel>
    </div>
  )
}
