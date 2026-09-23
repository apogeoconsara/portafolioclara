// Netlify Function — llamada real a OpenAI para el paso de "razonamiento de
// calificación + redacción de outreach" del pipeline.
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
// restringe al set fijo de leads ficticios ya presentes en el dataset
// público (_clara_agent_shared.mjs). No es un proxy abierto de prompts.
import { LEADS_DEMO, buscarLead, calcularScore } from "./_clara_agent_shared.mjs";

const KNOWN_LEADS = new Set(Object.keys(LEADS_DEMO));

// Precios públicos de OpenAI para gpt-4o-mini al momento de escribir esto —
// solo para mostrar un costo estimado por llamada, no se factura desde aquí.
const PRICE_PER_1M_INPUT_TOKENS = 0.15;
const PRICE_PER_1M_OUTPUT_TOKENS = 0.60;
const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `Eres un asistente de growth B2B para Clara, una fintech que ofrece tarjetas corporativas y pagos internacionales para PyMEs y empresas medianas de LatAm. Se te da la información de un lead ficticio (industria, tamaño, país, dolor actual, señales de compra) y su score/tier ya decididos de forma determinística por otro sistema — tú NO decides el score ni el tier, solo razonas sobre ellos y redactas outreach. Responde ÚNICAMENTE con JSON válido, sin texto fuera del JSON, con este esquema:
{
  "resumen_calificacion": string (2-3 oraciones en español, explicando por qué este lead encaja o no encaja con el ICP de Clara, citando el dolor y las señales dadas, marcando explícitamente qué es "HECHO" (dato dado) vs "INFERENCIA" (tu interpretación)),
  "siguiente_mejor_accion": string (una acción concreta: "agendar llamada con AE", "inscribir en secuencia de nurture por email", "descartar por bajo ajuste", etc., coherente con el tier dado),
  "canal_recomendado": "email" | "whatsapp" | "llamada",
  "confianza": "alta" | "media" | "baja",
  "outreach": {
    "asunto": string (corto, específico, sin clickbait),
    "mensaje": string (100-160 palabras, 2-3 párrafos separados por "\\n\\n", tono profesional y directo en español neutro/latam, firmado "— Equipo Clara". Debe referenciar el dolor y/o la señal de compra dados, nombrar a Clara y qué resuelve (tarjetas corporativas y pagos internacionales sin fricción), y terminar con una llamada a la acción concreta y de bajo esfuerzo, ej. "20 minutos esta semana". Si el tier es C, el mensaje debe ser exactamente: "No aplica: lead descartado por bajo ajuste a ICP." y el asunto debe ser "(sin acción — ajuste insuficiente)". Nunca inventes datos que no se te dieron. Nunca uses guiones largos (—) dentro del cuerpo del mensaje; usa punto, coma o paréntesis.)
  }
}`;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured on this site" }), { status: 503 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const nombre = body.nombre;
  if (typeof nombre !== "string" || !KNOWN_LEADS.has(nombre)) {
    return new Response(JSON.stringify({ error: "Lead desconocido — este endpoint solo sirve los leads ficticios del propio dataset del demo" }), { status: 400 });
  }

  const lead = buscarLead(nombre);
  const resultado = calcularScore(lead.nombre, lead);

  const userPayload = JSON.stringify({
    lead: {
      nombre: lead.nombre, industria: lead.industria, empleados: lead.empleados,
      pais: lead.pais, fuente: lead.fuente, dolor_actual: lead.dolor_actual,
      senales_compra: lead.senales_compra,
    },
    score: resultado.score, tier: resultado.tier, ruteo: resultado.ruteo,
  });

  const startedAt = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPayload },
      ],
    }),
  });
  const latencyMs = Date.now() - startedAt;

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return new Response(JSON.stringify({ error: `OpenAI API error ${res.status}: ${errText.slice(0, 300)}` }), { status: 502 });
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return new Response(JSON.stringify({ error: "OpenAI response was not valid JSON" }), { status: 502 });
  }

  const usage = data.usage || {};
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const estimatedCostUsd =
    (promptTokens / 1_000_000) * PRICE_PER_1M_INPUT_TOKENS +
    (completionTokens / 1_000_000) * PRICE_PER_1M_OUTPUT_TOKENS;

  return new Response(JSON.stringify({
    reasoning: { ...parsed, score: resultado.score, tier: resultado.tier, ruteo: resultado.ruteo, source: "live_openai" },
    meta: {
      model: MODEL,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: usage.total_tokens || (promptTokens + completionTokens),
      latency_ms: latencyMs,
      estimated_cost_usd: Number(estimatedCostUsd.toFixed(6)),
    },
  }), { headers: { "content-type": "application/json" } });
};
