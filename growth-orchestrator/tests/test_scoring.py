"""Score and audience check: deterministic, and the checklist never disagrees with the rules engine.

Run:  python -m unittest discover -s tests -t .
"""
from __future__ import annotations

import unittest

from orchestrator import db, scenario, scoring
from orchestrator.policy import SEED_DIR, Policy
from orchestrator.rules import decide
from orchestrator.timeutil import parse

NOW = parse("2026-10-01T16:00:00Z")
# decisions whose reason is more specific than the first failing check
SPECIFIC = {"ENRICHMENT_EXHAUSTED", "NO_AE_AVAILABLE"}


def _worlds():
    for g in scenario.load_golden():
        o = scenario.build(g)
        yield g["id"], o.conn, [a["account_id"] for a in g["state"]["accounts"]]
    conn = db.connect()
    db.load_world_dir(conn, SEED_DIR / "sample")
    yield "sample", conn, [r["account_id"] for r in db.rows(conn, "SELECT account_id FROM accounts")]


class AudienceCheckMatchesEngine(unittest.TestCase):
    def test_eligible_iff_engine_says_contact_and_first_failure_is_the_reason(self):
        pol, n = Policy.load(), 0
        for name, conn, ids in _worlds():
            for aid in ids:
                checks, d, n = scoring.audience_check(conn, aid, NOW, pol), decide(conn, aid, NOW, pol), n + 1
                self.assertEqual(scoring.verdict(checks) == "eligible", d.action == "contact", (name, aid, d.action))
                first = next((c for c in checks if c["status"] != "pass"), None)
                if first and not SPECIFIC & set(d.reason_codes):
                    self.assertIn(first["code"], d.reason_codes, (name, aid))
        self.assertGreater(n, 500)


class Score(unittest.TestCase):
    cfg = scoring.load_config()

    def test_max_and_min(self):
        full = {"size": "ideal", "pain": True, "signals": ["a", "b", "c", "d"]}
        self.assertEqual(scoring.score(full, self.cfg)["score"], 100)       # signals capped at 3
        self.assertEqual(scoring.score({"size": "unknown", "pain": False, "signals": []}, self.cfg)["tier"], "C")

    def test_tiers_and_custom_weights(self):
        f = {"size": "ideal", "pain": True, "signals": []}
        self.assertEqual(scoring.score(f, self.cfg)["tier"], "B")           # 30 + 25 = 55
        self.assertEqual(scoring.score(f, self.cfg, {"size": 50, "pain": 30, "signal_each": 15})["tier"], "A")

    def test_edge_size_rounds_half_up(self):
        w = {"size": 31, "pain": 0, "signal_each": 0}
        self.assertEqual(scoring.score({"size": "edge", "pain": False, "signals": []}, self.cfg, w)["parts"]["size"], 16)


if __name__ == "__main__":
    unittest.main()
