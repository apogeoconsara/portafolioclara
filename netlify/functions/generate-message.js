// Netlify Function: dado un lead calificado (con score/routing ya calculado),
// genera con la API de OpenAI el siguiente mensaje del flujo — outreach si va a
// AE, o el siguiente paso de lifecycle (onboarding/activacion/retencion) si no.
//
// Variables de entorno requeridas (Netlify, nunca en el repo):
//   OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (esta última opcional,
//   solo se usa si se quiere persistir el mensaje contra un lead_id real)

const MESSAGE_PROMPT = `Eres un agente de lifecycle marketing y outreach para una
fintech B2B que atiende PyMEs y empresas medianas en LatAm. Dado el siguiente lead
ficticio y su etapa, redacta el siguiente mensaje del flujo y decide canal y timing.

Reglas:
- Si "resultado_routing" es "ae": el mensaje es tipo "outreach" (invitación a agendar
  reunión con un Account Executive), tono directo y personalizado a la industria.
- Si es "lifecycle": elige tipo entre "onboarding", "activacion" o "retencion" según
  el "estado" del lead, y el canal (email, whatsapp o push) más adecuado al contexto.

Devuelve SOLO un JSON con esta forma exacta, sin texto adicional:
{"canal": "email"|"whatsapp"|"push", "tipo": "outreach"|"onboarding"|"activacion"|"retencion", "contenido": "<mensaje breve en español, máx 3 líneas>", "timing_sugerido": "<ej. inmediato, +1 día, +3 días>"}

Lead:
`;

const MODEL = "gpt-4o-mini";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 501,
      body: JSON.stringify({
        error:
          "OPENAI_API_KEY no está configurada en este entorno de Netlify. Este endpoint requiere una API key de OpenAI para funcionar.",
      }),
    };
  }

  let lead;
  try {
    lead = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Body inválido" }) };
  }

  if (!lead.empresa || !lead.resultado_routing) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Faltan campos requeridos: empresa, resultado_routing",
      }),
    };
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: MESSAGE_PROMPT + JSON.stringify(lead, null, 2),
          },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Error llamando a la API de OpenAI", detail: text }),
      };
    }

    const openaiData = await openaiRes.json();
    const parsed = JSON.parse(openaiData.choices[0].message.content);

    const result = {
      canal: parsed.canal,
      tipo: parsed.tipo,
      contenido: parsed.contenido,
      timing_sugerido: parsed.timing_sugerido,
      generado_por: `${MODEL} / prompt outreach-v1`,
    };

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey && lead.lead_id) {
      await fetch(`${supabaseUrl}/rest/v1/mensajes_generados`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          lead_id: lead.lead_id,
          canal: result.canal,
          tipo: result.tipo,
          contenido: result.contenido,
          timing_sugerido: result.timing_sugerido,
          generado_por: result.generado_por,
        }),
      });
    }

    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno", detail: err.message }),
    };
  }
};
