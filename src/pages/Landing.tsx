import { Link } from "react-router-dom"
import logo from "../assets/logo.png"

export function Landing() {
  return (
    <div className="min-h-screen text-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 shadow-soft">
            <img src={logo} alt="CampusCircle logo" className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">CampusCircle</p>
            <p className="text-sm font-semibold text-tide">Community intelligence hub</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/auth?mode=login"
            className="rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold text-ink hover:border-ink/30"
          >
            Login
          </Link>
          <Link
            to="/auth?mode=register"
            className="rounded-full bg-tide px-5 py-2 text-sm font-semibold text-white hover:bg-tide/90"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <section className="grid items-center gap-12 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-ink/60">
              Built for every campus
            </p>
            <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
              Turn student chatter into trusted signals and real campus momentum.
            </h1>
            <p className="text-base text-ink/70">
              CampusCircle unites student voices, student services, and university teams into a single
              narrative. Stay ahead of emerging needs, spotlight wins, and keep your community aligned.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/auth?mode=register"
                className="rounded-full bg-tide px-6 py-3 text-sm font-semibold text-white hover:bg-tide/90"
              >
                Start for free
              </Link>
              <Link
                to="/auth?mode=login"
                className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:border-ink/30"
              >
                I already have an account
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-grove/20 blur-2xl" />
            <div className="absolute right-4 top-0 h-28 w-28 rounded-full bg-gold/20 blur-2xl" />
            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
              <div className="space-y-4">
                <div className="rounded-2xl border border-ink/10 bg-haze/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Live pulse</p>
                  <p className="mt-2 text-sm text-ink/80">
                    “The dining hall queue dropped 35% after the new scheduling change.”
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-ink/10 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Trend</p>
                    <p className="mt-2 text-lg font-semibold text-ink">Mental health nights</p>
                    <p className="text-xs text-ink/60">+42% mentions this week</p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Trust index</p>
                    <p className="mt-2 text-lg font-semibold text-ink">92%</p>
                    <p className="text-xs text-ink/60">Verified student feedback</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-tide p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Insight summary</p>
                  <p className="mt-2 text-sm text-white/90">
                    Clubs asking for late-night room access. Students want clearer safety policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Definition</p>
            <h2 className="mt-3 font-display text-3xl text-ink">What is CampusCircle?</h2>
            <p className="mt-4 text-sm text-ink/70">
              CampusCircle is a student-first intelligence layer that turns campus conversations into
              clear, actionable insights for everyone. It helps students find their people, staff
              prioritize support, and universities keep the campus experience cohesive.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-ink/10 bg-white/70 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Focus</p>
              <p className="mt-2 text-base font-semibold text-ink">Signals over noise</p>
              <p className="text-sm text-ink/70">
                Filter the conversation so real issues surface quickly, without losing the human tone.
              </p>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-white/70 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Outcome</p>
              <p className="mt-2 text-base font-semibold text-ink">Faster campus decisions</p>
              <p className="text-sm text-ink/70">
                Translate student feedback into actions that improve services, safety, and belonging.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Core features</p>
              <h2 className="mt-3 font-display text-3xl text-ink">Everything a campus needs to stay aligned</h2>
            </div>
            <Link to="/auth?mode=register" className="text-sm font-semibold text-ink underline">
              Explore with your .edu email
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Verified student profiles",
                copy: "Real students, real context. Keep discussion healthy and trustworthy.",
              },
              {
                title: "Insight dashboards",
                copy: "Visualize trends across safety, wellbeing, academics, and campus life.",
              },
              {
                title: "Moderation workflow",
                copy: "Flag, review, and resolve issues with clear accountability.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-ink/10 bg-white/80 p-6">
                <p className="text-base font-semibold text-ink">{item.title}</p>
                <p className="mt-3 text-sm text-ink/70">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">How it works</p>
            <h2 className="mt-3 font-display text-3xl text-ink">From student voices to campus action</h2>
            <p className="mt-4 text-sm text-ink/70">
              CampusCircle blends verified participation, intelligent tagging, and role-based views so every
              stakeholder sees what matters most.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              {
                title: "Listen",
                copy: "Students share feedback, stories, and questions in a trusted environment.",
              },
              {
                title: "Interpret",
                copy: "CampusCircle identifies priority themes and connects them to services.",
              },
              {
                title: "Act",
                copy: "Teams coordinate responses and report back to the community.",
              },
            ].map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-ink/10 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/60">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-base font-semibold text-ink">{step.title}</p>
                <p className="mt-2 text-sm text-ink/70">{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Why CampusCircle?</p>
          <h2 className="mt-3 font-display text-3xl text-ink">Because student trust is a growth engine</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Amplify student voices without losing nuance.",
              "Connect feedback to action plans and measurable outcomes.",
              "Create a campus culture of transparency and belonging.",
            ].map((reason) => (
              <div key={reason} className="rounded-2xl border border-ink/10 bg-haze/70 p-5">
                <p className="text-sm text-ink/80">{reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Testimonials</p>
          <h2 className="mt-3 font-display text-3xl text-ink">What our students say about us</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "CampusCircle finally gave our student org a way to share wins without shouting into the void.",
                name: "Amani L.",
                role: "Student ambassador",
              },
              {
                quote:
                  "The weekly insight recap shows me where to focus as a peer mentor. It saves me hours.",
                name: "Jordan P.",
                role: "Peer mentor",
              },
              {
                quote:
                  "Seeing feedback turn into real changes makes me feel like the school is listening.",
                name: "Sofia R.",
                role: "First-year student",
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="rounded-3xl border border-ink/10 bg-white/80 p-6">
                <p className="text-sm text-ink/80">“{testimonial.quote}”</p>
                <p className="mt-4 text-sm font-semibold text-ink">{testimonial.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/60 bg-white/70">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">CampusCircle</p>
            <p className="mt-3 text-sm text-ink/70">
              Building trusted campus communities through insight, transparency, and action.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Explore</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-ink/70">
              <Link to="/auth?mode=register">Get started</Link>
              <Link to="/auth?mode=login">Student login</Link>
              <span>University partners</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Contact</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-ink/70">
              <span>hello@campuscircle.app</span>
              <span>Press & partnerships</span>
              <span>Privacy and safety</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
