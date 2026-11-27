## Завдання

Питання 130: «Опишіть модель зрілості REST». Рівень 3 додає **гіпермедіа** (HATEOAS): кожна відповідь каже клієнту, які дії можливі *зараз*, тож клієнт не кодує жорстко URL чи скінченний автомат станів замовлення.

Допишіть `OrderLinks`:

1. **`Build(id, status)`** — створіть `OrderDto` з посиланнями:
   - завжди `self` `GET /orders/{id}`;
   - `new`: `pay` `POST /orders/{id}/payment`, `cancel` `DELETE /orders/{id}`;
   - `paid`: `ship` `POST /orders/{id}/shipment`, `refund` `POST /orders/{id}/refund`;
   - `shipped`: `track` `GET /orders/{id}/tracking`;
   - `cancelled`, `refunded`: інших посилань немає;
   - будь-який інший статус → `ArgumentException` (API відповів би `400 Bad Request`).
2. **`Follow(status, rel)`** — статус після переходу за посиланням, що змінює стан: `pay` → `paid`, `cancel` → `cancelled`, `ship` → `shipped`, `refund` → `refunded`. Якщо посилання **не пропонується** для поточного статусу (перевірте через `Build`), киньте `InvalidOperationException` — API відповів би `409 Conflict`.

Клієнт у `Main` не знає правил: він лише переходить за посиланнями, які запропонував сервер, і отримує конфлікт, коли пробує те, чого не пропонували.

Очікуваний вивід:

```
1 new: self GET /orders/1 | pay POST /orders/1/payment | cancel DELETE /orders/1
1 paid: self GET /orders/1 | ship POST /orders/1/shipment | refund POST /orders/1/refund
1 shipped: self GET /orders/1 | track GET /orders/1/tracking
cancel on shipped: 409 Conflict
2 cancelled: self GET /orders/2
3 refunded: self GET /orders/3
unknown status: 400 Bad Request
```
