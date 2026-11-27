import { useEffect, useRef, useState } from 'react'

/** Is there a video file at this path? (An SPA fallback returns HTML, which we reject.) */
export function useHasFile(src: string) {
  const [has, setHas] = useState(false)
  useEffect(() => {
    let live = true
    fetch(src, { method: 'HEAD' }).then(r => { if (live) setHas(r.ok && (r.headers.get('content-type') || '').includes('video')) }).catch(() => { if (live) setHas(false) })
    return () => { live = false }
  }, [src])
  return has
}

/** Frame width follows the viewport height, so the 9:16 shape is never squeezed and the video always fills it. */
const FRAME = 'relative mx-auto aspect-[9/16] w-[min(100%,320px,43.9vh)] overflow-hidden rounded-[1.75rem] border border-white/20 bg-navy-950 lg:mx-0'

function Player({ src, n, question }: { src: string; n: string; question: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [needsSound, setNeedsSound] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const start = () => {
      v.muted = false
      v.play().then(() => setNeedsSound(false)).catch(() => {
        // The browser blocks autoplay with sound until the visitor interacts: start muted and offer sound.
        v.muted = true
        v.play().then(() => setNeedsSound(true)).catch(() => {})
      })
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else v.pause() }, { threshold: 0.6 })
    io.observe(v)
    return () => io.disconnect()
  }, [src])

  return (
    <div className={`${FRAME} bg-black shadow-2xl`}>
      <video ref={ref} controls playsInline preload="auto" poster={src.replace('.mp4', '.jpg')} className="h-full w-full object-cover" aria-label={`Video ${n}: ${question}`}
        onVolumeChange={e => { if (!e.currentTarget.muted) setNeedsSound(false) }}>
        <source src={src} type="video/mp4" />
      </video>
      {needsSound && (
        <button onClick={() => { const v = ref.current; if (v) { v.muted = false; setNeedsSound(false) } }}
          className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-navy-900/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-teal">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M3 10v4h4l5 4V6L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" /></svg>Tap for sound
        </button>)}
    </div>
  )
}

export default function VideoSlot({ n, src, question }: { n: string; src: string; question: string }) {
  const has = useHasFile(src)
  if (has) return <Player key={src} src={src} n={n} question={question} />
  return (
    <div className={`${FRAME} grid place-items-center bg-gradient-to-br from-navy-800 to-navy-950 p-6 text-center`} role="img" aria-label={`Video ${n} placeholder: ${question}`}>
      <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #239C94 0, transparent 40%), radial-gradient(circle at 80% 80%, #1E3A5F 0, transparent 45%)' }} />
      <div className="relative">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-teal-light/60 text-teal-light"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden><path d="M6 4l10 6-10 6z" fill="currentColor" /></svg></span>
        <p className="mx-auto mt-4 max-w-[16rem] text-lg font-semibold leading-snug text-white">{question}</p>
        <p className="mt-2 text-xs uppercase tracking-widest text-silver-400">Video {n} · to be added</p>
      </div>
    </div>
  )
}
