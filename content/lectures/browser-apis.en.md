---
skill: browser-apis
title: "Browser APIs: storage, fetch, workers and observers"
summary: "Where to keep data in the browser, how fetch really reports errors, when to use workers, and the observer APIs that replace scroll and resize hacks."
readingMinutes: 8
---

The browser is a platform with dozens of APIs. Interviews focus on the ones you use daily and on their sharp edges.

## Storing data

| API | Size | Lifetime | Access | Notes |
| --- | --- | --- | --- | --- |
| Cookies | ~4 KB | configurable | sent with every request | use `HttpOnly; Secure; SameSite` for sessions |
| `localStorage` | ~5 MB | until cleared | sync, strings only, same origin | blocks the main thread |
| `sessionStorage` | ~5 MB | per tab | sync, strings only | survives reloads, not new tabs |
| IndexedDB | large | until cleared | async, structured data | offline apps, big caches |
| Cache API | large | until cleared | async, Request/Response pairs | service workers |

`localStorage` stores **strings**. Serialise with `JSON.stringify` and wrap `JSON.parse` in `try/catch`. Writes can throw (`QuotaExceededError`, or private mode in some browsers). Never store auth tokens where XSS can read them; an `HttpOnly` cookie is safer.

## fetch

```js
const res = await fetch("/api/items", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(item),
  signal: AbortSignal.timeout(5000),
});
if (!res.ok) throw new Error(`HTTP ${res.status}`); // fetch does NOT reject on 404/500!
const data = await res.json();
```

`fetch` rejects only on network failures or aborts. HTTP errors resolve normally, so check `res.ok`. Use `AbortController` to cancel stale requests, for example when the user types a new search query.

## Workers

- **Web Workers** run JavaScript on another thread: parsing large files, image processing, ML models. They talk to the page via `postMessage` and have no DOM access.
- **Service Workers** sit between the page and the network: offline caching, background sync, push notifications. They're the backbone of PWAs and require HTTPS.

## Observers

They replace polling and expensive scroll/resize listeners:

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) loadImage(e.target);
}, { rootMargin: "200px" });
document.querySelectorAll("img[data-src]").forEach((img) => io.observe(img));
```

- `IntersectionObserver`: lazy loading, infinite scroll, analytics impressions.
- `ResizeObserver`: react to an element's size (container-aware components).
- `MutationObserver`: react to DOM changes made by third-party code.

## Other everyday APIs

`URL`/`URLSearchParams` for parsing query strings, `structuredClone` for deep copies, `navigator.clipboard`, `history.pushState` for SPA routing, `requestAnimationFrame` for animations, and `BroadcastChannel` to sync tabs.

## Interview checklist

- Pick the right storage and explain its limits and security implications.
- Remember that `fetch` resolves on HTTP errors; check `res.ok`.
- Cancel outdated requests with `AbortController`.
- Use observers instead of scroll/resize polling.
