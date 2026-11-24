import { useState } from 'react'
import { Reveal, Section } from './ui'

const STAGES = [
  {
    n: '01', name: 'Citibanamex', kicker: 'Learn how banking actually works',
    topics: ['Three rotations: treasury, FX and rates, structured products', 'Resolved problems across trading, sales, operations and risk', 'Built two internal control tools that saved 2+ hours daily'],
    gives: 'Why controls exist, how desks, operations and risk depend on each other, and what an exception costs when it is handled badly.',
    carries: 'Ask “what is the control here, and who owns the exception?” before designing anything.'
  },
  {
    n: '02', name: 'Operations and Automation', kicker: 'Make processes work for the people using them',
    topics: ['Designed and launched a point-of-sale system', 'Led technology rollouts with vendors and technicians', 'Trained staff and coordinated handoffs for adoption'],
    gives: 'Experience on the receiving end of change: coordinating implementation and making sure people actually adopt the new way of working.',
    carries: 'Treat adoption as part of the design, not something that happens after launch.'
  },
  {
    n: '03', name: 'APOGEO', kicker: 'Build the AI-enabled workflow myself',
    topics: ['AI-powered customer workflows connected to business systems', 'Turning documents into checked data, with human review', 'Coordinating delivery, testing and monitoring'],
    gives: 'Turning business needs into clear rules and approval steps, then proving they work.',
    carries: 'Enough technical depth to speak with engineers, and enough business context to speak with the people who will use the result.'
  }
]

export default function Journey() {
  const [i, setI] = useState(2)
  const s = STAGES[i]
  return (
    <Section next={{ id: 'prototype', label: 'Selected work: the AI prototype' }} id="journey" eyebrow="Background · 30 sec" tag="experience"
      title="Why this page works the way it does."
      intro="Three stages, one direction: understand the work, change the work, then build the change.">
      <Reveal>
        <div role="tablist" aria-label="Career stages" className="grid gap-px overflow-hidden rounded-2xl border border-silver-300 bg-silver-300 md:grid-cols-3">
          {STAGES.map((st, k) => (
            <button key={st.n} role="tab" id={`jt-${k}`} aria-selected={i === k} aria-controls="jpanel" onClick={() => setI(k)}
              onKeyDown={e => { if (e.key === 'ArrowRight') setI((k + 1) % 3); if (e.key === 'ArrowLeft') setI((k + 2) % 3) }}
              tabIndex={i === k ? 0 : -1}
              className={`p-5 text-left transition ${i === k ? 'bg-navy-900 text-ivory' : 'bg-ivory-100 hover:bg-white'}`}>
              <span className={`text-xs font-semibold tracking-widest ${i === k ? 'text-silver-400' : 'text-slate2-400'}`}>STAGE {st.n}</span>
              <span className="serif mt-2 block text-2xl">{st.name}</span>
              <span className={`mt-1 block text-sm ${i === k ? 'text-silver-300' : 'text-slate2-500'}`}>{st.kicker}</span>
            </button>
          ))}
        </div>
        <div id="jpanel" role="tabpanel" aria-labelledby={`jt-${i}`} className="mt-6">
          <div className="grid gap-8 md:grid-cols-5">
            <ul className="space-y-2.5 md:col-span-3">
              {s.topics.map(t => <li key={t} className="flex gap-3 text-slate2-600"><span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-slate2-400" />{t}</li>)}
            </ul>
            <div className="space-y-5 md:col-span-2">
              <div><p className="eyebrow">What it gave me</p><p className="mt-1.5 leading-relaxed">{s.gives}</p></div>
              <div className="border-l-2 border-gold pl-4"><p className="eyebrow">What I carry forward</p><p className="serif mt-1.5 text-lg leading-snug">{s.carries}</p></div>
            </div>
          </div>
        </div>
        <p className="mt-8 max-w-3xl text-slate2-600">
          <span className="font-semibold text-navy-900">The through-line:</span> banking sets what must not break, operations shows what people will actually use, and building shows how to make AI useful inside those limits.
        </p>
        <p className="mt-4 text-sm text-slate2-500">Also relevant: Agentic AI certification · Bloomberg Market Concepts · Spanish, English and French.</p>
      </Reveal>
    </Section>
  )
}
