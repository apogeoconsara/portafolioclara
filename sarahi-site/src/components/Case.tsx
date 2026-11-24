import type React from "react"
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import FlowDiagram, { type NodeId } from './FlowDiagram'
import { Callout, Section } from './ui'

type StageKey = 'discover' | 'design' | 'implement' | 'adopt' | 'optimize'
const STAGES: { key: StageKey; name: string; summary: string; focus: NodeId[]; deliverable: string }[] = [
  { key: 'discover', name: 'Discover', deliverable: 'Discovery brief', focus: ['inq'], summary: 'Understand how inquiries really flow today, who is affected, and what “better” means in numbers the client agrees on.' },
  { key: 'design', name: 'Design', deliverable: 'Escalation & guardrail specification', focus: ['risk', 'dec', 'human'], summary: 'Decide what the assistant may do, what it must never do, and exactly when a person takes over.' },
  { key: 'implement', name: 'Implement', deliverable: 'Go-live readiness checklist', focus: ['ai'], summary: 'Turn the design into something tested, integrated and safe to release in controlled steps.' },
  { key: 'adopt', name: 'Adopt', deliverable: 'Role-based enablement plan', focus: ['human'], summary: 'Prepare the people who will work alongside the assistant, so the handoff works in practice.' },
  { key: 'optimize', name: 'Optimize', deliverable: 'Monthly performance review', focus: ['review', 'done'], summary: 'Read the signals, change one thing at a time, and check whether it helped.' }
]

const card = 'rounded-2xl border border-silver-300 bg-white'
const chip = (on: boolean) => `rounded-full border px-4 py-2 text-sm transition ${on ? 'border-navy-900 bg-navy-900 text-ivory' : 'border-silver-300 bg-ivory-100 text-navy-800 hover:border-navy-800'}`

/* ---------- Discover ---------- */
const STAKE = [
  { who: 'Head of Customer Service', learn: 'Which inquiry types drive volume and cost, and what the service promise is today.', ask: ['Which five inquiry types do you wish you could answer faster?', 'What does a “good” interaction look like for you?'], evidence: 'Contact-reason report, current service levels' },
  { who: 'Contact-centre agents', learn: 'Where time is lost: repeat questions, system switching, unclear policies.', ask: ['What do customers have to repeat to you?', 'Which questions do you answer ten times a day?'], evidence: 'Shadowing sessions, call/chat samples (anonymised)' },
  { who: 'Compliance & Risk', learn: 'Which topics must never be handled by automation, and what must be recorded.', ask: ['Which interactions carry regulatory obligations?', 'What must be logged, and for how long?'], evidence: 'Policy library, complaints procedure' },
  { who: 'IT & Integration lead', learn: 'What systems the assistant must connect to and what the security constraints are.', ask: ['What can be read via API today, and what cannot?', 'How are changes released here?'], evidence: 'System inventory, security requirements' },
  { who: 'Branch managers', learn: 'How customers move between branch, phone and digital, and where handoffs break.', ask: ['What do customers come to the branch to ask?', 'What would make your team trust this?'], evidence: 'Branch inquiry logs, staff feedback' }
]
function Discover() {
  const [s, setS] = useState(0)
  const st = STAKE[s]
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Stakeholder interviews — select a group</p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Stakeholder groups">
          {STAKE.map((x, i) => <button key={x.who} aria-pressed={s === i} onClick={() => setS(i)} className={chip(s === i)}>{x.who}</button>)}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3" aria-live="polite">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">What I need to learn</p><p className="mt-1.5 text-sm leading-relaxed">{st.learn}</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">Questions I would ask</p><ul className="mt-1.5 space-y-1 text-sm">{st.ask.map(q => <li key={q}>“{q}”</li>)}</ul></div>
          <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">Evidence to collect</p><p className="mt-1.5 text-sm leading-relaxed">{st.evidence}</p></div>
        </div>
      </div>
      <div>
        <p className="eyebrow">Measurable objectives (draft for client agreement)</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Draft objectives with metrics, baselines and targets</caption>
            <thead><tr className="border-b border-silver-300 text-xs uppercase tracking-wider text-slate2-500"><th className="py-2 pr-4">Objective</th><th className="pr-4">Metric</th><th className="pr-4">Baseline</th><th>Target</th></tr></thead>
            <tbody className="divide-y divide-silver-200">
              {[
                ['Faster answers to routine questions', 'Median time to first useful answer', 'Measure in discovery', 'Agree after baseline'],
                ['Free agent time for complex cases', 'Share of inquiries resolved without a person', 'Measure in discovery', 'Agree after baseline'],
                ['Protect trust', 'Customer satisfaction on assisted vs. human conversations', 'Measure in discovery', 'No decline vs. baseline'],
                ['Safe handoffs', 'Sensitive inquiries reaching a person', 'Define in design', '100% in testing']
              ].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={`py-2.5 pr-4 ${i === 0 ? 'font-medium' : 'text-slate2-600'}`}>{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate2-600">A deliberate choice: no target is set before a baseline exists. Numbers invented in a kickoff meeting are the ones teams later regret.</p>
      </div>
    </div>
  )
}

/* ---------- Design: escalation tester ---------- */
type Sens = 'fraud' | 'complaint' | 'vulnerable' | 'person' | null
const INQ: { text: string; conf: number; sens: Sens }[] = [
  { text: 'What time does the downtown branch open on Saturdays?', conf: 96, sens: null },
  { text: 'There is a card payment on my statement that I don’t recognise.', conf: 91, sens: 'fraud' },
  { text: 'How do I reset my online banking password?', conf: 93, sens: null },
  { text: 'I’ve asked twice about this fee and nobody fixed it. I want to complain.', conf: 88, sens: 'complaint' },
  { text: 'What is the difference between a fixed and a variable rate?', conf: 78, sens: null },
  { text: 'My husband passed away last month. What do I do with our joint account?', conf: 70, sens: 'vulnerable' },
  { text: 'Can I raise my daily transfer limit?', conf: 64, sens: null },
  { text: 'Please transfer me to a person.', conf: 99, sens: 'person' }
]
const SENS_LABEL: Record<Exclude<Sens, null>, string> = { fraud: 'Suspected fraud', complaint: 'Formal complaint', vulnerable: 'Vulnerable customer / bereavement', person: 'Customer asks for a person' }
export function route(q: { conf: number; sens: Sens }, threshold: number, rules: Record<string, boolean>) {
  if (q.sens && rules[q.sens]) return { human: true, why: `Rule: ${SENS_LABEL[q.sens]} always goes to a person.` }
  if (q.conf < threshold) return { human: true, why: `Confidence ${q.conf} is below the ${threshold} threshold.` }
  return { human: false, why: q.sens ? `Rule for “${SENS_LABEL[q.sens]}” is switched off — the assistant answers (${q.conf} ≥ ${threshold}).` : `In scope, confidence ${q.conf} ≥ ${threshold}.` }
}
function Design() {
  const [th, setTh] = useState(75)
  const [rules, setRules] = useState<Record<string, boolean>>({ fraud: true, complaint: true, vulnerable: true, person: true })
  const res = INQ.map(q => ({ q, r: route(q, th, rules) }))
  const unsafe = res.filter(x => !x.r.human && x.q.sens)
  const humanN = res.filter(x => x.r.human).length
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate2-600">Try the escalation rules on eight <strong>synthetic</strong> inquiries. Change the confidence threshold or switch a mandatory rule off and watch what happens.</p>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="th" className="flex justify-between text-sm font-medium"><span>Minimum confidence to answer</span><span className="tabular-nums">{th}</span></label>
          <input id="th" type="range" min={40} max={99} value={th} onChange={e => setTh(+e.target.value)} className="mt-2 w-full" />
          <p className="mt-1 text-xs text-slate2-500">Higher = more handoffs, fewer risks. The right value is set from pilot data, not intuition.</p>
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Always hand to a person when…</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(SENS_LABEL) as (keyof typeof SENS_LABEL)[]).map(k => (
              <label key={k} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={rules[k]} onChange={e => setRules(r => ({ ...r, [k]: e.target.checked }))} className="mt-1" />{SENS_LABEL[k]}</label>
            ))}
          </div>
        </fieldset>
      </div>
      <ul className="divide-y divide-silver-200 rounded-xl border border-silver-300" aria-live="polite">
        {res.map(({ q, r }) => (
          <li key={q.text} className="grid gap-1 p-3 text-sm md:grid-cols-[1fr_auto] md:gap-4">
            <div><p>“{q.text}”</p><p className="mt-0.5 text-xs text-slate2-500">{r.why}</p></div>
            <span className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold ${r.human ? 'bg-gold/20 text-[#6b5223]' : 'bg-navy-900 text-ivory'}`}>{r.human ? 'Human agent' : 'AI assistant'}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm"><strong>{humanN} of {INQ.length}</strong> go to a person.</p>
      {unsafe.length > 0 && <Callout tone="gold" title="Consulting judgment: this configuration is not one I would recommend">With a mandatory rule off, the assistant now answers {unsafe.length} sensitive inquiry{unsafe.length > 1 ? 'ies' : ''} on confidence alone. A model can be confident and still be the wrong responder — sensitive topics are routed by rule, not by score.</Callout>}
    </div>
  )
}

/* ---------- Implement ---------- */
const CHECKS: { id: string; t: string; must: boolean }[] = [
  { id: 'a', must: true, t: 'Assistant answers only from approved, versioned content' },
  { id: 'b', must: true, t: 'All four sensitive categories escalate correctly in test' },
  { id: 'c', must: true, t: 'Handoff delivers a conversation summary to the agent desktop' },
  { id: 'd', must: true, t: 'Security and compliance review signed off' },
  { id: 'e', must: true, t: 'Fallback to a person works if the assistant or an integration is down' },
  { id: 'f', must: false, t: 'Answer quality meets the agreed threshold on the test question set' },
  { id: 'g', must: false, t: 'Monitoring dashboard live and alert owners named' },
  { id: 'h', must: false, t: 'Pilot team has completed enablement' },
  { id: 'i', must: false, t: 'Rollback plan rehearsed' }
]
export function readiness(done: Set<string>) {
  const must = CHECKS.filter(c => c.must), should = CHECKS.filter(c => !c.must)
  const mOpen = must.filter(c => !done.has(c.id)).length
  const sDone = should.filter(c => done.has(c.id)).length
  if (mOpen > 0) return { tone: 'No-go', text: `${mOpen} must-have item${mOpen > 1 ? 's' : ''} still open. Nothing else compensates for these.` }
  if (sDone < should.length) return { tone: 'Conditional', text: `All must-haves met. Close ${should.length - sDone} remaining item${should.length - sDone > 1 ? 's' : ''}, or document an accepted risk, before the pilot.` }
  return { tone: 'Go', text: 'Ready for a controlled pilot — limited intents, one team, clear exit criteria.' }
}
function Implement() {
  const [done, setDone] = useState<Set<string>>(new Set(['a', 'c']))
  const r = readiness(done)
  const toggle = (id: string) => setDone(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-3">
        <p className="eyebrow">Acceptance criteria — tick what the test evidence supports</p>
        <ul className="mt-3 space-y-2">
          {CHECKS.map(c => (
            <li key={c.id}><label className="flex cursor-pointer items-start gap-3 rounded-lg border border-silver-200 p-3 text-sm hover:bg-ivory-100">
              <input type="checkbox" checked={done.has(c.id)} onChange={() => toggle(c.id)} className="mt-0.5" />
              <span className="flex-1">{c.t}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.must ? 'text-[#7a5f2c]' : 'text-slate2-400'}`}>{c.must ? 'Must' : 'Should'}</span>
            </label></li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-2 space-y-4">
        <div className={`rounded-xl p-5 ${r.tone === 'Go' ? 'bg-navy-900 text-ivory' : r.tone === 'Conditional' ? 'bg-slate2-500 text-ivory' : 'bg-gold/15 text-[#5d4720]'}`} aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Readiness</p>
          <p className="serif mt-1 text-3xl">{r.tone}</p><p className="mt-2 text-sm">{r.text}</p>
        </div>
        <div>
          <p className="eyebrow">Rollout plan</p>
          <ol className="mt-3 space-y-3 text-sm">
            {[['Wave 0', 'Internal test with staff only'], ['Wave 1', 'Pilot: one team, a few low-risk topics'], ['Wave 2', 'Add topics and teams as the pilot gate is met'], ['Wave 3', 'Broad release with monitoring and rollback in place']].map(([w, d]) => (
              <li key={w} className="flex gap-3"><span className="w-14 shrink-0 font-semibold text-slate2-500">{w}</span><span>{d}</span></li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

/* ---------- Adopt ---------- */
const ROLES = [
  { r: 'Contact-centre agents', know: 'What the assistant handled before the handoff, how to read the summary, and when to take over without hesitation.', mat: 'Two-page handoff guide, 10-minute microlearning (see next section), practice scenarios', sig: 'Share of handoffs where the customer did not have to repeat themselves', risk: 'Agents ignore the summary and re-ask everything, so customers feel the assistant made things worse.' },
  { r: 'Team leads', know: 'How to coach with the new data, and how to raise a bad answer for correction.', mat: 'Weekly review template, escalation feedback form', sig: 'Corrections raised and closed per week', risk: 'Problems stay anecdotal and never reach the people who can fix the content.' },
  { r: 'Branch staff', know: 'What customers may already have tried and how branch and digital hand over.', mat: 'One-page “what the assistant can and cannot do” card', sig: 'Staff able to explain the assistant to a customer', risk: 'Branches work around the assistant or discourage customers from using it.' },
  { r: 'Compliance & QA', know: 'How to sample conversations and verify the rules are followed.', mat: 'Sampling plan, issue-classification guide', sig: 'Sampled conversations that follow policy', risk: 'Oversight is theoretical, so confidence in the system erodes.' }
]
function Adopt() {
  const [i, setI] = useState(0); const x = ROLES[i]
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate2-600">Adoption is planned per role: different people need different things, and each fails in a different way.</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Roles">{ROLES.map((r, k) => <button key={r.r} aria-pressed={i === k} onClick={() => setI(k)} className={chip(i === k)}>{r.r}</button>)}</div>
      <dl className="grid gap-5 text-sm md:grid-cols-2" aria-live="polite">
        {[['What they need to know', x.know], ['Enablement materials', x.mat], ['Adoption signal I would track', x.sig], ['What happens if we skip this', x.risk]].map(([k, v]) => (
          <div key={k}><dt className="text-xs font-semibold uppercase tracking-wider text-slate2-500">{k}</dt><dd className="mt-1.5 leading-relaxed">{v}</dd></div>
        ))}
      </dl>
      <a href="#enablement" className="inline-block text-sm font-semibold text-slate2-600 underline underline-offset-4">See a sample microlearning module →</a>
    </div>
  )
}

/* ---------- Optimize ---------- */
const SIGNALS = [
  { s: 'Many escalations on one topic (e.g. card limits)', dx: ['Content is missing or outdated', 'Topic needs identity checks the assistant cannot do', 'Intent is being misclassified'], act: 'Review 30 escalated conversations on that topic before changing anything. If the content is the gap, fix it. If it needs identity checks, keep it with a person and say so clearly to the customer.', verify: 'Escalation rate for that topic over the next two review cycles' },
  { s: 'Customers abandon after the second assistant reply', dx: ['Answers are too long or too generic', 'The option to reach a person is hard to find'], act: 'Shorten the answer pattern and make the “talk to a person” option visible earlier. Change one of the two, so the effect is attributable.', verify: 'Abandonment share and satisfaction for that flow' },
  { s: 'Satisfaction is lower for assistant-resolved conversations', dx: ['Fast but unhelpful answers marked “resolved”', 'Wrong expectations about what the assistant can do'], act: 'Tighten what counts as “resolved” (customer confirmation, not silence) and review a sample with Compliance & QA.', verify: 'Gap between assisted and human satisfaction' },
  { s: 'Low use in some branches', dx: ['Staff do not know how to introduce it', 'Branch customers have different needs'], act: 'Run a short session with those teams, collect their objections, and adjust enablement material before touching the assistant itself.', verify: 'Feature adoption by branch' }
]
function Optimize() {
  const [i, setI] = useState(0); const x = SIGNALS[i]
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate2-600">Optimization is a discipline: read the signal, form hypotheses, change one thing, check. Pick a signal.</p>
      <div className="grid gap-2 md:grid-cols-2" role="group" aria-label="Signals">{SIGNALS.map((s, k) => <button key={s.s} aria-pressed={i === k} onClick={() => setI(k)} className={`rounded-xl border p-3 text-left text-sm transition ${i === k ? 'border-navy-900 bg-navy-900 text-ivory' : 'border-silver-300 bg-ivory-100 hover:border-navy-800'}`}>{s.s}</button>)}</div>
      <div className="grid gap-5 text-sm md:grid-cols-3" aria-live="polite">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">Possible causes</p><ul className="mt-1.5 list-disc space-y-1 pl-4">{x.dx.map(d => <li key={d}>{d}</li>)}</ul></div>
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">Action</p><p className="mt-1.5 leading-relaxed">{x.act}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate2-500">How I would verify</p><p className="mt-1.5 leading-relaxed">{x.verify}</p></div>
      </div>
      <a href="#impact" className="inline-block text-sm font-semibold text-slate2-600 underline underline-offset-4">Explore the KPI simulator →</a>
    </div>
  )
}

const BODY: Record<StageKey, () => React.JSX.Element> = { discover: Discover, design: Design, implement: Implement, adopt: Adopt, optimize: Optimize }

export default function Case() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const st = STAGES[i]
  const Body = BODY[st.key]
  const focus = useMemo(() => st.focus, [st])
  return (
    <Section next={{ id: 'enablement', label: 'Training and enablement' }} id="case" eyebrow="Interactive consulting experience" tag="hypothetical"
      title="How I would take a regional bank from idea to adoption"
      intro="A hypothetical engagement: a regional bank wants to improve customer service with AI. Move through five stages. Each one ends in a deliverable you can interact with.">
      <Callout title="Hypothetical scenario">The bank, its data and its numbers are invented to show how I work. Nothing here describes a real client or result.</Callout>
      <div role="tablist" aria-label="Engagement stages" className="mt-8 grid grid-cols-5 gap-1.5 md:gap-3">
        {STAGES.map((s, k) => (
          <button key={s.key} role="tab" id={`ct-${k}`} aria-selected={i === k} aria-controls="cpanel" tabIndex={i === k ? 0 : -1} onClick={() => setI(k)}
            onKeyDown={e => { if (e.key === 'ArrowRight') setI(Math.min(4, k + 1)); if (e.key === 'ArrowLeft') setI(Math.max(0, k - 1)) }}
            className="group text-left">
            <span className={`block h-1 rounded-full transition-colors ${k <= i ? 'bg-navy-900' : 'bg-silver-300'}`} />
            <span className={`mt-2 block text-[11px] font-semibold tracking-widest ${i === k ? 'text-navy-900' : 'text-slate2-400'}`}>0{k + 1}</span>
            <span className={`serif block text-sm md:text-xl ${i === k ? 'text-navy-900' : 'text-slate2-400 group-hover:text-navy-800'}`}>{s.name}</span>
          </button>
        ))}
      </div>
      <div id="cpanel" role="tabpanel" aria-labelledby={`ct-${i}`} className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div key={st.key} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
            <p className="max-w-2xl text-lg leading-relaxed">{st.summary}</p>
            <div className={`${card} mt-6 p-4 md:p-6`}>
              <FlowDiagram active={focus} />
              <p className="mt-2 text-xs text-slate2-500">Highlighted: where this stage focuses. <span className="font-semibold text-[#7a5f2c]">Gold paths = human escalation.</span></p>
            </div>
            <div className={`${card} mt-6 overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-silver-200 bg-ivory-100 px-5 py-3 md:px-8">
                <p className="text-sm font-semibold">Deliverable {i + 1} of 5 · {st.deliverable}</p>
                <p className="text-xs text-slate2-500">Illustrative · hypothetical client</p>
              </div>
              <div className="p-5 md:p-8"><Body /></div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex justify-between">
          <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="rounded-full border border-silver-300 px-5 py-2.5 text-sm font-semibold disabled:opacity-30">← Previous</button>
          <button onClick={() => setI(Math.min(4, i + 1))} disabled={i === 4} className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-30">Next stage →</button>
        </div>
      </div>
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-silver-300 bg-silver-300 md:grid-cols-3">
        {[['When a person steps in', 'Sensitive topics (fraud, complaints, vulnerable customers), low confidence, or any request for a person. By rule, not by score alone.'],
          ['How the handoff works', 'The customer is told what is happening. The agent receives a summary of the conversation, the topic, and what the assistant already tried.'],
          ['What the customer never has to do', 'Repeat their story, or fight to reach a person. Escalation is a designed feature, not a failure state.']].map(([t, d]) => (
          <div key={t} className="bg-ivory-100 p-6"><p className="serif text-lg">{t}</p><p className="mt-2 text-sm leading-relaxed text-slate2-600">{d}</p></div>))}
      </div>
    </Section>
  )
}
