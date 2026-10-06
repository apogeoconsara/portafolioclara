// Fuente única de verdad para el dataset de leads y el scoring
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
// PROCEDENCIA DE LOS DATOS — leer antes de tocar este archivo:
// Las 13 empresas de este dataset son SINTÉTICAS: nombres, industrias, tamaños
// y señales fueron INVENTADOS para este demo. No corresponden a empresas
// reales (cualquier parecido con una empresa real es coincidencia) y no se
// incluye ningún dato de contacto ni de personas.
//
// Qué significa cada campo:
//   - nombre, industria, empleados, país: datos ficticios con el perfil del
//     ICP de Clara (PyMEs / empresas medianas de LatAm con expansión
//     internacional).
//   - senales_compra: señales de compra inventadas (multi-país, exportación,
//     apertura de oficina, etc.), plausibles para ese perfil.
//   - dolor_actual: una HIPÓTESIS de dolor operativo que el agente infiere a
//     partir de esas señales — no un hecho confirmado. Así se marca en la UI
//     (ver el paso "Razonamiento de IA" del Agent Run).
//
// Esto es un ejercicio de portafolio: ninguna campaña real, ningún envío real.
// Los eventos de lifecycle son simulados en public/index.html.

export const LEADS_DEMO = {
  "Kelvira Tech": {
    industria: "Consultoría TI / Transformación Digital", empleados: 305, pais: "Chile",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "coordina equipos y proveedores en 4 países (Chile, Colombia, Perú, España) y creció integrando boutiques regionales — perfil típico de pagos entre entidades gestionados de forma manual, sin señales de tesorería centralizada",
    ],
    senales_compra: [
      "Opera en Chile, Colombia, Perú y España",
      "Integró dos boutiques de software regionales en los últimos 2 años",
      "Se describe con +350 profesionales en \"crecimiento constante\"",
    ],
  },
  "Lemaris & Asociados": {
    industria: "Servicios Legales", empleados: 651, pais: "Colombia",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "firma resultado de la fusión de estudios de Chile, Colombia y Perú — estructura multi-entidad con pagos entre oficinas y socios probablemente manuales",
    ],
    senales_compra: [
      "Nace de la fusión de estudios jurídicos de Chile, Colombia y Perú, con red de aliados en España y EE.UU.",
      "Declara buscar atender \"la creciente integración comercial\" entre los países de la región",
    ],
  },
  "Cementos Tavira S.A.": {
    industria: "Materiales de Construcción / Cemento", empleados: 615, pais: "Perú",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "pertenece a un grupo industrial con negocios en 5 países — perfil típico de pagos entre subsidiarias gestionados de forma manual, sin señales de tesorería centralizada",
    ],
    senales_compra: [
      "Parte de un grupo industrial con operaciones en Perú, Bolivia, Colombia, Ecuador y Argentina",
    ],
  },
  "Vorlen Auditores Argentina": {
    industria: "Consultoría / Auditoría / Finanzas Corporativas", empleados: 211, pais: "Argentina",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "coordina servicios financieros con oficinas propias en 6 países a través de una red de firmas asociadas, probablemente con pagos internacionales manuales entre ellas",
    ],
    senales_compra: [
      "Miembro de una red de firmas con oficinas propias en España, México, Chile, Paraguay, Uruguay y Portugal",
      "Ofrece Finanzas Corporativas y Outsourcing como línea de negocio explícita",
    ],
  },
  "Yerbas Marelo": {
    industria: "Alimentos y Bebidas (Café / Yerba Mate)", empleados: 1289, pais: "Argentina",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "recibe insumos de más de 15 países según su propio perfil — pagos recurrentes a proveedores internacionales que, sin una plataforma B2B, suelen gestionarse de forma manual (hipótesis inferida)",
    ],
    senales_compra: [
      "Declara recibir materias primas e insumos de más de 15 países",
    ],
  },
  "Juguetes Pimbal": {
    industria: "Manufactura / Juguetes", empleados: 80, pais: "Argentina",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "PyME de 80 empleados que exporta a 8 países de LatAm — cobros de exportación probablemente gestionados de forma manual, sin señales de tesorería especializada",
    ],
    senales_compra: [
      "Exporta a México, Brasil, Colombia, Perú, Costa Rica, Chile, Bolivia y Uruguay",
      "En México y Colombia sus productos se comercializan a través de distribuidores mayoristas",
    ],
  },
  "Frutas Solvara S.A.": {
    industria: "Agroexportación (Frutas Tropicales)", empleados: 26, pais: "Ecuador",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "empresa pequeña (26 empleados) que exporta a Asia, América y Europa — cobros de exportación en múltiples divisas gestionados probablemente de forma manual para su tamaño",
    ],
    senales_compra: [
      "Exporta piña, pitahaya y banano a mercados de China, Japón, EE.UU. y España, entre otros",
      "Se describe a sí misma como un \"puente\" entre Ecuador y mercados internacionales de alta demanda",
    ],
  },
  "Empaques Torrelo S.A.": {
    industria: "Manufactura de Empaques (FMCG)", empleados: 97, pais: "Ecuador",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "exporta a 6 países con una gestión de cobros probablemente manual, sin señales de una solución de pagos/tesorería internacional",
    ],
    senales_compra: [
      "Exporta a Estados Unidos, Panamá, Bolivia, Colombia, Guatemala y Perú",
      "Se describe en \"crecimiento constante\", con clientes de consumo masivo de la región",
    ],
  },
  "Alimentos Cavena": {
    industria: "Manufactura de Alimentos (FMCG)", empleados: 83, pais: "Ecuador",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "combina importación y exportación simultáneas para mercados nacionales e internacionales — doble exposición cambiaria gestionada probablemente de forma manual, sin señales de tesorería centralizada",
    ],
    senales_compra: [
      "Fabrica, importa y exporta productos de consumo masivo para mercados \"nacionales e internacionales\"",
    ],
  },
  "Bananera Dorell": {
    industria: "Agroexportación (Banano)", empleados: 321, pais: "Ecuador",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "negocio depende enteramente de cobros de exportación en divisas, probablemente gestionados de forma manual, sin señales de tesorería especializada para una empresa de este tamaño",
    ],
    senales_compra: [
      "Mantiene un equipo dedicado exclusivamente a exportación y administración, separado del equipo de cultivo",
    ],
  },
  "Mirelia Comercio Exterior": {
    industria: "Consultoría de Comercio Exterior", empleados: 49, pais: "Colombia",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "anuncia expansión activa a 4 países nuevos con procesos de pago probablemente manuales, sin señales de infraestructura de tesorería multi-país lista para escalar",
    ],
    senales_compra: [
      "Presencia comercial activa en Colombia, China, Perú, Bolivia, Costa Rica y España",
      "Anuncia expansión \"próximamente\" a Honduras, México, Ecuador y Paraguay — señal explícita de expansión internacional en curso",
    ],
  },
  "Frutales Andamar S.A.S.": {
    industria: "Agroexportación (Frutas Frescas)", empleados: 200, pais: "Colombia",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "coordina cobros de exportación en múltiples monedas hacia Europa y Norteamérica entre 3 países andinos, probablemente de forma manual, sin señales de tesorería centralizada",
    ],
    senales_compra: [
      "Parte de un grupo con +25 años exportando fruta fresca desde Colombia, Ecuador y Perú",
      "Mantiene relaciones de largo plazo con clientes en los mercados europeo y norteamericano",
    ],
  },
  "Tarvia Logística": {
    industria: "Logística / Freight Forwarding", empleados: 120, pais: "México",
    fuente: "Dataset sintético (empresa ficticia)",
    dolor_actual: [
      "acaba de abrir una oficina en Asia para su expansión — fase típica donde los pagos internacionales todavía se gestionan de forma manual y fragmentada",
    ],
    senales_compra: [
      "Abrió oficina propia en Asia para coordinar embarques directos entre Asia y México",
      "Opera freight forwarding internacional (marítimo y aéreo) con certificaciones de calidad y seguridad aduanera",
    ],
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
