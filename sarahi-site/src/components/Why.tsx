import { profile } from '../content/profile'
import { Reveal, Section } from './ui'

export default function Why() {
  const links: [string, string][] = [['AI workflow prototype', profile.prototypeUrl]]
  if (profile.linkedin) links.push(['LinkedIn', profile.linkedin])
  if (profile.email) links.push(['Email', `mailto:${profile.email}`])
  return (
    <>
      <Section id="why" eyebrow="Why this experience matters"
        title="Why I am applying">
        <Reveal>
          <div className="grid gap-6 md:grid-cols-5">
            <p className="serif text-xl leading-snug md:col-span-3 md:text-2xl">I would bring a banking background, hands-on experience building with AI, and a habit of making sure people actually use what gets built. I would also have a lot to learn about your product and customers, and I would be glad to.</p>
            <ul className="space-y-3 text-sm text-slate2-600 md:col-span-2">
              <li><span className="block font-semibold text-navy-900">Financial services background</span>I know how regulated teams think about risk, controls and exceptions.</li>
              <li><span className="block font-semibold text-navy-900">AI development experience</span>I build AI-powered workflows with checks and monitoring, so I can talk with engineers as well as business teams.</li>
              <li><span className="block font-semibold text-navy-900">Practical implementation</span>I coordinate delivery and train users, because a solution nobody adopts has not solved anything.</li>
            </ul>
          </div>
          
        </Reveal>
      </Section>
      <footer id="contact" className="bg-navy-900 py-10 text-ivory on-dark">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="serif text-3xl md:text-4xl">Thank you for reading.</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {links.map(([l, h]) => <li key={l}><a href={h} {...(h.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="inline-flex rounded-full border border-silver-400/50 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">{l} ↗</a></li>)}
          </ul>
          {profile.email && <p className="mt-5 text-sm text-silver-300">Email: <span className="select-all font-semibold text-ivory">{profile.email}</span></p>}
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-silver-400">Independent portfolio by {profile.name}. Not affiliated with or endorsed by Glia. No real customer data is used.</p>
        </div>
      </footer>
    </>
  )
}
