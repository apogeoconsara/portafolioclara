import { TOPICS, briefPrompt, classifyPrompt, phrasePrompt } from './_prompts.mjs'

/**
 * Thin, locked-down proxy to the Claude API. The key stays on the server (ANTHROPIC_API_KEY).
 * Three fixed modes only; inputs are length-limited; a best-effort per-IP limit applies.
 */
const API = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com') + '/v1/messages'
const FAST = process.env.AI_MODEL_FAST || 'claude-haiku-5-5'
const SMART = process.env.AI_MODEL_SMART || 'claude-sonnet-5-5'
const LIMIT = Number(process.env.AI_RATE_LIMIT || 30) // requests per IP per 10 minutes
const hits = new Map()

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
const clean = s => s.replace(/[<>]/g, ' ')
const limited = ip => {
  const now = Date.now(); const arr = (hits.get(ip) || []).filter(t => now - t < 600000)
  if (arr.length >= LIMIT) return true
  arr.push(now); hits.set(ip, arr); return false
}
async function ask(model, system, user, max) {
  const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model, max_tokens: max, system, messages: [{ role: 'user', content: user }] }) })
  if (!r.ok) throw new Error('upstream ' + r.status)
  const j = await r.json()
  return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim()
}
const str = (v, max) => (typeof v === 'string' && v.trim().length > 0 && v.length <= max ? v.trim() : null)

export default async (req, context) => {
  if (req.method === 'GET') return json({ ai: Boolean(process.env.ANTHROPIC_API_KEY) })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 503)
  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown'
  if (limited(ip)) return json({ error: 'rate_limited' }, 429)
  let body
  try { body = await req.json() } catch { return json({ error: 'bad_json' }, 400) }
  try {
    if (body?.mode === 'classify') {
      const m = str(body.message, 400); if (!m) return json({ error: 'bad_input' }, 400)
      const t = await ask(FAST, classifyPrompt(), `<customer_message>${clean(m)}</customer_message>`, 40)
      const found = (t.match(/"topic"\s*:\s*"([a-z]+)"/) || [])[1]
      return json({ topic: TOPICS.includes(found) ? found : 'none' })
    }
    if (body?.mode === 'phrase') {
      const m = str(body.message, 400), a = str(body.approved, 600); if (!m || !a) return json({ error: 'bad_input' }, 400)
      return json({ reply: await ask(FAST, phrasePrompt(a), `<customer_message>${clean(m)}</customer_message>`, 160) })
    }
    if (body?.mode === 'brief') {
      const p = str(body.plan, 3000); if (!p) return json({ error: 'bad_input' }, 400)
      return json({ text: await ask(SMART, briefPrompt(), `<plan>${clean(p)}</plan>`, 450) })
    }
    return json({ error: 'bad_mode' }, 400)
  } catch {
    return json({ error: 'upstream_error' }, 502)
  }
}
