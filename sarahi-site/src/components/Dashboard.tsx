import { useMemo, useState } from 'react'
import { Assumptions, BASE, compute, FTE_HOURS, normalize, PRESETS } from '../lib/model'
import { Section } from './ui'

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d })

function Slider({ id, label, value, min, max, step = 1, unit = '', onChange, hint }: { id: string; label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (n: number) => void; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex justify-between text-sm"><span>{label}</span><span className="font-semibold tabular-nums">{fmt(value, step < 1 ? 1 : 0)}{unit}</span></label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} className="mt-1.5 w-full" />
      {hint && <p className="text-xs text-silver-400">{hint}</p>}
    </div>
  )
}
function Tile({ k, v, sub }: { k: string; v: string; sub: string }) {
  return <div className="rounded-xl border border-silver-300 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">{k}</p><p className="serif mt-1 text-3xl tabular-nums">{v}</p><p className="mt-1 text-xs text-slate2-500">{sub}</p><p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-[#7a5f2c]">Simulated</p></div>
}

export default function Dashboard() {
  const [a, setA] = useState<Assumptions>(BASE)
  const [open, setOpen] = useState(false)
  const n = normalize(a)
  const o = useMemo(() => compute(a), [a])
  const set = <K extends keyof Assumptions>(k: K) => (v: number) => setA(s => ({ ...s, [k]: v }))
  return (
    <Section next={{ id: 'journey', label: 'Background' }} id="impact" eyebrow="Impact simulator · 1 min" tag="hypothetical" dark
      title="Change the assumptions. See what has to be true."
      intro="Change five assumptions and see what the made-up bank would need to be true. Formulas are one tap away.">
      <div role="note" className="mb-8 rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm text-ivory"><strong>Hypothetical simulation.</strong> All figures derive from the assumptions you set — none from a real bank or deployment.</div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Scenario presets">
        {Object.entries(PRESETS).map(([k, p]) => <button key={k} onClick={() => setA(p.a)} title={p.note} className="rounded-full border border-white/30 px-4 py-2 text-sm text-ivory hover:bg-white/10">{p.label}</button>)}
      </div>
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2 text-ivory">
          <Slider id="vol" label="Customer questions per month" value={a.volume} min={5000} max={200000} step={1000} onChange={set('volume')} />
          <Slider id="adp" label="Share of customers who use the assistant" value={a.adoption} min={0} max={100} unit="%" onChange={set('adoption')} />
          <Slider id="res" label="Solved by the assistant alone" value={n.resolved} min={0} max={100} unit="%" onChange={v => setA(s => ({ ...s, resolved: v }))} />
          <Slider id="esc" label="Passed to a person" value={n.escalated} min={0} max={100 - n.resolved} unit="%" onChange={set('escalated')} hint={`The other ${fmt(100 - n.resolved - n.escalated)}% give up without an answer`} />
          <Slider id="aht" label="Minutes a person spends per question" value={a.handleMin} min={2} max={20} onChange={set('handleMin')} />
          <p className="text-xs text-silver-400">Also assumed: a handoff summary saves {a.handoffSaving}% of staff time; satisfaction {a.csatAi} (assistant) and {a.csatHuman} (person); adoption ramps up over {a.rampMonths} months.</p>
          <button onClick={() => setA(BASE)} className="text-sm text-silver-300 underline underline-offset-4">Reset to base case</button>
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 gap-3 text-navy-900" aria-live="polite">
            <Tile k="Solved without a person" v={`${fmt(o.containmentOfTotal, 1)}%`} sub="of all inquiries" />
            <Tile k="Passed to a person" v={fmt(o.escalatedCount)} sub={`${fmt(n.escalated)}% of assistant chats`} />
            <Tile k="Staff hours freed" v={fmt(o.hoursFreed)} sub={`${fmt(o.efficiency, 1)}% of baseline · ≈ ${fmt(o.fte, 1)} FTE`} />
            <Tile k="Customer satisfaction" v={o.csat.toFixed(2)} sub="out of 5, assumed" />
          </div>
          {o.abandonedShare > 10 && <p className="rounded-lg border border-gold/50 bg-gold/10 p-3 text-sm">Watch-out: {fmt(o.abandonedShare, 1)}% of assistant conversations end unresolved. Efficiency gains that rely on abandonment are not gains.</p>}
          <div>
            <button aria-expanded={open} onClick={() => setOpen(!open)} className="text-sm font-semibold text-ivory underline underline-offset-4">{open ? 'Hide' : 'Show'} how every number is calculated</button>
            {open && (
              <ol className="mt-3 space-y-1.5 rounded-xl border border-white/15 bg-white/5 p-4 font-mono text-xs leading-relaxed text-silver-300">
                <li>assistant-handled = {fmt(a.volume)} × {a.adoption}% = {fmt(o.aiHandled)}</li>
                <li>resolved = {fmt(o.aiHandled)} × {n.resolved}% = {fmt(o.aiResolved)}</li>
                <li>escalated = {fmt(o.aiHandled)} × {n.escalated}% = {fmt(o.escalatedCount)}</li>
                <li>abandoned = handled − resolved − escalated = {fmt(o.abandoned)}</li>
                <li>baseline hours = {fmt(a.volume)} × {a.handleMin} min ÷ 60 = {fmt(o.baselineHours)}</li>
                <li>hours with assistant = [({fmt(o.humanDirect)} × {a.handleMin}) + ({fmt(o.escalatedCount)} × {a.handleMin} × (1 − {a.handoffSaving}%))] ÷ 60 = {fmt(o.newHours)}</li>
                <li>hours freed = {fmt(o.baselineHours)} − {fmt(o.newHours)} = {fmt(o.hoursFreed)}; FTE = ÷ {FTE_HOURS} h</li>
                <li>satisfaction = (resolved × {a.csatAi} + person-handled × {a.csatHuman}) ÷ both; abandoned excluded</li>
                <li>first-contact resolution = (resolved + person-handled × {a.humanResolved}%) ÷ volume</li>
                <li>ramp: adoption(m) = {a.adoption}% × min(1, m ÷ {a.rampMonths})</li>
              </ol>)}
          </div>
          <p className="text-xs text-silver-400">Simplified on purpose: no seasonality or repeat contacts, and {FTE_HOURS} working hours per person per month.</p>
        </div>
      </div>
    </Section>
  )
}
