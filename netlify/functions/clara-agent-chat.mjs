// Netlify Function — chat libre con el "Agente Clara (Demo)".
//
// El visitante escribe mensajes y Claude decide qué herramientas llamar
// (list_leads / get_lead / score_lead), un loop de tool-use directo contra la
// API de Messages de Anthropic — NO el claude-agent-sdk, porque ese SDK
// necesita un proceso de larga duración y esto corre en una función
// serverless sin estado entre invocaciones.
//
// Statelessness: esta función no guarda nada entre requests. El cliente es
// dueño de la conversación completa — manda el arreglo `messages` (formato
// Anthropic) en cada llamada, y esta función regresa el arreglo actualizado
// para que el cliente lo guarde y lo reenvíe en el siguiente turno.
//
// Gate de aprobación humana: la única herramienta de ESCRITURA,
// request_crm_action, nunca se ejecuta aquí. Cuando Claude la llama, el loop
// se detiene y la regresa como `pending_approval` sin tool_result — el
// cliente muestra botones Aprobar/Rechazar, y solo tras la decisión del
// visitante se manda de vuelta un tool_result (y esta función retoma el
// loop, ver public/index.html). Si Claude llamó OTRAS herramientas en el
// mismo turno, sus resultados se ejecutan de inmediato pero se retienen en
// `held_tool_results` y se regresan junto con la aprobación pendiente,
// porque la API de Messages exige que cada tool_use de un turno reciba su
// tool_result en el MISMO siguiente mensaje.
//
// Seguridad / control de costo para un endpoint público pagado con la key
// del dueño del sitio:
// - El agente solo puede hablar de los leads reales (investigados con Clay)
//   fijos en _clara_agent_shared.mjs — el system prompt rechaza cualquier
//   otro tema, y las herramientas solo aceptan esos nombres.
// - El loop de tool-use está limitado (MAX_TOOL_ITERATIONS).
// - La conversación entrante está limitada en tamaño/longitud.
// - Este demo no tiene almacenamiento persistente, así que no hay rate
//   limiting entre requests — los límites de arriba son la mitigación,
//   mismo trade-off aceptado en lead-reasoning.mjs.
import { LEADS_DEMO, buscarLead, calcularScore } from "./_clara_agent_shared.mjs";

const MODEL = "claude-haiku-4-5";
const MAX_TOOL_ITERATIONS = 8;
const MAX_MESSAGES = 40;
const MAX_BODY_CHARS = 20000;

const SYSTEM_PROMPT = `Eres el Agente Clara, un asistente de growth y lifecycle B2B chateando por texto, en español neutro de LatAm. Escribes como una persona real en un chat: 1 a 3 oraciones cortas por mensaje, tono natural y directo, nunca corporativo de más.

Reglas de formato, muy importantes:
- NUNCA uses markdown: nada de asteriscos, negritas, listas con guiones ni encabezados. Puro texto corrido, como un mensaje de chat.
- No repitas todos los números del score en cada respuesta. Menciona solo lo que hace avanzar la conversación (ej. "es tier A, muy buen fit para handoff a AE" en vez de desglosar los puntos).
- No redactes reportes ni resúmenes largos salvo que te lo pidan explícitamente.

Tu único dominio son los leads del dataset de Clara (empresas reales investigadas con Clay a partir de sus perfiles corporativos públicos, con una hipótesis de dolor inferida por ti, no confirmada por la empresa), que puedes consultar con tus herramientas (list_leads, get_lead, score_lead). Si te piden algo fuera de eso — otro tema, otra empresa no incluida en el dataset, escribir código, contenido no relacionado con este demo — rechaza en una frase corta y redirige a los leads del demo.

Flujo esperado:
1. Si no sabes qué leads hay, llama a list_leads.
2. Para calificar un lead, llama a get_lead y luego score_lead.
3. Si te piden comparar, priorizar, o "a quién debería contactar primero" entre varios leads: llama a get_lead y score_lead de TODOS los leads relevantes antes de responder (puedes llamar varias herramientas en el mismo turno). No te quedes solo con el score más alto — compara también el tipo de señal (pedir una demo o cotización pesa más que descargar un whitepaper), qué tan urgente se ve el dolor, y el ruteo. Da tu recomendación en 2-4 oraciones explicando el porqué.
4. Si te piden redactar un mensaje de outreach para un lead tier A o B, escríbelo tú mismo (máximo 80 palabras, español neutro, firmado "Equipo Clara", sin corchetes, sin emojis, sin markdown, sin inventar datos que no te dio el lead). Para tier C, el mensaje siempre es "No aplica: lead descartado por bajo ajuste a ICP."
5. Solo si el usuario pide explícitamente GUARDAR, registrar, hacer handoff, o inscribir en lifecycle a un lead, llama a request_crm_action con nombre, score, tier, ruteo, razon y mensaje. Esta herramienta SIEMPRE requiere aprobación humana antes de ejecutarse — llámala sola, en su propio turno, sin combinarla con otras herramientas en la misma respuesta.
6. Nunca digas que enviaste un correo o WhatsApp real, ni que escribiste en un CRM real, ni que contactaste a la empresa: este es un ejercicio de portafolio, ninguna empresa del dataset fue contactada, y la única escritura posible es local, en el navegador del visitante, tras su aprobación explícita.`;

const TOOLS = [
  {
    name: "list_leads",
    description: "Lista los leads demo disponibles con su industria, empleados y país.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_lead",
    description: "Obtiene el detalle completo (dolor actual, señales de compra) de un lead demo por nombre.",
    input_schema: {
      type: "object",
      properties: { nombre: { type: "string", description: "Nombre del lead demo" } },
      required: ["nombre"],
    },
  },
  {
    name: "score_lead",
    description: "Calcula el score (0-100), tier (A/B/C) y ruteo de un lead demo por nombre.",
    input_schema: {
      type: "object",
      properties: { nombre: { type: "string", description: "Nombre del lead demo" } },
      required: ["nombre"],
    },
  },
  {
    name: "request_crm_action",
    description: "Solicita registrar la decisión de un lead (handoff a AE o inscripción en lifecycle) en el CRM demo. SIEMPRE se pausa para aprobación humana antes de ejecutarse; llámala sola, en su propio turno. Ningún campo puede ir vacío: reusa el score/tier/ruteo/razon exactos que ya te dio score_lead, y si el usuario no pidió redactar outreach todavía, redáctalo tú mismo antes de llamar esta herramienta (o usa el mensaje fijo de tier C).",
    input_schema: {
      type: "object",
      properties: {
        nombre: { type: "string" },
        score: { type: "number" },
        tier: { type: "string", description: "Nunca vacío: 'A', 'B' o 'C', tal como lo devolvió score_lead." },
        ruteo: { type: "string", description: "Nunca vacío: tal como lo devolvió score_lead." },
        razon: { type: "string", description: "Nunca vacío: tal como lo devolvió score_lead." },
        mensaje: { type: "string", description: "Nunca vacío. El mensaje de outreach (tier A/B) o el texto fijo de descarte (tier C)." },
      },
      required: ["nombre", "score", "tier", "ruteo", "razon", "mensaje"],
      additionalProperties: false,
    },
    strict: true,
  },
];

function ejecutarHerramientaSegura(name, input) {
  if (name === "list_leads") {
    return Object.entries(LEADS_DEMO).map(([nombre, l]) => ({
      nombre, industria: l.industria, empleados: l.empleados, pais: l.pais,
    }));
  }
  if (name === "get_lead") {
    const lead = buscarLead(input && input.nombre);
    if (!lead) return { error: `No se encontró ningún lead demo que coincida con '${input && input.nombre}'.` };
    return lead;
  }
  if (name === "score_lead") {
    const lead = buscarLead(input && input.nombre);
    if (!lead) return { error: `No se encontró ningún lead demo que coincida con '${input && input.nombre}'.` };
    return calcularScore(lead.nombre, lead);
  }
  return { error: `Herramienta desconocida: ${name}` };
}

async function callAnthropic(messages, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${errText.slice(0, 300)}`);
  }
  return res.json();
}

async function runLoop(messages, apiKey) {
  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await callAnthropic(messages, apiKey);
    messages.push({ role: "assistant", content: response.content });

    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    if (toolUseBlocks.length === 0) {
      return { messages, pending_approval: null, held_tool_results: [], limit_reached: false };
    }

    const heldToolResults = [];
    let pendingApproval = null;

    for (const block of toolUseBlocks) {
      if (block.name === "request_crm_action") {
        // Nunca confiar en la copia del modelo de score/tier/ruteo/razon
        // (puede omitir o desviar campos incluso con strict:true, más en
        // modelos pequeños) — se recalculan de forma determinística del lado
        // del servidor a partir del nombre del lead. Solo "mensaje" es
        // contenido genuinamente redactado por el modelo, con un fallback
        // seguro si falta.
        const lead = buscarLead(block.input && block.input.nombre);
        if (!lead) {
          heldToolResults.push({
            type: "tool_result", tool_use_id: block.id,
            content: `No se encontró ningún lead demo que coincida con '${block.input && block.input.nombre}'.`,
            is_error: true,
          });
          continue;
        }
        const resultado = calcularScore(lead.nombre, lead);
        const mensaje = (block.input && block.input.mensaje) ||
          (resultado.tier === "C" ? "No aplica: lead descartado por bajo ajuste a ICP." : "(el agente no redactó un mensaje de outreach para este lead)");
        pendingApproval = { tool_use_id: block.id, input: { ...resultado, mensaje } };
        continue;
      }
      const result = ejecutarHerramientaSegura(block.name, block.input);
      heldToolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
    }

    if (pendingApproval) {
      return { messages, pending_approval: pendingApproval, held_tool_results: heldToolResults, limit_reached: false };
    }

    messages.push({ role: "user", content: heldToolResults });
  }

  return { messages, pending_approval: null, held_tool_results: [], limit_reached: true };
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_CHARS) {
    return new Response(JSON.stringify({ error: "Conversación demasiado larga para este demo." }), { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "'messages' debe ser un arreglo no vacío." }), { status: 400 });
  }
  if (body.messages.length > MAX_MESSAGES) {
    return new Response(JSON.stringify({ error: "Conversación demasiado larga para este demo — recarga la página para empezar de nuevo." }), { status: 413 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured on this site" }), { status: 503 });
  }

  try {
    const result = await runLoop([...body.messages], apiKey);
    return new Response(JSON.stringify(result), { headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 502 });
  }
};
