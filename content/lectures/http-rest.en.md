---
skill: http-rest
title: "HTTP and REST: methods, status codes, caching and CORS"
summary: "The HTTP knowledge every web developer needs: idempotency, status codes, caching headers, CORS preflights and RESTful API design."
readingMinutes: 8
---

Every frontend talks to a backend over HTTP, and every backend interview touches REST. The questions are mostly about semantics: what each piece of the protocol promises.

## Methods

| Method | Use | Safe | Idempotent |
| --- | --- | --- | --- |
| GET | read a resource | ✓ | ✓ |
| HEAD | headers only | ✓ | ✓ |
| POST | create / run an action | ✗ | ✗ |
| PUT | replace a resource completely | ✗ | ✓ |
| PATCH | partial update | ✗ | ✗ (usually) |
| DELETE | remove | ✗ | ✓ |

**Safe** means "doesn't change state". **Idempotent** means "doing it twice has the same effect as once", which is what makes retries safe. For retried POSTs (payments), use an **idempotency key** header.

## Status codes

- **2xx success**: `200 OK`, `201 Created` (with `Location`), `204 No Content`.
- **3xx redirects**: `301`/`308` permanent, `302`/`307` temporary (307/308 keep the method), `304 Not Modified` (cache revalidation).
- **4xx client errors**: `400` malformed, `401` not authenticated, `403` authenticated but not allowed, `404` not found, `409` conflict, `422` validation failed, `429` too many requests.
- **5xx server errors**: `500`, `502` bad gateway, `503` unavailable (with `Retry-After`), `504` gateway timeout.

## REST design

Resources are nouns, and methods are the verbs:

```
GET    /users?role=admin&page=2     list (filter, paginate)
POST   /users                       create → 201 + Location: /users/42
GET    /users/42                    read
PATCH  /users/42                    update fields
DELETE /users/42                    delete → 204
GET    /users/42/orders             sub-resource
```

Keep it stateless (each request carries its own auth), version the API (`/v1` or a header), and return consistent error bodies, for example RFC 9457 problem details.

## Caching

- `Cache-Control: max-age=3600` lets clients reuse a response for an hour. `no-cache` means revalidate before every use; `no-store` means never store it. Use `private` for user-specific data and `public, immutable` for fingerprinted assets.
- Validators: `ETag` + `If-None-Match`, or `Last-Modified` + `If-Modified-Since`, let the server answer `304 Not Modified` without a body.

## CORS

Browsers block JavaScript from reading responses from **another origin** (scheme + host + port) unless the server opts in with `Access-Control-Allow-Origin`.

- **Simple requests** (GET/POST with simple headers) are sent directly, and the browser checks the response headers.
- Others (PUT, JSON `Content-Type`, `Authorization`) trigger a **preflight** `OPTIONS` request first. The server must answer with the allowed methods and headers.
- Credentials (cookies) require `Access-Control-Allow-Credentials: true` and an explicit origin, not `*`.

CORS protects users' data in their browser. It is not a server-side security boundary: curl ignores it.

## HTTP/2 and HTTP/3

They multiplex many requests over one connection and compress headers. HTTP/3 runs on QUIC (UDP). Domain sharding and sprite sheets are no longer needed.

## Interview checklist

- Explain safe vs idempotent, and why PUT is idempotent but POST isn't.
- Pick the right status code (401 vs 403, 400 vs 422).
- Design a REST endpoint with pagination and errors.
- Explain a CORS preflight and how to fix a CORS error properly (on the server).
