An **endpoint** is the code that finally handles a request: routing matches the HTTP method and the URL to it. ASP.NET Core offers two styles.

## Minimal APIs

```csharp
app.MapGet("/orders/{id:int}", async (int id, IOrderRepository repository) =>
{
    Order? order = await repository.FindAsync(id);
    return order is null ? Results.NotFound() : Results.Ok(order);
});

app.MapPost("/orders", async (CreateOrderRequest request, IOrderRepository repository) =>
{
    Order order = await repository.AddAsync(request);
    return Results.Created($"/orders/{order.Id}", order);
});
```

The framework fills the parameters by **binding**:

- `id` from the route template `{id:int}` (`:int` is a route constraint);
- simple types not in the route from the query string (`?page=2`);
- a complex type (`CreateOrderRequest`) from the JSON body;
- registered services (`IOrderRepository`) from the DI container;
- special types: `HttpContext`, `CancellationToken` (cancelled when the client disconnects).

## Controllers

```csharp
[ApiController]
[Route("api/[controller]")]                     // -> api/orders
public class OrdersController(IOrderRepository repository) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Order>> Get(int id)
    {
        Order? order = await repository.FindAsync(id);
        return order is null ? NotFound() : order;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        Order order = await repository.AddAsync(request);
        return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
    }
}
```

`[ApiController]` adds conventions: if the model is invalid (data annotations such as `[Required]` or `[Range(1, 100)]` on `CreateOrderRequest` fail), the framework answers **400** with a `ProblemDetails` body before your method is even called.

Controllers also support **filters** (code that runs around actions) and are convenient for large APIs with many related actions. Minimal APIs have less ceremony and are a little faster. Both are fully supported; choose one style per project.

## Status codes you must know

| Code | Meaning |
|---|---|
| 200 OK | success with a body |
| 201 Created | a new resource was created; the `Location` header points to it |
| 204 No Content | success without a body (for example, after `DELETE`) |
| 400 Bad Request | the input is invalid |
| 401 Unauthorized | **not authenticated**: who are you? |
| 403 Forbidden | authenticated, but **not allowed** |
| 404 Not Found | no such resource |
| 409 Conflict | the request conflicts with the current state (a duplicate, a version conflict) |
| 500 Internal Server Error | an unhandled error on the server |

## Return DTOs, not entities

Do not return database entities directly. A separate response type (a record works well) hides internal fields, avoids loops in JSON serialization, and lets the database change without breaking clients.

## The rule

Keep endpoints thin: bind the input, call a service, map the result to a status code and a DTO.
