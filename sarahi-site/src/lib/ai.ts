import { useEffect, useState } from 'react'

const URL = '/.netlify/functions/claude'

/** Is the Claude proxy deployed and configured? False in previews and local dev without a key. */
export async function aiAvailable(): Promise<boolean> {
  try { const r = await fetch(URL); if (!r.ok) return false; return (await r.json()).ai === true } catch { return false }
}
export async function aiPost<T>(body: Record<string, string>): Promise<T | null> {
  try { const r = await fetch(URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); return r.ok ? ((await r.json()) as T) : null } catch { return null }
}
export function useAI(): 'checking' | 'on' | 'off' {
  const [s, setS] = useState<'checking' | 'on' | 'off'>('checking')
  useEffect(() => { let live = true; aiAvailable().then(ok => live && setS(ok ? 'on' : 'off')); return () => { live = false } }, [])
  return s
}

const nums = (s: string) => (s.match(/\d[\d.,:]*/g) || []).map(n => n.replace(/[.,:]+$/, ''))
/** A model reply is accepted only if it is short, not a handoff signal, and adds no numbers beyond the approved text. */
export function groundedOK(reply: string, approved: string): boolean {
  if (!reply || /^HANDOFF\b/i.test(reply) || reply.length > 400) return false
  const allowed = new Set(nums(approved))
  return nums(reply).every(n => allowed.has(n))
}
