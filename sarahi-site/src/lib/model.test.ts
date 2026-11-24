import { describe, expect, it } from 'vitest'
import { BASE, compute, normalize } from './model'

describe('KPI model', () => {
  it('is deterministic', () => { expect(compute(BASE)).toEqual(compute(BASE)) })
  it('matches hand calculation for the base case', () => {
    const o = compute(BASE)
    expect(o.aiHandled).toBe(22000)          // 40,000 × 55%
    expect(o.aiResolved).toBe(13200)         // 22,000 × 60%
    expect(o.escalatedCount).toBe(7040)      // 22,000 × 32%
    expect(o.abandoned).toBeCloseTo(1760)    // remainder
    expect(o.baselineHours).toBeCloseTo(5333.33, 1)
    expect(o.newHours).toBeCloseTo((18000 * 8 + 7040 * 8 * 0.85) / 60, 6)
  })
  it('never lets resolved + escalated exceed 100%', () => {
    const n = normalize({ ...BASE, resolved: 80, escalated: 50 })
    expect(n.resolved + n.escalated).toBeLessThanOrEqual(100)
  })
  it('frees no hours when nobody uses the assistant', () => {
    expect(compute({ ...BASE, adoption: 0 }).hoursFreed).toBeCloseTo(0)
  })
  it('ramps adoption linearly then holds', () => {
    const s = compute(BASE).series
    expect(s[2].adoption).toBeCloseTo(27.5); expect(s[11].adoption).toBe(55)
  })
})
