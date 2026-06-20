# SmartCampus — Deployment Guide

This is a three-tier app, so "deploying the website" means deploying three
pieces, in this order: **database → backend → frontend**.

```
┌────────────────┐      HTTPS/JSON       ┌──────────────────┐      JDBC      ┌──────────┐
│  frontend/      │  ───────────────────▶ │  backend/         │ ─────────────▶ │ MySQL DB │
│  React + Vite   │  ◀───────────────────  │  Spring Boot      │ ◀───────────── │          │
│  (static SPA)   │                        │  (REST API :8080) │                └──────────┘
└────────────────┘                        └──────────────────┘
   Netlify / Vercel                       Render / Railway / Fly.io          PlanetScale / Railway /
                                                                              any managed MySQL
```

A note on what's in this package: this is the **"reviewed" build** —
9 real bugs (3 of which broke compilation/login flows) were already found
and fixed in an earlier review pass, documented in `CHANGELOG-REVIEW.md`.
While preparing this for deployment I found and fixed one more: a broken
import (`ApprovalPage.jsx` pointed at a Navbar file that doesn't exist),
which made `npm run build` fail outright. I rebuilt the frontend after the
fix and confirmed it now compiles cleanly.

---

## 1. Database (MySQL)

Use any managed MySQL host — Railway, PlanetScale, AWS RDS, or your own
server. Create a database, then run:

```bash
mysql -u <user> -p -h <host> <database> < database/init.sql
```

This creates the schema (Hibernate also auto-creates/updates tables on
backend startup via `ddl-auto=update`, so `init.sql` mainly matters for
seeding the default admin account) and seeds:

```
Email:    admin@smartcampus.edu
Password: Admin@1234
```

**Change this password immediately after your first login.**

`database/schema.sql` is a fuller reference schema (indexes, FKs, views) if
you want to inspect the data model — it's documentation, not something you
need to run separately.

---

## 2. Backend (Spring Boot)

A `Dockerfile` is included at `backend/Dockerfile`, so any container-based
host works. Render and Railway are the simplest (free/cheap tiers, detect
the Dockerfile automatically when you point them at the `backend/` folder).

**Render:**
1. New → Web Service → connect your repo, set root directory to `backend`.
2. Render detects the Dockerfile automatically.
3. Add the environment variables below.
4. Deploy — note the public URL it gives you (e.g. `https://smartcampus-api.onrender.com`).

**Railway:** same idea — new project → deploy from repo → set root directory
to `backend` → add env vars → deploy.

**Environment variables to set** (all have safe local-dev defaults baked
into `application.properties`, but every one of these must be set for a
real deployment):

| Variable | Example | Notes |
|---|---|---|
| `DB_URL` | `jdbc:mysql://host:3306/smartcampus_db?useSSL=true&serverTimezone=Asia/Kolkata` | from step 1 |
| `DB_USERNAME` | `smartcampus_user` | |
| `DB_PASSWORD` | *(your DB password)* | |
| `JWT_SECRET` | output of `openssl rand -base64 64` | **must** change — the committed default is public |
| `MAIL_USERNAME` | your Gmail address | for OTP emails |
| `MAIL_PASSWORD` | Gmail **App Password** (not your real password) | Google Account → Security → App Passwords, needs 2FA on |
| `FRONTEND_URL` | `https://your-frontend.netlify.app` | used for CORS — see the chicken-and-egg note below |

Health check endpoint (no auth required): `GET /api/actuator/health`.

---

## 3. Frontend (React/Vite static build)

This compiles to a static SPA — no Node server needed in production.

```bash
cd frontend
cp .env.example .env        # edit VITE_API_BASE_URL to your backend's URL from step 2
npm install
npm run build                # outputs to frontend/dist/
```

Vite **inlines** `VITE_API_BASE_URL` at build time — it cannot be changed
after the fact without rebuilding, so the backend must already be deployed
(or at least have a known URL) before this step.

Deploy the `dist/` folder:
- **Netlify** — drag-and-drop `dist/` in the UI, or `netlify deploy --dir=dist --prod`. Client-side routing needs a catch-all redirect to `index.html` (Netlify: add a `_redirects` file in `dist/` containing `/* /index.html 200`).
- **Vercel** — `vercel --prod` from inside `dist/`, or import the repo with output directory set to `frontend/dist`. Add a `vercel.json` with a rewrite to `index.html` for the same reason.
- **Any static host (S3/CloudFront, Nginx, etc.)** — upload `dist/` contents, add a catch-all rewrite to `index.html`:
  ```nginx
  location / { try_files $uri /index.html; }
  ```

---

## 4. Close the loop (CORS)

Once the frontend has a real URL, go back to the backend's `FRONTEND_URL`
environment variable and set it to that exact URL, then redeploy the
backend. Until this matches, the browser will block API calls with a CORS
error even though the URL in the frontend is correct.

---

## Local development (no deployment)

```bash
# Database
mysql -u root -p < database/init.sql

# Backend
cd backend
mvn spring-boot:run        # http://localhost:8080/api

# Frontend
cd frontend
npm install && npm run dev # http://localhost:5173
```

Local defaults already match each other (`localhost:8080` ↔ `localhost:5173`),
so no env vars are required for local dev.
