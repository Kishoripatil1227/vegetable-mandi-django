# 🥬 Vegetable Mandi Management System

A web application that digitizes the daily work of a vegetable mandi (wholesale market): receiving farmer produce, weighing it, auctioning it to buyers, calculating commission and settling payment with the farmer.

**Workflow:** Farmer → Vegetable lot → Weighment → Auction / price → Commission → Farmer settlement → History and reports

## Live links

| What | Link |
|---|---|
| Live application (frontend, Vercel) | https://vegetable-mandi-django-biofk4582-kishoripatil1227.vercel.app |
| Backend API health check (Render) | https://vegetable-mandi-django.vercel.app/api/health |
| Source code | https://github.com/Kishoripatil1227/vegetable-mandi-django |

> The backend runs on a free Render plan and sleeps after inactivity. The first request can take about a minute.

## Features

| Module | What it does |
|---|---|
| Authentication and roles | Login, signup, forgot / reset password, three roles |
| Farmers and buyers | Add, search and view, link a customer login to a buyer |
| Produce lots | Create lots with an automatic lot number, search, status filter |
| Weighment | Gross and tare weight, net weight calculated and validated |
| Auction and commission | Rate per kg and buyer, total and commission calculated |
| Settlements | Net payable per lot, pending and paid status, admin finalizes |
| Search and history | Find lots by number, status and dates with the full chain |
| Reports and dashboard | Daily sales chart, top vegetables, lot pipeline, totals |
| Settings and audit | Default commission, role management, audit log |

## User roles

| Role | Access |
|---|---|
| Admin / Owner | Everything, finalizes payments, manages users, roles and settings |
| Staff / Operator | Daily entries (farmers, buyers, lots, weighments, auctions, settlements). Cannot finalize payments |
| Customer | Sees only their own purchases and rates |

Test accounts for the demo (create them from the Signup page and ask the admin to set the role):

| Role | Email |
|---|---|
| Admin | admin@example.com |
| Staff | staff@example.com |
| Customer | customer@example.com |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | Python, Django (REST API in JSON) |
| Database and authentication | PostgreSQL and Auth on Supabase |
| Hosting | Vercel (frontend), Render (backend) |
| Version control | Git and GitHub (feature branch → develop → main) |

## Architecture

```
Browser → Vercel (Next.js pages) → /api/* → Render (Django API) → Supabase (PostgreSQL + Auth)
```

The React pages call `/api/...`. Next.js forwards every `/api` request to the Django server, so the browser sees one site and the session cookie works without CORS.

## Folder structure

```
src/                     Next.js frontend (pages, components, theme)
  app/(app)/             logged-in pages: dashboard, farmers, lots, ...
  components/            shared components
backend/                 Django API
  mandi/                 settings, urls, wsgi
  api/                   views, SQL helpers, Supabase auth client, tests
docs/                    API.md, ER_DIAGRAM.md, TEST_CASES.md, WORKLOAD.md
public/images/           images used by the home and login pages
```

## Run locally

Requirements: Node.js 20+, Python 3.10+, a Supabase project.

**1. Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Mac / Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env          # Mac / Linux: cp .env.example .env
python manage.py runserver      # http://127.0.0.1:8000/api/health?db=1
```

Fill `backend/.env`:

| Variable | Meaning |
|---|---|
| `DEBUG` | `1` locally, `0` in production |
| `DJANGO_SECRET_KEY` | long random string |
| `ALLOWED_HOSTS` | allowed host names |
| `DATABASE_URL` | Supabase Postgres connection string (Session pooler) |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project API settings |

**2. Frontend** (second terminal, project root)

```bash
npm install
copy .env.local.example .env.local   # Mac / Linux: cp .env.local.example .env.local
npm run dev                          # http://localhost:3000
```

Fill `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `BACKEND_URL` (`http://127.0.0.1:8000` locally).

**3. Tests**

```bash
cd backend
set DEBUG=1                     # Mac / Linux: export DEBUG=1
python manage.py test
```

Never commit `.env` or `.env.local`. Only the `.example` files are in the repository.

## Deployment

1. **Backend on Render:** New → Blueprint (or Web Service), root directory `backend`, build `pip install -r requirements.txt`, start `gunicorn mandi.wsgi:application`. Add the backend environment variables.
2. **Frontend on Vercel:** import the repository, framework Next.js, add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `BACKEND_URL` (the Render URL, no trailing slash). Redeploy after changing a variable.
3. **Supabase:** Authentication → URL Configuration → add the Vercel URL to Site URL and Redirect URLs.
4. Every push to `main` deploys automatically. Every pull request gets a Vercel preview URL.

## Documentation

| File | Content |
|---|---|
| [docs/API.md](docs/API.md) | All endpoints, roles, request and response examples |
| [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md) | Database tables and relations |
| [docs/TEST_CASES.md](docs/TEST_CASES.md) | Manual test cases for the live system |
| [docs/WORKLOAD.md](docs/WORKLOAD.md) | Task plan and workload |

## Concepts used in this project

| Concept | Where it is used |
|---|---|
| REST API design | About 25 JSON endpoints in Django |
| Authentication and role-based access | Supabase Auth, session cookie, admin / staff / customer checks |
| Relational database design | 12 PostgreSQL tables with primary and foreign keys |
| Transactions | Weighment, auction and settlement update several tables together |
| Validation | Phone, weight, rate, commission and status rules in the backend |
| Responsive UI | Tailwind CSS, works on mobile and desktop |
| Testing | Automated Django tests and manual test cases |
| Git workflow | Feature branches, pull requests, develop and main |
| Deployment | Vercel, Render and Supabase |

## Project history

The project was built in phases, and the commit history of both repositories shows it:

1. **Phase 1:** React / Next.js application with a Next.js API and Supabase, in the earlier repository https://github.com/Kishoripatil1227/vegetable-mandi-management (authentication, farmers, lots, auctions, settlements, reports, UI polish).
2. **Phase 2:** Backend moved to Python Django with the same API paths, Supabase kept as the database.
3. **Phase 3:** New dark green design for the home page, login, sidebar and dashboard, then page-by-page UI updates.

## Future enhancements

- SMS or WhatsApp notification to farmers when a payment is marked paid
- PDF export of settlement statements and reports
- Multiple mandi / branch support
- Daily market rate import
- Hindi and Marathi language support

## Author

[kishori patil] · [zoyasoft technologies] · [August 2026]