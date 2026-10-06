"""Evidence for the web page's "Live Demo" and "Run Operations" views, produced by the real engine.

flows_payload():      five curated end-to-end runs, each broken into the seven stages
                      event -> state -> rules -> model -> validator -> action -> audit trail
operations_payload(): the whole 50k world's event stream through one engine instance, reduced to operating metrics

Model answers are an offline fixture (a deterministic stand-in), except for the deliberate "model mistake" in the guard
flow, which is a simulated answer. Both are labelled as such in the payload.
"""
from __future__ import annotations

import copy
import json
from collections import Counter
from pathlib import Path

import hashlib

from . import db, plain, scenario, scoring, state
from .ai import draft as ai_draft
from .ai.fixture import FixtureLLM, reply_output
from .engine import SENDERS, Orchestrator
from .rules import decide
from .windows import next_send_time
from .policy import SEED_DIR, Policy
from .timeutil import parse

ROOT = Path(__file__).resolve().parent.parent
GENERATED = ROOT / "data" / "generated"
GUARD_TEXT = "I'm interested, but don't email me again."
RECORDED = "Recorded run of the real engine. The model's answer is an offline fixture (a deterministic stand-in), not a live call."
SIMULATED = ("Recorded run of the real engine. The model's answer is a SIMULATED mistake: we hand the engine an \"interested\" answer, "
             "because a strong model usually gets this reply right. Use the live button to see what Claude really says.")

# (flow id, title, one-line story, golden scenario, event index, extra)
FLOWS = [
    ("F1", "A prospect says they are interested", "The happy path: the reply is read, checked, and the account goes to a sales exec.", "G068", 0, RECORDED),
    ("F2", "\"I'm interested, but don't email me again\"", "The model reads the interest. The rules read the opt-out. The rules win.", "G064", 0, SIMULATED),
    ("F3", "The same webhook arrives twice", "The second delivery is recognised and ignored: no second email.", "G040", 1, RECORDED),
    ("F4", "The email API fails once", "A 503 is retried safely: exactly one email is recorded.", "G070", 0, RECORDED),
    ("F5", "A reply too vague to act on", "The model labels it ambiguous, so nothing happens automatically: a person decides.", "G067", 0, RECORDED),
]


def _short(d: dict) -> str:
    return ", ".join(f"{k}: {v}" for k, v in d.items() if v not in (None, "", [], {}))[:220]


def _stage(sid, name, status, headline, lines=()):
    return {"id": sid, "name": name, "status": status, "headline": headline, "lines": list(lines)}


def _run(g: dict, idx: int, llm=None):
    orch = scenario.build(g, llm)
    aid = g["events"][0]["account_id"]
    for ev in g["events"][:idx]:
        orch.process(ev)
    ev, v0 = g["events"][idx], state.version(orch.conn, aid)
    res = orch.process(ev)
    return orch, ev, res, v0, state.version(orch.conn, aid)


def _compose(fid, title, story, label, orch, ev, res, v0, v1) -> dict:
    r, aid = res.to_dict(), ev["account_id"]
    dup = res.handling in ("ignore_duplicate", "dedupe_by_content")
    trail = [a for a in orch.audit.trail(account_id=aid)
             if (a["delivery_id"] == ev["delivery_id"] if dup else a["event_id"] == ev["event_id"])]
    reply = ev["type"] == "reply_received"
    ai = r.get("ai") or {}
    act = plain.ACTIONS.get(res.final_action or res.action or "", [res.action or "no action", ""])
    final = res.action
    st = []
    text = (ev.get("payload") or {}).get("body_text")
    st.append(_stage("event", "Event comes in", "done", plain.EVENTS.get(ev["type"], ev["type"]),
                     [f'Delivery {ev["delivery_id"]}, source {ev.get("source", "?")}'] + ([f'"{text.strip()}"'] if text else [])))
    if dup:
        st.append(_stage("state", "State changes", "skipped", f"Already processed: state stays at version {v0}", ["The delivery id was seen before."]))
        st.append(_stage("rules", "Rules decide", "skipped", "Nothing to decide: this is a duplicate"))
        st.append(_stage("model", "Claude interprets", "skipped", "No AI call needed"))
        st.append(_stage("validator", "Validator checks", "skipped", "Nothing to validate"))
        st.append(_stage("action", "Action is recorded", "done", "Ignored as a duplicate: no second effect", ["No second email, no second CRM note."]))
    else:
        changed = {"reply_received": "The reply is stored and the earlier outreach is marked as replied.",
                   "account_targeted": "The company enters the pipeline and its eligibility is evaluated."}.get(ev["type"], "The new fact is applied to the account.")
        st.append(_stage("state", "State changes", "done", f"Account state version {v0} to {v1}", [changed]))
        if reply:
            crm = ai.get("crm_state", "prospect").replace("_", " ")
            st.append(_stage("rules", "Rules decide", "done", f"The account is a {crm}: prospecting rules apply",
                             ["Rules fix which actions are allowed for this account. The model cannot widen them."]))
        else:
            codes = [plain.CODES.get(c, c) for c in res.reason_codes]
            st.append(_stage("rules", "Rules decide", "done", f"Decision: {plain.ACTIONS.get(res.action, [res.action])[0]}",
                             codes + ["Deterministic policy: no AI involved in this decision."]))
        if ai.get("used_ai") or (ai and ai.get("task") == "draft" and ai.get("used_ai")):
            if reply:
                conf = f' ({ai["confidence"]})' if ai.get("confidence") is not None else ""
                st.append(_stage("model", "Claude interprets", "done", f'Claude reads the reply as "{ai.get("label")}"{conf}',
                                 [f'Source of this answer: {"a simulated model mistake" if fid == "F2" else "an offline stand-in for the model (not a live call)"}.', "It only proposes: label and extracted facts. It never picks the action."]))
            else:
                st.append(_stage("model", "Claude interprets", "done", "Claude drafts an opening line from verified facts", ["It may restate a verified fact, nothing else."]))
        else:
            why = "No verified fact to mention, so the generic template is used." if ai.get("task") == "draft" else "Nothing to interpret here: the rules decide alone."
            st.append(_stage("model", "Claude interprets", "skipped", "No AI call needed", [why]))
        if ai and ai.get("used_ai"):
            codes = ai.get("codes") or []
            head = "The rules overrode the model" if "G001" in codes else plain.VERDICTS.get(ai.get("verdict"), ai.get("verdict"))
            st.append(_stage("validator", "Validator checks", "done" if ai.get("verdict") in ("accept", "accept_with_warning") else "flag", head,
                             [plain.VALIDATION_CODES.get(c, c) for c in codes] or ["No violations."]))
        else:
            st.append(_stage("validator", "Validator checks", "skipped", "Nothing to validate", []))
        eff = []
        for e in r.get("effects") or []:
            if e.get("system") == "send":
                n = e.get("attempts", 1)
                eff.append("Email recorded in the simulated log" + (f" after {n} attempts: the first call failed with a temporary error and was retried safely" if n > 1 else "") + ". Nothing is sent.")
            elif e.get("system") == "crm":
                eff.append("CRM note written" if e.get("kind") == "decision_note" else "Task created for the sales exec")
            elif e.get("system") == "nurture":
                eff.append("Enrolled in the slow follow-up track")
        if r.get("cancel_pending_outreach"):
            eff.append("Pending outreach to this contact cancelled")
        if res.action == "suppress" and reply:
            eff.append("Contact added to the suppression list")
        if r.get("needs_human_review") or res.action == "escalate_human":
            eff.append("Queued for a person to review")
        if r.get("route_to_ae_id"):
            eff.append(f'Routed to sales exec {r["route_to_ae_id"]} ({r.get("route_reason")})')
        st.append(_stage("action", "Action is recorded", "done", f'Final action: {act[0]}', eff or [act[1]]))
    st.append(_stage("audit", "Audit trail", "done", f"{len(trail)} steps written", [f'{a["kind"].replace("_", " ")}' for a in trail]))
    out = {"id": fid, "title": title, "story": story, "label": label, "stages": st,
           "audit": [{"kind": a["kind"], "ts": a["ts"], "detail": _short(a["detail"])} for a in trail],
           "final": {"action": res.final_action or res.action, "codes": list(res.reason_codes), "text": act[0]}}
    if fid == "F2":
        out["contradiction"] = {"text": text, "claude_label": ai.get("label"), "claude_confidence": ai.get("confidence"),
                                "guard": "G001" in (ai.get("codes") or []), "final_action": res.action}
    return out


def flows_payload() -> dict:
    golden = {g["id"]: g for g in scenario.load_golden()}
    out = []
    for fid, title, story, gid, idx, label in FLOWS:
        g, llm = copy.deepcopy(golden[gid]), None
        if fid == "F2":
            g["events"][0]["payload"]["body_text"] = GUARD_TEXT
            llm = FixtureLLM({GUARD_TEXT: reply_output("interested", GUARD_TEXT, {"interest_level": "high"}, 0.93)})
        orch, ev, res, v0, v1 = _run(g, idx, llm)
        out.append(_compose(fid, title, story, label, orch, ev, res, v0, v1))
    return {"label": RECORDED, "flows": out, "guard_text": GUARD_TEXT, "plain": {"actions": plain.ACTIONS}}


# ------------------------------------------------------------------------------------------------------------------
def _jsonl(p: Path):
    return [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]


HUMAN = {"handoff_ae", "escalate_human"}


def operations_payload(world: Path = GENERATED) -> dict:
    """The whole event stream of the 50k world through one engine instance, as operating metrics."""
    manifest = json.loads((world / "manifest.json").read_text(encoding="utf-8"))
    conn = db.connect()
    db.load_world_dir(conn, world)
    events = _jsonl(world / "events.jsonl")
    by_id = {e["event_id"]: e for e in events}
    answers = {by_id[r["event_id"]]["payload"]["body_text"]: reply_output(r["label"], by_id[r["event_id"]]["payload"]["body_text"], r.get("extracted"))
               for r in _jsonl(world / "truth" / "truth_replies.jsonl") if r["event_id"] in by_id}
    orch = Orchestrator(conn, llm=FixtureLLM(answers), as_of=parse("2026-10-01T16:00:00Z"))
    res = [orch.process(e) for e in events]
    handling = Counter(r.handling for r in res)
    decided = [r for r in res if r.action and r.handling in ("process", "retry_then_process", "process_and_reconcile", "reread_and_reevaluate", "reconcile_before_retry")]
    final = Counter((r.final_action or r.action) for r in decided)
    human = sum(n for a, n in final.items() if a in HUMAN)
    q = lambda sql: conn.execute(sql).fetchone()[0]
    ai_total = q("SELECT COUNT(*) FROM ai_calls")
    verdicts = Counter(r[0] for r in conn.execute("SELECT verdict FROM ai_calls"))
    failed = sum(n for v, n in verdicts.items() if v in ("reject_retry", "reject_escalate", "llm_unavailable", "escalate_low_confidence"))
    guard = q("SELECT COUNT(*) FROM ai_calls WHERE violation_codes LIKE '%G001%'")
    retried = sum(1 for r in res if r.handling in ("retry_then_process", "reconcile_before_retry"))
    time = json.loads((SEED_DIR / "time_assumptions.json").read_text(encoding="utf-8"))
    return {"label": "The full event stream of the 50,000-account world through the real engine, offline fixture model, nothing sent.",
            "n_accounts": manifest["n_accounts"], "events": len(events), "decided": len(decided),
            "handling": dict(handling), "final_actions": {str(k): v for k, v in final.items()},
            "automated": len(decided) - human, "human": human,
            "review_queue": q("SELECT COUNT(*) FROM review_queue"), "dead_letters": q("SELECT COUNT(*) FROM dead_letters"),
            "duplicates_prevented": handling["ignore_duplicate"] + handling["dedupe_by_content"],
            "ai": {"calls": ai_total, "by_kind": dict(Counter(r[0] for r in conn.execute("SELECT kind FROM ai_calls"))), "verdicts": dict(verdicts),
                   "failed": failed, "opt_out_guard": guard,
                   "cost_per_call_usd": time["ai_cost_usd_per_call"], "cost_usd": round(ai_total * time["ai_cost_usd_per_call"], 2)},
            "unsafe_prevented": {"ineligible_not_contacted": sum(1 for r in decided if r.action in ("suppress", "wait", "escalate_human") and r.handling != "retry_then_process"),
                                 "late_events_reconciled": handling["process_and_reconcile"],
                                 "opt_out_guard_overrides": guard,
                                 "ai_outputs_rejected": verdicts.get("reject_retry", 0) + verdicts.get("reject_escalate", 0)},
            "retried_then_ok": retried, "emails_in_simulated_log": len(orch.mocks.ledger["send"]), "real_emails_sent": 0}


# ------------------------------------------------------------------------------------------------------------------
BATCH = 200


def approvals_payload(world: Path = GENERATED, batch: int = BATCH) -> dict:
    """The approval queue: a batch of the prepared first emails (tiers A and B) drawn deterministically from all 50,000 accounts.

    The totals are exact for the whole world; the page loads `batch` drafts to review. Drafts are what the engine prepares
    with the offline stand-in model (it restates the first verified fact exactly); nothing is ever sent."""
    cfg, policy, now = scoring.load_config(), Policy.load(), parse("2026-10-01T16:00:00Z")
    conn = db.connect()
    db.load_world_dir(conn, world)
    facts = {}
    for f in db.rows(conn, "SELECT * FROM company_facts ORDER BY fact_id"):
        facts.setdefault(f["account_id"], []).append(f)
    queue = {"A": [], "B": []}
    for a in db.rows(conn, "SELECT * FROM accounts ORDER BY account_id"):
        d = decide(conn, a["account_id"], now, policy)
        if d.action != "contact":
            continue
        feat = scoring.features(a, facts.get(a["account_id"], []), cfg)
        sc = scoring.score(feat, cfg)
        if sc["tier"] != "C":
            queue[sc["tier"]].append((a, d, feat, sc))
    total = sum(len(v) for v in queue.values())
    templates, rules, llm = ai_draft.load_templates(), policy.send["content_rules"], FixtureLLM()
    take = {"A": round(batch * len(queue["A"]) / total)}
    take["B"] = batch - take["A"]
    items = []
    for tier in ("A", "B"):
        pick = sorted(queue[tier], key=lambda x: hashlib.sha256(x[0]["account_id"].encode()).hexdigest())[: take[tier]]
        for a, d, feat, sc in pick:
            contact = db.one(conn, "SELECT * FROM contacts WHERE contact_id=?", (d.best_contact_id,))
            sender = SENDERS[int(hashlib.sha256(a["account_id"].encode()).hexdigest(), 16) % len(SENDERS)]
            dr = ai_draft.compose(llm, a, contact, facts.get(a["account_id"], []), 1, sender, now, rules, templates)
            when = next_send_time(now, a["country"], policy)
            tz = policy.send["timezones"][a["country"]]
            local = when + __import__("datetime").timedelta(hours=tz["utc_offset_hours"])
            items.append({"id": a["account_id"], "name": a["name"], "country": a["country"], "industry": a["industry"],
                          "employees": a["employee_count"], "tier": sc["tier"], "score": sc["score"], "parts": sc["parts"],
                          "contact": {"name": f'{contact["first_name"]} {contact["last_name"]}', "title": contact["title"], "email": contact["email"]},
                          "subject": dr.subject, "body": dr.body, "mode": dr.mode, "claims": [c["text"] for c in dr.claims],
                          "signals": feat["signals"][:3], "sender": sender,
                          "window": f'{local.strftime("%a %d %b, %H:%M")} local time ({tz["iana"]})'})
    items.sort(key=lambda x: (-x["score"], x["id"]))
    return {"label": "Computed by the real engine on the 50,000-account world. The page loads a batch to review; nothing is ever sent.",
            "as_of": "2026-10-01T16:00:00Z", "total_prepared": total, "by_tier": {t: len(v) for t, v in queue.items()},
            "batch": len(items), "personalized": sum(1 for i in items if i["mode"] == "personalized"), "items": items}
