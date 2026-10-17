"""Farmers, buyers, dropdown lookups and customer <-> buyer links."""
from django.http import JsonResponse

from . import db
from .db import Where
from .http import ApiError, body_of, endpoint
from .utils import PHONE_RE, page_args

STAFF = ("admin", "staff")
ADMIN = ("admin",)


# ---------------------------------------------------------------- farmers ----
def farmers_list(request, user):
    page, size, offset = page_args(request.GET)
    search = (request.GET.get("search") or "").strip()
    w = Where()
    if search:
        like = f"%{search}%"
        w.add("(name ilike %s or phone ilike %s or village ilike %s)", like, like, like)
    total = db.value(f"select count(*) from farmers{w.sql()}", w.params)
    data = db.rows(
        f"select to_jsonb(t) from (select * from farmers{w.sql()} "
        "order by created_at desc limit %s offset %s) t",
        [*w.params, size, offset],
    )
    return JsonResponse({"data": data, "total": total or 0, "page": page, "size": size})


def farmers_create(request, user):
    body = body_of(request)
    name = str(body.get("name") or "").strip()
    phone = str(body.get("phone") or "").strip()
    if not name:
        raise ApiError("Name is required", 400)
    if not PHONE_RE.match(phone):
        raise ApiError("Phone must be 10 digits", 400)

    created = db.row(
        "insert into farmers (name, phone, village, bank_account) values (%s, %s, %s, %s) "
        "returning to_jsonb(farmers)",
        [name, phone, body.get("village") or None, body.get("bank_account") or None],
    )
    db.audit(user["id"], "CREATE", "farmers", created["id"], {"name": name})
    return JsonResponse(created, status=201)


def farmers_update(request, user, pk):
    body = body_of(request)
    phone = body.get("phone")
    if phone and not PHONE_RE.match(str(phone)):
        raise ApiError("Phone must be 10 digits", 400)

    # only update the fields that were actually sent
    fields = [k for k in ("name", "phone", "village", "bank_account", "status") if k in body]
    if not fields:
        raise ApiError("Nothing to update", 400)
    sets = ", ".join(f"{k} = %s" for k in fields)  # column names come from the fixed list above
    updated = db.row(
        f"update farmers set {sets}, updated_at = now() where id = %s returning to_jsonb(farmers)",
        [*(body[k] for k in fields), pk],
    )
    if not updated:
        raise ApiError("Farmer not found", 404)
    db.audit(user["id"], "UPDATE", "farmers", pk, body)
    return JsonResponse(updated)


# ----------------------------------------------------------------- buyers ----
def buyers_list(request, user):
    page, size, offset = page_args(request.GET)
    search = (request.GET.get("search") or "").strip()
    w = Where()
    if search:
        like = f"%{search}%"
        w.add("(name ilike %s or phone ilike %s)", like, like)
    total = db.value(f"select count(*) from buyers{w.sql()}", w.params)
    data = db.rows(
        f"select to_jsonb(t) from (select * from buyers{w.sql()} "
        "order by created_at desc limit %s offset %s) t",
        [*w.params, size, offset],
    )
    return JsonResponse({"data": data, "total": total or 0, "page": page, "size": size})


def buyers_create(request, user):
    body = body_of(request)
    name = str(body.get("name") or "").strip()
    phone = str(body.get("phone") or "").strip()
    if not name:
        raise ApiError("Name is required", 400)
    if not PHONE_RE.match(phone):
        raise ApiError("Phone must be 10 digits", 400)

    created = db.row(
        "insert into buyers (name, phone) values (%s, %s) returning to_jsonb(buyers)",
        [name, phone],
    )
    db.audit(user["id"], "CREATE", "buyers", created["id"], {"name": name})
    return JsonResponse(created, status=201)


def buyer_link(request, user, pk):
    body = body_of(request)
    user_id = body.get("user_id") or None
    if user_id:
        role = db.value("select role from profiles where id = %s", [user_id])
        if role != "customer":
            raise ApiError("Selected user is not a customer", 400)
    db.execute("update buyers set user_id = %s, updated_at = now() where id = %s", [user_id, pk])
    db.audit(user["id"], "BUYER_LINK", "buyers", pk, {"user_id": user_id})
    return JsonResponse({"ok": True})


def customer_links(request, user):
    customers = db.rows(
        "select to_jsonb(t) from (select id, full_name from profiles where role = 'customer') t"
    )
    buyers = db.rows("select to_jsonb(t) from (select id, name, phone, user_id from buyers) t")
    return JsonResponse({"customers": customers, "buyers": buyers})


# ---------------------------------------------------------------- lookups ----
_LOT_BASE = (
    "select l.id, l.lot_no, {extra} "
    "jsonb_build_object('name', f.name) as farmers, "
    "jsonb_build_object('name', v.name) as vegetables "
    "from produce_lots l left join farmers f on f.id = l.farmer_id "
    "left join vegetables v on v.id = l.vegetable_id "
    "where l.status = '{status}' order by l.created_at desc"
)

_WEIGHMENTS = (
    "coalesce((select jsonb_agg(jsonb_build_object('net_weight', w.net_weight)) "
    "from weighments w where w.lot_id = l.id), '[]'::jsonb) as weighments, "
)

LOOKUPS = {
    "farmers": "select id, name, phone from farmers where status = 'active' order by name",
    "buyers": "select id, name, phone from buyers where status = 'active' order by name",
    "vegetables": "select id, name, unit from vegetables order by name",
    "lots_received": _LOT_BASE.format(extra="l.quantity,", status="received"),
    "lots_weighed": _LOT_BASE.format(extra=_WEIGHMENTS, status="weighed"),
    "lots_auctioned": _LOT_BASE.format(extra="", status="auctioned"),
}


def lookups(request, user):
    kind = request.GET.get("type")
    sql = LOOKUPS.get(kind)
    if not sql:
        raise ApiError("Invalid type", 400)
    return JsonResponse(db.rows(f"select to_jsonb(t) from ({sql}) t"), safe=False)


farmers_view = endpoint(GET=(farmers_list, STAFF), POST=(farmers_create, STAFF))
farmer_detail_view = endpoint(PUT=(farmers_update, STAFF))
buyers_view = endpoint(GET=(buyers_list, STAFF), POST=(buyers_create, STAFF))
buyer_link_view = endpoint(PATCH=(buyer_link, ADMIN))
customer_links_view = endpoint(GET=(customer_links, ADMIN))
lookups_view = endpoint(GET=(lookups, STAFF))
