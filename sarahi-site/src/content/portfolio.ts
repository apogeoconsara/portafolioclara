import { profile } from './profile'

export const VIDEOS = [
  { n: '01', file: '/videos/01-why-glia.mp4', title: 'Why Glia?', tag: 'Motivation & alignment', question: 'Why Glia, and why AI consulting?', adds: 'How finance, AI and consulting come together' },
  { n: '02', file: '/videos/02-explaining-ai.mp4', title: 'Explaining AI', tag: 'Client communication', question: 'How would you explain one of Glia’s products to a non-technical client?', adds: 'An AI-assisted banking interaction, step by step' },
  { n: '03', file: '/videos/03-ai-in-practice.mp4', title: 'AI in practice', tag: 'Implementation experience', question: 'Tell me about an AI-powered solution you implemented.', adds: 'The functional view of the workflows I work on' }
] as const

export interface Stage { name: string; head: string; body: string; out: string; cap: string; page?: string; try?: string }
export const STAGES: Stage[] = [
  { name: 'Discovery', head: 'Understand the business', body: 'Identify client needs, operational challenges, existing processes and business objectives.', out: 'Business requirements & process mapping', cap: 'Stakeholder communication · Financial expertise' },
  { name: 'Design', page: 'design', head: 'Shape the solution', body: 'Define the conversation flows, guardrails, escalation rules and integrations the solution needs.', out: 'Solution design & escalation rules', cap: 'Responsible AI · Process design', try: 'Test the escalation rules and the assistant' },
  { name: 'Implementation', head: 'Deliver it safely', body: 'Coordinate integration, testing and a phased rollout with business and technical teams.', out: 'Test plan, acceptance criteria & rollout plan', cap: 'Delivery coordination · Testing & documentation' },
  { name: 'Enablement', head: 'Make it usable', body: 'Prepare each role to work with the solution: training, materials and clear handoffs.', out: 'Role-based training & adoption plan', cap: 'User training · Change management' },
  { name: 'Optimization', head: 'Learn and improve', body: 'Track adoption and performance, then improve one thing at a time.', out: 'Performance review & improvement backlog', cap: 'Data analysis · KPI reporting' }
]

export interface Case {
  id: string; name: string; role: string; blurb: string; flow: string[]; flowNote?: string
  tools: string[]; evidence: string[]; basis: 'experience' | 'prototype'; note?: string; link?: { label: string; href: string }
}
export const CASES: Case[] = [
  { id: 'apogeo', name: 'APOGEO', role: 'AI & Digital Transformation', basis: 'experience',
    blurb: 'Designing and running AI-enabled workflows that connect business systems, with validation and human review before anything reaches operations.',
    flow: ['Business data and documents', 'Triggers and serverless functions', 'AI step', 'Validation and rules', 'Human review of exceptions', 'Approved action and monitoring'],
    tools: ['OpenAI API', 'PostgreSQL / Supabase', 'Serverless functions', 'Webhooks', 'REST APIs'],
    evidence: ['AI/API-enabled customer lifecycle and reactivation systems', 'Document workflows: photos and PDFs turned into validated data, with manual review', 'Payment, appointment and customer-operation integrations', 'Delivery coordination, testing, release documentation and monitoring'] },
  { id: 'clara', name: 'CLARA', role: 'AI Growth Orchestration · Business Case', basis: 'prototype',
    blurb: 'A business case for a growth and lifecycle automation role at a Latin American B2B fintech: scoring, routing, lifecycle automation and an agent that needs human approval before saving a decision.',
    flow: ['Company signals', 'Scoring 0–100', 'Qualification gate', 'Routing in three tiers', 'Lifecycle automation', 'Human approval before any CRM action'],
    tools: ['Netlify Functions', 'LLM APIs (OpenAI, Anthropic)', 'n8n workflow design', 'Lifecycle events (simulated)', 'Clay (company research)'],
    evidence: ['Deterministic scoring with editable rules and three-tier routing', 'A chat agent whose write actions wait for human approval', 'Documented workflow and data model', 'Hypotheses labelled as hypotheses; no company was contacted'],
    note: 'Personal business case and prototype. Not an integration with the company.', link: { label: 'Open the AI Growth Orchestration portfolio', href: profile.prototypeUrl } },
  { id: 'banamex', name: 'BANAMEX', role: 'Financial Markets & Banking', basis: 'experience',
    blurb: 'Three rotations at Citibanamex inside a regulated bank: where the controls come from, and how Trading, Sales, Operations and Risk resolve exceptions together.',
    flow: ['Markets Treasury', 'FX and Rates', 'Structured Products Sales', 'Controls and exception resolution'],
    tools: ['Advanced Excel', 'Financial analysis', 'Bloomberg Market Concepts (certification)'],
    evidence: ['Built two internal control tools that saved 2+ hours daily', 'Supported resolution of FX flows above USD 3 billion and Bondes F activity above MXN 4 billion', 'Investigated trade-booking and settlement exceptions across teams', 'Prepared variance explanations to support treasury decisions'] }
]
