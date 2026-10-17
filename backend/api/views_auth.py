import logging
import re

from django.http import JsonResponse

from . import db, supabase
from .http import ANY, ApiError, body_of, endpoint, error
from .utils import EMAIL_RE

log = logging.getLogger("mandi.auth")


def login(request, user):
    body = body_of(request)
    email = str(body.get("email") or "").strip()
    password = str(body.get("password") or "")
    role = str(body.get("role") or "")

    if not email or not password:
        raise ApiError("Email and password are required", 400)

    try:
        sb_user = supabase.sign_in(email, password)
    except supabase.SupabaseUnavailable:
        log.exception("supabase sign-in failed")
        raise ApiError("Login service is unavailable. Please try again.", 502)
    if not sb_user or not sb_user.get("id"):
        raise ApiError("Invalid email or password", 401)

    profile = db.row(
        "select to_jsonb(p) from (select role, requested_role from profiles where id = %s) p",
        [sb_user["id"]],
    )
    if not profile:
        raise ApiError("Your account has no profile yet. Please contact the admin.", 403)

    if profile["role"] != role:
        if role == "staff" and profile.get("requested_role") == "staff":
            msg = "Your Staff request is waiting for admin approval. Please try again later or sign in as Customer."
        else:
            msg = f"This account is not registered as {role}. Please select the correct role."
        raise ApiError(msg, 403)

    request.session.flush()
    request.session["uid"] = str(sb_user["id"])
    request.session["email"] = sb_user.get("email") or email
    return JsonResponse({"ok": True, "role": profile["role"]})


def logout(request, user):
    request.session.flush()
    return JsonResponse({"ok": True})


def me(request, user):
    return JsonResponse(user)


def signup(request, user):
    body = body_of(request)
    name = str(body.get("full_name") or "").strip()
    email = str(body.get("email") or "").strip().lower()
    password = str(body.get("password") or "")
    wanted = "staff" if body.get("role") == "staff" else "customer"

    if not name:
        raise ApiError("Full name is required", 400)
    if not EMAIL_RE.match(email):
        raise ApiError("Enter a valid email address", 400)
    if len(password) < 6:
        raise ApiError("Password must be at least 6 characters", 400)

    try:
        created, err = supabase.create_user(email, password, name)
    except supabase.SupabaseUnavailable:
        log.exception("supabase create user failed")
        raise ApiError("Signup service is unavailable. Please try again.", 502)
    if err:
        status, message = err
        if re.search(r"already|registered|exists", message, re.I):
            raise ApiError("An account with this email already exists", 409)
        raise ApiError(message, 400)

    db.execute(
        "insert into profiles (id, full_name, role, requested_role) values (%s, %s, 'customer', %s) "
        "on conflict (id) do update set full_name = excluded.full_name, "
        "role = excluded.role, requested_role = excluded.requested_role",
        [created["id"], name, "staff" if wanted == "staff" else None],
    )
    return JsonResponse({"ok": True, "pending": wanted == "staff"}, status=201)


login_view = endpoint(POST=(login, None))
logout_view = endpoint(POST=(logout, None))
me_view = endpoint(GET=(me, ANY))
signup_view = endpoint(POST=(signup, None))
