import { PageHeader, Slider, card, chip } from '../components/ui'
import StepNav from '../components/StepNav'
import type { Channel } from '../components/FlowDiagram'
import type { Appetite, Readiness } from '../lib/plan'
import { usePlan } from '../lib/store'

const CH: [Channel, string][] = [['chat', 'Web / app chat'], ['messaging', 'Messaging app'], ['voice', 'Voice']]
const AP: [Appetite, string, string][] = [['cautious', 'Cautious', 'Start small; medium-risk topics wait.'], ['balanced', 'Balanced', 'Low and medium-risk topics in the first phases.'], ['ambitious', 'Ambitious', 'Faster rollout; needs strong monitoring.']]
const RD: [Readiness, string, string][] = [['low', 'Low', 'Answers are scattered or outdated.'], ['medium', 'Medium', 'Some approved content exists.'], ['high', 'High', 'A maintained knowledge base.']]

export default function Profile() {
  const { input: i, set, reset } = usePlan()
  const toggle = (c: Channel) => { const has = i.channels.includes(c); const next = has ? i.channels.filter(x => x !== c) : [...i.channels, c]; if (next.length) set({ channels: next }) }
  return (
    <>
      <PageHeader step="Step 1 of 6" tag="hypothetical" title="Describe the bank" intro="These inputs drive every other page. The defaults describe a fictional regional bank; change them to see the plan adapt." />
      <div className={`${card} grid gap-6 p-5 md:grid-cols-2 md:p-6`}>
        <div className="space-y-5">
          <Slider id="vol" label="Customer inquiries per month" value={i.volume} min={5000} max={200000} step={1000} onChange={v => set({ volume: v })} />
          <Slider id="agents" label="Customer service staff" value={i.agents} min={5} max={300} onChange={v => set({ agents: v })} />
          <Slider id="aht" label="Minutes a person spends per inquiry" value={i.handleMin} min={2} max={20} onChange={v => set({ handleMin: v })} />
          <Slider id="adopt" label="Customers who choose the assistant" value={i.adoption} min={10} max={90} unit="%" onChange={v => set({ adoption: v })} hint="Of customers asking about eligible topics." />
        </div>
        <div className="space-y-5">
          <fieldset><legend className="text-sm font-medium">Channels in scope</legend>
            <div className="mt-2 flex flex-wrap gap-2">{CH.map(([c, l]) => <button key={c} aria-pressed={i.channels.includes(c)} onClick={() => toggle(c)} className={chip(i.channels.includes(c))}>{l}</button>)}</div></fieldset>
          <fieldset><legend className="text-sm font-medium">Risk appetite</legend>
            <div className="mt-2 flex flex-wrap gap-2">{AP.map(([k, l]) => <button key={k} aria-pressed={i.appetite === k} onClick={() => set({ appetite: k })} className={chip(i.appetite === k)}>{l}</button>)}</div>
            <p className="mt-1.5 text-xs text-slate2-500">{AP.find(a => a[0] === i.appetite)![2]}</p></fieldset>
          <fieldset><legend className="text-sm font-medium">Content readiness</legend>
            <div className="mt-2 flex flex-wrap gap-2">{RD.map(([k, l]) => <button key={k} aria-pressed={i.readiness === k} onClick={() => set({ readiness: k })} className={chip(i.readiness === k)}>{l}</button>)}</div>
            <p className="mt-1.5 text-xs text-slate2-500">{RD.find(a => a[0] === i.readiness)![2]}</p></fieldset>
        </div>
      </div>
      <button onClick={reset} className="mt-3 text-sm text-slate2-600 underline underline-offset-4">Reset to defaults</button>
      <StepNav page="profile" />
    </>
  )
}
