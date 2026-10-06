"""Regenerate everything the Netlify page shows, from the real engine (python -m orchestrator export-web).

  public/data/runs.json      every golden scenario run through the engine: events, results, audit
                                          trail, mock calls and ledgers (model: offline fixture, labelled as such)
  public/data/stream.json    the 561-delivery sample stream summary
  public/data/evals.json     recorded-suite results (+ the latest live run if one was saved)
  public/data/cases.json     the 18 core eval cases (inputs + expectations) for the live panel
  netlify/functions/_orchestrator_prompts.mjs   prompts, tool schemas, labels and content rules: ONE source (Python)

The page never computes decisions itself; it shows what this code produced. The live panel calls the Netlify function,
which uses the same prompts and a JS port of the validators that is parity-tested against the Python ones.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

from . import db, evals, scenario
from .ai import prompts
from .ai.fixture import FixtureLLM, reply_output
from .ai.validate import LABEL_ACTION, NEEDS_HUMAN_REVIEW, OPT_OUT_LABELS
from .engine import Orchestrator
from .policy import SEED_DIR, Policy
from .timeutil import parse

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent
WEB = REPO / "public" / "data"
FN = REPO / "netlify" / "functions"
LABEL = ("Recorded run of the real Python engine. The AI steps used the offline fixture (a deterministic stand-in, "
         "not a model); use the Live AI tab to run the real model.")


def _jsonl(p: Path) -> list[dict]:
    return [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]


def runs() -> dict:
    flows = json.loads((SEED_DIR / "demo_flows.json").read_text(encoding="utf-8"))["flows"]
    out = []
    for g in scenario.load_golden():
        orch, results = scenario.run(g)
        trail = orch.audit.trail()
        out.append({
            "id": g["id"], "title": g["title"], "tags": g["tags"], "notes": g["notes"],
            "mock": {k: v for k, v in (g.get("mock") or {}).items() if v != "ok"},
            "state": {k: v for k, v in g["state"].items() if k in ("accounts", "contacts", "opportunities", "suppression",
                                                                     "outreach_history", "company_facts", "runtime_state")},
            "events": g["events"], "expected": g["expected"],
            "results": [r.to_dict() for r in results],
            "audit": [{"ts": t["ts"], "kind": t["kind"], "event_id": t["event_id"], "detail": t["detail"]} for t in trail],
            "calls": [list(map(str, c)) for c in orch.mocks.calls],
            "ledger": {k: list(v.keys()) for k, v in orch.mocks.ledger.items()},
            "review_queue": db.rows(orch.conn, "SELECT account_id, event_id, reason_codes, status FROM review_queue"),
            "dead_letters": db.rows(orch.conn, "SELECT delivery_id, reason FROM dead_letters"),
            "actions": db.rows(orch.conn, "SELECT idempotency_key, kind, system, status, attempts, send_after FROM actions"),
        })
    return {"label": LABEL, "flows": flows, "scenarios": out}


def stream() -> dict:
    sample = SEED_DIR / "sample"
    conn = db.connect()
    db.load_world_dir(conn, sample)
    events = _jsonl(sample / "events.jsonl")
    by_id = {e["event_id"]: e for e in events}
    answers = {by_id[r["event_id"]]["payload"]["body_text"]: reply_output(r["label"], by_id[r["event_id"]]["payload"]["body_text"],
                                                                        r.get("extracted"))
               for r in _jsonl(sample / "truth" / "truth_replies.jsonl") if r["event_id"] in by_id}
    truth = {t["delivery_id"]: t for t in _jsonl(sample / "truth" / "truth_events.jsonl")}
    orch = Orchestrator(conn, llm=FixtureLLM(answers), as_of=parse("2026-10-01T16:00:00Z"))
    res = [(e, orch.process(e)) for e in events]
    agree = sum(1 for e, r in res if r.action == truth[e["delivery_id"]].get("expected_action"))
    return {"label": LABEL, "deliveries": len(res), "handling": dict(Counter(r.handling for _, r in res)),
            "actions": dict(Counter(str(r.action) for _, r in res)),
            "final_actions": dict(Counter(str(r.final_action) for _, r in res)),
            "agreement_with_truth": f"{agree}/{len(res)}",
            "mock_emails": len(orch.mocks.ledger["send"]),
            "review_queue": conn.execute("SELECT COUNT(*) FROM review_queue").fetchone()[0],
            "dead_letters": conn.execute("SELECT COUNT(*) FROM dead_letters").fetchone()[0],
            "ai_calls": dict(Counter(f"{r['kind']}:{r['mode']}" for r in db.rows(conn, "SELECT kind, mode FROM ai_calls")))}


def evals_payload() -> dict:
    rec = evals.run_recorded()
    live = None
    p = evals.RESULTS / "latest-live.json"
    if p.exists():
        live = json.loads(p.read_text(encoding="utf-8"))
    return {"recorded": rec, "live": live}


def cases_payload() -> dict:
    return {"cases": evals.cases(), "as_of": "2026-10-01T16:00:00Z"}


def prompts_module() -> str:
    policy = Policy.load()
    templates = [t for t in _jsonl(SEED_DIR / "outreach_templates.jsonl")]
    data = {"default_model": prompts.DEFAULT_MODEL, "reply": prompts.export()["reply"], "draft": prompts.export()["draft"],
            "labels": prompts.LABELS, "actions": prompts.ACTIONS, "interest": prompts.INTEREST, "current": prompts.CURRENT,
            "pains": prompts.PAINS, "budget": prompts.BUDGET, "label_action": LABEL_ACTION,
            "opt_out_labels": sorted(OPT_OUT_LABELS), "needs_human_review": sorted(NEEDS_HUMAN_REVIEW),
            "confidence_min": policy.ai_confidence_min_auto, "content_rules": policy.send["content_rules"],
            "templates": templates}
    return ("// GENERATED by `python -m orchestrator export-web` from growth-orchestrator/orchestrator/ai/prompts.py.\n"
            "// Do not edit by hand: tests fail if this file and the Python source disagree.\n"
            f"export const ORCH = {json.dumps(data, indent=1, ensure_ascii=False)};\n")


def cases_module() -> str:
    return ("// GENERATED by `python -m orchestrator export-web` from data/seed/eval_cases.jsonl. Do not edit by hand.\n"
            f"export const CASES = {json.dumps(evals.cases(), indent=1, ensure_ascii=False)};\n")


def export_all() -> list[Path]:
    WEB.mkdir(parents=True, exist_ok=True)
    written = []
    for name, payload in (("runs.json", runs()), ("stream.json", stream()), ("evals.json", evals_payload()),
                          ("cases.json", cases_payload())):
        p = WEB / name
        p.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":"), default=str), encoding="utf-8")
        written.append(p)
    p = FN / "_orchestrator_prompts.mjs"
    p.write_text(prompts_module(), encoding="utf-8")
    written.append(p)
    p = FN / "_orchestrator_cases.mjs"
    p.write_text(cases_module(), encoding="utf-8")
    written.append(p)
    return written
