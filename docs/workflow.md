# Workflow de prospección + lifecycle (tipo n8n)

Este workflow se documenta primero como diagrama y descripción de pasos; en Fase 2 se
exporta como JSON compatible con n8n (o se implementa como funciones serverless que
replican los mismos pasos, si no se dispone de instancia n8n).

## Pasos

1. **Trigger — Nuevo lead**
   Entrada vía formulario simulado o import CSV. Inserta fila en `leads` con estado `nuevo`.

2. **Nodo: Calificar lead (API de OpenAI)**
   Envía los datos del lead a un modelo de OpenAI con un prompt de scoring (industria,
   tamaño, fuente, señales de intención). Devuelve score 0–100 + razones. Se guarda en
   `scoring_log`.

3. **Nodo: Router (condicional)**
   - Si `score >= umbral` → rama **Handoff a AE**
   - Si `score < umbral` → rama **Lifecycle**

4a. **Rama Handoff a AE**
   Actualiza `leads.estado = handoff_ae`, genera mensaje de agendamiento de reunión vía
   la API de OpenAI, se registra en `mensajes_generados` (tipo `outreach`).

4b. **Rama Lifecycle**
   Actualiza `leads.estado = en_lifecycle`. El modelo decide siguiente mejor acción
   (canal, timing, contenido) según etapa (onboarding/activación/retención) y genera
   el mensaje, registrado en `mensajes_generados`.

5. **Nodo: Registrar evento**
   Cada interacción (mensaje enviado, abierto, respondido, reunión agendada, activación,
   riesgo de churn) se inserta en `eventos_lifecycle`.

6. **Dashboard**
   Lee agregados de las 4 tablas para mostrar las métricas de las 4 vistas.

## Exportación

El JSON del workflow (formato n8n) se añadirá en `/docs/workflow.n8n.json` en Fase 2, junto
con el diagrama ampliado si aporta claridad adicional sobre el del README.
