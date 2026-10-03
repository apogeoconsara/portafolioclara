// Netlify Function — Lifecycle Copilot (extensión del flujo Nurture).
//
//   GET  → estado de las integraciones del copiloto (solo booleanos; nunca llaves ni correos).
//   POST action:"analyze"   → check de audiencia DETERMINÍSTICO + estrategia/borrador de Claude.
//          action:"draft"     → solo un borrador nuevo (Claude).
//          action:"send_test" → envío de PRUEBA a Customer.io, solo si pasan TODAS las guardas.
//
// Reglas que este archivo hace cumplir (el LLM no participa en ninguna):
//   - La elegibilidad la calcula _lifecycle_rules.mjs; Claude nunca la ve ni la modifica.
//   - Enviar es imposible con CUSTOMERIO_SEND_ENABLED != "true".
//   - El único destino posible es un correo de CUSTOMERIO_TEST_ALLOWLIST (jamás las empresas del portafolio).
//   - No existe ninguna ruta de envío "de producción" en este archivo.
//   - El servidor recalcula la elegibilidad contra Customer.io antes de enviar; no confía en lo que diga el navegador.
import { buscarLead } from "./_clara_agent_shared.mjs";
import { KNOWN_LEADS, WorkflowError, json, errorResponse } from "./_n8n_client.mjs";
import { readCioConfig, cioPublicStatus, pingCio, lookupProfile, simulatedProfile, sendTestEmail } from "./_customerio_client.mjs";
import {
  evaluateAudience, evaluateSendGate, fallbackStrategy, sanitizeStrategy, textToHtml, isValidEmail, normalizeEmail,
} from "./_lifecycle_rules.mjs";

const MODEL = "claude-haiku-4-5";
const PRICE_IN = 1.0, PRICE_OUT = 5.0; // USD por 1M de tokens (solo para mostrar un costo estimado)
const MAX_BODY_CHARS = 6000;
const LLM_TIMEOUT_MS = 20000;
const STAGES = new Set(["subscriber", "lead", "marketingqualifiedlead", "salesqualifiedlead", "opportunity", "customer", "evangelist", "other"]);
const CRM_STATUSES = new Set(["verified", "not_found", "unavailable", "simulated"]);
const sendLog = []; // marcas de tiempo de envíos de prueba (tope por instancia)
const SEND_CAP_PER_HOUR = 10;

const SYSTEM_PROMPT = `Eres el Lifecycle Copilot de Clara, una fintech que ofrece tarjetas corporativas y pagos internacionales para PyMEs y empresas medianas de LatAm. Recibes un hecho público sobre una empresa (investigada con Clay) que un sistema determinístico ya enrutó a Nurture. Tu trabajo: (1) recomendar UNA jornada de Customer.io entre Activation, Education, Reactivation o Expansion, (2) explicar en 1-2 frases por qué, y (3) redactar un correo breve y útil de nurture (no de venta dura).
Reglas estrictas: NO decides si se puede enviar un correo ni opinas sobre suscripción, supresión, frecuencia o elegibilidad: eso lo decide otro sistema. No inventes datos, cifras, clientes ni resultados que no se te dieron. Distingue hechos públicos de inferencias. No prometas descuentos ni plazos. Sin saludos con nombre de persona (no hay contactos individuales): usa "Hola," genérico. No uses llaves { } ni código de plantilla. Firma: "Equipo Clara". Es un ejercicio de portafolio: ninguna empresa fue contactada.
Responde ÚNICAMENTE con JSON válido, sin texto fuera del JSON:
{"journey":"Activation|Education|Reactivation|Expansion","rationale":"1-2 frases","subject":"asunto de máximo 70 caracteres","body":"cuerpo de 70-120 palabras en párrafos cortos separados por línea en blanco","confidence":"alta|media|baja"}`;

function parseBody(raw) {
  if (raw.length > MAX_BODY_CHARS) throw new WorkflowError("INVALID_REQUEST", "Request body too large.", 413);
  try { return JSON.parse(raw); } catch { throw new WorkflowError("INVALID_REQUEST", "Invalid JSON body.", 400); }
}

function cleanCtx(b) {
  const crm = b.crm && typeof b.crm === "object" ? b.crm : {};
  const stage = typeof crm.lifecycleStage === "string" ? crm.lifecycleStage.toLowerCase().trim() : null;
  const last = typeof crm.lastContacted === "string" && !Number.isNaN(Date.parse(crm.lastContacted)) ? crm.lastContacted : null;
  return {
    crmStatus: CRM_STATUSES.has(crm.status) ? crm.status : "unavailable",
    lifecycleStage: stage && STAGES.has(stage) ? stage : null,
    hubspotLastContacted: last,
    contactedNotes: Math.min(1000, Math.max(0, Math.round(Number(crm.contactedNotes) || 0))),
    score: Math.min(100, Math.max(0, Math.round(Number(b.score) || 0))),
    lang: b.lang === "en" ? "en" : "es",
  };
}

function templatedDraft(strategy, lead, lang) {
  const en = lang === "en";
  const topic = {
    Activation: en ? "how finance teams cut the manual work of international payments" : "cómo los equipos de finanzas reducen el trabajo manual de los pagos internacionales",
    Education: en ? "a practical guide to managing multi-currency payments" : "una guía práctica para gestionar pagos en varias monedas",
    Reactivation: en ? "what has changed since we last talked" : "qué ha cambiado desde la última vez que hablamos",
    Expansion: en ? "ways to get more out of what you already use" : "formas de sacar más provecho de lo que ya usas",
  }[strategy.journey];
  return en
    ? { subject: "A simpler way to manage company expenses", body: `Hello,\n\nWe are sharing ${topic}, based on what is publicly known about ${lead.nombre}.\n\nIf it is useful, reply and we will send more material. No commitment.\n\nClara Team` }
    : { subject: "Una forma más simple de gestionar los gastos de tu empresa", body: `Hola,\n\nQueremos compartirte ${topic}, a partir de lo que se sabe públicamente de ${lead.nombre}.\n\nSi te sirve, responde este correo y te enviamos más material. Sin compromiso.\n\nEquipo Clara` };
}

async function callClaude(lead, ctx) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { status: "unavailable", error: "ANTHROPIC_API_KEY not configured" };
  const user = JSON.stringify({
    empresa: { nombre: lead.nombre, industria: lead.industria, empleados: lead.empleados, pais: lead.pais, dolor_actual_hipotesis: lead.dolor_actual, senales_publicas: lead.senales_compra },
    ruta: "NURTURE", score_icp: ctx.score, etapa_lifecycle_crm: ctx.lifecycleStage || "desconocida", notas_de_contacto_previas: ctx.contactedNotes,
  });
  const system = SYSTEM_PROMPT + (ctx.lang === "en" ? "\n\nLANGUAGE: write the rationale, subject and body in natural English, even though these instructions are in Spanish. Keep the JSON keys and the journey/confidence enum values as specified (confidence may be high|medium|low). Sign off as \"Clara Team\" and greet with \"Hello,\"." : "");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), LLM_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: ctrl.signal,
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 800, system, messages: [{ role: "user", content: user }] }),
    });
    if (!res.ok) { await res.text().catch(() => ""); return { status: "error", error: `Anthropic API error ${res.status}` }; }
    const data = await res.json();
    if (data.stop_reason === "max_tokens") return { status: "error", error: "Claude response was truncated" };
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    let parsed = null;
    try { const m = text.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null; } catch { parsed = null; }
    const strategy = sanitizeStrategy(parsed, ctx.lang);
    if (!strategy) return { status: "error", error: "Claude response did not match the expected format" };
    const tin = Number(data.usage && data.usage.input_tokens) || 0, tout = Number(data.usage && data.usage.output_tokens) || 0;
    return { status: "ok", strategy, model: MODEL, estimatedCostUsd: Math.round(((tin * PRICE_IN + tout * PRICE_OUT) / 1e6) * 1e5) / 1e5, totalTokens: tin + tout };
  } catch (e) {
    return { status: "error", error: e && e.name === "AbortError" ? "Claude timed out" : "Claude could not be reached" };
  } finally { clearTimeout(timer); }
}

async function buildStrategy(lead, ctx) {
  const llm = await callClaude(lead, ctx);
  if (llm.status === "ok") return { strategy: llm.strategy, llm: { status: "ok", model: llm.model, estimatedCostUsd: llm.estimatedCostUsd, totalTokens: llm.totalTokens } };
  const fb = fallbackStrategy({ stage: ctx.lifecycleStage, contactedNotes: ctx.contactedNotes, score: ctx.score, lang: ctx.lang });
  const draft = templatedDraft(fb, lead, ctx.lang);
  return { strategy: { ...fb, ...draft }, llm: { status: llm.status === "unavailable" ? "unavailable" : "error", error: llm.error } };
}

async function resolveAudience({ email, simulate, ctx, approved, cfg }) {
  let profile;
  if (isValidEmail(email) && cfg.appKey) profile = await lookupProfile(normalizeEmail(email), cfg);
  else if (simulate === true && !cfg.appKey) profile = simulatedProfile();
  else profile = { source: "unavailable", reason: cfg.appKey ? "no_email" : "not_configured" };
  const audience = evaluateAudience({
    email: normalizeEmail(email), profile, lifecycleStage: ctx.lifecycleStage, crmStatus: ctx.crmStatus,
    hubspotLastContacted: ctx.hubspotLastContacted, approved,
  });
  return { audience, profileSource: profile.source, profileReason: profile.reason || null };
}

export default async (req) => {
  const cfg = readCioConfig();
  if (req.method === "GET") {
    const status = cioPublicStatus(cfg);
    const url = new URL(req.url);
    const ping = status.configured ? await pingCio(cfg, url.searchParams.get("refresh") === "1") : { state: "not_configured" };
    return json(200, { ok: true, integration: { ...status, cio: ping.state, cioReason: ping.reason || null, llmConfigured: Boolean(process.env.ANTHROPIC_API_KEY) } });
  }
  if (req.method !== "POST") return json(405, { ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" } });

  try {
    const body = parseBody(await req.text());
    const company = body && body.company;
    if (typeof company !== "string" || !KNOWN_LEADS.has(company)) throw new WorkflowError("LEAD_NOT_FOUND", "Unknown prospect.", 404);
    const lead = buscarLead(company);
    const ctx = cleanCtx(body);
    const requestId = crypto.randomUUID();
    const started = Date.now();
    const action = body.action;

    if (action === "analyze") {
      // Orden deliberado: primero la elegibilidad (reglas), después el LLM, y el LLM nunca recibe la elegibilidad.
      const { audience, profileSource, profileReason } = await resolveAudience({ email: body.recipientEmail, simulate: body.simulate, ctx, approved: false, cfg });
      const { strategy, llm } = await buildStrategy(lead, ctx);
      return json(200, { ok: true, requestId, latencyMs: Date.now() - started, audience, strategy, llm, cio: { profileSource, reason: profileReason } });
    }

    if (action === "draft") {
      const { strategy, llm } = await buildStrategy(lead, ctx);
      return json(200, { ok: true, requestId, latencyMs: Date.now() - started, strategy, llm });
    }

    if (action === "send_test") {
      const email = normalizeEmail(body.recipientEmail);
      const subject = typeof body.subject === "string" ? body.subject.replace(/\s+/g, " ").trim().slice(0, 120) : "";
      const text = typeof body.body === "string" ? body.body.replace(/\{\{|\}\}|\{%|%\}/g, "").slice(0, 1600).trim() : "";
      if (!subject || !text) throw new WorkflowError("INVALID_REQUEST", "Subject and body are required.", 400);
      // El servidor SIEMPRE recalcula la elegibilidad contra Customer.io (sin modo simulado) antes de decidir.
      const { audience } = await resolveAudience({ email, simulate: false, ctx, approved: body.approved === true, cfg });
      const blocked = evaluateSendGate({
        audience, approved: body.approved === true, sendEnabled: cfg.sendEnabled, allowlist: cfg.allowlist, email,
        transactionalConfigured: cfg.transactionalId !== null, credentialsConfigured: Boolean(cfg.appKey),
      });
      // Un CRM simulado (corrida demo) nunca habilita un envío, aunque el perfil de Customer.io sea real.
      if (ctx.crmStatus === "simulated" && !blocked.includes("simulated_data")) blocked.push("simulated_data");
      const recent = sendLog.filter(t => Date.now() - t < 3600000);
      if (recent.length >= SEND_CAP_PER_HOUR) blocked.push("rate_limited");
      if (blocked.length) return json(200, { ok: true, requestId, sent: false, blocked, audience });
      try {
        const r = await sendTestEmail({ to: email, subject, htmlBody: textToHtml(text), textBody: text, cfg });
        sendLog.push(Date.now());
        return json(200, { ok: true, requestId, latencyMs: Date.now() - started, sent: true, mode: "test", deliveryId: r.deliveryId, audience });
      } catch (e) {
        return json(502, { ok: false, error: { code: "CIO_SEND_FAILED", message: `Customer.io rejected or could not complete the test send (${(e && e.code) || "error"}).`, fallbackAvailable: false } });
      }
    }
    throw new WorkflowError("INVALID_REQUEST", "Unknown action.", 400);
  } catch (err) {
    return errorResponse(err);
  }
};
