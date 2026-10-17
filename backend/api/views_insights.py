"""Dashboard, history, reports, price analytics and the customer's own purchases."""
from django.http import JsonResponse

from . import db
from .db import Where
from .http import ApiError, endpoint
from .utils import days_ago, page_args, round2, utc_today, valid_date

STAFF = ("admin", "staff")
CUSTOMER = ("customer",)


def dashboard(request, user):
    today = utc_today().isoformat()
    lots_today = db.value("select count(*) from produce_lots where lot_date = %s", [today])
    farmers = db.value("select count(*) from farmers where status = 'active'")
    pending_count = db.value("select count(*) from settlements where payment_status = 'pending'")
    pending_amount = db.value("select coalesce(sum(net_payable), 0) from settlements where payment_status = 'pending'")
    total_sales = db.value("select coalesce(sum(total_amount), 0) from auctions")
    total_commission = db.value("select coalesce(sum(commission_amount), 0) from commissions")
    by_status = {}
    with_status = db.rows(
        "select to_jsonb(t) from (select status, count(*) as n from produce_lots group by status) t"
    )
    for r in with_status:
        by_status[r["status"]] = int(r["n"])

    return JsonResponse(
        {
            "lots_today": int(lots_today or 0),
            "active_farmers": int(farmers or 0),
            "pending_count": int(pending_count or 0),
            "pending_amount": round2(float(pending_amount or 0)),
            "total_sales": round2(float(total_sales or 0)),
            "total_commission": round2(float(total_commission or 0)),
            "by_status": by_status,
        }
    )


def history(request, user):
    page, size, offset = page_args(request.GET)
    search = (request.GET.get("search") or "").strip()
    status = (request.GET.get("status") or "").strip()
    date_from = (request.GET.get("from") or "").strip()
    date_to = (request.GET.get("to") or "").strip()
    for d in (date_from, date_to):
        if d and not valid_date(d):
            raise ApiError("Dates must be in YYYY-MM-DD format", 400)

    w = Where()
    if search:
        w.add("l.lot_no ilike %s", f"%{search}%")
    if status:
        w.add("l.status = %s", status)
    if date_from:
        w.add("l.lot_date >= %s", date_from)
    if date_to:
        w.add("l.lot_date <= %s", date_to)

    total = db.value(f"select count(*) from produce_lots l{w.sql()}", w.params)
    data = db.rows(
        "select to_jsonb(t) from (select l.id, l.lot_no, l.quantity, l.lot_date, l.status, "
        "jsonb_build_object('name', f.name) as farmers, "
        "jsonb_build_object('name', v.name) as vegetables, "
        "coalesce((select jsonb_agg(jsonb_build_object('net_weight', w.net_weight)) "
        "from weighments w where w.lot_id = l.id), '[]'::jsonb) as weighments, "
        "coalesce((select jsonb_agg(jsonb_build_object("
        "'rate_per_kg', a.rate_per_kg, 'total_amount', a.total_amount, "
        "'buyers', jsonb_build_object('name', b.name), "
        "'commissions', coalesce((select jsonb_agg(jsonb_build_object('commission_amount', c.commission_amount)) "
        "from commissions c where c.auction_id = a.id), '[]'::jsonb))) "
        "from auctions a left join buyers b on b.id = a.buyer_id where a.lot_id = l.id), '[]'::jsonb) as auctions, "
        "coalesce((select jsonb_agg(jsonb_build_object('net_payable', s.net_payable, "
        "'payment_status', s.payment_status, 'paid_date', s.paid_date)) "
        "from settlements s where s.lot_id = l.id), '[]'::jsonb) as settlements "
        "from produce_lots l left join farmers f on f.id = l.farmer_id "
        f"left join vegetables v on v.id = l.vegetable_id{w.sql()} "
        "order by l.created_at desc limit %s offset %s) t",
        [*w.params, size, offset],
    )
    return JsonResponse({"data": data, "total": total or 0, "page": page, "size": size})


def reports(request, user):
    date_from = (request.GET.get("from") or "").strip() or days_ago(30).isoformat()
    date_to = (request.GET.get("to") or "").strip() or utc_today().isoformat()
    for d in (date_from, date_to):
        if not valid_date(d):
            raise ApiError("Dates must be in YYYY-MM-DD format", 400)

    data = db.rows(
        "select to_jsonb(t) from (select a.auction_date::text as auction_date, a.total_amount, "
        "(select coalesce(sum(c.commission_amount), 0) from commissions c where c.auction_id = a.id) as commission, "
        "coalesce(v.name, 'Unknown') as vegetable "
        "from auctions a left join produce_lots l on l.id = a.lot_id "
        "left join vegetables v on v.id = l.vegetable_id "
        "where a.auction_date >= %s and a.auction_date <= %s order by a.auction_date) t",
        [date_from, date_to],
    )

    daily: dict = {}
    by_vegetable: dict = {}
    for a in data:
        sales = float(a["total_amount"] or 0)
        comm = float(a["commission"] or 0)
        day = daily.setdefault(a["auction_date"], {"sales": 0, "commission": 0, "count": 0})
        day["sales"] += sales
        day["commission"] += comm
        day["count"] += 1
        by_vegetable[a["vegetable"]] = by_vegetable.get(a["vegetable"], 0) + sales

    totals = {
        "sales": sum(d["sales"] for d in daily.values()),
        "commission": sum(d["commission"] for d in daily.values()),
        "count": sum(d["count"] for d in daily.values()),
    }
    return JsonResponse(
        {"from": date_from, "to": date_to, "daily": daily, "by_vegetable": by_vegetable, "totals": totals}
    )


def daily_rates(request, user):
    vegetable_id = request.GET.get("vegetable_id") or ""
    w = Where()
    if vegetable_id:
        w.add("p.vegetable_id = %s", vegetable_id)
    data = db.rows(
        "select to_jsonb(t) from (select p.rate_date, p.avg_rate, p.source, "
        "jsonb_build_object('name', v.name) as vegetables "
        "from price_history p left join vegetables v on v.id = p.vegetable_id"
        f"{w.sql()} order by p.rate_date) t",
        w.params,
    )
    return JsonResponse(data, safe=False)


def my_purchases(request, user):
    buyer = db.row(
        "select to_jsonb(t) from (select id, name from buyers where user_id = %s limit 1) t", [user["id"]]
    )
    if not buyer:
        return JsonResponse({"linked": False, "data": [], "summary": None})

    data = db.rows(
        "select to_jsonb(t) from (select a.id, a.rate_per_kg, a.total_amount, a.auction_date, "
        "jsonb_build_object('lot_no', l.lot_no, "
        "'vegetables', jsonb_build_object('name', v.name), "
        "'weighments', coalesce((select jsonb_agg(jsonb_build_object('net_weight', w.net_weight)) "
        "from weighments w where w.lot_id = l.id), '[]'::jsonb)) as produce_lots "
        "from auctions a left join produce_lots l on l.id = a.lot_id "
        "left join vegetables v on v.id = l.vegetable_id "
        "where a.buyer_id = %s order by a.auction_date desc limit 100) t",
        [buyer["id"]],
    )
    spent = sum(float(r["total_amount"] or 0) for r in data)
    return JsonResponse(
        {
            "linked": True,
            "buyer": buyer["name"],
            "data": data,
            "summary": {"purchases": len(data), "total_spent": round2(spent)},
        }
    )


dashboard_view = endpoint(GET=(dashboard, STAFF))
history_view = endpoint(GET=(history, STAFF))
reports_view = endpoint(GET=(reports, STAFF))
daily_rates_view = endpoint(GET=(daily_rates, STAFF))
my_view = endpoint(GET=(my_purchases, CUSTOMER))
