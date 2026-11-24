import { describe, expect, it } from 'vitest'
import { respond } from './assistant'
import { DEFAULT_INPUT, planUseCases } from './plan'

const cases = planUseCases(DEFAULT_INPUT)
const r = (m: string, n = 0, input = DEFAULT_INPUT) => respond(m, planUseCases(input), input, n)

describe('assistant rules', () => {
  it('answers a routine, in-scope question from approved content', () => { const x = r('What time does the branch open on Saturday?'); expect(x.kind).toBe('answer'); expect(x.source).toBeTruthy() })
  it('always hands fraud to a person', () => { expect(r("There's a charge I didn't make").kind).toBe('handoff') })
  it('safety outranks topic: fraud wins over card', () => { expect(r('Someone stole my card and used it').intent).toBe('fraud') })
  it('hands over bereavement', () => { expect(r('My husband passed away and I need to close his account').kind).toBe('handoff') })
  it('honours a request for a person', () => { expect(r('Please let me speak to a person').reason).toMatch(/always honoured/) })
  it('clarifies once, then hands over', () => {
    const input = { ...DEFAULT_INPUT, lowConf: 'clarify' as const }
    expect(r('blah blah', 0, input).kind).toBe('clarify'); expect(r('blah blah', 1, input).kind).toBe('handoff')
  })
  it('hands over phase-2 topics', () => { expect(r('Can I get a mortgage?').kind).toBe('handoff') })
  it('has planned cases', () => { expect(cases.length).toBe(10) })
})
