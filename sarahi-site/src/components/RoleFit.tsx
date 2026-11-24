import { useState } from 'react'
import { Reveal, Section } from './ui'

type Status = 'experience' | 'prototype' | 'hypothetical' | 'discuss'
const ST: Record<Status, { label: string; cls: string }> = {
  experience: { label: 'Professional experience', cls: 'bg-navy-900/10 text-navy-800 border-navy-800/30' },
  prototype: { label: 'Personal prototype', cls: 'bg-slate2-500/10 text-slate2-600 border-slate2-500/40' },
  hypothetical: { label: 'Illustrated (hypothetical)', cls: 'bg-gold/10 text-[#7a5f2c] border-gold/50' },
  discuss: { label: 'Not claimed here — let’s discuss', cls: 'bg-transparent text-slate2-600 border-dashed border-slate2-400' }
}

const ROWS: { need: string; evidence: string; to: string; toLabel: string; status: Status }[] = [
  { need: 'Drive adoption and usage of AI features', evidence: 'Role-based adoption plan and an adoption ramp you can adjust. Renewal ownership is not claimed.', to: '#case', toLabel: 'Case · Adopt', status: 'hypothetical' },
  { need: 'Train client teams and their end users', evidence: 'A short microlearning module with scenario checks. User enablement is part of my operations experience.', to: '#enablement', toLabel: 'Training', status: 'hypothetical' },
  { need: 'Implement on time and manage rollout', evidence: 'A go/no-go readiness checklist and phased rollout plan. Implementation coordination is part of my operations experience.', to: '#case', toLabel: 'Case · Implement', status: 'hypothetical' },
  { need: 'Analyze AI performance and recommend improvements', evidence: 'Signal-to-action reviews and a transparent KPI simulator with every formula shown.', to: '#impact', toLabel: 'Simulator', status: 'hypothetical' },
  { need: 'Pre-sales discovery and consulting', evidence: 'Stakeholder interviews and measurable objectives with no invented baselines. Not claimed as past pre-sales work.', to: '#case', toLabel: 'Case · Discover', status: 'hypothetical' },
  { need: 'Document processes and diagram flows', evidence: 'A process-flow diagram with the human-escalation path. It is flowchart-style, not formal UML.', to: '#case', toLabel: 'Case diagram', status: 'hypothetical' },
  { need: 'Responsible AI practices', evidence: 'Mandatory human-escalation rules, approved-source answers, synthetic data only, and a configuration I would refuse to recommend.', to: '#case', toLabel: 'Case · Design', status: 'hypothetical' },
  { need: 'Hands-on AI and API understanding', evidence: 'An AI workflow prototype with rules, exceptions, human approval and monitoring over 50,000 synthetic records.', to: '#prototype', toLabel: 'Prototype', status: 'prototype' },
  { need: 'Work across product, engineering and delivery teams', evidence: 'Cross-functional work and operational integrations in my background, and a feedback loop back to design in the case.', to: '#journey', toLabel: 'Journey', status: 'experience' },
  { need: 'Financial services background (bonus)', evidence: 'Financial markets, treasury, FX and rates, structured products and risk controls at Citibanamex.', to: '#journey', toLabel: 'Journey', status: 'experience' },
  { need: 'Prompt engineering guidance for clients', evidence: 'Not documented on this page. I would rather show it live than claim it here.', to: '#why', toLabel: 'Contact', status: 'discuss' },
  { need: 'SaaS and customer-success tenure, degree, certifications', evidence: 'Not claimed on this page. I will cover these directly and accurately in conversation.', to: '#why', toLabel: 'Contact', status: 'discuss' }
]

const STARTS = [
  ['I have 2 minutes', 'See the role-fit map below', '#fit-map'],
  ['How does she think?', 'Walk through the consulting case', '#case'],
  ['What has she built?', 'Open the AI workflow prototype', '#prototype'],
  ['Does she know banking?', 'Read the professional journey', '#journey']
]

export default function RoleFit() {
  const [f, setF] = useState<Status | 'all'>('all')
  const rows = ROWS.filter(r => f === 'all' || r.status === f)
  return (
    <Section id="fit" eyebrow="Role fit" next={{ id: 'journey', label: 'Professional journey' }}
      title="What the role asks, and where you can see the evidence."
      intro="Start with your own question. Every item links to the part of this page that answers it, and is labelled honestly as experience, prototype, illustration, or something I would rather discuss than overstate.">
      <Reveal>
        <ul className="grid gap-3 md:grid-cols-4" aria-label="Start where your question is">
          {STARTS.map(([q, a, h]) => (
            <li key={q}><a href={h} className="group block h-full rounded-2xl border border-silver-300 bg-ivory-100 p-5 transition hover:-translate-y-0.5 hover:border-navy-800 hover:bg-white">
              <span className="serif block text-lg">{q}</span><span className="mt-1 block text-sm text-slate2-500">{a}</span>
              <span aria-hidden className="mt-3 block text-sm text-slate2-400 transition group-hover:translate-x-1">→</span></a></li>
          ))}
        </ul>
        <div id="fit-map" className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="serif text-2xl">Role-fit map</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by evidence type">
              {(['all', 'experience', 'prototype', 'hypothetical', 'discuss'] as const).map(k => (
                <button key={k} aria-pressed={f === k} onClick={() => setF(k)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${f === k ? 'border-navy-900 bg-navy-900 text-ivory' : 'border-silver-300 bg-ivory-100 hover:border-navy-800'}`}>
                  {k === 'all' ? 'All' : ST[k].label.replace(' — let’s discuss', '')}</button>))}
            </div>
          </div>
          <ul className="mt-5 divide-y divide-silver-300 border-y border-silver-300" aria-live="polite">
            {rows.map(r => (
              <li key={r.need} className="grid gap-2 py-4 md:grid-cols-[1.1fr_1.6fr_auto] md:items-center md:gap-6">
                <p className="font-medium">{r.need}</p>
                <p className="text-sm leading-relaxed text-slate2-600">{r.evidence}</p>
                <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${ST[r.status].cls}`}>{ST[r.status].label}</span>
                  <a href={r.to} className="text-sm font-semibold text-slate2-600 underline underline-offset-4 hover:text-navy-900">{r.toLabel} →</a>
                </div>
              </li>))}
          </ul>
          <p className="mt-4 text-xs text-slate2-500">Requirements paraphrased from the Senior Associate, AI Consultant job description. This page is independent and is not affiliated with or endorsed by Glia.</p>
        </div>
      </Reveal>
    </Section>
  )
}
