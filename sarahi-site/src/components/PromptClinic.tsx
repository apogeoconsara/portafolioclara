import { useState } from 'react'
import { Section } from './ui'

const BASE = 'You are a helpful bank assistant. Answer customer questions.'
const BLOCKS: { id: string; label: string; why: string; text: string }[] = [
  { id: 'role', label: 'Role and audience', why: 'Sets who is speaking and to whom, so the answer is pitched at a retail customer.', text: 'You are the virtual assistant of a regional bank, speaking with retail customers. Use plain language and avoid jargon.' },
  { id: 'sources', label: 'Approved sources only', why: 'Stops the model from inventing fees, policies or dates. “I don’t know” is an acceptable answer.', text: 'Answer only from the approved knowledge articles provided. If the answer is not in them, say you do not know and offer a person.' },
  { id: 'boundaries', label: 'Boundaries', why: 'Defines what the assistant must never do, whatever the customer asks.', text: 'Never give financial advice or compare products by returns. Never ask for or repeat full card numbers, PINs or passwords.' },
  { id: 'escalation', label: 'Escalation rules', why: 'Turns the design decision “sensitive topics go to a person” into an instruction.', text: 'Hand over to a person when the customer mentions fraud, a complaint, bereavement or distress, or asks for a person. Tell them what happens next.' },
  { id: 'format', label: 'Answer format', why: 'Short, scannable answers reduce abandonment and make quality easy to review.', text: 'Answer in at most three short sentences, then offer one clear next step.' },
  { id: 'tone', label: 'Tone', why: 'Keeps the register calm and respectful when the customer is frustrated.', text: 'Be warm and calm. Acknowledge frustration briefly. Never use slang or humour with upset customers.' }
]
const TESTS: { msg: string; needs: string[] }[] = [
  { msg: 'Why was I charged an overdraft fee?', needs: ['sources'] },
  { msg: 'Which account will make me the most money?', needs: ['boundaries'] },
  { msg: 'Someone used my card. I didn’t make these charges.', needs: ['escalation'] },
  { msg: 'Explain fixed versus variable rates.', needs: ['role', 'format'] },
  { msg: 'This is the third time I’m asking. I’m really upset.', needs: ['escalation', 'tone'] }
]
const LABEL = Object.fromEntries(BLOCKS.map(b => [b.id, b.label.toLowerCase()]))

export function coverage(on: Set<string>) {
  return TESTS.map(t => ({ ...t, missing: t.needs.filter(n => !on.has(n)) }))
}

export default function PromptClinic() {
  const [on, setOn] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setOn(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const res = coverage(on)
  const ok = res.filter(r => r.missing.length === 0).length
  const prompt = [BASE, ...BLOCKS.filter(b => on.has(b.id)).map(b => b.text)].join('\n')
  return (
    <Section id="prompts" eyebrow="Prompt clinic" tag="hypothetical" next={{ id: 'impact', label: 'Business impact simulator' }}
      title="Advising a client on prompts, block by block."
      intro="Start from a weak prompt, add the blocks a bank actually needs, and see which customer messages are still unprotected.">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="eyebrow">Add blocks</p>
          <ul className="mt-3 space-y-2">
            {BLOCKS.map(b => (
              <li key={b.id}><label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${on.has(b.id) ? 'border-navy-900 bg-white' : 'border-silver-300 bg-ivory-100 hover:border-navy-800'}`}>
                <input type="checkbox" checked={on.has(b.id)} onChange={() => toggle(b.id)} className="mt-1" />
                <span><span className="block font-semibold">{b.label}</span><span className="text-slate2-600">{b.why}</span></span>
              </label></li>))}
          </ul>
        </div>
        <div className="space-y-5 lg:col-span-3">
          <div>
            <p className="eyebrow">Assembled prompt</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-navy-900 p-4 text-sm leading-relaxed text-ivory" aria-live="polite">{prompt}</pre>
          </div>
          <div>
            <div className="flex items-baseline justify-between"><p className="eyebrow">Test messages</p><p className="text-sm font-semibold" aria-live="polite">{ok} of {TESTS.length} covered</p></div>
            <ul className="mt-2 divide-y divide-silver-200 rounded-xl border border-silver-300 bg-white">
              {res.map(r => (
                <li key={r.msg} className="grid gap-1 p-3 text-sm sm:grid-cols-[1fr_auto] sm:gap-4">
                  <div><p>“{r.msg}”</p>{r.missing.length > 0 && <p className="mt-0.5 text-xs text-slate2-500">Needs: {r.missing.map(m => LABEL[m]).join(', ')}</p>}</div>
                  <span className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold ${r.missing.length ? 'bg-gold/20 text-[#6b5223]' : 'bg-navy-900 text-ivory'}`}>{r.missing.length ? 'At risk' : 'Covered'}</span>
                </li>))}
            </ul>
          </div>
          <p className="text-sm text-slate2-600"><span className="font-semibold text-navy-900">How I’d coach the client:</span> keep the prompt versioned, test it against a fixed question set, and change one block at a time. This check is a transparent coverage rule — not a live model run.</p>
        </div>
      </div>
    </Section>
  )
}
