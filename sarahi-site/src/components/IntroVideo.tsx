import { useEffect, useState } from 'react'
import { INTRO_SCRIPT, INTRO_TIPS } from '../content/introScript'

export const SETUP = import.meta.env.DEV || (typeof location !== 'undefined' && new URLSearchParams(location.search).has('setup'))

/** True only when /intro.mp4 really exists (an SPA fallback returns HTML, which we reject). */
export function useIntroVideo() {
  const [has, setHas] = useState(false)
  useEffect(() => {
    let live = true
    fetch('/intro.mp4', { method: 'HEAD' }).then(r => { if (live) setHas(r.ok && (r.headers.get('content-type') || '').includes('video')) }).catch(() => {})
    return () => { live = false }
  }, [])
  return has
}

export default function IntroVideo({ has }: { has: boolean }) {
  if (has) {
    return (
      <figure>
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-navy-950 shadow-2xl">
          <video controls playsInline preload="metadata" poster="/intro-poster.jpg" className="aspect-video w-full" aria-label="Introduction video from Sarahí Cruz Salazar">
            <source src="/intro.mp4" type="video/mp4" />
          </video>
        </div>
        <figcaption className="mt-3 text-sm text-silver-300">Meet Sarahí · 60-second introduction</figcaption>
        <details className="mt-1 text-xs text-silver-400">
          <summary className="cursor-pointer">Read the transcript</summary>
          <p className="mt-2 leading-relaxed">{INTRO_SCRIPT.map(s => s.line).join(' ')}</p>
        </details>
      </figure>
    )
  }
  if (!SETUP) return null
  return (
    <aside className="rounded-2xl border border-dashed border-silver-400/60 bg-white/5 p-5 text-sm" aria-label="Intro video setup (visible only in setup mode)">
      <p className="eyebrow !text-gold">Setup mode · not shown to visitors</p>
      <p className="serif mt-1 text-xl text-ivory">Your 60-second intro: script</p>
      <ol className="mt-3 space-y-2 text-silver-300">{INTRO_SCRIPT.map(s => <li key={s.t} className="flex gap-3"><span className="w-9 shrink-0 tabular-nums text-silver-400">{s.t}</span><span>{s.line}</span></li>)}</ol>
      <ul className="mt-4 list-disc space-y-1 pl-4 text-xs text-silver-400">{INTRO_TIPS.map(t => <li key={t}>{t}</li>)}</ul>
    </aside>
  )
}
