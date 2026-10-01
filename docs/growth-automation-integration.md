# Growth Automation integration (Clara UI → n8n → HubSpot → LLM)

Everything in this document is **opt-in**. With no environment variables set, the app behaves
exactly as before and the new workflow runs only as a clearly labeled **demo simulation**.

## Architecture and responsibilities

```
Clara Growth Agent UI          operating layer: shows leads, scores, approvals, activity. No workflow business logic.
  ↓  POST /.netlify/functions/analyze-prospect   (server-side proxy: holds the n8n URL + secret, validates in/out)
n8n                            orchestration: sequences steps, handles failures, returns ONE JSON result
  ↓
HubSpot (company lookup)       CRM + system of record: lifecycle stage, owner, engagement
  ↓
Deterministic ICP scoring      Code node: explainable 0-100 score + qualification gate (same formula as the dashboard)
  ↓  only if score ≥ qualification threshold
LLM analysis                   calls the EXISTING lead-reasoning function (Claude by default; the API key stays in Netlify): reason, angle, action
  ↓
Routing decision               Code node: Nurture / SDR Review / AE Ready (deterministic rules)
  ↓
HubSpot update                 AI score, recommendation, next action, status. Only if HUBSPOT_WRITEBACK=true
  ↓
Optional human approval        UI: Approve / Needs Review / Send to Nurture / AE Ready / Outbound Ready
  ↓
Future production action       Amplemarket sequence. PLACEHOLDER ONLY: no integration, nothing is ever sent.
```

The LLM never decides the score or the route. Nothing in this project sends an email or contacts a company.

## Request / response contract

`POST analyze-prospect` (browser → Netlify) takes `{ company, scoringConfig }`. The function builds the n8n payload
from the server-side dataset (the browser cannot inject company facts):

```json
{
  "event": "analyze_prospect", "source": "clara_growth_agent", "requestId": "…", "requestedAt": "…",
  "leadId": "apiux-tech", "company": "Apiux Tech", "email": null, "country": "Chile",
  "industry": "Consultoría TI / Transformación Digital", "employees": 305, "lifecycleStage": null,
  "painHypothesis": ["…"], "signals": ["…"],
  "scoringConfig": { "pesos": {"tamano":30,"dolor":25,"senales":15}, "tamano_min":20, "tamano_max":1500, "umbral_a":75, "umbral_b":50 },
  "options": { "writeback": false }
}
```

`email` is `null` and `lifecycleStage` is `null` on purpose: the dataset is company-level (no personal data) and HubSpot is
the source of truth for lifecycle stage. n8n returns `{ icp, crm, llm, routing, trace[], execution }`; the Netlify function
validates it against a whitelist (anything else becomes `MALFORMED_RESPONSE`) before the browser sees it.
`record_decision` (human decision) uses `workflow-decision`; it re-finds the HubSpot company **by name** in n8n and ignores any id from the browser.

### Routing rules (n8n "Routing decision" node, mirrored in the UI demo mode)

| Condition | Route |
|---|---|
| score < qualification threshold (`umbral_b`, default 50) | **Nurture** (LLM skipped, no approval needed) |
| score ≥ `umbral_b` | **SDR Review** (qualified, human validates) |
| score ≥ `umbral_a` (default 75) **and** ≥ 2 positive signals (public signals + prior engagement) | **AE Ready** |
| AE Ready but HubSpot record missing/unavailable, or lifecycle is customer/evangelist | capped at **SDR Review** |
| human approves an AE Ready / SDR Review route, then clicks Outbound Ready | **Outbound Ready** → "Production action: send to Amplemarket sequence" (placeholder) |

Thresholds and weights come from the existing "Reglas de scoring" page. Country and industry are shown as context but are
**not scored**, so the workflow score is identical to the dashboard score.

## Environment variables (Netlify, server-side only)

| Variable | Required | Purpose |
|---|---|---|
| `N8N_WEBHOOK_URL` | for live mode | n8n webhook **Production URL** (https; `http://localhost` allowed for local tests) |
| `N8N_WEBHOOK_SECRET` | recommended | sent as `x-clara-secret`; must equal the Header Auth credential value in n8n |
| `N8N_TIMEOUT_MS` | no | 1000-60000, default 25000 |
| `HUBSPOT_WRITEBACK` | no | `true` lets n8n write AI fields to HubSpot. Default is read-only |
| `ANTHROPIC_API_KEY` | for AI text | already used by the chat; `lead-reasoning` now uses it too (Claude Haiku 4.5), and the n8n LLM node calls that function |
| `OPENAI_API_KEY` / `LLM_PROVIDER` | no | optional OpenAI alternative for `lead-reasoning`; `LLM_PROVIDER` forces one provider |

No variable is exposed to the browser. `GET analyze-prospect` returns only booleans (configured / auth set / write-back on).

## n8n setup (manual)

1. Import `docs/n8n/clara-growth-agent.workflow.json` (Workflows → Import from file).
2. **Webhook** node: create a *Header Auth* credential, header name `x-clara-secret`, value = your chosen secret (same as `N8N_WEBHOOK_SECRET`).
3. Every **HubSpot:** node: select a *HubSpot App Token* credential (private app token).
4. **LLM analysis** node: replace `REPLACE-WITH-YOUR-SITE.netlify.app` with your Clara site host. (Requires the site to be deployed and `ANTHROPIC_API_KEY` set; n8n cloud cannot reach localhost.)
5. Publish the workflow, copy the **Production URL** into `N8N_WEBHOOK_URL`.
6. Run one test from the UI (Leads → company → Analyze Prospect) and check the execution in n8n.

The workflow JSON contains no credentials. It was validated structurally and its Code nodes/expressions were executed locally
with a mock harness, but **it has not been imported into a live n8n instance** — expect to fix small things (credential selection, node UI warnings) on first import.

## HubSpot setup (manual)

**Scopes** for the private app: `crm.objects.companies.read`, `crm.objects.companies.write` (only needed with write-back), `crm.objects.owners.read`.

**Company records:** n8n looks companies up by exact `name`. Import `docs/hubspot-companies-import.csv` into a **sandbox/test** account
(or create the 13 companies by hand). A company that is not found is handled gracefully (capped at SDR Review, write-back skipped).

**Custom company properties** (NOT created automatically; create them yourself, internal names exactly as below, then set `HUBSPOT_WRITEBACK=true`):

| Internal name | Type | Written when |
|---|---|---|
| `clara_ai_score` | Number | analysis |
| `clara_qualification_status` | Single-line text (`qualified` / `below_threshold`) | analysis |
| `clara_ai_recommendation` | Multi-line text | analysis |
| `clara_next_action` | Single-line text | analysis |
| `clara_workflow_route` | Single-line text | analysis + human decision |
| `clara_last_analyzed_at` | Date and time | analysis |
| `clara_human_decision` | Single-line text | human decision |
| `clara_decision_at` | Date and time | human decision |

Read-only mode needs none of these. Reading already works with standard properties (`lifecyclestage`, `hubspot_owner_id`, `num_contacted_notes`, …).

## Error handling

Every failure maps to a stable code and a professional error card with **Retry** and **Run demo fallback**:
`N8N_NOT_CONFIGURED`, `N8N_UNREACHABLE`, `N8N_TIMEOUT`, `N8N_AUTH_FAILED`, `N8N_WORKFLOW_NOT_FOUND`, `N8N_HTTP_ERROR`,
`MALFORMED_RESPONSE`, `LEAD_NOT_FOUND`, `INVALID_REQUEST`, `FUNCTION_UNAVAILABLE`, `CLIENT_TIMEOUT`, plus structured codes n8n may return (e.g. `HUBSPOT_UNAVAILABLE`).
HubSpot down/missing company and an LLM failure are *degraded successes* inside the workflow (flagged in the UI and trace), not crashes.
A failed decision call offers "Record locally". The demo fallback is always labeled **DEMO FALLBACK · simulated** and never presented as a production call.

## Two-minute interview script

1. *(10s)* "This is the operating layer of an AI growth system. The UI holds no workflow logic: n8n orchestrates, HubSpot is the CRM, rules score, the LLM only interprets." Open **Arquitectura** → System View.
2. *(15s)* **Leads** → open a company → **Growth Workflow**. "I click Analyze Prospect; the UI sends only the prospect id to a server-side proxy, so no URLs or secrets are in the browser."
3. *(30s)* While it runs / right after: "n8n looks the company up in HubSpot (lifecycle, owner), calculates an explainable score with deterministic rules, and only if it passes the threshold does it call the LLM." Point at the stage chips and the **ICP Score** breakdown.
4. *(25s)* Read **Why this account matters**, **Next action**, **Outreach angle**, then **Routing decision**: "the route comes from rules, not from the model, and the rules that fired are listed."
5. *(20s)* **Human review**: Approve → Outbound Ready. "Nothing is sent. Outbound Ready is where Amplemarket would run the sequence in production; here it is a labeled placeholder."
6. *(10s)* **Pipeline & Routing**: the lanes. **Agent Activity Log**: the event trail (prospect received → HubSpot context → score → threshold → AI → recommendation → approval → update → completed).
7. *(10s)* Resilience: "If n8n or HubSpot fails, the UI shows the error and a labeled demo fallback, so the demo never dies."

## What is real vs simulated

| Part | Status |
|---|---|
| Netlify proxy, validation, error mapping, UI states, activity log, routing lanes | Real code, tested locally |
| n8n orchestration, HubSpot read/write, LLM call | Real **once you configure** n8n/HubSpot/OpenAI; never exercised against live services from this repo's test run (mock n8n) |
| Demo mode result | Simulated in the browser (labeled). Same rules, but CRM context is assumed (`lead`, no owner) and text is a template |
| Amplemarket | Placeholder only |
| Lifecycle events, Growth Economics | Unchanged: illustrative |

## Known risks

- `analyze-prospect`/`workflow-decision` are public endpoints (like the existing functions). They are limited to the 13 known companies, but a visitor can trigger n8n runs and LLM spend, and with `HUBSPOT_WRITEBACK=true` can rewrite the AI fields of those 13 HubSpot companies. Use a **sandbox** HubSpot and turn write-back off after the interview.
- Netlify synchronous functions have a short default timeout (10s on many plans); a full run (HubSpot + OpenAI) may exceed it. The UI then shows `N8N_HTTP_ERROR`/`MALFORMED_RESPONSE`/`CLIENT_TIMEOUT` with the demo fallback. Raise the function timeout if your plan allows, or keep the LLM step fast.
- The Outbound Ready gate (approval first) is enforced in the UI and re-checked in `workflow-decision`, but the demo is stateless, so a direct API caller could assert `approvedBefore`. Nothing is sent either way.
- A pre-existing inconsistency (not touched): for an *unclassified* pain, the server formula gives 12 points and the client gives 13 (rounding). No current lead hits that case.

## Deployment notes (this project)

- Netlify site: `clara-growth-agent-demo`. Pushing `dev` creates a **branch deploy** at `https://dev--clara-growth-agent-demo.netlify.app` (the production URL is a separate deploy). Env vars set on the site apply to both.
- The n8n **LLM analysis** node must point at the deploy that has the new `lead-reasoning` (the branch deploy until `dev` is promoted).
- n8n credentials used: a *HubSpot App Token* (all HubSpot nodes) and a *Header Auth* (Webhook, header `x-clara-secret`).
