import { useMemo, useState } from 'react'
import StepNav from '../components/StepNav'
import { PageHeader, card } from '../components/ui'
import { checklist, verdict, waves } from '../lib/plan'
import { usePlan } from '../lib/store'

export default function Readiness() {
  const { input, d } = usePlan()
  const list = useMemo(() => checklist(input), [input])
  const [done, setDone] = useState<Set<string>>(new Set(['src', 'handoff']))
  const v = verdict(list, done)
  const toggle = (id: string) => setDone(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  return (
    <>
      <PageHeader step="Step 5 of 8 · Implement" tag="hypothetical" title="Launch readiness" intro="The checklist adapts to the channels, risk appetite and content readiness you chose. Tick what the test evidence supports." />
      <div className="grid gap-6 md:grid-cols-5">
        <ul className="space-y-2 md:col-span-3">
          {list.map(c => (
            <li key={c.id}><label className={`${card} flex cursor-pointer items-start gap-3 p-3 text-sm hover:bg-ivory-100`}>
              <input type="checkbox" checked={done.has(c.id)} onChange={() => toggle(c.id)} className="mt-0.5" />
              <span className="flex-1">{c.t}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.must ? 'text-[#7a5f2c]' : 'text-slate2-400'}`}>{c.must ? 'Must' : 'Should'}</span></label></li>))}
        </ul>
        <div className="space-y-4 md:col-span-2">
          <div className={`rounded-xl p-5 ${v.tone === 'Go' ? 'bg-navy-900 text-ivory' : v.tone === 'Conditional' ? 'bg-slate2-500 text-ivory' : 'bg-gold/15 text-[#5d4720]'}`} aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Decision</p><p className="serif mt-1 text-3xl">{v.tone}</p><p className="mt-1 text-sm">{v.text}</p></div>
          <div><p className="eyebrow">Rollout waves</p>
            <ol className="mt-2 space-y-3 text-sm">{waves(input, d).map(w => <li key={w.w}><span className="font-semibold">{w.w} · {w.t}</span><br /><span className="text-slate2-600">{w.d}</span></li>)}</ol></div>
        </div>
      </div>
      <StepNav page="readiness" />
    </>
  )
}
