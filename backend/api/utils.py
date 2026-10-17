"""Pure-Python helpers (no Django imports) so they are easy to unit test."""
from __future__ import annotations
import math
import random
import re
from datetime import date, datetime, timedelta, timezone

ROLES = ("admin", "staff", "customer")
PHONE_RE = re.compile(r"^[0-9]{10}$")
EMAIL_RE = re.compile(r"^\S+@\S+\.\S+$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def num(value) -> float:
    """Behaves like JavaScript Number(): ''/None -> 0, junk -> NaN."""
    if value is None or value == "":
        return 0.0
    if isinstance(value, bool):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return float("nan")


def is_positive(x: float) -> bool:
    return math.isfinite(x) and x > 0


def js_round(x: float) -> int:
    """Math.round(): halves round up."""
    return int(math.floor(x + 0.5))


def calc_auction(net_weight: float, rate: float, percent: float):
    """Returns (total_amount, commission_amount) exactly like the old API."""
    total = js_round(net_weight * rate * 100) / 100
    commission = js_round(total * percent) / 100
    return total, commission


def calc_net_payable(gross: float, commission: float) -> float:
    return js_round((gross - commission) * 100) / 100


def round2(x: float) -> float:
    return js_round(x * 100) / 100


def utc_today() -> date:
    return datetime.now(timezone.utc).date()


def days_ago(n: int) -> date:
    return utc_today() - timedelta(days=n)


def make_lot_no(today: date | None = None, rand: int | None = None) -> str:
    today = today or utc_today()
    rand = rand if rand is not None else random.randint(1000, 9999)
    return f"LOT-{today.strftime('%Y%m%d')}-{rand}"


def page_args(params, default_size: int = 10, max_size: int = 100):
    """(page, size, offset) from a QueryDict/dict, always safe integers."""
    try:
        page = max(1, int(params.get("page") or 1))
    except (TypeError, ValueError):
        page = 1
    try:
        size = int(params.get("size") or default_size)
    except (TypeError, ValueError):
        size = default_size
    size = min(max(1, size), max_size)
    return page, size, (page - 1) * size


def valid_date(value: str) -> bool:
    if not DATE_RE.match(value or ""):
        return False
    try:
        date.fromisoformat(value)
        return True
    except ValueError:
        return False
