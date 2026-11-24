/**
 * Questions a bank's team asks about applied AI in customer service, answered the way a consultant would.
 * General practice, not claims about any vendor's product. Nothing here promises results or gives legal advice.
 */
export type Group = 'How AI works' | 'Trust and accuracy' | 'Risk and data' | 'People and results'
export const GROUPS: Group[] = ['How AI works', 'Trust and accuracy', 'Risk and data', 'People and results']
export interface QA { id: string; group: Group; q: string; short: string; more: string[]; show?: { label: string; href: string }; keys: string[] }

export const QAS: QA[] = [
  { id: 'llm', group: 'How AI works', q: 'What is a large language model, in plain words?', keys: ['llm', 'language model', 'generative', 'gpt', 'how does ai work', 'what is ai', 'model'],
    short: 'It is software trained on huge amounts of text to predict which words should come next. That makes it fluent and flexible, but it is not a database of verified facts.',
    more: ['Good at: understanding messy requests, rephrasing, summarising, and working across languages.', 'Not good at: knowing your bank’s current fees or policies, or being exact every time, unless it is given the facts.', 'That is why customer-service AI is built around approved content, not around what the model remembers.'], show: { label: 'See the assistant use approved content', href: '#design' } },
  { id: 'rules', group: 'How AI works', q: 'What is the difference between a rules-based chatbot and generative AI?', keys: ['rules', 'chatbot', 'script', 'difference', 'rule-based', 'generative', 'flow'],
    short: 'A rules-based bot follows a fixed script: predictable but rigid. Generative AI understands free-form language: flexible but it needs guardrails.',
    more: ['Rules are exact and easy to audit, but break when customers phrase things differently.', 'Generative AI handles variety and other languages, but can be wrong or drift.', 'Banks usually combine them: rules for anything sensitive, AI to understand and phrase, approved content for the facts. The assistant on this site works that way.'], show: { label: 'Try the assistant', href: '#design' } },
  { id: 'grounding', group: 'How AI works', q: 'What does “answer only from approved content” mean?', keys: ['grounding', 'approved', 'content', 'source', 'knowledge base', 'ground'],
    short: 'The assistant is given the bank’s approved answer for a topic and may only rephrase it. If that text does not answer the question, it hands over to a person.',
    more: ['Approved content is written, owned and versioned by the bank.', 'A check rejects any reply that adds facts or numbers that are not in that text.', 'Updating an answer means updating the content, not retraining anything.'], show: { label: 'See the safety checks', href: '#design' } },
  { id: 'prompt', group: 'How AI works', q: 'What is prompt engineering?', keys: ['prompt', 'prompting', 'instructions', 'engineering', 'system prompt'],
    short: 'Writing the instructions that tell the model who it is, what sources it may use, what it must never do, and how to answer.',
    more: ['Good prompts are specific: role, allowed sources, boundaries, escalation rules, format and tone.', 'They are tested against a fixed set of real questions, versioned, and changed one block at a time.', 'A prompt alone is not a safety system: sensitive topics are also routed by rules outside the model.'], show: { label: 'See a real prompt', href: '#design' } },

  { id: 'hallucinate', group: 'Trust and accuracy', q: 'Will the AI make things up?', keys: ['hallucinate', 'hallucination', 'make things up', 'wrong', 'invent', 'accurate', 'accuracy', 'guarantee', 'fabricate'],
    short: 'It can, which is why the design never relies on the model’s memory. Answers come from approved text, replies are checked, and anything uncertain goes to a person.',
    more: ['Sensitive topics never reach the model.', 'A grounding check rejects replies that add facts or numbers.', 'I would not promise “never wrong”. I would promise a way to catch, correct and learn from mistakes.'], show: { label: 'Watch a reply get checked', href: '#design' } },
  { id: 'wrong', group: 'Trust and accuracy', q: 'What happens when it gives a wrong answer?', keys: ['wrong answer', 'mistake', 'error', 'fix', 'correct', 'incorrect', 'complaint'],
    short: 'You need to catch it, fix the source, and prevent a repeat. A person can always take over.',
    more: ['Catch: weekly sampling of conversations, “not solved” signals, complaints.', 'Fix: correct the approved content and change one thing at a time, so the effect is clear.', 'Own: every topic has a named content owner.'], show: { label: 'See signal-to-action', href: '#optimize' } },
  { id: 'verify', group: 'Trust and accuracy', q: 'How do we know it is accurate before launch?', keys: ['test', 'testing', 'before launch', 'verify', 'quality', 'acceptance', 'pilot', 'validate'],
    short: 'Test it on a fixed set of real questions, agree the pass mark in advance, and launch only when the must-have checks are met.',
    more: ['The test set includes tricky and hostile messages.', 'Pilot with one team and a few low-risk topics.', 'A go / conditional / no-go gate, with must-haves that nothing else can offset.'], show: { label: 'See the launch checklist', href: '#implement' } },

  { id: 'compliance', group: 'Risk and data', q: 'Is this compliant with banking regulation?', keys: ['compliance', 'regulation', 'regulatory', 'legal', 'audit', 'regulator', 'governance', 'risk'],
    short: 'Compliance is the bank’s call, so the compliance team joins from the start. The design makes their job easier: sensitive topics always go to a person and decisions are logged.',
    more: ['I would first ask which topics must never be automated, and what must be recorded.', 'Nothing here is legal advice; requirements depend on the bank’s jurisdiction and policies.'], show: { label: 'See the escalation rules', href: '#design' } },
  { id: 'data', group: 'Risk and data', q: 'What customer data does the AI see?', keys: ['data', 'privacy', 'personal', 'pii', 'security', 'stored', 'training on', 'retention', 'confidential'],
    short: 'As little as possible. Most topics need only the customer’s question and approved text; account details come from read-only lookups after identity verification.',
    more: ['Ask any vendor: is our data used to train models, where is it stored, how long is it kept?', 'Customer text is treated as data, never as instructions.', 'The details depend on the setup and the bank’s own security review.'], show: { label: 'See the must-have checks', href: '#implement' } },
  { id: 'inject', group: 'Risk and data', q: 'Can customers trick the assistant?', keys: ['trick', 'jailbreak', 'injection', 'attack', 'manipulate', 'hack', 'abuse', 'prompt injection'],
    short: 'People will try. The defence is layered: guardrails outside the model, limited permissions, and testing with hostile messages before launch.',
    more: ['Customer messages are treated as data, never as instructions.', 'The assistant can only read approved content; it cannot change accounts.', 'Rules decide sensitive topics even if the model is fooled.'], show: { label: 'Try to break it', href: '#design' } },

  { id: 'replace', group: 'People and results', q: 'Will this replace our agents?', keys: ['replace', 'jobs', 'agents', 'headcount', 'staff', 'layoff', 'workforce', 'job'],
    short: 'It changes the work more than it removes it: routine questions are handled automatically, and agents spend their time on cases that need judgment, with a summary of what already happened.',
    more: ['Staffing decisions belong to the bank. I would not promise headcount outcomes.', 'Agents need training on handoffs; without it, customers feel the assistant made things worse.'], show: { label: 'See the training plan', href: '#adopt' } },
  { id: 'adoption', group: 'People and results', q: 'How do we get staff and customers to use it?', keys: ['adoption', 'adopt', 'use it', 'training', 'train', 'change management', 'enablement', 'resistance'],
    short: 'Plan adoption by role, make talking to a person easy, and track a few simple signals.',
    more: ['Agents: read the summary and take over without re-asking.', 'Team leads: raise bad answers for correction.', 'Branch staff: explain what the assistant can and cannot do.', 'Signals: handoffs where nobody repeated themselves, corrections closed, adoption by branch.'], show: { label: 'See the training plan', href: '#adopt' } },
  { id: 'results', group: 'People and results', q: 'What results can we expect?', keys: ['results', 'roi', 'expect', 'savings', 'benefit', 'impact', 'outcome', 'return'],
    short: 'Until a pilot measures the bank’s real baseline, any figure is an estimate from assumptions. I show the formula, not a promise.',
    more: ['The levers: share of customers who choose the assistant, share solved alone, share handed over, time per inquiry.', 'The impact page on this site is hypothetical for exactly that reason.'], show: { label: 'See the impact estimate', href: '#optimize' } },
  { id: 'metrics', group: 'People and results', q: 'Which metrics should we track?', keys: ['metrics', 'kpi', 'measure', 'track', 'monitor', 'monitoring', 'performance', 'csat'],
    short: 'Solved without a person (confirmed by the customer), handoffs by topic, customers giving up, and the satisfaction gap between assistant and person.',
    more: ['Count a chat as solved only when the customer confirms.', 'Review handoffs by topic: a spike usually means missing or outdated content.', 'Watch adoption by team and channel.'], show: { label: 'See what to watch', href: '#optimize' } },
  { id: 'timeline', group: 'People and results', q: 'How long does an implementation take?', keys: ['how long', 'timeline', 'time', 'duration', 'schedule', 'weeks', 'months', 'implementation', 'rollout'],
    short: 'It depends mainly on how ready the answers and integrations are, so I plan by gates, not dates.',
    more: ['Internal test, pilot, expand, broad release, each with a go / no-go.', 'Dates come after discovery shows the content and integration work.'], show: { label: 'See the rollout waves', href: '#implement' } }
]

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'does', 'do', 'it', 'we', 'our', 'can', 'will', 'what', 'how', 'to', 'of', 'in', 'on', 'for', 'and', 'with', 'about', 'this', 'that', 'my', 'you', 'i', 'be', 'if', 'ai'])

/** Rank prepared answers for a free-text question. Deterministic keyword overlap. */
export function findQA(question: string, n = 3): QA[] {
  const t = question.toLowerCase()
  const words = t.split(/[^a-z0-9-]+/).filter(w => w && !STOP.has(w))
  return QAS.map(e => {
    let s = 0
    for (const k of e.keys) { if (k.includes(' ')) { if (t.includes(k)) s += 3 } else if (words.includes(k)) { s += 2 } else if (words.some(w => w.length > 3 && (k.startsWith(w) || w.startsWith(k)))) { s += 1 } }
    for (const w of words) if (w.length > 3 && e.q.toLowerCase().includes(w)) s += 1
    return { e, s }
  }).filter(x => x.s >= 2).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.e)
}
