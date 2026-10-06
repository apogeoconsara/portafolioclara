# Reporte de la data: guía completa para quien parte de cero

> **Para quién es esto:** para alguien que no sabe qué es una "semilla", por qué hay porcentajes específicos, qué parte de
> la data está "mal" a propósito, ni qué tipos de datos existen. Todo se explica desde el principio.
> **Todas las cifras** vienen de la corrida con `--seed 42 --n 50000` y del reporte automático
> `data/reports/data_profile.md`. Si regeneras con otros parámetros, las cifras cambian.

---

## Índice

1. [Qué es todo esto y para qué sirve](#1-qué-es-todo-esto-y-para-qué-sirve)
2. [Glosario (palabras que vas a ver)](#2-glosario)
3. [Por qué la data es sintética y qué significa eso](#3-por-qué-la-data-es-sintética)
4. [Mapa general: qué tipos de data hay](#4-mapa-general-qué-tipos-de-data-hay)
5. [Parte A, el "mundo": las tablas](#5-parte-a-el-mundo-las-tablas)
6. [Parte B, el flujo de eventos](#6-parte-b-el-flujo-de-eventos)
7. [Parte C, datos para la IA](#7-parte-c-datos-para-la-ia)
8. [Parte D, políticas y reglas](#8-parte-d-políticas-y-reglas)
9. [Parte E, datos de impacto de negocio (simulados)](#9-parte-e-impacto-de-negocio-simulado)
10. [Parte F, la respuesta correcta ("verdad")](#10-parte-f-la-respuesta-correcta-la-verdad)
11. [Por qué esos porcentajes](#11-por-qué-esos-porcentajes)
12. [Qué está mal A PROPÓSITO y qué está mal DE VERDAD](#12-qué-está-mal-a-propósito-y-qué-está-mal-de-verdad)
13. [Cómo sabemos que la data es confiable](#13-cómo-sabemos-que-la-data-es-confiable)
14. [Qué va en git y qué no, y dónde está cada archivo](#14-qué-va-en-git-y-qué-no)
15. [Limitaciones honestas](#15-limitaciones-honestas)
16. [Cómo regenerarla y leerla](#16-cómo-regenerarla-y-leerla)

---

## 1. Qué es todo esto y para qué sirve

### El reto
Clara (una fintech de tarjetas corporativas para empresas de Latinoamérica) quiere contactar a unas **50,000 empresas por mes**
para venderles, sin contratar a una persona nueva por cada tanto de empresas. El reto pide construir un sistema pequeño que,
cuando le llega información sobre una empresa, decida:

> **¿Cuál es la mejor siguiente acción para esta cuenta, y es seguro hacerla de forma automática?**

Las acciones posibles son: **contactar**, **esperar**, **enriquecer datos**, **escalar a una persona**, **pasar la cuenta a un
ejecutivo de ventas (AE)** o **suprimir** (no volver a escribirle).

### Por qué la data es "lo más importante"
Un sistema de decisiones solo se puede **demostrar** si tiene situaciones difíciles con las que probarlo: un cliente que no se
debe contactar, un mismo aviso llegando dos veces, una API que falla, una respuesta de prospecto ambigua. Si la data fuera
"bonita y limpia", el sistema parecería perfecto sin haber sido probado. Por eso la data fue **diseñada** para contener, en
cantidad suficiente, cada una de esas situaciones.

### Qué hay en el repositorio
Un programa (el **generador**, en `growth-orchestrator/generator/`) que **fabrica** toda la data de forma automática. No hay
datos reales de nadie. Cada vez que lo corres con los mismos parámetros produce exactamente los mismos archivos.

---

## 2. Glosario

| Palabra | Qué significa en este proyecto |
|---|---|
| **Cuenta (account)** | Una empresa a la que queremos venderle. Ej.: "Grupo Vamar, Perú". |
| **Contacto (contact)** | Una persona dentro de la cuenta (el director de finanzas, el gerente de compras…). Una cuenta tiene de 1 a 5. |
| **Evento (event)** | Un aviso que llega al sistema: "esta cuenta fue agregada a la lista del mes", "este contacto respondió", "este contacto se dio de baja". Llega como un *webhook* (un mensaje automático entre sistemas). |
| **Sintética** | Inventada por el programa. Ninguna empresa, persona, correo o dominio existe. |
| **Semilla (seed)** | Dos significados distintos, ver abajo. |
| **Determinista** | Que con los mismos ingredientes sale siempre lo mismo. Sin azar "real". |
| **AE (Account Executive)** | Ejecutivo de ventas humano que lleva las cuentas más valiosas. |
| **SDR** | Persona que hace la prospección inicial (escribir en frío). El objetivo del sistema es no necesitar tantos. |
| **ICP** | "Cliente ideal": el tipo de empresa que Clara quiere (aquí: 11 o más empleados y que no sea gobierno ni ONG). |
| **Supresión** | Lista de gente/empresas a quienes **no** se les puede escribir (se dieron de baja, se quejaron, etc.). |
| **Enriquecer** | Consultar un servicio externo para completar o corregir datos de una cuenta. |
| **Idempotencia** | Que procesar el mismo evento dos veces tenga el mismo efecto que procesarlo una (no mandar dos correos). |
| **Webhook / payload** | Mensaje automático entre sistemas / el contenido de ese mensaje. |
| **Mock** | Simulación de un sistema externo (correo, CRM, calendario) que se comporta de forma controlada, incluyendo fallar. |
| **Golden set** | Conjunto pequeño de casos escritos a mano con la respuesta correcta, para probar el sistema. |
| **Eval (evaluación)** | Una prueba que mide qué tan bien lo hace la IA contra respuestas correctas conocidas. |
| **LLM** | El modelo de IA que lee texto (aquí: para interpretar respuestas y redactar correos). |
| **JSONL** | Formato de archivo: un registro por línea. Se abre con cualquier editor de texto. |
| **SQLite** | Base de datos en un solo archivo, sin instalar nada. |
| **Verdad (ground truth)** | La respuesta correcta conocida de antemano, guardada aparte para poder comparar. |

### Los dos significados de "semilla"
1. **Semilla del generador (`--seed 42`).** Es un número. El generador usa números "al azar", pero si le das el mismo número
   inicial siempre produce la misma secuencia. Con `42` siempre salen las mismas 50,000 empresas. Cambiar a `43` da otro
   mundo distinto pero igual de válido. Sirve para que los resultados sean **reproducibles**: tú y yo vemos la misma data.
2. **Archivos "semilla" (`data/seed/`).** Son los archivos **escritos a mano o curados** (casos de prueba, plantillas,
   respuestas de ejemplo). Se llaman así porque de ellos "nace" parte de la data grande. Esos sí se guardan en git porque
   alguien los revisó; los 299 MB generados no.

---

## 3. Por qué la data es sintética

El reto lo permite explícitamente ("puedes usar APIs simuladas, datos sintéticos, SQLite…"). Además:

* Usar empresas reales en un sistema de **correo masivo automatizado** puede parecer que las estás contactando.
* Con data inventada podemos **fabricar casos raros** (por ejemplo, 250 cuentas donde una baja llega tarde) en cantidad
  suficiente para probar. Con data real esos casos son difíciles de encontrar.
* **Seguridad:** todos los dominios terminan en `.example`, un sufijo que la norma de internet (RFC 2606) reserva para
  ejemplos y que **no puede existir de verdad**. Ningún correo inventado puede llegar a una persona real.

Qué **no** es sintético: nada. Todo lo que se ve en estos archivos es inventado. (Durante esta conversación también se retiraron
las 13 empresas reales que tenía el demo anterior del repositorio; hay una prueba automática que impide que vuelvan.)

---

## 4. Mapa general: qué tipos de data hay

Hay **seis familias**. Cada una responde a una pregunta distinta:

| Familia | Pregunta que responde | Tamaño aprox. | ¿En git? |
|---|---|---|---|
| **A. El mundo** (tablas) | ¿Cómo es el estado de cada empresa antes de empezar? | ~400k filas | No (se regenera); muestra de 500 cuentas sí |
| **B. El flujo de eventos** | ¿Qué avisos le llegan al sistema durante el mes? | 55,945 eventos | No; muestra sí |
| **C. Datos para la IA** | ¿Qué le damos a la IA y qué respuestas erróneas debe saber rechazar el sistema? | ~1,900 textos + 220 salidas grabadas | Sí |
| **D. Políticas y reglas** | ¿Qué reglas del negocio y de envío aplican? | 4 archivos | Sí |
| **E. Impacto de negocio** | ¿Cómo mediríamos si el sistema genera ventas de más? | 100,000 filas simuladas | No |
| **F. La verdad** | ¿Cuál era la respuesta correcta en cada caso? | ~240k filas | No; muestra sí |

Regla de oro: **las familias A, B, C y D son lo que "ve" el sistema; la F es el solucionario y el sistema nunca debe leerla**
(solo las pruebas). Hay una prueba automática que verifica que nada del solucionario se filtre en las demás tablas.

---

## 5. Parte A, el "mundo": las tablas

Es la foto del estado **al 1 de octubre de 2026, 09:00 UTC** (la fecha "as-of"). Todo lo que ocurre después llega como evento.

### 5.1 `accounts`: las empresas (50,000 filas)
Qué contiene cada una: nombre, razón social, **dominio** (ej. `vamar.pe.example`), país, industria, número de empleados, banda de
tamaño, banda de ingresos, estado en el CRM (`prospect`, `customer`, `churned_customer`, `competitor`), AE dueño (si tiene), qué tan
fresca está su información de enriquecimiento, cuántos intentos de enriquecimiento lleva, a qué lista mensual pertenece y fechas.

| País | Cuentas | % |
|---|---|---|
| México | 18,054 | 36.1% |
| Brasil | 9,969 | 19.9% |
| Colombia | 9,967 | 19.9% |
| Chile | 4,962 | 9.9% |
| Argentina | 3,996 | 8.0% |
| Perú | 3,052 | 6.1% |

| Tamaño (empleados) | Cuentas | % |
|---|---|---|
| 51–200 | 17,605 | 35.2% |
| 11–50 | 15,380 | 30.8% |
| 201–500 | 8,750 | 17.5% |
| 501–1000 | 4,352 | 8.7% |
| más de 1000 | 2,221 | 4.4% |
| 1–10 | 1,430 | 2.9% |
| desconocido (dato faltante a propósito) | 262 | 0.5% |

Estado en el CRM: 88.9% prospectos, 8.8% clientes, 2.0% clientes que se fueron, 0.3% competidores.
Industrias: 15 tipos (comercio 11.6%, manufactura 11.5%, tecnología 10.5%, logística 9.5%, construcción 8.5%…).
Estado del enriquecimiento: 83% completo, 16% parcial, 1% vencido.

### 5.2 `contacts`: las personas (118,944 filas)
Nombre, correo, **estado del correo** (qué tan usable es), cargo, función (finanzas, compras, operaciones…), nivel de
jerarquía, idioma.

| Contactos por cuenta | Cuentas |
|---|---|
| 0 (a propósito, no hay a quién escribir) | 608 |
| 1 | 14,182 |
| 2 | 14,966 |
| 3 | 10,205 |
| 4 | 6,059 |
| 5 | 3,901 |
| 6 (cuentas duplicadas que comparten un contacto) | 79 |

**Estado del correo**, es clave porque decide a quién se puede escribir:

| Estado | Significa | % |
|---|---|---|
| `valid` | Correo verificado: **el único con el que se puede escribir** | 79.9% |
| `unverified` | Existe pero nadie lo ha verificado | 6.9% |
| `role_based` | Buzón genérico (`finanzas@…`), no una persona | 4.4% |
| `catchall` | El dominio acepta cualquier cosa; no se sabe si existe | 2.6% |
| `missing` | No hay correo | 2.2% |
| `invalid_syntax` | Mal escrito (`juan@@empresa`) | 2.1% |
| `free_provider` | Correo personal (tipo gmail), no corporativo | 2.0% |

Idiomas: 72.9% español, 18.3% portugués, 8.8% inglés. Funciones: finanzas 35%, operaciones 15%, ejecutivos 14%, compras 12%,
TI 8%, otros 8%, RR. HH. 8%.

### 5.3 `opportunities`: negocios en curso o cerrados (9,762)
Etapa (`discovery`, `demo`, `proposal`, `negotiation`, `closed_won`, `closed_lost`), monto, dueño, fechas, motivo de pérdida.
Hay 1,500 cuentas con una oportunidad **abierta**.

### 5.4 `outreach_history`: correos ya enviados antes de empezar (42,042)
Qué se envió, a quién, cuándo, en qué paso de la secuencia (1 a 4) y quién lo envió (`sequence` = automático, `ae` = el
ejecutivo, `cs` = servicio al cliente). 21,485 cuentas tienen al menos un envío.

### 5.5 `suppression`: a quién NO escribir (2,934)
Por contacto o por dominio completo. Razones: baja voluntaria 69.6%, rebote duro 15.1%, "no me contacten" (DNC) 6.7%, queja de
spam 6.3%, bloqueo legal 2.2%.

### 5.6 `company_facts`: hechos sobre cada empresa (80,951)
Frases como "anunció su expansión a Bogotá" con **fuente**, fecha en que se observó y si está verificada. Sirven para que la IA
personalice un correo **sin inventar**. De cada 100 hechos, 68 son utilizables; el resto son **trampas** (ver sección 12):

| Tipo | n | % |
|---|---|---|
| Limpio, usable | 55,192 | 68.2% |
| Viejo (más de un año) | 14,308 | 17.7% |
| Hipótesis sin verificar | 7,325 | 9.0% |
| Habla de **otra** empresa con nombre parecido | 2,077 | 2.6% |
| Contradice el tamaño real de la empresa | 2,049 | 2.5% |

### 5.7 `aes` y `ae_calendar`: los ejecutivos y su agenda
40 AEs. De ellos: 38 activos, 3 de vacaciones a la fecha de la foto, 2 desactivados, **13 al tope de su capacidad**. Cada uno con
idiomas, zona horaria, país, un **AE de respaldo** y su carga actual. El calendario tiene 836 filas (días laborales × AE) con
los horarios de 30 minutos libres.

### 5.8 `mock_behavior` y `mock_enrichment`: cómo se portan las APIs simuladas
`mock_behavior` (50,000) define, **por cuenta**, cómo reaccionarán los sistemas externos, siempre igual (reproducible):

| Sistema | Comportamiento | % |
|---|---|---|
| Enriquecimiento | funciona | 88.3% |
| | se cuelga una vez y luego funciona | 3.8% |
| | límite de velocidad una vez | 2.9% |
| | responde basura ilegible | 2.9% |
| | error 500 permanente | 2.0% |
| Envío de correo | funciona | 93.1% |
| | error temporal y luego funciona | 3.0% |
| | límite de velocidad | 1.9% |
| | **resultado incierto** ("200 OK pero estado desconocido") | 1.2% |
| | rechazo definitivo | 0.8% |
| Calendario | funciona / choque de horario | 95.8% / 4.2% |

`mock_enrichment` (2,267) es lo que devolvería el servicio de enriquecimiento para las cuentas que lo necesitan: 65% datos
buenos, 20% sin datos, 15% datos **contradictorios**.

---

## 6. Parte B, el flujo de eventos

`events` (**55,945** avisos en orden de llegada). Cada uno es un sobre con: identificador de entrega, identificador del evento,
**llave de idempotencia**, tipo, cuenta, contacto, cuándo **ocurrió**, cuándo **llegó** y el contenido.

| Tipo de evento | n | % | Qué es |
|---|---|---|---|
| `account_targeted` | 52,943 | 94.6% | La cuenta entró a la lista del mes: "decide qué hacer" |
| `reply_received` | 1,613 | 2.9% | Un contacto respondió un correo |
| `opportunity_stage_changed` | 459 | 0.8% | El CRM movió una oportunidad de etapa |
| `unsubscribe_received` | 339 | 0.6% | Alguien pidió no recibir más |
| `opportunity_created` | 264 | 0.5% | Se creó una oportunidad nueva |
| `email_bounced` | 181 | 0.3% | Un correo rebotó |
| `meeting_booked` | 81 | 0.1% | Alguien agendó una reunión |
| `lead_scored` | 65 | 0.1% | **Basura a propósito**: un tipo que el sistema no conoce |

Los avisos llegan en **ráfagas**: cuatro o cinco veces al mes, miles de cuentas entran en ~20 minutos (cada lista nueva). Eso
presiona colas y límites de velocidad.

### Las "travesuras" que se le hacen al flujo
Se parte de un flujo limpio y se le inyectan problemas **con tasas explícitas**. Esa es la razón de cada porcentaje:

| Problema | Cuántos | % de los eventos | Qué debe hacer el sistema |
|---|---|---|---|
| Duplicado exacto (mismo aviso reenviado) | 1,551 | 2.8% | Ignorarlo: un solo efecto |
| Duplicado "semántico" (otro identificador, misma llave) | 843 | 1.5% | Ignorarlo |
| Duplicado por contenido (otra fuente, otra llave, mismo contenido) | 256 | 0.5% | Detectarlo por contenido |
| Retrasado (llega entre 10 min y 3 días tarde) | 1,346 | 2.4% | Procesar usando **cuándo ocurrió**, no cuándo llegó |
| Carrera (algo que pasó **antes** llega **después**) | 500 | 0.9% | Aplicarlo, suprimir y cancelar envíos pendientes |
| **Malformado** (corrupto a propósito) | 508 | 0.9% | Mandar a "cola de errores" (dead-letter), sin tocar nada |
| Limpio, sin problema | 50,941 | 91.1% | Procesar normal |

Los 508 malformados son de siete tipos: fecha imposible (81), contenido nulo (77), contenido de tipo equivocado (74), sin cuenta
(72), cuenta que no existe (67), tipo desconocido (65), versión de esquema no soportada (65) y texto gigante (7).
En total, 2,340 avisos (4.2%) llegaron más de una hora después de haber ocurrido.

**Ejemplo de carrera:** el sistema recibe "esta cuenta entró a la lista", la ve elegible y programa un correo. 20 horas
después llega un aviso que dice "esa persona se dio de baja **ayer**". El sistema debe aplicarlo, suprimir y cancelar el correo
pendiente. Hay 250 cuentas así con baja tardía y 250 con oportunidad tardía.

---

## 7. Parte C, datos para la IA

La IA se usa en **dos** tareas: (1) **interpretar respuestas** de prospectos y extraer información; (2) **redactar un correo
personalizado** basado únicamente en hechos verificados. Todo lo demás (elegibilidad, bajas, rebotes, ruteo, ventanas de envío)
lo deciden **reglas**, no la IA.

### 7.1 Respuestas de prospectos
**`reply_seeds.jsonl`** (117 archivos "semilla" escritos a mano). Son frases base etiquetadas, en español, inglés y portugués,
con 13 categorías:

| Categoría | Qué es | Acción correcta | Tamaño en el flujo |
|---|---|---|---|
| `interesado` | Quiere hablar | Pasar a un AE | 244 (16.0%) |
| `ahora_no` | Quizá después (a veces con fecha) | Esperar hasta la fecha | 206 (13.5%) |
| `objecion` | "Ya tenemos proveedor / sin presupuesto" | Persona decide | 174 (11.4%) |
| `unsubscribe` | "No me escriban más" | Suprimir | 138 (9.1%) |
| `ambiguo` | "Interesante, veamos" | Persona decide | 134 (8.8%) |
| `fuera_de_oficina` | Respuesta automática de vacaciones | Esperar | 124 (8.1%) |
| `auto_respuesta` | "Recibimos su correo, ticket #…" | Nada | 124 (8.1%) |
| `persona_equivocada` | "Yo no soy; hable con X" | Buscar a la persona correcta | 121 (7.9%) |
| `pregunta_informacion` | Pide precios/detalles | Persona responde | 80 (5.2%) |
| `mixto_contradictorio` | "Me interesa, pero no me escriban más" | **Suprimir** (la baja gana) | 71 (4.7%) |
| `hostil` | Enojo o amenaza legal | Suprimir + persona | 50 (3.3%) |
| `prompt_injection` | Trampa: "ignora tus instrucciones y…" | Persona; **nunca obedecer** | 33 (2.2%) |
| `vacio_truncado` | Vacío o cortado | Persona decide | 25 (1.6%) |

Las respuestas del flujo (1,524 etiquetadas) = texto base + variaciones automáticas (saludos, firmas, errores de dedo, el
correo original citado con el pie "responde BAJA" como ruido realista, avisos legales). Hay 71% en español, 18% portugués, 11%
inglés; 35% fáciles, 50% medias, 15% difíciles.

Las semillas incluyen **información de calificación** que la IA debe extraer solo si está dicha: tamaño del equipo, solución
actual (banco, Excel, ERP…), plazo en meses, países, dolores y señal de presupuesto. Hay una **trampa**: "somos un grupo de 12
empresas" no significa que el equipo sea de 12 personas.

### 7.2 Casos de evaluación y salidas grabadas
* **`eval_cases.jsonl`** (18 casos): 10 de respuestas (el "conjunto base" que pide el reto), 4 extendidos y 4 de personalización.
* **`llm_recordings.jsonl`** (220 grabaciones): por cada caso, una respuesta correcta de la IA y varias **defectuosas**, cada
  una con el veredicto que el sistema debería dar. Sirven para probar el sistema **sin llamar a ninguna IA real**.

Tipos de defecto: JSON cortado, texto en lugar de JSON, vacío, campo faltante o sobrante, valor inválido, confianza fuera de
rango (1.7), cita inventada, **referido o fecha o tamaño inventados**, obedecer una inyección, etiqueta equivocada con mucha
seguridad, acción que contradice la etiqueta y, en correos, afirmaciones prohibidas, falta de pie de baja, hechos inexistentes
o no utilizables. Veredictos: `accept` 19, `accept_with_warning` 13, `reject_retry` 106, `reject_escalate` 29,
`escalate_low_confidence` 15, `override_rule` 2, `fallback_generic` 36.

**El principio:** *la IA propone, el código determinista dispone.* La acción siempre sale de la **etiqueta validada**; lo que la
IA "sugiera" se ignora si no coincide. Y una baja explícita en el texto fuerza "suprimir" aunque la IA diga otra cosa.

> **Honestidad clave:** hay dos grabaciones (`wrong_but_valid_*`) donde la IA da una respuesta **plausible, bien formada y
> equivocada**. Ningún validador puede detectarlas. Se dejan marcadas porque demuestran por qué la IA debe operar con revisión
> humana por muestreo y no sola.

### 7.3 Plantillas
12 correos aprobados (3 idiomas × 4 pasos de la secuencia). Si no hay hechos utilizables, se envía la plantilla **genérica**;
nunca se inventan detalles.

---

## 8. Parte D, políticas y reglas

Cuatro archivos en `data/seed/` y un documento (`data/POLICY.md`) que explica la política completa. **Todos los números de esta
parte son supuestos míos para poder construir la data**, no reglas reales de Clara. Se cambian en un solo lugar.

| Archivo | Qué define |
|---|---|
| `POLICY.md` | El árbol de decisión (12 reglas en orden de prioridad) y qué hacer con cada evento |
| `send_policy.json` | Ventana de envío (lun–vie 09:00–18:00 hora del destinatario), tope diario (5,000), 14 días entre envíos, máximo 4 pasos, límites de APIs, reintentos (3 intentos, nunca reintentar errores 4xx; si el resultado es incierto, **consultar antes de reintentar**), frases prohibidas ("aprobación garantizada", "0% de comisión", "ahorra 30%", comparaciones…) y **qué puede y qué NO puede decidir la IA** |
| `ai_schemas.json` | El formato exacto que debe devolver la IA y el catálogo de reglas de validación (V001…V012, P001…P014, G001) |
| `funnel_assumptions.json` | Supuestos del embudo de ventas (sección 9) |

### Las 12 reglas de decisión (la primera que aplica gana)
1. Está suprimido / es competidor → **suprimir**. 2. Estado contradictorio → **persona**. 3. Es cliente → **suprimir**.
4. Cliente que se fue → **persona**. 5. Cuenta duplicada → **persona**. 6. Oportunidad abierta → **suprimir** (no estorbar).
7. Tiene AE → **pasar al AE**. 8. Perdimos hace menos de 90 días → **esperar**. 9. No cumple ICP → **suprimir**.
10. Envío en los últimos 14 días, o 4 envíos sin respuesta → **esperar**. 11. Faltan datos o están viejos → **enriquecer**
(si ya se intentó 2 veces → **persona**). 12. Si no → **contactar** al mejor contacto (finanzas > compras > ejecutivos >
operaciones…, y dentro de eso el de mayor jerarquía).

---

## 9. Parte E, impacto de negocio (simulado)

El reto pide explicar cómo se sabría si el sistema genera **ventas adicionales** y no solo más correos. Para ilustrar el método:

* **`experiment_assignments`** (50,000): cada cuenta se asigna al azar a **control** (proceso actual con SDRs) o **tratamiento**
  (el sistema). 25,000 y 25,000. La asignación va **por dominio**: dos cuentas con el mismo dominio siempre caen en el mismo
  grupo (para que no se contaminen).
* **`experiment_sim_outcomes`** (50,000): resultados **inventados** de un mes bajo los supuestos de `funnel_assumptions.json`
  (cobertura de SDRs 30% vs 97%, tasas de respuesta, valor de las ventas…). Cada fila tiene `simulated: true`.
* **`data/reports/impact_example.md`**: ejemplo trabajado con tamaños de muestra, prueba A/A (comparar dos grupos idénticos
  para ver que el método no "descubra" diferencias que no existen) y guardrails (bajas, quejas, rebotes).

> ⚠️ **Esto NO es evidencia de que el sistema funcione.** Es una demostración del método con supuestos. Antes de concluir algo,
> hay que reemplazar los supuestos con el embudo real de Clara. Un hallazgo honesto del ejemplo: aun suponiendo un efecto de
> ~2×, un mes de 50,000 cuentas **no alcanza** para declarar significativo el indicador principal (el intervalo incluye 0).

---

## 10. Parte F, la respuesta correcta (la "verdad")

Carpeta `truth/`. Contiene el solucionario para poder medir:

| Archivo | Filas | Qué dice |
|---|---|---|
| `truth_accounts` | 50,000 | Qué debe decidir el sistema por cuenta, el motivo, el mejor contacto, hasta cuándo esperar y a qué AE rutear |
| `truth_events` | 55,945 | Qué travesura tiene cada evento y cómo debe manejarse |
| `truth_replies` | 1,524 | Etiqueta correcta, datos que deben extraerse y acciones **inseguras** para cada respuesta |
| `truth_facts` | 80,951 | Si cada hecho es trampa y por qué |

**¿Cómo se sabe que esa verdad es correcta?** Se calcula **dos veces de forma independiente**: una por el diseño del escenario y
otra por un "oráculo" (`generator/oracle.py`) que mira solo las tablas y decide con las reglas. Si discrepan en **una sola
cuenta**, la validación falla. Hoy coinciden en las 50,000.

---

## 11. Por qué esos porcentajes

Esta es la pregunta más importante. **Ningún porcentaje viene de la realidad de Clara.** Son decisiones de diseño con dos
propósitos:

### 11.1 Cuotas de escenarios (cuentas)
Cada cuenta recibe un "escenario principal" por **cuota exacta**, no por azar: si pido 8% de clientes salen exactamente 4,000.
Con el azar puro, un caso raro (0.5%) podría salir 190 o 310 veces o casi ninguna y no se podría probar. Con cuotas, **todo
caso tiene suficientes ejemplos**.

| Escenario | % | Cuentas | Para qué existe |
|---|---|---|---|
| Prospecto limpio | 38.0 | 19,000 | Camino feliz: la respuesta es "contactar" |
| Envío reciente | 14.0 | 7,000 | Probar "esperar" |
| Con AE asignado | 10.0 | 5,000 | Probar "pasar al AE" |
| Cliente | 8.0 | 4,000 | **Nunca** contactar a un cliente |
| Secuencia agotada | 5.0 | 2,500 | 4 envíos sin respuesta |
| Datos faltantes | 5.0 | 2,500 | Probar "enriquecer" (y el límite de 2 intentos) |
| Fuera de ICP | 4.0 | 2,000 | Muy chica o gobierno/ONG |
| Oportunidad activa | 3.0 | 1,500 | No estorbar al AE |
| Suprimida | 2.5 | 1,250 | Bajas, quejas, DNC, bloqueo legal, competidor |
| Contacto suprimido, otro disponible | 2.0 | 1,000 | Elegir **otro** contacto |
| Cliente que se fue | 2.0 | 1,000 | Reconquista la decide una persona |
| Cuenta duplicada | 2.0 | 1,000 | Mismo dominio, otro nombre |
| Perdida reciente | 2.0 | 1,000 | Enfriamiento de 90 días |
| Estado contradictorio | 1.5 | 750 | CRM dice cliente pero no hay venta, o al revés |
| Carrera: oportunidad tardía | 0.5 | 250 | Un aviso llega tarde |
| Carrera: baja tardía | 0.5 | 250 | Lo más riesgoso: una baja llega tarde |

Los porcentajes grandes se parecen a un embudo de prospección típico (muchas cuentas limpias, bastantes en pausa, algunos
clientes); los chicos son casos **deliberadamente sobre-representados** (en la realidad una baja tardía sería mucho más rara que
0.5%) para poder probarlos.

### 11.2 Tasas de problemas en eventos
Duplicados 3% + 1.5% + 0.5%, retrasos 2.5%, malformados 1%: son órdenes de magnitud **plausibles** para webhooks reales
(los reintentos de proveedores y los retrasos son comunes, la corrupción es rara) y suficientemente altos para dar cientos de
ejemplos de cada uno.

### 11.3 Distribuciones "naturales"
País (México 36%, Brasil y Colombia 20%…), tamaños y cargos están calibrados para parecerse a un mercado de prospección de
empresas medianas en Latinoamérica. Son **razonables, no medidos**.

### 11.4 Los supuestos más importantes (los únicos que conviene cuestionar)
Umbral ICP de 11 empleados · 14 días entre envíos · 4 envíos máximo · enfriamiento de 120 y 90 días · 90 días para considerar
datos "viejos" · umbral de confianza de la IA 0.75 · tope de 5,000 envíos al día · todas las tasas del embudo de la sección 9.
Están agrupados en `generator/config.py`, `send_policy.json` y `funnel_assumptions.json`.

---

## 12. Qué está mal A PROPÓSITO y qué está mal DE VERDAD

Preguntaste "qué sección es errónea". Hay dos clases de cosas, y no conviene mezclarlas.

### 12.1 Errores intencionales (la data está "sucia" para probar el sistema)
| Dónde | Qué está mal | Cuántos | Por qué |
|---|---|---|---|
| `events` | Avisos corruptos (siete tipos) | 508 | Probar la cola de errores |
| `events` | Avisos duplicados | 2,650 | Probar idempotencia |
| `events` | Avisos retrasados o fuera de orden | 1,846 | Probar el orden por fecha real |
| `events` | Tipo `lead_scored` | 65 | Tipo desconocido |
| `contacts` | Correos mal escritos / ausentes / genéricos / personales | 12,649 (10.6%) | No escribir a correos inservibles |
| `accounts` | 262 sin tamaño ni industria; 608 sin contactos | 870 | Probar "enriquecer" |
| `accounts` | Mismo dominio en dos cuentas | 1,000 | Probar duplicados |
| `accounts` | CRM contradictorio | 750 | Probar escalamiento |
| `company_facts` | Viejos, sin verificar, de otra empresa o que contradicen | 25,759 (31.8%) | Probar que la IA no use hechos malos |
| `mock_behavior` | APIs que fallan o se cuelgan | 4–12% según sistema | Probar reintentos |
| respuestas | Inyecciones, vacías, ambiguas, contradictorias | 288 ambiguas y 33 inyecciones | Probar la IA |
| Respuestas | Typos y ruido (hilo citado, avisos legales) | variable | Realismo |

Todo esto está **etiquetado en la verdad**: sabemos exactamente qué está mal y qué debería pasar.

### 12.2 Errores reales (limitaciones que no son parte del diseño)
Ninguno de los 27 chequeos automáticos de integridad falla hoy. Lo que sí debes saber:

1. **La política es mía.** El oráculo y el generador los escribí con la misma política, así que prueban que la data es
   **consistente**, no que la **política sea la correcta** para Clara.
2. **Las respuestas son más limpias que las reales.** 117 frases base escritas a mano más variaciones automáticas. Las
   respuestas reales son más variadas y desordenadas.
3. **Los volúmenes de eventos son ~56k, no cientos de miles.** Los eventos de entrega y apertura de correos no están
   pregenerados; los producirá el simulador al ejecutarse.
4. **El impacto es simulado.** Ver sección 9.
5. **El efecto de un mes pequeño:** con 50,000 cuentas un mes alcanza solo para detectar mejoras grandes (≥ ~100%) del
   indicador de ventas.
6. **Los nombres sintéticos podrían coincidir por casualidad con una empresa real.** Es muy improbable y los dominios son
   `.example`, pero no puedo garantizarlo al 100%.
7. **Cuentas "al tope" de AE:** 13 de 38 AEs activos; es deliberado, pero la distribución exacta de carga es inventada.
8. **Zonas horarias fijas** (sin horario de verano), válidas para octubre de 2026.

---

## 13. Cómo sabemos que la data es confiable

**27 chequeos automáticos** sobre los 299 MB (`data_profile.md`) y **47 pruebas** (`tests/`). Los más importantes:

| Qué se verifica | Por qué importa |
|---|---|
| El mismo `seed` produce los mismos archivos (hash idéntico) | Reproducibilidad |
| Las cuotas son exactas | Todo caso tiene ejemplos |
| Nada apunta a algo que no existe (cuentas, contactos, AEs) | Integridad |
| Todos los dominios terminan en `.example` | Seguridad |
| El oráculo independiente coincide con la verdad en las **50,000** cuentas | La verdad no se contradice |
| Ninguna etiqueta de la verdad se filtra a las tablas visibles | La prueba es justa |
| Las 220 grabaciones de IA reciben el veredicto esperado de un validador de referencia | Los defectos son reales |
| Cada anotación de las 117 semillas está respaldada por su texto | La IA no puede "adivinar" |
| Clientes, suprimidos, duplicados y conflictos **jamás** son "contactar" | Seguridad de negocio |
| Las cuentas con el mismo dominio caen en el mismo grupo de experimento | Sin contaminación |
| Ningún nombre de las antiguas empresas reales aparece en el repo | Solo data sintética |

Además, cuando una prueba falló durante la construcción, **corregí el error en mi propio código** (por ejemplo, mi primera
prueba A/A usaba una aproximación estadística que no sirve con pocos casos; ahora usa una prueba exacta).

---

## 14. Qué va en git y qué no

Rama: **`claude/growth-orchestrator-data`** (no hay PR ni merge; no se hizo deploy). Todo vive en `growth-orchestrator/`.

```
growth-orchestrator/
├── generator/            ← el programa que fabrica todo (Python, sin instalar nada)
├── tests/                ← 47 pruebas automáticas
├── prompts/              ← el prompt para ampliar respuestas con una IA
├── data/
│   ├── README.md · POLICY.md · PDF_TRACEABILITY.md · REPORTE_DATA.md (este)
│   ├── reports/          ← data_profile.md (números) · impact_example.md (simulación)
│   ├── seed/             ← EN GIT (2.6 MB, revisado): semillas, golden set, evals, plantillas,
│   │   │                    políticas, grabaciones de IA, demo, y sample/ (500 cuentas completas)
│   └── generated/        ← NO EN GIT (299 MB, se regenera): el mundo completo de 50,000 cuentas
│       ├── *.jsonl y growth.sqlite    (lo que ve el sistema)
│       └── truth/                     (la verdad: solo para pruebas)
```

---

## 15. Limitaciones honestas

* No hay todavía **sistema**: el orquestador, el runner del eval de IA, el diagrama de arquitectura y el decision log están
  **pendientes**. Esto es solo la capa de data.
* Las cifras de impacto no son evidencia (sección 9).
* La validación de la política requiere a alguien de negocio de Clara.
* Para medir realismo de las respuestas lo ideal sería probar con 10 a 20 respuestas reales anonimizadas.

---

## 16. Cómo regenerarla y leerla

Desde `growth-orchestrator/`:

```bash
python3 -m generator all --seed 42 --n 50000     # ~1.5 min. Genera todo y valida
python3 -m unittest discover -s tests -t .       # corre las 47 pruebas
```

Para **mirar** la data sin programar: abre cualquier `.jsonl` con un editor de texto (una fila por línea), abre
`growth.sqlite` con cualquier visor de SQLite, y lee `data/reports/data_profile.md` para ver las distribuciones.
Si solo quieres entender un caso: abre `data/seed/golden_scenarios.jsonl` (81 casos con la respuesta correcta) o
`data/seed/demo_flows.json` (el guion de la demostración).

Para cambiar el tamaño: `--n 5000` (rápido, para probar) o `--n 500000` (diez veces el volumen).
