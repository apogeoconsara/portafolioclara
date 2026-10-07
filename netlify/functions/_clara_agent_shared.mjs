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
// Las 13 empresas de este dataset son EMPRESAS REALES, investigadas con
// Clay (mcp__Clay__search-companies) a partir de sus propios perfiles
// corporativos/LinkedIn públicos. El criterio de búsqueda fue el ICP
// realista de Clara: PyMEs / empresas medianas de LatAm (20-1500 empleados)
// con evidencia pública de expansión internacional (exportación activa,
// operación en varios países, apertura de oficinas en el extranjero,
// adquisiciones transfronterizas, etc.).
//
// Qué es real y qué es una hipótesis del agente, explícitamente:
//   - nombre, industria, empleados, país: datos reales de la empresa.
//   - senales_compra: hechos públicos reales citados de su propio perfil
//     corporativo (multi-país, exportación, apertura de oficina, M&A, etc.)
//     — no inventados, no verificados más allá de lo que la propia empresa
//     publica sobre sí misma.
//   - dolor_actual: una HIPÓTESIS de dolor operativo que el agente infiere
//     a partir de esas señales (p. ej. "empresa con operación en 6 países
//     probablemente gestiona esos pagos de forma manual") — exactamente lo
//     que haría un SDR/growth analyst humano al leer un perfil público, NO
//     un hecho confirmado directamente por la empresa. Así se marca en la
//     UI (ver el paso "Razonamiento de IA" del Agent Run).
//
// Esto es un ejercicio de portafolio: ninguna de estas empresas fue
// contactada, no existe ninguna campaña activa de Clara sobre ellas, y los
// únicos datos NO reales del dataset son la hipótesis de dolor (explícita)
// y los eventos de lifecycle simulados en public/index.html. No se incluye
// el nombre ni el email de ninguna persona real — solo evidencia a nivel de
// empresa (sin datos de contacto individual).

export const LEADS_DEMO = {
  "Apiux Tech": {
    industria: "Consultoría TI / Transformación Digital", empleados: 305, pais: "Chile",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "coordina equipos y proveedores en 5 países (Chile, Colombia, Perú, España, EE.UU.) y creció por adquisición de otras empresas (Nectia, Backspace) — perfil típico de pagos entre entidades gestionados de forma manual, sin evidencia pública de tesorería centralizada",
    ],
    senales_compra: [
      "Opera activamente en Chile, Colombia, Perú, España y EE.UU. (fuente: perfil corporativo)",
      "Adquirió Nectia Software y Backspace para expandir su oferta regional",
      "Se describe con +400 profesionales en \"constante crecimiento\"",
    ],
  },
  "PPU (Philippi Prietocarrizosa Ferrero DU & Uría)": {
    industria: "Servicios Legales", empleados: 651, pais: "Colombia",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "firma resultado de la fusión de estudios de Chile, Colombia y Perú — estructura multi-entidad con pagos entre oficinas y socios probablemente manuales",
    ],
    senales_compra: [
      "Nace de la fusión de firmas legales de Chile, Colombia y Perú, con red en España, EE.UU. y Reino Unido",
      "Declara buscar atender \"la creciente interrelación económica\" entre los países de la Alianza del Pacífico",
    ],
  },
  "YURA S.A.": {
    industria: "Materiales de Construcción / Cemento", empleados: 615, pais: "Perú",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "pertenece a un conglomerado (Grupo Gloria) con negocios en 6 países — perfil típico de pagos entre subsidiarias gestionados de forma manual, sin evidencia pública de tesorería centralizada",
    ],
    senales_compra: [
      "Parte de Grupo Gloria, con operaciones en Perú, Bolivia, Colombia, Ecuador, Argentina y Puerto Rico",
    ],
  },
  "Auren Argentina": {
    industria: "Consultoría / Auditoría / Finanzas Corporativas", empleados: 211, pais: "Argentina",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "coordina servicios financieros con oficinas propias en 7 países vía la red ANTEA, probablemente con pagos internacionales manuales entre firmas asociadas",
    ],
    senales_compra: [
      "Miembro de ANTEA con oficinas propias en España, México, Alemania, Chile, Paraguay, Uruguay y Portugal",
      "Ofrece Finanzas Corporativas y Outsourcing como línea de negocio explícita",
    ],
  },
  "La Virginia": {
    industria: "Alimentos y Bebidas (Café / Yerba Mate)", empleados: 1289, pais: "Argentina",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "recibe insumos de más de 20 países según su propio perfil — pagos recurrentes a proveedores internacionales que, sin una plataforma B2B, suelen gestionarse de forma manual (hipótesis inferida)",
    ],
    senales_compra: [
      "Declara recibir materias primas e insumos de más de 20 países",
    ],
  },
  "Juguetes Rasti": {
    industria: "Manufactura / Juguetes", empleados: 80, pais: "Argentina",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "PyME de 80 empleados que exporta a 9 países de LatAm — cobros de exportación probablemente gestionados de forma manual, sin evidencia de tesorería especializada",
    ],
    senales_compra: [
      "Exporta a México, Brasil, Colombia, Perú, Costa Rica, Chile, Bolivia, Paraguay y Uruguay",
      "En México, Colombia, Chile y Perú sus marcas (Blocky, Rasti) son comercializadas por Mattel",
    ],
  },
  "Ginafruit S.A.": {
    industria: "Agroexportación (Frutas Tropicales)", empleados: 26, pais: "Ecuador",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "empresa pequeña (26 empleados) que exporta a Asia, América y Europa — cobros de exportación en múltiples divisas gestionados probablemente de forma manual para su tamaño",
    ],
    senales_compra: [
      "Exporta banano, piña y pitahaya a mercados de China, Japón, EE.UU. y España, entre otros",
      "Se describe a sí misma como un \"puente\" entre Ecuador y mercados internacionales de alta demanda",
    ],
  },
  "Golderie Trading S.A.": {
    industria: "Manufactura de Empaques (FMCG)", empleados: 97, pais: "Ecuador",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "exporta a 7 países con una gestión de cobros probablemente manual, sin evidencia pública de una solución de pagos/tesorería internacional",
    ],
    senales_compra: [
      "Exporta a Estados Unidos, Panamá, Bolivia, Colombia, Guatemala, Perú y Costa Rica",
      "Se describe en \"constante crecimiento\", con clientes premium como Corporación Favorita, Pronaca y Grupo KFC",
    ],
  },
  "Configolsa": {
    industria: "Manufactura de Alimentos (FMCG)", empleados: 83, pais: "Ecuador",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "combina importación y exportación simultáneas para mercados nacionales e internacionales — doble exposición cambiaria gestionada probablemente de forma manual, sin evidencia pública de tesorería centralizada",
    ],
    senales_compra: [
      "Fabrica, importa y exporta productos de consumo masivo para mercados \"nacionales e internacionales\" (perfil corporativo propio)",
    ],
  },
  "Regina Bananera": {
    industria: "Agroexportación (Banano)", empleados: 321, pais: "Ecuador",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "negocio depende enteramente de cobros de exportación en divisas, probablemente gestionados de forma manual, sin evidencia pública de tesorería especializada para una empresa de este tamaño",
    ],
    senales_compra: [
      "Mantiene un equipo dedicado exclusivamente a exportación y administración en Guayaquil, separado del equipo de cultivo",
    ],
  },
  "Asia Grupo": {
    industria: "Consultoría de Comercio Exterior", empleados: 49, pais: "Colombia",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "anuncia expansión activa a 4 países nuevos con procesos de pago probablemente manuales, sin evidencia pública de infraestructura de tesorería multi-país lista para escalar",
    ],
    senales_compra: [
      "Presencia comercial activa en Colombia, China, Perú, Bolivia, Costa Rica y España",
      "Anuncia expansión \"próximamente\" a Honduras, México, Ecuador y Paraguay — señal explícita de expansión internacional en curso",
    ],
  },
  "FLP Colombia S.A.S.": {
    industria: "Agroexportación (Frutas Frescas)", empleados: 200, pais: "Colombia",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "coordina cobros de exportación en múltiples monedas hacia Europa y Norteamérica entre 3 países andinos, probablemente de forma manual, sin evidencia pública de tesorería centralizada",
    ],
    senales_compra: [
      "Parte de FLP Global, grupo con +30 años exportando frutas frescas desde Colombia, Ecuador y Perú",
      "Atiende relaciones de largo plazo con clientes en los mercados europeo y norteamericano",
    ],
  },
  "Beluga Logística": {
    industria: "Logística / Freight Forwarding", empleados: 120, pais: "México",
    fuente: "Investigación Clay (perfil corporativo público)",
    dolor_actual: [
      "acaba de abrir oficina en Shanghái para su expansión a Asia — fase típica donde los pagos internacionales todavía se gestionan de forma manual y fragmentada",
    ],
    senales_compra: [
      "Abrió oficina propia en Shanghái para coordinar embarques directos entre Asia y México",
      "Opera freight forwarding internacional (marítimo y aéreo) con certificaciones ISO y CTPAT",
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
