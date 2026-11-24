import { useState } from 'react'
import StepNav from '../components/StepNav'
import { PageHeader, Slider, card } from '../components/ui'
import { FTE_HOURS } from '../lib/model'
import { share } from '../lib/plan'
import { usePlan } from '../lib/store'

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d })
function Tile({ k, v, sub }: { k: string; v: string; sub: string }) {
  return <div className={`${card} p-4`}><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">{k}</p><p className="serif mt-1 text-3xl tabular-nums">{v}</p><p className="mt-1 text-xs text-slate2-500">{sub}</p><p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-[#7a5f2c]">Simulated</p></div>
}

export default function Impact() {
  const { input, set, d } = usePlan()
  const [open, setOpen] = useState(false)
  const a = d.assumptions, o = d.out
  const elig = share(d.cases, 'eligible')
  return (
    <>
      <PageHeader step="Step 6 of 6" tag="hypothetical" title="Simulated impact" intro="Computed from the plan you built. Change the assumptions to see what would have to be true for the numbers to hold." />
      <div role="note" className="mb-4 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm text-[#5d4720]"><strong>Hypothetical simulation.</strong> Every figure comes from assumptions, not from a real bank or deployment.</div>
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
      <StepNav page="impact" />
    </>
  )
}
