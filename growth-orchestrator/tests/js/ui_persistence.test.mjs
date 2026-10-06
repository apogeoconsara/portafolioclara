// Switching tabs or reloading must not lose what a person did on the page. Needs a browser: skipped when playwright-core
// (or Chromium) is not available. Run from the repo root: node growth-orchestrator/tests/js/ui_persistence.test.mjs
import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import assert from "node:assert/strict";

let chromium;
try { ({ chromium } = await import("playwright-core")); } catch { console.log("skipped: playwright-core not installed"); process.exit(0); }
const exe = process.env.CHROMIUM_PATH || ["/opt/pw-browsers/chromium", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
if (!exe) { console.log("skipped: no Chromium found"); process.exit(0); }

const types = { ".html": "text/html", ".json": "application/json", ".js": "text/javascript" };
const server = http.createServer((req, res) => {
  const f = join("public", req.url.split("?")[0] === "/" ? "index.html" : req.url.split("?")[0]);
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[extname(f)] || "text/plain" }); res.end(readFileSync(f));
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = []; page.on("pageerror", e => errors.push(e.message));
const go = async v => { await page.click(`#nav button[data-v="${v}"]`); await page.waitForTimeout(250); };
const text = sel => page.$eval(sel, e => e.innerText);

await page.goto(base + "#run"); await page.waitForSelector("#runGo");

// 1. a finished flow is still there after visiting another tab
await page.click("#runGo"); await page.click("#runSkip");
assert.match(await text("#runCard"), /Result:/);
await go("overview"); await go("run");
assert.match(await text("#runCard"), /Result:/, "finished flow lost after switching tabs");

// 2. a run that is still animating keeps going while another tab is open
await page.click('[data-run="F3"]'); await page.click("#runGo");
await go("operations"); await page.waitForTimeout(11500); await go("run");
assert.match(await text("#runCard"), /Result:/, "a run in progress stopped when the tab changed");

// 3. the model-vs-rules replay survives tab changes and a reload
await page.click("#truthRun"); await page.waitForTimeout(4200);
await go("priority"); await go("run");
assert.match(await text("#trio"), /SUPPRESS/, "replay lost after switching tabs");
await page.reload(); await page.waitForSelector("#trio");
assert.match(await text("#trio"), /SUPPRESS/, "replay lost after a reload");

// 4. Architecture keeps the open scenario list
await go("flows"); await page.click("details.card > summary"); await page.click("tr.click");
await go("overview"); await go("flows");
assert.ok(await page.$eval("#detail", e => e.innerText.length > 50), "the opened scenario was closed by switching tabs");

// 5. weights, account choice and typed reply survive a reload
await go("priority"); await page.fill("#w_size", "41"); await page.reload(); await page.waitForSelector("#w_size");
assert.equal(await page.inputValue("#w_size"), "41", "edited weight lost on reload");
await go("account"); const id = await page.$eval("#audSel option:nth-child(7)", o => o.value); await page.selectOption("#audSel", id);
await go("overview"); await go("account");
assert.equal(await page.inputValue("#audSel"), id, "chosen account lost after switching tabs");
await go("live"); await page.fill("#reply", "Please call me next week"); await go("overview"); await go("live");
assert.equal(await page.inputValue("#reply"), "Please call me next week", "typed reply lost after switching tabs");

assert.deepEqual(errors, []);
console.log("ui persistence: ok");
await browser.close(); server.close();
