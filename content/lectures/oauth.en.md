---
skill: oauth
title: "OAuth 2.0 and OpenID Connect: delegated access done right"
summary: "The roles in OAuth, the authorization code flow with PKCE, scopes and tokens, how OpenID Connect adds identity on top, state and redirect URI checks, refresh tokens, and the mistakes that lead to account takeovers."
readingMinutes: 10
---

OAuth 2.0 answers one question: **may this application act on the user's behalf, and only for what?** It does not say who the user is. That is the job of OpenID Connect (OIDC), a thin identity layer built on OAuth. Confusing the two is one of the most common security mistakes in web apps.

## The roles

- **Resource owner**: the user who owns the data.
- **Client**: the application asking for access (your web app or mobile app).
- **Authorization server**: the service that authenticates the user and issues tokens (Google, Auth0, Keycloak).
- **Resource server**: the API that accepts access tokens and returns data.

## The authorization code flow with PKCE

This is the flow to use for web and mobile apps. The browser never sees the access token:

1. The client creates a random `code_verifier`, derives a `code_challenge` from it (SHA-256), and redirects the user to the authorization server with the challenge, a `state` value, the requested `scope` and a `redirect_uri`.
2. The user logs in and consents. The server redirects back with a short-lived **authorization code**.
3. The client checks that the returned `state` matches the one it sent, then exchanges the code plus the original `code_verifier` for tokens, server to server.

**PKCE** (Proof Key for Code Exchange) makes the code useless to anyone who intercepts it, since they don't have the verifier. It's required for public clients (SPAs, mobile apps) and recommended everywhere. The **implicit flow**, which returned tokens in the URL, is deprecated: OAuth 2.1 removes it.

## Scopes and tokens

- **Scopes** describe what access is requested (`read:orders`, `openid profile email`). Ask for the least you need, and check scopes on the server, not only in the UI.
- An **access token** is a credential for the resource server. Keep it short-lived (minutes), and send it in the `Authorization: Bearer` header.
- A **refresh token** gets new access tokens without asking the user again. Store it only on a server, or in a rotated, sender-constrained form on a device. Rotate it on each use and revoke the whole family if a reused token appears.

## OpenID Connect adds identity

Requesting the `openid` scope makes the authorization server also return an **ID token**: a signed JWT that says who logged in (`sub`, `email`, `name`). Verify its signature and check `iss`, `aud`, `exp` and `nonce`. Use the ID token to log the user in, and the access token only to call APIs. Don't send ID tokens to resource servers as credentials.

## The mistakes that cause account takeovers

- **Missing or unchecked `state`**: an attacker can trick a victim's browser into completing the attacker's login (login CSRF).
- **Loose redirect URI matching**: if the server accepts any path or subdomain, an attacker can receive the code. Redirect URIs must match exactly, registered in advance.
- **Trusting the client's word for scopes or identity**: check tokens on every request at the resource server.
- **Tokens in URLs or logs**: they leak through history, referrers and proxies.
- **Using OAuth as authentication without OIDC**: an access token says what the bearer may do, not who they are.

## Interview checklist

- Name the four roles and what each one does.
- Walk through the authorization code flow with PKCE, step by step.
- Explain why PKCE and the `state` check exist, and what attack each prevents.
- Explain the difference between an access token, a refresh token and an ID token.
- Explain why OAuth alone is not authentication, and what OIDC adds.
