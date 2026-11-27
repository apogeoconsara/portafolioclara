import { useEffect, useState } from 'react'

/** Plays /videos/<file> if it exists. Otherwise shows a designed placeholder. */
export function useHasFile(src: string) {
  const [has, setHas] = useState(false)
  useEffect(() => {
    let live = true
    fetch(src, { method: 'HEAD' }).then(r => { if (live) setHas(r.ok && (r.headers.get('content-type') || '').includes('video')) }).catch(() => { if (live) setHas(false) })
    return () => { live = false }
  }, [src])
  return has
}

export default function VideoSlot({ n, src, question }: { n: string; src: string; question: string }) {
  const has = useHasFile(src)
  if (has) {
    return (
      <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[1.75rem] border border-white/20 bg-black shadow-2xl lg:mx-0">
        <video key={src} controls playsInline preload="metadata" poster={src.replace('.mp4', '.jpg')} className="aspect-[9/16] max-h-[78vh] w-full object-contain" aria-label={`Video ${n}: ${question}`}><source src={src} type="video/mp4" /></video>
      </div>
    )
  }
  return (
    <div className="relative mx-auto grid aspect-[9/16] max-h-[78vh] w-full max-w-[320px] place-items-center overflow-hidden rounded-[1.75rem] border border-white/20 bg-gradient-to-br from-navy-800 to-navy-950 p-6 text-center lg:mx-0" role="img" aria-label={`Video ${n} placeholder: ${question}`}>
      <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #239C94 0, transparent 40%), radial-gradient(circle at 80% 80%, #1E3A5F 0, transparent 45%)' }} />
      <div className="relative">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-teal-light/60 text-teal-light"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden><path d="M6 4l10 6-10 6z" fill="currentColor" /></svg></span>
        <p className="mx-auto mt-4 max-w-[16rem] text-lg font-semibold leading-snug text-white">{question}</p>
        <p className="mt-2 text-xs uppercase tracking-widest text-silver-400">Video {n} · to be added</p>
      </div>
    </div>
  )
}
