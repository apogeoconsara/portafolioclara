import { useEffect, useRef, useState, type FormEvent } from 'react'
import StepNav from '../components/StepNav'
import { PageHeader } from '../components/ui'
import { TOPIC_CHIPS, respond, type Reply } from '../lib/assistant'
import { usePlan } from '../lib/store'

interface Turn { you: string; reply: Reply }
const EXAMPLES = ['What time does the branch open on Saturday?', "There's a charge on my card I didn't make", 'My husband passed away and I need to close his account', 'Can I get a mortgage quote?', 'I need to reset my password']

export default function Assistant() {
  const { input, d } = usePlan()
  const [turns, setTurns] = useState<Turn[]>([])
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [turns])
  const unknownRun = () => { let n = 0; for (let i = turns.length - 1; i >= 0 && turns[i].reply.intent === null && turns[i].reply.kind !== 'handoff'; i--) n++; return n }
  const send = (q: string) => { const m = q.trim(); if (!m) return; setTurns(t => [...t, { you: m, reply: respond(m, d.cases, input, unknownRun()) }]); setText('') }
  const submit = (e: FormEvent) => { e.preventDefault(); send(text) }
  const last = turns[turns.length - 1]?.reply
  return (
    <>
      <PageHeader step="Step 4 of 8 · Design" tag="hypothetical" title="Test the assistant" intro="A rule-based banking assistant that follows the plan you built: it answers only in-scope topics from approved content, and hands everything else to a person with a summary. No AI model is involved, so every decision is traceable." />
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-silver-300 bg-white lg:col-span-3">
          <div className="max-h-[26rem] min-h-[18rem] space-y-3 overflow-y-auto p-4" role="log" aria-live="polite" aria-label="Conversation with the assistant">
            {turns.length === 0 && <p className="text-sm text-slate2-500">Type a customer message, or try an example below.</p>}
            {turns.map((t, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl bg-navy-900 px-4 py-2.5 text-sm text-ivory">{t.you}</div></div>
                <div className="max-w-[85%] rounded-2xl bg-ivory-100 px-4 py-2.5 text-sm leading-relaxed">
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate2-400">{t.reply.kind === 'handoff' ? 'Assistant · handing over' : 'Assistant'}</p>
                  {t.reply.text}
                  {t.reply.kind === 'choices' && <span className="mt-2 flex flex-wrap gap-1.5">{TOPIC_CHIPS.map(c => <button key={c.label} onClick={() => send(c.text)} className="rounded-full border border-silver-300 bg-white px-3 py-1 text-xs hover:border-navy-800">{c.label}</button>)}</span>}
                </div>
              </div>))}
            <div ref={end} />
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-silver-200 px-4 py-3">{EXAMPLES.map(s => <button key={s} onClick={() => send(s)} className="rounded-full border border-silver-300 bg-ivory-100 px-3 py-1 text-xs hover:border-navy-800">{s}</button>)}</div>
          <form onSubmit={submit} className="flex gap-2 border-t border-silver-200 p-3">
            <label htmlFor="msg" className="sr-only">Customer message</label>
            <input id="msg" value={text} onChange={e => setText(e.target.value)} placeholder="Type a customer message…" autoComplete="off" className="min-w-0 flex-1 rounded-full border border-silver-300 px-4 py-2 text-sm" />
            <button className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory hover:bg-navy-800">Send</button>
          </form>
        </div>
        <div className="space-y-3 lg:col-span-2" aria-live="polite">
          <div className="rounded-2xl border border-silver-300 bg-white p-4 text-sm">
            <p className="eyebrow">Decision trace</p>
            {last ? (<dl className="mt-2 space-y-2">
              <div><dt className="text-xs text-slate2-500">Topic detected</dt><dd className="font-medium">{last.topic}</dd></div>
              <div><dt className="text-xs text-slate2-500">Decision</dt><dd><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${last.kind === 'handoff' ? 'bg-gold/20 text-[#6b5223]' : 'bg-navy-900 text-ivory'}`}>{last.kind === 'answer' ? 'Answer from approved content' : last.kind === 'handoff' ? 'Hand to a person' : last.kind === 'clarify' ? 'Ask one clarifying question' : 'Offer approved topics'}</span></dd></div>
              <div><dt className="text-xs text-slate2-500">Why</dt><dd className="leading-relaxed">{last.reason}</dd></div>
            </dl>) : <p className="mt-2 text-slate2-500">Send a message to see why the assistant answers or hands over.</p>}
          </div>
          {last?.summary && (
            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-[#5d4720]">
              <p className="text-xs font-semibold uppercase tracking-wider">Handoff summary the agent sees</p>
              <dl className="mt-2 space-y-1.5">
                <div><dt className="inline font-semibold">Customer asked: </dt><dd className="inline">“{last.summary.asked}”</dd></div>
                <div><dt className="inline font-semibold">Topic: </dt><dd className="inline">{last.summary.topic}</dd></div>
                <div><dt className="inline font-semibold">Why handed over: </dt><dd className="inline">{last.summary.why}</dd></div>
                <div><dt className="inline font-semibold">Assistant said: </dt><dd className="inline">{last.summary.assistant}</dd></div>
                <div><dt className="inline font-semibold">Suggested next step: </dt><dd className="inline">{last.summary.next}</dd></div>
              </dl>
            </div>)}
          <p className="text-xs text-slate2-500">Configured from your plan: {input.handoff === 'live' ? 'live agent' : input.handoff === 'callback' ? 'scheduled callback' : 'branch appointment'} handoff, and “{input.lowConf === 'person' ? 'hand to a person' : input.lowConf === 'clarify' ? 'ask once, then person' : 'offer choices'}” when unsure. Change them on the Flow page.</p>
        </div>
      </div>
      <StepNav page="assistant" />
    </>
  )
}
