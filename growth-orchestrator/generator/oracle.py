"""Reference decision oracle for `account_targeted` (policy v0, see data/POLICY.md).

Purpose: an *independent* derivation of the expected action from the raw tables only.
The generator labels every account from its scenario; tests assert oracle == label for all accounts.
That cross-check proves the data is internally consistent. It is NOT the production decision engine.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from .config import (AS_OF, FUNCTION_SCORE, ICP_MIN_EMPLOYEES, INDUSTRIES, LOST_COOLDOWN_DAYS,
                     MAX_ENRICH_ATTEMPTS, OPEN_STAGES, RECENT_OUTREACH_DAYS, SENIORITY_SCORE,
                     SEQUENCE_COOLDOWN_DAYS, SEQUENCE_MAX_TOUCHES, SEQUENCE_WINDOW_DAYS,
                     STALE_ENRICHMENT_DAYS)
from .util import iso, parse_iso

REASON_CODE = {"unsubscribe": "UNSUBSCRIBED", "hard_bounce": "HARD_BOUNCE", "spam_complaint": "SPAM_COMPLAINT",
               "dnc_request": "DNC", "legal_hold": "LEGAL_HOLD", "competitor": "COMPETITOR"}
ICP_INDUSTRIES = {i[0] for i in INDUSTRIES if i[3]}


def rank_key(contact: dict):
    return (-FUNCTION_SCORE[contact["function"]], -SENIORITY_SCORE[contact["seniority"]], contact["contact_id"])


def best_contact(contacts: list[dict], suppressed_ids: set[str]) -> str | None:
    eligible = [c for c in contacts if c["email_status"] == "valid" and c["contact_id"] not in suppressed_ids]
    return min(eligible, key=rank_key)["contact_id"] if eligible else None


class Index:
    def __init__(self, accounts, contacts, opportunities, touches, suppression):
        self.contacts = defaultdict(list)
        self.opps = defaultdict(list)
        self.touches = defaultdict(list)
        self.supp_by_account = defaultdict(list)
        self.supp_by_domain = defaultdict(list)
        self.by_domain = defaultdict(list)
        for a in accounts:
            self.by_domain[a["domain"]].append(a)
        for c in contacts:
            self.contacts[c["account_id"]].append(c)
        for o in opportunities:
            self.opps[o["account_id"]].append(o)
        for t in touches:
            self.touches[t["account_id"]].append(t)
        for s in suppression:
            if s["scope"] == "domain":
                self.supp_by_domain[s["domain"]].append(s)
            else:
                self.supp_by_account[s["account_id"]].append(s)


def _r(action, codes, best=None, wait_until=None):
    return {"action": action, "reason_codes": codes, "best_contact_id": best, "wait_until": wait_until}


def decide(a: dict, idx: Index, as_of: datetime = AS_OF) -> dict:
    aid = a["account_id"]
    contacts = idx.contacts.get(aid, [])
    opps = idx.opps.get(aid, [])
    touches = idx.touches.get(aid, [])
    domain_rows = idx.supp_by_domain.get(a["domain"], [])
    acct_rows = idx.supp_by_account.get(aid, [])
    suppressed_ids = {s["contact_id"] for s in acct_rows if s["scope"] == "contact"}
    suppressed_ids |= {c["contact_id"] for c in contacts for s in domain_rows if s["scope"] == "domain"}

    # 1. suppression
    hard = [s for s in domain_rows + acct_rows if s["scope"] in ("domain", "account")]
    if hard:
        return _r("suppress", [REASON_CODE[hard[0]["reason"]]])
    if a["crm_status"] == "competitor":
        return _r("suppress", ["COMPETITOR"])
    contact_rows = [s for s in acct_rows if s["scope"] == "contact"]
    if contacts and all(c["contact_id"] in suppressed_ids for c in contacts):
        by_contact = {s["contact_id"]: s["reason"] for s in contact_rows}
        return _r("suppress", [REASON_CODE[by_contact[contacts[0]["contact_id"]]]])

    # 2. state conflicts
    won = [o for o in opps if o["stage"] == "closed_won"]
    if (a["crm_status"] == "customer" and not won) or (a["crm_status"] == "prospect" and won):
        return _r("escalate_human", ["STATE_CONFLICT"])
    # 3-4. customers
    if a["crm_status"] == "customer":
        return _r("suppress", ["CUSTOMER"])
    if a["crm_status"] == "churned_customer":
        return _r("escalate_human", ["CHURNED_CUSTOMER"])
    # 5. duplicate account (a later-created account sharing a domain with an earlier one)
    twins = [o for o in idx.by_domain[a["domain"]] if o["account_id"] != aid and o["created_at"] < a["created_at"]]
    if twins:
        return _r("escalate_human", ["DUPLICATE_ACCOUNT"])
    # 6. active opportunity / 7. AE ownership
    if any(o["stage"] in OPEN_STAGES for o in opps):
        return _r("suppress", ["ACTIVE_OPPORTUNITY"])
    if a["crm_owner_ae_id"]:
        return _r("handoff_ae", ["AE_ASSIGNED"])
    # 8. closed-lost cooldown
    lost = [o for o in opps if o["stage"] == "closed_lost" and o["closed_at"]]
    if lost:
        last = max(parse_iso(o["closed_at"]) for o in lost)
        if as_of - last < timedelta(days=LOST_COOLDOWN_DAYS):
            return _r("wait", ["CLOSED_LOST_COOLDOWN"], wait_until=iso(last + timedelta(days=LOST_COOLDOWN_DAYS)))
    # 9. ICP (only when the data needed to judge it is known)
    if a["employee_count"] is not None and a["employee_count"] < ICP_MIN_EMPLOYEES:
        return _r("suppress", ["NOT_ICP"])
    if a["industry"] is not None and a["industry"] not in ICP_INDUSTRIES:
        return _r("suppress", ["NOT_ICP"])
    # 10. outreach pacing (only automated sequence touches count)
    seq = sorted((parse_iso(t["sent_at"]) for t in touches if t["sender_type"] == "sequence"))
    if seq:
        last = seq[-1]
        if as_of - last < timedelta(days=RECENT_OUTREACH_DAYS):
            return _r("wait", ["RECENT_OUTREACH"], wait_until=iso(last + timedelta(days=RECENT_OUTREACH_DAYS)))
        in_window = [s for s in seq if as_of - s <= timedelta(days=SEQUENCE_WINDOW_DAYS)]
        replied = any(t["status"] == "replied" for t in touches)
        if len(in_window) >= SEQUENCE_MAX_TOUCHES and not replied and \
                as_of - last < timedelta(days=SEQUENCE_COOLDOWN_DAYS):
            return _r("wait", ["SEQUENCE_EXHAUSTED"], wait_until=iso(last + timedelta(days=SEQUENCE_COOLDOWN_DAYS)))
    # 11. data needs enrichment
    best = best_contact(contacts, suppressed_ids)
    reason = None
    if a["enriched_at"] is None or as_of - parse_iso(a["enriched_at"]) > timedelta(days=STALE_ENRICHMENT_DAYS):
        reason = "STALE_ENRICHMENT"
    elif a["employee_count"] is None or a["industry"] is None:
        reason = "MISSING_FIRMOGRAPHICS"
    elif best is None:
        live = [c for c in contacts if c["contact_id"] not in suppressed_ids]
        if not contacts:
            reason = "NO_CONTACTS"
        elif any(c["email_status"] == "unverified" for c in live) and \
                not any(c["email_status"] == "valid" for c in live):
            reason = "UNVERIFIED_EMAIL_ONLY"
        else:
            reason = "NO_VALID_EMAIL"
    if reason:
        if a["enrichment_attempts"] >= MAX_ENRICH_ATTEMPTS:
            return _r("escalate_human", ["ENRICHMENT_EXHAUSTED"])
        return _r("enrich", [reason])
    # 12. eligible
    return _r("contact", ["ELIGIBLE"], best=best)
