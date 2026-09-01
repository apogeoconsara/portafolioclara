# Modelo de datos (Supabase / Postgres)

Cuatro tablas, todas colgando de `leads.id`. Diseñado para soportar las 4 vistas del
dashboard sin necesidad de un modelo de datos más complejo — este es un demo de
portafolio, no un CRM en producción.

## `leads`

| columna | tipo | notas |
|---|---|---|
| id | uuid, pk | |
| empresa | text | nombre de la empresa ficticia |
| contacto | text | nombre del contacto |
| email | text | |
| industria | text | ej. retail, logística, manufactura |
| tamaño_empresa | text | pyme / mediana |
| pais | text | LatAm (MX, CO, BR, AR, CL, PE...) |
| fuente | text | ej. formulario web, LinkedIn, referido |
| fecha_ingreso | timestamptz | |
| estado | text | nuevo / calificado / en_lifecycle / handoff_ae / cliente |

## `scoring_log`

| columna | tipo | notas |
|---|---|---|
| id | uuid, pk | |
| lead_id | uuid, fk → leads.id | |
| score | int | 0–100 |
| razones | text | explicación generada por el modelo de IA |
| modelo_usado | text | ej. gpt-4o-mini |
| resultado_routing | text | ae / lifecycle |
| timestamp | timestamptz | |

## `mensajes_generados`

| columna | tipo | notas |
|---|---|---|
| id | uuid, pk | |
| lead_id | uuid, fk → leads.id | |
| canal | text | email / whatsapp / push |
| tipo | text | outreach / onboarding / activacion / retencion |
| contenido | text | texto generado |
| timing_sugerido | text | ej. "inmediato", "+2 días" |
| generado_por | text | referencia al prompt/versión usada |
| timestamp | timestamptz | |

## `eventos_lifecycle`

| columna | tipo | notas |
|---|---|---|
| id | uuid, pk | |
| lead_id | uuid, fk → leads.id | |
| tipo_evento | text | abrio_email / respondio / agendo_reunion / activo_producto / churn_risk |
| etapa_lifecycle | text | onboarding / activacion / retencion |
| timestamp | timestamptz | |
| metadata | jsonb | datos adicionales del evento |

## Notas

- Las métricas del dashboard (CAC payback, activation rate, pipeline generado) se calculan
  agregando sobre estas 4 tablas, no requieren tablas adicionales.
- El schema SQL real (migraciones de Supabase) se añade en Fase 1.
