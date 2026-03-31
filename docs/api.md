# API Reference

Base URL (local): `http://localhost:5000/api`  
Production: `https://<your-backend-host>/api`

Authentication for protected routes:

```http
Authorization: Bearer <access_token>
```

## Health

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/health` | Root liveness (outside `/api` prefix in `app.js`) |
| `GET` | `/api/health` | JSON: `status`, `service`, `timestamp` |

## Auth

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/auth/register` | No | `{ "name", "email", "password" }` — creates **student** |
| `POST` | `/auth/login` | No | `{ "email", "password" }` |
| `GET` | `/auth/me` | Yes | — returns current user from JWT |
| `GET` | `/auth/admin-check` | Admin | — sanity check for admin role |

Successful login/register returns `{ user, tokens: { accessToken, refreshToken } }`.

## Questions (Admin)

Requires **admin** JWT.

| Method | Path |
|--------|------|
| `GET` | `/questions` |
| `GET` | `/questions/:id` |
| `POST` | `/questions` |
| `PUT` | `/questions/:id` |
| `DELETE` | `/questions/:id` |

**List query params:** `page`, `limit` (default page `1`, limit `20`, max `100`), `category`, `difficulty`, `isActive` (`true` / `false`).

**List response shape:**

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 1
  }
}
```

Question body example:

```json
{
  "questionText": "What is 2 + 2?",
  "category": "quantitative",
  "difficulty": "easy",
  "options": [
    { "text": "3", "isCorrect": false },
    { "text": "4", "isCorrect": true },
    { "text": "5", "isCorrect": false },
    { "text": "6", "isCorrect": false }
  ],
  "explanation": "2 + 2 = 4",
  "isActive": true
}
```

## Exams (Admin)

Requires **admin** JWT.

| Method | Path |
|--------|------|
| `GET` | `/admin/exams` |
| `GET` | `/admin/exams/:id` |
| `POST` | `/admin/exams` |
| `PUT` | `/admin/exams/:id` |
| `DELETE` | `/admin/exams/:id` |

**List query params:** `page`, `limit`, `isPublished` (`true` / `false`).

**List response:** `{ "items": [], "pagination": { ... } }` (same pagination fields as questions).

## Users (Admin)

Requires **admin** JWT.

| Method | Path |
|--------|------|
| `GET` | `/users` |
| `GET` | `/users/:id` |
| `PATCH` | `/users/:id` |
| `PATCH` | `/users/:id/block` |
| `PATCH` | `/users/:id/unblock` |

**List query params:** `page`, `limit`, `role` (`student` / `admin`), `isBlocked` (`true` / `false`).

**List response:** `{ "items": [], "pagination": { ... } }`.

**PATCH `/users/:id` body:** `{ "name"?, "role"? }` (partial fields only).

## Student runtime (authenticated user)

Requires **student** or **admin** JWT (admin can take the exam flow for testing).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/exams` | Published exams only |
| `GET` | `/exam/:id/start` | Exam metadata + in-progress attempt summary if any |
| `POST` | `/attempt/start` | Body: `{ "examId" }` — starts or resumes attempt |
| `POST` | `/attempt/save` | Autosave progress (answers, flags, timer deltas) |
| `POST` | `/attempt/submit` | Body: `{ "attemptId" }` |
| `GET` | `/attempt/history` | Paginated finished attempts — query: `page`, `limit` (defaults `page=1`, `limit=10`, max `limit=50`) |
| `GET` | `/attempt/analytics` | Aggregated stats (scores, sections, time) |

## Error response pattern

```json
{
  "message": "Validation failed",
  "details": {}
}
```

`details` may be present for validation errors. HTTP status codes: `400`, `401`, `403`, `404`, `409`, `500`.
