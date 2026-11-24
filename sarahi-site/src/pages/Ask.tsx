import { useEffect, useRef, useState, type FormEvent } from 'react'
import { KB, answer } from '../content/knowledge'
import { PageHeader } from '../components/ui'
import { share } from '../lib/plan'
import { usePlan } from '../lib/store'

interface Msg { from: 'you' | 'bot'; text: string; go?: [string, string] }
const START: Msg = { from: 'bot', text: 'Hi. Ask about Sarahí’s background, how she would approach the role, or what she has not done yet. I answer from a fixed set of verified facts, so I will say when I do not know.' }
const SUGGEST = ['What banking experience does she have?', 'Does she have SaaS or customer-success experience?', 'How does she think about AI risk and escalation?', 'Which parts are real and which are hypothetical?', 'Summarise the plan I built']

export default function Ask() {
  const { input, d } = usePlan()
  const [msgs, setMsgs] = useState<Msg[]>([START])
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [msgs])
  const send = (q: string) => {
    const query = q.trim(); if (!query) return
    let bot: Msg
    if (/plan|summar/.test(query.toLowerCase()) && /(my|built|summar)/.test(query.toLowerCase())) {
      const p1 = d.cases.filter(c => c.phase === 1).length
      bot = { from: 'bot', text: `Your hypothetical bank: ${input.volume.toLocaleString('en-US')} inquiries a month, ${input.appetite} risk appetite, content readiness ${input.readiness}. ${share(d.cases, 'eligible')}% of volume is eligible, with ${p1} topics in the pilot and ${share(d.cases, 'human')}% always handled by a person. Simulated impact: about ${Math.round(d.out.hoursFreed).toLocaleString('en-US')} staff hours freed a month, which is an assumption, not a result.`, go: ['#brief', 'Open the plan brief'] }
    } else {
      const e = answer(query)
      bot = e ? { from: 'bot', text: e.a, go: e.go } : { from: 'bot', text: 'I do not have a verified answer for that. Try one of the suggestions, or contact Sarahí directly using the details in the left menu.' }
    }
    setMsgs(m => [...m, { from: 'you', text: query }, bot]); setText('')
  }
  const submit = (e: FormEvent) => { e.preventDefault(); send(text) }
  return (
    <>
      <PageHeader title="Ask about me" intro="A small assistant for the questions a hiring team usually has. It is scripted: no AI generation, nothing is sent anywhere, and every answer comes from the same facts used on this site." />
      <div className="rounded-2xl border border-silver-300 bg-white">
        <div className="max-h-[26rem] min-h-[16rem] space-y-3 overflow-y-auto p-4" role="log" aria-live="polite" aria-label="Conversation">
          {msgs.map((m, i) => (
            <div key={i} className={m.from === 'you' ? 'flex justify-end' : ''}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === 'you' ? 'bg-navy-900 text-ivory' : 'bg-ivory-100 text-navy-900'}`}>
                {m.text}{m.go && <a href={m.go[0]} className="mt-1 block font-semibold underline underline-offset-4">{m.go[1]} →</a>}
              </div>
            </div>))}
          <div ref={end} />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-silver-200 px-4 py-3">
          {SUGGEST.map(s => <button key={s} onClick={() => send(s)} className="rounded-full border border-silver-300 bg-ivory-100 px-3 py-1.5 text-xs hover:border-navy-800">{s}</button>)}
        </div>
        <form onSubmit={submit} className="flex gap-2 border-t border-silver-200 p-3">
          <label htmlFor="ask-q" className="sr-only">Your question</label>
          <input id="ask-q" value={text} onChange={e => setText(e.target.value)} placeholder="Ask a question…" className="min-w-0 flex-1 rounded-full border border-silver-300 px-4 py-2 text-sm" autoComplete="off" />
          <button className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory hover:bg-navy-800">Send</button>
        </form>
      </div>
      <p className="mt-2 text-xs text-slate2-500">{KB.length} verified topics. Questions it cannot answer are not guessed.</p>
    </>
  )
}
