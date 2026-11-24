import { useState } from 'react'
import StepNav from '../components/StepNav'
import { PageHeader } from '../components/ui'
import { brief } from '../lib/plan'
import { usePlan } from '../lib/store'

export default function Brief() {
  const { input, d } = usePlan()
  const [msg, setMsg] = useState('')
  const text = brief(input, d)
  const copy = async () => { try { await navigator.clipboard.writeText(text); setMsg('Copied.') } catch { setMsg('Copy is blocked here. Select the text and copy it.') } }
  return (
    <>
      <PageHeader step="Result" tag="hypothetical" title="Plan brief" intro="A one-page summary of the plan above, ready to paste into an email or document." />
      <pre className="whitespace-pre-wrap rounded-2xl border border-silver-300 bg-white p-5 text-sm leading-relaxed select-all">{text}</pre>
      <div className="mt-3 flex items-center gap-3"><button onClick={copy} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory hover:bg-navy-800">Copy brief</button><span role="status" className="text-sm text-slate2-600">{msg}</span></div>
      <StepNav page="brief" />
    </>
  )
}
