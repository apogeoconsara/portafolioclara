// Netlify Function: recibe datos de un lead ficticio, llama a la API de OpenAI
// para calificarlo (score + razones + routing) y, si hay credenciales de Supabase
// configuradas, guarda el resultado para que aparezca en el Agent Activity Log.
//
// Variables de entorno requeridas (configurar en Netlify, nunca en el repo):
//   OPENAI_API_KEY            — API key de OpenAI
//   SUPABASE_URL              — URL del proyecto Supabase
//   SUPABASE_SERVICE_ROLE_KEY — service role / secret key (solo server-side, nunca en el cliente)

const SCORING_PROMPT = `Eres un agente de calificación de leads B2B para una fintech
que atiende PyMEs y empresas medianas en LatAm. Dado el siguiente lead ficticio,
devuelve SOLO un JSON con esta forma exacta, sin texto adicional:
{"score": <entero 0-100>, "razones": "<explicación breve en español>", "resultado_routing": "ae" | "lifecycle"}

Reglas: score >= 70 y buena señal de intención/fit -> "ae". Si no, "lifecycle".

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

  const required = ["empresa", "industria", "tamano_empresa", "pais", "fuente"];
  for (const field of required) {
    if (!lead[field]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Falta el campo requerido: ${field}` }),
      };
    }
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
            content: SCORING_PROMPT + JSON.stringify(lead, null, 2),
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
      score: parsed.score,
      razones: parsed.razones,
      resultado_routing: parsed.resultado_routing,
      modelo_usado: MODEL,
    };

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey && lead.lead_id) {
      await fetch(`${supabaseUrl}/rest/v1/scoring_log`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          lead_id: lead.lead_id,
          score: result.score,
          razones: result.razones,
          modelo_usado: result.modelo_usado,
          resultado_routing: result.resultado_routing,
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
