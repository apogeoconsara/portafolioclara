import { profile } from '../content/profile'
import IntroVideo, { SETUP, useIntroVideo } from '../components/IntroVideo'
import { PageHeader } from '../components/ui'

const STAGES = [
  ['Citibanamex', 'Three rotations in treasury, FX and rates, and structured products. Resolved problems across trading, sales, operations and risk, and built two control tools that saved 2+ hours a day.'],
  ['Operations and Automation', 'Designed and launched a point-of-sale system, led technology rollouts with vendors, and trained staff so the change was adopted.'],
  ['APOGEO', 'Builds AI-powered workflows connected to business systems, with human review and monitoring. Coordinates delivery and testing.']
]

export default function About() {
  const has = useIntroVideo()
  return (
    <>
      <PageHeader title="Hi, I’m Sarahí." intro="I am applying for the Senior Associate, AI Consultant role. From financial markets to AI-powered workflows, my experience brings together business understanding, hands-on technology, and a practical approach to implementation." />
      {(has || SETUP) && <div className="mb-8 rounded-2xl bg-navy-900 p-4 on-dark"><IntroVideo has={has} /></div>}
      <div className="flex flex-wrap gap-3">
        <a href="#profile" className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-ivory transition hover:bg-navy-800">Explore My Consulting Approach →</a>
        <a href="#prototype" className="rounded-full border border-navy-800 px-6 py-3 text-sm font-semibold transition hover:bg-navy-900/5">View Selected Work</a>
      </div>
      <h2 className="serif mt-12 text-2xl">Where I am coming from</h2>
      <ol className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-silver-300 bg-silver-300 md:grid-cols-3">
        {STAGES.map(([n, d], i) => (
          <li key={n} className="bg-ivory-100 p-5"><span className="text-xs font-semibold tracking-widest text-slate2-400">STAGE {i + 1}</span>
            <h3 className="serif mt-1 text-xl">{n}</h3><p className="mt-2 text-sm leading-relaxed text-slate2-600">{d}</p></li>))}
      </ol>
      <p className="mt-3 text-sm text-slate2-600">Banking sets what must not break, operations shows what people will actually use, and building shows how to make AI useful inside those limits. Also: Agentic AI certification · Bloomberg Market Concepts · Spanish, English and French.</p>
      <div className="mt-8 rounded-2xl border border-silver-300 bg-ivory-100 p-5 text-sm leading-relaxed text-slate2-600">
        <p><span className="font-semibold text-navy-900">How this site is organised.</span> <a className="underline" href="#fit">Role fit</a> maps the job description to my evidence. The <a className="underline" href="#profile">Rollout Planner</a> is a working tool: describe a bank and it produces a prioritised, risk-aware rollout plan. <a className="underline" href="#ask">Ask about me</a> answers questions from a fixed set of verified facts. Everything is labelled as professional experience, personal prototype, or hypothetical scenario.</p>
        {(profile.linkedin || profile.email) && <p className="mt-3">{profile.linkedin && <a className="font-semibold text-navy-900 underline" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}{profile.linkedin && profile.email && ' · '}{profile.email && <span className="select-all">{profile.email}</span>}</p>}
      </div>
    </>
  )
}
