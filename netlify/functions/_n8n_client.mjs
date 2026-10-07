// Cliente servidor compartido para hablar con el orquestador n8n.
//
// Principio de arquitectura: el navegador NUNCA llama a n8n directamente. La URL
// del webhook de n8n y el secreto compartido viven solo como variables de
// entorno de Netlify (N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET), y este módulo es el
// único lugar que las lee. analyze-prospect.mjs y workflow-decision.mjs lo
// importan; el navegador solo ve el resultado ya validado y normalizado.
//
// Responsabilidades de este módulo:
//   - leer/validar la configuración (sin filtrar nunca la URL ni el secreto)
//   - POST al webhook con timeout y mapeo de TODOS los fallos a códigos estables
//   - validar y normalizar (whitelist) la respuesta de n8n antes de dársela al
//     navegador — una respuesta malformada se convierte en MALFORMED_RESPONSE,
//     nunca en una pantalla rota
import { LEADS_DEMO } from "./_clara_agent_shared.mjs";

export const SOURCE = "clara_growth_agent";
export const ANALYZE_ROUTES = ["NURTURE", "SDR_REVIEW", "AE_READY"];
export const FINAL_ROUTES = [...ANALYZE_ROUTES, "NEEDS_REVIEW", "OUTBOUND_READY"];
export const TRACE_STAGES = ["received", "crm_context", "scoring", "ai_analysis", "routing", "crm_update", "approval", "completed"];
export const TRACE_STATUSES = ["ok", "warn", "error", "skipped", "pending"];

// Mismos valores por defecto que CONFIG en public/index.html y que
// calcularScore() en _clara_agent_shared.mjs.
export const DEFAULT_SCORING = {
  pesos: { tamano: 30, dolor: 25, senales: 15 },
  tamano_min: 20, tamano_max: 1500,
  umbral_a: 75, umbral_b: 50,
};

export const KNOWN_LEADS = new Set(Object.keys(LEADS_DEMO));

// Debe producir el mismo id que idFor() en public/index.html.
export function slugify(nombre) {
  return String(nombre).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export class WorkflowError extends Error {
  constructor(code, message, httpStatus = 502) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extraHeaders },
  });
}

export function errorResponse(err) {
  if (err instanceof WorkflowError) {
    return json(err.httpStatus, { ok: false, error: { code: err.code, message: err.message, fallbackAvailable: true } });
  }
  // Nunca devolver el stack ni el mensaje crudo de un error inesperado.
  return json(500, { ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected error in the Clara backend function.", fallbackAvailable: true } });
}

// ---------------------------------------------------------------- config
export function readConfig() {
  const rawUrl = (process.env.N8N_WEBHOOK_URL || "").trim();
  const timeout = Number(process.env.N8N_TIMEOUT_MS);
  return {
    url: rawUrl,
    secret: (process.env.N8N_WEBHOOK_SECRET || "").trim(),
    timeoutMs: Number.isFinite(timeout) && timeout >= 1000 && timeout <= 60000 ? timeout : 25000,
    // Por defecto SOLO LECTURA: n8n no escribe en HubSpot a menos que esto sea "true".
    writeback: String(process.env.HUBSPOT_WRITEBACK || "").trim().toLowerCase() === "true",
  };
}

function parseWebhookUrl(raw) {
  if (!raw) throw new WorkflowError("N8N_NOT_CONFIGURED", "N8N_WEBHOOK_URL is not set on this site.", 503);
  let u;
  try { u = new URL(raw); } catch {
    throw new WorkflowError("N8N_NOT_CONFIGURED", "N8N_WEBHOOK_URL is not a valid URL.", 503);
  }
  const isLocal = u.hostname === "localhost" || u.hostname === "127.0.0.1";
  if (u.protocol !== "https:" && !(u.protocol === "http:" && isLocal)) {
    throw new WorkflowError("N8N_NOT_CONFIGURED", "N8N_WEBHOOK_URL must use https.", 503);
  }
  return u.toString();
}

export function publicStatus() {
  const cfg = readConfig();
  let configured = false;
  try { parseWebhookUrl(cfg.url); configured = true; } catch { /* no configurado */ }
  return {
    n8nConfigured: configured,
    n8nAuth: Boolean(cfg.secret),
    writeback: cfg.writeback,
    llmConfigured: Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
    llmProvider: process.env.ANTHROPIC_API_KEY && String(process.env.LLM_PROVIDER || "").toLowerCase() !== "openai" ? "Anthropic" : process.env.OPENAI_API_KEY ? "OpenAI" : null,
    timeoutMs: cfg.timeoutMs,
  };
}

export function sanitizeScoringConfig(raw) {
  const d = DEFAULT_SCORING;
  const num = (v, min, max, def) => {
    if (v === null || v === undefined || v === "") return def;
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
  };
  const r = raw && typeof raw === "object" ? raw : {};
  const p = r.pesos && typeof r.pesos === "object" ? r.pesos : {};
  return {
    pesos: {
      tamano: num(p.tamano, 0, 50, d.pesos.tamano),
      dolor: num(p.dolor, 0, 50, d.pesos.dolor),
      senales: num(p.senales, 0, 30, d.pesos.senales),
    },
    tamano_min: num(r.tamano_min, 0, 200, d.tamano_min),
    tamano_max: num(r.tamano_max, 200, 5000, d.tamano_max),
    umbral_a: num(r.umbral_a, 40, 100, d.umbral_a),
    umbral_b: num(r.umbral_b, 0, 80, d.umbral_b),
  };
}

// ----------------------------------------------------------------- transport
export async function postToN8n(payload) {
  const cfg = readConfig();
  const url = parseWebhookUrl(cfg.url);

  const headers = { "content-type": "application/json", accept: "application/json" };
  if (cfg.secret) headers["x-clara-secret"] = cfg.secret;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  let res, text;
  try {
    res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal: controller.signal });
    text = await res.text();
  } catch (err) {
    if (err && err.name === "AbortError") {
      throw new WorkflowError("N8N_TIMEOUT", `n8n did not answer within ${Math.round(cfg.timeoutMs / 1000)}s.`, 504);
    }
    // Sin err.message: podría incluir el hostname de la URL del webhook.
    const reason = err && err.cause && err.cause.code ? ` (${err.cause.code})` : "";
    throw new WorkflowError("N8N_UNREACHABLE", `Could not reach the n8n webhook${reason}.`, 502);
  } finally {
    clearTimeout(timer);
  }

  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = null; }

  if (res.status === 401 || res.status === 403) {
    throw new WorkflowError("N8N_AUTH_FAILED", "n8n rejected the request (check N8N_WEBHOOK_SECRET and the webhook's Header Auth credential).", 502);
  }
  if (res.status === 404 && !(body && body.error)) {
    throw new WorkflowError("N8N_WORKFLOW_NOT_FOUND", "n8n has no active webhook at that URL (is the workflow published/active?).", 502);
  }
  // n8n puede responder un error estructurado (ver nodo "Respond: invalid request").
  if (body && body.ok === false && body.error) {
    const code = typeof body.error.code === "string" ? body.error.code.slice(0, 40).toUpperCase().replace(/[^A-Z_]/g, "_") : "N8N_WORKFLOW_ERROR";
    throw new WorkflowError(code, String(body.error.message || "The n8n workflow reported an error.").slice(0, 300), 502);
  }
  if (!res.ok) {
    throw new WorkflowError("N8N_HTTP_ERROR", `n8n answered HTTP ${res.status}.`, 502);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new WorkflowError("MALFORMED_RESPONSE", "n8n answered with a body that is not a JSON object.", 502);
  }
  return body;
}

// ------------------------------------------------------------- normalizers
// Errores que n8n reenvía de servicios upstream a veces son una página HTML entera
// (p. ej. el 404 de Netlify). Nunca llegan así a la UI: se reducen a una línea.
const errStr = (v, max = 300) => {
  if (v === null || v === undefined) return null;
  const t = String(v);
  if (/<\s*(!doctype|html|head|body|div|svg)/i.test(t)) {
    const code = t.match(/^\s*(\d{3})\b/);
    return code ? `Upstream service answered HTTP ${code[1]} (non-JSON error page)` : "Upstream service returned a non-JSON error page";
  }
  return t.slice(0, max);
};
const str = (v, max = 600) => (v === null || v === undefined ? null : String(v).slice(0, max));
const num = (v) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
const list = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);
const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);
const oneOf = (v, allowed, def) => (allowed.includes(v) ? v : def);

export function normalizeAnalyzeResult(raw) {
  const icp = obj(raw.icp);
  const routing = obj(raw.routing);
  const score = icp ? num(icp.score) : null;
  if (score === null || score < 0 || score > 100 || !routing || !ANALYZE_ROUTES.includes(routing.route)) {
    throw new WorkflowError("MALFORMED_RESPONSE", "n8n answered, but the result is missing a valid ICP score or routing decision.", 502);
  }

  const crm = obj(raw.crm) || {};
  const wb = obj(crm.writeback) || {};
  const owner = obj(crm.owner);
  const eng = obj(crm.engagement);
  const llm = obj(raw.llm) || { status: "skipped" };
  const exec = obj(raw.execution) || {};

  return {
    icp: {
      score: Math.round(score),
      qualified: Boolean(icp.qualified),
      qualifyThreshold: num(icp.qualifyThreshold),
      highThreshold: num(icp.highThreshold),
      breakdown: list(icp.breakdown, 10).map((b) => ({ factor: str(b && b.factor, 80), points: num(b && b.points), max: num(b && b.max), reason: str(b && b.reason, 300) })),
      context: list(icp.context, 10).map((c) => ({ label: str(c && c.label, 60), value: str(c && c.value, 120), note: str(c && c.note, 200) })),
    },
    crm: {
      source: oneOf(crm.source, ["hubspot", "simulated"], "hubspot"),
      status: oneOf(crm.status, ["verified", "not_found", "unavailable", "simulated"], "unavailable"),
      found: Boolean(crm.found),
      companyId: str(crm.companyId, 40),
      lifecycleStage: str(crm.lifecycleStage, 60),
      leadStatus: str(crm.leadStatus, 60),
      owner: owner ? { id: str(owner.id, 40), name: str(owner.name, 120), email: str(owner.email, 160) } : null,
      engagement: eng ? { contactedNotes: num(eng.contactedNotes), lastContacted: str(eng.lastContacted, 40) } : null,
      error: errStr(crm.error),
      writeback: {
        attempted: Boolean(wb.attempted),
        updated: Boolean(wb.updated),
        fields: list(wb.fields, 12).map((f) => str(f, 60)),
        reason: str(wb.reason, 300),
        error: errStr(wb.error),
      },
    },
    llm: {
      status: oneOf(llm.status, ["ok", "skipped", "error"], "error"),
      reason: str(llm.reason, 700),
      outreachAngle: str(llm.outreachAngle, 500),
      recommendedAction: str(llm.recommendedAction, 400),
      summary: str(llm.summary, 900),
      subject: str(llm.subject, 200),
      channel: str(llm.channel, 30),
      confidence: str(llm.confidence, 20),
      model: str(llm.model, 60),
      estimatedCostUsd: num(llm.estimatedCostUsd),
      totalTokens: num(llm.totalTokens),
      skippedReason: str(llm.skippedReason, 300),
      error: errStr(llm.error),
    },
    routing: {
      route: routing.route,
      rationale: str(routing.rationale, 500),
      rulesFired: list(routing.rulesFired, 8).map((r) => str(r, 240)),
      requiresApproval: Boolean(routing.requiresApproval),
      recommendedAction: str(routing.recommendedAction, 400),
    },
    trace: list(raw.trace, 40).map((t) => ({
      stage: oneOf(t && t.stage, TRACE_STAGES, "completed"),
      event: str(t && t.event, 120),
      status: oneOf(t && t.status, TRACE_STATUSES, "ok"),
      detail: str(t && t.detail, 400),
      ts: str(t && t.ts, 40),
    })),
    execution: {
      id: str(exec.id, 60),
      durationMs: num(exec.durationMs),
      startedAt: str(exec.startedAt, 40),
      finishedAt: str(exec.finishedAt, 40),
      workflow: str(exec.workflow, 80),
    },
  };
}

export function normalizeDecisionResult(raw) {
  const hs = obj(raw.hubspot) || {};
  const final = raw.finalRoute;
  if (!FINAL_ROUTES.includes(final)) {
    throw new WorkflowError("MALFORMED_RESPONSE", "n8n answered, but the decision result has no valid route.", 502);
  }
  return {
    finalRoute: final,
    hubspot: {
      attempted: Boolean(hs.attempted),
      updated: Boolean(hs.updated),
      fields: list(hs.fields, 12).map((f) => str(f, 60)),
      reason: str(hs.reason, 300),
      error: errStr(hs.error),
    },
    executionId: str(raw.executionId, 60),
  };
}
