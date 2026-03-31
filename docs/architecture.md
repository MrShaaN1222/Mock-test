# Architecture Overview

## Monorepo Layout

- `backend/`: Express API, authentication, RBAC, exam engine, persistence.
- `frontend/`: React + Vite app for student and admin workflows.
- `docs/`: operational and technical documentation.

## Runtime Flow

1. User opens frontend app.
2. Frontend calls backend REST API via `VITE_API_BASE_URL`.
3. Backend validates JWT and role permissions.
4. Backend reads/writes MongoDB using Mongoose models.
5. Exam attempt state is persisted server-side for resume and deterministic scoring.

## Backend Layers

- **Config**
  - `src/config/env.js` for environment variable loading and validation.
  - `src/config/db.js` for MongoDB connection lifecycle.
- **HTTP App**
  - `src/app.js` sets security middleware (`helmet`, `cors`, `rate-limit`) and API routes.
  - `src/server.js` bootstraps DB connection and starts listening.
- **Routing**
  - `src/routes/*` maps endpoints to controllers, then applies auth and role guards.
- **Controllers**
  - Handle request parsing and response writing.
- **Services**
  - Implement domain logic such as auth and attempt scoring/state transitions.
- **Models**
  - `User`, `Question`, `Exam`, `Attempt` with indexes and schema validation.

## Security and Integrity

- JWT-based stateless auth.
- Role checks on admin-only routes.
- Server-authoritative scoring and attempt lifecycle.
- Rate limiting and secure HTTP headers.
- Centralized error handling for consistent API failures.

## Frontend Structure

- Redux Toolkit for auth and exam runtime state.
- Route protection for role-based pages.
- Student exam UI includes timer, navigation state, save/submit flow.
- Admin UI includes question/exam/user management.

## Deployment Topology

- Frontend deployed on Vercel.
- Backend deployed on Render or Railway.
- MongoDB Atlas used as the production database.

See `docs/deployment.md` for environment and rollout steps.
