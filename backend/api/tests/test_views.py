"""API tests with the database mocked out (no Supabase needed)."""
import json
from unittest import mock

from django.test import SimpleTestCase

ADMIN = {"id": "u-admin", "email": "a@x.com", "name": "Admin", "phone": None,
         "requested_role": None, "role": "admin"}
STAFF = {**ADMIN, "id": "u-staff", "role": "staff"}
CUSTOMER = {**ADMIN, "id": "u-cust", "role": "customer"}


def as_user(user):
    return mock.patch("api.http.current_user", return_value=user)


class AccessControl(SimpleTestCase):
    def test_anonymous_gets_401(self):
        with as_user(None):
            self.assertEqual(self.client.get("/api/lots").status_code, 401)

    def test_customer_cannot_open_staff_pages(self):
        with as_user(CUSTOMER):
            self.assertEqual(self.client.get("/api/lots").status_code, 403)
            self.assertEqual(self.client.get("/api/dashboard").status_code, 403)

    def test_staff_cannot_finalize_settlement(self):
        with as_user(STAFF):
            self.assertEqual(self.client.patch("/api/settlements/abc/finalize").status_code, 403)

    def test_unknown_method_is_405(self):
        with as_user(ADMIN):
            self.assertEqual(self.client.delete("/api/lots").status_code, 405)

    def test_me_returns_current_user(self):
        with as_user(STAFF):
            res = self.client.get("/api/auth/me")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["role"], "staff")


class Validation(SimpleTestCase):
    def post(self, url, body, user=STAFF):
        with as_user(user):
            return self.client.post(url, json.dumps(body), content_type="application/json")

    def test_farmer_needs_name_and_10_digit_phone(self):
        self.assertEqual(self.post("/api/farmers", {"phone": "9876543210"}).status_code, 400)
        self.assertEqual(self.post("/api/farmers", {"name": "Ram", "phone": "123"}).status_code, 400)

    def test_lot_validation(self):
        self.assertEqual(self.post("/api/lots", {"vegetable_id": "v", "quantity": 5}).status_code, 400)
        self.assertEqual(self.post("/api/lots", {"farmer_id": "f", "quantity": 5}).status_code, 400)
        res = self.post("/api/lots", {"farmer_id": "f", "vegetable_id": "v", "quantity": 0})
        self.assertEqual(res.json()["error"], "Quantity must be greater than 0")

    def test_weighment_gross_must_exceed_tare(self):
        res = self.post("/api/weighments", {"lot_id": "l", "gross_weight": 10, "tare_weight": 12})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()["error"], "Gross weight must be greater than tare")

    def test_auction_rate_must_be_positive(self):
        res = self.post("/api/auctions", {"lot_id": "l", "buyer_id": "b", "rate_per_kg": 0})
        self.assertEqual(res.status_code, 400)

    def test_login_requires_email_and_password(self):
        res = self.client.post("/api/auth/login", json.dumps({"email": "a@b.co"}), content_type="application/json")
        self.assertEqual(res.status_code, 400)

    def test_signup_validation(self):
        bad_email = {"full_name": "A", "email": "nope", "password": "123456"}
        res = self.client.post("/api/auth/signup", json.dumps(bad_email), content_type="application/json")
        self.assertEqual(res.json()["error"], "Enter a valid email address")
        short_pw = {"full_name": "A", "email": "a@b.co", "password": "123"}
        res = self.client.post("/api/auth/signup", json.dumps(short_pw), content_type="application/json")
        self.assertEqual(res.json()["error"], "Password must be at least 6 characters")


class AuctionFlow(SimpleTestCase):
    def test_auction_calculates_total_and_commission(self):
        body = {"lot_id": "l1", "buyer_id": "b1", "rate_per_kg": 20, "commission_percent": 6}
        values = iter(["weighed", 100])  # lot status, net weight
        with as_user(STAFF), \
             mock.patch("api.views_workflow.db.value", side_effect=lambda *a, **k: next(values)), \
             mock.patch("api.views_workflow.db.row", return_value={"id": "a1", "lot_id": "l1"}), \
             mock.patch("api.views_workflow.db.execute"), \
             mock.patch("api.views_workflow.db.audit"), \
             mock.patch("api.views_workflow.transaction.atomic", mock.MagicMock()):
            res = self.client.post("/api/auctions", json.dumps(body), content_type="application/json")
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["commission_amount"], 120.0)
        self.assertEqual(data["net_weight"], 100.0)

    def test_auction_blocked_if_lot_not_weighed(self):
        body = {"lot_id": "l1", "buyer_id": "b1", "rate_per_kg": 20, "commission_percent": 6}
        with as_user(STAFF), \
             mock.patch("api.views_workflow.db.value", return_value="received"), \
             mock.patch("api.views_workflow.transaction.atomic", mock.MagicMock()):
            res = self.client.post("/api/auctions", json.dumps(body), content_type="application/json")
        self.assertEqual(res.status_code, 409)
