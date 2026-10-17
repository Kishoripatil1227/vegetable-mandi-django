"""Lot -> weighment -> auction (+commission) -> settlement."""
from django.db import IntegrityError, transaction
from django.http import JsonResponse

from . import db
from .db import Where
from .http import ApiError, body_of, endpoint
from .utils import (
    calc_auction,
    calc_net_payable,
    is_positive,
    make_lot_no,
    num,
    page_args,
)

STAFF = ("admin", "staff")
ADMIN = ("admin",)

# Reusable JSON fragments (same nested shape the old Supabase queries returned)
_LOT_PEOPLE = (
    "jsonb_build_object('lot_no', l.lot_no, "
    "'farmers', jsonb_build_object('name', f.name), "
    "'vegetables', jsonb_build_object('name', v.name))"
)


# ------------------------------------------------------------------- lots ----
def lots_list(request, user):
    page, size, offset = page_args(request.GET)
    status = (request.GET.get("status") or "").strip()
    search = (request.GET.get("search") or "").strip()
    w = Where()
    if status:
        w.add("l.status = %s", status)
    if search:
        w.add("l.lot_no ilike %s", f"%{search}%")
    total = db.value(f"select count(*) from produce_lots l{w.sql()}", w.params)
    data = db.rows(
        "select to_jsonb(t) from (select l.*, "
        "jsonb_build_object('name', f.name, 'phone', f.phone) as farmers, "
        "jsonb_build_object('name', v.name) as vegetables "
        "from produce_lots l left join farmers f on f.id = l.farmer_id "
        f"left join vegetables v on v.id = l.vegetable_id{w.sql()} "
        "order by l.created_at desc limit %s offset %s) t",
        [*w.params, size, offset],
    )
    return JsonResponse({"data": data, "total": total or 0, "page": page, "size": size})


def lots_create(request, user):
    body = body_of(request)
    quantity = num(body.get("quantity"))
    if not body.get("farmer_id"):
        raise ApiError("Farmer is required", 400)
    if not body.get("vegetable_id"):
        raise ApiError("Vegetable is required", 400)
    if not is_positive(quantity):
        raise ApiError("Quantity must be greater than 0", 400)

    created = None
    for _ in range(5):  # lot_no has a random part, retry on the rare collision
        lot_no = make_lot_no()
        try:
            with transaction.atomic():
                created = db.row(
                    "insert into produce_lots (lot_no, farmer_id, vegetable_id, quantity, created_by) "
                    "values (%s, %s, %s, %s, %s) returning to_jsonb(produce_lots)",
                    [lot_no, body["farmer_id"], body["vegetable_id"], quantity, user["id"]],
                )
            break
        except IntegrityError as exc:
            if "lot_no" not in str(exc):
                raise
    if not created:
        raise ApiError("Could not generate a unique lot number, please try again", 500)

    db.audit(user["id"], "CREATE", "produce_lots", created["id"], {"lot_no": created["lot_no"]})
    return JsonResponse(created, status=201)


# -------------------------------------------------------------- weighments ----
def weighments_list(request, user):
    page, size, offset = page_args(request.GET)
    total = db.value("select count(*) from weighments")
    data = db.rows(
        f"select to_jsonb(t) from (select w.*, {_LOT_PEOPLE} as produce_lots "
        "from weighments w left join produce_lots l on l.id = w.lot_id "
        "left join farmers f on f.id = l.farmer_id left join vegetables v on v.id = l.vegetable_id "
        "order by w.created_at desc limit %s offset %s) t",
        [size, offset],
    )
    return JsonResponse({"data": data, "total": total or 0, "page": page, "size": size})


def weighments_create(request, user):
    body = body_of(request)
    gross = num(body.get("gross_weight"))
    tare = num(body.get("tare_weight") or 0)

    if not body.get("lot_id"):
        raise ApiError("Lot is required", 400)
    if not is_positive(gross):
        raise ApiError("Gross weight must be greater than 0", 400)
    if not (tare >= 0):
        raise ApiError("Tare cannot be negative", 400)
    if gross <= tare:
        raise ApiError("Gross weight must be greater than tare", 400)

    with transaction.atomic():
        status = db.value("select status from produce_lots where id = %s for update", [body["lot_id"]])
        if status is None:
            raise ApiError("Lot not found", 404)
        if status != "received":
            raise ApiError(f"Lot already {status}", 409)

        created = db.row(
            "insert into weighments (lot_id, gross_weight, tare_weight, weighed_by) "
            "values (%s, %s, %s, %s) returning to_jsonb(weighments)",
            [body["lot_id"], gross, tare, user["id"]],
        )
        db.execute("update produce_lots set status = 'weighed', updated_at = now() where id = %s", [body["lot_id"]])

    db.audit(user["id"], "WEIGH", "weighments", created["id"],
             {"lot_id": body["lot_id"], "net": created.get("net_weight")})
    return JsonResponse(created, status=201)


# ---------------------------------------------------------------- auctions ----
def auctions_list(request, user):
    page, size, offset = page_args(request.GET)
    total = db.value("select count(*) from auctions")
    data = db.rows(
        "select to_jsonb(t) from (select a.*, "
        "jsonb_build_object('name', b.name) as buyers, "
        "coalesce((select jsonb_agg(jsonb_build_object('percent', c.percent, "
        "'commission_amount', c.commission_amount)) from commissions c where c.auction_id = a.id), "
        "'[]'::jsonb) as commissions, "
        f"{_LOT_PEOPLE} as produce_lots "
        "from auctions a left join buyers b on b.id = a.buyer_id "
        "left join produce_lots l on l.id = a.lot_id "
        "left join farmers f on f.id = l.farmer_id left join vegetables v on v.id = l.vegetable_id "
        "order by a.created_at desc limit %s offset %s) t",
        [size, offset],
    )
    return JsonResponse({"data": data, "total": total or 0, "page": page, "size": size})


def auctions_create(request, user):
    body = body_of(request)
    rate = num(body.get("rate_per_kg"))

    if not body.get("lot_id"):
        raise ApiError("Lot is required", 400)
    if not body.get("buyer_id"):
        raise ApiError("Buyer is required", 400)
    if not is_positive(rate):
        raise ApiError("Rate must be greater than 0", 400)

    # commission percent: from the form, otherwise the default setting
    raw = body.get("commission_percent")
    percent = float("nan") if raw in ("", None) else num(raw)
    if percent != percent:  # NaN
        default = db.value("select value from app_settings where key = 'default_commission_percent'")
        percent = num(default) if default not in (None, "") else 6.0
    if percent < 0 or percent > 100:
        raise ApiError("Commission must be between 0 and 100", 400)

    with transaction.atomic():
        status = db.value("select status from produce_lots where id = %s for update", [body["lot_id"]])
        if status is None:
            raise ApiError("Lot not found", 404)
        if status != "weighed":
            raise ApiError(f"Lot must be weighed first (current: {status})", 409)

        net = db.value("select net_weight from weighments where lot_id = %s limit 1", [body["lot_id"]])
        if net is None:
            raise ApiError("Weighment not found", 404)
        net = float(net)

        total, commission = calc_auction(net, rate, percent)

        auction = db.row(
            "insert into auctions (lot_id, buyer_id, rate_per_kg, total_amount, created_by) "
            "values (%s, %s, %s, %s, %s) returning to_jsonb(auctions)",
            [body["lot_id"], body["buyer_id"], rate, total, user["id"]],
        )
        db.execute(
            "insert into commissions (auction_id, percent, commission_amount) values (%s, %s, %s)",
            [auction["id"], percent, commission],
        )
        db.execute("update produce_lots set status = 'auctioned', updated_at = now() where id = %s", [body["lot_id"]])

    db.audit(user["id"], "AUCTION", "auctions", auction["id"],
             {"total": total, "percent": percent, "commission": commission})
    return JsonResponse(
        {**auction, "commission_amount": commission, "percent": percent, "net_weight": net}, status=201
    )


# ------------------------------------------------------------- settlements ----
def settlements_list(request, user):
    page, size, offset = page_args(request.GET)
    status = (request.GET.get("status") or "").strip()
    w = Where()
    if status:
        w.add("s.payment_status = %s", status)
    total = db.value(f"select count(*) from settlements s{w.sql()}", w.params)
    data = db.rows(
        "select to_jsonb(t) from (select s.*, "
        "jsonb_build_object('name', f.name, 'phone', f.phone) as farmers, "
        "jsonb_build_object('lot_no', l.lot_no, 'vegetables', jsonb_build_object('name', v.name)) as produce_lots "
        "from settlements s left join farmers f on f.id = s.farmer_id "
        "left join produce_lots l on l.id = s.lot_id left join vegetables v on v.id = l.vegetable_id"
        f"{w.sql()} order by s.created_at desc limit %s offset %s) t",
        [*w.params, size, offset],
    )
    return JsonResponse({"data": data, "total": total or 0, "page": page, "size": size})


def settlements_create(request, user):
    body = body_of(request)
    if not body.get("lot_id"):
        raise ApiError("Lot is required", 400)

    with transaction.atomic():
        lot = db.row(
            "select to_jsonb(t) from (select status, farmer_id from produce_lots where id = %s for update) t",
            [body["lot_id"]],
        )
        if not lot:
            raise ApiError("Lot not found", 404)
        if lot["status"] != "auctioned":
            raise ApiError(f"Lot must be auctioned first (current: {lot['status']})", 409)

        auction = db.row(
            "select to_jsonb(t) from (select a.id, a.total_amount, "
            "(select c.commission_amount from commissions c where c.auction_id = a.id limit 1) as commission_amount "
            "from auctions a where a.lot_id = %s limit 1) t",
            [body["lot_id"]],
        )
        if not auction:
            raise ApiError("Auction not found", 404)

        gross = float(auction["total_amount"])
        commission = float(auction.get("commission_amount") or 0)
        net_payable = calc_net_payable(gross, commission)

        created = db.row(
            "insert into settlements (lot_id, farmer_id, gross_amount, commission_amount, net_payable) "
            "values (%s, %s, %s, %s, %s) returning to_jsonb(settlements)",
            [body["lot_id"], lot["farmer_id"], gross, commission, net_payable],
        )

    db.audit(user["id"], "SETTLEMENT_CREATE", "settlements", created["id"], {"net": created.get("net_payable")})
    return JsonResponse(created, status=201)


def settlements_finalize(request, user, pk):
    with transaction.atomic():
        s = db.row("select to_jsonb(t) from (select * from settlements where id = %s for update) t", [pk])
        if not s:
            raise ApiError("Settlement not found", 404)
        if s["payment_status"] != "pending":
            raise ApiError(f"Already {s['payment_status']}", 409)

        updated = db.row(
            "update settlements set payment_status = 'paid', paid_date = current_date, "
            "finalized_by = %s, updated_at = now() where id = %s returning to_jsonb(settlements)",
            [user["id"], pk],
        )
        db.execute("update produce_lots set status = 'settled', updated_at = now() where id = %s", [s["lot_id"]])

    db.audit(user["id"], "SETTLEMENT_FINALIZE", "settlements", pk, {"net": s.get("net_payable")})
    return JsonResponse(updated)


lots_view = endpoint(GET=(lots_list, STAFF), POST=(lots_create, STAFF))
weighments_view = endpoint(GET=(weighments_list, STAFF), POST=(weighments_create, STAFF))
auctions_view = endpoint(GET=(auctions_list, STAFF), POST=(auctions_create, STAFF))
settlements_view = endpoint(GET=(settlements_list, STAFF), POST=(settlements_create, STAFF))
settlement_finalize_view = endpoint(PATCH=(settlements_finalize, ADMIN))
