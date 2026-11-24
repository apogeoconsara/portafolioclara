import { profile } from '../content/profile'
import { PageHeader } from '../components/ui'

export default function Prototype() {
  return (
    <>
      <PageHeader tag="prototype" title="AI workflow prototype" intro="A personal project exploring how AI can handle one step of a process while rules, checks and people stay in control." />
      <div className="grid gap-6 md:grid-cols-5">
        <div className="space-y-4 leading-relaxed text-slate2-600 md:col-span-3">
          <p><span className="font-semibold text-navy-900">The problem:</span> many teams add AI to a process but forget the rest: who handles the exceptions, who checks the answer, who approves the risky cases.</p>
          <p><span className="font-semibold text-navy-900">What I built:</span> a workflow that processes 50,000 made-up business records. Rules decide the routine cases, AI helps where it is useful, exceptions go to a queue, and a person approves what matters. Everything is checked, monitored and logged.</p>
          <a href={profile.prototypeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-ivory hover:bg-navy-800">Open the prototype <span aria-hidden>↗</span><span className="sr-only">(opens in a new tab)</span></a>
        </div>
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-5 text-sm leading-relaxed text-[#5d4720] md:col-span-2"><p className="font-semibold">Status: prototype</p><p className="mt-1">Made-up data only. Not used in production, no customers, and no claims about results.</p></div>
      </div>
    </>
  )
}
