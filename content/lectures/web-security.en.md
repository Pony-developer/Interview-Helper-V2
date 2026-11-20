---
skill: web-security
title: "Web security for frontend developers"
summary: "XSS and its sinks, escaping vs sanitising, dangerous URLs, Content Security Policy, CSRF and SameSite cookies, what CORS does (and doesn't), token storage, clickjacking, open redirects and supply-chain risks."
readingMinutes: 9
---

Most web attacks exploit one of two things: the browser running code the attacker controls (**XSS**), or the browser sending the user's credentials on a request the attacker triggered (**CSRF**). The same-origin policy is the baseline defence; everything else is about not undermining it.

## Cross-site scripting (XSS)

XSS means attacker-controlled script runs **in your origin**, with access to your DOM, `localStorage`, and the user's session. It comes in three forms: *stored* (a malicious comment saved in the database), *reflected* (echoed from the URL by the server), and *DOM-based* (your own JavaScript writes untrusted input into a dangerous place).

Dangerous places are called **sinks**:

| Sink | Safe alternative |
| --- | --- |
| `el.innerHTML = input`, `insertAdjacentHTML`, `document.write` | `textContent`, `createElement` |
| `location.href = input`, `<a href={input}>` | validate the protocol (`https:`, `http:`, `mailto:`) |
| `eval`, `new Function`, `setTimeout("string")` | pass functions, never strings |
| React `dangerouslySetInnerHTML`, Angular `bypassSecurityTrust*` | sanitise first (DOMPurify) or avoid |

**Escape on output, for the context.** Text inside HTML needs `& < > " '` encoded; a value in a URL needs a protocol check and `encodeURIComponent`; inside a `<script>` block, avoid interpolation entirely. React, Angular and Vue escape text by default, which is why the remaining holes are `href` values and the explicit "bypass" APIs.

```tsx
// React escapes the text, but not this:
<a href={user.website}>{user.name}</a> // "javascript:alert(1)" runs on click
```

**Escaping vs sanitising.** Escaping turns markup into harmless text. Sanitising keeps *some* markup (bold, links) and strips the rest; use a maintained library such as DOMPurify, never a hand-written regex.

## Content Security Policy

CSP is an HTTP header that tells the browser which sources may run. `script-src 'self'` blocks inline scripts and `on*` attributes injected by XSS, as long as you don't add `'unsafe-inline'`. Use nonces or hashes for necessary inline scripts, `object-src 'none'`, `base-uri 'none'`, and `frame-ancestors 'none'` to stop clickjacking (the modern replacement for `X-Frame-Options`). CSP is defence in depth, not a substitute for escaping.

## CSRF and cookies

If authentication rides on cookies, a malicious page can make the browser send them: `<form action="https://bank.example/transfer" method="POST">` auto-submitted from another site.

- `SameSite=Lax` (the default in modern browsers) withholds cookies on cross-site subrequests and POSTs; `Strict` also on top-level navigation.
- CSRF tokens or requiring a custom header (which forces a CORS preflight) protect state-changing endpoints.
- Never change state on `GET`.

Cookie flags: `HttpOnly` hides the cookie from JavaScript (XSS can't **read** it, but can still make authenticated requests from the page), `Secure` sends it only over HTTPS, and `SameSite` limits cross-site sending.

## What CORS is (and isn't)

The same-origin policy stops a page from **reading** responses from other origins. CORS headers (`Access-Control-Allow-Origin`) let a server **relax** that for chosen origins. CORS isn't a server-side protection: simple requests (form-style POSTs) are still sent, and the server still executes them. Never reflect any `Origin` back together with `Access-Control-Allow-Credentials: true`.

## Tokens and storage

Anything in `localStorage` is readable by any script on the page, so one XSS bug leaks long-lived tokens. Prefer short-lived access tokens kept in memory, plus a refresh token in an `HttpOnly; Secure; SameSite` cookie. Either way, XSS is game over for the session while the attacker's code runs; storage only decides whether the attacker can take the token with them.

## Other frontend risks

- **Open redirects.** `/login?next=https://evil.example` used for phishing. Only allow same-origin relative paths: parse with `new URL(next, location.origin)` and compare the origin (`//evil.example` starts with `/`, too).
- **Reverse tabnabbing.** `target="_blank"` links get `rel="noopener noreferrer"` (modern browsers imply `noopener`).
- **Supply chain.** Lockfiles, `npm audit`, minimal dependencies, and Subresource Integrity (`integrity="sha384-…"`) for third-party scripts.
- **Secrets in the bundle.** Anything shipped to the browser is public, including "hidden" API keys.

## Interview checklist

- Define XSS, name three sinks and how frameworks protect you.
- Explain why `HttpOnly` doesn't stop XSS from acting as the user.
- Explain CSRF and how `SameSite` and tokens stop it.
- Say what CORS controls and why it isn't an access-control mechanism.
- Validate a redirect target and a user-supplied link URL correctly.
