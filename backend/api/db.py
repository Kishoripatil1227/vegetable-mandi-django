"""Small SQL helpers on top of Django's connection (Supabase Postgres).

Every read query returns rows as JSON (to_jsonb) so the response keeps the same
shape the React pages already expect (nested objects, numbers, ISO dates).
"""
from __future__ import annotations
import json
import logging

from django.db import connection, transaction

log = logging.getLogger("mandi.db")


def _decode(value):
    if isinstance(value, (bytes, bytearray)):
        value = value.decode()
    if isinstance(value, str):
        try:
            return json.loads(value)
        except ValueError:
            return value
    return value


def rows(sql: str, params=()):
    """Run a query that selects ONE jsonb column; return list of dicts."""
    with connection.cursor() as cur:
        cur.execute(sql, params)
        return [_decode(r[0]) for r in cur.fetchall()]


def row(sql: str, params=()):
    result = rows(sql, params)
    return result[0] if result else None


def value(sql: str, params=()):
    """Return the first column of the first row (counts, sums, status ...)."""
    with connection.cursor() as cur:
        cur.execute(sql, params)
        r = cur.fetchone()
        return r[0] if r else None


def execute(sql: str, params=()) -> int:
    with connection.cursor() as cur:
        cur.execute(sql, params)
        return cur.rowcount


def audit(user_id, action: str, table: str, record_id=None, details=None) -> None:
    """Write an audit_logs row. A failure here must never break the request."""
    try:
        with transaction.atomic():  # savepoint when called inside another atomic block
            execute(
                "insert into audit_logs (user_id, action, table_name, record_id, details) "
                "values (%s, %s, %s, %s, %s::jsonb)",
                [
                    user_id,
                    action,
                    table,
                    str(record_id) if record_id is not None else None,
                    json.dumps(details, default=str) if details is not None else None,
                ],
            )
    except Exception:  # noqa: BLE001
        log.exception("audit insert failed")


class Where:
    """Builds a safe 'where a and b' clause with bound parameters."""

    def __init__(self):
        self.parts: list[str] = []
        self.params: list = []

    def add(self, clause: str, *params) -> "Where":
        self.parts.append(clause)
        self.params.extend(params)
        return self

    def sql(self) -> str:
        return (" where " + " and ".join(self.parts)) if self.parts else ""
