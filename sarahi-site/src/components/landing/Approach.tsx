import { useState } from 'react'
import { STAGES } from '../../content/portfolio'

export default function Approach() {
  const [i, setI] = useState(0)
  const s = STAGES[i]
  return (
    <div>
      <div role="tablist" aria-label="Implementation stages" className="relative grid grid-cols-5 gap-1">
        <span aria-hidden className="absolute left-[10%] right-[10%] top-[15px] h-px bg-silver-300" />
        <span aria-hidden className="absolute left-[10%] top-[15px] h-px bg-teal transition-all duration-500" style={{ width: `${(i / (STAGES.length - 1)) * 80}%` }} />
        {STAGES.map((st, k) => (
          <button key={st.name} role="tab" id={`ap-${k}`} aria-selected={i === k} aria-controls="ap-panel" tabIndex={i === k ? 0 : -1} onClick={() => setI(k)}
            onKeyDown={e => { if (e.key === 'ArrowRight') setI(Math.min(4, k + 1)); if (e.key === 'ArrowLeft') setI(Math.max(0, k - 1)) }} className="group relative flex flex-col items-center text-center">
            <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold transition ${i === k ? 'scale-110 border-teal bg-teal text-white' : k < i ? 'border-teal bg-white text-teal' : 'border-silver-300 bg-white text-slate2-500 group-hover:border-teal'}`}>{k + 1}</span>
            <span className={`mt-1.5 text-[11px] font-semibold leading-tight md:text-sm ${i === k ? 'text-navy-900' : 'text-slate2-500'}`}>{st.name}</span>
            {st.page && <span className="mt-1 rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-dark">Live demo</span>}
          </button>))}
      </div>
      <div id="ap-panel" role="tabpanel" aria-labelledby={`ap-${i}`} key={s.name} className="mt-6 grid gap-5 rounded-2xl border border-silver-300 bg-white p-5 md:grid-cols-5" style={{ animation: 'fadeUp .35s ease both' }}>
        <div className="md:col-span-3">
          <p className="eyebrow !text-teal-dark">Stage {i + 1} · {s.name}</p>
          <h3 className="serif mt-1 text-2xl md:text-3xl">{s.head}</h3>
          <p className="mt-2 leading-relaxed text-slate2-600">{s.body}</p>
          {s.page && <a href={`#${s.page}`} className="mt-4 inline-block rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-800">Try it: {s.try} →</a>}
        </div>
        <dl className="space-y-4 text-sm md:col-span-2">
          <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-slate2-500">Expected deliverable</dt><dd className="mt-1 font-semibold">{s.out}</dd></div>
          <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-slate2-500">Relevant capabilities</dt><dd className="mt-1 text-slate2-600">{s.cap}</dd></div>
        </dl>
      </div>
    </div>
  )
}
