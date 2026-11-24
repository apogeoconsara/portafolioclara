import { useState } from 'react'
import { PageHeader, chip } from '../components/ui'
import Adoption from './Adoption'
import Assistant from './Assistant'
import Flow from './Flow'
import Impact from './Impact'
import Profile, { Discovery } from './Profile'
import Readiness from './Readiness'
import UseCases from './UseCases'

export function Discover() {
  return (
    <>
      <PageHeader step="Stage 1 · Discover" tag="hypothetical" title="Describe the bank, then decide what to automate first" intro="The inputs on the left drive every other stage. Risky topics are removed from automation by rule, whatever their score." />
      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]"><div><Profile /></div><div><UseCases /></div></div>
      <div className="mt-3"><Discovery /></div>
    </>
  )
}

export function Design() {
  const [tab, setTab] = useState<'flow' | 'assistant'>('flow')
  return (
    <>
      <PageHeader step="Stage 2 · Design" tag="hypothetical" title="Flow, escalation rules and an assistant you can test" intro="Set how and when a person takes over, then test a rule-based banking assistant that follows your plan." />
      <div className="mb-3 flex gap-2" role="tablist" aria-label="Design tools">
        <button role="tab" aria-selected={tab === 'flow'} onClick={() => setTab('flow')} className={`${chip(tab === 'flow')} !py-1.5 text-xs`}>Flow and escalation rules</button>
        <button role="tab" aria-selected={tab === 'assistant'} onClick={() => setTab('assistant')} className={`${chip(tab === 'assistant')} !py-1.5 text-xs`}>Assistant test</button>
      </div>
      <div role="tabpanel">{tab === 'flow' ? <Flow /> : <Assistant />}</div>
    </>
  )
}

export function Implement() {
  return (<><PageHeader step="Stage 3 · Implement" tag="hypothetical" title="Launch readiness" intro="The checklist adapts to the channels, risk appetite and content readiness you chose. Tick what the test evidence supports." /><Readiness /></>)
}
export function Adopt() {
  return (<><PageHeader step="Stage 4 · Adopt" tag="hypothetical" title="Training and adoption" intro="Each role needs something different. Staff numbers come from the bank profile." /><Adoption /></>)
}
export function Optimize() {
  return (<><PageHeader step="Stage 5 · Optimize" tag="hypothetical" title="Impact and monitoring" intro="Computed from the plan you built. Change the assumptions to see what would have to be true for the numbers to hold." /><Impact /></>)
}
