import { useState } from 'react'
import type { Channel } from '../components/FlowDiagram'
import { chip } from '../components/ui'
import { SIZES, type Appetite, type PlannedCase, type PlanInput, type Readiness, type Size, share } from '../lib/plan'
import { usePlan } from '../lib/store'

const CH: [Channel, string][] = [['chat', 'Web or app chat'], ['messaging', 'Messaging apps'], ['voice', 'Phone']]
const AP: [Appetite, string, string][] = [['cautious', 'Play it safe', 'Only the simplest topics first'], ['balanced', 'Balanced', 'Simple and everyday topics'], ['ambitious', 'Move fast', 'More topics; closer monitoring']]
const RD: [Readiness, string][] = [['high', 'Yes, up to date'], ['medium', 'Partly'], ['low', 'No']]

function Q({ n, q, hint, children }: { n: number; q: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-silver-300 bg-white p-3.5">
      <legend className="sr-only">{q}</legend>
      <p className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-900 text-[11px] text-ivory">{n}</span>{q}</p>
      {hint && <p className="ml-7 text-xs text-slate2-500">{hint}</p>}
      <div className="mt-2.5">{children}</div>
    </fieldset>
  )
}

/** One short, plain-language reason per topic. */
function reason(c: PlannedCase, i: PlanInput): string {
  if (c.phase === 'human') return 'Sensitive: a person always handles it'
  if (c.phase === 1) return c.risk === 'low' ? 'Simple and low risk' : 'Everyday topic, read-only data'
  if (c.complexity === 'high') return 'Needs identity checks or integrations first'
  if (i.readiness === 'low') return 'Waits until answers are written'
  return 'Waits for a more cautious start'
}

function Col({ title, hint, tone, items, i }: { title: string; hint: string; tone: string; items: PlannedCase[]; i: PlanInput }) {
  return (
    <section className="rounded-2xl border border-silver-300 bg-white p-3.5" aria-label={title}>
      <p className="flex items-center justify-between"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{title}</span><span className="text-xs tabular-nums text-slate2-500">{items.reduce((s, c) => s + c.share, 0)}% of inquiries</span></p>
      <p className="mt-1 text-xs text-slate2-500">{hint}</p>
      <ul className="mt-2 divide-y divide-silver-200 text-sm">
        {items.length ? items.map(c => <li key={c.id} className="flex items-baseline justify-between gap-3 py-1.5"><span><span className="font-medium">{c.name}</span><span className="block text-xs text-slate2-500">{reason(c, i)}</span></span><span className="tabular-nums text-xs text-slate2-400">{c.share}%</span></li>) : <li className="py-1.5 text-xs text-slate2-400">Nothing in this group</li>}
      </ul>
    </section>
  )
}

export default function DiscoverTool() {
  const { input: i, set, d } = usePlan()
  const [more, setMore] = useState(false)
  const pick = (s: Size) => set({ size: s, volume: SIZES[s].volume, agents: SIZES[s].agents })
  const toggle = (c: Channel) => { const next = i.channels.includes(c) ? i.channels.filter(x => x !== c) : [...i.channels, c]; if (next.length) set({ channels: next }) }
  const now = d.cases.filter(c => c.phase === 1), later = d.cases.filter(c => c.phase === 2), human = d.cases.filter(c => c.phase === 'human')
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="space-y-2.5">
        <Q n={1} q="How big is the bank?">
          <div className="grid gap-1.5">{(Object.keys(SIZES) as Size[]).map(s => (
            <button key={s} aria-pressed={i.size === s} onClick={() => pick(s)} className={`flex items-baseline justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${i.size === s ? 'border-navy-900 bg-navy-900 text-ivory' : 'border-silver-300 bg-ivory-100 hover:border-navy-800'}`}>
              <span className="font-semibold">{SIZES[s].label}</span><span className={`text-xs ${i.size === s ? 'text-silver-300' : 'text-slate2-500'}`}>{SIZES[s].volume.toLocaleString('en-US')} inquiries a month</span></button>))}</div>
        </Q>
        <Q n={2} q="Where do customers contact the bank?" hint="Choose all that apply.">
          <div className="flex flex-wrap gap-1.5">{CH.map(([c, l]) => <button key={c} aria-pressed={i.channels.includes(c)} onClick={() => toggle(c)} className={`${chip(i.channels.includes(c))} !px-3 !py-1.5 text-xs`}>{l}</button>)}</div>
        </Q>
        <Q n={3} q="How cautious should the rollout be?">
          <div className="grid gap-1.5">{AP.map(([k, l, dsc]) => (
            <button key={k} aria-pressed={i.appetite === k} onClick={() => set({ appetite: k })} className={`flex items-baseline justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${i.appetite === k ? 'border-navy-900 bg-navy-900 text-ivory' : 'border-silver-300 bg-ivory-100 hover:border-navy-800'}`}>
              <span className="font-semibold">{l}</span><span className={`text-xs ${i.appetite === k ? 'text-silver-300' : 'text-slate2-500'}`}>{dsc}</span></button>))}</div>
        </Q>
        <Q n={4} q="Are customer-service answers already written and up to date?" hint="The assistant can only answer from approved content.">
          <div className="flex flex-wrap gap-1.5">{RD.map(([k, l]) => <button key={k} aria-pressed={i.readiness === k} onClick={() => set({ readiness: k })} className={`${chip(i.readiness === k)} !px-3 !py-1.5 text-xs`}>{l}</button>)}</div>
        </Q>
        <button onClick={() => setMore(!more)} aria-expanded={more} className="text-xs text-slate2-600 underline underline-offset-4">{more ? 'Hide' : 'Fine-tune'} (optional)</button>
        {more && <div className="space-y-3 rounded-2xl border border-silver-300 bg-white p-3.5 text-xs text-slate2-600">
          <label className="block"><span className="font-semibold text-navy-900">Customers who choose the assistant: {i.adoption}%</span><span className="block">Used later to estimate time saved.</span><input type="range" min={10} max={90} value={i.adoption} onChange={e => set({ adoption: +e.target.value })} className="mt-1 w-full" /></label>
          <label className="block"><span className="font-semibold text-navy-900">Minutes a person spends per inquiry: {i.handleMin}</span><span className="block">Used later to estimate time saved.</span><input type="range" min={2} max={20} value={i.handleMin} onChange={e => set({ handleMin: +e.target.value })} className="mt-1 w-full" /></label>
        </div>}
      </div>

      <div className="space-y-3" aria-live="polite">
        <p className="rounded-2xl bg-navy-900 p-4 text-sm leading-relaxed text-ivory">
          <span className="eyebrow !text-silver-400">Your starting list</span><br />
          Automate <b>{now.length} topics first</b> ({share(d.cases, 1)}% of inquiries), add {later.length} later, and <b>always keep {human.length} sensitive topics with people</b> ({share(d.cases, 'human')}%).
        </p>
        <Col title="Start now" hint="The pilot: simple topics where the assistant can answer from approved content." tone="bg-navy-900 text-ivory" items={now} i={i} />
        <Col title="Add later" hint="Good candidates once the pilot works." tone="bg-slate2-500 text-ivory" items={later} i={i} />
        <Col title="Always a person" hint="Never automated, however confident the AI is." tone="bg-gold/20 text-[#0F5A55]" items={human} i={i} />
        <a href="#design" className="inline-block rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory transition hover:bg-navy-800">Next: design how a person takes over →</a>
      </div>
    </div>
  )
}
