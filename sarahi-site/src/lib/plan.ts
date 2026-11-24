import type { Channel } from '../components/FlowDiagram'
import { type Assumptions, compute, FTE_HOURS, type Outputs } from './model'

/**
 * Deterministic planning logic for the HYPOTHETICAL regional bank.
 * Everything below is a pure function of PlanInput: no randomness, no data, no AI.
 */
export type Appetite = 'cautious' | 'balanced' | 'ambitious'
export type Readiness = 'low' | 'medium' | 'high'
export type Level = 'low' | 'medium' | 'high'
export type Phase = 1 | 2 | 'human'

export interface PlanInput {
  volume: number; agents: number; handleMin: number
  channels: Channel[]; appetite: Appetite; readiness: Readiness
  adoption: number            // % of eligible customers who choose the assistant
  resolved?: number; escalated?: number // optional manual overrides (Impact page)
}
export const DEFAULT_INPUT: PlanInput = { volume: 40000, agents: 35, handleMin: 8, channels: ['chat'], appetite: 'balanced', readiness: 'medium', adoption: 55 }

export interface UseCase { id: string; name: string; share: number; risk: Level; complexity: Level; note: string }
export const USE_CASES: UseCase[] = [
  { id: 'hours', name: 'Branch hours and locations', share: 12, risk: 'low', complexity: 'low', note: 'Simple, high volume, easy to keep accurate.' },
  { id: 'access', name: 'Online banking access help', share: 14, risk: 'low', complexity: 'low', note: 'Guided steps and links; no account data needed.' },
  { id: 'cards', name: 'Card status and activation', share: 10, risk: 'medium', complexity: 'medium', note: 'Needs a read-only status lookup.' },
  { id: 'txn', name: 'Transaction and balance questions', share: 16, risk: 'medium', complexity: 'medium', note: 'Largest category; needs identity checks and read-only data.' },
  { id: 'fees', name: 'Fee explanations', share: 9, risk: 'medium', complexity: 'low', note: 'Answered from approved fee schedules.' },
  { id: 'loans', name: 'Loan and mortgage information', share: 8, risk: 'medium', complexity: 'high', note: 'Regulated wording; many edge cases.' },
  { id: 'changes', name: 'Limits and detail changes', share: 11, risk: 'medium', complexity: 'high', note: 'Write actions; strong identity verification.' },
  { id: 'fraud', name: 'Suspected fraud and disputes', share: 11, risk: 'high', complexity: 'high', note: 'Time-critical and sensitive.' },
  { id: 'complaints', name: 'Complaints', share: 6, risk: 'high', complexity: 'medium', note: 'Regulatory obligations and customer trust.' },
  { id: 'vulnerable', name: 'Bereavement and vulnerable customers', share: 3, risk: 'high', complexity: 'high', note: 'Needs human judgment and care.' }
]

export interface PlannedCase extends UseCase { phase: Phase; priority: number; why: string }

const EASE: Record<Level, number> = { low: 1, medium: 0.7, high: 0.4 }
const READY: Record<Readiness, number> = { low: 0.6, medium: 0.85, high: 1 }

export function planUseCases(i: PlanInput): PlannedCase[] {
  return USE_CASES.map(u => {
    const priority = Math.round(u.share * EASE[u.complexity] * READY[i.readiness] * 10) / 10
    let phase: Phase = 1, why = u.risk === 'low' ? 'Low risk and simple: a good first topic for the pilot.' : 'Medium risk but manageable: in the pilot with read-only data and escalation rules.'
    if (u.risk === 'high') { phase = 'human'; why = 'Always handled by a person. Sensitive topics are routed by rule, not by confidence.' }
    else if (u.complexity === 'high') { phase = 2; why = 'Needs integrations or stronger identity checks first.' }
    else if (u.risk === 'medium' && i.appetite === 'cautious') { phase = 2; why = 'Medium risk: waits for phase 2 because the bank prefers a cautious start.' }
    else if (i.readiness === 'low' && u.complexity !== 'low') { phase = 2; why = 'Approved content is not ready yet, so this follows the simplest topics.' }
    return { ...u, phase, priority, why }
  }).sort((a, b) => (a.phase === 'human' ? 1 : 0) - (b.phase === 'human' ? 1 : 0) || b.priority - a.priority)
}

export function share(cases: PlannedCase[], p: Phase | 'eligible') {
  return cases.filter(c => (p === 'eligible' ? c.phase !== 'human' : c.phase === p)).reduce((s, c) => s + c.share, 0)
}

const RESOLVED: Record<Readiness, number> = { low: 45, medium: 60, high: 72 }
const APPETITE_ADJ: Record<Appetite, number> = { cautious: -5, balanced: 0, ambitious: 4 }
const RAMP: Record<Appetite, number> = { cautious: 9, balanced: 6, ambitious: 4 }

export function assumptionsFor(i: PlanInput, cases = planUseCases(i)): Assumptions {
  const resolved = i.resolved ?? RESOLVED[i.readiness] + APPETITE_ADJ[i.appetite]
  const escalated = i.escalated ?? Math.max(0, 100 - resolved - 6)
  return {
    volume: i.volume, adoption: Math.round(share(cases, 'eligible') * i.adoption) / 100, resolved, escalated,
    handleMin: i.handleMin, handoffSaving: 15, csatAi: 4.1, csatHuman: 4.4, humanResolved: 88, rampMonths: RAMP[i.appetite]
  }
}

export interface Derived { cases: PlannedCase[]; assumptions: Assumptions; out: Outputs; capacityPct: number; train: { role: string; people: number; hours: number; focus: string }[]; trainHours: number }

export function derive(i: PlanInput): Derived {
  const cases = planUseCases(i)
  const assumptions = assumptionsFor(i, cases)
  const out = compute(assumptions)
  const capacityPct = i.agents ? (out.hoursFreed / (i.agents * FTE_HOURS)) * 100 : 0
  const leads = Math.max(1, Math.ceil(i.agents / 10))
  const train = [
    { role: 'Contact-centre agents', people: i.agents, hours: 2, focus: 'Reading the handoff summary and taking over without repeating questions' },
    { role: 'Team leads', people: leads, hours: 3, focus: 'Coaching with the new data and raising bad answers for correction' },
    { role: 'Branch staff', people: Math.max(2, Math.round(i.agents / 2)), hours: 1, focus: 'What the assistant can and cannot do' },
    { role: 'Compliance and QA', people: 2, hours: 2, focus: 'Sampling conversations and checking the rules are followed' }
  ]
  return { cases, assumptions, out, capacityPct, train, trainHours: train.reduce((s, t) => s + t.people * t.hours, 0) }
}

export interface Check { id: string; t: string; must: boolean }
export function checklist(i: PlanInput): Check[] {
  const c: Check[] = [
    { id: 'src', must: true, t: 'Assistant answers only from approved, versioned content' },
    { id: 'esc', must: true, t: 'All sensitive categories escalate correctly in testing' },
    { id: 'handoff', must: true, t: 'Handoff delivers a conversation summary to the agent desktop' },
    { id: 'sec', must: true, t: 'Security and compliance review signed off' },
    { id: 'fallback', must: true, t: 'A person can take over if the assistant or an integration is down' }
  ]
  if (i.channels.includes('voice')) c.push({ id: 'voice', must: true, t: 'Voice quality and spoken confirmations tested with real accents and noise' })
  if (i.channels.includes('messaging')) c.push({ id: 'ident', must: true, t: 'Identity verified before any account-specific answer in messaging' })
  if (i.readiness === 'low') c.push({ id: 'content', must: true, t: 'Approved answers written for every pilot topic' })
  c.push({ id: 'quality', must: false, t: 'Answer quality meets the agreed threshold on the test question set' })
  c.push({ id: 'train', must: false, t: 'Pilot team has completed training' })
  c.push({ id: 'monitor', must: false, t: 'Monitoring live, with named owners for alerts' })
  if (i.appetite === 'ambitious') c.push({ id: 'sample', must: false, t: 'Weekly sampling of conversations agreed with Compliance' })
  return c
}

export function verdict(list: Check[], done: Set<string>) {
  const mustOpen = list.filter(c => c.must && !done.has(c.id)).length
  const shouldOpen = list.filter(c => !c.must && !done.has(c.id)).length
  if (mustOpen) return { tone: 'No-go' as const, text: `${mustOpen} must-have item${mustOpen > 1 ? 's' : ''} still open. Nothing else makes up for these.` }
  if (shouldOpen) return { tone: 'Conditional' as const, text: `All must-haves met. Close ${shouldOpen} more item${shouldOpen > 1 ? 's' : ''} or record an accepted risk before the pilot.` }
  return { tone: 'Go' as const, text: 'Ready for a controlled pilot with limited topics and clear exit criteria.' }
}

export function waves(i: PlanInput, d: Derived) {
  const first = i.channels[0] ?? 'chat'
  const p1 = d.cases.filter(c => c.phase === 1).map(c => c.name)
  const p2 = d.cases.filter(c => c.phase === 2).map(c => c.name)
  return [
    { w: 'Wave 0', t: 'Internal test', d: 'Staff only, to find content and handoff problems before customers do.' },
    { w: 'Wave 1', t: 'Pilot', d: `One team on ${first}, limited to: ${p1.join(', ') || 'no topics yet'}.` },
    { w: 'Wave 2', t: 'Expand', d: p2.length ? `Add: ${p2.join(', ')}, once the pilot gate is met.` : 'Add channels once the pilot gate is met.' },
    { w: 'Wave 3', t: 'Broad release', d: 'All teams and channels, with monitoring and a rehearsed rollback.' }
  ]
}

const f = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d })
export function brief(i: PlanInput, d: Derived): string {
  const w = waves(i, d)
  return [
    'AI CUSTOMER SERVICE ROLLOUT BRIEF (hypothetical bank, illustrative figures)',
    '',
    `Profile: ${f(i.volume)} inquiries/month · ${i.agents} service staff · ${i.handleMin} min per inquiry · channels: ${i.channels.join(', ')} · ${i.appetite} risk appetite · content readiness ${i.readiness}`,
    '',
    `Scope: ${share(d.cases, 'eligible')}% of inquiry volume is eligible for the assistant; ${share(d.cases, 'human')}% always goes to a person.`,
    `Phase 1: ${d.cases.filter(c => c.phase === 1).map(c => c.name).join('; ') || 'none'}`,
    `Phase 2: ${d.cases.filter(c => c.phase === 2).map(c => c.name).join('; ') || 'none'}`,
    `Always human: ${d.cases.filter(c => c.phase === 'human').map(c => c.name).join('; ')}`,
    '',
    'Rollout: ' + w.map(x => `${x.w} ${x.t}`).join(' → '),
    `Training: ${f(d.trainHours)} staff-hours across ${d.train.length} roles`,
    '',
    `Simulated impact at full adoption: ${f(d.out.aiResolved)} inquiries/month solved without a person, ${f(d.out.hoursFreed)} staff hours freed (${f(d.capacityPct, 1)}% of team capacity), satisfaction ${d.out.csat.toFixed(2)}/5 (assumed).`,
    'These are outputs of stated assumptions, not results from any real deployment.'
  ].join('\n')
}
