import { card } from '../components/ui'
import { share } from '../lib/plan'
import { usePlan } from '../lib/store'

const PH = { 1: { label: 'Phase 1 · pilot', cls: 'bg-navy-900 text-ivory' }, 2: { label: 'Phase 2', cls: 'bg-slate2-500 text-ivory' }, human: { label: 'Always a person', cls: 'bg-gold/20 text-[#6b5223]' } } as const

export default function UseCases() {
  const { d, input } = usePlan()
  return (
    <>
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        {([1, 2, 'human'] as const).map(p => <div key={p} className={`${card} p-2`}><p className="serif text-2xl tabular-nums">{share(d.cases, p)}%</p><p className="text-xs text-slate2-500">{PH[p].label}</p></div>)}
      </div>
      <ul className={`${card} divide-y divide-silver-200`} aria-live="polite">
        {d.cases.map(c => (
          <li key={c.id} className="grid gap-1 px-3 py-2 sm:grid-cols-[1fr_auto] sm:gap-3">
            <div><p className="text-sm font-medium">{c.name} <span className="font-normal text-slate2-400">· {c.share}%</span></p><p className="text-xs text-slate2-600">{c.why} <span className="text-slate2-400">Risk {c.risk}, complexity {c.complexity}{c.phase !== 'human' && `, score ${c.priority}`}.</span></p></div>
            <span className={`h-fit w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PH[c.phase].cls}`}>{PH[c.phase].label}</span>
          </li>))}
      </ul>
      <p className="mt-2 text-[11px] text-slate2-500">Priority = share of inquiries × simplicity × content readiness ({input.readiness}). Phases also depend on risk appetite ({input.appetite}). Shares are illustrative.</p>
    </>
  )
}
