import { useEffect, useState } from 'react'

const LINKS = [
  ['journey', 'Journey'], ['prototype', 'Prototype'], ['case', 'Consulting case'],
  ['enablement', 'Enablement'], ['impact', 'Simulator'], ['why', 'Why me']
] as const

export default function Nav() {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const ids = LINKS.map(l => l[0])
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      let cur = ''
      for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 140) cur = id }
      setActive(cur)
    }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition ${scrolled || open ? 'bg-navy-900/95 backdrop-blur border-b border-white/10' : ''} on-dark`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-ivory focus:px-3 focus:py-2 focus:text-navy-900">Skip to content</a>
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="serif text-lg text-ivory">Sarahí Cruz Salazar</a>
        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map(([id, label]) => (
            <li key={id}><a href={`#${id}`} aria-current={active === id ? 'true' : undefined}
              className={`text-sm transition ${active === id ? 'text-ivory border-b border-ivory pb-1' : 'text-silver-400 hover:text-ivory'}`}>{label}</a></li>
          ))}
        </ul>
        <button className="md:hidden rounded border border-white/30 px-3 py-1.5 text-sm text-ivory" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(o => !o)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </nav>
      {open && (
        <ul id="mnav" className="md:hidden border-t border-white/10 px-5 pb-4">
          {LINKS.map(([id, label]) => <li key={id}><a onClick={() => setOpen(false)} href={`#${id}`} className="block py-3 text-silver-300">{label}</a></li>)}
        </ul>
      )}
    </header>
  )
}
