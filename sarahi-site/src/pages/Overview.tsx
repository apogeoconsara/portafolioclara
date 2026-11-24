import { profile } from '../content/profile'
import IntroVideo, { SETUP, useIntroVideo } from '../components/IntroVideo'
import { PageHeader } from '../components/ui'

const STEPS: [string, string, string, string, string][] = [
  ['1', 'Describe the bank', 'Set volume, staff, channels and risk appetite. You get a ranked list of customer topics: pilot first, later, or always a person.', 'discover', 'Open Discover'],
  ['2', 'Test the assistant', 'Chat with a banking assistant built on that plan. Sensitive topics go to a person by rule; Claude only helps where it is safe.', 'design', 'Open Design'],
  ['3', 'Read the impact', 'See simulated results with every formula, how to act on the signals, and a summary you can copy.', 'optimize', 'Open Optimize']
]
const ALSO: [string, string, string][] = [['implement', '3 · Implement', 'Launch checklist and rollout waves'], ['adopt', '4 · Adopt', 'Training plan by role']]
const SKILLS = ['Discovery and prioritisation', 'Process and flow design', 'Conversation design and guardrails', 'Implementation planning', 'Training and adoption', 'Measuring impact']

export default function Overview() {
  const has = useIntroVideo()
  return (
    <>
      <PageHeader tag="hypothetical" title="Plan an AI customer-service rollout for a bank" intro="A working tool, not a slide deck. Describe a fictional bank, get a prioritised plan, test a guarded assistant, and see the impact. Everything uses made-up data." />
      {(has || SETUP) && <div className="mb-5 rounded-2xl bg-navy-900 p-4 on-dark"><IntroVideo has={has} /></div>}
      <a href="#questions" className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-navy-900 bg-white p-4 transition hover:bg-ivory-100">
        <span><span className="serif block text-xl">Start with a question about applied AI</span><span className="text-sm text-slate2-600">Will it make things up? Can customers trick it? What results can we expect? The questions a bank’s team asks, answered in plain language.</span></span>
        <span className="shrink-0 rounded-full bg-navy-900 px-4 py-1.5 text-sm font-semibold text-ivory">Open →</span></a>
      <h2 className="eyebrow">Try it in three steps</h2>
      <ol className="mt-2 grid gap-3 md:grid-cols-3">
        {STEPS.map(([n, t, d, id, cta]) => (
          <li key={n} className="flex flex-col rounded-2xl border border-silver-300 bg-white p-4">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-navy-900 text-sm font-semibold text-ivory">{n}</span>
            <h3 className="serif mt-2 text-xl">{t}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-slate2-600">{d}</p>
            <a href={`#${id}`} className="mt-3 w-fit rounded-full bg-navy-900 px-4 py-1.5 text-sm font-semibold text-ivory transition hover:bg-navy-800">{cta} →</a>
          </li>))}
      </ol>
      <p className="mt-3 text-sm text-slate2-600">Also in the workbench: {ALSO.map(([id, l, d], i) => <span key={id}>{i > 0 && ' · '}<a className="font-semibold text-navy-900 underline underline-offset-4" href={`#${id}`}>{l}</a> ({d})</span>)}. The <a className="font-semibold text-navy-900 underline underline-offset-4" href="#prototype">reference prototype</a> is a separate personal project.</p>

      <h2 className="eyebrow mt-6">Skills it puts to work</h2>
      <ul className="mt-2 flex flex-wrap gap-2">{SKILLS.map(s => <li key={s} className="rounded-full border border-silver-300 bg-ivory-100 px-3 py-1 text-xs text-slate2-600">{s}</li>)}</ul>
      <p className="mt-4 rounded-xl border border-silver-300 bg-ivory-100 p-3 text-xs leading-relaxed text-slate2-600"><b className="text-navy-900">What is real.</b> The workbench and its bank are a hypothetical scenario: its numbers are assumptions, not results. The reference prototype is a personal project on made-up data. The approach draws on banking work at Citibanamex and on rollouts, staff training and AI workflows in operations and at APOGEO.</p>
      {(profile.linkedin || profile.email) && <p className="mt-3 text-xs text-slate2-600">Contact: {profile.linkedin && <a className="font-semibold text-navy-900 underline" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}{profile.linkedin && profile.email && ' · '}{profile.email && <span className="select-all">{profile.email}</span>}</p>}
    </>
  )
}
