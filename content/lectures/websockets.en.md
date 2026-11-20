---
skill: websockets
title: "Real-time on the web: WebSockets, SSE and polling"
summary: "How the WebSocket handshake and message model work, when to choose WebSockets, Server-Sent Events or polling, reconnection with backoff, heartbeats, message ordering and deduplication, authentication, and scaling real-time servers."
readingMinutes: 8
---

HTTP is request-response: the client asks, the server answers. Chat, live dashboards, collaborative editing, notifications and multiplayer games need the **server to push** data as soon as it changes. There are three main ways to do that.

## Options compared

| Technique | Direction | Transport | Good for |
| --- | --- | --- | --- |
| Short polling (`setInterval` + `fetch`) | client pulls | plain HTTP | rare updates, simplest |
| Long polling | client pulls, server holds the request until data arrives | plain HTTP | fallback when nothing else works |
| **Server-Sent Events** (`EventSource`) | server → client | one long HTTP response (`text/event-stream`) | feeds, notifications, AI token streaming |
| **WebSocket** | both ways | upgraded TCP connection, framed messages | chat, collaboration, games |

SSE is underrated: it's plain HTTP (works with existing auth cookies, proxies and HTTP/2 multiplexing), reconnects automatically and resumes with `Last-Event-ID`. Choose WebSockets when the client also sends frequent messages or you need binary data and low latency in both directions.

## The WebSocket handshake

A WebSocket starts as an HTTP request with `Upgrade: websocket`. The server answers `101 Switching Protocols`, and from then on the TCP connection carries **frames** in both directions: text, binary, ping/pong and close. Use `wss://` (TLS) in production; plain `ws://` is often blocked by proxies and is insecure.

```js
const ws = new WebSocket("wss://chat.example.com/rooms/42");
ws.addEventListener("open", () => ws.send(JSON.stringify({ type: "join" })));
ws.addEventListener("message", (e) => handle(JSON.parse(e.data)));
ws.addEventListener("close", (e) => scheduleReconnect(e.code));
```

WebSockets give you a pipe, not a protocol: you define message types, request IDs for replies, and error handling yourself (or use a library such as Socket.IO, which adds rooms, acknowledgements and fallbacks, but needs its own server).

## Reliability

Connections drop: mobile networks switch, laptops sleep, servers deploy.

- **Reconnect with exponential backoff and jitter** (1 s, 2 s, 4 s … capped, plus randomness) so thousands of clients don't reconnect at the same instant after an outage.
- **Heartbeats**: send periodic pings (or rely on server pings) to detect dead connections that never fired `close`.
- **Resume, don't restart**: after reconnecting, ask for messages since the last sequence number or timestamp you processed.
- **Ordering and duplicates**: messages on one connection arrive in order, but across reconnects you can miss or repeat some. Give messages IDs or sequence numbers and make handlers idempotent.
- **Backpressure**: check `ws.bufferedAmount` before sending large volumes; batch or throttle high-frequency updates (cursor positions) on both ends.
- **Queue outgoing messages** while offline and flush them after reconnecting, or show the user that they're offline.

## Security

- Browsers don't apply CORS to WebSockets, but they do send the `Origin` header: the server must **check `Origin`** to prevent cross-site WebSocket hijacking when cookies authenticate the connection.
- Authenticate during the handshake (cookie, or a short-lived token sent in the first message) rather than putting long-lived tokens in the URL, where they end up in logs.
- Validate and size-limit every incoming message, and authorise per action (can this user post to room 42?), not just on connect.

## Scaling

Each WebSocket is a long-lived connection pinned to one server process. To scale horizontally:

- use a **pub/sub backbone** (Redis, NATS, Kafka) so a message published on one server reaches clients connected to others;
- configure load balancers for long-lived connections (timeouts, sticky sessions if the protocol needs them);
- plan graceful shutdown during deploys (tell clients to reconnect elsewhere).

Managed services (Ably, Pusher, Supabase Realtime, Firebase) handle this for you.

## In React

Open the socket in an effect (or a shared provider/store), **close it in the cleanup function**, and avoid one socket per component. Strict Mode mounts effects twice in development, which quickly reveals missing cleanup.

## Interview checklist

- Compare polling, long polling, SSE and WebSockets, with a use case for each.
- Explain the upgrade handshake and `wss://`.
- Design reconnection with backoff, heartbeats and resuming from a sequence number.
- Explain `Origin` checks and authentication for WebSockets.
- Explain why real-time servers need pub/sub to scale horizontally.
