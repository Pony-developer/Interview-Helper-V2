Middle candidates increasingly get a light system-design question. The URL shortener is the classic: small enough for 30 minutes, rich enough to discuss APIs, storage, caching and scaling.

## 1. Requirements

- Functional: create a short link for a long URL; redirect from the short link; optional custom alias and expiry; basic click statistics.
- Non-functional: redirects must be fast (p99 < 50 ms) and highly available; reads ≫ writes (100:1); links shouldn't be guessable if they're private.
- Scale (assume): 10M new links per month, 1B redirects per month ≈ 400 redirects/s on average, peaks ×10.

## 2. API

```http
POST /api/links        { "url": "https://…", "alias": null, "expiresAt": null }
→ 201 Created          { "code": "q0U", "shortUrl": "https://sho.rt/q0U" }

GET /q0U               → 301 Moved Permanently / 302 Found, Location: https://…
GET /api/links/q0U/stats
```

301 is cached by browsers (fewer hits, but you lose click counting); 302 always comes back to you.

## 3. Generating codes

| Approach | Pros | Cons |
|---|---|---|
| Auto-increment id → **Base62** | short, no collisions, simple | sequential = guessable; one counter to scale (use ranges per instance or a Snowflake-style id) |
| Random 7 characters | not guessable | collision check on insert (unique index + retry) |
| Hash of the URL (first chars of SHA-256) | the same URL → the same code | collisions to handle; custom per-user links differ |

62⁷ ≈ 3.5 trillion codes — 7 characters are plenty.

## 4. Storage and caching

- A key-value access pattern: `code → url`. A relational table with a unique index on `code` (and on `url` if you want idempotency) is fine for this scale; DynamoDB / Cosmos DB / Cassandra for much larger.
- Put a **cache** (Redis, plus an in-process memory cache) in front: most traffic goes to a small set of hot links. Cache-aside: read the cache → on a miss read the DB and populate.
- Click statistics: don't update a counter row on every redirect; publish events to a queue/stream and aggregate asynchronously.

## 5. Scaling and reliability

- Stateless redirect service behind a load balancer, many instances; a CDN/edge can even serve redirects.
- Read replicas for the database; shard by code if needed.
- Rate limit link creation (abuse, spam); validate and scan target URLs (phishing).
- Expired links: a TTL in the store or a background cleanup job.

## 6. What the interviewer listens for

Asking about scale first, a clear API, a justified choice of code generation, the read path being cache-first, and knowing the trade-offs (301 vs 302, guessable vs random, consistency of statistics). The practice implements the core: Base62 encoding and an idempotent `Shorten`.
