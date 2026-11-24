import { type ReactNode } from 'react'

export type Evidence = 'experience' | 'prototype' | 'hypothetical'
const EV: Record<Evidence, { label: string; cls: string; dot: string }> = {
  experience: { label: 'Professional experience', cls: 'border-navy-800/30 text-navy-800 bg-navy-900/5', dot: 'bg-navy-800' },
  prototype: { label: 'Personal prototype', cls: 'border-slate2-500/40 text-slate2-600 bg-slate2-500/10', dot: 'bg-slate2-500' },
  hypothetical: { label: 'Hypothetical scenario', cls: 'border-gold/50 text-[#7a5f2c] bg-gold/10', dot: 'bg-gold' }
}
export function EvidenceTag({ kind }: { kind: Evidence }) {
  const e = EV[kind]
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${e.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${e.dot}`} aria-hidden />{e.label}</span>
}

export function PageHeader({ title, intro, tag, step }: { title: string; intro?: ReactNode; tag?: Evidence; step?: string }) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-center gap-3">{step && <p className="eyebrow">{step}</p>}{tag && <EvidenceTag kind={tag} />}</div>
      <h1 className="serif mt-2 text-3xl leading-tight md:text-4xl">{title}</h1>
      {intro && <p className="mt-2 max-w-2xl leading-relaxed text-slate2-600">{intro}</p>}
    </header>
  )
}

export const card = 'rounded-2xl border border-silver-300 bg-white'
export const chip = (on: boolean) => `rounded-full border px-4 py-2 text-sm transition ${on ? 'border-navy-900 bg-navy-900 text-ivory' : 'border-silver-300 bg-ivory-100 text-navy-800 hover:border-navy-800'}`

export function Slider({ id, label, value, min, max, step = 1, unit = '', onChange, hint }: { id: string; label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (n: number) => void; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex justify-between gap-3 text-sm"><span>{label}</span><span className="font-semibold tabular-nums">{value.toLocaleString('en-US', { maximumFractionDigits: step < 1 ? 1 : 0 })}{unit}</span></label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} className="mt-1.5 w-full" />
      {hint && <p className="text-xs text-slate2-500">{hint}</p>}
    </div>
  )
}

export function Callout({ title, children, tone = 'light' }: { title: string; children: ReactNode; tone?: 'light' | 'gold' }) {
  return (
    <aside className={`rounded-xl border p-4 text-sm leading-relaxed ${tone === 'gold' ? 'border-gold/40 bg-gold/10 text-[#5d4720]' : 'border-silver-300 bg-ivory-100 text-slate2-600'}`}>
      <p className="mb-0.5 font-semibold text-navy-900">{title}</p>{children}
    </aside>
  )
}
