import { Reveal, Section } from './ui'

const CARDS: { ask: string; tool: string; desc: string; href: string; stage?: number; tag: string }[] = [
  { ask: 'Drive adoption, usage and renewal', tool: 'Adoption plan by role', desc: 'Who needs what, which signal proves it is working, and what happens if you skip it.', href: '#case', stage: 3, tag: 'Hypothetical' },
  { ask: 'Train client teams and end users', tool: 'Microlearning + knowledge check', desc: 'AI and human escalation in ten minutes, with scenarios and instant feedback.', href: '#enablement', tag: 'Hypothetical' },
  { ask: 'Implement on time and on budget', tool: 'Go-live readiness checklist', desc: 'Must-have vs. should-have criteria that produce a go / conditional / no-go.', href: '#case', stage: 2, tag: 'Hypothetical' },
  { ask: 'Analyze performance, recommend improvements', tool: 'Signal-to-action review', desc: 'Pick a signal, see likely causes, the one change to make, and how to verify it.', href: '#case', stage: 4, tag: 'Hypothetical' },
  { ask: 'Show the business impact', tool: 'KPI simulator', desc: 'Change the assumptions and see what has to be true. Every formula is visible.', href: '#impact', tag: 'Hypothetical' },
  { ask: 'Pre-sales and stakeholder discovery', tool: 'Discovery brief', desc: 'Stakeholder questions and measurable objectives, with baselines measured, not assumed.', href: '#case', stage: 0, tag: 'Hypothetical' },
  { ask: 'Document processes, diagram the flow', tool: 'Process flow with options', desc: 'Change channel, handoff and fallback; the diagram and its trade-offs update.', href: '#case', stage: 1, tag: 'Hypothetical' },
  { ask: 'Advise on prompts and generative AI', tool: 'Prompt clinic', desc: 'Build a safer assistant prompt block by block and test it against five customer messages.', href: '#prompts', tag: 'Hypothetical' },
  { ask: 'Apply responsible AI in practice', tool: 'Escalation rules tester', desc: 'Sensitive topics go to a person by rule, not by confidence. Try breaking it.', href: '#case', stage: 1, tag: 'Hypothetical' }
]

export default function Portal() {
  return (
    <Section id="fit" eyebrow="Role portal" next={{ id: 'case', label: 'The consulting case' }}
      title="What are you trying to solve?"
      intro="Each card is something an AI consultant is asked to do. Open it and use the working tool behind it.">
      <Reveal>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(c => (
            <li key={c.tool}>
              <a href={c.href} onClick={() => { if (c.stage !== undefined) window.dispatchEvent(new CustomEvent('case-stage', { detail: c.stage })) }}
                className="group flex h-full flex-col rounded-2xl border border-silver-300 bg-ivory-100 p-5 transition hover:-translate-y-0.5 hover:border-navy-800 hover:bg-white">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate2-500">{c.ask}</span>
                <span className="serif mt-2 text-xl leading-snug">{c.tool}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-slate2-600">{c.desc}</span>
                <span className="mt-4 flex items-center justify-between text-xs">
                  <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 font-semibold uppercase tracking-wider text-[#7a5f2c]">{c.tag}</span>
                  <span className="font-semibold text-slate2-600 transition group-hover:translate-x-1">Open →</span>
                </span>
              </a>
            </li>))}
        </ul>
        <p className="mt-5 text-xs text-slate2-500">All tools use a fictional regional bank and synthetic data. Independent portfolio, not affiliated with or endorsed by Glia.</p>
      </Reveal>
    </Section>
  )
}
