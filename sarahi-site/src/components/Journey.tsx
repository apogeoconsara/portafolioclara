import { Reveal, Section } from './ui'

const STAGES = [
  ['Citibanamex', 'Learned how banking works', 'Three rotations in treasury, FX and rates, and structured products. Resolved problems across trading, sales, operations and risk, and built two control tools that saved 2+ hours a day.'],
  ['Operations and Automation', 'Made processes work for people', 'Designed and launched a point-of-sale system, led technology rollouts with vendors, and trained staff so the change was adopted.'],
  ['APOGEO', 'Builds AI-powered workflows', 'Connects AI to business systems, turns documents into checked data with human review, and coordinates delivery, testing and monitoring.']
]

export default function Journey() {
  return (
    <Section id="journey" eyebrow="Background" tag="experience"
      title="Understand the work. Change the work. Build the change.">
      <Reveal>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-silver-300 bg-silver-300 md:grid-cols-3">
          {STAGES.map(([n, k, d], i) => (
            <li key={n} className="bg-ivory-100 p-5">
              <span className="text-xs font-semibold tracking-widest text-slate2-400">STAGE {i + 1}</span>
              <h3 className="serif mt-1 text-xl">{n}</h3>
              <p className="text-sm font-medium text-slate2-500">{k}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate2-600">{d}</p>
            </li>))}
        </ol>
        <p className="mt-4 text-sm text-slate2-600">Also: Agentic AI certification · Bloomberg Market Concepts · Spanish, English and French.</p>
      </Reveal>
    </Section>
  )
}
