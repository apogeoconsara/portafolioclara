import { describe, expect, it } from 'vitest'
import { coverage } from './PromptClinic'
describe('prompt coverage', () => {
  it('flags everything with no blocks', () => { expect(coverage(new Set()).every(r => r.missing.length > 0)).toBe(true) })
  it('covers everything with all blocks', () => { expect(coverage(new Set(['role','sources','boundaries','escalation','format','tone'])).every(r => r.missing.length === 0)).toBe(true) })
  it('needs both escalation and tone for the upset customer', () => { expect(coverage(new Set(['escalation']))[4].missing).toEqual(['tone']) })
})
