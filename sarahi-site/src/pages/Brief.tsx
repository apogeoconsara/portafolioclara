import { useState } from 'react'
import { aiPost, useAI } from '../lib/ai'
import { brief } from '../lib/plan'
import { usePlan } from '../lib/store'

export default function Brief() {
  const { input, d } = usePlan()
  const [msg, setMsg] = useState('')
  const ai = useAI()
  const [draft, setDraft] = useState<{ text: string; warn: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const text = brief(input, d)
  const copy = async () => { try { await navigator.clipboard.writeText(text); setMsg('Copied.') } catch { setMsg('Copy is blocked here. Select the text and copy it.') } }
  const nums = (s: string) => new Set((s.match(/\d[\d.,]*/g) || []).map(n => n.replace(/[.,]+$/, '')))
  const draftWithClaude = async () => {
    setBusy(true)
    const r = await aiPost<{ text: string }>({ mode: 'brief', plan: text })
    if (r) { const allowed = nums(text); setDraft({ text: r.text, warn: [...nums(r.text)].some(n => !allowed.has(n)) }) } else setMsg('Claude is unavailable right now.')
    setBusy(false)
  }
  return (
    <>
      <pre className="whitespace-pre-wrap rounded-xl border border-silver-300 bg-ivory-100 p-3 text-xs leading-relaxed select-all">{text}</pre>
      <div className="mt-3 flex items-center gap-3"><button onClick={copy} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory hover:bg-navy-800">Copy brief</button>{ai === 'on' && <button onClick={draftWithClaude} disabled={busy} className="rounded-full border border-navy-800 px-5 py-2 text-sm font-semibold hover:bg-navy-900/5 disabled:opacity-50">{busy ? 'Drafting…' : 'Draft a client summary with Claude'}</button>}<span role="status" className="text-sm text-slate2-600">{msg}</span></div>
      {draft && <div className="mt-3 rounded-xl border border-silver-300 bg-white p-3 text-sm leading-relaxed"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate2-400">Drafted by Claude from the plan above. Review before sending.</p><p className="mt-1 whitespace-pre-wrap">{draft.text}</p>{draft.warn && <p className="mt-2 rounded-lg bg-gold/15 p-2 text-xs text-[#0F5A55]">Check the figures: the draft contains a number that is not in the plan.</p>}</div>}
    </>
  )
}
