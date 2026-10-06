"""The web layer stays faithful to the engine: generated modules are in sync with the Python source, and the JS
validators / live function pass their node tests (skipped only if node is not installed).

Run:  python -m unittest discover -s tests -t .
"""
from __future__ import annotations

import json
import shutil
import subprocess
import unittest
from pathlib import Path

from orchestrator import webexport

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent


class GeneratedFilesInSync(unittest.TestCase):
    def test_prompts_module(self):
        self.assertEqual((REPO / "netlify/functions/_orchestrator_prompts.mjs").read_text(encoding="utf-8"),
                         webexport.prompts_module(), "run: python -m orchestrator export-web")

    def test_cases_module(self):
        self.assertEqual((REPO / "netlify/functions/_orchestrator_cases.mjs").read_text(encoding="utf-8"),
                         webexport.cases_module(), "run: python -m orchestrator export-web")

    def test_recorded_runs_match_the_engine(self):
        published = json.loads((REPO / "public/orchestrator/data/runs.json").read_text(encoding="utf-8"))
        fresh = json.loads(json.dumps(webexport.runs(), default=str))
        self.assertEqual([s["results"] for s in published["scenarios"]], [s["results"] for s in fresh["scenarios"]],
                         "the page shows stale runs: python -m orchestrator export-web")


@unittest.skipUnless(shutil.which("node"), "node not installed")
class NodeTests(unittest.TestCase):
    def _run(self, name):
        p = subprocess.run(["node", str(ROOT / "tests" / "js" / name)], capture_output=True, text=True, cwd=REPO)
        self.assertEqual(p.returncode, 0, p.stdout + p.stderr)

    def test_validator_parity(self):
        self._run("parity.test.mjs")

    def test_live_function_with_stubbed_api(self):
        self._run("function.test.mjs")


if __name__ == "__main__":
    unittest.main()
