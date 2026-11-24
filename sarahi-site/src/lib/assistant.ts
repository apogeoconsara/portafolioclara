import { USE_CASES, type PlannedCase, type PlanInput } from './plan'

/**
 * A rule-based banking assistant for the HYPOTHETICAL bank. No AI model: it shows how
 * routing rules, approved content and human handoff fit together.
 */
export type Intent = 'person' | 'vulnerable' | 'fraud' | 'complaints' | 'hours' | 'access' | 'cards' | 'txn' | 'fees' | 'loans' | 'changes'

const KEYS: Record<Intent, string[]> = {
  person: ['speak to a person', 'talk to a person', 'human', 'real person', 'representative', 'an agent', 'speak to someone', 'talk to someone'],
  vulnerable: ['passed away', 'died', 'death', 'bereave', 'widow', 'funeral', 'hardship', 'struggling', "can't cope", 'scared'],
  fraud: ['fraud', 'stolen', 'stole', 'steal', 'scam', 'unauthori', "don't recognise", "don't recognize", "didn't make", 'hacked', 'phishing'],
  complaints: ['complain', 'unacceptable', 'third time', 'terrible', 'furious', 'angry', 'manager'],
  hours: ['open', 'hours', 'close', 'saturday', 'sunday', 'branch', 'location'],
  access: ['password', 'log in', 'login', 'locked out', 'reset', 'username', 'sign in'],
  cards: ['activate', 'activation', 'new card', 'replace', 'card status', 'debit card', 'credit card', 'my card'],
  txn: ['balance', 'transaction', 'statement', 'pending', 'payment', 'transfer'],
  fees: ['fee', 'overdraft', 'monthly charge', 'cost'],
  loans: ['loan', 'mortgage', 'borrow', 'interest rate'],
  changes: ['limit', 'change my address', 'update my', 'phone number', 'raise']
}
const ORDER: Intent[] = ['person', 'vulnerable', 'fraud', 'complaints', 'hours', 'access', 'cards', 'fees', 'txn', 'loans', 'changes']
const CASE_ID: Partial<Record<Intent, string>> = { vulnerable: 'vulnerable', fraud: 'fraud', complaints: 'complaints', hours: 'hours', access: 'access', cards: 'cards', txn: 'txn', fees: 'fees', loans: 'loans', changes: 'changes' }

/** Approved content snippets for the fictional bank. Illustrative wording and numbers. */
const APPROVED: Partial<Record<Intent, { text: string; source: string }>> = {
  hours: { text: 'The downtown branch is open Monday to Friday 9:00–17:00 and Saturday 9:00–13:00.', source: 'Branch hours v3' },
  access: { text: 'Select “Forgot password” on the sign-in page. We will send a one-time code to your registered phone. I cannot see or change your password.', source: 'Access help v2' },
  cards: { text: 'In the app, open Cards and choose “Activate” to activate a new card, or check its status there.', source: 'Cards v1' },
  txn: { text: 'Recent and pending transactions are under Accounts in the app. For questions about a specific payment, a colleague needs to verify your identity first.', source: 'Accounts help v2' },
  fees: { text: 'The standard monthly account fee is $5, waived with a $1,500 minimum balance (illustrative figures).', source: 'Fee schedule v4' }
}
export const TOPIC_CHIPS: { label: string; text: string }[] = [
  { label: 'Branch hours', text: 'What are the branch hours?' }, { label: 'Password reset', text: 'I need to reset my password' },
  { label: 'Card activation', text: 'How do I activate my card?' }, { label: 'Fees', text: 'What is the monthly fee?' }
]

export function detect(message: string): Intent | null {
  const t = message.toLowerCase()
  const hit = (i: Intent) => KEYS[i].some(k => t.includes(k))
  return ORDER.find(hit) ?? null
}

export interface Reply {
  intent: Intent | null; topic: string; kind: 'answer' | 'handoff' | 'clarify' | 'choices'
  text: string; reason: string; source?: string
  summary?: { asked: string; topic: string; why: string; assistant: string; next: string }
}

const HANDOFF_TEXT = { live: 'I’m connecting you with a colleague now. They can see a summary, so you won’t need to repeat yourself.', callback: 'I’ve asked a colleague to call you back at a time that suits you. They will have a summary, so you won’t need to repeat yourself.', branch: 'I can book a branch appointment with a specialist. They will have a summary, so you won’t need to repeat yourself.' }

export function respond(message: string, cases: PlannedCase[], input: PlanInput, unknownBefore: number): Reply {
  const intent = detect(message)
  const handoff = (topic: string, why: string, assistant = 'No answer given', next = 'Review the topic and continue the conversation'): Reply => ({
    intent, topic, kind: 'handoff', text: HANDOFF_TEXT[input.handoff], reason: why,
    summary: { asked: message, topic, why, assistant, next }
  })
  if (intent === 'person') return handoff('Request for a person', 'The customer asked for a person. This is always honoured.')
  if (!intent) {
    if (input.lowConf === 'person' || unknownBefore >= 1) return handoff('Unclear request', unknownBefore >= 1 ? 'Still not clear after one clarifying question.' : 'Not sure what the customer needs, and the bank’s rule is to hand over when unsure.', 'Could not identify the topic')
    if (input.lowConf === 'choices') return { intent, topic: 'Unclear request', kind: 'choices', text: 'I want to get this right. Is your question about one of these?', reason: 'Not sure what the customer needs, so the assistant offers approved topics.' }
    return { intent, topic: 'Unclear request', kind: 'clarify', text: 'I want to make sure I help with the right thing. Could you tell me a little more about what you need?', reason: 'Not sure what the customer needs. One clarifying question is allowed before a handoff.' }
  }
  const uc = USE_CASES.find(u => u.id === CASE_ID[intent])
  const topic = uc?.name ?? 'Request for a person'
  const planned = cases.find(c => c.id === uc?.id)
  if (planned?.phase === 'human') return handoff(topic, 'Sensitive topic: always handled by a person, whatever the assistant’s confidence.')
  if (planned?.phase === 2 || !APPROVED[intent]) return handoff(topic, 'Not in the pilot scope yet (phase 2), so a person handles it for now.', 'No answer given', 'Handle normally; this topic is planned for phase 2')
  const a = APPROVED[intent]!
  return { intent, topic, kind: 'answer', text: a.text, source: a.source, reason: `In pilot scope (phase 1) and answered only from approved content: ${a.source}.` }
}
