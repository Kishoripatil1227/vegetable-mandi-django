"""Supabase Auth over its REST API (password check, creating users).

Django never stores passwords: Supabase keeps auth.users, Django only keeps the
signed-cookie session after Supabase confirmed the password.
"""
import requests
from django.conf import settings

TIMEOUT = 15


class SupabaseUnavailable(Exception):
    pass


def _service_headers():
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def sign_in(email: str, password: str):
    """Returns the Supabase user dict on success, None for wrong credentials."""
    try:
        r = requests.post(
            f"{settings.SUPABASE_URL}/auth/v1/token",
            params={"grant_type": "password"},
            headers={"apikey": settings.SUPABASE_ANON_KEY, "Content-Type": "application/json"},
            json={"email": email, "password": password},
            timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        raise SupabaseUnavailable(str(exc)) from exc
    if r.status_code == 200:
        return r.json().get("user") or {}
    if r.status_code in (400, 401, 403, 422):
        return None
    raise SupabaseUnavailable(f"Supabase auth returned {r.status_code}")


def create_user(email: str, password: str, full_name: str):
    """Returns (user_dict, None) or (None, (http_status, message))."""
    try:
        r = requests.post(
            f"{settings.SUPABASE_URL}/auth/v1/admin/users",
            headers=_service_headers(),
            json={
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"full_name": full_name},
            },
            timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        raise SupabaseUnavailable(str(exc)) from exc
    if r.status_code in (200, 201):
        return r.json(), None
    try:
        body = r.json()
    except ValueError:
        body = {}
    message = body.get("msg") or body.get("message") or body.get("error_description") or "Could not create user"
    return None, (r.status_code, message)
