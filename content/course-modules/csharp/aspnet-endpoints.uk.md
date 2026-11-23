**Кінцева точка** (endpoint) — код, що зрештою обробляє запит: маршрутизація зіставляє з нею HTTP-метод і URL. ASP.NET Core пропонує два стилі.

## Minimal API

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

Фреймворк заповнює параметри через **прив'язування** (binding):

- `id` — з шаблону маршруту `{id:int}` (`:int` — обмеження маршруту);
- прості типи, яких немає в маршруті, — з рядка запиту (`?page=2`);
- складний тип (`CreateOrderRequest`) — з JSON-тіла;
- зареєстровані сервіси (`IOrderRepository`) — з DI-контейнера;
- спеціальні типи: `HttpContext`, `CancellationToken` (скасовується, коли клієнт від'єднався).

## Контролери

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

`[ApiController]` додає домовленості: якщо модель неправильна (не пройшли анотації даних на кшталт `[Required]` чи `[Range(1, 100)]` на `CreateOrderRequest`), фреймворк відповідає **400** з тілом `ProblemDetails` ще до виклику вашого методу.

Контролери також підтримують **фільтри** (код, що виконується навколо дій) і зручні для великих API з багатьма пов'язаними діями. Minimal API мають менше церемоній і трохи швидші. Обидва стилі повністю підтримуються; обирайте один стиль на проєкт.

## Коди статусу, які треба знати

| Код | Значення |
|---|---|
| 200 OK | успіх із тілом |
| 201 Created | створено новий ресурс; заголовок `Location` вказує на нього |
| 204 No Content | успіх без тіла (наприклад, після `DELETE`) |
| 400 Bad Request | вхідні дані неправильні |
| 401 Unauthorized | **не автентифіковано**: хто ти? |
| 403 Forbidden | автентифіковано, але **не дозволено** |
| 404 Not Found | такого ресурсу немає |
| 409 Conflict | запит суперечить поточному стану (дублікат, конфлікт версій) |
| 500 Internal Server Error | необроблена помилка на сервері |

## Повертайте DTO, а не сутності

Не повертайте сутності бази даних напряму. Окремий тип відповіді (добре пасує record) ховає внутрішні поля, уникає циклів під час серіалізації в JSON і дає змогу змінювати базу, не ламаючи клієнтів.

## Правило

Тримайте кінцеві точки тонкими: прив'язати вхідні дані, викликати сервіс, перетворити результат на код статусу і DTO.
