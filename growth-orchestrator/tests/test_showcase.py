"""The 'Live Demo' flows and the 'Operations' numbers come from the real engine, and tell the truth.

Run:  python -m unittest discover -s tests -t .
"""
from __future__ import annotations

import json
import unittest
from pathlib import Path

from orchestrator import plain, showcase

REPO = Path(__file__).resolve().parent.parent.parent
GENERATED = showcase.GENERATED / "manifest.json"


class Flows(unittest.TestCase):
    flows = {f["id"]: f for f in showcase.flows_payload()["flows"]}

    def test_every_flow_has_the_seven_stages_in_order(self):
        for f in self.flows.values():
            self.assertEqual([s["id"] for s in f["stages"]], ["event", "state", "rules", "model", "validator", "action", "audit"], f["id"])

    def test_the_rules_overrule_the_model_on_an_opt_out(self):
        f = self.flows["F2"]
        c = f["contradiction"]
        self.assertEqual((c["claude_label"], c["guard"], c["final_action"]), ("interested", True, "suppress"))
        self.assertEqual(f["final"]["action"], "suppress")
        validator = next(s for s in f["stages"] if s["id"] == "validator")
        self.assertEqual(validator["status"], "flag")
        self.assertIn("SIMULATED", f["label"])

    def test_duplicate_delivery_has_no_second_effect(self):
        f = self.flows["F3"]
        self.assertEqual([s["status"] for s in f["stages"][1:5]], ["skipped"] * 4)
        self.assertEqual(len(f["audit"]), 1)

    def test_retried_send_records_exactly_one_email(self):
        action = next(s for s in self.flows["F4"]["stages"] if s["id"] == "action")
        self.assertEqual(sum("Email recorded" in l for l in action["lines"]), 1)
        self.assertTrue(any("2 attempts" in l for l in action["lines"]))

    def test_the_vague_reply_goes_to_a_person(self):
        self.assertEqual(self.flows["F5"]["final"]["action"], "escalate_human")

    def test_published_flows_are_current(self):
        published = json.loads((REPO / "public/data/flows.json").read_text(encoding="utf-8"))
        self.assertEqual(published, json.loads(json.dumps(showcase.flows_payload(), default=str)),
                         "run: python -m orchestrator export-web")

    def test_validator_codes_have_everyday_text(self):
        for c in ("G001", "V010", "V011", "V006"):
            self.assertIn(c, plain.VALIDATION_CODES)


class Operations(unittest.TestCase):
    ops = json.loads((REPO / "public/data/operations.json").read_text(encoding="utf-8"))

    def test_numbers_add_up(self):
        o = self.ops
        self.assertEqual(o["automated"] + o["human"], o["decided"])
        self.assertEqual(sum(o["handling"].values()), o["events"])
        self.assertEqual(sum(o["ai"]["verdicts"].values()), o["ai"]["calls"])
        self.assertEqual(sum(o["ai"]["by_kind"].values()), o["ai"]["calls"])
        self.assertEqual(o["real_emails_sent"], 0)

    def test_cost_is_calls_times_the_stated_assumption(self):
        a = self.ops["ai"]
        self.assertAlmostEqual(a["cost_usd"], round(a["calls"] * a["cost_per_call_usd"], 2))

    @unittest.skipUnless(GENERATED.exists(), "50k world not generated (make data)")
    def test_published_operations_match_a_fresh_run(self):
        self.assertEqual(self.ops, json.loads(json.dumps(showcase.operations_payload(), default=str)),
                         "run: python -m orchestrator export-overview")


class Approvals(unittest.TestCase):
    ap = json.loads((REPO / "public/data/approvals.json").read_text(encoding="utf-8"))

    def test_batch_is_what_the_page_says(self):
        a = self.ap
        self.assertEqual(len(a["items"]), a["batch"])
        self.assertEqual(sum(a["by_tier"].values()), a["total_prepared"])
        self.assertTrue(all(i["tier"] in ("A", "B") for i in a["items"]))
        self.assertEqual(len({i["id"] for i in a["items"]}), a["batch"])

    def test_every_draft_is_a_complete_email_with_an_opt_out(self):
        for i in self.ap["items"]:
            self.assertIn("reply STOP", i["body"], i["id"])
            self.assertNotIn("[OPENING]", i["body"])
            self.assertNotIn("{", i["body"])
            self.assertEqual(i["mode"] == "personalized", bool(i["claims"]), i["id"])

    def test_totals_match_the_scoring_of_the_50k_summary(self):
        from orchestrator import scoring
        ov = json.loads((REPO / "public/data/overview.json").read_text(encoding="utf-8"))
        by = {"A": 0, "B": 0, "C": 0}
        for g in ov["groups"]:
            feat = {"size": g["size"], "pain": g["pain"], "signals": [None] * g["signals"]}
            by[scoring.score(feat, ov["config"])["tier"]] += g["counts"].get("contact", 0)
        self.assertEqual((by["A"], by["B"]), (self.ap["by_tier"]["A"], self.ap["by_tier"]["B"]))

    @unittest.skipUnless(GENERATED.exists(), "50k world not generated (make data)")
    def test_published_queue_matches_a_fresh_run(self):
        self.assertEqual(self.ap, json.loads(json.dumps(showcase.approvals_payload(), default=str)),
                         "run: python -m orchestrator export-overview")


if __name__ == "__main__":
    unittest.main()
