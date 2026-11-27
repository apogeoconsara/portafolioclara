import { useState } from 'react'

const C = [
  { id: 'fin', label: 'Finance', cx: 150, cy: 125, fill: '#1E3A5F', t: 'Financial services', d: 'Treasury, FX and rates, and structured products at Citibanamex. Understands why controls exist and who owns an exception.' },
  { id: 'ai', label: 'AI', cx: 250, cy: 125, fill: '#239C94', t: 'Applied AI', d: 'Builds AI-powered workflows with APIs, validation and human review, so the technology behaves inside business rules.' },
  { id: 'con', label: 'Consulting', cx: 200, cy: 205, fill: '#7388A8', t: 'Consulting and enablement', d: 'Coordinates delivery, trains users and plans adoption, because a solution nobody uses has not solved anything.' }
]

export default function Venn() {
  const [sel, setSel] = useState<string | null>(null)
  const cur = C.find(c => c.id === sel)
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      <svg viewBox="0 0 400 320" className="mx-auto w-full max-w-sm" role="group" aria-label="Venn diagram: finance, AI and consulting overlap in AI consulting">
        {C.map(c => (
          <g key={c.id} role="button" tabIndex={0} aria-pressed={sel === c.id} aria-label={c.t} onClick={() => setSel(c.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(c.id) } }} className="cursor-pointer outline-none">
            <circle cx={c.cx} cy={c.cy} r={88} fill={c.fill} fillOpacity={sel === c.id ? 0.75 : 0.5} stroke={c.fill} strokeWidth={sel === c.id ? 3 : 1.5} style={{ transition: 'fill-opacity .3s' }} />
          </g>))}
        <text x="118" y="112" fontSize="14" fontWeight="600" fill="#0C1830" pointerEvents="none">Finance</text>
        <text x="282" y="112" fontSize="14" fontWeight="600" fill="#0C1830" textAnchor="middle" pointerEvents="none">AI</text>
        <text x="200" y="262" fontSize="14" fontWeight="600" fill="#0C1830" textAnchor="middle" pointerEvents="none">Consulting</text>
        <text x="200" y="160" fontSize="12" fontWeight="700" fill="#0C1830" textAnchor="middle" pointerEvents="none">AI</text>
        <text x="200" y="175" fontSize="12" fontWeight="700" fill="#0C1830" textAnchor="middle" pointerEvents="none">consulting</text>
      </svg>
      <div className="min-h-[7rem] rounded-xl border border-white/15 bg-white/5 p-4 text-sm leading-relaxed text-silver-300" aria-live="polite">
        {cur ? <><p className="font-semibold text-white">{cur.t}</p><p className="mt-1">{cur.d}</p></> : <><p className="font-semibold text-white">Where the three meet</p><p className="mt-1">I speak the bank’s language, I build with the technology, and I help people use it. Tap a circle to see what each part brings.</p></>}
      </div>
    </div>
  )
}
