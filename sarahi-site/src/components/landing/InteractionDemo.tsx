import { useMemo, useState } from 'react'
import { respond } from '../../lib/assistant'
import { DEFAULT_INPUT, planUseCases } from '../../lib/plan'

const SCENARIOS = [
  { label: 'A routine question', msg: 'What time does the branch open on Saturday?' },
  { label: 'A possible fraud', msg: "There's a charge on my card I didn't make" },
  { label: 'A sensitive situation', msg: 'My husband passed away and I need to close his account' }
]
const STEPS = ['Customer asks', 'Risk check', 'Decision', 'Customer sees']

export default function InteractionDemo() {
  const [i, setI] = useState(0)
  const [step, setStep] = useState(0)
  const cases = useMemo(() => planUseCases(DEFAULT_INPUT), [])
  const r = useMemo(() => respond(SCENARIOS[i].msg, cases, DEFAULT_INPUT, 0), [cases, i])
  const sensitive = r.kind === 'handoff'
  const pick = (k: number) => { setI(k); setStep(0) }
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Scenario">
        {SCENARIOS.map((s, k) => <button key={s.label} aria-pressed={i === k} onClick={() => pick(k)} className={`rounded-full border px-4 py-1.5 text-sm transition ${i === k ? 'border-teal bg-teal text-white' : 'border-white/25 text-silver-300 hover:border-white/60'}`}>{s.label}</button>)}
      </div>
      <ol className="mt-4 flex gap-1.5" aria-label="Progress">{STEPS.map((s, k) => <li key={s} className="flex-1"><span className={`block h-1 rounded-full transition-colors ${k <= step ? 'bg-teal-light' : 'bg-white/15'}`} /><span className={`mt-1 block text-[11px] ${k === step ? 'font-semibold text-white' : 'text-silver-400'}`}>{s}</span></li>)}</ol>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-ivory p-4 text-navy-900" aria-live="polite">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate2-500">What the customer sees</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-end"><p className="max-w-[85%] rounded-2xl bg-navy-900 px-3 py-2 text-white">{SCENARIOS[i].msg}</p></div>
            {step >= 3 && <p className="max-w-[90%] rounded-2xl bg-white px-3 py-2 leading-relaxed">{r.text}</p>}
            {step < 3 && step >= 1 && <p className="text-xs text-slate2-500">One moment…</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 p-4 text-sm text-silver-300" aria-live="polite">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-light">What happens behind the scenes</p>
          <ul className="mt-3 space-y-2.5">
            <li className={step >= 1 ? '' : 'opacity-30'}><b className="text-white">Risk check.</b> {sensitive && r.intent && ['fraud', 'vulnerable', 'complaints', 'person'].includes(r.intent) ? 'Sensitive topic found. The decision is made by rules, with no AI model involved.' : 'No sensitive topic found.'}</li>
            <li className={step >= 2 ? '' : 'opacity-30'}><b className="text-white">Decision.</b> {sensitive ? 'Hand to a person.' : 'Answer from approved content.'} {r.reason}</li>
            <li className={step >= 3 ? '' : 'opacity-30'}><b className="text-white">Result.</b> {sensitive && r.summary ? `The agent receives a summary (topic: ${r.summary.topic}), so the customer never repeats their story.` : `The reply uses only approved text${r.source ? ` (${r.source})` : ''}.`}</li>
          </ul>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={() => setStep(s => Math.min(3, s + 1))} disabled={step >= 3} className="rounded-full bg-teal px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-dark disabled:opacity-40">{step === 0 ? 'Start' : 'Next step'}</button>
        <button onClick={() => setStep(0)} className="text-sm text-silver-300 underline underline-offset-4">Replay</button>
        <span className="text-xs text-silver-400">Rule-based simulation with a made-up bank.</span>
      </div>
    </div>
  )
}
