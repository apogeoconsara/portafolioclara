import type { Channel, Handoff, LowConf } from '../components/FlowDiagram'

/**
 * Topic planning for the HYPOTHETICAL bank. A pure function of PlanInput:
 * no randomness, no data, no AI.
 */
export type Appetite = 'cautious' | 'balanced' | 'ambitious'
export type Readiness = 'low' | 'medium' | 'high'
export type Level = 'low' | 'medium' | 'high'
export type Phase = 1 | 2 | 'human'

export interface PlanInput {
  channels: Channel[]; appetite: Appetite; readiness: Readiness
  handoff: Handoff; lowConf: LowConf
}
export const DEFAULT_INPUT: PlanInput = { channels: ['chat'], appetite: 'balanced', readiness: 'medium', handoff: 'live', lowConf: 'person' }

export interface UseCase { id: string; name: string; share: number; risk: Level; complexity: Level }
export const USE_CASES: UseCase[] = [
  { id: 'hours', name: 'Branch hours and locations', share: 12, risk: 'low', complexity: 'low' },
  { id: 'access', name: 'Online banking access help', share: 14, risk: 'low', complexity: 'low' },
  { id: 'cards', name: 'Card status and activation', share: 10, risk: 'medium', complexity: 'medium' },
  { id: 'txn', name: 'Transaction and balance questions', share: 16, risk: 'medium', complexity: 'medium' },
  { id: 'fees', name: 'Fee explanations', share: 9, risk: 'medium', complexity: 'low' },
  { id: 'loans', name: 'Loan and mortgage information', share: 8, risk: 'medium', complexity: 'high' },
  { id: 'changes', name: 'Limits and detail changes', share: 11, risk: 'medium', complexity: 'high' },
  { id: 'fraud', name: 'Suspected fraud and disputes', share: 11, risk: 'high', complexity: 'high' },
  { id: 'complaints', name: 'Complaints', share: 6, risk: 'high', complexity: 'medium' },
  { id: 'vulnerable', name: 'Bereavement and vulnerable customers', share: 3, risk: 'high', complexity: 'high' }
]

export interface PlannedCase extends UseCase { phase: Phase }

/** High-risk topics are always handled by a person. High-complexity topics wait for phase 2. */
export function planUseCases(i: PlanInput): PlannedCase[] {
  return USE_CASES.map(u => {
    let phase: Phase = 1
    if (u.risk === 'high') phase = 'human'
    else if (u.complexity === 'high') phase = 2
    else if (u.risk === 'medium' && i.appetite === 'cautious') phase = 2
    else if (i.readiness === 'low' && u.complexity !== 'low') phase = 2
    return { ...u, phase }
  })
}

export function share(cases: PlannedCase[], p: Phase | 'eligible') {
  return cases.filter(c => (p === 'eligible' ? c.phase !== 'human' : c.phase === p)).reduce((s, c) => s + c.share, 0)
}

export function derive(i: PlanInput) { return { cases: planUseCases(i) } }
