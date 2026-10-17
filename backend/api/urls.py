from django.http import JsonResponse
from django.urls import path

from . import db, views_admin, views_auth, views_insights, views_master, views_workflow


def health(request):
    """Used by Render. /api/health?db=1 also checks the database connection."""
    payload = {"ok": True}
    if request.GET.get("db"):
        try:
            payload["db"] = db.value("select 1") == 1
        except Exception as exc:  # noqa: BLE001
            return JsonResponse({"ok": False, "db": False, "error": str(exc).splitlines()[0]}, status=503)
    return JsonResponse(payload)


urlpatterns = [
    path("health", health),
    # auth
    path("auth/login", views_auth.login_view),
    path("auth/logout", views_auth.logout_view),
    path("auth/me", views_auth.me_view),
    path("auth/signup", views_auth.signup_view),
    # master data
    path("farmers", views_master.farmers_view),
    path("farmers/<str:pk>", views_master.farmer_detail_view),
    path("buyers", views_master.buyers_view),
    path("buyers/<str:pk>/link", views_master.buyer_link_view),
    path("customer-links", views_master.customer_links_view),
    path("lookups", views_master.lookups_view),
    # workflow
    path("lots", views_workflow.lots_view),
    path("weighments", views_workflow.weighments_view),
    path("auctions", views_workflow.auctions_view),
    path("settlements", views_workflow.settlements_view),
    path("settlements/<str:pk>/finalize", views_workflow.settlement_finalize_view),
    # insights
    path("dashboard", views_insights.dashboard_view),
    path("history", views_insights.history_view),
    path("reports", views_insights.reports_view),
    path("analytics/daily-rates", views_insights.daily_rates_view),
    path("my", views_insights.my_view),
    # admin
    path("users", views_admin.users_view),
    path("users/<str:pk>", views_admin.user_detail_view),
    path("audit", views_admin.audit_view),
    path("settings", views_admin.settings_view),
]
