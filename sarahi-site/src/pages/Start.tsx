import { useState } from 'react'
import IntroVideo, { SETUP, useIntroVideo } from '../components/IntroVideo'
import type { Channel, Handoff, LowConf } from '../components/FlowDiagram'
import { PageHeader, Slider, chip } from '../components/ui'
import { profile } from '../content/profile'
import { SIZES, type Appetite, type Readiness, type Size } from '../lib/plan'
import { usePlan } from '../lib/store'

const CH: [Channel, string][] = [['chat', 'Web or app chat'], ['messaging', 'Messaging apps'], ['voice', 'Phone']]
const AP: [Appetite, string, string][] = [['cautious', 'Play it safe', 'Start with only the simplest topics.'], ['balanced', 'Balanced', 'Start with simple and everyday topics.'], ['ambitious', 'Move fast', 'Start with more topics; needs closer monitoring.']]
const RD: [Readiness, string][] = [['high', 'Yes, up to date'], ['medium', 'Partly'], ['low', 'No, scattered or outdated']]
const HO: [Handoff, string][] = [['live', 'A person joins now'], ['callback', 'A person calls back'], ['branch', 'Book a branch visit']]
const LC: [LowConf, string][] = [['person', 'Hand to a person'], ['clarify', 'Ask once, then a person'], ['choices', 'Offer topic buttons']]

function Q({ n, q, hint, children }: { n: number; q: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-silver-300 bg-white p-4">
      <legend className="sr-only">{q}</legend>
      <p className="flex items-baseline gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-semibold text-ivory">{n}</span><span className="font-semibold">{q}</span></p>
      {hint && <p className="ml-8 text-xs text-slate2-500">{hint}</p>}
      <div className="mt-3">{children}</div>
    </fieldset>
  )
}

export default function Start() {
  const { input: i, set } = usePlan()
  const has = useIntroVideo()
  const [more, setMore] = useState(false)
  const pick = (s: Size) => set({ size: s, volume: SIZES[s].volume, agents: SIZES[s].agents })
  const toggle = (c: Channel) => { const next = i.channels.includes(c) ? i.channels.filter(x => x !== c) : [...i.channels, c]; if (next.length) set({ channels: next }) }
  return (
    <>
      <PageHeader tag="hypothetical" title="What should a bank automate first, and what must stay with people?"
        intro="Answer four quick questions about a fictional bank. You get a one-page rollout plan, then you can test the assistant that plan describes. About two minutes." />
      {(has || SETUP) && <div className="mb-4 rounded-2xl bg-navy-900 p-4 on-dark"><IntroVideo has={has} /></div>}
      <div className="space-y-3">
        <Q n={1} q="How big is the bank?">
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(SIZES) as Size[]).map(s => (
              <button key={s} aria-pressed={i.size === s} onClick={() => pick(s)} className={`rounded-xl border p-3 text-left transition ${i.size === s ? 'border-navy-900 bg-navy-900 text-ivory' : 'border-silver-300 bg-ivory-100 hover:border-navy-800'}`}>
                <span className="block font-semibold">{SIZES[s].label}</span><span className={`text-xs ${i.size === s ? 'text-silver-300' : 'text-slate2-500'}`}>{SIZES[s].blurb}</span></button>))}
          </div>
        </Q>
        <Q n={2} q="Where do customers contact the bank?" hint="Choose all that apply. Phone and messaging add extra checks before launch.">
          <div className="flex flex-wrap gap-2">{CH.map(([c, l]) => <button key={c} aria-pressed={i.channels.includes(c)} onClick={() => toggle(c)} className={`${chip(i.channels.includes(c))} !py-1.5`}>{l}</button>)}</div>
        </Q>
        <Q n={3} q="How cautious should the rollout be?" hint="This decides which topics go first.">
          <div className="grid gap-2 sm:grid-cols-3">{AP.map(([k, l, d]) => (
            <button key={k} aria-pressed={i.appetite === k} onClick={() => set({ appetite: k })} className={`rounded-xl border p-3 text-left transition ${i.appetite === k ? 'border-navy-900 bg-navy-900 text-ivory' : 'border-silver-300 bg-ivory-100 hover:border-navy-800'}`}>
              <span className="block font-semibold">{l}</span><span className={`text-xs ${i.appetite === k ? 'text-silver-300' : 'text-slate2-500'}`}>{d}</span></button>))}</div>
        </Q>
        <Q n={4} q="Are the answers to common customer questions already written and up to date?" hint="The assistant can only answer from approved content. Without it, more topics wait.">
          <div className="flex flex-wrap gap-2">{RD.map(([k, l]) => <button key={k} aria-pressed={i.readiness === k} onClick={() => set({ readiness: k })} className={`${chip(i.readiness === k)} !py-1.5`}>{l}</button>)}</div>
        </Q>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <a href="#plan" className="rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-ivory transition hover:bg-navy-800">Show my rollout plan →</a>
        <button onClick={() => setMore(!more)} aria-expanded={more} className="text-sm text-slate2-600 underline underline-offset-4">{more ? 'Hide' : 'Fine-tune'} (optional)</button>
      </div>
      {more && (
        <div className="mt-3 grid gap-4 rounded-2xl border border-silver-300 bg-white p-4 md:grid-cols-2">
          <fieldset><legend className="text-sm font-medium">When a person is needed</legend><p className="text-xs text-slate2-500">How the customer reaches a human.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{HO.map(([k, l]) => <button key={k} aria-pressed={i.handoff === k} onClick={() => set({ handoff: k })} className={`${chip(i.handoff === k)} !px-3 !py-1.5 text-xs`}>{l}</button>)}</div></fieldset>
          <fieldset><legend className="text-sm font-medium">When the assistant is unsure</legend><p className="text-xs text-slate2-500">What it does with an unclear message.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{LC.map(([k, l]) => <button key={k} aria-pressed={i.lowConf === k} onClick={() => set({ lowConf: k })} className={`${chip(i.lowConf === k)} !px-3 !py-1.5 text-xs`}>{l}</button>)}</div></fieldset>
          <Slider id="adopt" label="Customers who choose the assistant" value={i.adoption} min={10} max={90} unit="%" onChange={v => set({ adoption: v })} hint="Higher means more time saved, if customers like it." />
          <Slider id="aht" label="Minutes a person spends per inquiry" value={i.handleMin} min={2} max={20} onChange={v => set({ handleMin: v })} hint="Longer inquiries mean more time saved per automated one." />
        </div>)}
      <p className="mt-5 rounded-xl border border-silver-300 bg-ivory-100 p-3 text-xs leading-relaxed text-slate2-600"><b className="text-navy-900">What is real.</b> The bank and its numbers are made up: this is a hypothetical scenario, and the figures are estimates, not results. It draws on banking work at Citibanamex and on rollouts, staff training and AI workflows in operations and at APOGEO.
        {(profile.linkedin || profile.email) && <> Contact: {profile.linkedin && <a className="font-semibold text-navy-900 underline" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}{profile.linkedin && profile.email && ' · '}{profile.email && <span className="select-all">{profile.email}</span>}</>}</p>
    </>
  )
}
