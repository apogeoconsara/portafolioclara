import { PageHeader, card } from '../components/ui'
import StepNav from '../components/StepNav'
import { share } from '../lib/plan'
import { usePlan } from '../lib/store'

const PH = { 1: { label: 'Phase 1 · pilot', cls: 'bg-navy-900 text-ivory' }, 2: { label: 'Phase 2', cls: 'bg-slate2-500 text-ivory' }, human: { label: 'Always a person', cls: 'bg-gold/20 text-[#6b5223]' } } as const

export default function UseCases() {
  const { d, input } = usePlan()
  return (
    <>
      <PageHeader step="Step 2 of 8 · Discover" tag="hypothetical" title="Which topics to automate first" intro="Each topic is ranked by volume, how simple it is, and how ready the bank’s content is. Risky topics are removed from automation by rule, whatever their score." />
      <div className="mb-4 grid grid-cols-3 gap-3 text-center">
        {([1, 2, 'human'] as const).map(p => <div key={p} className={`${card} p-3`}><p className="serif text-3xl tabular-nums">{share(d.cases, p)}%</p><p className="text-xs text-slate2-500">{PH[p].label}</p></div>)}
      </div>
      <ul className={`${card} divide-y divide-silver-200`} aria-live="polite">
        {d.cases.map(c => (
          <li key={c.id} className="grid gap-1 p-3 sm:grid-cols-[1fr_auto] sm:gap-4">
            <div><p className="font-medium">{c.name} <span className="font-normal text-slate2-400">· {c.share}% of inquiries</span></p><p className="text-sm text-slate2-600">{c.why}</p>
              <p className="text-xs text-slate2-400">Risk {c.risk} · complexity {c.complexity}{c.phase !== 'human' && ` · priority score ${c.priority}`}</p></div>
            <span className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold ${PH[c.phase].cls}`}>{PH[c.phase].label}</span>
          </li>))}
      </ul>
      <p className="mt-3 text-xs text-slate2-500">Priority = share of inquiries × simplicity × content readiness ({input.readiness}). Phases also depend on risk appetite ({input.appetite}). Shares are illustrative.</p>
      <StepNav page="usecases" />
    </>
  )
}
