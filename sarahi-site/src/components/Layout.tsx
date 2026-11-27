import { type ReactNode } from 'react'

/** A simple page shell for the Design demo: a slim top bar with a way back to the portfolio. */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory text-navy-900">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <header className="border-b border-white/10 bg-navy-900 on-dark">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <a href="#home" className="text-sm font-semibold text-teal-light hover:text-white">← Back to portfolio</a>
          <span className="text-sm font-semibold tracking-wide text-white">SARAHÍ CRUZ SALAZAR</span>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-6 on-light">
        {children}
        <p className="mt-8 border-t border-silver-300 pt-3 text-[11px] leading-relaxed text-slate2-500">Independent portfolio. Not affiliated with or endorsed by Glia. This demo uses a fictional bank and made-up data; the assistant follows fixed rules, and Claude only helps where it is safe.</p>
      </main>
    </div>
  )
}
