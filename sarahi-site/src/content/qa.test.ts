import { describe, expect, it } from 'vitest'
import { QAS, findQA } from './qa'

describe('client questions', () => {
  it('finds the closest prepared answer', () => {
    expect(findQA('Will the AI make things up?')[0].id).toBe('hallucinate')
    expect(findQA('can customers trick the assistant')[0].id).toBe('inject')
    expect(findQA('Is it compliant with regulation?')[0].id).toBe('compliance')
    expect(findQA('how long will implementation take')[0].id).toBe('timeline')
  })
  it('does not guess on unrelated questions', () => { expect(findQA('what is the weather in Paris')).toEqual([]) })
  it('every answer has a demo link and a short, plain answer', () => {
    for (const e of QAS) { expect(e.show?.href).toMatch(/^#/); expect(e.short.length).toBeLessThan(300) }
  })
})
