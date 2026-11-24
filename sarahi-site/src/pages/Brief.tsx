import { useState } from 'react'
import { brief } from '../lib/plan'
import { usePlan } from '../lib/store'

export default function Brief() {
  const { input, d } = usePlan()
  const [msg, setMsg] = useState('')
  const text = brief(input, d)
  const copy = async () => { try { await navigator.clipboard.writeText(text); setMsg('Copied.') } catch { setMsg('Copy is blocked here. Select the text and copy it.') } }
  return (
    <>
      <pre className="whitespace-pre-wrap rounded-xl border border-silver-300 bg-ivory-100 p-3 text-xs leading-relaxed select-all">{text}</pre>
      <div className="mt-3 flex items-center gap-3"><button onClick={copy} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory hover:bg-navy-800">Copy brief</button><span role="status" className="text-sm text-slate2-600">{msg}</span></div>
    </>
  )
}
