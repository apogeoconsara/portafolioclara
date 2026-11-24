import { useState } from 'react'
import { chip } from '../components/ui'
import Brief from './Brief'
import { card } from '../components/ui'
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
  const { input, d } = usePlan()
  const [open, setOpen] = useState(false)
  const a = d.assumptions, o = d.out
  const elig = share(d.cases, 'eligible')
  const t = input.volume || 1
  const per = [
    { label: 'Solved by the assistant', v: (o.aiResolved / t) * 100, c: '#1D3A63' },
    { label: 'Passed to a person, with summary', v: (o.escalatedCount / t) * 100, c: '#B08D4F' },
    { label: 'Customer gave up', v: (o.abandoned / t) * 100, c: '#7388A8' },
    { label: 'Handled by people from the start', v: (o.humanDirect / t) * 100, c: '#B9C0CB' }
  ]
  return (
    <>
      <div role="note" className="mb-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-[#5d4720]"><strong>Hypothetical simulation.</strong> Every figure comes from assumptions, not from a real bank or deployment.</div>
      <p className="mb-3 text-sm leading-relaxed text-slate2-600">Computed from the plan you built in Discover: <b className="text-navy-900">{share(d.cases, 'eligible')}%</b> of inquiries are eligible for the assistant, and {input.adoption}% of those customers choose it. To change the result, change the bank profile in Discover.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
        <Tile k="Solved without a person" v={fmt(o.aiResolved)} sub={`${fmt(o.containmentOfTotal, 1)}% of ${fmt(input.volume)} inquiries a month`} />
        <Tile k="Passed to a person" v={fmt(o.escalatedCount)} sub="with a summary, so nobody repeats themselves" />
        <Tile k="Staff hours back / month" v={fmt(o.hoursFreed)} sub={`${fmt(d.capacityPct, 1)}% of team capacity · ≈ ${fmt(o.fte, 1)} FTE`} />
        <Tile k="Customer satisfaction" v={o.csat.toFixed(2)} sub="out of 5, assumed to hold" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <figure className={`${card} p-4`}>
          <figcaption className="text-sm font-semibold">Where every 100 inquiries go</figcaption>
          <div className="mt-3 flex h-9 overflow-hidden rounded-lg" role="img" aria-label={`Of every 100 inquiries: ${per.map(p => `${fmt(p.v, 0)} ${p.label}`).join(', ')}`}>
            {per.map(p => <div key={p.label} style={{ width: `${p.v}%`, background: p.c }} className={`grid place-items-center text-xs font-semibold transition-[width] duration-700 ${p.c === '#B9C0CB' ? 'text-navy-900' : 'text-ivory'}`}>{p.v >= 7 ? fmt(p.v, 0) : ''}</div>)}
          </div>
          <ul className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">{per.map(p => <li key={p.label} className="flex items-center gap-2"><span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: p.c }} /><span className="flex-1">{p.label}</span><span className="tabular-nums font-semibold">{fmt(p.v, 1)}</span></li>)}</ul>
        </figure>
        <figure className={`${card} p-4`}>
          <figcaption className="text-sm font-semibold">Staff time spent on inquiries, per month</figcaption>
          <div className="mt-3 space-y-3 text-xs">
            {[['Today', o.baselineHours, '#B9C0CB'], ['With the assistant', o.newHours, '#1D3A63']].map(([l, h, c]) => (
              <div key={l as string}><div className="mb-1 flex justify-between"><span>{l as string}</span><span className="tabular-nums font-semibold">{fmt(h as number)} h</span></div>
                <div className="h-5 overflow-hidden rounded bg-ivory-200"><div className="h-full rounded transition-[width] duration-700" style={{ width: `${((h as number) / o.baselineHours) * 100}%`, background: c as string }} /></div></div>))}
          </div>
          <p className="mt-3 rounded-lg bg-ivory-100 p-2 text-xs text-slate2-600"><b className="text-navy-900">{fmt(o.hoursFreed)} hours back ({fmt(o.efficiency, 0)}%)</b>, time the team can use for the cases that need a person.</p>
        </figure>
      </div>
      {o.abandonedShare > 10 && <p className="mt-3 rounded-lg border border-gold/50 bg-gold/10 p-3 text-sm text-[#5d4720]">Watch-out: {fmt(o.abandonedShare, 1)}% of assistant conversations end without an answer. Efficiency that relies on people giving up is not a gain.</p>}
      <div className="mt-3"><button aria-expanded={open} onClick={() => setOpen(!open)} className="text-sm font-semibold underline underline-offset-4">{open ? 'Hide' : 'Show'} how every number is calculated</button>
        {open && <ol className="mt-3 space-y-1.5 rounded-xl border border-silver-300 bg-ivory-100 p-4 font-mono text-xs leading-relaxed text-slate2-600">
          <li>eligible share = {elig}% (from Discover)</li>
          <li>assistant-handled = {fmt(input.volume)} × {fmt(a.adoption, 1)}% = {fmt(o.aiHandled)}</li>
          <li>solved = {fmt(o.aiHandled)} × {a.resolved}% = {fmt(o.aiResolved)}</li>
          <li>passed to a person = {fmt(o.aiHandled)} × {a.escalated}% = {fmt(o.escalatedCount)}</li>
          <li>baseline hours = {fmt(input.volume)} × {a.handleMin} min ÷ 60 = {fmt(o.baselineHours)}</li>
          <li>hours with assistant = [({fmt(o.humanDirect)} × {a.handleMin}) + ({fmt(o.escalatedCount)} × {a.handleMin} × (1 − {a.handoffSaving}%))] ÷ 60 = {fmt(o.newHours)}</li>
          <li>hours back = {fmt(o.baselineHours)} − {fmt(o.newHours)} = {fmt(o.hoursFreed)}; FTE = ÷ {FTE_HOURS} h</li>
          <li>satisfaction = (solved × {a.csatAi} + person-handled × {a.csatHuman}) ÷ both; assumed values, abandoned excluded</li></ol>}
      </div>
      <Signals />
      <details className="mt-3 rounded-2xl border border-silver-300 bg-white p-3"><summary className="cursor-pointer text-sm font-semibold">Plan brief: a one-page summary to copy</summary><div className="mt-3"><Brief /></div></details>
    </>
  )
}
