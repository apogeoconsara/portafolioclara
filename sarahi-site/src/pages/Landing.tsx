import { useState } from 'react'
import ApogeoMap from '../components/landing/ApogeoMap'
import Approach from '../components/landing/Approach'
import Experience from '../components/landing/Experience'
import InteractionDemo from '../components/landing/InteractionDemo'
import Venn from '../components/landing/Venn'
import VideoSlot from '../components/landing/VideoSlot'
import { VIDEOS } from '../content/portfolio'
import { profile } from '../content/profile'

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
const NAV: [string, string][] = [['videos', 'Video interview'], ['approach', 'Approach'], ['experience', 'Experience']]

function Head({ n, label, title, dark = false }: { n: string; label: string; title: string; dark?: boolean }) {
  return (<header className="mb-6"><p className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? 'text-teal-light' : 'text-teal-dark'}`}>{n} / {label}</p><h2 className={`mt-2 text-3xl font-semibold tracking-tight md:text-4xl ${dark ? 'text-white' : 'text-navy-900'}`}>{title}</h2></header>)
}

export default function Landing() {
  const [v, setV] = useState(0)
  const vid = VIDEOS[v]
  return (
    <div className="bg-ivory text-navy-900">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-navy-900/85 backdrop-blur on-dark">
        <nav aria-label="Primary" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-semibold tracking-wide text-white">SARAHÍ CRUZ SALAZAR</button>
          <ul className="flex items-center gap-4 text-sm md:gap-6">
            {NAV.map(([id, l]) => <li key={id} className="hidden sm:block"><button onClick={() => go(id)} className="text-silver-300 transition hover:text-white">{l}</button></li>)}
            <li><a href="#discover" className="rounded-full bg-teal px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-dark">Interactive workbench</a></li>
          </ul>
        </nav>
      </header>

      <main id="main">
        {/* HERO */}
        <section className="relative overflow-hidden bg-navy-900 text-white on-dark">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.14]" style={{ backgroundImage: 'linear-gradient(#5CC7BF 1px, transparent 1px), linear-gradient(90deg, #5CC7BF 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse at 75% 30%, black, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 75% 30%, black, transparent 70%)' }} />
          <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-28 md:pb-24 md:pt-36">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-silver-300">Sarahí Cruz Salazar · AI Consulting Portfolio</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-teal-light">Prepared for Glia · Consultant role</p>
            <h1 className="mt-6 max-w-4xl text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">Turning AI into <span className="text-teal-light">real business value.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-silver-300">Connecting financial expertise, intelligent automation and human-centered technology adoption.</p>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm" aria-label="Focus areas">
              {['Financial Services', 'Applied AI', 'Client Enablement'].map((p, k) => (
                <span key={p} className="flex items-center gap-2"><span className="rounded-full border border-white/25 bg-white/5 px-4 py-1.5">{p}</span>{k < 2 && <span aria-hidden className="relative h-px w-8 bg-white/25"><span className="absolute -top-[2px] h-[5px] w-[5px] rounded-full bg-teal-light" style={{ animation: 'travel 2.4s linear infinite' }} /></span>}</span>))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <button onClick={() => go('videos')} className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-light hover:text-navy-900">Watch the video interview</button>
              <button onClick={() => go('approach')} className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold transition hover:bg-white/10">Explore my approach</button>
            </div>
            <p className="mt-10 max-w-xl text-xs text-silver-400">Independent portfolio. Not affiliated with or endorsed by Glia, and no Glia branding or interface is used. Interactive demos use a made-up bank and made-up data.</p>
          </div>
        </section>

        {/* 01 VIDEOS */}
        <section id="videos" className="bg-navy-950 py-16 text-white on-dark md:py-24" style={{ scrollMarginTop: '3.5rem' }}>
          <div className="mx-auto max-w-6xl px-5">
            <Head dark n="01" label="Video interview" title="Three questions. One perspective." />
            <div role="tablist" aria-label="Interview videos" className="grid gap-3 md:grid-cols-3">
              {VIDEOS.map((x, k) => (
                <button key={x.n} role="tab" id={`vt-${k}`} aria-selected={v === k} aria-controls="vpanel" onClick={() => setV(k)}
                  className={`rounded-2xl border p-4 text-left transition ${v === k ? 'border-teal bg-white/10' : 'border-white/15 hover:border-white/40'}`}>
                  <span className={`text-[11px] font-semibold uppercase tracking-widest ${v === k ? 'text-teal-light' : 'text-silver-400'}`}>Video {x.n}</span>
                  <span className="mt-1 block text-xl font-semibold">{x.title}</span><span className="text-sm text-silver-300">{x.tag}</span></button>))}
            </div>
            <div id="vpanel" role="tabpanel" aria-labelledby={`vt-${v}`} className="mt-5 grid gap-6 lg:grid-cols-5" key={vid.n} style={{ animation: 'fadeUp .35s ease both' }}>
              <div className="lg:col-span-3"><VideoSlot n={vid.n} src={vid.file} question={vid.question} /></div>
              <div className="lg:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-light">The question</p>
                <p className="mt-1 text-xl font-semibold leading-snug">{vid.question}</p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-teal-light">Shown alongside</p>
                <p className="mt-1 text-silver-300">{vid.adds}. The video answers; the visual below shows it.</p>
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-white/15 p-5" key={'c' + vid.n}>
              {v === 0 && <Venn />}
              {v === 1 && <InteractionDemo />}
              {v === 2 && <ApogeoMap />}
            </div>
          </div>
        </section>

        {/* 02 APPROACH */}
        <section id="approach" className="py-16 md:py-24" style={{ scrollMarginTop: '3.5rem' }}>
          <div className="mx-auto max-w-6xl px-5">
            <Head n="02" label="My consulting approach" title="From business needs to AI adoption." />
            <p className="-mt-3 mb-6 max-w-2xl text-slate2-600">An interactive framework. Select a stage to see how I would approach a project with a financial institution, then try that stage in a working tool.</p>
            <Approach />
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate2-600">
              <a href="#discover" className="rounded-full border border-navy-800 px-5 py-2 font-semibold text-navy-900 transition hover:bg-navy-900/5">Open the full interactive workbench →</a>
              <a href="#questions" className="underline underline-offset-4">Or read the questions a bank’s team asks about applied AI</a>
            </div>
          </div>
        </section>

        {/* 03 EXPERIENCE */}
        <section id="experience" className="bg-white py-16 md:py-24" style={{ scrollMarginTop: '3.5rem' }}>
          <div className="mx-auto max-w-6xl px-5">
            <Head n="03" label="Selected experience" title="Beyond the interview." />
            <Experience />
          </div>
        </section>

        {/* CLOSING */}
        <section id="contact" className="bg-navy-900 py-16 text-white on-dark md:py-24" style={{ scrollMarginTop: '3.5rem' }}>
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">Technology is only valuable when people can use it.</h2>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-teal-light">Professional experience · Portfolio · Academic background</p>
            <ul className="mt-6 flex flex-wrap gap-3 text-sm">
              {profile.linkedin && <li><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full border border-white/30 px-5 py-2.5 font-semibold hover:bg-white/10">LinkedIn ↗</a></li>}
              <li><a href={profile.prototypeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full border border-white/30 px-5 py-2.5 font-semibold hover:bg-white/10">AI Growth Orchestration portfolio ↗</a></li>
            </ul>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-silver-300">Academic background: B.A. in Financial Management, Tecnológico de Monterrey, GPA 94/100, class leader and commencement speaker. My CV and academic honors are available on request{profile.email && <>: <span className="select-all font-semibold text-white">{profile.email}</span></>}.</p>
            <p className="mt-10 max-w-3xl text-xs leading-relaxed text-silver-400">Independent portfolio prepared for the Consultant role. Not affiliated with or endorsed by Glia. No Glia branding, content or interface is used. Interactive demos use a made-up bank and made-up data; their figures are estimates, not results.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
