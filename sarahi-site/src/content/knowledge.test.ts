import { describe, expect, it } from 'vitest'
import { answer } from './knowledge'
describe('ask assistant', () => {
  it('finds the right topic', () => {
    expect(answer('Does she have SaaS experience?')?.id).toBe('saas')
    expect(answer('how does she handle escalation and risk')?.id).toBe('esc')
    expect(answer('Is this affiliated with Glia?')?.id).toBe('glia')
  })
  it('does not guess on unrelated questions', () => { expect(answer('what is the weather today')).toBeNull() })
})
