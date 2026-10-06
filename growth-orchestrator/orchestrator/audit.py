"""Append-only audit trail: every step of event -> state -> decision -> AI/rules -> action is recorded."""
from __future__ import annotations

import json
import sqlite3

from .timeutil import iso


class Audit:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn
        self.now = None

    def log(self, kind: str, account_id=None, event_id=None, delivery_id=None, **detail):
        ts = iso(self.now) if self.now else None
        self.conn.execute("INSERT INTO audit_log (ts, account_id, event_id, delivery_id, kind, detail) VALUES (?,?,?,?,?,?)",
                          (ts, account_id, event_id, delivery_id, kind, json.dumps(detail, default=str, ensure_ascii=False)))

    def trail(self, account_id=None, event_id=None) -> list[dict]:
        q, p = "SELECT * FROM audit_log WHERE 1=1", []
        if account_id:
            q += " AND account_id=?"; p.append(account_id)
        if event_id:
            q += " AND event_id=?"; p.append(event_id)
        out = []
        for r in self.conn.execute(q + " ORDER BY id", p):
            d = dict(r)
            d["detail"] = json.loads(d["detail"])
            out.append(d)
        return out
