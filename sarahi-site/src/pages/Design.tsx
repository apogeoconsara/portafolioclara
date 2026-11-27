import { useState } from 'react'
import { PageHeader, chip } from '../components/ui'
import Assistant from './Assistant'
import Flow from './Flow'

export default function Design() {
  const [tab, setTab] = useState<'flow' | 'assistant'>('flow')
  return (
    <>
      <PageHeader tag="hypothetical" title="Design: when a person takes over" intro="A fictional bank wants an AI assistant for customer service. The design question is where the assistant stops and a person starts. Change the options and test the rules, then try the assistant." />
      <div className="mb-3 flex gap-2" role="tablist" aria-label="Design tools">
        <button role="tab" aria-selected={tab === 'flow'} onClick={() => setTab('flow')} className={`${chip(tab === 'flow')} !py-1.5 text-xs`}>1 · Flow and escalation rules</button>
        <button role="tab" aria-selected={tab === 'assistant'} onClick={() => setTab('assistant')} className={`${chip(tab === 'assistant')} !py-1.5 text-xs`}>2 · Try the assistant</button>
      </div>
      <div role="tabpanel">{tab === 'flow' ? <Flow /> : <Assistant />}</div>
    </>
  )
}
