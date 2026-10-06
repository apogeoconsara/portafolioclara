# Data profile

seed `42` · accounts `50,000` · as-of `2026-10-01T09:00:00+00:00` · python `3.13.16`  
determinism hash: `1959a0935bead1888cbb63dfe57403db`

## Volumes

| file | rows |
|---|---|
| aes.jsonl | 40 |
| ae_calendar.jsonl | 836 |
| accounts.jsonl | 50,000 |
| contacts.jsonl | 118,944 |
| opportunities.jsonl | 9,762 |
| outreach_history.jsonl | 42,042 |
| suppression.jsonl | 2,934 |
| company_facts.jsonl | 80,951 |
| mock_behavior.jsonl | 50,000 |
| mock_enrichment.jsonl | 2,267 |
| events.jsonl | 55,945 |
| experiment_assignments.jsonl | 50,000 |
| experiment_sim_outcomes.jsonl | 50,000 |
| truth/truth_accounts.jsonl | 50,000 |
| truth/truth_events.jsonl | 55,945 |
| truth/truth_facts.jsonl | 80,951 |
| truth/truth_replies.jsonl | 1,524 |

## Validation checks

|  | check | detail |
|---|---|---|
| PASS | account ids unique |  |
| PASS | contact ids unique |  |
| PASS | delivery ids unique |  |
| PASS | FK contacts -> accounts |  |
| PASS | FK opportunities -> accounts |  |
| PASS | FK touches -> contacts |  |
| PASS | FK suppression -> accounts |  |
| PASS | FK facts -> accounts |  |
| PASS | valid events reference existing accounts |  |
| PASS | events sorted by received_at (ingestion order) |  |
| PASS | truth_events aligned 1:1 with events |  |
| PASS | every company domain is reserved (.example) |  |
| PASS | every email domain is reserved (.example) or malformed on purpose |  |
| PASS | touches sent before the snapshot |  |
| PASS | replies reference a real earlier touch | 0 bad |
| PASS | exact/semantic duplicates reuse the original idempotency key |  |
| PASS | independent oracle agrees with scenario truth for every account | 0 mismatches |
| PASS | AE backups exist, share the country and differ from the AE |  |
| PASS | account owners exist as AEs |  |
| PASS | account handoffs go to an available owner or its backup | 0 bad |
| PASS | reply handoffs respect availability, language and capacity | 0 bad |
| PASS | calendar: weekdays only, nobody inactive, no slots while on leave |  |
| PASS | every account has an arm |  |
| PASS | accounts sharing a domain share an arm (no contamination) |  |
| PASS | arms balanced overall (±1.5 pts) | treatment share 0.500 |
| PASS | simulated outcomes are flagged and funnel-consistent |  |
| PASS | every reply event has a label |  |

## Scenario quotas (exact by construction)

| scenario | target | accounts | actual |
|---|---|---|---|
| clean_prospect | 38.0% | 19000 | 38.00% |
| partial_contact_suppression | 2.0% | 1000 | 2.00% |
| race_late_opportunity | 0.5% | 250 | 0.50% |
| race_late_unsubscribe | 0.5% | 250 | 0.50% |
| customer | 8.0% | 4000 | 8.00% |
| churned_customer | 2.0% | 1000 | 2.00% |
| active_opportunity | 3.0% | 1500 | 3.00% |
| ae_assigned | 10.0% | 5000 | 10.00% |
| recent_outreach | 14.0% | 7000 | 14.00% |
| max_touches_no_reply | 5.0% | 2500 | 5.00% |
| suppressed | 2.5% | 1250 | 2.50% |
| missing_data | 5.0% | 2500 | 5.00% |
| duplicate_domain | 2.0% | 1000 | 2.00% |
| low_icp | 4.0% | 2000 | 4.00% |
| conflict_state | 1.5% | 750 | 1.50% |
| closed_lost_recent | 2.0% | 1000 | 2.00% |

## Coverage matrix: scenario × expected action on `account_targeted`

| scenario | contact | enrich | escalate_human | handoff_ae | suppress | wait |
|---|---|---|---|---|---|---|
| clean_prospect | 19000 |  |  |  |  |  |
| partial_contact_suppression | 1000 |  |  |  |  |  |
| race_late_opportunity | 250 |  |  |  |  |  |
| race_late_unsubscribe | 250 |  |  |  |  |  |
| customer |  |  |  |  | 4000 |  |
| churned_customer |  |  | 1000 |  |  |  |
| active_opportunity |  |  |  |  | 1500 |  |
| ae_assigned |  |  |  | 5000 |  |  |
| recent_outreach |  |  |  |  |  | 7000 |
| max_touches_no_reply |  |  |  |  |  | 2500 |
| suppressed |  |  |  |  | 1250 |  |
| missing_data |  | 2267 | 233 |  |  |  |
| duplicate_domain |  |  | 1000 |  |  |  |
| low_icp |  |  |  |  | 2000 |  |
| conflict_state |  |  | 750 |  |  |  |
| closed_lost_recent |  |  |  |  |  | 1000 |

## Sub-scenarios

| sub-scenario | accounts |
|---|---|
| conflict_state/customer_without_won_opp | 382 |
| conflict_state/prospect_with_won_opp | 368 |
| low_icp/gov_ngo | 570 |
| low_icp/tiny | 1430 |
| missing_data/all_invalid | 999 |
| missing_data/missing_firmo | 262 |
| missing_data/no_contacts | 608 |
| missing_data/stale | 502 |
| missing_data/unverified_only | 129 |
| suppressed/competitor | 169 |
| suppressed/complaint | 186 |
| suppressed/dnc | 198 |
| suppressed/hard_bounce_all | 189 |
| suppressed/legal | 66 |
| suppressed/unsub_all | 442 |

## Reason codes

| reason | accounts | share |
|---|---|---|
| ELIGIBLE | 20500 | 41.0% |
| RECENT_OUTREACH | 7000 | 14.0% |
| AE_ASSIGNED | 5000 | 10.0% |
| CUSTOMER | 4000 | 8.0% |
| SEQUENCE_EXHAUSTED | 2500 | 5.0% |
| NOT_ICP | 2000 | 4.0% |
| ACTIVE_OPPORTUNITY | 1500 | 3.0% |
| CLOSED_LOST_COOLDOWN | 1000 | 2.0% |
| CHURNED_CUSTOMER | 1000 | 2.0% |
| DUPLICATE_ACCOUNT | 1000 | 2.0% |
| NO_VALID_EMAIL | 893 | 1.8% |
| STATE_CONFLICT | 750 | 1.5% |
| NO_CONTACTS | 558 | 1.1% |
| STALE_ENRICHMENT | 459 | 0.9% |
| UNSUBSCRIBED | 442 | 0.9% |
| MISSING_FIRMOGRAPHICS | 241 | 0.5% |
| ENRICHMENT_EXHAUSTED | 233 | 0.5% |
| DNC | 198 | 0.4% |
| HARD_BOUNCE | 189 | 0.4% |
| SPAM_COMPLAINT | 186 | 0.4% |
| COMPETITOR | 169 | 0.3% |
| UNVERIFIED_EMAIL_ONLY | 116 | 0.2% |
| LEGAL_HOLD | 66 | 0.1% |

## Accounts

**Country**

| country | n | share |
|---|---|---|
| MX | 18054 | 36.1% |
| BR | 9969 | 19.9% |
| CO | 9967 | 19.9% |
| CL | 4962 | 9.9% |
| AR | 3996 | 8.0% |
| PE | 3052 | 6.1% |

**Employee band**

| band | n | share |
|---|---|---|
| 51-200 | 17605 | 35.2% |
| 11-50 | 15380 | 30.8% |
| 201-500 | 8750 | 17.5% |
| 501-1000 | 4352 | 8.7% |
| 1000+ | 2221 | 4.4% |
| 1-10 | 1430 | 2.9% |
| None | 262 | 0.5% |

**Industry (top 8)**

| industry | n | share |
|---|---|---|
| Retail y comercio | 5793 | 11.6% |
| Manufactura | 5761 | 11.5% |
| Tecnología y software | 5239 | 10.5% |
| Logística y transporte | 4728 | 9.5% |
| Construcción e inmobiliaria | 4238 | 8.5% |
| Agroindustria | 4144 | 8.3% |
| Servicios profesionales | 4101 | 8.2% |
| Alimentos y bebidas | 3804 | 7.6% |

**CRM status / enrichment status**

| crm_status | n | share |
|---|---|---|
| prospect | 44449 | 88.9% |
| customer | 4382 | 8.8% |
| churned_customer | 1000 | 2.0% |
| competitor | 169 | 0.3% |

| enrichment | n | share |
|---|---|---|
| complete | 41492 | 83.0% |
| partial | 8006 | 16.0% |
| stale | 502 | 1.0% |

## Contacts

118,944 contacts; accounts with 0 contacts: 608

| contacts / account | accounts |
|---|---|
| 1 | 14182 |
| 2 | 14966 |
| 3 | 10205 |
| 4 | 6059 |
| 5 | 3901 |
| 6 | 79 |

| email_status | n | share |
|---|---|---|
| valid | 95039 | 79.9% |
| unverified | 8182 | 6.9% |
| role_based | 5192 | 4.4% |
| catchall | 3074 | 2.6% |
| missing | 2571 | 2.2% |
| invalid_syntax | 2520 | 2.1% |
| free_provider | 2366 | 2.0% |

| function | n | share |
|---|---|---|
| finance | 41796 | 35.1% |
| operations | 17677 | 14.9% |
| executive | 16752 | 14.1% |
| procurement | 14395 | 12.1% |
| it | 9563 | 8.0% |
| other | 9403 | 7.9% |
| hr | 9358 | 7.9% |

| language | n | share |
|---|---|---|
| es | 86717 | 72.9% |
| pt | 21785 | 18.3% |
| en | 10442 | 8.8% |

## Relationship / history

| measure | value |
|---|---|
| opportunities | 9762 |
| outreach touches | 42042 |
| suppression entries | 2934 |
| accounts with ≥1 touch | 21485 |
| accounts with an open opportunity | 1500 |
| accounts owned by an AE | 6500 |

| suppression reason | n | share |
|---|---|---|
| unsubscribe | 2042 | 69.6% |
| hard_bounce | 442 | 15.1% |
| dnc_request | 198 | 6.7% |
| spam_complaint | 186 | 6.3% |
| legal_hold | 66 | 2.2% |

## Event stream

55,945 deliveries over 32 days

| type | n | share |
|---|---|---|
| account_targeted | 52943 | 94.6% |
| reply_received | 1613 | 2.9% |
| opportunity_stage_changed | 459 | 0.8% |
| unsubscribe_received | 339 | 0.6% |
| opportunity_created | 264 | 0.5% |
| email_bounced | 181 | 0.3% |
| meeting_booked | 81 | 0.1% |
| lead_scored | 65 | 0.1% |

**Perturbations (ground truth)**

| perturbation | n | share of deliveries |
|---|---|---|
| none | 50941 | 91.1% |
| exact_duplicate | 1551 | 2.8% |
| delayed | 1346 | 2.4% |
| semantic_duplicate | 843 | 1.5% |
| malformed | 508 | 0.9% |
| out_of_order_race | 500 | 0.9% |
| content_duplicate | 256 | 0.5% |

| malformed kind | n | share |
|---|---|---|
| invalid_timestamp | 81 | 15.9% |
| null_payload | 77 | 15.2% |
| payload_wrong_type | 74 | 14.6% |
| missing_account_id | 72 | 14.2% |
| account_not_found | 67 | 13.2% |
| unknown_type | 65 | 12.8% |
| unsupported_schema | 65 | 12.8% |
| oversized_text | 7 | 1.4% |

| expected handling | n | share |
|---|---|---|
| process | 52287 | 93.5% |
| ignore_duplicate | 2394 | 4.3% |
| dead_letter | 508 | 0.9% |
| process_and_reconcile | 500 | 0.9% |
| dedupe_by_content | 256 | 0.5% |

Deliveries received >1h after they occurred: **2,340** (4.2%). Targeting events arrive in weekly bursts of ~20 minutes (rate-limit / queue stress).

## Replies (AI input)

1,524 labelled replies

| label | n | share |
|---|---|---|
| interesado | 244 | 16.0% |
| ahora_no | 206 | 13.5% |
| objecion | 174 | 11.4% |
| unsubscribe | 138 | 9.1% |
| ambiguo | 134 | 8.8% |
| fuera_de_oficina | 124 | 8.1% |
| auto_respuesta | 124 | 8.1% |
| persona_equivocada | 121 | 7.9% |
| pregunta_informacion | 80 | 5.2% |
| mixto_contradictorio | 71 | 4.7% |
| hostil | 50 | 3.3% |
| prompt_injection | 33 | 2.2% |
| vacio_truncado | 25 | 1.6% |

| language | n | share |
|---|---|---|
| es | 1082 | 71.0% |
| pt | 272 | 17.8% |
| en | 170 | 11.2% |

| difficulty | n | share |
|---|---|---|
| medium | 759 | 49.8% |
| easy | 530 | 34.8% |
| hard | 235 | 15.4% |

| expected action (state-aware) | n | share |
|---|---|---|
| escalate_human | 428 | 28.1% |
| wait | 330 | 21.7% |
| handoff_ae | 274 | 18.0% |
| suppress | 259 | 17.0% |
| no_action | 124 | 8.1% |
| enrich | 109 | 7.2% |

Ambiguous: 288 · needs human review: 567

## Company facts (personalization grounding)

80,951 facts · usable for personalization: 55,192 (68.2%)

| trap | n | share |
|---|---|---|
| clean | 55192 | 68.2% |
| stale | 14308 | 17.7% |
| unverified_hypothesis | 7325 | 9.0% |
| name_collision | 2077 | 2.6% |
| contradicts_firmographics | 2049 | 2.5% |

## AEs, routing and calendar

40 AEs · active 38 · on leave at the snapshot 3 · at/over capacity 13 · calendar rows 836

| account handoff route | n | share |
|---|---|---|
| OWNER | 4612 | 92.2% |
| OWNER_BACKUP | 388 | 7.8% |

| reply handoff route | n | share |
|---|---|---|
| TERRITORY | 173 | 63.1% |
| OWNER | 98 | 35.8% |
| OWNER_BACKUP | 2 | 0.7% |
| TERRITORY_FALLBACK | 1 | 0.4% |

## Experiment arms (simulated outcomes, see impact_example.md)

| arm | accounts | share |
|---|---|---|
| treatment | 25000 | 50.0% |
| control | 25000 | 50.0% |

## Mock API behaviours (deterministic per account)

| enrichment | n | share |
|---|---|---|
| ok | 44143 | 88.3% |
| timeout_once | 1919 | 3.8% |
| rate_limit_once | 1473 | 2.9% |
| malformed_response | 1466 | 2.9% |
| server_error_persistent | 999 | 2.0% |

| send | n | share |
|---|---|---|
| ok | 46565 | 93.1% |
| transient_error_then_ok | 1490 | 3.0% |
| rate_limit_then_ok | 945 | 1.9% |
| uncertain_outcome | 603 | 1.2% |
| hard_reject | 397 | 0.8% |

| calendar | n | share |
|---|---|---|
| ok | 47917 | 95.8% |
| slot_conflict | 2083 | 4.2% |

**Mock enrichment payload variants**

| variant | n | share |
|---|---|---|
| good_contacts | 1477 | 65.2% |
| no_data | 452 | 19.9% |
| contradictory | 338 | 14.9% |
