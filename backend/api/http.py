"""Tiny routing/auth layer: one decorator gives every API view the same
role check, JSON error format and database-error handling as the old Next.js
`requireRole()` / `dbError()` helpers."""
import json
import logging

from django.db import DataError, DatabaseError, IntegrityError
from django.http import JsonResponse

from . import db

log = logging.getLogger("mandi.api")

ANY = ("admin", "staff", "customer")


class ApiError(Exception):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message = message
        self.status = status


def error(message: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"error": message}, status=status)


def ok(data, status: int = 200) -> JsonResponse:
    return JsonResponse(data, status=status, safe=False)


def body_of(request) -> dict:
    try:
        data = json.loads(request.body or b"{}")
    except ValueError:
        return {}
    return data if isinstance(data, dict) else {}


def current_user(request):
    """Logged-in user (profile row + email from the session) or None."""
    uid = request.session.get("uid")
    if not uid:
        return None
    profile = db.row(
        "select to_jsonb(p) from (select id, full_name, phone, role, requested_role "
        "from profiles where id = %s) p",
        [uid],
    )
    if not profile:
        return None
    return {
        "id": str(profile["id"]),
        "email": request.session.get("email") or "",
        "name": profile.get("full_name"),
        "phone": profile.get("phone"),
        "requested_role": profile.get("requested_role"),
        "role": profile.get("role"),
    }


def _db_error(exc: Exception) -> JsonResponse:
    text = str(exc).strip().splitlines()[0] if str(exc).strip() else "Database error"
    if isinstance(exc, IntegrityError) and "duplicate key" in text:
        return error("Record already exists (duplicate phone)", 409)
    if isinstance(exc, DataError):
        return error("Invalid input", 400)
    log.exception("database error")
    return error(text, 500)


def endpoint(**methods):
    """endpoint(GET=(handler, roles), POST=(handler, roles))

    roles=None  -> public, roles=ANY -> any logged-in user,
    roles=('admin',) -> only those roles. Handlers get (request, user, **kwargs).
    """

    def view(request, **kwargs):
        entry = methods.get(request.method)
        if entry is None:
            return error("Method not allowed", 405)
        handler, roles = entry
        user = None
        if roles is not None:
            try:
                user = current_user(request)
            except DatabaseError as exc:
                return _db_error(exc)
            if user is None:
                return error("Unauthorized", 401)
            if user["role"] not in roles:
                return error("Forbidden", 403)
        try:
            return handler(request, user, **kwargs)
        except ApiError as exc:
            return error(exc.message, exc.status)
        except DatabaseError as exc:
            return _db_error(exc)

    return view
