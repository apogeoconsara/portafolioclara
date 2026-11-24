import { useState } from 'react'
import FlowDiagram, { type Channel, type Handoff, type LowConf, type Options } from '../components/FlowDiagram'
import StepNav from '../components/StepNav'
import { Callout, PageHeader, card, chip } from '../components/ui'
import { usePlan } from '../lib/store'

type Sens = 'fraud' | 'complaint' | 'vulnerable' | 'person' | null
const INQ: { text: string; conf: number; sens: Sens }[] = [
  { text: 'What time does the downtown branch open on Saturdays?', conf: 96, sens: null },
  { text: 'There is a card payment on my statement that I don’t recognise.', conf: 91, sens: 'fraud' },
  { text: 'I’ve asked twice about this fee and nobody fixed it. I want to complain.', conf: 88, sens: 'complaint' },
  { text: 'My husband passed away last month. What do I do with our joint account?', conf: 70, sens: 'vulnerable' },
  { text: 'Can I raise my daily transfer limit?', conf: 64, sens: null },
  { text: 'Please transfer me to a person.', conf: 99, sens: 'person' }
]
const LABEL: Record<Exclude<Sens, null>, string> = { fraud: 'Suspected fraud', complaint: 'Formal complaint', vulnerable: 'Vulnerable customer or bereavement', person: 'Customer asks for a person' }
const THRESHOLD = 75
export function route(q: { conf: number; sens: Sens }, rules: Record<string, boolean>) {
  if (q.sens && rules[q.sens]) return { human: true, why: `${LABEL[q.sens]}: always goes to a person.` }
  if (q.conf < THRESHOLD) return { human: true, why: 'The assistant is not sure enough, so a person takes over.' }
  return { human: false, why: q.sens ? 'Safety rule switched off, so the assistant answers.' : 'Routine question the assistant can answer from approved content.' }
}

const GROUPS: { key: keyof Options; label: string; items: { v: string; label: string; tradeoff: string }[] }[] = [
  { key: 'channel', label: 'Channel', items: [
    { v: 'chat', label: 'Chat', tradeoff: 'Chat: easiest to launch, and the transcript is the record.' },
    { v: 'voice', label: 'Voice', tradeoff: 'Voice: highest stakes, so escalation and spoken confirmations must be tighter.' },
    { v: 'messaging', label: 'Messaging app', tradeoff: 'Messaging: convenient, but verify identity before account-specific answers.' }] },
  { key: 'handoff', label: 'When a person is needed', items: [
    { v: 'live', label: 'Live agent now', tradeoff: 'Live: best for urgent or sensitive cases; needs staffing at peak times.' },
    { v: 'callback', label: 'Scheduled callback', tradeoff: 'Callback: protects agents at peaks, but the customer waits and may drop off.' },
    { v: 'branch', label: 'Branch appointment', tradeoff: 'Branch: suits complex needs and is the slowest path.' }] },
  { key: 'lowConf', label: 'When the assistant is unsure', items: [
    { v: 'person', label: 'Hand to a person', tradeoff: 'Unsure → person: safest, with more handoffs.' },
    { v: 'clarify', label: 'Ask once, then person', tradeoff: 'Unsure → clarify: can save a handoff; cap it at one retry.' },
    { v: 'choices', label: 'Offer choices', tradeoff: 'Unsure → choices: guides with buttons, limited to approved topics.' }] }
]

export default function Flow() {
  const { input } = usePlan()
  const [opt, setOpt] = useState<{ handoff: Handoff; lowConf: LowConf; channel: Channel }>({ channel: input.channels[0] ?? 'chat', handoff: 'live', lowConf: 'person' })
  const [rules, setRules] = useState<Record<string, boolean>>({ fraud: true, complaint: true, vulnerable: true, person: true })
  const res = INQ.map(q => ({ q, r: route(q, rules) }))
  const unsafe = res.filter(x => !x.r.human && x.q.sens)
  const why = GROUPS.map(g => g.items.find(x => x.v === opt[g.key])!)
  return (
    <>
      <PageHeader step="Step 3 of 6" tag="hypothetical" title="Flow and human escalation" intro="How an inquiry moves, and exactly when a person takes over. Change the options, then test the rules on six made-up messages." />
      <div className={`${card} p-4 md:p-5`}>
        <div className="mb-3 grid gap-3 md:grid-cols-3">
          {GROUPS.map(g => (
            <fieldset key={g.key}><legend className="text-xs font-semibold uppercase tracking-wider text-slate2-500">{g.label}</legend>
              <div className="mt-1.5 flex flex-wrap gap-1.5">{g.items.map(it => <button key={it.v} aria-pressed={opt[g.key] === it.v} onClick={() => setOpt({ ...opt, [g.key]: it.v } as typeof opt)} className={`${chip(opt[g.key] === it.v)} !px-3 !py-1 text-xs`}>{it.label}</button>)}</div></fieldset>))}
        </div>
        <FlowDiagram active={['risk', 'dec', 'human']} options={opt as Options} />
        <p className="mt-1 text-xs text-slate2-600" aria-live="polite"><span className="font-semibold text-navy-900">Trade-offs:</span> {why.map(w => w.tradeoff).join(' ')}</p>
      </div>
      <p className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm leading-relaxed text-[#5d4720]"><span className="font-semibold">Human escalation:</span> fraud, complaints, vulnerable customers, low confidence, or any request for a person go to an agent, with a summary of the conversation. The customer never repeats their story and never has to fight to reach someone.</p>
      <h2 className="serif mt-8 text-2xl">Test the escalation rules</h2>
      <fieldset className="mt-3"><legend className="text-sm text-slate2-600">Always hand to a person when…</legend>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">{(Object.keys(LABEL) as (keyof typeof LABEL)[]).map(k => <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rules[k]} onChange={e => setRules(r => ({ ...r, [k]: e.target.checked }))} />{LABEL[k]}</label>)}</div></fieldset>
      <ul className={`${card} mt-3 divide-y divide-silver-200`} aria-live="polite">
        {res.map(({ q, r }) => (
          <li key={q.text} className="grid gap-1 p-3 text-sm sm:grid-cols-[1fr_auto] sm:gap-4">
            <div><p>“{q.text}”</p><p className="mt-0.5 text-xs text-slate2-500">{r.why}</p></div>
            <span className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold ${r.human ? 'bg-gold/20 text-[#6b5223]' : 'bg-navy-900 text-ivory'}`}>{r.human ? 'Human agent' : 'AI assistant'}</span>
          </li>))}
      </ul>
      {unsafe.length > 0 && <div className="mt-3"><Callout tone="gold" title="A setup I would avoid">The assistant now answers {unsafe.length} sensitive message{unsafe.length > 1 ? 's' : ''} by itself. An AI can sound sure and still be the wrong one to answer, so sensitive topics always go to a person.</Callout></div>}
      <StepNav page="flow" />
    </>
  )
}
