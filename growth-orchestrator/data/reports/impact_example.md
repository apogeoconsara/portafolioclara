# Measurement plan: worked example (SIMULATED)

> **Not evidence.** Every outcome below is generated from the assumptions in `data/seed/funnel_assumptions.json`. It shows *how* we would measure incremental qualified pipeline (unit, metric, guardrails, power, A/A sanity check), not that the system produces it. Replace the assumptions with Clara's measured baseline before concluding anything.

## Design

* **Unit / randomization:** targeted account (cluster = email domain, so duplicate accounts share an arm). Stratified by country × employee band × prior-touch, ranked by hash within each stratum (so the split is balanced and reproducible).
* **Arms:** control = current process: SDRs research, write and send by hand; capacity-limited coverage; treatment = orchestrator: rules decide eligibility, AI interprets replies / drafts grounded copy, humans handle escalations.
* **Analysis:** intention-to-treat on all targeted accounts, attribution window 60 days, 8 weeks.
* **Primary metric:** qualified_pipeline_usd_per_1000_targeted_accounts (SQL-accepted pipeline created within 60 days).
* **Guardrails:** {'unsubscribe_rate_max': 0.006, 'spam_complaint_rate_max': 0.001, 'hard_bounce_rate_max': 0.03, 'ae_sql_acceptance_rate_min_vs_control': 0.95, 'policy_violations': 'must be 0 in treatment', 'ai_unsafe_action_rate': 'must be 0; any unsafe action pauses autonomy'}.

## Funnel (per 1,000 targeted accounts, ITT)

| stage | control | treatment |
|---|---|---|
| contacted | 142.0 | 394.4 |
| delivered | 137.6 | 385.6 |
| replied | 4.3 | 12.2 |
| positive reply | 1.4 | 4.1 |
| SQL | 0.6 | 1.6 |
| opportunity | 0.3 | 0.9 |
| **qualified pipeline (USD)** | 25,108 | 47,079 |

**Incremental qualified pipeline per 1,000 targeted accounts: USD 21,970 (95% bootstrap CI -4,905 to 50,719).** **The interval includes 0: even with a ~2x effect assumed, one month of 50k accounts is not enough to call the primary metric.** This is why the plan pairs it with a leading metric and a longer horizon.

Where the lift comes from in this simulation: **coverage**, not better copy. Eligible accounts reached: control 30% vs treatment 97%; the per-touch reply rate is assumed *lower* for AI-assisted outreach (3.4% vs 4.0%). If real coverage gains are smaller, the incremental pipeline shrinks accordingly.

## Guardrails

| guardrail | control | treatment | limit | status |
|---|---|---|---|---|
| unsubscribe rate | 0.23% | 0.30% | ≤ 0.60% | OK |
| spam complaint rate | 0.11% | 0.09% | ≤ 0.10% | OK |
| hard bounce rate | 2.48% | 1.21% | ≤ 3.00% | OK |
| policy violations (contacted an ineligible account) | 447 | 0 | 0 in treatment | OK |

Cost per SQL (SDR time + AI + enrichment): control USD 1,562 vs treatment USD 169. Median hours to first touch: control 97h vs treatment 2h.

## Power: how many accounts per arm to detect a lift in SQL rate

Baseline SQL rate per targeted account in this simulation: **0.060%** (rare event, so power is expensive).

| relative lift | accounts per arm | months at 50k targeted/month (25k per arm) |
|---|---|---|
| +10% | 2,745,374 | 109.8 |
| +25% | 470,611 | 18.8 |
| +50% | 130,713 | 5.2 |
| +100% | 39,206 | 1.6 |
| +200% | 13,062 | 0.5 |

Implication: with ~50k accounts/month, only large lifts are detectable in one month; small improvements need longer runs or a more sensitive leading metric (positive replies per contacted account) reported alongside the primary one.

## A/A sanity check (no true difference)

40 A/A re-simulations (identical behaviour in both arms), tested with an **exact conditional test for rare counts** (a normal approximation is anti-conservative with only ~15 SQLs per arm): **3 false positives at α=0.05** (expected ≈ 2.0). A split that rejects far more often would signal a broken randomization.

## Randomization check

42 strata; largest control/treatment imbalance in any stratum: **18 accounts**. Overall: control 25,000 / treatment 25,000. Accounts sharing a domain always share an arm (verified in the data tests).
