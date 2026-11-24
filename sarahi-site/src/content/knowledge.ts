/** Curated answers for the "Ask about me" assistant. Facts come from Sarahí's CV and this site. Nothing is generated. */
export interface Entry { id: string; q: string; keys: string[]; a: string; go?: [string, string] }

export const KB: Entry[] = [
  { id: 'who', q: 'Who is Sarahí?', keys: ['who', 'about', 'introduce', 'summary', 'background', 'tell me'], a: 'Sarahí Cruz Salazar combines banking experience from Citibanamex, hands-on work building AI-powered workflows at APOGEO, and operations experience in rolling out technology and training staff. She is applying for the Senior Associate, AI Consultant role.', go: ['#about', 'Start here'] },
  { id: 'bank', q: 'What banking experience does she have?', keys: ['bank', 'banking', 'citibanamex', 'treasury', 'fx', 'finance', 'financial', 'markets'], a: 'Three rotations at Citibanamex (Jul 2022 – Aug 2024) in markets treasury, FX and rates, and structured products sales. She resolved control exceptions across trading, sales, operations and risk, and built two internal control tools that saved 2+ hours daily.', go: ['#fit', 'Role fit'] },
  { id: 'ai', q: 'What has she built with AI?', keys: ['ai', 'build', 'built', 'apogeo', 'workflow', 'automation', 'api', 'openai', 'llm'], a: 'At APOGEO she builds AI-powered customer workflows connected to business systems, and document flows that turn photos and PDFs into validated data with human review. She also built a personal prototype that runs 50,000 made-up records through rules, AI, exception handling and human approval.', go: ['#prototype', 'Prototype'] },
  { id: 'saas', q: 'Does she have SaaS or customer-success experience?', keys: ['saas', 'customer success', 'success', 'years', 'tenure', 'experience', 'gap', 'weakness'], a: 'Not as a SaaS vendor customer-success title, and she says so plainly. Her relevant background is customer lifecycle systems at APOGEO, customer-facing operations in food service, and Salesforce CRM. She would close the gap by shadowing implementations and customer reviews in her first 30 days.', go: ['#fit', 'Role fit'] },
  { id: 'train', q: 'Has she trained people?', keys: ['train', 'training', 'teach', 'enablement', 'adoption', 'coach'], a: 'Yes: she trained staff during technology rollouts and coordinated handoffs so changes were adopted. The planner’s training step shows how she would plan this by role.', go: ['#adoption', 'Training and adoption'] },
  { id: 'impl', q: 'How does she approach implementation?', keys: ['implement', 'implementation', 'rollout', 'launch', 'deliver', 'project', 'budget', 'time'], a: 'In phases: an internal test, a limited pilot, expansion once a go / no-go gate is met, then broad release with a rehearsed rollback. The readiness step builds that checklist from the bank’s channels, risk appetite and content readiness.', go: ['#readiness', 'Launch readiness'] },
  { id: 'esc', q: 'How does she think about AI risk and escalation?', keys: ['risk', 'escalation', 'escalate', 'human', 'responsible', 'ethics', 'safe', 'safety', 'guardrails', 'hallucination'], a: 'Sensitive topics such as fraud, complaints and vulnerable customers always go to a person, by rule and not by the model’s confidence. The flow page lets you switch those rules off and shows why she would not recommend it.', go: ['#flow', 'Flow and escalation'] },
  { id: 'tool', q: 'What does the Rollout Planner do?', keys: ['planner', 'tool', 'rollout planner', 'how does', 'works', 'calculate', 'formula'], a: 'You describe a fictional bank: volume, staff, channels, risk appetite and content readiness. It ranks inquiry topics into pilot, phase 2, or always-human, builds a launch checklist and rollout waves, estimates training hours, and simulates impact. Everything is a transparent, deterministic calculation with no AI and no real data.', go: ['#profile', 'Open the planner'] },
  { id: 'metrics', q: 'Does she work with metrics?', keys: ['metrics', 'kpi', 'impact', 'power bi', 'data', 'report', 'dashboard', 'measure'], a: 'Yes: KPI and management reporting with Power BI and Excel (Power BI certified). The impact step shows every formula behind the simulated numbers, and labels them as assumptions.', go: ['#impact', 'Impact'] },
  { id: 'lang', q: 'Which languages does she speak?', keys: ['language', 'languages', 'spanish', 'english', 'french', 'speak', 'bilingual'], a: 'Spanish (native), English (advanced, TOEFL iBT 94) and French (DELF B2).' },
  { id: 'cert', q: 'What certifications does she hold?', keys: ['certification', 'certifications', 'certified', 'certificate', 'degree', 'education', 'stem', 'university'], a: 'Agentic AI, Power BI, Power BI for Data Analysts (Microsoft Press), RPA, Bloomberg Market Concepts, and AMIB Figure 3 and 5 (pending renewal). Degree: B.A. in Financial Management from Tecnológico de Monterrey, which is not a STEM degree.' },
  { id: 'prompt', q: 'Can she advise on prompt engineering?', keys: ['prompt', 'prompts', 'prompting', 'generative', 'genai', 'gpt'], a: 'She builds with the OpenAI API at APOGEO, but this site does not document prompt-engineering practice, so she does not claim it here. She would write a short client prompting guide during her first implementations.' },
  { id: 'presales', q: 'Has she done pre-sales?', keys: ['pre-sales', 'presales', 'sales', 'discovery', 'demo'], a: 'No formal SaaS pre-sales yet. At Citibanamex she supported sales and advisory teams with structured-product pricing and valuation reviews. She would shadow calls first and co-present before leading one.' },
  { id: 'glia', q: 'Is this affiliated with Glia?', keys: ['glia', 'affiliated', 'endorsed', 'official', 'employer'], a: 'No. This is an independent portfolio prepared for the role. It does not use Glia branding, content or interfaces, and Glia has not endorsed it.' },
  { id: 'real', q: 'Which parts are real and which are hypothetical?', keys: ['real', 'hypothetical', 'fake', 'invented', 'made-up', 'fictional', 'data', 'honest'], a: 'Background and role-fit proofs are real professional experience. The AI workflow prototype is a personal prototype on made-up data. The Rollout Planner and its bank are hypothetical, and its figures are assumptions, not results.' },
  { id: 'contact', q: 'How can I contact her?', keys: ['contact', 'email', 'reach', 'linkedin', 'hire', 'interview', 'talk'], a: 'Through LinkedIn or email, both listed at the bottom of the left menu.' }
]

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'does', 'do', 'she', 'her', 'sarahi', 'sarahí', 'has', 'have', 'what', 'how', 'can', 'and', 'of', 'to', 'in', 'on', 'for', 'with', 'about', 'me', 'it', 'this', 'that', 'any', 'did'])

export function answer(query: string): Entry | null {
  const text = query.toLowerCase()
  const words = text.split(/[^a-záéíóúñ0-9-]+/).filter(w => w && !STOP.has(w))
  let best: Entry | null = null, bestScore = 0
  for (const e of KB) {
    let s = 0
    for (const k of e.keys) {
      if (k.includes(' ')) { if (text.includes(k)) s += 3 } else if (words.includes(k)) { s += 2 } else if (words.some(w => w.length > 3 && (k.startsWith(w) || w.startsWith(k)))) { s += 1 }
    }
    if (s > bestScore) { bestScore = s; best = e }
  }
  return bestScore >= 2 ? best : null
}
