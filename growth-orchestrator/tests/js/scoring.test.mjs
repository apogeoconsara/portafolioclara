// The page recomputes the score in the browser with edited weights. Check that code against the Python-exported
// default scores for all 500 accounts. Run from the repo root: node growth-orchestrator/tests/js/scoring.test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync("public/index.html", "utf8");
const src = html.match(/function scoreOf[\s\S]*?\n}\n/)[0];
const scoreOf = new Function(`${src}; return scoreOf;`)();
const d = JSON.parse(readFileSync("public/data/scoring.json", "utf8"));
const w = { ...d.config.weights, tier_a: d.config.tier_a, tier_b: d.config.tier_b };
for (const a of d.accounts) assert.deepEqual(scoreOf(a.feat, d.config, w), a.base, a.id);
console.log(`scoring parity: ${d.accounts.length}/${d.accounts.length}`);
