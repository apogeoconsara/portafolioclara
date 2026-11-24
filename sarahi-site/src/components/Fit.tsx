import { useMemo, useState } from 'react'
import { AREAS, REQS, type Link } from '../content/fit'
import { EvidenceTag, Reveal, Section } from './ui'

const go = (l: Link) => { if (l.stage !== undefined) window.dispatchEvent(new CustomEvent('case-stage', { detail: l.stage })) }

export default function Fit() {
  const [area, setArea] = useState<string>('All')
  const [open, setOpen] = useState('adopt')
  const rows = REQS.filter(r => area === 'All' || r.area === area)
  const stats = useMemo(() => ({
    total: REQS.length,
    exp: REQS.filter(r => r.proof.some(p => p.kind === 'experience')).length,
    tryIt: REQS.filter(r => r.links.some(l => l.href !== '#journey')).length,
    ramp: REQS.filter(r => r.ramp).length
  }), [])
  return (
    <Section id="fit" eyebrow="Role fit" next={{ id: 'plan', label: 'My first 90 days' }}
      title="Here is what the role asks. Here is why I am the right person."
      intro="Open any requirement from the job description. Each one shows the evidence behind it, and says plainly whether it is experience, something I built, or a hypothetical demo you can try.">
      <Reveal>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-silver-300 bg-silver-300 md:grid-cols-4">
          {[[stats.total, 'requirements reviewed'], [stats.exp, 'backed by professional experience'], [stats.tryIt, 'with a demo or build you can try'], [stats.ramp, 'with a ramp-up plan']].map(([n, l]) => (
            <div key={l as string} className="bg-ivory-100 p-4"><dt className="serif text-3xl tabular-nums">{n}</dt><dd className="mt-0.5 text-sm text-slate2-600">{l}</dd></div>))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by area">
          {(['All', ...AREAS] as string[]).map(a => (
            <button key={a} aria-pressed={area === a} onClick={() => { setArea(a); const f = REQS.find(r => a === 'All' || r.area === a); if (f) setOpen(f.id) }}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${area === a ? 'border-navy-900 bg-navy-900 text-ivory' : 'border-silver-300 bg-ivory-100 hover:border-navy-800'}`}>{a}</button>))}
        </div>
        <ul className="mt-5 divide-y divide-silver-300 border-y border-silver-300">
          {rows.map(r => {
            const isOpen = open === r.id
            return (
              <li key={r.id}>
                <h3>
                  <button aria-expanded={isOpen} aria-controls={`fit-${r.id}`} onClick={() => setOpen(isOpen ? '' : r.id)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
                    <span><span className="block text-xs font-semibold uppercase tracking-wider text-slate2-400">{r.area}</span><span className={`serif block text-lg leading-snug md:text-xl ${isOpen ? '' : 'text-slate2-600'}`}>{r.ask}</span></span>
                    <span aria-hidden className={`shrink-0 text-xl text-slate2-400 transition ${isOpen ? 'rotate-45' : ''}`}>+</span>
                  </button>
                </h3>
                {isOpen && (
                  <div id={`fit-${r.id}`} className="grid gap-6 pb-6 md:grid-cols-5">
                    <ul className="space-y-3 md:col-span-3">
                      {r.proof.map(p => <li key={p.text} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3"><span className="sm:w-44 sm:shrink-0"><EvidenceTag kind={p.kind} /></span><span className="text-sm leading-relaxed">{p.text}</span></li>)}
                    </ul>
                    <div className="space-y-4 md:col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {r.links.map(l => <a key={l.label} href={l.href} onClick={() => go(l)} className="rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-ivory transition hover:bg-navy-800">{l.label} →</a>)}
                      </div>
                      {r.ramp && <p className="rounded-xl border border-dashed border-slate2-400 p-3 text-sm leading-relaxed text-slate2-600"><span className="font-semibold text-navy-900">How I would ramp: </span>{r.ramp}</p>}
                    </div>
                  </div>)}
              </li>)
          })}
        </ul>
        <p className="mt-4 text-xs text-slate2-500">Requirements paraphrased from the job description. Independent portfolio, not affiliated with or endorsed by Glia. Hypothetical demos use a fictional bank and synthetic data.</p>
      </Reveal>
    </Section>
  )
}
