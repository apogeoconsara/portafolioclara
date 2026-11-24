import { useState } from 'react'
import { Reveal, Section } from './ui'

const STAGES = [
  {
    n: '01', name: 'Citibanamex', kicker: 'Learn how banking actually works',
    topics: ['Financial markets & treasury', 'FX and rates', 'Structured products', 'Risk controls', 'Cross-functional financial operations'],
    gives: 'A working feel for regulated environments: why controls exist, how desks, operations and risk depend on each other, and what an exception costs when it is handled badly.',
    carries: 'The instinct to ask “what is the control here, and who owns the exception?” before designing anything.'
  },
  {
    n: '02', name: 'Operations and Automation', kicker: 'Make processes work for the people using them',
    topics: ['Process improvement', 'Operational technology', 'Implementation coordination', 'User enablement'],
    gives: 'Experience on the receiving end of change: coordinating implementation across teams and helping users actually adopt new ways of working.',
    carries: 'The habit of treating adoption as part of the design, not something that happens after launch.'
  },
  {
    n: '03', name: 'APOGEO', kicker: 'Build the AI-enabled workflow myself',
    topics: ['AI-enabled workflows', 'APIs & process automation', 'Validation, testing & monitoring', 'Operational integrations'],
    gives: 'Hands-on delivery: wiring AI into real process steps through APIs, then proving it behaves through validation, testing and monitoring.',
    carries: 'Enough technical depth to speak credibly with engineers, and enough business context to speak credibly with the people who will use the result.'
  }
]

export default function Journey() {
  const [i, setI] = useState(2)
  const s = STAGES[i]
  return (
    <Section id="journey" eyebrow="My professional journey" tag="experience"
      title={<>Three stages, one direction: from understanding the work to <em className="not-italic text-slate2-500">changing</em> it.</>}
      intro="This is not a list of unrelated jobs. Each stage added something the next one depended on — domain knowledge, then change in practice, then the ability to build.">
      <Reveal>
        <div role="tablist" aria-label="Career stages" className="grid gap-px overflow-hidden rounded-2xl border border-silver-300 bg-silver-300 md:grid-cols-3">
          {STAGES.map((st, k) => (
            <button key={st.n} role="tab" id={`jt-${k}`} aria-selected={i === k} aria-controls="jpanel" onClick={() => setI(k)}
              onKeyDown={e => { if (e.key === 'ArrowRight') setI((k + 1) % 3); if (e.key === 'ArrowLeft') setI((k + 2) % 3) }}
              tabIndex={i === k ? 0 : -1}
              className={`text-left p-6 transition ${i === k ? 'bg-navy-900 text-ivory' : 'bg-ivory-100 hover:bg-white'}`}>
              <span className={`text-xs font-semibold tracking-widest ${i === k ? 'text-silver-400' : 'text-slate2-400'}`}>STAGE {st.n}</span>
              <span className="serif mt-2 block text-2xl">{st.name}</span>
              <span className={`mt-1 block text-sm ${i === k ? 'text-silver-300' : 'text-slate2-500'}`}>{st.kicker}</span>
            </button>
          ))}
        </div>
        <div id="jpanel" role="tabpanel" aria-labelledby={`jt-${i}`} className="mt-8 grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <p className="eyebrow">Focus areas</p>
            <ul className="mt-4 space-y-2.5">
              {s.topics.map(t => <li key={t} className="flex gap-3 text-slate2-600"><span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-slate2-400" />{t}</li>)}
            </ul>
          </div>
          <div className="md:col-span-3 space-y-6">
            <div><p className="eyebrow">What it gave me</p><p className="mt-2 text-lg leading-relaxed">{s.gives}</p></div>
            <div className="border-l-2 border-gold pl-5"><p className="eyebrow">What I carry forward</p><p className="serif mt-2 text-xl leading-snug">{s.carries}</p></div>
          </div>
        </div>
        <p className="mt-12 max-w-3xl text-slate2-600">
          <span className="font-semibold text-navy-900">The through-line:</span> banking taught me what must not break, operations taught me what people will actually use, and building at APOGEO taught me how to make AI do useful work inside those limits. An AI consultant needs all three.
        </p>
      </Reveal>
    </Section>
  )
}
