---
skill: auth
title: "Authentication and authorisation for web apps"
summary: "Authentication vs authorisation, session cookies vs JWTs, where to store tokens, access and refresh tokens, OAuth 2.0 and OpenID Connect with the authorisation-code flow and PKCE, role- and attribute-based access control, password and MFA basics, and frontend pitfalls."
readingMinutes: 9
---

**Authentication (authn)** answers "who are you?"; **authorisation (authz)** answers "what are you allowed to do?". A login form is authentication; hiding the "Delete" button from non-admins is UI, while the server refusing the delete request is authorisation. The golden rule: **the frontend can hide things, only the server can protect them.**

## Sessions vs tokens

**Server sessions.** After login the server stores a session record and sends a random session ID in a cookie:

```
Set-Cookie: sid=8f2…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600
```

The browser sends it automatically; logging out or revoking access just deletes the record. Simple and secure for apps where the frontend and API share a site.

**JWTs (JSON Web Tokens).** A signed token containing claims (`sub`, `exp`, roles) that any service with the key can verify **without a database lookup**. Good for distributed APIs and third-party clients. Downsides: they can't be revoked before they expire (unless you keep a denylist), they grow with claims, and the payload is only base64-encoded, so **anyone can read it**: never put secrets in a JWT. Always validate the signature, algorithm, `exp`, issuer and audience on the server.

## Where to keep tokens in the browser

| Storage | XSS can read it? | Sent automatically? | Notes |
| --- | --- | --- | --- |
| `HttpOnly` cookie | no | yes | needs CSRF protection (`SameSite`, tokens) |
| Memory (JS variable) | only while the attacker's script runs | no | lost on reload; pair with a refresh cookie |
| `localStorage` | yes | no | one XSS bug leaks long-lived tokens |

A common pattern: a **short-lived access token** (5–15 min) kept in memory, plus a **refresh token** in an `HttpOnly; Secure; SameSite` cookie used only by `/auth/refresh`. Rotate refresh tokens on every use and detect reuse (a reused old token means theft: revoke the whole session).

## OAuth 2.0 and OpenID Connect

**OAuth 2.0** lets an app get limited access to a user's resources at another service (scopes like `calendar.read`) without seeing their password. **OpenID Connect (OIDC)** adds identity on top: an **ID token** saying who the user is ("Sign in with Google").

For browser apps, use the **authorisation-code flow with PKCE**:

1. The app creates a random `code_verifier` and sends its hash (`code_challenge`) plus a random `state` when redirecting to the identity provider.
2. The user signs in there and is redirected back with a one-time `code`.
3. The app checks `state` (CSRF protection) and exchanges the `code` together with the `code_verifier` for tokens.

PKCE stops an intercepted code from being usable by anyone else. The old **implicit flow** (tokens in the URL fragment) is deprecated. Many teams add a **backend-for-frontend (BFF)** so tokens never reach JavaScript at all and the browser only holds a session cookie.

## Authorisation models

- **RBAC** (role-based): users get roles (`admin`, `editor`), roles grant permissions. Simple and common.
- **ABAC / policy-based**: rules over attributes (`user.orgId === doc.orgId && doc.status !== "locked"`). Needed for ownership and multi-tenant apps.
- Check on **every request** at the server or database (for example Postgres row-level security), including IDs in URLs: changing `/orders/41` to `/orders/42` must not show someone else's order (IDOR).
- The frontend uses the same information only to adapt the UI (hide buttons, guard routes).

## Passwords and MFA (what a frontend developer should know)

- Store passwords only as slow, salted hashes (Argon2id, bcrypt, scrypt) on the server.
- Rate-limit and lock out brute force; don't reveal whether an email exists ("If an account exists, we've sent a link").
- Support password managers (`autocomplete="username"`, `"current-password"`, `"new-password"`) and allow paste.
- Offer **MFA**: TOTP apps or, better, **passkeys / WebAuthn**, which are phishing-resistant because the credential is bound to the site's origin.

## Frontend pitfalls

- Route guards and hidden buttons are UX, not security.
- Don't log tokens or put them in URLs (they leak through history, logs and `Referer`).
- Handle expiry gracefully: refresh once, queue concurrent requests during refresh, and redirect to login on failure.
- Log out properly: clear the server session or refresh token, in-memory state and caches.

## Interview checklist

- Distinguish authentication and authorisation, and explain why authorisation must be server-side.
- Compare session cookies and JWTs, including revocation.
- Compare token storage options and their XSS/CSRF trade-offs.
- Walk through the authorisation-code flow with PKCE and the role of `state`.
- Explain RBAC vs ABAC and how to prevent IDOR.
