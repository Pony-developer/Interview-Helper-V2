## JSON у .NET (П6)

```csharp
public record Order(int Id, string Customer, decimal Total, DateTime CreatedAt);

var json = JsonSerializer.Serialize(order, new JsonSerializerOptions { WriteIndented = true });
// { "Id": 1, "Customer": "Ann", "Total": 99.5, "CreatedAt": "2026-11-27T10:00:00" }
var back = JsonSerializer.Deserialize<Order>(json);
```

Що варто знати: ASP.NET Core за замовчуванням використовує **camelCase** (`JsonSerializerDefaults.Web`); `[JsonPropertyName("customer_name")]` перейменовує властивість; `[JsonIgnore]` пропускає її; дати — рядки ISO 8601; у JSON немає коментарів, кінцевих ком і рядків в одинарних лапках; числа не мають фіксованої точності, тож гроші часто передають рядком або в мінімальних одиницях (копійках).

## REST на практиці (П7, П10)

| Дія | Запит | Типова відповідь |
|---|---|---|
| Список замовлень | `GET /orders?status=paid&page=2` | `200 OK` + масив |
| Одне замовлення | `GET /orders/42` | `200 OK` або `404 Not Found` |
| Створити | `POST /orders` + JSON-тіло | `201 Created` + `Location: /orders/43` |
| Замінити | `PUT /orders/42` | `200 OK` / `204 No Content` |
| Частково змінити | `PATCH /orders/42` | `200 OK` |
| Видалити | `DELETE /orders/42` | `204 No Content` |
| Некоректні дані | — | `400 Bad Request` (+ ProblemDetails) |
| Не увійшов / немає прав | — | `401 Unauthorized` / `403 Forbidden` |
| Конфлікт (версія, дублікат) | — | `409 Conflict` |

Іменники в URL, дієслова — в методах (`POST /orders`, а не `POST /createOrder`). **Безпечні** методи (GET, HEAD) не змінюють стан; **ідемпотентні** (GET, PUT, DELETE) дають той самий результат при повторі; POST — ні те, ні інше, тому платіжні API просять ключ ідемпотентності.

GET і POST глибше: GET можна кешувати, браузери можуть робити його заздалегідь, а проксі — повторювати; GET, що змінює дані (на кшталт `GET /delete?id=5`), — це баг, який чекає свого часу. Чутливі дані ніколи не кладуть в URL GET-запиту — URL потрапляють у логи та історію браузера.

## SPA і класичні вебзастосунки (П8)

- **MPA** (багатосторінкові, з рендерингом на сервері, наприклад MVC з Razor): кожен клік завантажує нову HTML-сторінку.
- **SPA** (React, Angular, Vue, Blazor WebAssembly): одна HTML-оболонка; JavaScript рендерить подання й змінює URL через History API; дані приходять із JSON API (часто ASP.NET Core Web API). Автентифікація зазвичай на токенах чи cookies з налаштованим CORS.
- **SSR / гібрид** (Next.js, Angular SSR, Blazor Server/United): перша сторінка рендериться на сервері заради швидкості й SEO, потім застосунок «гідратується» й поводиться як SPA.

## Docker коротко (П11)

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY ./publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Shop.Api.dll"]
```

```text
docker build -t shop-api .          # образ із Dockerfile
docker run -p 8080:8080 shop-api    # контейнер з образу
docker compose up                   # кілька контейнерів: API + PostgreSQL + Redis
```

- **Образ**: незмінний шаблон із шарів. **Контейнер**: запущений екземпляр зі своїм шаром для запису, деревом процесів і мережевим простором імен, що ділить ядро з хостом.
- **Переваги**: однакове середовище від ноутбука до продакшну, швидкий старт, щільне розміщення, прості локальні залежності (база однією командою), основа для Kubernetes.
- **Недоліки**: дані зникають разом із контейнером, якщо не використовувати томи; образи треба оновлювати; налагодження й мережа ускладнюються; Linux-контейнерам потрібне ядро Linux (WSL 2 у Windows).

## Модульні, інтеграційні та end-to-end тести (П12)

- **Модульні**: один клас, залежності підроблені, мілісекунди, запускаються на кожній збірці.
- **Інтеграційні**: кілька реальних частин разом — репозиторій із реальною базою в Docker (Testcontainers) або весь HTTP-конвеєр у пам'яті через `WebApplicationFactory<Program>`.
- **End-to-end / UI**: розгорнута система через браузер (Playwright, Selenium): повільні й крихкі, тож залишайте лише критичні сценарії.

**Піраміда тестування**: багато модульних тестів унизу, менше інтеграційних, зовсім мало end-to-end нагорі.
