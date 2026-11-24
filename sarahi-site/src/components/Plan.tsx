import { useState } from 'react'
import { Reveal, Section } from './ui'

const PHASES = [
  { d: 'Days 1–30', t: 'Learn', goal: 'Understand the product, the customers and how implementations really run.', items: ['Shadow implementations, customer calls and account reviews', 'Learn the product deeply enough to demo it and explain its limits', 'Document two real client processes end to end', 'Meet product, engineering and customer-success counterparts'], out: 'A short learning log of what clients ask most and where adoption stalls.' },
  { d: 'Days 31–60', t: 'Contribute', goal: 'Co-deliver with the team and start improving the work.', items: ['Co-lead one implementation with an implementation manager', 'Run a first training session for a client team', 'Draft a reusable enablement checklist from what I saw', 'Bring the first client feedback to product, with evidence'], out: 'One implementation and one training delivered, with lessons written down.' },
  { d: 'Days 61–90', t: 'Own', goal: 'Take responsibility for outcomes with a client.', items: ['Own an adoption plan for a client, with agreed measures', 'Present a first performance review with a specific recommendation', 'Support pre-sales discovery where it fits', 'Agree the next quarter’s goals with my manager'], out: 'A client adoption plan I own and a review presented to the client.' }
]

export default function Plan() {
  const [i, setI] = useState(0)
  const p = PHASES[i]
  return (
    <Section id="plan" eyebrow="If you hire me" next={{ id: 'case', label: 'The consulting case' }}
      title="My first 90 days: learn, contribute, own."
      intro="A consultant who has a plan for the first quarter is easier to trust. This is mine, and it is the same method used in the case below.">
      <Reveal>
        <div role="tablist" aria-label="First 90 days" className="grid grid-cols-3 gap-2">
          {PHASES.map((x, k) => (
            <button key={x.d} role="tab" id={`pl-${k}`} aria-selected={i === k} aria-controls="plpanel" tabIndex={i === k ? 0 : -1} onClick={() => setI(k)}
              onKeyDown={e => { if (e.key === 'ArrowRight') setI(Math.min(2, k + 1)); if (e.key === 'ArrowLeft') setI(Math.max(0, k - 1)) }}
              className="text-left"><span className={`block h-1 rounded-full ${k <= i ? 'bg-navy-900' : 'bg-silver-300'}`} />
              <span className="mt-2 block text-[11px] font-semibold tracking-widest text-slate2-500">{x.d.toUpperCase()}</span>
              <span className={`serif block text-xl ${i === k ? '' : 'text-slate2-400'}`}>{x.t}</span></button>))}
        </div>
        <div id="plpanel" role="tabpanel" aria-labelledby={`pl-${i}`} className="mt-6 grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3"><p className="text-lg leading-relaxed">{p.goal}</p>
            <ul className="mt-4 space-y-2.5">{p.items.map(t => <li key={t} className="flex gap-3 text-slate2-600"><span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-slate2-400" />{t}</li>)}</ul></div>
          <div className="border-l-2 border-gold pl-4 md:col-span-2"><p className="eyebrow">What you would see</p><p className="serif mt-1.5 text-xl leading-snug">{p.out}</p></div>
        </div>
      </Reveal>
    </Section>
  )
}
