import { useState } from 'react'
import { chip } from '../components/ui'
import Brief from './Brief'
import { Slider, card } from '../components/ui'
import { FTE_HOURS } from '../lib/model'
import { share } from '../lib/plan'
import { usePlan } from '../lib/store'

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d })
function Tile({ k, v, sub }: { k: string; v: string; sub: string }) {
  return <div className={`${card} p-4`}><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">{k}</p><p className="serif mt-1 text-3xl tabular-nums">{v}</p><p className="mt-1 text-xs text-slate2-500">{sub}</p><p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-[#7a5f2c]">Simulated</p></div>
}

const SIGNALS = [
  { s: 'Many handoffs on one topic', dx: ['Content is missing or outdated', 'The topic needs identity checks the assistant cannot do', 'The request is being misread'], act: 'Review about 30 handed-over conversations on that topic before changing anything. Fix the content if that is the gap. If it needs identity checks, keep it with a person and tell the customer clearly.', verify: 'Handoff rate for that topic over the next two review cycles' },
  { s: 'Customers give up after the second reply', dx: ['Answers are too long or generic', 'The option to reach a person is hard to find'], act: 'Shorten the answer pattern or make “talk to a person” visible earlier. Change one of the two, so the effect can be attributed.', verify: 'Share who give up, and satisfaction for that flow' },
  { s: 'Satisfaction is lower for assistant-solved chats', dx: ['Fast but unhelpful answers marked as solved', 'Expectations about what the assistant can do'], act: 'Count a chat as solved only when the customer confirms. Review a sample with Compliance and QA.', verify: 'Gap between assistant and person satisfaction' },
  { s: 'Low use in some branches', dx: ['Staff do not know how to introduce it', 'Branch customers have different needs'], act: 'Hold a short session with those teams, collect their objections, and adjust training before touching the assistant.', verify: 'Adoption by branch' }
]

function Signals() {
  const [i, setI] = useState(0); const x = SIGNALS[i]
  return (
    <details className="mt-4 rounded-2xl border border-silver-300 bg-white p-3" aria-labelledby="sig-h">
      <summary id="sig-h" className="cursor-pointer text-sm font-semibold">Monitoring: from signal to action</summary>
      <p className="mt-2 text-xs text-slate2-600">Read the signal, list likely causes, change one thing, then check.</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Signals">{SIGNALS.map((s, k) => <button key={s.s} aria-pressed={i === k} onClick={() => setI(k)} className={chip(i === k)}>{s.s}</button>)}</div>
      <div className="mt-3 grid gap-4 rounded-2xl border border-silver-300 bg-white p-4 text-sm md:grid-cols-3" aria-live="polite">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">Likely causes</p><ul className="mt-1 list-disc space-y-1 pl-4">{x.dx.map(d => <li key={d}>{d}</li>)}</ul></div>
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">One change</p><p className="mt-1 leading-relaxed">{x.act}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">How to verify</p><p className="mt-1 leading-relaxed">{x.verify}</p></div>
      </div>
    </details>
  )
}

export default function Impact() {
  const { input, set, d } = usePlan()
  const [open, setOpen] = useState(false)
  const a = d.assumptions, o = d.out
  const elig = share(d.cases, 'eligible')
  return (
    <>
      <div role="note" className="mb-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-[#5d4720]"><strong>Hypothetical simulation.</strong> Every figure comes from assumptions, not from a real bank or deployment.</div>
      <div className="grid gap-6 md:grid-cols-5">
        <div className="space-y-4 md:col-span-2">
          <Slider id="i-adopt" label="Customers who choose the assistant" value={input.adoption} min={10} max={90} unit="%" onChange={v => set({ adoption: v })} />
          <Slider id="i-res" label="Solved by the assistant alone" value={a.resolved} min={0} max={100} unit="%" onChange={v => set({ resolved: v, escalated: Math.min(a.escalated, 100 - v) })} />
          <Slider id="i-esc" label="Passed to a person" value={a.escalated} min={0} max={100 - a.resolved} unit="%" onChange={v => set({ escalated: v })} hint={`The other ${fmt(100 - a.resolved - a.escalated)}% give up without an answer`} />
          <Slider id="i-aht" label="Minutes a person spends per inquiry" value={input.handleMin} min={2} max={20} onChange={v => set({ handleMin: v })} />
          <p className="text-xs text-slate2-500">From your plan: {elig}% of inquiries are eligible, so adoption of {input.adoption}% means {fmt(a.adoption, 1)}% of all inquiries start in the assistant. Also assumed: handoff summary saves {a.handoffSaving}% of staff time; satisfaction {a.csatAi} (assistant) and {a.csatHuman} (person).</p>
        </div>
        <div className="space-y-4 md:col-span-3">
          <div className="grid grid-cols-2 gap-3" aria-live="polite">
            <Tile k="Solved without a person" v={fmt(o.aiResolved)} sub={`${fmt(o.containmentOfTotal, 1)}% of ${fmt(input.volume)} inquiries`} />
            <Tile k="Passed to a person" v={fmt(o.escalatedCount)} sub={`${fmt(a.escalated)}% of assistant chats`} />
            <Tile k="Staff hours freed / month" v={fmt(o.hoursFreed)} sub={`${fmt(d.capacityPct, 1)}% of team capacity · ≈ ${fmt(o.fte, 1)} FTE`} />
            <Tile k="Customer satisfaction" v={o.csat.toFixed(2)} sub="out of 5, assumed" />
          </div>
          {o.abandonedShare > 10 && <p className="rounded-lg border border-gold/50 bg-gold/10 p-3 text-sm text-[#5d4720]">Watch-out: {fmt(o.abandonedShare, 1)}% of assistant conversations end without an answer. Efficiency that relies on people giving up is not a gain.</p>}
          <div><button aria-expanded={open} onClick={() => setOpen(!open)} className="text-sm font-semibold underline underline-offset-4">{open ? 'Hide' : 'Show'} how every number is calculated</button>
            {open && <ol className="mt-3 space-y-1.5 rounded-xl border border-silver-300 bg-ivory-100 p-4 font-mono text-xs leading-relaxed text-slate2-600">
              <li>eligible share = {elig}% (from Use cases)</li>
              <li>assistant-handled = {fmt(input.volume)} × {fmt(a.adoption, 1)}% = {fmt(o.aiHandled)}</li>
              <li>solved = {fmt(o.aiHandled)} × {a.resolved}% = {fmt(o.aiResolved)}</li>
              <li>passed to a person = {fmt(o.aiHandled)} × {a.escalated}% = {fmt(o.escalatedCount)}</li>
              <li>baseline hours = {fmt(input.volume)} × {a.handleMin} min ÷ 60 = {fmt(o.baselineHours)}</li>
              <li>hours with assistant = [({fmt(o.humanDirect)} × {a.handleMin}) + ({fmt(o.escalatedCount)} × {a.handleMin} × (1 − {a.handoffSaving}%))] ÷ 60 = {fmt(o.newHours)}</li>
              <li>hours freed = {fmt(o.baselineHours)} − {fmt(o.newHours)} = {fmt(o.hoursFreed)}; FTE = ÷ {FTE_HOURS} h</li>
              <li>satisfaction = (solved × {a.csatAi} + person-handled × {a.csatHuman}) ÷ both; abandoned excluded</li></ol>}
          </div>
        </div>
      </div>
      <Signals />
      <details className="mt-3 rounded-2xl border border-silver-300 bg-white p-3"><summary className="cursor-pointer text-sm font-semibold">Plan brief: a one-page summary to copy</summary><div className="mt-3"><Brief /></div></details>
    </>
  )
}
