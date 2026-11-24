import { useState } from 'react'
import { Slider, card, chip } from '../components/ui'
import type { Channel } from '../components/FlowDiagram'
import type { Appetite, Readiness } from '../lib/plan'
import { usePlan } from '../lib/store'

const STAKE: { who: string; learn: string; ask: string[]; evidence: string }[] = [
  { who: 'Head of Customer Service', learn: 'Which inquiry types drive volume and cost, and what the service promise is today.', ask: ['Which five inquiry types do you wish you could answer faster?', 'What does a good interaction look like to you?'], evidence: 'Contact-reason report, current service levels' },
  { who: 'Contact-centre agents', learn: 'Where time is lost: repeat questions, system switching, unclear policies.', ask: ['What do customers have to repeat to you?', 'Which questions do you answer ten times a day?'], evidence: 'Shadowing sessions, anonymised chat samples' },
  { who: 'Compliance and Risk', learn: 'Which topics must never be automated, and what must be recorded.', ask: ['Which interactions carry regulatory obligations?', 'What must be logged, and for how long?'], evidence: 'Policy library, complaints procedure' },
  { who: 'IT and Integration', learn: 'What systems the assistant must connect to, and the security limits.', ask: ['What can be read through an API today, and what cannot?', 'How are changes released here?'], evidence: 'System inventory, security requirements' }
]
const CH: [Channel, string][] = [['chat', 'Web / app chat'], ['messaging', 'Messaging app'], ['voice', 'Voice']]
const AP: [Appetite, string, string][] = [['cautious', 'Cautious', 'Start small; medium-risk topics wait.'], ['balanced', 'Balanced', 'Low and medium-risk topics in the first phases.'], ['ambitious', 'Ambitious', 'Faster rollout; needs strong monitoring.']]
const RD: [Readiness, string, string][] = [['low', 'Low', 'Answers are scattered or outdated.'], ['medium', 'Medium', 'Some approved content exists.'], ['high', 'High', 'A maintained knowledge base.']]

function Discovery() {
  return (
    <details className="rounded-2xl border border-silver-300 bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold">With a real bank: who I would ask, and the first question</summary>
      <p className="mt-2 text-xs text-slate2-600">The answers above are assumptions until measured. In a real project, these conversations replace them with the bank’s own numbers, and no target is set before a baseline exists.</p>
      <ul className="mt-2 divide-y divide-silver-200 text-sm">
        {STAKE.map(x => <li key={x.who} className="grid gap-1 py-2 sm:grid-cols-[11rem_1fr]"><span className="font-medium">{x.who}</span><span className="text-slate2-600">“{x.ask[0]}” <span className="text-xs text-slate2-400">Evidence: {x.evidence}.</span></span></li>)}
      </ul>
    </details>
  )
}

export { Discovery }
export default function Profile() {
  const { input: i, set, reset } = usePlan()
  const toggle = (c: Channel) => { const has = i.channels.includes(c); const next = has ? i.channels.filter(x => x !== c) : [...i.channels, c]; if (next.length) set({ channels: next }) }
  return (
    <>
      <div className={`${card} space-y-4 p-4`}>
        <div className="space-y-3">
          <Slider id="vol" label="Customer inquiries per month" value={i.volume} min={5000} max={200000} step={1000} onChange={v => set({ volume: v })} />
          <Slider id="agents" label="Customer service staff" value={i.agents} min={5} max={300} onChange={v => set({ agents: v })} />
          <Slider id="aht" label="Minutes a person spends per inquiry" value={i.handleMin} min={2} max={20} onChange={v => set({ handleMin: v })} />
          <Slider id="adopt" label="Customers who choose the assistant" value={i.adoption} min={10} max={90} unit="%" onChange={v => set({ adoption: v })} hint="Of customers asking about eligible topics." />
        </div>
        <div className="space-y-3">
          <fieldset><legend className="text-sm font-medium">Channels in scope</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">{CH.map(([c, l]) => <button key={c} aria-pressed={i.channels.includes(c)} onClick={() => toggle(c)} className={`${chip(i.channels.includes(c))} !px-3 !py-1.5 text-xs`}>{l}</button>)}</div></fieldset>
          <fieldset><legend className="text-sm font-medium">Risk appetite</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">{AP.map(([k, l]) => <button key={k} aria-pressed={i.appetite === k} onClick={() => set({ appetite: k })} className={`${chip(i.appetite === k)} !px-3 !py-1.5 text-xs`}>{l}</button>)}</div>
            <p className="mt-1.5 text-xs text-slate2-500">{AP.find(a => a[0] === i.appetite)![2]}</p></fieldset>
          <fieldset><legend className="text-sm font-medium">Content readiness</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">{RD.map(([k, l]) => <button key={k} aria-pressed={i.readiness === k} onClick={() => set({ readiness: k })} className={`${chip(i.readiness === k)} !px-3 !py-1.5 text-xs`}>{l}</button>)}</div>
            <p className="mt-1.5 text-xs text-slate2-500">{RD.find(a => a[0] === i.readiness)![2]}</p></fieldset>
        </div>
      </div>
      <button onClick={reset} className="mt-3 text-sm text-slate2-600 underline underline-offset-4">Reset to defaults</button>
      
    </>
  )
}
