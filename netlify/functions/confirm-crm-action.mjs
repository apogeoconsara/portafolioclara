// Netlify Function — el único lugar donde una acción de CRM propuesta por el
// agente podría llegar a "ejecutarse", y solo después de que el visitante
// hace clic explícito en Aprobar en el chat.
//
// Este demo no tiene una integración real de CRM (ni Supabase en producción,
// ni HubSpot/Salesforce/Zapier — docs/data-model.md y docs/workflow.md no
// mencionan un proveedor específico, así que no se inventa ninguno aquí).
// Por eso esta función siempre corre en modo simulado: nunca escribe en
// ningún sistema externo real, pase lo que pase. Existe igual, separada del
// chat, para mantener el mismo patrón de "aprobación humana → confirmación
// server-side" que el resto del pipeline usa, y como el lugar donde una
// futura integración real (Supabase) se conectaría sin cambiar el resto del
// flujo — ver "Production integration design" en la página de Arquitectura.
const LOW_RISK_ACTIONS = new Set([
  "Handoff a AE (SDR humano)",
  "Lifecycle automatizado (nurture)",
  "Suprimir (no calificado)",
]);

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const action = body.action;
  if (!action || !LOW_RISK_ACTIONS.has(action.ruteo)) {
    return new Response(
      JSON.stringify({ executed: false, status: "REJECTED", message: `Acción '${action && action.ruteo}' no reconocida.` }),
      { status: 400 }
    );
  }

  // Deliberadamente siempre simulado: no existe ningún conector real de CRM
  // en este proyecto. Ver el comentario de cabecera.
  return new Response(JSON.stringify({
    executed: false,
    status: "SIMULATED",
    message: `Aprobado por el visitante. En este demo no se escribe en ningún sistema real — se registra localmente en el navegador como "${action.ruteo}" para "${action.nombre}". Una integración real de Supabase reemplazaría esta simulación sin cambiar el resto del flujo.`,
  }), { headers: { "content-type": "application/json" } });
};
