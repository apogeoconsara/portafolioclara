import { describe, expect, it } from 'vitest'
import { groundedOK } from './ai'

const approved = 'The downtown branch is open Monday to Friday 9:00–17:00 and Saturday 9:00–13:00.'
describe('grounding check', () => {
  it('accepts a faithful paraphrase', () => { expect(groundedOK('We are open Monday to Friday 9:00–17:00 and Saturday 9:00–13:00.', approved)).toBe(true) })
  it('rejects invented numbers', () => { expect(groundedOK('We are open until 18:00 on weekdays.', approved)).toBe(false) })
  it('rejects the handoff signal and empty or long replies', () => {
    expect(groundedOK('HANDOFF', approved)).toBe(false); expect(groundedOK('', approved)).toBe(false); expect(groundedOK('x'.repeat(401), approved)).toBe(false)
  })
})
