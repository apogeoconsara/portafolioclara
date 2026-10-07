// Netlify Function — punto de entrada del navegador hacia el workflow de n8n.
//
//   GET  → estado de la integración (qué está configurado). No llama a n8n ni
//          devuelve nunca la URL ni el secreto; solo booleanos.
//   POST → "Analyze Prospect": arma el payload desde el dataset (servidor), lo
//          manda al webhook de n8n y devuelve el resultado ya validado.
//
// Separación de responsabilidades (ver docs/growth-automation-integration.md):
//   n8n      → orquesta (HubSpot → scoring → LLM → routing → HubSpot)
//   esta fn  → proxy seguro: guarda la URL/secreto de n8n, valida input/output
//   browser  → solo muestra el resultado
//
// Seguridad: el navegador solo manda el nombre de un lead (+ la config de
// scoring editable en "Reglas de scoring", que se sanitiza y acota). Los hechos
// de la empresa se leen del dataset del servidor, nunca del cliente — así esta
// función no es un proxy abierto hacia n8n (ni hacia HubSpot/OpenAI vía n8n).
import { buscarLead } from "./_clara_agent_shared.mjs";
import {
  SOURCE, KNOWN_LEADS, WorkflowError, json, errorResponse, readConfig, publicStatus,
  postToN8n, normalizeAnalyzeResult, sanitizeScoringConfig, slugify,
} from "./_n8n_client.mjs";

const MAX_BODY_CHARS = 4000;

export default async (req) => {
  if (req.method === "GET") {
    return json(200, { ok: true, integration: publicStatus() });
  }
  if (req.method !== "POST") {
    return json(405, { ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" } });
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > MAX_BODY_CHARS) throw new WorkflowError("INVALID_REQUEST", "Request body too large.", 413);
    let body;
    try { body = JSON.parse(rawBody); } catch { throw new WorkflowError("INVALID_REQUEST", "Invalid JSON body.", 400); }

    const company = body && body.company;
    if (typeof company !== "string" || !KNOWN_LEADS.has(company)) {
      throw new WorkflowError("LEAD_NOT_FOUND", "Unknown prospect: this endpoint only serves the leads of the demo dataset.", 404);
    }

    const lead = buscarLead(company);
    const cfg = readConfig();
    const requestId = crypto.randomUUID();
    const payload = {
      event: "analyze_prospect",
      source: SOURCE,
      requestId,
      requestedAt: new Date().toISOString(),
      leadId: slugify(lead.nombre),
      company: lead.nombre,
      // El dataset es a nivel de empresa a propósito (sin datos de personas):
      // no hay email. Si existe un contacto asociado en HubSpot, n8n lo resuelve.
      email: null,
      country: lead.pais,
      industry: lead.industria,
      employees: lead.empleados,
      // Desconocido hasta que HubSpot responda: es el sistema de registro.
      lifecycleStage: null,
      painHypothesis: lead.dolor_actual,
      signals: lead.senales_compra,
      scoringConfig: sanitizeScoringConfig(body.scoringConfig),
      lang: body.lang === "en" ? "en" : "es",
      options: { writeback: cfg.writeback },
    };

    const startedAt = Date.now();
    const raw = await postToN8n(payload);
    const result = normalizeAnalyzeResult(raw);
    return json(200, { ok: true, mode: "live_n8n", requestId, latencyMs: Date.now() - startedAt, result });
  } catch (err) {
    return errorResponse(err);
  }
};
