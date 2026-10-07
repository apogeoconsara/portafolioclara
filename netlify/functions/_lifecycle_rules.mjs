// Reglas DETERMINÍSTICAS del Lifecycle Copilot. Sin LLM, sin red, sin estado.
//
// Separación de responsabilidades:
//   - Claude (lifecycle-copilot.mjs) recomienda una estrategia, la explica y redacta un borrador.
//   - ESTE módulo decide si una cuenta es elegible para recibir un correo. Claude nunca ve ni
//     puede modificar este resultado: se calcula aparte y se vuelve a calcular en el servidor
//     antes de cualquier envío de prueba.
//
// Fail-closed: cualquier dato que no se pudo verificar cuenta como "unknown" y bloquea el envío.

export const JOURNEYS = ["Activation", "Education", "Reactivation", "Expansion"];
export const RECENT_CONTACT_DAYS = 14;
// Etapas de HubSpot en las que un correo de nurture NO corresponde (ya es cliente u oportunidad abierta).
const STAGES_EXCLUDED = new Set(["customer", "evangelist", "opportunity"]);
const STAGES_OK = new Set(["subscriber", "lead", "marketingqualifiedlead", "salesqualifiedlead", "other"]);
const EMAIL_RE = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]{1,255}\.[A-Za-z]{2,24}$/;

export function isValidEmail(v) {
  return typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v.trim());
}
export function normalizeEmail(v) { return typeof v === "string" ? v.trim().toLowerCase() : ""; }

const C = (id, status, code, source, params) => ({ id, status, code, source, ...(params ? { params } : {}) });

/**
 * @param {object} i
 * @param {string} i.email                    correo del destinatario (puede estar vacío)
 * @param {object} i.profile                  {source:'customerio'|'simulated'|'unavailable', found, matches,
 *                                             unsubscribed, emailChannelOn, lastMessageAt, suppressed}
 * @param {string|null} i.lifecycleStage      etapa de lifecycle en HubSpot (o simulada)
 * @param {string} i.crmStatus                'verified'|'not_found'|'unavailable'|'simulated'
 * @param {string|null} i.hubspotLastContacted ISO o null
 * @param {boolean} i.approved                aprobación humana del borrador
 * @param {number} [i.now]
 */
export function evaluateAudience(i) {
  const now = i.now || Date.now();
  const p = i.profile || { source: "unavailable" };
  const live = p.source === "customerio";
  const simulated = p.source === "simulated";
  const profSrc = simulated ? "simulated" : "customerio";
  const checks = [];

  // 1) Email available — validado localmente; con perfil simulado se marca como simulado.
  const email = i.email || "";
  if (simulated) checks.push(C("email", "pass", "simulated_contact", "simulated"));
  else checks.push(isValidEmail(email) ? C("email", "pass", "email_ok", "local") : C("email", "fail", "email_missing", "local"));

  // 2-3) Suscripción global y preferencia del canal email
  if (!live && !simulated) {
    checks.push(C("subscription", "unknown", "cio_unverified", "customerio"));
    checks.push(C("channel", "unknown", "cio_unverified", "customerio"));
  } else {
    if (p.found === false) {
      checks.push(C("subscription", "pass", "cio_new_contact", profSrc));
      checks.push(C("channel", "pass", "cio_new_contact", profSrc));
    } else {
      checks.push(p.unsubscribed === true ? C("subscription", "fail", "unsubscribed", profSrc) : C("subscription", "pass", "subscribed", profSrc));
      checks.push(p.emailChannelOn === false ? C("channel", "fail", "channel_off", profSrc) : C("channel", "pass", "channel_on", profSrc));
    }
  }

  // 4) Etapa de lifecycle correcta (HubSpot es el sistema de registro)
  const stage = String(i.lifecycleStage || "").toLowerCase();
  const stageSrc = i.crmStatus === "simulated" ? "simulated" : "hubspot";
  if (STAGES_EXCLUDED.has(stage)) checks.push(C("lifecycle", "fail", "stage_excluded", stageSrc, { stage }));
  else if (STAGES_OK.has(stage)) checks.push(C("lifecycle", "pass", "stage_ok", stageSrc, { stage }));
  else checks.push(C("lifecycle", "unknown", i.crmStatus === "verified" ? "stage_unset" : "crm_unverified", stageSrc));

  // 5) Frecuencia de contacto: último mensaje en Customer.io y último contacto en HubSpot
  const cutoff = now - RECENT_CONTACT_DAYS * 86400000;
  const hsLast = i.hubspotLastContacted ? Date.parse(i.hubspotLastContacted) : NaN;
  if (Number.isFinite(hsLast) && hsLast >= cutoff) {
    checks.push(C("frequency", "fail", "recent_hubspot", "hubspot", { days: RECENT_CONTACT_DAYS }));
  } else if (!live && !simulated) {
    checks.push(C("frequency", "unknown", "cio_unverified", "customerio"));
  } else if (p.found !== false && Number.isFinite(p.lastMessageAt) && p.lastMessageAt >= cutoff) {
    checks.push(C("frequency", "fail", "recent_cio", profSrc, { days: RECENT_CONTACT_DAYS }));
  } else {
    checks.push(C("frequency", "pass", "not_recent", profSrc, { days: RECENT_CONTACT_DAYS }));
  }

  // 6) Supresión
  if (!live && !simulated) checks.push(C("suppression", "unknown", "cio_unverified", "customerio"));
  else checks.push(p.found !== false && p.suppressed === true ? C("suppression", "fail", "suppressed", profSrc) : C("suppression", "pass", "not_suppressed", profSrc));

  // 7) Contacto duplicado (más de una persona con el mismo correo)
  if (!live && !simulated) checks.push(C("duplicate", "unknown", "cio_unverified", "customerio"));
  else checks.push(Number(p.matches || 0) > 1 ? C("duplicate", "fail", "duplicate", profSrc, { n: p.matches }) : C("duplicate", "pass", "no_duplicate", profSrc));

  // 8) Aprobación humana (se evalúa aparte: el borrador debe aprobarse DESPUÉS de ver los checks)
  const approval = i.approved === true ? C("approval", "pass", "approved", "human") : C("approval", "fail", "not_approved", "human");

  const dataChecks = checks;
  const failing = dataChecks.filter(c => c.status !== "pass").map(c => c.id);
  return {
    checks: [...dataChecks, approval],
    eligibleBeforeApproval: failing.length === 0,
    eligible: failing.length === 0 && approval.status === "pass",
    blockedBy: [...failing, ...(approval.status === "pass" ? [] : ["approval"])],
    dataSource: simulated ? "simulated" : live ? "customerio" : "unavailable",
  };
}

/**
 * Guardia de envío (todo debe cumplirse). Devuelve los motivos de bloqueo; vacío = se permite enviar.
 * Ningún motivo depende del LLM.
 */
export function evaluateSendGate({ audience, approved, sendEnabled, allowlist, email, transactionalConfigured, credentialsConfigured }) {
  const reasons = [];
  if (sendEnabled !== true) reasons.push("send_disabled");
  if (!credentialsConfigured) reasons.push("cio_not_configured");
  if (audience.dataSource === "simulated") reasons.push("simulated_data");
  else if (audience.dataSource !== "customerio") reasons.push("audience_unverified");
  if (!audience.eligibleBeforeApproval) reasons.push("audience_failed");
  if (approved !== true) reasons.push("not_approved");
  const list = (allowlist || []).map(normalizeEmail);
  if (!isValidEmail(email) || !list.includes(normalizeEmail(email))) reasons.push("not_allowlisted");
  if (!transactionalConfigured) reasons.push("no_template");
  return reasons;
}

/** Estrategia determinística de respaldo: se usa si el LLM no está disponible. Nunca decide elegibilidad. */
export function fallbackStrategy({ stage, contactedNotes, score, lang }) {
  const s = String(stage || "").toLowerCase();
  let journey;
  if (s === "customer" || s === "evangelist") journey = "Expansion";
  else if (Number(contactedNotes) > 0) journey = "Reactivation";
  else if (Number(score) >= 40) journey = "Activation";
  else journey = "Education";
  const en = lang === "en";
  const why = {
    Expansion: en ? "Existing customer: the right journey is expansion, not acquisition." : "Ya es cliente: la jornada correcta es expansión, no adquisición.",
    Reactivation: en ? "There is prior contact in the CRM: reactivate the conversation before any sales outreach." : "Hay contacto previo en el CRM: conviene reactivar la conversación antes de un outreach comercial.",
    Activation: en ? "Reasonable ICP fit but not enough buying intent yet: activate interest with useful content before involving an SDR." : "Ajuste razonable al ICP pero aún sin intención de compra suficiente: activar el interés con contenido útil antes de involucrar a un SDR.",
    Education: en ? "Low ICP fit for now: educate over time at low cost and re-score later." : "Ajuste bajo al ICP por ahora: educar en el tiempo a bajo costo y volver a puntuar después.",
  }[journey];
  return { journey, motion: "Nurture", rationale: why, confidence: null, source: "rules_fallback" };
}

/** Valida y acota lo que devuelve el LLM; todo lo que no cumpla se descarta. */
export function sanitizeStrategy(raw, lang) {
  const o = raw && typeof raw === "object" ? raw : {};
  // Se eliminan llaves de Liquid ({{ }} / {% %}): Customer.io las interpretaría al enviar.
  const noLiquid = (v) => v.replace(/\{\{|\}\}|\{%|%\}/g, "");
  const str = (v, max) => (typeof v === "string" ? noLiquid(v).replace(/\s+/g, " ").trim().slice(0, max) : "");
  const journey = JOURNEYS.includes(o.journey) ? o.journey : null;
  const subject = str(o.subject, 120);
  const body = typeof o.body === "string" ? noLiquid(o.body).replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, 1400) : "";
  const rationale = str(o.rationale, 400);
  if (!journey || !rationale || !subject || !body) return null;
  return { journey, motion: "Nurture", rationale, subject, body, confidence: ["alta", "media", "baja", "high", "medium", "low"].includes(o.confidence) ? o.confidence : null, source: "claude", lang };
}

/** Texto plano → HTML mínimo y escapado para el envío de prueba (nunca HTML del LLM tal cual). */
export function textToHtml(text) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return String(text).split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("\n");
}
