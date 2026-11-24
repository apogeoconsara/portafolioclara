import { useEffect, useState } from 'react'

const LINKS = [
  ['fit', 'Role fit'], ['case', 'Case'], ['impact', 'Simulator'],
  ['journey', 'Background'], ['prototype', 'Prototype'], ['why', 'Contact']
] as const

export default function Nav() {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
      let cur = ''
      for (const [id] of LINKS) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 160) cur = id }
      setActive(cur)
    }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const label = LINKS.find(l => l[0] === active)?.[1]
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition ${scrolled || open ? 'bg-navy-900/95 backdrop-blur border-b border-white/10' : ''} on-dark`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-ivory focus:px-3 focus:py-2 focus:text-navy-900">Skip to content</a>
        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <a href="#top" className="serif text-lg text-ivory">Sarahí Cruz Salazar</a>
          <ul className="hidden items-center gap-5 md:flex">
            {LINKS.map(([id, l]) => (
              <li key={id}><a href={`#${id}`} aria-current={active === id ? 'true' : undefined}
                className={`border-b pb-1 text-sm transition ${active === id ? 'border-ivory text-ivory' : 'border-transparent text-silver-400 hover:text-ivory'}`}>{l}</a></li>))}
          </ul>
          <div className="flex items-center gap-3 md:hidden">
            {label && <span className="text-xs text-silver-400" aria-hidden>{label}</span>}
            <button className="rounded border border-white/30 px-3 py-1.5 text-sm text-ivory" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Menu'}</button>
          </div>
        </nav>
        {open && (
          <ul id="mnav" className="border-t border-white/10 px-5 pb-4 md:hidden">
            {LINKS.map(([id, l]) => <li key={id}><a onClick={() => setOpen(false)} href={`#${id}`} aria-current={active === id ? 'true' : undefined} className={`block py-3 ${active === id ? 'text-ivory' : 'text-silver-300'}`}>{l}</a></li>)}
          </ul>)}
        <div aria-hidden className="h-0.5 origin-left bg-silver-300/80" style={{ transform: `scaleX(${progress})` }} />
      </header>
      <a href="#top" aria-label="Back to top" className={`fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-navy-900 text-ivory shadow-lg transition ${scrolled && progress > 0.08 ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>↑</a>
    </>
  )
}
