# Deployment Guide

This project is a monorepo:

- `frontend/` — static SPA (Vite + React), typically deployed to **Vercel**
- `backend/` — Express API, typically deployed to **Render** or **Railway**
- **MongoDB Atlas** (or compatible) for production data

---

## 1) Frontend (Vercel)

### One-time project setup

1. In [Vercel](https://vercel.com), create a project and import this Git repository.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite** (auto-detected when `vite.config` is present).
4. Build settings (defaults are usually correct):
   - **Install Command:** `npm install` (run from repo root if Vercel detects the monorepo; if install fails, use `cd ../.. && npm install` from `frontend` only when the UI offers a monorepo install — prefer installing from the repository root so workspaces resolve).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Environment variables (Production)

| Name | Example | Purpose |
|------|---------|---------|
| `VITE_API_BASE_URL` | `https://your-api.onrender.com/api` | Base URL for all API calls from the browser |

The value **must** include the `/api` suffix because the backend mounts routes under `/api`.

### Client-side routing

`frontend/vercel.json` adds a SPA fallback so deep links (for example `/student`, `/admin/questions`) load `index.html` and React Router can handle the path.

### Verify

- Open the deployed URL and confirm network requests go to `VITE_API_BASE_URL`.
- Complete login and a short student or admin flow.

---

## 2) Backend (Render)

### Option A — Blueprint (`render.yaml`)

This repository includes an optional `render.yaml` at the repo root. In Render: **New → Blueprint**, connect the repo, and deploy. Then add **secret** environment variables in the service **Environment** tab (see below). Do not commit real secrets.

### Option B — Manual Web Service

1. **New → Web Service**, connect the repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Health check path:** `/api/health` (or `/health` — both exist; `/api/health` returns JSON under the API prefix)

### Required environment variables

| Name | Notes |
|------|--------|
| `NODE_ENV` | `production` |
| `PORT` | Usually injected by Render; the app reads `process.env.PORT` |
| `MONGODB_URI` | Atlas connection string (SRV recommended) |
| `JWT_ACCESS_SECRET` | Long random string |
| `JWT_REFRESH_SECRET` | Long random string, different from access |
| `CORS_ORIGIN` | Your Vercel origin only, e.g. `https://your-app.vercel.app` (no trailing slash) |

Optional (seed / admin bootstrap):

| Name | Notes |
|------|--------|
| `ADMIN_NAME` | Display name for seeded admin |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin password (set a strong value in production) |

### After deploy

1. Confirm `GET https://<backend-host>/api/health` returns JSON with `status: "ok"`.
2. Run seeds from your laptop against production **only** if you understand the risk, or run one-off admin seed via Render shell:

   ```bash
   npm run seed --workspace backend
   ```

   (Requires local `.env` pointing at production `MONGODB_URI` — use with care.)

---

## 3) Backend (Railway)

1. **New Project → Deploy from GitHub**, select this repo.
2. Set **Root Directory** to `backend` (or add a service and set the directory in **Settings**).
3. **Start command:** `npm start` (Nixpacks/Node usually runs `npm install` automatically).
4. **Public networking:** generate a public URL for the service.
5. Add the same env vars as in the Render table (`MONGODB_URI`, JWT secrets, `CORS_ORIGIN`, `NODE_ENV=production`).
6. Optional: set a **health check** path to `/api/health` if the platform supports it.

Railway does not require a `render.yaml`; configuration is mostly in the dashboard.

---

## 4) MongoDB Atlas

1. Create a cluster (free tier is fine for demos).
2. Create a database user with a strong password.
3. **Network Access:** allow your hosting provider’s egress IPs, or temporarily `0.0.0.0/0` for testing (tighten for production).
4. Copy the connection string into `MONGODB_URI` (replace `<password>` and default DB name if needed).

---

## 5) CORS and security checklist

- Set `CORS_ORIGIN` to the **exact** frontend origin (scheme + host, no path). Multiple origins are not supported by the current app config; use one production frontend URL.
- Use long, unique values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- Never commit `.env` files or paste secrets into `render.yaml` / GitHub.

---

## 6) CI (GitHub Actions)

The workflow `.github/workflows/ci.yml` runs on pushes and pull requests to `main`:

- `npm ci`
- `npm run lint`
- `npm run test`
- `npm run build`

Keep production deploys aligned with a green `main` branch.

---

## 7) Troubleshooting

| Symptom | What to check |
|--------|----------------|
| Frontend loads but API calls fail | `VITE_API_BASE_URL` must match backend URL including `/api`; backend must be publicly reachable. |
| CORS errors in browser | `CORS_ORIGIN` must match the page origin exactly (Vercel preview URLs change per deployment unless you use a stable domain). |
| 401 on all API routes | JWT secrets differ between environments or token expired; re-login. |
| Mongo connection errors | Atlas network allowlist, correct URI, database user password. |
| Deep links 404 on Vercel | Ensure `frontend/vercel.json` is deployed and `outputDirectory` is `dist`. |

---

## 8) Quick validation URLs

- `GET /health` — minimal liveness (root)
- `GET /api/health` — API health JSON (includes `service` and `timestamp`)

See also `docs/api.md` and `docs/architecture.md`.
