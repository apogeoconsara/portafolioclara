// Netlify Function — sirve el dataset (empresas reales investigadas con
// Clay) + el score de cada lead como JSON de solo lectura (GET), calculado
// con la MISMA fórmula que usa el
// agente de chat (clara-agent-chat.mjs), ambos importando de
// _clara_agent_shared.mjs. public/index.html llama a este endpoint al cargar
// para construir el dashboard y la lista de leads, en vez de mantener una
// copia estática del dataset dentro del HTML — así el dashboard y el chat
// nunca pueden divergir en qué lead califica en qué tier.
//
// Si este endpoint no está disponible (por ejemplo, abriendo index.html
// directamente desde el disco sin `netlify dev` ni un deploy), la página cae
// a una copia local de respaldo con el mismo contenido — ver el comentario
// "FALLBACK_LEADS" en index.html.
import { LEADS_DEMO, calcularScore } from "./_clara_agent_shared.mjs";

export default async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const leads = Object.entries(LEADS_DEMO).map(([nombre, datos]) => {
    const resultado = calcularScore(nombre, datos);
    return { nombre, ...datos, ...resultado };
  });

  return new Response(JSON.stringify({ leads, generated_at: new Date().toISOString() }), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
  });
};
