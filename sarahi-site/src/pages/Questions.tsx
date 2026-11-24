import { useState, type FormEvent } from 'react'
import { PageHeader, chip } from '../components/ui'
import { GROUPS, QAS, findQA, type Group, type QA } from '../content/qa'
import { aiPost, useAI } from '../lib/ai'

const notesFor = (items: QA[]) => items.map(e => `Q: ${e.q}\nA: ${e.short} ${e.more.join(' ')}`).join('\n\n').slice(0, 2500)
const nums = (s: string) => new Set((s.match(/\d[\d.,]*/g) || []).map(n => n.replace(/[.,]+$/, '')))

function Item({ e, open, toggle }: { e: QA; open: boolean; toggle: () => void }) {
  return (
    <li>
      <h3><button aria-expanded={open} onClick={toggle} className="flex w-full items-center justify-between gap-3 py-3 text-left"><span className={`serif text-lg leading-snug ${open ? '' : 'text-slate2-600'}`}>{e.q}</span><span aria-hidden className={`shrink-0 text-xl text-slate2-400 transition ${open ? 'rotate-45' : ''}`}>+</span></button></h3>
      {open && (
        <div className="pb-4">
          <p className="rounded-xl bg-navy-900 p-3 text-sm leading-relaxed text-ivory">{e.short}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate2-600">{e.more.map(m => <li key={m}>{m}</li>)}</ul>
          {e.show && <a href={e.show.href} className="mt-2 inline-block rounded-full border border-navy-800 px-4 py-1.5 text-xs font-semibold hover:bg-navy-900/5">Show me: {e.show.label} →</a>}
        </div>)}
    </li>
  )
}

export default function Questions() {
  const ai = useAI()
  const [group, setGroup] = useState<Group>('How AI works')
  const [open, setOpen] = useState('llm')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [ans, setAns] = useState<{ q: string; text: string | null; from: QA[]; claude: boolean } | null>(null)
  const list = QAS.filter(e => e.group === group)

  const ask = async (e: FormEvent) => {
    e.preventDefault(); const question = q.trim(); if (!question || busy) return
    const from = findQA(question)
    setBusy(true)
    let text: string | null = null, claude = false
    if (ai === 'on' && from.length) {
      const notes = notesFor(from)
      const r = await aiPost<{ text: string }>({ mode: 'advise', question, notes })
      const allowed = nums(notes + ' ' + question)
      if (r && r.text && [...nums(r.text)].every(n => allowed.has(n))) { text = r.text; claude = true }
    }
    setAns({ q: question, text, from, claude }); setBusy(false)
  }

  return (
    <>
      <PageHeader tag="hypothetical" title="Questions a bank’s team asks about applied AI" intro="In an AI consultant role, the customers are the banks. Their teams ask how it works, whether it is safe, and what to expect. These are the questions I would expect, answered in plain language, each with a demo you can open." />
      <form onSubmit={ask} className="rounded-2xl border border-silver-300 bg-white p-3">
        <label htmlFor="qq" className="text-sm font-semibold">Ask your own question</label>
        <div className="mt-2 flex gap-2">
          <input id="qq" value={q} maxLength={300} onChange={e => setQ(e.target.value)} placeholder="For example: can customers trick the assistant?" className="min-w-0 flex-1 rounded-full border border-silver-300 px-4 py-2 text-sm" autoComplete="off" />
          <button disabled={busy} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory hover:bg-navy-800 disabled:opacity-50">{busy ? 'Thinking…' : 'Ask'}</button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate2-500">{ai === 'on' ? 'Claude writes the answer from the prepared notes below, and the answer is checked for invented numbers.' : 'Shows the closest prepared answer. On the Netlify deployment with an API key, Claude writes a tailored answer from the same notes.'}</p>
      </form>
      {ans && (
        <div className="mt-3 rounded-2xl border border-navy-900 p-4" aria-live="polite">
          <p className="eyebrow">Your question: “{ans.q}”</p>
          {ans.from.length === 0 && <p className="mt-2 text-sm">I do not have a prepared answer for that. These are the questions I can answer well: pick one below.</p>}
          {ans.text && <><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{ans.text}</p><p className="mt-2 text-[11px] text-slate2-500">Written by Claude from the notes on: {ans.from.map(f => f.q).join(' · ')}. General guidance, not a guarantee or legal advice.</p></>}
          {!ans.text && ans.from[0] && <><p className="mt-2 text-sm font-semibold">{ans.from[0].q}</p><p className="mt-1 text-sm leading-relaxed">{ans.from[0].short}</p><button onClick={() => { setGroup(ans.from[0].group); setOpen(ans.from[0].id); setAns(null) }} className="mt-2 text-xs font-semibold underline underline-offset-4">Open the full answer</button></>}
        </div>)}
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Question groups">
        {GROUPS.map(g => <button key={g} role="tab" aria-selected={group === g} onClick={() => { setGroup(g); setOpen(QAS.find(x => x.group === g)!.id) }} className={`${chip(group === g)} !py-1.5 text-xs`}>{g}</button>)}
      </div>
      <ul className="mt-2 divide-y divide-silver-300 border-y border-silver-300" role="tabpanel">{list.map(e => <Item key={e.id} e={e} open={open === e.id} toggle={() => setOpen(open === e.id ? '' : e.id)} />)}</ul>
      <p className="mt-3 text-[11px] text-slate2-500">General practice for AI in bank customer service. It makes no claims about any vendor’s product and promises no results. Compliance and legal questions belong with the bank’s own teams.</p>
    </>
  )
}
