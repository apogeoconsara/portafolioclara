import { card } from '../components/ui'
import { usePlan } from '../lib/store'

const SIGNALS: Record<string, string> = {
  'Contact-centre agents': 'Handoffs where the customer did not repeat themselves',
  'Team leads': 'Corrections raised and closed each week',
  'Branch staff': 'Staff who can explain the assistant to a customer',
  'Compliance and QA': 'Sampled conversations that follow policy'
}

export default function Adoption() {
  const { d } = usePlan()
  return (
    <>
      <div className="mb-3 grid max-w-xs grid-cols-2 gap-2 text-center">
        <div className={`${card} p-2`}><p className="serif text-2xl tabular-nums">{d.trainHours.toLocaleString('en-US')}</p><p className="text-[11px] text-slate2-500">staff-hours of training</p></div>
        <div className={`${card} p-2`}><p className="serif text-2xl tabular-nums">{d.train.length}</p><p className="text-[11px] text-slate2-500">roles</p></div>
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="sr-only">Training plan by role</caption>
          <thead><tr className="border-b border-silver-300 text-[11px] uppercase tracking-wider text-slate2-500"><th className="p-2.5">Role</th><th className="p-2.5">People × hours</th><th className="p-2.5">Focus</th><th className="p-2.5">Adoption signal</th></tr></thead>
          <tbody className="divide-y divide-silver-200">
            {d.train.map(t => <tr key={t.role} className="align-top"><td className="p-2.5 font-medium">{t.role}</td><td className="p-2.5 tabular-nums">{t.people} × {t.hours} h = {t.people * t.hours} h</td><td className="p-2.5 text-slate2-600">{t.focus}</td><td className="p-2.5 text-slate2-600">{SIGNALS[t.role]}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate2-500">Planning assumptions: 2 h agents, 3 h team leads, 1 h branch staff, 2 h compliance and QA. Skipping this is the usual reason an assistant is ignored or worked around.</p>
    </>
  )
}
