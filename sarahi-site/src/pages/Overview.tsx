import { profile } from '../content/profile'
import IntroVideo, { SETUP, useIntroVideo } from '../components/IntroVideo'
import { PageHeader } from '../components/ui'

const STAGES: [string, string, string, string][] = [
  ['Discover', 'profile', 'Bank profile and use cases', 'Understand the bank, then rank which customer topics to automate first and which must stay with people.'],
  ['Design', 'flow', 'Flow, escalation and assistant', 'Map the process, set the escalation rules, and test a banking assistant against them.'],
  ['Implement', 'readiness', 'Launch readiness', 'A go / no-go checklist and rollout waves that adapt to channels and risk appetite.'],
  ['Adopt', 'adoption', 'Training and adoption', 'What each role needs, how long it takes, and the signal that shows it is working.'],
  ['Optimize', 'impact', 'Impact and monitoring', 'Simulated results with every formula visible, and how to act on what the data says.']
]
const SKILLS: [string, string, string, string][] = [
  ['Client discovery and pre-sales consulting', 'usecases', 'Discovery', 'Illustrated'],
  ['Documenting processes and diagramming flows', 'flow', 'Process flow', 'Illustrated'],
  ['Conversational AI and virtual assistant best practices', 'assistant', 'Assistant test', 'Illustrated'],
  ['Responsible AI and human escalation', 'flow', 'Escalation rules', 'Illustrated · prototype'],
  ['Implementing on time, coordinating teams', 'readiness', 'Launch readiness', 'Illustrated · experience'],
  ['Training client teams and driving adoption', 'adoption', 'Training plan', 'Illustrated · experience'],
  ['Analyzing AI performance, recommending improvements', 'impact', 'Impact and signals', 'Illustrated'],
  ['Explaining AI to non-technical stakeholders', 'brief', 'Plan brief', 'Illustrated'],
  ['Hands-on AI and API integration', 'prototype', 'Prototype', 'Prototype · experience']
]

export default function Overview() {
  const has = useIntroVideo()
  return (
    <>
      <PageHeader tag="hypothetical" title="AI for a regional bank’s customer service: a worked scenario"
        intro="A fictional bank wants to improve customer service with AI. It has long waits, thousands of monthly inquiries, and a compliance team that wants control. This workbench solves it end to end. Change the inputs and every page recalculates." />
      {(has || SETUP) && <div className="mb-6 rounded-2xl bg-navy-900 p-4 on-dark"><IntroVideo has={has} /></div>}
      <a href="#profile" className="inline-block rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-ivory transition hover:bg-navy-800">Explore My Consulting Approach →</a>
      <a href="#prototype" className="ml-3 inline-block rounded-full border border-navy-800 px-6 py-3 text-sm font-semibold transition hover:bg-navy-900/5">View Selected Work</a>

      <h2 className="serif mt-10 text-2xl">The approach, in five stages</h2>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map(([s, id, t, d], i) => (
          <li key={s}><a href={`#${id}`} className="group flex h-full flex-col rounded-2xl border border-silver-300 bg-ivory-100 p-4 transition hover:-translate-y-0.5 hover:border-navy-800 hover:bg-white">
            <span className="text-xs font-semibold tracking-widest text-slate2-400">{i + 1}</span>
            <span className="serif text-xl">{s}</span><span className="mt-1 text-xs font-semibold text-slate2-500">{t}</span>
            <span className="mt-2 flex-1 text-sm leading-relaxed text-slate2-600">{d}</span></a></li>))}
      </ol>

      <h2 className="serif mt-10 text-2xl">Skills demonstrated, and where</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-silver-300 bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <caption className="sr-only">Skills for the AI consultant role and where each is demonstrated</caption>
          <thead><tr className="border-b border-silver-300 text-xs uppercase tracking-wider text-slate2-500"><th className="p-3">Skill</th><th className="p-3">Where</th><th className="p-3">Basis</th></tr></thead>
          <tbody className="divide-y divide-silver-200">
            {SKILLS.map(([s, id, w, b]) => (
              <tr key={s}><td className="p-3 font-medium">{s}</td><td className="p-3"><a className="font-semibold text-slate2-600 underline underline-offset-4 hover:text-navy-900" href={`#${id}`}>{w} →</a></td><td className="p-3 text-xs text-slate2-500">{b}</td></tr>))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate2-500">Basis: <b>Illustrated</b> = a hypothetical scenario on this site. <b>Experience</b> = applied in real work (banking at Citibanamex; rollouts, staff training and AI workflows in operations and at APOGEO). <b>Prototype</b> = a personal prototype on made-up data.</p>
      {(profile.linkedin || profile.email) && <p className="mt-6 text-sm text-slate2-600">Contact: {profile.linkedin && <a className="font-semibold text-navy-900 underline" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}{profile.linkedin && profile.email && ' · '}{profile.email && <span className="select-all">{profile.email}</span>}</p>}
    </>
  )
}
