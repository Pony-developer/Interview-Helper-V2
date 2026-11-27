## Task

Question 130: "Describe the REST maturity model." Level 3 adds **hypermedia** (HATEOAS): every response tells the client which actions are possible *now*, so the client doesn't hard-code URLs or the order state machine.

Complete `OrderLinks`:

1. **`Build(id, status)`** — create an `OrderDto` with its links:
   - always `self` `GET /orders/{id}`;
   - `new`: `pay` `POST /orders/{id}/payment`, `cancel` `DELETE /orders/{id}`;
   - `paid`: `ship` `POST /orders/{id}/shipment`, `refund` `POST /orders/{id}/refund`;
   - `shipped`: `track` `GET /orders/{id}/tracking`;
   - `cancelled`, `refunded`: no other links;
   - any other status → `ArgumentException` (the API would answer `400 Bad Request`).
2. **`Follow(status, rel)`** — the status after following a state-changing link: `pay` → `paid`, `cancel` → `cancelled`, `ship` → `shipped`, `refund` → `refunded`. If the link is **not offered** for the current status (reuse `Build` to check), throw `InvalidOperationException` — the API would answer `409 Conflict`.

The client in `Main` doesn't know the rules: it only follows links the server offered, and gets a conflict when it tries something that isn't offered.

Expected output:

```
1 new: self GET /orders/1 | pay POST /orders/1/payment | cancel DELETE /orders/1
1 paid: self GET /orders/1 | ship POST /orders/1/shipment | refund POST /orders/1/refund
1 shipped: self GET /orders/1 | track GET /orders/1/tracking
cancel on shipped: 409 Conflict
2 cancelled: self GET /orders/2
3 refunded: self GET /orders/3
unknown status: 400 Bad Request
```
