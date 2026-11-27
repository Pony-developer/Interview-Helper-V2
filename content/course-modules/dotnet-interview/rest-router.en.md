## Task

Questions 7 and 10 are about REST and HTTP methods. Every web framework has a **router** that maps a method and a path to a handler — and decides between `404 Not Found` (no such resource) and `405 Method Not Allowed` (the resource exists but not for this method). Build a tiny one.

`Map(method, template, handler)` is ready. Complete **`Router.Handle(method, path)`**:

1. Split the path into segments, ignoring empty ones (`"/orders/"` is the same as `"/orders"`).
2. A template matches when it has the same number of segments and every segment is equal — except `{name}` segments, which match anything and **capture** the value under `name`.
3. If a matching template has the same method, return `"200 " + handler(captured values)`.
4. If some templates matched the path but none had this method, return `"405 Method Not Allowed"`.
5. If nothing matched the path, return `"404 Not Found"`.

Expected output:

```
GET /orders -> 200 all orders
GET /orders/42 -> 200 order 42
DELETE /orders/42 -> 200 deleted 42
POST /orders/42 -> 405 Method Not Allowed
GET /customers/7/orders/9 -> 200 order 9 of customer 7
GET /products -> 404 Not Found
GET /orders/42/items -> 404 Not Found
GET /orders/ -> 200 all orders
```
