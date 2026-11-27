import { useEffect, useRef, useState, type FormEvent } from 'react'
import { phrasePrompt } from '../../netlify/functions/_prompts.mjs'
import { groundedOK, aiPost, useAI } from '../lib/ai'
import { TOPIC_CHIPS, respond, type Intent, type Reply } from '../lib/assistant'
import { usePlan } from '../lib/store'

interface Turn { you: string; reply: Reply }
const EXAMPLES = ['What time does the branch open on Saturday?', '¿A qué hora abren los sábados?', "There's a charge on my card I didn't make", 'My husband passed away and I need to close his account', 'Can I get a mortgage quote?']
const INTENTS: Intent[] = ['person', 'vulnerable', 'fraud', 'complaints', 'hours', 'access', 'cards', 'txn', 'fees', 'loans', 'changes']

export default function Assistant() {
  const { input, d } = usePlan()
  const ai = useAI()
  const [useClaude, setUseClaude] = useState(true)
  const [busy, setBusy] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [turns])
  const claudeOn = ai === 'on' && useClaude
  const unknownRun = () => { let n = 0; for (let i = turns.length - 1; i >= 0 && turns[i].reply.intent === null && turns[i].reply.kind !== 'handoff'; i--) n++; return n }

  const run = async (message: string): Promise<Reply> => {
    let r = respond(message, d.cases, input, unknownRun())
    if (!claudeOn) return r
    if (r.intent === null) {                                   // rules did not understand: ask Claude to classify
      const c = await aiPost<{ topic: string }>({ mode: 'classify', message })
      if (c && INTENTS.includes(c.topic as Intent)) { r = respond(message, d.cases, input, unknownRun(), c.topic as Intent); r.trace = [`Understanding: Claude classified the message as “${c.topic}”`, ...r.trace] }
      else if (c) r.trace = ['Understanding: Claude found no clear topic', ...r.trace]
    }
    if (r.kind === 'answer' && r.approved) {                   // sensitive topics never reach here
      const p = await aiPost<{ reply: string }>({ mode: 'phrase', message, approved: r.approved })
      if (p && groundedOK(p.reply, r.approved)) r = { ...r, text: p.reply, trace: [...r.trace, 'Claude wrote the reply from the approved text only', 'Grounding check passed: no facts or numbers beyond the approved text'] }
      else r = { ...r, trace: [...r.trace, 'Grounding check not passed or Claude unavailable: the approved text is used as is'] }
    }
    return r
  }
  const send = async (q: string) => {
    const m = q.trim(); if (!m || busy) return
    setBusy(true); setText('')
    const reply = await run(m)
    setTurns(t => [...t, { you: m, reply }]); setBusy(false)
  }
  const submit = (e: FormEvent) => { e.preventDefault(); void send(text) }
  const last = turns[turns.length - 1]?.reply
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
        <span className={`rounded-full px-3 py-1 font-semibold ${claudeOn ? 'bg-navy-900 text-ivory' : 'border border-silver-300 bg-ivory-100 text-slate2-600'}`}>
          {ai === 'checking' ? 'Checking Claude…' : claudeOn ? 'Claude mode: on' : ai === 'on' ? 'Claude mode: off' : 'Rule-based mode'}
        </span>
        {ai === 'on' && <label className="flex items-center gap-1.5"><input type="checkbox" checked={useClaude} onChange={e => setUseClaude(e.target.checked)} />Use Claude</label>}
        {ai === 'off' && <span className="text-slate2-500">Claude runs on the Netlify deployment with an API key. Here, the same rules run without the model.</span>}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-silver-300 bg-white lg:col-span-3">
          <div className="max-h-[22rem] min-h-[15rem] space-y-3 overflow-y-auto p-4" role="log" aria-live="polite" aria-label="Conversation with the assistant">
            {turns.length === 0 && <p className="text-sm text-slate2-500">Type a customer message in any language, or try an example below.</p>}
            {turns.map((t, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl bg-navy-900 px-4 py-2 text-sm text-ivory">{t.you}</div></div>
                <div className="max-w-[85%] rounded-2xl bg-ivory-100 px-4 py-2 text-sm leading-relaxed">
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate2-400">{t.reply.kind === 'handoff' ? 'Assistant · handing over' : 'Assistant'}</p>
                  {t.reply.text}
                  {t.reply.kind === 'choices' && <span className="mt-2 flex flex-wrap gap-1.5">{TOPIC_CHIPS.map(c => <button key={c.label} onClick={() => void send(c.text)} className="rounded-full border border-silver-300 bg-white px-3 py-1 text-xs hover:border-navy-800">{c.label}</button>)}</span>}
                </div>
              </div>))}
            {busy && <p className="text-xs text-slate2-500" role="status">Thinking…</p>}
            <div ref={end} />
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-silver-200 px-3 py-2">{EXAMPLES.map(s => <button key={s} onClick={() => void send(s)} className="rounded-full border border-silver-300 bg-ivory-100 px-3 py-1 text-xs hover:border-navy-800">{s}</button>)}</div>
          <form onSubmit={submit} className="flex gap-2 border-t border-silver-200 p-3">
            <label htmlFor="msg" className="sr-only">Customer message</label>
            <input id="msg" value={text} maxLength={400} onChange={e => setText(e.target.value)} placeholder="Type a customer message…" autoComplete="off" className="min-w-0 flex-1 rounded-full border border-silver-300 px-4 py-2 text-sm" />
            <button disabled={busy} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory hover:bg-navy-800 disabled:opacity-50">Send</button>
          </form>
        </div>
        <div className="space-y-3 lg:col-span-2" aria-live="polite">
          <div className="rounded-2xl border border-silver-300 bg-white p-4 text-sm">
            <p className="eyebrow">Decision trace</p>
            {last ? (<dl className="mt-2 space-y-2">
              <div><dt className="text-xs text-slate2-500">Topic</dt><dd className="font-medium">{last.topic}</dd></div>
              <div><dt className="text-xs text-slate2-500">Decision</dt><dd><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${last.kind === 'handoff' ? 'bg-gold/20 text-[#0F5A55]' : 'bg-navy-900 text-ivory'}`}>{last.kind === 'answer' ? 'Answer from approved content' : last.kind === 'handoff' ? 'Hand to a person' : last.kind === 'clarify' ? 'Ask one clarifying question' : 'Offer approved topics'}</span></dd></div>
              <div><dt className="text-xs text-slate2-500">Why</dt><dd className="leading-relaxed">{last.reason}</dd></div>
              {last.trace.length > 0 && <div><dt className="text-xs text-slate2-500">Guardrail checks</dt><dd><ul className="list-disc space-y-0.5 pl-4 text-xs">{last.trace.map(t => <li key={t}>{t}</li>)}</ul></dd></div>}
            </dl>) : <p className="mt-2 text-slate2-500">Send a message to see why the assistant answers or hands over.</p>}
          </div>
          {last?.summary && (
            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-[#0F5A55]">
              <p className="text-xs font-semibold uppercase tracking-wider">Handoff summary the agent sees</p>
              <dl className="mt-2 space-y-1">
                <div><dt className="inline font-semibold">Customer asked: </dt><dd className="inline">“{last.summary.asked}”</dd></div>
                <div><dt className="inline font-semibold">Topic: </dt><dd className="inline">{last.summary.topic}</dd></div>
                <div><dt className="inline font-semibold">Why handed over: </dt><dd className="inline">{last.summary.why}</dd></div>
                <div><dt className="inline font-semibold">Next step: </dt><dd className="inline">{last.summary.next}</dd></div>
              </dl>
            </div>)}
          <details className="rounded-2xl border border-silver-300 bg-white p-3 text-xs">
            <summary className="cursor-pointer text-sm font-semibold">How it is built</summary>
            <p className="mt-2 leading-relaxed text-slate2-600">Three layers. <b>1. Rules</b> decide anything sensitive (fraud, complaints, bereavement, request for a person) with no model call. <b>2. Claude</b> only classifies unclear messages and rewrites approved text in the customer’s language. <b>3. A grounding check</b> rejects any reply that adds facts or numbers, and falls back to the approved text.</p>
            <p className="mt-2 font-semibold">Prompt sent to Claude when writing a reply:</p>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-ivory-100 p-2 text-[11px] leading-relaxed">{phrasePrompt('[approved text for the detected topic]')}</pre>
          </details>
          <p className="text-[11px] text-slate2-500">Plan settings: {input.handoff === 'live' ? 'live agent' : input.handoff === 'callback' ? 'scheduled callback' : 'branch appointment'} handoff; when unsure: {input.lowConf === 'person' ? 'hand to a person' : input.lowConf === 'clarify' ? 'ask once, then person' : 'offer choices'}. Change them on the Flow tab.</p>
        </div>
      </div>
    </>
  )
}
