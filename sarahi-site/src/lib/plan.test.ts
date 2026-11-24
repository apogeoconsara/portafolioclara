import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUT, checklist, derive, planUseCases, share, verdict } from './plan'

describe('rollout planner', () => {
  it('is deterministic', () => { expect(derive(DEFAULT_INPUT)).toEqual(derive(DEFAULT_INPUT)) })
  it('always routes high-risk topics to a person, whatever the appetite', () => {
    for (const appetite of ['cautious', 'balanced', 'ambitious'] as const)
      for (const c of planUseCases({ ...DEFAULT_INPUT, appetite })) if (c.risk === 'high') expect(c.phase).toBe('human')
  })
  it('shares add up to 100', () => { expect(share(planUseCases(DEFAULT_INPUT), 'eligible') + share(planUseCases(DEFAULT_INPUT), 'human')).toBe(100) })
  it('a cautious bank pilots fewer topics than a balanced one', () => {
    expect(share(planUseCases({ ...DEFAULT_INPUT, appetite: 'cautious' }), 1)).toBeLessThan(share(planUseCases(DEFAULT_INPUT), 1))
  })
  it('voice and messaging add must-have checks', () => {
    expect(checklist({ ...DEFAULT_INPUT, channels: ['chat', 'voice', 'messaging'] }).filter(c => c.must).length).toBeGreaterThan(checklist(DEFAULT_INPUT).filter(c => c.must).length)
  })
  it('verdict follows must-haves first', () => {
    const l = checklist(DEFAULT_INPUT)
    expect(verdict(l, new Set()).tone).toBe('No-go')
    expect(verdict(l, new Set(l.filter(c => c.must).map(c => c.id))).tone).toBe('Conditional')
    expect(verdict(l, new Set(l.map(c => c.id))).tone).toBe('Go')
  })
})
