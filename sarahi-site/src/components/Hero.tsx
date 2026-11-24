import { motion, useReducedMotion } from 'framer-motion'
import { btnGhost, btnPrimary, EvidenceTag } from './ui'

export default function Hero() {
  const reduce = useReducedMotion()
  const line = (i: number) => reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.15 + i * 0.18, ease: [0.22, 1, 0.36, 1] as const } }
  return (
    <div id="top" className="relative overflow-hidden bg-navy-900 text-ivory on-dark">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{ backgroundImage: 'linear-gradient(#7388A8 1px, transparent 1px), linear-gradient(90deg, #7388A8 1px, transparent 1px)', backgroundSize: '72px 72px', maskImage: 'radial-gradient(ellipse at 70% 30%, black, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 70% 30%, black, transparent 70%)' }} />
      <div className="relative mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-center px-5 pb-12 pt-28 md:px-8">
        <motion.p {...line(0)} className="eyebrow !text-silver-400">Sarahí Cruz Salazar · AI consulting portfolio</motion.p>
        <h1 className="serif mt-6 max-w-4xl text-[2.4rem] leading-[1.05] sm:text-5xl md:text-6xl">
          <motion.span {...line(1)} className="block">I understand banking.</motion.span>
          <motion.span {...line(2)} className="block text-silver-300">I build with AI.</motion.span>
          <motion.span {...line(3)} className="block">I connect both.</motion.span>
        </h1>
        <motion.p {...line(4)} className="mt-6 max-w-2xl text-base leading-relaxed text-silver-300 md:text-lg">
          From financial markets to AI-powered workflows, my experience brings together business understanding, hands-on technology, and a practical approach to implementation.
        </motion.p>
        <motion.div {...line(5)} className="mt-8 flex flex-wrap gap-3">
          <a href="#case" className={btnPrimary}>Explore My Consulting Approach <span aria-hidden>→</span></a>
          <a href="#prototype" className={btnGhost}>View Selected Work</a>
        </motion.div>
        <motion.div {...line(6)} className="mt-12 max-w-3xl border-t border-white/15 pt-5">
          <p className="text-sm text-silver-400">Every section is labelled by evidence type:</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <EvidenceTag kind="experience" dark /><EvidenceTag kind="prototype" dark /><EvidenceTag kind="hypothetical" dark />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-silver-400">
            Independent portfolio for the Senior Associate, AI Consultant opportunity. Not affiliated with or endorsed by Glia.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
