import { useState, type ReactNode } from 'react'
import { profile } from '../content/profile'
import { type Page } from '../lib/store'

const GROUPS: { label: string; items: [Page, string][] }[] = [
  { label: 'Try it', items: [['start', '1 · Answer 4 questions'], ['plan', '2 · Your rollout plan'], ['assistant', '3 · Test the assistant']] },
  { label: 'Reference', items: [['prototype', 'AI workflow prototype']] }
]

export default function Layout({ page, children }: { page: Page; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const rail = (
    <nav aria-label="Primary" className="flex h-full flex-col">
      <div className="px-5 pb-3 pt-5">
        <p className="serif text-xl text-ivory">Sarahí Cruz Salazar</p>
        <p className="mt-0.5 text-xs text-silver-400">AI consulting scenarios</p>
      </div>
      <div className="mx-4 rounded-lg border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-silver-300">Independent portfolio. Not affiliated with or endorsed by Glia. The scenario uses a fictional bank and made-up data.</div>
      <div className="mt-3 flex-1 overflow-y-auto px-3 pb-4">
        {GROUPS.map(g => (
          <div key={g.label} className="mt-3">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate2-300">{g.label}</p>
            <ul>{g.items.map(([id, label]) => (
              <li key={id}><a href={`#${id}`} onClick={() => setOpen(false)} aria-current={page === id ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition ${page === id ? 'bg-white/10 font-semibold text-ivory' : 'text-silver-300 hover:bg-white/5 hover:text-ivory'}`}>
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${page === id ? 'bg-gold' : 'bg-slate2-500'}`} />{label}</a></li>))}
            </ul>
          </div>))}
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-xs text-silver-400">
        {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="block hover:text-ivory">LinkedIn ↗</a>}
        {profile.email && <p className="mt-1 select-all">{profile.email}</p>}
      </div>
    </nav>
  )
  return (
    <div className="on-dark">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-ivory focus:px-3 focus:py-2 focus:text-navy-900">Skip to content</a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 bg-navy-900 lg:block">{rail}</aside>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-navy-900 px-4 py-3 lg:hidden">
        <span className="serif text-lg text-ivory">Sarahí Cruz Salazar</span>
        <button className="rounded border border-white/30 px-3 py-1.5 text-sm text-ivory" aria-expanded={open} aria-controls="drawer" onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Menu'}</button>
      </header>
      {open && <div id="drawer" className="fixed inset-x-0 bottom-0 top-[52px] z-20 overflow-y-auto bg-navy-900 lg:hidden">{rail}</div>}
      <main id="main" className="min-h-screen bg-ivory px-4 py-5 text-navy-900 md:px-8 md:py-6 lg:ml-60">
        <div className="mx-auto max-w-5xl on-light">{children}</div>
      </main>
    </div>
  )
}
