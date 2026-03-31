# Deployment Guide

This project is a monorepo:

- `frontend/` deployed to Vercel
- `backend/` deployed to Render or Railway

## 1) Frontend Deployment (Vercel)

1. Create a new Vercel project and import this repository.
2. Set the **Root Directory** to `frontend`.
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>/api`
5. Deploy and verify the app loads and can call the backend.

## 2) Backend Deployment (Render or Railway)

Deploy from the same repository with `backend` as the service root.

### Required backend environment variables

- `PORT` (provided by platform automatically in many cases)
- `NODE_ENV=production`
- `MONGODB_URI=<mongodb-atlas-connection-string>`
- `JWT_ACCESS_SECRET=<long-random-string>`
- `JWT_REFRESH_SECRET=<long-random-string>`
- `CORS_ORIGIN=https://<your-frontend-domain>`

Optional seed admin variables:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Start/build commands

- Build command: `npm install`
- Start command: `npm run start`

If your platform does not use a root workspace install automatically, use:

- `npm install --workspace backend`
- `npm run start --workspace backend`

## 3) MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Add a database user and password.
3. Add network access IP rule (or temporary `0.0.0.0/0` during setup).
4. Copy connection string into `MONGODB_URI`.

## 4) Recommended First-Run Steps

After backend deploy, seed initial data from your CI/CD console or a one-time local command:

```bash
npm run seed --workspace backend
```

Then validate:

- `GET https://<backend-domain>/health`
- `GET https://<backend-domain>/api/health`
- Open frontend and complete login + exam flow.

## 5) Production Checklist

- Use strong JWT secrets.
- Restrict CORS to frontend domains only.
- Use Atlas credentials with minimum permissions.
- Keep `NODE_ENV=production`.
- Review rate limits and monitoring logs regularly.
