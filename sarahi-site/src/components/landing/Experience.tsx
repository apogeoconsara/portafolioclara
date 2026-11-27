import { useState } from 'react'
import { CASES } from '../../content/portfolio'
import { EvidenceTag } from '../ui'

export default function Experience() {
  const [id, setId] = useState('apogeo')
  const c = CASES.find(x => x.id === id)!
  return (
    <div>
      <div role="tablist" aria-label="Experience" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {CASES.map(x => (
          <button key={x.id} role="tab" aria-selected={id === x.id} aria-controls="exp-panel" onClick={() => setId(x.id)}
            className={`rounded-xl border p-3 text-left transition ${id === x.id ? 'border-teal bg-navy-900 text-white' : 'border-silver-300 bg-white hover:border-teal'}`}>
            <span className="block text-sm font-bold tracking-widest">{x.name}</span><span className={`mt-0.5 block text-xs ${id === x.id ? 'text-silver-300' : 'text-slate2-500'}`}>{x.role}</span></button>))}
      </div>
      <div id="exp-panel" role="tabpanel" key={c.id} className="mt-3 rounded-2xl border border-silver-300 bg-white p-5" style={{ animation: 'fadeUp .35s ease both' }}>
        <div className="flex flex-wrap items-center gap-3"><h3 className="serif text-xl">{c.name} <span className="font-normal text-slate2-500">· {c.role}</span></h3><EvidenceTag kind={c.basis} /></div>
        <p className="mt-2 max-w-3xl leading-relaxed text-slate2-600">{c.blurb}</p>
        {c.note && <p className="mt-2 rounded-lg bg-teal/10 px-3 py-2 text-xs text-teal-dark">{c.note}</p>}
        <ol className="mt-4 flex flex-wrap items-stretch gap-1.5 text-xs" aria-label="Functional flow">
          {c.flow.map((n, k) => (
            <li key={n} className="flex items-center gap-1.5"><span className={`rounded-lg border px-3 py-2 ${c.id === 'banamex' && k === c.flow.length - 1 ? 'border-teal bg-teal/10 font-semibold text-teal-dark' : 'border-silver-300 bg-ivory-100'}`}>{n}</span>{k < c.flow.length - 1 && <span aria-hidden className="text-teal">→</span>}</li>))}
        </ol>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate2-500">Evidence</p><ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">{c.evidence.map(e => <li key={e}>{e}</li>)}</ul></div>
          {c.tools.length > 0 && <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate2-500">Tools</p><ul className="mt-1.5 flex flex-wrap gap-1.5">{c.tools.map(t => <li key={t} className="rounded-full border border-silver-300 bg-ivory-100 px-3 py-1 text-xs">{t}</li>)}</ul></div>}
        </div>
        {c.link && <a href={c.link.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white hover:bg-navy-800">{c.link.label} ↗<span className="sr-only"> (opens in a new tab)</span></a>}
      </div>
    </div>
  )
}
