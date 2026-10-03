// Cliente servidor de Customer.io. NUNCA se importa desde el navegador.
//
// Variables de entorno (solo en Netlify, nunca en el repo ni en el frontend):
//   CUSTOMERIO_SITE_ID                    Track API: site id
//   CUSTOMERIO_TRACK_API_KEY              Track API: key (se usa solo para verificar credenciales)
//   CUSTOMERIO_APP_API_KEY                App API: bearer (consultas de perfil/mensajes y envío transaccional)
//   CUSTOMERIO_SEND_ENABLED               "true" para permitir envíos de PRUEBA. Por defecto FALSE: enviar es imposible.
//   CUSTOMERIO_TEST_ALLOWLIST             correos de prueba permitidos, separados por coma (único destino posible)
//   CUSTOMERIO_TRANSACTIONAL_MESSAGE_ID   id del mensaje transaccional (plantilla) a usar en el envío de prueba
//   CUSTOMERIO_REGION                     "us" (default) | "eu"
//
// Qué es real: la verificación de credenciales, la consulta de perfil/mensajes (solo lectura) y el
// envío de prueba (solo si TODAS las guardas pasan). Nada de esto crea personas, segmentos ni
// campañas, y no existe ninguna ruta de código para un envío "de producción".
import { normalizeEmail } from "./_lifecycle_rules.mjs";

const TIMEOUT_MS = 6000;

export function readCioConfig() {
  const region = (process.env.CUSTOMERIO_REGION || "us").trim().toLowerCase() === "eu" ? "eu" : "us";
  const list = String(process.env.CUSTOMERIO_TEST_ALLOWLIST || "").split(",").map(normalizeEmail).filter(Boolean);
  const tid = Number(process.env.CUSTOMERIO_TRANSACTIONAL_MESSAGE_ID);
  return {
    siteId: (process.env.CUSTOMERIO_SITE_ID || "").trim(),
    trackKey: (process.env.CUSTOMERIO_TRACK_API_KEY || "").trim(),
    appKey: (process.env.CUSTOMERIO_APP_API_KEY || "").trim(),
    // Solo el literal "true" habilita el envío; cualquier otro valor (o vacío) = deshabilitado.
    sendEnabled: String(process.env.CUSTOMERIO_SEND_ENABLED || "").trim().toLowerCase() === "true",
    allowlist: list,
    transactionalId: Number.isInteger(tid) && tid > 0 ? tid : null,
    appBase: region === "eu" ? "https://api-eu.customer.io" : "https://api.customer.io",
    trackBase: region === "eu" ? "https://track-eu.customer.io" : "https://track.customer.io",
  };
}

/** Solo booleanos y conteos: nunca ids, llaves ni correos. */
export function cioPublicStatus(cfg = readCioConfig()) {
  return {
    trackConfigured: Boolean(cfg.siteId && cfg.trackKey),
    appConfigured: Boolean(cfg.appKey),
    configured: Boolean(cfg.appKey),
    sendEnabled: cfg.sendEnabled,
    allowlistCount: cfg.allowlist.length,
    templateConfigured: cfg.transactionalId !== null,
  };
}

async function cioFetch(url, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await res.text();
    let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    return { ok: res.ok, status: res.status, data };
  } finally { clearTimeout(timer); }
}

function appHeaders(cfg) { return { authorization: `Bearer ${cfg.appKey}`, "content-type": "application/json" }; }

// Cache corto de la verificación de credenciales para no llamar a Customer.io en cada GET de estado.
let pingCache = { at: 0, value: null };
export async function pingCio(cfg = readCioConfig(), force = false) {
  if (!cfg.appKey && !(cfg.siteId && cfg.trackKey)) return { state: "not_configured" };
  if (!force && pingCache.value && Date.now() - pingCache.at < 60000) return pingCache.value;
  let value;
  try {
    // Track API: GET /auth valida site id + key. Si no hay credenciales de Track, se valida el App API con una lectura mínima.
    let r;
    if (cfg.siteId && cfg.trackKey) {
      r = await cioFetch(`${cfg.trackBase}/auth`, { headers: { authorization: "Basic " + Buffer.from(`${cfg.siteId}:${cfg.trackKey}`).toString("base64") } });
    } else {
      r = await cioFetch(`${cfg.appBase}/v1/customers?email=${encodeURIComponent("healthcheck@example.invalid")}`, { headers: appHeaders(cfg) });
    }
    value = r.ok ? { state: "connected" } : r.status === 401 || r.status === 403 ? { state: "unavailable", reason: "auth_failed" } : { state: "unavailable", reason: "http_" + r.status };
  } catch (e) {
    value = { state: "unavailable", reason: e && e.name === "AbortError" ? "timeout" : "unreachable" };
  }
  pingCache = { at: Date.now(), value };
  return value;
}

/**
 * Perfil de un correo en Customer.io (SOLO LECTURA). Devuelve un perfil normalizado para
 * evaluateAudience, o {source:'unavailable', reason} si no se pudo verificar (fail-closed).
 */
export async function lookupProfile(email, cfg = readCioConfig()) {
  if (!cfg.appKey) return { source: "unavailable", reason: "not_configured" };
  try {
    const q = await cioFetch(`${cfg.appBase}/v1/customers?email=${encodeURIComponent(email)}`, { headers: appHeaders(cfg) });
    if (!q.ok) return { source: "unavailable", reason: q.status === 401 || q.status === 403 ? "auth_failed" : "http_" + q.status };
    const results = Array.isArray(q.data && q.data.results) ? q.data.results : [];
    if (results.length === 0) return { source: "customerio", found: false, matches: 0 };
    const id = results[0].cio_id ? `cio_${results[0].cio_id}` : results[0].id;
    const profile = { source: "customerio", found: true, matches: results.length, unsubscribed: false, emailChannelOn: true, suppressed: false, lastMessageAt: null };
    if (id) {
      const [a, m] = await Promise.all([
        cioFetch(`${cfg.appBase}/v1/customers/${encodeURIComponent(id)}/attributes`, { headers: appHeaders(cfg) }),
        cioFetch(`${cfg.appBase}/v1/customers/${encodeURIComponent(id)}/messages?limit=20`, { headers: appHeaders(cfg) }),
      ]);
      if (!a.ok || !m.ok) return { source: "unavailable", reason: "http_" + (a.ok ? m.status : a.status) };
      const attrs = (a.data && (a.data.customer && a.data.customer.attributes || a.data.attributes)) || {};
      const truthy = (v) => v === true || String(v).toLowerCase() === "true";
      profile.unsubscribed = truthy(attrs.unsubscribed);
      // Preferencias de suscripción por tema: si TODOS los temas están en false, el canal email está apagado.
      let prefs = attrs.cio_subscription_preferences;
      if (typeof prefs === "string") { try { prefs = JSON.parse(prefs); } catch { prefs = null; } }
      const topics = prefs && prefs.topics && typeof prefs.topics === "object" ? Object.values(prefs.topics) : [];
      profile.emailChannelOn = topics.length === 0 ? true : topics.some(v => truthy(v));
      // Señales de supresión visibles en el perfil / historial: rebote duro, queja de spam o correo inválido.
      const msgs = Array.isArray(m.data && m.data.messages) ? m.data.messages : [];
      profile.suppressed = truthy(attrs.suppressed) || truthy(attrs.email_invalid) ||
        msgs.some(x => x && x.metrics && (x.metrics.bounced || x.metrics.spammed || x.metrics.dropped));
      const times = msgs.map(x => Number(x && (x.created || x.sent))).filter(Number.isFinite).map(t => (t < 1e12 ? t * 1000 : t));
      profile.lastMessageAt = times.length ? Math.max(...times) : null;
    }
    return profile;
  } catch (e) {
    return { source: "unavailable", reason: e && e.name === "AbortError" ? "timeout" : "unreachable" };
  }
}

/** Perfil SIMULADO: se usa solo cuando Customer.io no está conectado y el cliente lo pide explícitamente. */
export function simulatedProfile() {
  return { source: "simulated", found: false, matches: 0, unsubscribed: false, emailChannelOn: true, suppressed: false, lastMessageAt: null };
}

/**
 * Envío de PRUEBA vía API transaccional. El llamador (lifecycle-copilot.mjs) YA verificó la guarda;
 * aun así se re-valida aquí lo mínimo para que esta función no pueda usarse por error con envío apagado.
 */
export async function sendTestEmail({ to, subject, htmlBody, textBody, cfg = readCioConfig() }) {
  if (!cfg.sendEnabled) throw Object.assign(new Error("send disabled"), { code: "send_disabled" });
  if (!cfg.appKey || !cfg.transactionalId) throw Object.assign(new Error("not configured"), { code: "cio_not_configured" });
  if (!cfg.allowlist.includes(normalizeEmail(to))) throw Object.assign(new Error("not allowlisted"), { code: "not_allowlisted" });
  const r = await cioFetch(`${cfg.appBase}/v1/send/email`, {
    method: "POST", headers: appHeaders(cfg),
    body: JSON.stringify({
      transactional_message_id: cfg.transactionalId,
      to,
      identifiers: { email: to },
      subject: `[TEST] ${subject}`.slice(0, 160),
      body: htmlBody,
      body_plain: textBody,
      // Pase lo que pase con la plantilla: nunca a personas dadas de baja, nunca en cola como borrador.
      send_to_unsubscribed: false,
      queue_draft: false,
      disable_message_retention: false,
    }),
  });
  if (!r.ok) {
    const msg = r.data && (r.data.meta && r.data.meta.error || r.data.error || r.data.message);
    throw Object.assign(new Error(String(msg || "HTTP " + r.status).slice(0, 200)), { code: r.status === 401 || r.status === 403 ? "auth_failed" : "http_" + r.status });
  }
  return { deliveryId: r.data && r.data.delivery_id ? String(r.data.delivery_id).slice(0, 60) : null };
}
