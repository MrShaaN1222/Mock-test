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

## Baseline Endpoints

- Backend health check: `GET http://localhost:5000/health`
- Frontend dev app: `http://localhost:5173`
