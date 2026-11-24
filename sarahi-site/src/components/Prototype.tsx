import { profile } from '../content/profile'
import { Reveal, Section } from './ui'

const FACTS = [
  ['50,000', 'synthetic business records — no real customer data'],
  ['AI + API', 'integration at defined steps of the workflow'],
  ['Rules', 'deterministic decision logic around the AI'],
  ['Humans', 'approval gates and an exception-handling path']
]

const DECISIONS = [
  ['Rules decide; AI assists.', 'Routing and eligibility use explicit rules that can be read, tested and audited. AI is used where language or judgment-like input is genuinely needed, never as the sole gate on a consequential action.'],
  ['Exceptions are a first-class path.', 'Records that fail validation or fall outside the rules go to a queue instead of being forced through. Most real-world process pain lives here, so it is designed for, not patched later.'],
  ['A person approves what matters.', 'Higher-impact actions wait for human approval. The same principle drives the escalation design in the consulting case below.'],
  ['Synthetic data on purpose.', 'Volume (50,000 records) tests whether the logic and monitoring hold up at scale without exposing anyone’s information.']
]

export default function Prototype() {
  return (
    <Section next={{ id: 'case', label: 'Interactive consulting case' }} id="prototype" eyebrow="Selected work" tag="prototype" dark
      title="AI workflow orchestration prototype"
      intro="A working prototype I built to explore how AI, APIs and business rules can share one workflow without losing control. It is a personal prototype — not a production system.">
      <div className="grid gap-10 lg:grid-cols-5">
        <Reveal className="lg:col-span-3 space-y-8">
          <div>
            <h3 className="eyebrow !text-silver-400">The business challenge</h3>
            <p className="mt-3 text-lg leading-relaxed text-silver-300">Teams that add AI to an operational process often end up with a clever step surrounded by manual workarounds: unclear ownership of exceptions, no validation of what the AI returned, and no way to see whether it is still behaving. The question I wanted to answer: <em>what does the minimum trustworthy orchestration around an AI step look like?</em></p>
          </div>
          <div>
            <h3 className="eyebrow !text-silver-400">Approach</h3>
            <p className="mt-3 text-lg leading-relaxed text-silver-300">Generate a large synthetic dataset, route every record through the same pipeline, and make each stage observable: ingestion → validation → rule-based decisions → AI/API enrichment → exception handling → human approval → monitoring.</p>
          </div>
          <ol aria-label="Pipeline architecture" className="flex flex-wrap items-stretch gap-2 text-sm">
            {['Ingest', 'Validate', 'Rules', 'AI / API step', 'Exceptions', 'Human approval', 'Monitor'].map((x, k, a) => (
              <li key={x} className="flex items-center gap-2">
                <span className={`rounded-lg border px-3 py-2 ${x === 'Human approval' || x === 'Exceptions' ? 'border-gold/60 bg-gold/10 text-ivory' : 'border-white/20 bg-white/5 text-silver-300'}`}>{x}</span>
                {k < a.length - 1 && <span aria-hidden className="text-slate2-400">→</span>}
              </li>
            ))}
          </ol>
          <a href={profile.prototypeUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-white">
            Open the live prototype <span aria-hidden>↗</span><span className="sr-only">(opens in a new tab)</span>
          </a>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15">
            {FACTS.map(([k, v]) => (
              <div key={k} className="bg-navy-800 p-5"><dt className="serif text-2xl text-ivory">{k}</dt><dd className="mt-1 text-sm text-silver-400">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-5 text-sm leading-relaxed text-ivory">
            <p className="font-semibold">Honest status</p>
            <p className="mt-1 text-silver-300">This is a prototype running on synthetic data. It has not been deployed to production, has no customers, and I make no claims about financial or operational outcomes from it.</p>
          </div>
        </Reveal>
      </div>
      <Reveal className="mt-16">
        <h3 className="serif text-2xl">Technical decisions, and why</h3>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 md:grid-cols-2">
          {DECISIONS.map(([t, d]) => <div key={t} className="bg-navy-900 p-6"><p className="font-semibold text-ivory">{t}</p><p className="mt-2 text-sm leading-relaxed text-silver-300">{d}</p></div>)}
        </div>
        <p className="mt-6 text-sm text-silver-400">What I would do before any real use: define success measures with the business owner, add audit logging and access controls, run a controlled pilot, and complete a security and compliance review.</p>
      </Reveal>
    </Section>
  )
}
