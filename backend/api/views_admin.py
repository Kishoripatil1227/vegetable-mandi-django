"""User/role management, audit log and application settings."""
import logging

from django.http import JsonResponse

from . import db, supabase
from .http import ApiError, body_of, endpoint
from .utils import ROLES, num

log = logging.getLogger("mandi.admin")
STAFF = ("admin", "staff")
ADMIN = ("admin",)


def users_list(request, user):
    data = db.rows(
        "select to_jsonb(t) from (select id, full_name, role, created_at from profiles order by created_at) t"
    )
    return JsonResponse(data, safe=False)


def users_create(request, user):
    body = body_of(request)
    email = str(body.get("email") or "").strip()
    password = str(body.get("password") or "")
    role = body.get("role")

    if not email or len(password) < 6:
        raise ApiError("Email and password (min 6 chars) required", 400)
    if role not in ROLES:
        raise ApiError("Invalid role", 400)

    try:
        created, err = supabase.create_user(email, password, str(body.get("full_name") or ""))
    except supabase.SupabaseUnavailable:
        log.exception("supabase create user failed")
        raise ApiError("User service is unavailable. Please try again.", 502)
    if err:
        raise ApiError(err[1], 400)

    db.execute(
        "insert into profiles (id, role, full_name) values (%s, %s, %s) "
        "on conflict (id) do update set role = excluded.role, full_name = excluded.full_name",
        [created["id"], role, body.get("full_name") or None],
    )
    db.audit(user["id"], "USER_CREATE", "profiles", created["id"], {"role": role})
    return JsonResponse({"id": created["id"]}, status=201)


def users_change_role(request, user, pk):
    body = body_of(request)
    if body.get("role") not in ROLES:
        raise ApiError("Invalid role", 400)
    if str(pk) == user["id"]:
        raise ApiError("You cannot change your own role", 400)

    db.execute("update profiles set role = %s, updated_at = now() where id = %s", [body["role"], pk])
    db.audit(user["id"], "ROLE_CHANGE", "profiles", pk, {"role": body["role"]})
    return JsonResponse({"ok": True})


def audit_list(request, user):
    data = db.rows(
        "select to_jsonb(t) from (select a.*, jsonb_build_object('full_name', p.full_name) as profiles "
        "from audit_logs a left join profiles p on p.id = a.user_id "
        "order by a.created_at desc limit 50) t"
    )
    return JsonResponse(data, safe=False)


def settings_get(request, user):
    value = db.value("select value from app_settings where key = 'default_commission_percent'")
    if value is None:
        raise ApiError("Setting not found", 404)
    return JsonResponse({"default_commission_percent": num(value)})


def settings_put(request, user):
    pct = num(body_of(request).get("default_commission_percent"))
    if pct != pct or pct < 0 or pct > 100:
        raise ApiError("Commission must be between 0 and 100", 400)

    db.execute(
        "update app_settings set value = %s, updated_at = now() where key = 'default_commission_percent'",
        [str(int(pct)) if pct == int(pct) else str(pct)],
    )
    db.audit(user["id"], "SETTINGS_UPDATE", "app_settings", None, {"pct": pct})
    return JsonResponse({"ok": True})


users_view = endpoint(GET=(users_list, ADMIN), POST=(users_create, ADMIN))
user_detail_view = endpoint(PATCH=(users_change_role, ADMIN))
audit_view = endpoint(GET=(audit_list, ADMIN))
settings_view = endpoint(GET=(settings_get, STAFF), PUT=(settings_put, ADMIN))
