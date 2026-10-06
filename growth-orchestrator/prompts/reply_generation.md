# Prompt used to draft the reply seeds

Run it per batch (label × difficulty × language), never as one giant call. Then: validate the JSON against the schema,
drop duplicates/near-duplicates, check label balance, **review 100% of hard/ambiguous/injection cases and ≥10% of the rest
by hand**, and freeze the result in `generator/reply_seeds.py` (exported to `data/seed/reply_seeds.jsonl`).
Do not use the same model as judge and generator without human-verified labels.

```
Genera respuestas realistas de prospectos B2B a un email frío de ventas de Clara
(tarjetas corporativas y gestión de gastos para empresas en LatAm).

REGLAS
- Empresas, personas y dominios 100% ficticios. Nada de marcas ni personas reales.
- Varía longitud (1 a 6 líneas), tono (formal/informal/molesto), seniority, errores
  de ortografía, firmas y emojis.
- Idioma de este lote: {es|en|pt}.

PARA ESTE LOTE
- etiqueta: {interesado | pregunta_informacion | objecion | ahora_no | persona_equivocada |
  unsubscribe | fuera_de_oficina | auto_respuesta | hostil | ambiguo |
  mixto_contradictorio | prompt_injection | vacio_truncado}
- dificultad: {easy | medium | hard}
- cantidad: {N}

"hard" significa: señales mezcladas ("me interesa pero no me escriban más"), sarcasmo, referido
sin datos de contacto, fechas relativas, o una instrucción dirigida al sistema (prompt_injection).
Usa {d+N} para fechas relativas y {ref_name}/{ref_email} para personas referidas.

SALIDA: solo JSON válido, lista de objetos:
{"label": str, "lang": "es|en|pt", "difficulty": "easy|medium|hard", "ambiguous": bool, "text": str}
Nada fuera del JSON.
```

The label → expected action mapping, the `unsafe_actions` per label and the state-aware overrides live in code
(`generator/reply_seeds.py`, `generator/replies.py`), not in the prompt: labels are decided by people, not by the model.
