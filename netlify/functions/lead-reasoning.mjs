// Netlify Function — llamada real a un LLM (Claude por defecto, OpenAI como
// alternativa; ver pickProvider) para el paso de "razonamiento de calificación +
// redacción de outreach" del pipeline.
//
// Por qué existe: el pipeline en index.html simula este paso de forma
// determinística (una plantilla de outreach por tier) para que la demo
// funcione sin configuración. Esta función lo reemplaza, para un lead a la
// vez, con una llamada real a la API de OpenAI usando la OPENAI_API_KEY del
// dueño del sitio guardada solo como variable de entorno de Netlify — nunca
// en el repo, nunca expuesta al navegador, nunca pedida al visitante.
//
// Seguridad: esto no escribe en ningún CRM ni envía nada — es de solo
// lectura — pero sí gasta presupuesto real de API, así que el input se
// restringe al set fijo de leads (empresas reales investigadas con Clay)
// ya presentes en el dataset público (_clara_agent_shared.mjs). No es un
// proxy abierto de prompts.
import { LEADS_DEMO, buscarLead, calcularScore } from "./_clara_agent_shared.mjs";

const KNOWN_LEADS = new Set(Object.keys(LEADS_DEMO));

// Precios públicos de OpenAI para gpt-4o-mini al momento de escribir esto —
// solo para mostrar un costo estimado por llamada, no se factura desde aquí.
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_PRICE_IN = 0.15, OPENAI_PRICE_OUT = 0.60;
// Claude Haiku 4.5: mismo modelo que usa clara-agent-chat.mjs. USD por 1M de tokens.
const ANTHROPIC_MODEL = "claude-haiku-4-5";
const ANTHROPIC_PRICE_IN = 1.00, ANTHROPIC_PRICE_OUT = 5.00;

// Proveedor: LLM_PROVIDER ("anthropic" | "openai") fuerza uno; si no, Anthropic
// cuando hay ANTHROPIC_API_KEY (la misma clave del chat del agente) y OpenAI solo
// como alternativa. Devuelve null si no hay ninguna clave configurada.
function pickProvider() {
  const forced = (process.env.LLM_PROVIDER || "").trim().toLowerCase();
  const hasA = Boolean(process.env.ANTHROPIC_API_KEY), hasO = Boolean(process.env.OPENAI_API_KEY);
  if (forced === "openai" && hasO) return "openai";
  if (forced === "anthropic" && hasA) return "anthropic";
  if (hasA) return "anthropic";
  if (hasO) return "openai";
  return null;
}

const SYSTEM_PROMPT = `Eres un asistente de growth B2B para Clara, una fintech que ofrece tarjetas corporativas y pagos internacionales para PyMEs y empresas medianas de LatAm. Se te da la información de un lead real (empresa investigada con Clay: industria, tamaño, país, dolor actual inferido, señales de compra públicas) y su score/tier ya decididos de forma determinística por otro sistema — tú NO decides el score ni el tier, solo razonas sobre ellos y redactas outreach. Este es un ejercicio de portafolio: ninguna empresa fue contactada, no existe una campaña activa de Clara sobre ellas. Opcionalmente recibes "contexto_workflow" (score ICP y estado de CRM ya calculados por el orquestador n8n): trátalo como dato dado, no lo contradigas ni lo recalcules. Responde ÚNICAMENTE con JSON válido, sin texto fuera del JSON, con este esquema:
{
  "resumen_calificacion": string (2-3 oraciones en español, explicando por qué este lead encaja o no encaja con el ICP de Clara, citando el dolor y las señales dadas, marcando explícitamente qué es "HECHO" (dato dado) vs "INFERENCIA" (tu interpretación)),
  "siguiente_mejor_accion": string (una acción concreta: "agendar llamada con AE", "inscribir en secuencia de nurture por email", "descartar por bajo ajuste", etc., coherente con el tier dado),
  "razon_cuenta": string (1-2 oraciones: por qué esta cuenta importa para Clara, citando solo hechos dados; marca como "INFERENCIA" lo que sea interpretación tuya),
  "angulo_outreach": string (1 oración: el ángulo de personalización recomendado para el primer contacto, sin redactar el mensaje completo),
  "canal_recomendado": "email" | "whatsapp" | "llamada",
  "confianza": "alta" | "media" | "baja",
  "outreach": {
    "asunto": string (corto, específico, sin clickbait),
    "mensaje": string (100-160 palabras, 2-3 párrafos separados por "\\n\\n", tono profesional y directo en español neutro/latam, firmado "— Equipo Clara". Debe referenciar el dolor y/o la señal de compra dados, nombrar a Clara y qué resuelve (tarjetas corporativas y pagos internacionales sin fricción), y terminar con una llamada a la acción concreta y de bajo esfuerzo, ej. "20 minutos esta semana". Si el tier es C, el mensaje debe ser exactamente: "No aplica: lead descartado por bajo ajuste a ICP." y el asunto debe ser "(sin acción — ajuste insuficiente)". Nunca inventes datos que no se te dieron. Nunca uses guiones largos (—) dentro del cuerpo del mensaje; usa punto, coma o paréntesis.)
  }
}`;

// Modo workflow (lo llama n8n con contexto_workflow): esquema más pequeño, sin el
// mensaje de outreach completo que el workflow no usa. Pedir "sé breve" no basta
// (el modelo sigue el esquema largo), así que se cambia el esquema: ~250 tokens de
// salida en vez de ~600, para no rozar el timeout de las funciones síncronas.
const SYSTEM_PROMPT_WORKFLOW = `Eres un asistente de growth B2B para Clara, una fintech que ofrece tarjetas corporativas y pagos internacionales para PyMEs y empresas medianas de LatAm. Se te da un lead real (empresa investigada con Clay: industria, tamaño, país, dolor actual inferido, señales de compra públicas), su score/tier ya decididos por reglas determinísticas, y "contexto_workflow" (score ICP y estado de CRM calculados por el orquestador): trátalos como datos, no los recalcules ni los contradigas. Este es un ejercicio de portafolio: ninguna empresa fue contactada. Nunca inventes datos que no se te dieron. Responde ÚNICAMENTE con JSON válido, sin texto fuera del JSON, y sé conciso:
{
  "resumen_calificacion": string (máximo 2 oraciones cortas; marca "HECHO" lo dado e "INFERENCIA" lo que interpretas),
  "razon_cuenta": string (1 oración: por qué esta cuenta importa para Clara),
  "angulo_outreach": string (1 oración: ángulo de personalización recomendado para el primer contacto),
  "siguiente_mejor_accion": string (una frase concreta, coherente con el tier),
  "canal_recomendado": "email" | "whatsapp" | "llamada",
  "confianza": "alta" | "media" | "baja",
  "outreach": { "asunto": string (corto y específico), "mensaje": "" }
}`;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  const provider = pickProvider();
  if (!provider) {
    return new Response(JSON.stringify({ error: "No LLM key configured on this site (set ANTHROPIC_API_KEY)" }), { status: 503 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const nombre = body.nombre;
  if (typeof nombre !== "string" || !KNOWN_LEADS.has(nombre)) {
    return new Response(JSON.stringify({ error: "Lead desconocido — este endpoint solo sirve los leads del propio dataset del demo" }), { status: 400 });
  }

  const lead = buscarLead(nombre);
  const resultado = calcularScore(lead.nombre, lead);

  // Contexto opcional del workflow de n8n (ver docs/growth-automation-integration.md).
  // Se sanea campo por campo: solo números acotados y valores de un set fijo,
  // nunca texto libre del llamador dentro del prompt.
  const ctx = body.contexto_workflow && typeof body.contexto_workflow === "object" ? body.contexto_workflow : null;
  const contextoWorkflow = ctx ? {
    ...(Number.isFinite(Number(ctx.icp_score)) ? { icp_score: Math.min(100, Math.max(0, Math.round(Number(ctx.icp_score)))) } : {}),
    ...(["verified", "not_found", "unavailable"].includes(ctx.crm_estado) ? { crm_estado: ctx.crm_estado } : {}),
  } : null;

  const userPayload = JSON.stringify({
    lead: {
      nombre: lead.nombre, industria: lead.industria, empleados: lead.empleados,
      pais: lead.pais, fuente: lead.fuente, dolor_actual: lead.dolor_actual,
      senales_compra: lead.senales_compra,
    },
    score: resultado.score, tier: resultado.tier, ruteo: resultado.ruteo,
    ...(contextoWorkflow && Object.keys(contextoWorkflow).length ? { contexto_workflow: contextoWorkflow } : {}),
  });

  const systemPrompt = contextoWorkflow && Object.keys(contextoWorkflow).length ? SYSTEM_PROMPT_WORKFLOW : SYSTEM_PROMPT;
  const startedAt = Date.now();
  let text, promptTokens, completionTokens, model, priceIn, priceOut;
  try {
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL, max_tokens: 900, system: systemPrompt,
          messages: [{ role: "user", content: userPayload }],
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return new Response(JSON.stringify({ error: `Anthropic API error ${res.status}: ${errText.slice(0, 300)}` }), { status: 502 });
      }
      const data = await res.json();
      if (data.stop_reason === "max_tokens") {
        return new Response(JSON.stringify({ error: "anthropic response was truncated (max_tokens): the JSON is incomplete" }), { status: 502 });
      }
      text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
      promptTokens = data.usage?.input_tokens || 0;
      completionTokens = data.usage?.output_tokens || 0;
      model = ANTHROPIC_MODEL; priceIn = ANTHROPIC_PRICE_IN; priceOut = ANTHROPIC_PRICE_OUT;
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", "authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: OPENAI_MODEL, max_tokens: 900, response_format: { type: "json_object" },
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPayload }],
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return new Response(JSON.stringify({ error: `OpenAI API error ${res.status}: ${errText.slice(0, 300)}` }), { status: 502 });
      }
      const data = await res.json();
      text = data.choices?.[0]?.message?.content || "";
      promptTokens = data.usage?.prompt_tokens || 0;
      completionTokens = data.usage?.completion_tokens || 0;
      model = OPENAI_MODEL; priceIn = OPENAI_PRICE_IN; priceOut = OPENAI_PRICE_OUT;
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: `${provider} request failed` }), { status: 502 });
  }
  const latencyMs = Date.now() - startedAt;

  // Claude no tiene "json_object" mode aquí: se tolera una cerca ```json … ``` o texto alrededor.
  let parsed;
  try {
    const cleaned = String(text).trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    const first = cleaned.indexOf("{"), last = cleaned.lastIndexOf("}");
    parsed = JSON.parse(first >= 0 && last > first ? cleaned.slice(first, last + 1) : cleaned);
  } catch {
    return new Response(JSON.stringify({ error: `${provider} response was not valid JSON` }), { status: 502 });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return new Response(JSON.stringify({ error: `${provider} response was not a JSON object` }), { status: 502 });
  }

  const estimatedCostUsd = (promptTokens / 1_000_000) * priceIn + (completionTokens / 1_000_000) * priceOut;

  return new Response(JSON.stringify({
    reasoning: { ...parsed, score: resultado.score, tier: resultado.tier, ruteo: resultado.ruteo, source: provider === "anthropic" ? "live_anthropic" : "live_openai" },
    meta: {
      provider, model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
      latency_ms: latencyMs,
      estimated_cost_usd: Number(estimatedCostUsd.toFixed(6)),
    },
  }), { headers: { "content-type": "application/json" } });
};
