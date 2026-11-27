type Node = { t: string; mine?: string }
const COLS: { h: string; nodes: Node[] }[] = [
  { h: 'Sources', nodes: [{ t: 'Customer and operations data', mine: 'Designed and operated' }, { t: 'Documents: photos, PDFs, free text', mine: 'Built' }, { t: 'Payments and appointments', mine: 'Integrated' }] },
  { h: 'Automation', nodes: [{ t: 'Triggers and serverless functions' }, { t: 'AI step (OpenAI API)', mine: 'Connected to the workflow' }] },
  { h: 'Control', nodes: [{ t: 'Validation into structured data' }, { t: 'Decision rules, ownership and approvals', mine: 'Defined' }, { t: 'Manual review of exceptions' }] },
  { h: 'Outcome', nodes: [{ t: 'Approved operational actions' }, { t: 'Testing, release documentation and monitoring', mine: 'Coordinated' }] }
]
export default function ApogeoMap() {
  return (
    <div>
      <div className="grid gap-3 md:grid-cols-4">
        {COLS.map((c, ci) => (
          <div key={c.h} className="relative">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-silver-400">{c.h}</p>
            <ul className="space-y-2">{c.nodes.map(n => (
              <li key={n.t} className={`rounded-xl border p-3 text-sm ${n.mine ? 'border-teal/70 bg-teal/10 text-white' : 'border-white/15 text-silver-300'}`}>
                {n.t}{n.mine && <span className="mt-1.5 block w-fit rounded-md bg-teal px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">My contribution: {n.mine}</span>}
              </li>))}</ul>
            {ci < COLS.length - 1 && <span aria-hidden className="absolute -right-3 top-1/2 hidden text-teal-light md:block">→</span>}
          </div>))}
      </div>
      <p className="mt-3 text-xs text-silver-400">Simplified functional view of the types of workflows I design and run, based on my CV. Highlighted boxes are the parts I contributed to. Client names and details are omitted.</p>
    </div>
  )
}
