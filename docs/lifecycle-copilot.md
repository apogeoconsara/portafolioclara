# Lifecycle Copilot (Customer.io) — extensión del flujo Nurture

Aparece **dentro** del resultado de una cuenta cuando su ruta es **Nurture** (la decidió el workflow o la envió una persona con "Send to Nurture"). No es una app aparte.

## Reparto de responsabilidades

| Quién | Qué hace | Qué NO puede hacer |
|---|---|---|
| **Reglas determinísticas** (`netlify/functions/_lifecycle_rules.mjs`) | Deciden la elegibilidad (8 checks) y la guarda de envío | — |
| **Claude** (Haiku 4.5, misma integración Anthropic) | Recomienda jornada (Activation / Education / Reactivation / Expansion), explica y redacta el borrador | Ver o cambiar la elegibilidad; enviar. Su salida se valida (jornada de un set fijo, llaves Liquid eliminadas, campos extra descartados) |
| **Persona** | Aprueba o rechaza el borrador | — |
| **Customer.io** | Fuente de verdad del perfil (suscripción, mensajes recientes, duplicados); destino del envío de **prueba** | No hay ruta de envío "de producción" en el código |

Todo dato que no se puede verificar cuenta como `?` (unknown) y **bloquea** (fail-closed).

## Audience Check (sin LLM)

Correo disponible · Suscripción global · Preferencia del canal email · Etapa de lifecycle correcta (HubSpot; `customer`/`evangelist`/`opportunity` no aplican) · Frecuencia reciente (14 días, Customer.io + HubSpot) · Supresión · Contacto duplicado · Aprobación humana.

## Send Test: las 4 condiciones (+ las que impone el servidor)

1. Pasaron **todos** los checks de audiencia, verificados **en vivo** contra Customer.io (el servidor los recalcula; no confía en el navegador).
2. Una persona aprobó el borrador.
3. `CUSTOMERIO_SEND_ENABLED` es exactamente `true` (por defecto: `false` → enviar es imposible).
4. El correo está en `CUSTOMERIO_TEST_ALLOWLIST` (único destino posible; nunca las empresas del portafolio).

Además: faltando credenciales/plantilla, con datos simulados (contacto ficticio o corrida demo) o pasando de 10 pruebas/hora por instancia, se bloquea. Cada bloqueo se muestra en pantalla con su motivo y se registra.

El envío usa `POST /v1/send/email` (App API) con `send_to_unsubscribed:false`, asunto `[TEST] …` y cuerpo en HTML escapado.

## Qué es real y qué es simulado

| Acción | Estado |
|---|---|
| Verificación de credenciales (Track API `/auth`) | Real (solo si hay llaves) |
| Consulta de perfil/mensajes del correo (App API, solo lectura) | Real (solo con `CUSTOMERIO_APP_API_KEY` y un correo escrito) |
| Estrategia y borrador | Real (Claude) o plantilla por reglas etiquetada si Claude falla |
| Envío de prueba | Real **solo** si pasan todas las condiciones |
| Checks sin Customer.io configurado | **Simulados** (contacto ficticio), etiquetados; nunca habilitan un envío |
| "Aprobar" / "Rechazar" | Solo se registran en la app; no escriben nada en Customer.io |
| Inscripción a una jornada / campaña / segmento | **No existe**: la jornada es una recomendación |
| Envío de producción | No existe |

## Métricas (Lifecycle Performance)

Solo conteos de los registros reales **de la sesión del navegador** (se pierden al recargar). Sin opens, clicks, conversión, ingresos ni ROI. Sin datos: `0` o "Not enough data". La simulación de eventos y Growth Economics siguen etiquetadas **ILLUSTRATIVE**.

## Pruebas

```
node tests/lifecycle-copilot.test.mjs   # reglas + guarda + función, con fetch simulado (sin red ni créditos)
```
