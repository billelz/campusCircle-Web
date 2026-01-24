import type { ReactNode } from "react"

type PanelProps = {
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export function Panel({ title, subtitle, actions, className, children }: PanelProps) {
  return (
    <section
      className={`rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur ${className ?? ""}`}
    >
      {(title || subtitle || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h3 className="font-display text-xl text-ink">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-ink/60">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
