import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export type Evidence = 'experience' | 'prototype' | 'hypothetical'

const EV: Record<Evidence, { label: string; cls: string; dot: string }> = {
  experience: { label: 'Professional experience', cls: 'border-navy-800/30 text-navy-800 bg-navy-900/5', dot: 'bg-navy-800' },
  prototype: { label: 'Personal prototype', cls: 'border-slate2-500/40 text-slate2-600 bg-slate2-500/10', dot: 'bg-slate2-500' },
  hypothetical: { label: 'Hypothetical scenario', cls: 'border-gold/50 text-[#7a5f2c] bg-gold/10', dot: 'bg-gold' }
}

export function EvidenceTag({ kind, dark = false, children }: { kind: Evidence; dark?: boolean; children?: ReactNode }) {
  const e = EV[kind]
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${dark ? 'border-white/30 text-ivory bg-white/10' : e.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dark ? 'bg-silver-300' : e.dot}`} aria-hidden />
      {children ?? e.label}
    </span>
  )
}

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

export function Section({ id, eyebrow, title, intro, tag, dark = false, next, children }: {
  next?: { id: string; label: string }; id: string; eyebrow: string; title: ReactNode; intro?: ReactNode; tag?: Evidence; dark?: boolean; children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`${dark ? 'bg-navy-900 text-ivory on-dark' : ''} py-12 md:py-[4.5rem]`}>
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <p className={`eyebrow ${dark ? '!text-silver-400' : ''}`}>{eyebrow}</p>
            {tag && <EvidenceTag kind={tag} dark={dark} />}
          </div>
          <h2 id={`${id}-h`} className="serif mt-3 max-w-3xl text-2xl leading-[1.15] md:text-4xl">{title}</h2>
          {intro && <p className={`mt-3 max-w-2xl text-base leading-relaxed md:text-lg ${dark ? 'text-silver-300' : 'text-slate2-600'}`}>{intro}</p>}
        </Reveal>
        <div className="mt-8">{children}</div>
        {next && (
          <div className={`mt-10 flex justify-end border-t pt-4 ${dark ? 'border-white/15' : 'border-silver-300'}`}>
            <a href={`#${next.id}`} className={`group text-sm font-semibold ${dark ? 'text-silver-300 hover:text-ivory' : 'text-slate2-600 hover:text-navy-900'}`}>
              Next: {next.label} <span aria-hidden className="inline-block transition group-hover:translate-x-1">→</span></a>
          </div>)}
      </div>
    </section>
  )
}

export function Callout({ title, children, tone = 'light' }: { title: string; children: ReactNode; tone?: 'light' | 'gold' }) {
  return (
    <aside className={`rounded-xl border p-5 text-sm leading-relaxed ${tone === 'gold' ? 'border-gold/40 bg-gold/10 text-[#5d4720]' : 'border-silver-300 bg-ivory-100 text-slate2-600'}`}>
      <p className="mb-1 font-semibold text-navy-900">{title}</p>{children}
    </aside>
  )
}

export const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-white hover:-translate-y-0.5'
export const btnGhost = 'inline-flex items-center justify-center gap-2 rounded-full border border-silver-400/50 px-6 py-3 text-sm font-semibold text-ivory transition hover:border-ivory hover:bg-white/5'
