---
skill: pwa
title: "Progressive Web Apps: offline, installable and fast"
summary: "What makes a web app a PWA, the web app manifest, the service worker lifecycle (install, activate, waiting, updates), caching strategies for pages, assets and API data, offline fallbacks, background sync and push, and common pitfalls."
readingMinutes: 8
---

A Progressive Web App is a website that behaves like an installed app: it loads instantly on repeat visits, works offline or on bad networks, can be installed to the home screen or desktop, and can receive push notifications. It's built from three ingredients: **HTTPS**, a **web app manifest**, and a **service worker**.

## The manifest

```json
{
  "name": "Assay Interview Prep",
  "short_name": "Assay",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0b5a43",
  "background_color": "#f7f5ef",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

Linked with `<link rel="manifest" href="/manifest.webmanifest">`, it tells the browser how the installed app looks and opens: name, icons (including a maskable one for Android), start URL, and `display: standalone` (no browser UI).

## Service workers

A service worker is a script that runs **separately from the page**, in the background, and sits between the page and the network as a programmable proxy:

```js
// page
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");

// sw.js
self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((hit) => hit ?? fetch(event.request)));
});
```

It has no DOM access, is event-driven (the browser stops it when idle, so don't keep state in variables), only works on HTTPS (or localhost), and controls pages within its **scope** (the folder it's served from).

## The lifecycle (and the update trap)

1. **install**: precache the app shell (HTML, JS, CSS, icons).
2. **waiting**: a new version installs but **waits** while any tab still uses the old one, so two versions never control the app at once.
3. **activate**: the new worker takes over; delete old caches here.

That waiting step is why users often keep seeing the old version until all tabs close. Common approaches: show an "Update available, reload" prompt and call `skipWaiting()` when the user agrees, or call `skipWaiting()` + `clients.claim()` immediately if mixing versions is safe. Never cache `sw.js` itself for long (serve it with `Cache-Control: no-cache`).

## Caching strategies

| Strategy | How it works | Use for |
| --- | --- | --- |
| Cache first | cache, else network | hashed static assets, fonts, icons |
| Network first | network, else cache | HTML pages, frequently changing API data |
| Stale-while-revalidate | serve cache immediately, update it in the background | avatars, non-critical API responses |
| Network only | never cache | POSTs, payments, authenticated private data |
| Cache only | precached files | the offline fallback page |

Version your caches (`static-v3`) and clean up old ones on activate. Limit runtime caches by number of entries or age so storage doesn't grow forever. Libraries like **Workbox** (or the Vite/Next.js PWA plugins built on it) generate precache manifests and implement these strategies.

## Offline experience

- Precache an **offline page** and return it when a navigation request fails.
- Store user data with **IndexedDB** (not `localStorage`, which is synchronous and unavailable in workers).
- **Background Sync** retries queued requests (a sent message, a form) when connectivity returns, where supported.
- Show connection status (`navigator.onLine` plus `online`/`offline` events), but remember it only knows about the local network, not whether your server is reachable.

## Install and push

Browsers offer installation when the criteria are met (manifest with icons and a start URL, HTTPS, and a service worker on some browsers). You can capture `beforeinstallprompt` (Chromium) to show your own install button; iOS installs via Share → Add to Home Screen. **Web Push** (Push API + Notifications) works on Android, desktop, and on iOS 16.4+ for installed apps. Ask for permission only after a user action that explains the value.

## Pitfalls

- Caching HTML cache-first can trap users on an old version pointing to deleted JS files: prefer network first for navigations.
- Cached authenticated responses can leak between users on shared devices; clear caches on logout.
- Opaque cross-origin responses (`no-cors`) still take up storage quota and can't be inspected.
- Test the lifecycle with DevTools → Application (update on reload, offline mode, storage).

## Interview checklist

- Name the three requirements of a PWA and what the manifest contains.
- Walk through install → waiting → activate and how to roll out updates.
- Pick a caching strategy for HTML, hashed assets and API data, and justify it.
- Explain how to build an offline fallback and where to store offline data.
- Describe install prompts and push permissions.
