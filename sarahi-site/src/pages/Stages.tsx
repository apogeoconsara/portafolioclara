import { useState } from 'react'
import { PageHeader, chip } from '../components/ui'
import Adoption from './Adoption'
import Assistant from './Assistant'
import Flow from './Flow'
import Impact from './Impact'
import { Discovery } from './Profile'
import DiscoverTool from './DiscoverTool'
import Readiness from './Readiness'

export function Discover() {
  return (
    <>
      <PageHeader step="Stage 1 · Discover" tag="hypothetical" title="What should the bank automate first?" intro="Answer four questions about a fictional bank. The list on the right updates as you go, and it drives the next stages." />
      <DiscoverTool />
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
  return (<><PageHeader step="Stage 5 · Optimize" tag="hypothetical" title="Impact and monitoring" intro="What the plan could mean in numbers, and what to watch after launch. Every figure is an estimate from stated assumptions." /><Impact /></>)
}
