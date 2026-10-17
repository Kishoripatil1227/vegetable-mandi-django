# API Documentation

Base path: `/api` (Django). Auth is a signed session cookie set by `POST /api/auth/login`.
Errors are always JSON: `{ "error": "message" }`. Status codes: 400 validation, 401 not logged in, 403 wrong role, 404 not found, 409 conflict, 500/502 server.

Roles: **A** admin, **S** staff, **C** customer.
Lists are paginated, 10 per page: `?page=1`. Response: `{ data, total, page, size }`.

## Auth

| Method | Path | Roles | Body / query | Response |
|---|---|---|---|---|
| POST | `/auth/login` | public | `email`, `password`, `role` | `{ ok, role }` and session cookie |
| POST | `/auth/logout` | public | | `{ ok }` |
| GET | `/auth/me` | A S C | | `{ id, email, name, phone, requested_role, role }` |
| POST | `/auth/signup` | public | `full_name`, `email`, `password` (min 6), `role` (`customer` or `staff`) | `{ ok, pending }` (201). Staff signups wait for admin approval. |

## Master data

| Method | Path | Roles | Body / query | Notes |
|---|---|---|---|---|
| GET | `/farmers` | A S | `search`, `page` | search on name, phone, village |
| POST | `/farmers` | A S | `name`, `phone` (10 digits), `village`, `bank_account` | 201 |
| PUT | `/farmers/{id}` | A S | any of `name`, `phone`, `village`, `bank_account`, `status` | only sent fields change |
| GET | `/buyers` | A S | `search`, `page` | |
| POST | `/buyers` | A S | `name`, `phone` (10 digits) | 201 |
| PATCH | `/buyers/{id}/link` | A | `user_id` (a customer profile, or null to unlink) | links a customer login to a buyer |
| GET | `/customer-links` | A | | `{ customers, buyers }` |
| GET | `/lookups?type=` | A S | `farmers`, `buyers`, `vegetables`, `lots_received`, `lots_weighed`, `lots_auctioned` | dropdown data |

## Workflow

| Method | Path | Roles | Body / query | Rules |
|---|---|---|---|---|
| GET | `/lots` | A S | `status`, `search` (lot no), `page` | |
| POST | `/lots` | A S | `farmer_id`, `vegetable_id`, `quantity` (> 0) | lot no `LOT-YYYYMMDD-NNNN`, status `received` |
| GET | `/weighments` | A S | `page` | |
| POST | `/weighments` | A S | `lot_id`, `gross_weight`, `tare_weight` | gross > tare, lot must be `received`; lot becomes `weighed`; net weight is calculated by the database |
| GET | `/auctions` | A S | `page` | includes buyer, commission, lot |
| POST | `/auctions` | A S | `lot_id`, `buyer_id`, `rate_per_kg` (> 0), `commission_percent` (optional, 0 to 100) | lot must be `weighed`; total = net x rate; commission = total x percent; default percent from settings; lot becomes `auctioned` |
| GET | `/settlements` | A S | `status` (`pending` / `paid`), `page` | |
| POST | `/settlements` | A S | `lot_id` | lot must be `auctioned`; net payable = auction total - commission |
| PATCH | `/settlements/{id}/finalize` | A | | marks `paid`, lot becomes `settled` |

## Insights

| Method | Path | Roles | Query | Response |
|---|---|---|---|---|
| GET | `/dashboard` | A S | | `lots_today, active_farmers, pending_count, pending_amount, total_sales, total_commission, by_status` |
| GET | `/history` | A S | `search`, `status`, `from`, `to` (YYYY-MM-DD), `page`, `size` | lots with weighment, auction, commission, settlement |
| GET | `/reports` | A S | `from`, `to` (default: last 30 days) | `{ from, to, daily, by_vegetable, totals }` |
| GET | `/analytics/daily-rates` | A S | `vegetable_id` | price history |
| GET | `/my` | C | | the customer's purchases: `{ linked, buyer, data, summary }` |

## Administration

| Method | Path | Roles | Body | Notes |
|---|---|---|---|---|
| GET | `/users` | A | | all profiles |
| POST | `/users` | A | `email`, `password`, `role`, `full_name` | creates a login and profile |
| PATCH | `/users/{id}` | A | `role` | cannot change your own role |
| GET | `/audit` | A | | last 50 audit entries |
| GET | `/settings` | A S | | `{ default_commission_percent }` |
| PUT | `/settings` | A | `default_commission_percent` (0 to 100) | |
| GET | `/health` | public | `?db=1` | service and database check |
