import { useState, type ReactNode } from 'react'
import FlowDiagram from '../components/FlowDiagram'
import { PageHeader, card } from '../components/ui'
import { aiPost, useAI } from '../lib/ai'
import { FTE_HOURS } from '../lib/model'
import { SIZES, brief, checklist, share, waves } from '../lib/plan'
import { usePlan } from '../lib/store'

const f = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d })

function Block({ n, stage, title, why, children }: { n: number; stage: string; title: string; why: string; children: ReactNode }) {
  return (
    <section className={`${card} p-4`} aria-labelledby={`b${n}`}>
      <p className="eyebrow">{n} · {stage}</p>
      <h2 id={`b${n}`} className="serif mt-0.5 text-xl">{title}</h2>
      <p className="text-xs text-slate2-500">{why}</p>
      <div className="mt-3">{children}</div>
    </section>
  )
}
function Col({ title, tone, items }: { title: string; tone: string; items: { name: string; share: number }[] }) {
  return (
    <div className="rounded-xl border border-silver-200 p-3">
      <p className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>{title}</p>
      <ul className="mt-2 space-y-1 text-sm">{items.length ? items.map(c => <li key={c.name} className="flex justify-between gap-2"><span>{c.name}</span><span className="tabular-nums text-slate2-400">{c.share}%</span></li>) : <li className="text-slate2-400">None</li>}</ul>
    </div>
  )
}

export default function Plan() {
  const { input, d } = usePlan()
  const ai = useAI()
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [draft, setDraft] = useState<{ text: string; warn: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const o = d.out, a = d.assumptions
  const pick = (p: 1 | 2 | 'human') => d.cases.filter(c => c.phase === p)
  const text = brief(input, d)
  const must = checklist(input).filter(c => c.must)
  const copy = async () => { try { await navigator.clipboard.writeText(text); setMsg('Copied.') } catch { setMsg('Copy is blocked here. Select the text and copy it.') } }
  const nums = (s: string) => new Set((s.match(/\d[\d.,]*/g) || []).map(n => n.replace(/[.,]+$/, '')))
  const draftWithClaude = async () => {
    setBusy(true); const r = await aiPost<{ text: string }>({ mode: 'brief', plan: text })
    if (r) { const allowed = nums(text); setDraft({ text: r.text, warn: [...nums(r.text)].some(n => !allowed.has(n)) }) } else setMsg('Claude is unavailable right now.')
    setBusy(false)
  }
  return (
    <>
      <PageHeader tag="hypothetical" title={`Rollout plan: ${SIZES[input.size].label.toLowerCase()}`} intro="Start with the topics below, keep the sensitive ones with people, and launch in four steps." />
      <p className="mb-3 rounded-xl bg-navy-900 p-4 text-sm leading-relaxed text-ivory">
        <b>In short:</b> start with {pick(1).length} topics ({share(d.cases, 1)}% of inquiries), add {pick(2).length} more later, and always keep {pick('human').length} sensitive topics ({share(d.cases, 'human')}%) with people. Estimated result: about <b>{f(o.hoursFreed)} staff hours back each month</b>, roughly {f(o.fte, 1)} full-time people’s workload.
      </p>
      <div className="space-y-3">
        <Block n={1} stage="Discover" title="What to automate first" why="Ranked by how many customers ask, how simple the topic is, and how risky it is.">
          <div className="grid gap-2 md:grid-cols-3">
            <Col title="Start now" tone="bg-navy-900 text-ivory" items={pick(1)} />
            <Col title="Add later" tone="bg-slate2-500 text-ivory" items={pick(2)} />
            <Col title="Always a person" tone="bg-gold/20 text-[#6b5223]" items={pick('human')} />
          </div>
        </Block>
        <Block n={2} stage="Design" title="When a person takes over" why="Sensitive topics go to a person by rule, however sure the AI is.">
          <p className="text-sm leading-relaxed">Fraud, complaints, bereavement or distress, an unclear request, or any customer asking for a person goes to an agent, <b>with a summary</b>, so nobody repeats their story.</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm"><a href="#assistant" className="rounded-full bg-navy-900 px-4 py-1.5 text-xs font-semibold text-ivory hover:bg-navy-800">Test it with real messages →</a></div>
          <details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-slate2-600">Show the process flow diagram</summary>
            <div className="mt-2 rounded-xl border border-silver-200 p-2"><FlowDiagram active={['risk', 'dec', 'human']} options={{ channel: input.channels[0] ?? 'chat', handoff: input.handoff, lowConf: input.lowConf }} /></div></details>
        </Block>
        <Block n={3} stage="Implement" title="How to launch safely" why="Small steps, each with a clear gate, so problems appear while they are still small.">
          <ol className="grid gap-2 md:grid-cols-4">{waves(input, d).map(w => <li key={w.w} className="rounded-xl border border-silver-200 p-3 text-sm"><p className="font-semibold">{w.t}</p><p className="mt-0.5 text-xs leading-relaxed text-slate2-600">{w.d}</p></li>)}</ol>
          <details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-slate2-600">Before going live, confirm ({must.length} must-haves)</summary>
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-slate2-600">{must.map(c => <li key={c.id}>{c.t}</li>)}</ul></details>
        </Block>
        <Block n={4} stage="Adopt" title="Who needs training" why="A tool people ignore or work around saves nothing.">
          <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><caption className="sr-only">Training by role</caption>
            <thead><tr className="text-[11px] uppercase tracking-wider text-slate2-500"><th className="py-1 pr-3">Role</th><th className="pr-3">Time</th><th>What they learn</th></tr></thead>
            <tbody className="divide-y divide-silver-200">{d.train.map(t => <tr key={t.role} className="align-top"><td className="py-1.5 pr-3 font-medium">{t.role}</td><td className="pr-3 tabular-nums">{t.people} × {t.hours} h</td><td className="text-slate2-600">{t.focus}</td></tr>)}</tbody></table></div>
          <p className="mt-1 text-xs text-slate2-500">About {f(d.trainHours)} staff-hours in total.</p>
        </Block>
        <Block n={5} stage="Optimize" title="What to expect, and what to watch" why="Estimates from the answers you gave. They are assumptions, not promises.">
          <div className="grid gap-2 sm:grid-cols-3">
            {[[f(o.aiResolved), 'conversations a month solved without a person'], [f(o.hoursFreed), `staff hours back a month (${f(d.capacityPct, 0)}% of the team’s time)`], [o.csat.toFixed(1) + ' / 5', 'customer satisfaction, assumed to stay about the same']].map(([n, l]) => (
              <div key={l} className="rounded-xl border border-silver-200 p-3"><p className="serif text-2xl tabular-nums">{n}</p><p className="text-xs text-slate2-600">{l}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#7a5f2c]">Estimate</p></div>))}
          </div>
          <p className="mt-2 text-sm font-semibold">After launch, watch for:</p>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate2-600">
            <li>Many handoffs on one topic: the answers for that topic are probably missing or outdated.</li>
            <li>Customers leaving after the second reply: shorten answers and make “talk to a person” easier to find.</li>
            <li>Lower satisfaction on assistant chats: count a chat as solved only when the customer confirms.</li>
          </ul>
          <button aria-expanded={open} onClick={() => setOpen(!open)} className="mt-2 text-xs font-semibold text-slate2-600 underline underline-offset-4">{open ? 'Hide' : 'Show'} how these numbers are calculated</button>
          {open && <ol className="mt-2 space-y-1 rounded-xl border border-silver-300 bg-ivory-100 p-3 font-mono text-[11px] leading-relaxed text-slate2-600">
            <li>topics the assistant may handle = {share(d.cases, 'eligible')}% of {f(input.volume)} inquiries</li>
            <li>customers who choose it = {input.adoption}% → {f(o.aiHandled)} conversations a month</li>
            <li>solved alone = {f(o.aiHandled)} × {a.resolved}% = {f(o.aiResolved)}; passed to a person = {a.escalated}% = {f(o.escalatedCount)}</li>
            <li>hours before = {f(input.volume)} × {a.handleMin} min ÷ 60 = {f(o.baselineHours)}</li>
            <li>hours after = [({f(o.humanDirect)} + {f(o.escalatedCount)} × (1 − {a.handoffSaving}%)) × {a.handleMin}] ÷ 60 = {f(o.newHours)}</li>
            <li>hours back = {f(o.hoursFreed)}; people = hours ÷ {FTE_HOURS} per person per month</li></ol>}
        </Block>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={copy} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory hover:bg-navy-800">Copy this plan as text</button>
        {ai === 'on' && <button onClick={draftWithClaude} disabled={busy} className="rounded-full border border-navy-800 px-5 py-2 text-sm font-semibold hover:bg-navy-900/5 disabled:opacity-50">{busy ? 'Drafting…' : 'Draft a client summary with Claude'}</button>}
        <span role="status" className="text-sm text-slate2-600">{msg}</span>
      </div>
      {draft && <div className="mt-3 rounded-xl border border-silver-300 bg-white p-3 text-sm leading-relaxed"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate2-400">Drafted by Claude from this plan. Review before sending.</p><p className="mt-1 whitespace-pre-wrap">{draft.text}</p>{draft.warn && <p className="mt-2 rounded-lg bg-gold/15 p-2 text-xs text-[#5d4720]">Check the figures: the draft contains a number that is not in the plan.</p>}</div>}
      <p className="mt-4 text-xs text-slate2-500">Change your answers any time on <a className="underline" href="#start">step 1</a>; this plan updates.</p>
    </>
  )
}
