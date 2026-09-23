// Fuente única de verdad para el dataset ficticio de leads y el scoring
// determinístico de Clara Growth & Lifecycle Agent.
//
// Por qué existe este archivo: tanto el chat del agente (clara-agent-chat.mjs)
// como la página principal (public/index.html, vía leads-data.mjs) necesitan
// exactamente los mismos leads y la misma fórmula de score — si cada uno
// tuviera su propia copia, podrían divergir silenciosamente (un lead que el
// chat ve como Tier A pero el dashboard califica distinto). Este módulo se
// importa desde ambas funciones; leads-data.mjs lo expone como JSON para que
// index.html lo cargue en vivo al abrir la página, en vez de mantener una
// copia estática del dataset dentro del HTML.
//
// Todos los datos son ficticios — empresas, contactos, correos y señales de
// compra inventados para este demo de portafolio. Ninguno corresponde a un
// cliente real de Clara ni de ninguna otra empresa.

export const LEADS_DEMO = {
  "Andes Exportadora de Café S.A.": {
    industria: "Agroexportación", empleados: 340, pais: "Colombia", fuente: "Formulario web",
    contacto: "Marcela Duarte", email: "marcela.duarte@andesexport.example",
    dolor_actual: ["pagos a proveedores en USD por transferencia bancaria manual", "sin tarjetas corporativas para el equipo de compras"],
    senales_compra: [
      "Solicitó una demo de pagos internacionales",
      "Visitó la página de precios 3 veces en una semana",
      "Creció su equipo de finanzas 15% este trimestre",
    ],
  },
  "Manufacturas del Bajío": {
    industria: "Manufactura", empleados: 610, pais: "México", fuente: "Referido",
    contacto: "Iván Restrepo", email: "ivan.restrepo@manufacturasbajio.example",
    dolor_actual: ["múltiples proveedores de FX sin consolidar", "reembolsos de viáticos en papel"],
    senales_compra: ["Pidió cotización enterprise", "Asistió a un webinar de tesorería para PyMEs"],
  },
  "LogiCarga Andina": {
    industria: "Logística", empleados: 1200, pais: "Perú", fuente: "LinkedIn Ads",
    contacto: "Rosa Elena Quispe", email: "rquispe@logicargaandina.example",
    dolor_actual: ["procesos de pago a transportistas manuales", "sin conciliación automática de gastos"],
    senales_compra: ["Descargó un whitepaper sobre gestión de gastos corporativos"],
  },
  "TiendaNube Selecta": {
    industria: "Retail / E-commerce", empleados: 85, pais: "Argentina", fuente: "Formulario web",
    contacto: "Julián Fernández", email: "julian.fernandez@tiendanubeselecta.example",
    dolor_actual: ["ya usa una plataforma de gasto corporativo local"],
    senales_compra: [],
  },
  "Construcciones del Pacífico": {
    industria: "Construcción", empleados: 45, pais: "Chile", fuente: "Formulario web",
    contacto: "Paula Contreras", email: "paula.contreras@construccionespacifico.example",
    dolor_actual: ["sin tarjetas corporativas", "pagos a subcontratistas manuales"],
    senales_compra: ["Publicó una vacante para Gerente de Finanzas"],
  },
  "NovaTech Software": {
    industria: "SaaS / Tecnología", empleados: 130, pais: "Brasil", fuente: "Contenido descargado",
    contacto: "Camila Souza", email: "camila.souza@novatechsoftware.example",
    dolor_actual: ["ya usa una plataforma de gasto corporativo competidora"],
    senales_compra: ["Descargó una guía de expansión internacional"],
  },
  "Grupo Hotelero Costa Esmeralda": {
    industria: "Turismo / Hospitalidad", empleados: 900, pais: "México", fuente: "Referido",
    contacto: "Roberto Salinas", email: "roberto.salinas@costaesmeralda.example",
    dolor_actual: ["múltiples cuentas bancarias sin consolidar", "pagos a proveedores internacionales manuales"],
    senales_compra: [
      "Solicitó una demo de pagos internacionales",
      "Contrató un nuevo Director de Finanzas",
      "Pidió cotización enterprise",
    ],
  },
  "Distribuidora Farmacéutica del Norte": {
    industria: "Salud / Distribución", empleados: 2400, pais: "Colombia", fuente: "Formulario web",
    contacto: "Adriana Pineda", email: "adriana.pineda@distrifarmanorte.example",
    dolor_actual: ["sin tesorería centralizada entre sucursales"],
    senales_compra: ["Visitó la página de precios"],
  },
  "Agroindustrias Verde Vivo": {
    industria: "Agroexportación", empleados: 210, pais: "Ecuador", fuente: "Formulario web",
    contacto: "Diego Andrade", email: "diego.andrade@verdevivo.example",
    dolor_actual: ["pagos manuales a proveedores en USD", "sin tarjetas corporativas"],
    senales_compra: ["Solicitó una demo de pagos internacionales", "Buscó \"pagos internacionales\" en su propio sitio de soporte"],
  },
  "Estudio Creativo Lúmina": {
    industria: "Marketing / Agencia", empleados: 22, pais: "Uruguay", fuente: "Formulario web",
    contacto: "Bruno Acosta", email: "bruno.acosta@estudiolumina.example",
    dolor_actual: ["ya usa una plataforma de gasto corporativo"],
    senales_compra: [],
  },
  "Minera Altiplano": {
    industria: "Minería", empleados: 3100, pais: "Bolivia", fuente: "LinkedIn Ads",
    contacto: "Sergio Choque", email: "sergio.choque@mineraaltiplano.example",
    dolor_actual: ["pagos internacionales manuales a proveedores de equipo"],
    senales_compra: ["Pidió cotización enterprise"],
  },
  "Transportes Rápido Sur": {
    industria: "Logística", empleados: 480, pais: "Chile", fuente: "Referido",
    contacto: "Valentina Muñoz", email: "valentina.munoz@rapidosur.example",
    dolor_actual: ["sin tarjetas corporativas para la flota de conductores", "reembolsos en papel"],
    senales_compra: [
      "Solicitó una demo de pagos internacionales",
      "Visitó la página de precios 3 veces en una semana",
      "Creció su equipo de operaciones 20% este trimestre",
    ],
  },
  "Editorial Horizonte Digital": {
    industria: "Medios / Editorial", empleados: 60, pais: "Colombia", fuente: "Contenido descargado",
    contacto: "Natalia Rojas", email: "natalia.rojas@horizontedigital.example",
    dolor_actual: ["pagos a colaboradores freelance en varios países manuales"],
    senales_compra: ["Descargó un whitepaper sobre gestión de gastos"],
  },
  "Consultora Andina Legal": {
    industria: "Servicios profesionales", empleados: 35, pais: "Perú", fuente: "Formulario web",
    contacto: "Fernando Vega", email: "fernando.vega@andinalegal.example",
    dolor_actual: ["ya usa tarjetas corporativas de un banco tradicional"],
    senales_compra: [],
  },
};

export function buscarLead(nombre) {
  if (typeof nombre !== "string") return null;
  const normalizado = nombre.trim().toLowerCase();
  for (const [nombreCanonico, lead] of Object.entries(LEADS_DEMO)) {
    if (nombreCanonico.toLowerCase().includes(normalizado)) {
      return { nombre: nombreCanonico, ...lead };
    }
  }
  return null;
}

// --- Scoring determinístico -------------------------------------------------
// Tres factores, máximo 100 puntos, igual que en docs/data-model.md y
// docs/workflow.md ("Calificar lead" → score 0-100 + razones):
//   tamaño de empresa (empleados)  → máx 30
//   dolor actual (stack de pagos)  → máx 25
//   señales de compra              → máx 45 (min(n * 15, 45))
// Tiering (refinamiento del router binario de docs/workflow.md — ver nota
// al final de ese archivo): A = handoff a AE, B = lifecycle automatizado,
// C = suprimir (no vale la pena ni cómputo de IA ni tiempo de SDR).

function puntajeTamano(empleados) {
  if (empleados >= 20 && empleados <= 1500) {
    return [30, `tamaño ideal para el ICP de Clara (${empleados} empleados)`];
  }
  return [5, `fuera del rango ideal de tamaño (${empleados} empleados)`];
}

function puntajeDolor(dolorActual) {
  const texto = dolorActual.join(" ").toLowerCase();
  const dolorAlto = ["manual", "papel", "sin tarjetas corporativas", "sin consolidar", "sin conciliación", "sin tesorería centralizada"];
  const dolorBajo = ["ya usa una plataforma de gasto corporativo", "ya usa tarjetas corporativas"];

  if (dolorBajo.some((k) => texto.includes(k))) {
    return [5, "ya usa una solución de gasto/tesorería (dolor bajo)"];
  }
  if (dolorAlto.some((k) => texto.includes(k))) {
    return [25, "procesos de pago/tesorería manuales o sin consolidar (dolor alto)"];
  }
  return [12, "dolor no clasificado, se asume dolor medio"];
}

export function calcularScore(nombre, lead) {
  const razones = [];

  const [ptsTamano, motivoTamano] = puntajeTamano(lead.empleados);
  razones.push(`${motivoTamano}: +${ptsTamano}`);

  const [ptsDolor, motivoDolor] = puntajeDolor(lead.dolor_actual);
  razones.push(`${motivoDolor}: +${ptsDolor}`);

  const numSenales = lead.senales_compra.length;
  const ptsSenales = Math.min(numSenales * 15, 45);
  razones.push(`${numSenales} señal(es) de compra activa(s): +${ptsSenales}`);

  const score = ptsTamano + ptsDolor + ptsSenales;

  let tier, ruteo;
  if (score >= 75) { tier = "A"; ruteo = "Handoff a AE (SDR humano)"; }
  else if (score >= 50) { tier = "B"; ruteo = "Lifecycle automatizado (nurture)"; }
  else { tier = "C"; ruteo = "Suprimir (no calificado)"; }

  return { nombre, score, tier, ruteo, razon: razones.join("; ") };
}
