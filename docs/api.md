# API Reference

Base URL (local): `http://localhost:5000/api`

Authentication for protected routes uses:

`Authorization: Bearer <access_token>`

## Health

- `GET /health` (server root health)
- `GET /api/health` (API health payload)

## Auth

- `POST /auth/register`
  - Body: `{ "name": "User", "email": "user@example.com", "password": "secret123" }`
- `POST /auth/login`
  - Body: `{ "email": "user@example.com", "password": "secret123" }`
- `GET /auth/me` (protected)
- `GET /auth/admin-check` (protected, admin only)

## Questions (Admin)

All routes below require admin token.

- `GET /questions`
- `GET /questions/:id`
- `POST /questions`
- `PUT /questions/:id`
- `DELETE /questions/:id`

Question shape example:

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
  "explanation": "2 + 2 = 4"
}
```

## Exams (Admin)

All routes below require admin token.

- `GET /admin/exams`
- `GET /admin/exams/:id`
- `POST /admin/exams`
- `PUT /admin/exams/:id`
- `DELETE /admin/exams/:id`

## Users (Admin)

All routes below require admin token.

- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `PATCH /users/:id/block`
- `PATCH /users/:id/unblock`

## Attempt and Student Runtime (Protected)

All routes below require authenticated user token.

- `GET /exams` (list exams available to candidate)
- `GET /exam/:id/start` (fetch exam start view)
- `POST /attempt/start`
- `POST /attempt/save`
- `POST /attempt/submit`
- `GET /attempt/history`
- `GET /attempt/analytics`

## Error Response Pattern

Errors return JSON with a message, for example:

```json
{
  "message": "Validation failed"
}
```

HTTP status codes vary by operation (`400`, `401`, `403`, `404`, `409`, `500`).
