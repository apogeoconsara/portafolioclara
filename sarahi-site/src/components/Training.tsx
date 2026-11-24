import { useState } from 'react'
import { Section } from './ui'

const LESSONS = [
  { t: 'What the assistant is', b: 'Think of it as a well-read colleague on the front desk. It can look up approved information and explain it clearly, quickly, at any hour. It does not make exceptions, judge a situation, or know your customer’s history unless the system shows it.', tip: 'It is fast at answers. You are better at judgment.' },
  { t: 'When it hands over', b: 'Four situations always come to you: (1) possible fraud, (2) a complaint, (3) a customer who may be vulnerable — bereavement, distress, confusion — and (4) anyone who asks for a person. It also hands over when it is not confident. This is by design.', tip: 'A handoff is the system working, not failing.' },
  { t: 'How to take over well', b: 'Open the summary first. It shows what the customer asked and what the assistant already said. Start with “I can see you’ve been asking about…” — never “How can I help?”. Then check the one thing the summary cannot tell you: how the customer feels.', tip: 'The customer should never have to repeat themselves.' }
]
const QS = [
  { s: 'A customer writes: “There’s a charge on my card I don’t recognise.” The assistant is 94% sure it can answer from the FAQ. What should happen?', o: ['The assistant answers — it is very confident', 'It goes to a person: suspected fraud always escalates', 'The assistant asks the customer to call back tomorrow'], c: 1, why: 'Correct. Suspected fraud is escalated by rule, whatever the confidence. Confidence measures how sure the system is, not whether it is the right responder.' , wrong: 'Not quite. Fraud is one of the categories that always goes to a person. High confidence does not change that, and asking customers to call back adds risk.' },
  { s: 'You receive a handoff. The summary says the customer has asked about a fee twice and sounds frustrated. Your best first sentence?', o: ['“Hello, how can I help you today?”', '“Could you explain the problem from the beginning?”', '“I can see you’ve asked about this fee twice — let me sort it out with you now.”'], c: 2, why: 'Correct. It shows you read the summary, acknowledges the effort already spent, and moves straight to resolution.', wrong: 'Not quite. Both of the first two make the customer repeat themselves, which is exactly what the summary is there to prevent.' },
  { s: 'The assistant answered a routine question about branch opening hours, correctly. Should you step in?', o: ['Yes, check every answer to be safe', 'No — it was in scope and correct; you step in when the rules or the customer call for it', 'Only if the customer thanks the assistant'], c: 1, why: 'Correct. Trusting the assistant on routine questions is what frees your time for the cases that need you. You still report wrong answers through the feedback form.', wrong: 'Not quite. Re-checking routine answers removes the benefit. Step in on the four triggers, low confidence, or when the customer asks.' }
]

export default function Training() {
  const [step, setStep] = useState(0) // 0..2 lessons, 3 quiz
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<(number | null)[]>(QS.map(() => null))
  const answered = picked.filter(p => p !== null).length
  const score = picked.filter((p, i) => p === QS[i].c).length
  const q = QS[qi]
  return (
    <Section id="enablement" eyebrow="Training and enablement" tag="hypothetical"
      title="Teaching “AI and human escalation” in ten minutes"
      intro="A sample microlearning module for non-technical banking staff. The goal is not to explain AI; it is to make people confident about what to do next.">
      <div className="mx-auto max-w-3xl rounded-2xl border border-silver-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-silver-200 px-5 py-3 text-xs text-slate2-500">
          <span>Module: Working alongside the assistant</span><span>{step < 3 ? `Lesson ${step + 1} of 3` : 'Knowledge check'}</span>
        </div>
        <div className="flex gap-1 px-5 pt-4" aria-hidden>{[0, 1, 2, 3].map(k => <span key={k} className={`h-1 flex-1 rounded-full ${k <= step ? 'bg-navy-900' : 'bg-silver-300'}`} />)}</div>
        <div className="p-6 md:p-10" aria-live="polite">
          {step < 3 ? (
            <>
              <h3 className="serif text-3xl">{LESSONS[step].t}</h3>
              <p className="mt-4 text-lg leading-relaxed">{LESSONS[step].b}</p>
              <p className="mt-6 border-l-2 border-gold pl-4 serif text-xl">{LESSONS[step].tip}</p>
            </>
          ) : (
            <>
              <p className="eyebrow">Scenario {qi + 1} of {QS.length}</p>
              <h3 className="serif mt-2 text-2xl leading-snug">{q.s}</h3>
              <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Answer options">
                {q.o.map((o, k) => {
                  const p = picked[qi], done = p !== null
                  const state = !done ? 'border-silver-300 hover:border-navy-800' : k === q.c ? 'border-navy-900 bg-navy-900 text-ivory' : k === p ? 'border-gold bg-gold/15' : 'border-silver-200 opacity-60'
                  return <button key={o} role="radio" aria-checked={p === k} disabled={done} onClick={() => setPicked(a => a.map((v, i) => i === qi ? k : v))} className={`w-full rounded-xl border p-4 text-left text-sm transition ${state}`}>{o}</button>
                })}
              </div>
              {picked[qi] !== null && (
                <p role="status" className="mt-5 rounded-xl bg-ivory-100 p-4 text-sm leading-relaxed"><strong>{picked[qi] === q.c ? '✓ ' : '✗ '}</strong>{picked[qi] === q.c ? q.why : q.wrong + ' ' + q.why.replace(/^Correct\. /, '')}</p>
              )}
              {answered === QS.length && (
                <div className="mt-6 rounded-xl bg-navy-900 p-5 text-ivory">
                  <p className="serif text-2xl">{score} of {QS.length} correct</p>
                  <p className="mt-1 text-sm text-silver-300">{score === QS.length ? 'You are ready to work alongside the assistant.' : 'Revisit lesson 2: the four always-human situations.'}</p>
                  <button onClick={() => { setPicked(QS.map(() => null)); setQi(0); setStep(0) }} className="mt-3 text-sm underline underline-offset-4">Restart module</button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-between border-t border-silver-200 px-5 py-4">
          {step < 3
            ? <><button disabled={step === 0} onClick={() => setStep(step - 1)} className="text-sm font-semibold disabled:opacity-30">← Back</button>
                <button onClick={() => setStep(step + 1)} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory">{step === 2 ? 'Start knowledge check' : 'Next'}</button></>
            : <><button disabled={qi === 0} onClick={() => setQi(qi - 1)} className="text-sm font-semibold disabled:opacity-30">← Previous</button>
                <button disabled={qi === QS.length - 1} onClick={() => setQi(qi + 1)} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-ivory disabled:opacity-30">Next scenario</button></>}
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-3xl gap-4 text-sm text-slate2-600 md:grid-cols-3">
        <p><span className="font-semibold text-navy-900">Plain language.</span> No model, token or threshold vocabulary for the learner.</p>
        <p><span className="font-semibold text-navy-900">One behaviour per lesson.</span> Each ends with a sentence people can repeat.</p>
        <p><span className="font-semibold text-navy-900">Practice, then feedback.</span> The check uses real situations and explains the why.</p>
      </div>
    </Section>
  )
}
