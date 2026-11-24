import type { Page } from '../lib/store'
const ORDER: [Page, string][] = [['profile', 'Bank profile'], ['usecases', 'Use cases'], ['flow', 'Flow and escalation'], ['readiness', 'Launch readiness'], ['adoption', 'Training and adoption'], ['impact', 'Impact'], ['brief', 'Plan brief']]
export default function StepNav({ page }: { page: Page }) {
  const i = ORDER.findIndex(o => o[0] === page)
  const prev = ORDER[i - 1], next = ORDER[i + 1]
  return (
    <div className="mt-8 flex items-center justify-between border-t border-silver-300 pt-4">
      {prev ? <a href={`#${prev[0]}`} className="text-sm font-semibold text-slate2-600 hover:text-navy-900">← {prev[1]}</a> : <span />}
      {next && <a href={`#${next[0]}`} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory transition hover:bg-navy-800">Next: {next[1]} →</a>}
    </div>
  )
}
