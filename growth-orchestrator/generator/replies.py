"""Turns frozen reply seeds into realistic labelled reply bodies (greetings, signatures, quoted threads, typos)."""
from __future__ import annotations

import re
from datetime import datetime, timedelta

from .config import REPLY_LABEL_WEIGHTS
from .reply_seeds import (BY_LABEL, LABEL_ACTION, LABEL_INTEREST, NEEDS_HUMAN_REVIEW, UNSAFE_ACTIONS)
from .names import SDR_NAMES
from .util import wpick

MONTHS = {
    "es": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre",
           "noviembre", "diciembre"],
    "pt": ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro",
           "novembro", "dezembro"],
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
           "November", "December"],
}
GREET = {"es": ["", "Hola {first},\n\n", "Buen día,\n\n", "Estimado {first}:\n\n", "¡Hola!\n\n"],
         "en": ["", "Hi,\n\n", "Hello {first},\n\n"], "pt": ["", "Olá,\n\n", "Bom dia,\n\n"]}
CLOSE = {"es": ["", "\n\nSaludos", "\n\nSaludos,\n{full}\n{title}\n{company}", "\n\nGracias,\n{first}",
                "\n\nEnviado desde mi iPhone"],
         "en": ["", "\n\nBest,\n{first}", "\n\nThanks,\n{full}\n{title}\n{company}", "\n\nSent from my iPhone"],
         "pt": ["", "\n\nAbraços,\n{first}", "\n\nAtenciosamente,\n{full}\n{title}\n{company}"]}
QUOTE_HEAD = {"es": "El {date}, {sdr} escribió:", "en": "On {date}, {sdr} wrote:", "pt": "Em {date}, {sdr} escreveu:"}
QUOTE_BODY = {"es": "Hola {first}, soy {sdr} de Clara. Ayudamos a empresas como {company} a controlar gastos con tarjetas corporativas.",
              "en": "Hi {first}, this is {sdr} from Clara. We help companies like {company} control spend with corporate cards.",
              "pt": "Olá {first}, sou {sdr} da Clara. Ajudamos empresas como a {company} a controlar gastos com cartões corporativos."}
# Realistic noise: quoted outbound emails carry an unsubscribe footer the classifier must NOT treat as the reply.
QUOTE_FOOT = {"es": "Si prefieres no recibir más mensajes, responde BAJA.",
              "en": "If you'd rather not hear from us, reply STOP.",
              "pt": "Se preferir não receber mais mensagens, responda SAIR."}
DISCLAIMER = {"es": "\n\nAviso: este mensaje y sus anexos son confidenciales y para uso exclusivo del destinatario.",
              "en": "\n\nNotice: this message is confidential and intended solely for the addressee.",
              "pt": "\n\nAviso: esta mensagem é confidencial e destinada exclusivamente ao destinatário."}
RAW_LABELS = {"vacio_truncado", "auto_respuesta", "prompt_injection"}  # keep body raw (no greetings/typos)

# crm states: customer | churned_customer | active_opportunity | ae_assigned | prospect
OPT_OUT_LABELS = {"unsubscribe", "hostil", "mixto_contradictorio"}


def final_action(label: str, crm_state: str) -> str:
    """Expected safe action for a reply once account state is taken into account."""
    if label in OPT_OUT_LABELS:
        return "suppress"  # opt-out always wins, whatever the account state
    base = LABEL_ACTION[label]
    if crm_state in ("customer", "churned_customer"):
        return base if base in ("no_action", "wait") else "escalate_human"  # never a prospecting path
    if crm_state in ("active_opportunity", "ae_assigned") and label in ("pregunta_informacion", "objecion"):
        return "handoff_ae"  # the owning AE answers
    return base


def pick_label(r) -> str:
    return wpick(r, REPLY_LABEL_WEIGHTS)


def pick_seed(r, label: str, lang: str) -> dict:
    pool = BY_LABEL[label]
    same = [s for s in pool if s["lang"] == lang]
    return r.choice(same) if same and r.random() < 0.9 else r.choice(pool)


def _fmt_date(dt: datetime, lang: str) -> str:
    m = MONTHS[lang][dt.month - 1]
    return f"{m} {dt.day}" if lang == "en" else f"{dt.day} de {m}"


def _typo(text: str, r) -> str:
    words = text.split(" ")
    idx = [i for i, w in enumerate(words)
           if len(re.sub(r"\W", "", w)) >= 5 and not re.search(r"[\d@{<>]", w) and not w.isupper()]
    if not idx:
        return text
    i = r.choice(idx)
    ch = list(words[i])
    pos = r.randrange(1, len(ch) - 2)
    ch[pos], ch[pos + 1] = ch[pos + 1], ch[pos]
    words[i] = "".join(ch)
    return " ".join(words)


def resolve(seed: dict, occurred: datetime, ref: tuple[str, str]):
    """Replace date/referral tokens. Returns (text, dates, has_ref_name, has_ref_email)."""
    lang, text, dates = seed["lang"], seed["text"], []

    def _date(m):
        d = occurred + timedelta(days=int(m.group(1)))
        dates.append(d)
        return _fmt_date(d, lang)

    text = re.sub(r"\{d\+(\d+)\}", _date, text)
    has_name, has_email = "{ref_name}" in text, "{ref_email}" in text
    return text.replace("{ref_name}", ref[0]).replace("{ref_email}", ref[1]), dates, has_name, has_email


def expected_extraction(seed, dates, ref, has_name, has_email):
    return {"interest_level": LABEL_INTEREST[seed["label"]],
            "follow_up_date": dates[-1].date().isoformat() if dates else None,
            "referred_contact": ({"name": ref[0] if has_name else None, "email": ref[1] if has_email else None}
                                 if (has_name or has_email) else None)}


def render_reply(seed: dict, ctx: dict, r) -> dict:
    """ctx: first, full, title, company, occurred (datetime), ref=(name, email), crm_state."""
    lang, label = seed["lang"], seed["label"]
    text, dates, has_name, has_email = resolve(seed, ctx["occurred"], ctx["ref"])
    # A typo must not alter the information the model has to extract
    if label not in RAW_LABELS and r.random() < 0.12:
        text = _typo(text, r)

    fmt = {"first": ctx["first"], "full": ctx["full"], "title": ctx["title"], "company": ctx["company"]}
    body = text
    if label not in RAW_LABELS:
        body = r.choice(GREET[lang]).format(**fmt) + text + r.choice(CLOSE[lang]).format(**fmt)
    if r.random() < 0.08:
        body += DISCLAIMER[lang]
    if r.random() < 0.30:
        sdr = r.choice(SDR_NAMES)
        foot = QUOTE_FOOT[lang] if r.random() < 0.5 else ""
        quoted = [QUOTE_HEAD[lang].format(date=_fmt_date(ctx["occurred"] - timedelta(days=r.randint(1, 20)), lang),
                                          sdr=sdr),
                  QUOTE_BODY[lang].format(first=ctx["first"], sdr=sdr.split()[0], company=ctx["company"])]
        if foot:
            quoted.append(foot)
        body += "\n\n" + "\n".join("> " + q for q in quoted)

    action = final_action(label, ctx["crm_state"])
    return {
        "text": body, "language": lang, "seed_id": seed["seed_id"], "label": label,
        "difficulty": seed["difficulty"], "is_ambiguous": seed["ambiguous"],
        "extracted": expected_extraction(seed, dates, ctx["ref"], has_name, has_email),
        "expected_action": action, "unsafe_actions": UNSAFE_ACTIONS[label],
        "needs_human_review": label in NEEDS_HUMAN_REVIEW,
    }
