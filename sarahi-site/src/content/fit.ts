import type { Evidence } from '../components/ui'

export interface Proof { kind: Evidence; text: string }
export interface Link { label: string; href: string; stage?: number }
export interface Requirement { id: string; area: string; ask: string; proof: Proof[]; links: Link[]; ramp?: string }

export const AREAS = ['Adoption & impact', 'Training & enablement', 'Implementation', 'Advisory & AI', 'Responsible & collaborative', 'Background'] as const

const E = 'experience' as const, P = 'prototype' as const, H = 'hypothetical' as const

/** Requirements paraphrased from the job description. Evidence comes only from Sarahí's own CV, the prototype, and the demos on this page. */
export const REQS: Requirement[] = [
  { id: 'adopt', area: 'Adoption & impact', ask: 'Drive customer adoption and usage of AI features',
    proof: [{ kind: E, text: 'Led technology rollouts with vendors and technicians, and trained staff so the change was actually adopted.' }, { kind: H, text: 'A role-based adoption plan, plus an adoption ramp you can change in the simulator.' }],
    links: [{ label: 'Adoption plan', href: '#case', stage: 3 }, { label: 'Simulator', href: '#impact' }],
    ramp: 'Renewals: in the first weeks I would shadow account reviews to learn how renewal is measured and where adoption evidence matters most.' },
  { id: 'enduser', area: 'Adoption & impact', ask: 'Help clients drive adoption among their own end users',
    proof: [{ kind: E, text: 'Coordinated operating handoffs so staff kept using new processes after the rollout team left.' }, { kind: H, text: 'Enablement planned per role: what each group needs, the signal that proves it, and the risk of skipping it.' }],
    links: [{ label: 'Adoption plan', href: '#case', stage: 3 }] },
  { id: 'impact', area: 'Adoption & impact', ask: 'Make sure customers reach the business impact they wanted',
    proof: [{ kind: E, text: 'Built two internal control tools at Citibanamex that saved 2+ hours daily.' }, { kind: H, text: 'Measurable objectives with baselines measured, not assumed, and a signal-to-action review.' }],
    links: [{ label: 'Discovery brief', href: '#case', stage: 0 }, { label: 'Performance review', href: '#case', stage: 4 }] },
  { id: 'metrics', area: 'Adoption & impact', ask: 'Analyze AI performance metrics and recommend improvements',
    proof: [{ kind: E, text: 'KPI and management reporting with Power BI and Excel (Power BI certified).' }, { kind: H, text: 'A transparent KPI simulator where every formula is visible, and a method for changing one thing at a time.' }],
    links: [{ label: 'Simulator', href: '#impact' }, { label: 'Performance review', href: '#case', stage: 4 }] },

  { id: 'train', area: 'Training & enablement', ask: 'Develop and run training for client teams',
    proof: [{ kind: E, text: 'Trained staff during technology rollouts and coordinated enablement across roles.' }, { kind: H, text: 'A ten-minute microlearning module with scenario checks and immediate feedback.' }],
    links: [{ label: 'Try the module', href: '#enablement' }] },
  { id: 'explain', area: 'Training & enablement', ask: 'Explain complex AI concepts to non-technical stakeholders',
    proof: [{ kind: E, text: 'Class leader and commencement speaker; works professionally in Spanish and English, with French at DELF B2.' }, { kind: H, text: 'AI and human escalation explained in plain language, one behaviour per lesson.' }],
    links: [{ label: 'Try the module', href: '#enablement' }] },

  { id: 'implement', area: 'Implementation', ask: 'Implement AI products on time and on budget',
    proof: [{ kind: E, text: 'At APOGEO: delivery coordination, testing, release documentation and monitoring across business and technical stakeholders.' }, { kind: H, text: 'A go / conditional / no-go readiness checklist and a phased rollout plan.' }],
    links: [{ label: 'Readiness checklist', href: '#case', stage: 2 }],
    ramp: 'Budget ownership at client scale: I would learn the implementation methodology and templates first, then co-lead a rollout.' },
  { id: 'collab', area: 'Implementation', ask: 'Work closely with implementation managers, solution architects and engineers',
    proof: [{ kind: E, text: 'Translate business needs into data models, KPIs, decision rules and approval flows with technical teams at APOGEO.' }, { kind: E, text: 'Resolved control exceptions across Trading, Sales, Operations and Risk at Citibanamex.' }],
    links: [{ label: 'Background', href: '#journey' }] },
  { id: 'diagram', area: 'Implementation', ask: 'Document client processes and diagram process flows',
    proof: [{ kind: H, text: 'A process-flow diagram of the full journey, with options for channel, handoff and fallback.' }, { kind: E, text: 'Standardized order, inventory and payment processes, and documented validation points at APOGEO.' }],
    links: [{ label: 'Process flow', href: '#case', stage: 1 }],
    ramp: 'I diagram with flowcharts today. I would formalize in UML in the first 30 days.' },

  { id: 'presales', area: 'Advisory & AI', ask: 'Provide pre-sales consultancy on AI features',
    proof: [{ kind: H, text: 'Stakeholder discovery: what to ask each group, what evidence to collect, and objectives agreed before targets.' }, { kind: E, text: 'Sales and advisory support on structured products at Citibanamex.' }],
    links: [{ label: 'Discovery brief', href: '#case', stage: 0 }],
    ramp: 'No formal SaaS pre-sales yet. I would shadow calls and co-present before leading one.' },
  { id: 'sme', area: 'Advisory & AI', ask: 'Be a credible AI subject-matter expert for client stakeholders',
    proof: [{ kind: E, text: 'Builds AI-enabled workflows with APIs, validation and monitoring at APOGEO. Agentic AI certification.' }, { kind: P, text: 'Orchestration prototype: 50,000 synthetic records, LLM/API step, rules, exceptions, human approval, audit trail.' }],
    links: [{ label: 'The prototype', href: '#prototype' }] },
  { id: 'prompts', area: 'Advisory & AI', ask: 'Advise on prompt engineering and generative AI best practices',
    proof: [{ kind: E, text: 'Builds with the OpenAI API in production workflows at APOGEO.' }, { kind: H, text: 'Prompt-level guardrails shown in the design stage: approved sources only, mandatory escalation rules, no advice.' }],
    links: [{ label: 'Escalation rules', href: '#case', stage: 1 }],
    ramp: 'I would turn what I have learned into a short client-facing prompting guide during my first implementations.' },

  { id: 'ethics', area: 'Responsible & collaborative', ask: 'Apply AI ethics and responsible AI practices',
    proof: [{ kind: P, text: 'Human approvals, validation and audit trails built into the prototype.' }, { kind: H, text: 'Sensitive topics go to a person by rule, not by confidence. A configuration I would refuse to recommend.' }],
    links: [{ label: 'Escalation tester', href: '#case', stage: 1 }] },
  { id: 'feedback', area: 'Responsible & collaborative', ask: 'Bring client feedback back to product and engineering',
    proof: [{ kind: H, text: 'An optimize loop where signals become one specific change, verified before the next.' }, { kind: E, text: 'Investigated data-quality issues and release documentation with technical teams.' }],
    links: [{ label: 'Performance review', href: '#case', stage: 4 }],
    ramp: 'I would learn the product feedback channels and priorities early, so requests arrive with evidence.' },

  { id: 'banking', area: 'Background', ask: 'Financial services or banking experience (bonus)',
    proof: [{ kind: E, text: 'Three Citibanamex rotations: Markets Treasury, FX & Rates, Structured Products Sales. Bloomberg Market Concepts.' }],
    links: [{ label: 'Background', href: '#journey' }] },
  { id: 'saas', area: 'Background', ask: '2+ years in SaaS and customer-facing roles',
    proof: [{ kind: E, text: 'Customer lifecycle and reactivation systems at APOGEO, customer-facing operations in food service, and Salesforce CRM.' }],
    links: [{ label: 'Background', href: '#journey' }],
    ramp: 'I have not held a SaaS vendor customer-success title. I would close that quickly by shadowing implementations and customer reviews in the first 30 days.' }
]
