# Access API

A simple, secure API to decide whether a user has access to a resource.

Built for SaaS products that want to manage feature access, content gating or permissions without building a custom authorization system.

---

## ✨ Features

- API key–based authentication
- Project-scoped access control
- Grant, revoke and check access
- Secure API key hashing (no plaintext keys)
- Idempotent access grants
- Simple JSON API
- PostgreSQL backed

---

## 🔐 Authentication

All requests must include an API key in the `Authorization` header:

```http
Authorization: Bearer sk_live_...
```

API keys are created in the dashboard and are always scoped to a single project.

---

## 📦 Endpoints

### Check access

Checks whether a user has access to a specific resource.

```http
POST /access/check
```

**Request body**
```json
{
  "user_id": "user_123",
  "resource": "premium"
}
```

**Response**
```json
{
  "access": true
}
```

---

### Grant access

Grants a user access to a resource.  
Idempotent – calling it multiple times will not create duplicates.

```http
POST /access/grant
```

**Request body**
```json
{
  "user_id": "user_123",
  "resource": "premium"
}
```

**Optional expiration**
```json
{
  "user_id": "user_123",
  "resource": "premium",
  "expires_at": "2026-01-01T00:00:00Z"
}
```

**Response**
```json
{
  "granted": true
}
```

---

### Revoke access

Revokes a previously granted access.

```http
POST /access/revoke
```

**Request body**
```json
{
  "user_id": "user_123",
  "resource": "premium"
}
```

**Response**
```json
{
  "revoked": true
}
```

---

## 🧠 How it works

- Each request is authenticated via API key
- The API key determines the project context
- Access grants are always scoped to:
    - project
    - user
    - resource
- Clients never pass a `project_id` manually
- Access decisions are made server-side

---

## ⚠️ Error responses

| Status | Meaning |
|------|--------|
| `400` | Missing required fields |
| `401` | Missing or invalid API key |
| `500` | Internal server error |

---

## 🗄 Database

Core tables:
- `projects`
- `api_keys`
- `access_grants`

`access_grants` enforces uniqueness on:

```
(project_id, user_id, resource)
```

to guarantee consistent access decisions.

---

## 🚀 Running locally

```bash
npm install
npm run dev
```

The API will be available at:

```
http://localhost:3001
```

---

## 🔒 Security notes

- API keys are never stored in plaintext
- Only hashed keys are used for validation
- All access checks are project-scoped
- Treat API keys as secrets — rotate immediately if compromised

---

## 🧩 Intended use cases

- Feature gating in SaaS apps
- Content access control
- Course / membership systems
- Internal permission systems
- Indie SaaS authorization layer

---

## 🛣 Roadmap (optional)

- API key rotation
- Multiple keys per project
- Usage metrics
- Rate limiting
- SDKs (JS)

---

## 📄 License

MIT

---

### ✅ Status

This API is production-ready for v1.