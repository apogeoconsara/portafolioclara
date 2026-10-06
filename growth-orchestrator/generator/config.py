"""World parameters. Policy thresholds mirror data/POLICY.md (the ground-truth decision spec)."""
from __future__ import annotations

from datetime import datetime, timezone

AS_OF = datetime(2026, 10, 1, 9, 0, tzinfo=timezone.utc)  # state snapshot; the event stream covers the next month
STREAM_DAYS = 31
SCHEMA_VERSION = "1.0"

# Monthly target lists drop weekly; each drop is a burst (stresses rate limits / queues).
LIST_DROP_DAYS = [0, 7, 14, 21, 28]
LIST_WEIGHTS = [25, 25, 20, 15, 15]
LIST_BURST_MINUTES = 20

# ---- Policy thresholds -------------------------------------------------------------------
RECENT_OUTREACH_DAYS = 14
SEQUENCE_MAX_TOUCHES = 4
SEQUENCE_WINDOW_DAYS = 180
SEQUENCE_COOLDOWN_DAYS = 120
STALE_ENRICHMENT_DAYS = 90
LOST_COOLDOWN_DAYS = 90
ICP_MIN_EMPLOYEES = 11
MAX_ENRICH_ATTEMPTS = 2
OPEN_STAGES = ("discovery", "demo", "proposal", "negotiation")

# ---- Primary scenario quotas (% of accounts). Exact, not random, so rare cases always appear. ----
SCENARIO_QUOTAS = {
    "clean_prospect": 38.0,
    "partial_contact_suppression": 2.0,  # best contact unsubscribed, another contact still eligible
    "race_late_opportunity": 0.5,        # opportunity created before targeting but delivered after
    "race_late_unsubscribe": 0.5,        # unsubscribe happened before targeting but delivered after
    "customer": 8.0,
    "churned_customer": 2.0,
    "active_opportunity": 3.0,
    "ae_assigned": 10.0,
    "recent_outreach": 14.0,
    "max_touches_no_reply": 5.0,
    "suppressed": 2.5,
    "missing_data": 5.0,
    "duplicate_domain": 2.0,
    "low_icp": 4.0,
    "conflict_state": 1.5,
    "closed_lost_recent": 2.0,
}

# ---- Geography ----------------------------------------------------------------------------
# (code, name, language, weight, legal suffixes, cities)
COUNTRIES = [
    ("MX", "México", "es", 36, ["S.A. de C.V.", "S.A.P.I. de C.V.", "S. de R.L. de C.V."],
     ["Ciudad de México", "Monterrey", "Guadalajara", "Querétaro", "Puebla", "Tijuana", "León"]),
    ("CO", "Colombia", "es", 20, ["S.A.S.", "Ltda.", "S.A."],
     ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]),
    ("BR", "Brasil", "pt", 20, ["Ltda.", "S.A.", "EIRELI"],
     ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre"]),
    ("CL", "Chile", "es", 10, ["SpA", "S.A.", "Ltda."],
     ["Santiago", "Valparaíso", "Concepción"]),
    ("AR", "Argentina", "es", 8, ["S.A.", "S.R.L."],
     ["Buenos Aires", "Córdoba", "Rosario"]),
    ("PE", "Perú", "es", 6, ["S.A.C.", "S.A."],
     ["Lima", "Arequipa", "Trujillo"]),
]

# (name, weight, name words, icp_ok)
INDUSTRIES = [
    ("Logística y transporte", 9, ["Logística", "Transportes", "Cargo"], True),
    ("Agroindustria", 8, ["Agro", "Campos", "Agrícola"], True),
    ("Retail y comercio", 11, ["Comercial", "Retail", "Mercantil"], True),
    ("Manufactura", 11, ["Industrias", "Manufacturas", "Plásticos"], True),
    ("Tecnología y software", 10, ["Tech", "Sistemas", "Digital"], True),
    ("Salud", 7, ["Salud", "Clínica", "Médica"], True),
    ("Construcción e inmobiliaria", 8, ["Constructora", "Inmobiliaria", "Desarrollos"], True),
    ("Alimentos y bebidas", 7, ["Alimentos", "Bebidas", "Gourmet"], True),
    ("Servicios profesionales", 8, ["Consultores", "Asesores", "Servicios"], True),
    ("Educación", 3, ["Educación", "Instituto", "Academia"], True),
    ("Energía y minería", 4, ["Energía", "Minera", "Petroquímica"], True),
    ("Turismo y hospitalidad", 4, ["Hoteles", "Turismo", "Viajes"], True),
    ("Marketing y medios", 4, ["Media", "Marketing", "Estudio"], True),
    ("Gobierno y sector público", 1.5, ["Municipio", "Secretaría", "Instituto Público"], False),
    ("ONG y sin fines de lucro", 1.5, ["Fundación", "Asociación Civil", "ONG"], False),
]

# (band, min, max, weight)
BANDS = [
    ("1-10", 1, 10, 12),
    ("11-50", 11, 50, 28),
    ("51-200", 51, 200, 32),
    ("201-500", 201, 500, 16),
    ("501-1000", 501, 1000, 8),
    ("1000+", 1001, 8000, 4),
]

FREE_EMAIL_DOMAINS = ["gmail.example", "hotmail.example", "outlook.example", "yahoo.example"]
ROLE_INBOXES = ["info", "contacto", "finanzas", "compras", "administracion", "ventas"]

# Contact attribute weights
EMAIL_STATUS_WEIGHTS = [("valid", 78), ("unverified", 8), ("role_based", 5), ("catchall", 3),
                        ("invalid_syntax", 2), ("missing", 2), ("free_provider", 2)]
FUNCTION_WEIGHTS = [("finance", 35), ("operations", 15), ("procurement", 12), ("it", 8),
                    ("hr", 8), ("executive", 14), ("other", 8)]
SENIORITY_WEIGHTS = [("c_level", 12), ("vp", 8), ("director", 22), ("manager", 30), ("ic", 28)]
N_CONTACTS_WEIGHTS = [(1, 30), (2, 30), (3, 20), (4, 12), (5, 8)]

# Ranking used to choose the best contact (corporate cards -> finance/procurement buyers first)
FUNCTION_SCORE = {"finance": 5, "procurement": 4, "executive": 4, "operations": 3, "it": 2, "hr": 1, "other": 0}
SENIORITY_SCORE = {"c_level": 5, "vp": 4, "director": 3, "manager": 2, "ic": 1}

# ---- Perturbation rates (event stream) ---------------------------------------------------------
RATE_EXACT_DUP = 0.030      # same event_id + key re-delivered
RATE_SEMANTIC_DUP = 0.015   # new event_id, same idempotency_key
RATE_CONTENT_DUP = 0.005    # different source/key, same content (e.g. CRM mirror of a provider event)
RATE_DELAYED = 0.025        # received long after occurred
RATE_MALFORMED = 0.010      # extra corrupted deliveries

# ---- Mock external API behaviours (assigned deterministically per account) ----------------------
ENRICH_BEHAVIORS = [("ok", 88), ("timeout_once", 4), ("rate_limit_once", 3),
                    ("server_error_persistent", 2), ("malformed_response", 3)]
SEND_BEHAVIORS = [("ok", 93), ("transient_error_then_ok", 3), ("rate_limit_then_ok", 2),
                  ("uncertain_outcome", 1.2), ("hard_reject", 0.8)]
CALENDAR_BEHAVIORS = [("ok", 96), ("slot_conflict", 4)]

# ---- Replies --------------------------------------------------------------------------------
REPLY_LABEL_WEIGHTS = [
    ("interesado", 14), ("pregunta_informacion", 5.5), ("objecion", 12), ("ahora_no", 13),
    ("persona_equivocada", 8), ("unsubscribe", 9), ("fuera_de_oficina", 10), ("auto_respuesta", 8),
    ("hostil", 3), ("ambiguo", 8), ("mixto_contradictorio", 5), ("prompt_injection", 2.5),
    ("vacio_truncado", 2),
]
