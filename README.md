# 🥬 Vegetable Mandi Management

Web app for a vegetable mandi: **Farmer -> Vegetable lot -> Weighment -> Auction / Price -> Commission -> Farmer settlement -> History / Reports.**

- **Frontend:** React / Next.js (App Router) + Tailwind CSS, deployed on **Vercel**
- **Backend:** **Python + Django** REST API (`backend/`), deployed on **Render**
- **Database and login:** Supabase (PostgreSQL + Supabase Auth). The tables are the same ones the project already had, so existing data keeps working.

```
Browser  ->  Vercel (Next.js pages)  --/api/*-->  Render (Django API)  ->  Supabase (Postgres + Auth)
```

The React pages still call `/api/...`. `next.config.ts` forwards every `/api/*` request to Django, so the browser sees one origin and cookies work without CORS.

## Modules (from the project brief)

| # | Module | Where |
|---|---|---|
| 1 | Authentication and roles (admin, staff, customer) | `/login`, `/signup`, `/roles` |
| 2 | Farmer / customer management | `/farmers`, `/buyers`, `/customer-links` |
| 3 | Produce lot management | `/lots` |
| 4 | Weighment | `/weighments` |
| 5 | Auction / price | `/auctions` |
| 6 | Commission | calculated in `/auctions`, default rate in `/settings` |
| 7 | Settlement / farmer payment | `/settlements` |
| 8 | Search and history | `/history` |
| 9 | Reports and dashboard | `/reports`, `/dashboard` |
| 10 | Status tracking | lot status badges, pipeline on the dashboard |
| 11 | Settings and audit | `/settings`, audit log (admin) |

## Folder structure

```
src/                     React / Next.js frontend
  app/(app)/             logged-in pages
  components/            MasterPage, StatusBadge, NavLinks ...
  lib/supabase/          client.ts (password reset), auth.ts (session check via Django)
backend/                 Django API
  mandi/                 settings, urls, wsgi
  api/                   views_*.py, db.py, http.py, supabase.py, utils.py, tests/
  requirements.txt  render.yaml  .env.example
docs/                    API.md, ER_DIAGRAM.md, TEST_CASES.md
```

## Run locally

You need Node 20+, Python 3.10+ and the Supabase project.

**1. Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows   (Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # then fill in the values (see below)
python manage.py runserver      # http://127.0.0.1:8000/api/health
```

Values for `backend/.env`:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase -> Connect -> **Session pooler** connection string. Put your database password in place of `[YOUR-PASSWORD]` (reset it under Project Settings -> Database if you forgot it). |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase -> Project Settings -> API |
| `DJANGO_SECRET_KEY` | any long random string |
| `DEBUG` | `1` locally, `0` in production |

Check the database connection: open `http://127.0.0.1:8000/api/health?db=1`. It should show `{"ok": true, "db": true}`.

**2. Frontend** (second terminal, project root)

```bash
npm install
copy .env.local.example .env.local   # fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev                          # http://localhost:3000
```

`BACKEND_URL` in `.env.local` stays `http://127.0.0.1:8000` locally.

**3. Tests**

```bash
cd backend
set DEBUG=1                          # Mac/Linux: export DEBUG=1
python manage.py test
```

## Deploy

**Backend on Render**

1. Push the repo to GitHub.
2. Render -> New -> Blueprint (or Web Service), pick the repo. `backend/render.yaml` has the settings: root `backend`, build `pip install -r requirements.txt`, start `gunicorn mandi.wsgi:application`.
3. Add the environment variables: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (`DJANGO_SECRET_KEY` is generated).
4. After the deploy, open `https://<your-service>.onrender.com/api/health?db=1`.

**Frontend on Vercel**

1. Import the same repo in Vercel (framework: Next.js, root directory: the repo root).
2. Environment Variables (Production and Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `BACKEND_URL` = `https://<your-service>.onrender.com`
3. Deploy. `SUPABASE_SERVICE_ROLE_KEY` is no longer needed on Vercel, remove it there.
4. Supabase -> Authentication -> URL Configuration: add the Vercel URL to Site URL and Redirect URLs (needed for forgot / reset password).

Note: Render's free plan sleeps after inactivity, the first request can take about a minute. Open `/api/health` once before a demo.

## Git workflow

```
feature/<name> -> develop -> main
```

Commit style: `feat:`, `fix:`, `style:`, `docs:`. Every pull request gets a Vercel preview URL.

## Documentation

- [`docs/API.md`](docs/API.md) - all endpoints, roles, request and response shapes
- [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md) - database tables and relations
- [`docs/TEST_CASES.md`](docs/TEST_CASES.md) - manual test cases for the final demo
