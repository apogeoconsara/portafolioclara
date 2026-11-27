export type Channel = 'chat' | 'voice' | 'messaging'
export type Handoff = 'live' | 'callback' | 'branch'
export type LowConf = 'person' | 'clarify' | 'choices'
export interface Options { channel: Channel; handoff: Handoff; lowConf: LowConf }
export const DEFAULT_OPTIONS: Options = { channel: 'chat', handoff: 'live', lowConf: 'person' }

const CH_SUB: Record<Channel, string> = { chat: 'web / app chat', voice: 'phone · voice AI', messaging: 'WhatsApp / SMS' }
const HO_SUB: Record<Handoff, string[]> = {
  live: ['joins now,', 'with summary'], callback: ['calls back,', 'with summary'], branch: ['branch visit booked,', 'with summary']
}
const LC_LABEL: Record<LowConf, string[]> = {
  person: ['No / low confidence'], clarify: ['Low confidence:', 'clarify once, else person'], choices: ['Low confidence: offer', 'choices, else person']
}

export type NodeId = 'inq' | 'risk' | 'dec' | 'ai' | 'done' | 'human' | 'review'

const GOLD = '#239C94', NAVY = '#0B1B33', SLATE = '#4A5F82'

export default function FlowDiagram({ active, options = DEFAULT_OPTIONS }: { active: NodeId[]; options?: Options }) {
  const on = (id: NodeId) => active.includes(id)
  const box = (id: NodeId, x: number, y: number, w: number, h: number, l1: string, l2?: string) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={on(id) ? NAVY : '#FBF9F4'} stroke={on(id) ? NAVY : '#B9C0CB'} strokeWidth={1.5} style={{ transition: 'fill .4s, stroke .4s' }} />
      <text x={x + w / 2} y={y + h / 2 + (l2 ? -4 : 5)} textAnchor="middle" fontSize={13} fontWeight={600} fill={on(id) ? '#F6F2E9' : NAVY}>{l1}</text>
      {l2 && <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize={11} fill={on(id) ? '#CDD2DA' : SLATE}>{l2}</text>}
    </g>
  )
  const edge = (d: string, o: { gold?: boolean; dash?: boolean } = {}) => (
    <path d={d} fill="none" stroke={o.gold ? GOLD : SLATE} strokeWidth={o.gold ? 2.2 : 1.6} strokeDasharray={o.dash ? '5 5' : undefined} markerEnd={`url(#${o.gold ? 'ah-g' : 'ah'})`} />
  )
  const t = (x: number, y: number, s: string, gold = false, anchor: 'start' | 'middle' | 'end' = 'start') =>
    <text x={x} y={y} fontSize={11} fill={gold ? '#17706B' : SLATE} textAnchor={anchor} fontWeight={gold ? 600 : 400}>{s}</text>
  return (
    <svg viewBox="0 0 960 400" role="img" className="h-auto w-full"
      aria-label="Process flow. A customer inquiry goes through an intent and risk check. Sensitive topics, low confidence, or a request for a person go to a human agent with a conversation summary. Other inquiries are answered by the assistant from approved sources, then logged. All outcomes feed a review step that improves the system.">
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill={SLATE} /></marker>
        <marker id="ah-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill={GOLD} /></marker>
      </defs>
      {edge('M170 180H230')}{edge('M390 180H450')}
      {edge('M520 130V72H600')}{t(530, 100, 'Yes')}
      {edge('M520 230V270H600', { gold: true })}{LC_LABEL[options.lowConf].map((l, k) => t(512, 258 + k * 14, l, true, 'end'))}
      {edge('M770 72H800')}
      {edge('M685 104V250', { gold: true })}{t(693, 180, 'Customer can ask for', true)}{t(693, 194, 'a person at any time', true)}
      {edge('M310 210V300H600', { gold: true })}{t(318, 320, 'Fraud · complaint · vulnerable customer ·', true)}{t(318, 334, 'asks for a person → always human', true)}
      {edge('M700 314V372H95V366')}{edge('M870 104V372H700')}
      {edge('M95 310V210', { dash: true })}{t(105, 262, 'Lessons feed', false)}{t(105, 276, 'back into design')}
      {box('inq', 20, 150, 150, 60, 'Customer inquiry', CH_SUB[options.channel])}
      {box('risk', 230, 150, 160, 60, 'Intent & risk check', 'topic · sensitivity')}
      <g>
        <path d="M520 130L590 180L520 230L450 180Z" fill={on('dec') ? NAVY : '#FBF9F4'} stroke={on('dec') ? NAVY : '#B9C0CB'} strokeWidth={1.5} style={{ transition: 'fill .4s' }} />
        <text x={520} y={177} textAnchor="middle" fontSize={12} fontWeight={600} fill={on('dec') ? '#F6F2E9' : NAVY}>In scope &amp;</text>
        <text x={520} y={193} textAnchor="middle" fontSize={12} fontWeight={600} fill={on('dec') ? '#F6F2E9' : NAVY}>confident?</text>
      </g>
      {box('ai', 600, 40, 170, 64, 'AI assistant', 'approved sources only')}
      {box('done', 800, 40, 140, 64, 'Resolved & logged')}
      {box('human', 600, 250, 200, 64, options.handoff === 'live' ? 'Human agent' : options.handoff === 'callback' ? 'Callback by an agent' : 'Branch specialist', HO_SUB[options.handoff].join(' '))}
      {box('review', 20, 310, 150, 56, 'Review outcomes', 'and improve')}
    </svg>
  )
}
