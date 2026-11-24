import StepNav from '../components/StepNav'
import { PageHeader, card } from '../components/ui'
import { usePlan } from '../lib/store'

const SIGNALS: Record<string, [string, string]> = {
  'Contact-centre agents': ['Share of handoffs where the customer did not have to repeat themselves', 'Agents re-ask everything, so customers feel the assistant made things worse.'],
  'Team leads': ['Corrections raised and closed each week', 'Problems stay anecdotal and never reach the people who can fix the content.'],
  'Branch staff': ['Staff who can explain the assistant to a customer', 'Branches work around the assistant or discourage customers from using it.'],
  'Compliance and QA': ['Sampled conversations that follow policy', 'Oversight stays theoretical and confidence in the system erodes.']
}

export default function Adoption() {
  const { d } = usePlan()
  return (
    <>
      <PageHeader step="Step 5 of 6" tag="hypothetical" title="Training and adoption" intro="Each role needs something different, and each fails in a different way. Staff numbers come from the bank profile." />
      <div className="mb-4 grid grid-cols-2 gap-3 text-center sm:max-w-sm">
        <div className={`${card} p-3`}><p className="serif text-3xl tabular-nums">{d.trainHours.toLocaleString('en-US')}</p><p className="text-xs text-slate2-500">staff-hours of training</p></div>
        <div className={`${card} p-3`}><p className="serif text-3xl tabular-nums">{d.train.length}</p><p className="text-xs text-slate2-500">roles</p></div>
      </div>
      <ul className="space-y-3">
        {d.train.map(t => (
          <li key={t.role} className={`${card} grid gap-3 p-4 text-sm md:grid-cols-3`}>
            <div><p className="serif text-lg">{t.role}</p><p className="text-xs text-slate2-500">{t.people} people × {t.hours} h = {t.people * t.hours} h</p><p className="mt-1.5 text-slate2-600">{t.focus}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">Adoption signal</p><p className="mt-1">{SIGNALS[t.role][0]}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">If we skip this</p><p className="mt-1">{SIGNALS[t.role][1]}</p></div>
          </li>))}
      </ul>
      <p className="mt-3 text-xs text-slate2-500">Hours per person are planning assumptions: 2 h agents, 3 h team leads, 1 h branch staff, 2 h compliance and QA.</p>
      <StepNav page="adoption" />
    </>
  )
}
