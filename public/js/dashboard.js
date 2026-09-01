const ESTADO_LABELS = {
  nuevo: "Nuevo",
  calificado: "Calificado",
  en_lifecycle: "En Lifecycle",
  handoff_ae: "Handoff a AE",
  cliente: "Cliente",
};

const TICKET_POR_TAMANO = { pyme: 800, mediana: 2500 };
const CAC_REFERENCIA = 150;

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function barRow(label, value, max) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return `<div class="bar-row">
    <div class="bar-label">${label}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
    <div class="bar-value">${value}</div>
  </div>`;
}

function statCard(value, label) {
  return `<div class="stat"><div class="value">${value}</div><div class="label">${label}</div></div>`;
}

async function loadAll() {
  const [leads, scoringLog, mensajes, eventos] = await Promise.all([
    claraDemo.fetchTable("leads", "select=*"),
    claraDemo.fetchTable("scoring_log", "select=*"),
    claraDemo.fetchTable("mensajes_generados", "select=*"),
    claraDemo.fetchTable("eventos_lifecycle", "select=*"),
  ]);
  return { leads, scoringLog, mensajes, eventos };
}

function renderPipeline({ leads, scoringLog, eventos }) {
  const total = leads.length;
  const avgScore =
    scoringLog.length > 0
      ? Math.round(scoringLog.reduce((s, r) => s + r.score, 0) / scoringLog.length)
      : 0;
  const routedAe = scoringLog.filter((r) => r.resultado_routing === "ae").length;
  const pctAe = scoringLog.length > 0 ? Math.round((routedAe / scoringLog.length) * 100) : 0;
  const meetings = eventos.filter((e) => e.tipo_evento === "agendo_reunion").length;

  document.getElementById("pipeline-stats").innerHTML = [
    statCard(total, "Leads totales"),
    statCard(avgScore, "Score promedio"),
    statCard(`${pctAe}%`, "Routed a AE"),
    statCard(meetings, "Meetings booked"),
  ].join("");

  const counts = {};
  Object.keys(ESTADO_LABELS).forEach((k) => (counts[k] = 0));
  leads.forEach((l) => (counts[l.estado] = (counts[l.estado] || 0) + 1));
  const max = Math.max(...Object.values(counts), 1);
  document.getElementById("pipeline-funnel").innerHTML = Object.entries(counts)
    .map(([k, v]) => barRow(ESTADO_LABELS[k] || k, v, max))
    .join("");
}

function renderLifecycle({ leads, eventos }) {
  const enLifecycleOAdelante = leads.filter((l) =>
    ["en_lifecycle", "handoff_ae", "cliente"].includes(l.estado)
  ).length;
  const activados = leads.filter((l) => l.estado === "cliente").length;
  const activationRate =
    enLifecycleOAdelante > 0 ? Math.round((activados / enLifecycleOAdelante) * 100) : 0;

  const tiemposActivacion = eventos
    .filter((e) => e.tipo_evento === "activo_producto")
    .map((e) => {
      const lead = leads.find((l) => l.id === e.lead_id);
      if (!lead) return null;
      const dias =
        (new Date(e.timestamp) - new Date(lead.fecha_ingreso)) / (1000 * 60 * 60 * 24);
      return dias;
    })
    .filter((d) => d !== null);
  const avgDiasActivacion =
    tiemposActivacion.length > 0
      ? (tiemposActivacion.reduce((s, d) => s + d, 0) / tiemposActivacion.length).toFixed(1)
      : "—";

  document.getElementById("lifecycle-stats").innerHTML = [
    statCard(`${activationRate}%`, "Activation rate"),
    statCard(`${avgDiasActivacion} días`, "Tiempo promedio a activación"),
    statCard(activados, "Leads activados"),
  ].join("");

  const canalCounts = { email: 0, whatsapp: 0, push: 0 };
  eventos
    .filter((e) => e.metadata && e.metadata.canal)
    .forEach((e) => {
      if (canalCounts[e.metadata.canal] !== undefined) canalCounts[e.metadata.canal]++;
    });
  const max = Math.max(...Object.values(canalCounts), 1);
  document.getElementById("lifecycle-channels").innerHTML = Object.entries(canalCounts)
    .map(([k, v]) => barRow(k, v, max))
    .join("");
}

function renderEconomics({ leads }) {
  const pipelineGenerado = leads
    .filter((l) => ["handoff_ae", "cliente"].includes(l.estado))
    .reduce((sum, l) => sum + (TICKET_POR_TAMANO[l.tamano_empresa] || 0), 0);

  const clientes = leads.filter((l) => l.estado === "cliente");
  const cacPaybackMeses =
    clientes.length > 0
      ? (
          CAC_REFERENCIA /
          (clientes.reduce((s, l) => s + (TICKET_POR_TAMANO[l.tamano_empresa] || 0), 0) /
            clientes.length)
        ).toFixed(1)
      : "—";

  const leadsCalificados = leads.filter((l) => l.estado !== "nuevo").length;
  const costoPorLeadCalificado =
    leadsCalificados > 0 ? Math.round((CAC_REFERENCIA * leadsCalificados) / leadsCalificados) : 0;

  document.getElementById("economics-stats").innerHTML = [
    statCard(`$${pipelineGenerado.toLocaleString()}`, "Pipeline generado (MRR est.)"),
    statCard(`${cacPaybackMeses} meses`, "CAC payback estimado"),
    statCard(`$${CAC_REFERENCIA}`, "CAC promedio de referencia"),
    statCard(clientes.length, "Clientes convertidos"),
  ].join("");
}

function renderActivity({ leads, scoringLog, mensajes }) {
  const leadById = Object.fromEntries(leads.map((l) => [l.id, l]));
  const items = [
    ...scoringLog.map((r) => ({
      timestamp: r.timestamp,
      html: `<div class="feed-item">
        <div class="meta">${new Date(r.timestamp).toLocaleString("es")} · ${leadById[r.lead_id]?.empresa || "—"}</div>
        Score <strong>${r.score}</strong> → <span class="tag ${r.resultado_routing}">${r.resultado_routing === "ae" ? "Routed a AE" : "Lifecycle"}</span><br/>
        <span style="color:var(--muted)">${r.razones}</span>
      </div>`,
    })),
    ...mensajes.map((m) => ({
      timestamp: m.timestamp,
      html: `<div class="feed-item">
        <div class="meta">${new Date(m.timestamp).toLocaleString("es")} · ${leadById[m.lead_id]?.empresa || "—"} · ${m.canal} / ${m.tipo}</div>
        ${m.contenido}
      </div>`,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  document.getElementById("activity-feed").innerHTML =
    items.map((i) => i.html).join("") || '<p class="loading">Sin actividad todavía.</p>';
}

function setupTabs() {
  const buttons = document.querySelectorAll(".tabs button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      document.querySelectorAll("main section.view").forEach((s) => s.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.view).classList.add("active");
    });
  });
}

async function init() {
  setupTabs();
  try {
    const data = await loadAll();
    renderPipeline(data);
    renderLifecycle(data);
    renderEconomics(data);
    renderActivity(data);
  } catch (err) {
    document.querySelectorAll(".loading").forEach((n) => {
      n.textContent = "Error cargando datos: " + err.message;
      n.className = "error";
    });
  }
}

init();
