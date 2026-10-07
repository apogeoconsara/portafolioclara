// Netlify Function — registra la decisión HUMANA sobre una recomendación del
// workflow (Approve / Needs Review / Send to Nurture / AE Ready / Outbound Ready).
//
// Esto NO envía ningún mensaje ni dispara outbound. Reenvía la decisión a n8n,
// que (solo si HUBSPOT_WRITEBACK=true y el registro existe en HubSpot) la
// escribe como propiedad en el CRM. "Outbound Ready" es únicamente un estado:
// en producción dispararía una secuencia de Amplemarket, pero aquí no hay
// ninguna integración con Amplemarket.
//
// Gate server-side: "outbound_ready" exige que el humano ya haya aprobado y
// que la ruta vigente sea AE Ready o SDR Review. Como este demo es stateless,
// ese contexto lo manda el cliente; es una barrera de proceso, no de seguridad
// (no hay nada que enviar). n8n vuelve a buscar el registro por NOMBRE de la
// empresa — nunca confía en un id de HubSpot enviado por el navegador.
import { KNOWN_LEADS, SOURCE, FINAL_ROUTES, WorkflowError, json, errorResponse, readConfig, postToN8n, normalizeDecisionResult, slugify } from "./_n8n_client.mjs";

const DECISION_TO_ROUTE = {
  needs_review: "NEEDS_REVIEW",
  nurture: "NURTURE",
  ae_ready: "AE_READY",
  outbound_ready: "OUTBOUND_READY",
  // approve conserva la ruta vigente
};
const MAX_BODY_CHARS = 2000;

export default async (req) => {
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
      throw new WorkflowError("LEAD_NOT_FOUND", "Unknown prospect.", 404);
    }
    const decision = body.decision;
    if (decision !== "approve" && !(decision in DECISION_TO_ROUTE)) {
      throw new WorkflowError("INVALID_REQUEST", "Unknown decision.", 400);
    }
    const currentRoute = body.currentRoute;
    if (!FINAL_ROUTES.includes(currentRoute)) {
      throw new WorkflowError("INVALID_REQUEST", "Missing or invalid currentRoute.", 400);
    }
    if (decision === "outbound_ready") {
      if (body.approvedBefore !== true || !["AE_READY", "SDR_REVIEW"].includes(currentRoute)) {
        throw new WorkflowError("APPROVAL_REQUIRED", "Outbound Ready requires a prior human approval of an AE Ready or SDR Review route.", 409);
      }
    }
    const finalRoute = decision === "approve" ? currentRoute : DECISION_TO_ROUTE[decision];

    const cfg = readConfig();
    const score = Number(body.score);
    const raw = await postToN8n({
      event: "record_decision",
      source: SOURCE,
      requestId: crypto.randomUUID(),
      requestedAt: new Date().toISOString(),
      leadId: slugify(company),
      company,
      decision,
      finalRoute,
      score: Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : null,
      executionId: typeof body.executionId === "string" ? body.executionId.slice(0, 60) : null,
      decidedBy: "clara_ui_user",
      options: { writeback: cfg.writeback },
    });
    return json(200, { ok: true, mode: "live_n8n", result: normalizeDecisionResult(raw) });
  } catch (err) {
    return errorResponse(err);
  }
};
