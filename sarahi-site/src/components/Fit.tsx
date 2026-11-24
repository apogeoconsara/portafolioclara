import { useState } from 'react'
import { REQS, type Link } from '../content/fit'
import { EvidenceTag, Reveal, Section } from './ui'

const go = (l: Link) => { if (l.stage !== undefined) window.dispatchEvent(new CustomEvent('case-stage', { detail: l.stage })) }

export default function Fit() {
  const [open, setOpen] = useState('adopt')
  return (
    <Section id="fit" eyebrow="Role fit · 1 min" next={{ id: 'case', label: 'The consulting case' }}
      title="What the role asks for, and what I can bring."
      intro="Tap an item to see what I have done or built, and where I would still be learning.">
      <Reveal>
        <ul className="divide-y divide-silver-300 border-y border-silver-300">
          {REQS.map(r => {
            const isOpen = open === r.id
            return (
              <li key={r.id}>
                <h3>
                  <button aria-expanded={isOpen} aria-controls={`fit-${r.id}`} onClick={() => setOpen(isOpen ? '' : r.id)} className="flex w-full items-center justify-between gap-4 py-3 text-left">
                    <span><span className="block text-xs font-semibold uppercase tracking-wider text-slate2-400">{r.why}</span><span className={`serif block text-xl leading-snug md:text-2xl ${isOpen ? '' : 'text-slate2-600'}`}>{r.ask}</span></span>
                    <span aria-hidden className={`shrink-0 text-xl text-slate2-400 transition ${isOpen ? 'rotate-45' : ''}`}>+</span>
                  </button>
                </h3>
                {isOpen && (
                  <div id={`fit-${r.id}`} className="grid gap-5 pb-5 md:grid-cols-5">
                    <ul className="space-y-3 md:col-span-3">
                      {r.proof.map(p => <li key={p.text} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3"><span className="sm:w-44 sm:shrink-0"><EvidenceTag kind={p.kind} /></span><span className="leading-relaxed">{p.text}</span></li>)}
                    </ul>
                    <div className="space-y-3 md:col-span-2">
                      <div className="flex flex-wrap gap-2">{r.links.map(l => <a key={l.label} href={l.href} onClick={() => go(l)} className="rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-ivory transition hover:bg-navy-800">{l.label} →</a>)}</div>
                      {r.ramp && <p className="rounded-xl border border-dashed border-slate2-400 p-3 text-sm leading-relaxed text-slate2-600"><span className="font-semibold text-navy-900">How I would ramp: </span>{r.ramp}</p>}
                    </div>
                  </div>)}
              </li>)
          })}
        </ul>
        <p className="mt-4 text-xs text-slate2-500">Independent portfolio, not affiliated with or endorsed by Glia. Demos use a fictional bank and made-up data.</p>
      </Reveal>
    </Section>
  )
}
