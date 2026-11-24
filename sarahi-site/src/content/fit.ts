import type { Evidence } from '../components/ui'

export interface Proof { kind: Evidence; text: string }
export interface Link { label: string; href: string }
export interface Requirement { id: string; ask: string; why: string; proof: Proof[]; links: Link[]; ramp?: string }

const E = 'experience' as const, P = 'prototype' as const, H = 'hypothetical' as const

/** Six things the role asks for, in plain language. Evidence comes only from Sarahí's own experience, her prototype, and the demos on this page. */
export const REQS: Requirement[] = [
  { id: 'adopt', ask: 'Help clients adopt the AI', why: 'Adoption, usage and renewals',
    proof: [{ kind: E, text: 'Led technology rollouts with vendors and technicians, and trained staff so the change stuck.' }, { kind: H, text: 'An adoption plan by role: what each group needs and how we know it is working.' }],
    links: [{ label: 'See the adoption plan', href: '#adoption' }],
    ramp: 'Renewals: I would sit in on account reviews early to learn how renewal is measured.' },
  { id: 'train', ask: 'Train client teams', why: 'Training and explaining AI to non-technical people',
    proof: [{ kind: E, text: 'Trained staff during rollouts. Class commencement speaker. Works in Spanish, English and French.' }, { kind: H, text: 'A role-by-role enablement plan, including how to teach staff when the AI hands over to a person.' }],
    links: [{ label: 'See the enablement plan', href: '#adoption' }] },
  { id: 'deliver', ask: 'Deliver implementations on time', why: 'Projects, stakeholders and rollout',
    proof: [{ kind: E, text: 'At APOGEO: coordinate delivery, testing and release between business and technical teams.' }, { kind: H, text: 'A go / no-go checklist that tells a client if they are ready to launch.' }],
    links: [{ label: 'See the checklist', href: '#readiness' }],
    ramp: 'Budget ownership at client scale: I would learn the team’s methodology first, then co-lead a rollout.' },
  { id: 'impact', ask: 'Measure the business impact', why: 'Metrics and recommendations',
    proof: [{ kind: E, text: 'Built two internal control tools at Citibanamex that saved 2+ hours a day. Reports in Power BI and Excel.' }, { kind: H, text: 'A simulator where you change the assumptions and see what has to be true.' }],
    links: [{ label: 'Open the simulator', href: '#impact' }] },
  { id: 'expert', ask: 'Advise clients on AI', why: 'Technical advice and responsible AI',
    proof: [{ kind: E, text: 'Builds AI workflows at APOGEO. Agentic AI certification.' }, { kind: P, text: 'A prototype where AI works with rules, checks and human approval.' }, { kind: H, text: 'Rules that send sensitive topics to a person, however sure the AI is.' }],
    links: [{ label: 'Try the escalation rules', href: '#flow' }, { label: 'See the prototype', href: '#prototype' }],
    ramp: 'Pre-sales and prompt writing: no formal pre-sales yet. I would shadow calls first and write a short client guide on prompting.' },
  { id: 'know', ask: 'Understand banks and their customers', why: 'Financial services and customer-facing experience',
    proof: [{ kind: E, text: 'Three rotations at Citibanamex: treasury, FX and rates, structured products. Worked with the controls banks live by.' }, { kind: E, text: 'Customer lifecycle systems at APOGEO and customer-facing operations in food service.' }],
    links: [{ label: 'Read my background', href: '#about' }],
    ramp: 'I have not held a SaaS customer-success title. I would close that by shadowing implementations and reviews in my first 30 days.' }
]
