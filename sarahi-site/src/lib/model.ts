/**
 * Deterministic KPI model for the HYPOTHETICAL regional-bank scenario.
 * Every number it produces is a function of the inputs below — nothing is
 * random, nothing is measured, and nothing here describes a real deployment.
 */
export interface Assumptions {
  volume: number        // customer inquiries per month
  adoption: number      // % of inquiries that start in the assistant at full rollout
  resolved: number      // % of assistant conversations resolved without a person
  escalated: number     // % of assistant conversations handed to a person
  handleMin: number     // average human handling time per inquiry (minutes)
  handoffSaving: number // % handling time saved when the person gets a context summary
  csatAi: number        // 1–5, assistant-resolved conversations
  csatHuman: number     // 1–5, conversations a person handles
  humanResolved: number // % of person-handled inquiries resolved first contact
  rampMonths: number    // months to reach the target adoption
}

export const BASE: Assumptions = {
  volume: 40000, adoption: 55, resolved: 60, escalated: 32, handleMin: 8,
  handoffSaving: 15, csatAi: 4.1, csatHuman: 4.4, humanResolved: 88, rampMonths: 6
}

export const PRESETS: Record<string, { label: string; note: string; a: Assumptions }> = {
  cautious: {
    label: 'Cautious pilot',
    note: 'Low adoption, conservative containment, more escalation.',
    a: { ...BASE, adoption: 30, resolved: 45, escalated: 48, handoffSaving: 8, csatAi: 3.9, rampMonths: 9 }
  },
  base: { label: 'Base case', note: 'Mid-range assumptions to start the conversation.', a: BASE },
  ambitious: {
    label: 'Ambitious',
    note: 'High adoption and containment. Needs strong evidence before anyone plans around it.',
    a: { ...BASE, adoption: 75, resolved: 72, escalated: 22, handoffSaving: 25, csatAi: 4.3, rampMonths: 4 }
  }
}

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Keeps resolved + escalated ≤ 100 so the abandoned share is never negative. */
export function normalize(a: Assumptions): Assumptions {
  const resolved = clamp(a.resolved, 0, 100)
  return { ...a, resolved, escalated: clamp(a.escalated, 0, 100 - resolved) }
}

export interface Outputs {
  aiHandled: number; aiResolved: number; escalatedCount: number; abandoned: number
  humanDirect: number; humanConversations: number
  containmentOfTotal: number; abandonedShare: number
  baselineHours: number; newHours: number; hoursFreed: number; fte: number; efficiency: number
  csat: number; fcr: number
  series: { month: number; adoption: number; hoursFreed: number }[]
}

export const FTE_HOURS = 140 // productive hours per full-time equivalent per month (assumption)

function hoursFor(a: Assumptions, adoptionPct: number) {
  const aiHandled = a.volume * adoptionPct / 100
  const esc = aiHandled * a.escalated / 100
  const direct = a.volume - aiHandled
  const base = a.volume * a.handleMin / 60
  const now = (direct * a.handleMin + esc * a.handleMin * (1 - a.handoffSaving / 100)) / 60
  return { base, now, freed: base - now }
}

export function compute(raw: Assumptions): Outputs {
  const a = normalize(raw)
  const aiHandled = a.volume * a.adoption / 100
  const aiResolved = aiHandled * a.resolved / 100
  const escalatedCount = aiHandled * a.escalated / 100
  const abandoned = aiHandled - aiResolved - escalatedCount
  const humanDirect = a.volume - aiHandled
  const humanConversations = humanDirect + escalatedCount
  const h = hoursFor(a, a.adoption)
  const csatWeight = aiResolved + humanConversations
  const csat = csatWeight ? (aiResolved * a.csatAi + humanConversations * a.csatHuman) / csatWeight : 0
  const fcr = a.volume ? (aiResolved + humanConversations * a.humanResolved / 100) / a.volume * 100 : 0
  const series = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const ad = a.adoption * Math.min(1, month / Math.max(1, a.rampMonths))
    return { month, adoption: ad, hoursFreed: hoursFor(a, ad).freed }
  })
  return {
    aiHandled, aiResolved, escalatedCount, abandoned, humanDirect, humanConversations,
    containmentOfTotal: a.volume ? aiResolved / a.volume * 100 : 0,
    abandonedShare: aiHandled ? abandoned / aiHandled * 100 : 0,
    baselineHours: h.base, newHours: h.now, hoursFreed: h.freed, fte: h.freed / FTE_HOURS,
    efficiency: h.base ? h.freed / h.base * 100 : 0, csat, fcr, series
  }
}
