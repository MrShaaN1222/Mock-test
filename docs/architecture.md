# Architecture Overview

## Monorepo layout

- `backend/` — Express API, JWT authentication, RBAC, exam engine, MongoDB persistence.
- `frontend/` — React + Vite SPA for student and admin workflows.
- `docs/` — operational and technical documentation (this file, API reference, deployment guide).
- `render.yaml` — optional Render Blueprint for the API service (no secrets committed).
- `frontend/vercel.json` — SPA rewrite rules for client-side routing on Vercel.

## Runtime flow

1. The user opens the frontend (static hosting or local dev server).
2. The SPA calls the backend REST API using `VITE_API_BASE_URL` (must end with `/api`).
3. The backend validates JWTs and enforces role-based access on protected routes.
4. Domain data is stored in MongoDB via Mongoose models.
5. Exam attempts are persisted server-side: randomized questions, option shuffle, snapshot per attempt, deterministic scoring on submit.

## Backend layers

- **Config**
  - `src/config/env.js` — loads `backend/.env`, validates required variables.
  - `src/config/db.js` — MongoDB connection lifecycle.
- **HTTP app**
  - `src/app.js` — security middleware (`helmet`, `cors`, rate limiting), JSON body limits, request logging, mounted routes under `/api`.
  - `src/server.js` — connects to MongoDB and listens on `PORT`.
- **Routing**
  - `src/routes/*` — maps endpoints to controllers; auth and role middleware where needed.
- **Controllers**
  - Parse requests, validate inputs, return HTTP responses.
- **Services**
  - Auth, attempt lifecycle, scoring, analytics aggregation.
- **Models**
  - `User`, `Question`, `Exam`, `Attempt` with indexes and schema validation.

## Security and integrity

- Stateless JWT access tokens; refresh tokens issued at login/register (client storage as implemented in the frontend).
- Admin-only routes guarded by role middleware.
- Server-side scoring from attempt snapshot (not client-provided scores).
- Rate limiting and security headers on the HTTP layer.
- Centralized error handling for consistent JSON error bodies.
- Structured logging for requests and handled errors (see `src/middlewares`).

## Frontend structure

- Redux Toolkit for authentication state and exam runtime state.
- React Router with protected routes by role.
- Student flow: exam list, instructions, timed exam UI, result view, analytics page.
- Admin flow: CRUD-style management for questions, exams, and users.

## Deployment topology

- **Frontend:** Vercel (or any static host with SPA fallback for `index.html`).
- **Backend:** Render, Railway, or any Node host with a public URL and health checks.
- **Database:** MongoDB Atlas (recommended for production).

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs on `main` for pushes and pull requests: install, lint, test, and build all workspaces. Use a green CI result before merging or tagging production releases.

## Related documentation

- `docs/deployment.md` — Vercel, Render/Railway, Atlas, env vars, troubleshooting.
- `docs/api.md` — endpoint reference and pagination shapes.
