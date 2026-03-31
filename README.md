# SSC CBT App

Phase 1 foundation for an SSC-style CBT platform using a monorepo with:

- `backend/` - Express API entrypoint and environment template.
- `frontend/` - React + Vite app entrypoint and environment template.
- Shared lint/format config in the repository root.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
```

## Environment

Copy templates and set values:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`
- Optional seed admin overrides:
  - `ADMIN_NAME`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

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

Backend seeding scripts:

- `npm run seed --workspace backend` - Creates/updates admin and seeds sample questions.
- `npm run seed:admin --workspace backend` - Creates/updates only the admin user.
- `npm run seed:questions --workspace backend` - Replaces current questions with sample questions.
- `npm run seed:reset --workspace backend` - Clears question bank.

## Local Development Workflow

1. Install dependencies:

```bash
npm install
```

2. Configure environment files:

- `backend/.env` using `backend/.env.example`
- `frontend/.env` using `frontend/.env.example`

3. (Recommended) Seed baseline data:

```bash
npm run seed --workspace backend
```

4. Start both apps:

```bash
npm run dev
```

## Baseline Endpoints

- Backend health check: `GET http://localhost:5000/health`
- Frontend dev app: `http://localhost:5173`

## Documentation

- Deployment guide: `docs/deployment.md`
- API reference: `docs/api.md`
- Architecture notes: `docs/architecture.md`
