import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUT, derive, planUseCases, share } from './plan'

describe('topic planning', () => {
  it('is deterministic', () => { expect(derive(DEFAULT_INPUT)).toEqual(derive(DEFAULT_INPUT)) })
  it('always routes high-risk topics to a person, whatever the appetite', () => {
    for (const appetite of ['cautious', 'balanced', 'ambitious'] as const)
      for (const c of planUseCases({ ...DEFAULT_INPUT, appetite })) if (c.risk === 'high') expect(c.phase).toBe('human')
  })
  it('shares add up to 100', () => { const c = planUseCases(DEFAULT_INPUT); expect(share(c, 'eligible') + share(c, 'human')).toBe(100) })
  it('a cautious bank pilots fewer topics than a balanced one', () => {
    expect(share(planUseCases({ ...DEFAULT_INPUT, appetite: 'cautious' }), 1)).toBeLessThan(share(planUseCases(DEFAULT_INPUT), 1))
  })
})
