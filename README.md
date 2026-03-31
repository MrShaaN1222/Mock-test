# SSC CBT App

Phase 1 foundation for an SSC-style CBT platform using a monorepo with:

- `backend/` - Express API entrypoint and environment template.
- `frontend/` - React + Vite app entrypoint and environment template.
- Shared lint/format config in the repository root.

## Prerequisites

- Node.js 18+
- npm 9+
- **MongoDB** reachable at the URI in `backend/.env` (local `mongod`, Docker, or MongoDB Atlas)

## Setup

```bash
npm install
```

## Environment

Copy templates and set values:

- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env`

`backend/.env` must define `MONGODB_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` (see the example file). Optional seed overrides for the admin user:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Defaults match `backend/.env.example` (e.g. `admin@ssc.local` / `Admin@123`).

## Available Scripts

From repository root:

- `npm run dev` - Runs backend and frontend development servers.
- `npm run dev:backend` - Runs backend dev server only.
- `npm run dev:frontend` - Runs frontend dev server only.
- `npm run build` - Builds all workspaces.
- `npm run start` - Starts backend server.
- `npm run test` - Runs available workspace tests.
- `npm run lint` - Lints all workspaces.
- `npm run format` - Formats files with Prettier.

Backend seeding (same commands work from repo root via shortcuts below):

| Script | Purpose |
|--------|---------|
| `npm run seed` | Creates or updates the admin user, then replaces the question bank with sample questions. |
| `npm run seed:admin` | Creates or updates only the admin user (idempotent). |
| `npm run seed:questions` | Deletes existing questions and inserts the sample question set. |
| `npm run seed:questions:reset` | Deletes all questions only (does not insert). |
| `npm run seed:reset` | Alias for `seed:questions:reset`. |

From repository root, shortcuts:

- `npm run seed` (same as `npm run seed --workspace backend`)
- `npm run seed:admin`
- `npm run seed:questions`
- `npm run seed:questions:reset`
- `npm run seed:reset`

## Local Development Workflow

1. **Start MongoDB** (or point `MONGODB_URI` at Atlas).

2. **Install dependencies**:

```bash
npm install
```

3. **Configure environment files**:

- `backend/.env` using `backend/.env.example`
- `frontend/.env` using `frontend/.env.example`

Set `VITE_API_BASE_URL` in `frontend/.env` to your API base (default `http://localhost:5000/api` if unchanged).

4. **Seed baseline data** (recommended for first run):

```bash
npm run seed
```

This ensures an admin account exists and loads sample questions. You can then create and publish a **mock exam** in the admin UI using categories that exist in the seed (`quantitative`, `english`, `general-awareness`, `reasoning`) so students see exams on the dashboard.

5. **Start both apps**:

```bash
npm run dev
```

6. **Sign in**:

- Register a student account from the app home, or login as the seeded admin using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env`.

## Baseline Endpoints

- Backend health check: `GET http://localhost:5000/health`
- Frontend dev app: `http://localhost:5173`

## Documentation

- Deployment guide: `docs/deployment.md` (Vercel + Render/Railway, Atlas, `frontend/vercel.json`, optional `render.yaml`)
- API reference: `docs/api.md`
- Architecture notes: `docs/architecture.md`
