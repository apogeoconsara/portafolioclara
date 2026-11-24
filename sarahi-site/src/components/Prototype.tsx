import { profile } from '../content/profile'
import { Reveal, Section } from './ui'

const FACTS = [
  ['50,000', 'synthetic business records — no real customer data'],
  ['LLM + API', 'integration with PostgreSQL at defined workflow steps'],
  ['Rules', 'rule-based decisions and exception routing'],
  ['Humans', 'approvals, validation, monitoring and audit trails']
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
      intro="A personal prototype exploring how AI, APIs and business rules share one workflow with control, validation and human approval.">
      <div className="grid gap-10 lg:grid-cols-5">
        <Reveal className="lg:col-span-3 space-y-6">
          <div>
            <h3 className="eyebrow !text-silver-400">The business challenge</h3>
            <p className="mt-2 leading-relaxed text-silver-300">Teams that add AI to an operational process often end up with a clever step surrounded by manual workarounds: unclear ownership of exceptions, no validation of what the AI returned, and no way to see whether it is still behaving. The question I wanted to answer: <em>what does the minimum trustworthy orchestration around an AI step look like?</em></p>
          </div>
          <div>
            <h3 className="eyebrow !text-silver-400">Approach</h3>
            <p className="mt-2 leading-relaxed text-silver-300">Run 50,000 synthetic records through one pipeline backed by PostgreSQL, and make every stage observable: validation → rule-based decisions → LLM/API step → exception routing → human approval → monitoring and audit trail. Documented to show how automation can be more reliable without bypassing operational risk controls.</p>
          </div>
          <ol aria-label="Pipeline architecture" className="flex flex-wrap items-stretch gap-2 text-sm">
            {['Records', 'Validate', 'Rules', 'LLM / API step', 'Exceptions', 'Human approval', 'Audit trail'].map((x, k, a) => (
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
            <p className="font-semibold">Status: prototype</p>
            <p className="mt-1 text-silver-300">Runs on synthetic data. Not a production deployment, and no outcome claims.</p>
          </div>
        </Reveal>
      </div>
      <Reveal className="mt-10">
        <h3 className="serif text-2xl">Technical decisions, and why</h3>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 md:grid-cols-2">
          {DECISIONS.map(([t, d]) => <div key={t} className="bg-navy-900 p-6"><p className="font-semibold text-ivory">{t}</p><p className="mt-2 text-sm leading-relaxed text-silver-300">{d}</p></div>)}
        </div>
        <p className="mt-6 text-sm text-silver-400">What I would do before any real use: define success measures with the business owner, add audit logging and access controls, run a controlled pilot, and complete a security and compliance review.</p>
      </Reveal>
    </Section>
  )
}
