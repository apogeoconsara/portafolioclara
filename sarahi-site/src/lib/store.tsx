import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_INPUT, derive, type PlanInput } from './plan'

interface Ctx { input: PlanInput; set: (p: Partial<PlanInput>) => void; d: ReturnType<typeof derive> }
const PlanCtx = createContext<Ctx | null>(null)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<PlanInput>(DEFAULT_INPUT)
  const set = useCallback((p: Partial<PlanInput>) => setInput(s => ({ ...s, ...p })), [])
  const value = useMemo(() => ({ input, set, d: derive(input) }), [input, set])
  return <PlanCtx.Provider value={value}>{children}</PlanCtx.Provider>
}
export function usePlan() { const c = useContext(PlanCtx); if (!c) throw new Error('PlanProvider missing'); return c }

export const PAGES = ['home', 'design'] as const
export type Page = (typeof PAGES)[number]
export function usePage(): Page {
  const read = () => { const h = location.hash.slice(1) as Page; return PAGES.includes(h) ? h : 'home' }
  const [p, setP] = useState<Page>(read)
  useEffect(() => {
    const on = () => { setP(read()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on)
  }, [])
  return p
}
