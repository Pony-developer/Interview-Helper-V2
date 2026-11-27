## JSON in .NET (Q6)

```csharp
public record Order(int Id, string Customer, decimal Total, DateTime CreatedAt);

var json = JsonSerializer.Serialize(order, new JsonSerializerOptions { WriteIndented = true });
// { "Id": 1, "Customer": "Ann", "Total": 99.5, "CreatedAt": "2026-11-27T10:00:00" }
var back = JsonSerializer.Deserialize<Order>(json);
```

Things to know: ASP.NET Core uses **camelCase** by default (`JsonSerializerDefaults.Web`); `[JsonPropertyName("customer_name")]` renames a property; `[JsonIgnore]` skips it; dates are ISO 8601 strings; JSON has no comments, no trailing commas and only double-quoted strings; numbers have no fixed precision, so money is often sent as a string or in minor units (cents).

## REST in practice (Q7, Q10)

| Action | Request | Typical response |
|---|---|---|
| List orders | `GET /orders?status=paid&page=2` | `200 OK` + array |
| Get one | `GET /orders/42` | `200 OK` or `404 Not Found` |
| Create | `POST /orders` + JSON body | `201 Created` + `Location: /orders/43` |
| Replace | `PUT /orders/42` | `200 OK` / `204 No Content` |
| Partial update | `PATCH /orders/42` | `200 OK` |
| Delete | `DELETE /orders/42` | `204 No Content` |
| Invalid input | — | `400 Bad Request` (+ ProblemDetails) |
| Not logged in / not allowed | — | `401 Unauthorized` / `403 Forbidden` |
| Conflict (version, duplicate) | — | `409 Conflict` |

Nouns in URLs, verbs in methods (`POST /orders`, not `POST /createOrder`). **Safe** methods (GET, HEAD) don't change state; **idempotent** ones (GET, PUT, DELETE) give the same result when repeated; POST is neither, which is why payment APIs ask for an idempotency key.

GET vs POST beyond the basics: GET can be cached, prefetched by browsers and retried by proxies; a GET that changes data (like `GET /delete?id=5`) is a bug waiting to happen. Sensitive data never goes in a GET URL — URLs end up in logs and browser history.

## SPA vs classic web apps (Q8)

- **MPA** (multi-page, server-rendered, e.g. MVC with Razor): every click loads a new HTML page.
- **SPA** (React, Angular, Vue, Blazor WebAssembly): one HTML shell; JavaScript renders views and changes the URL with the History API; data comes from a JSON API (often ASP.NET Core Web API). Authentication is usually token- or cookie-based with CORS configured.
- **SSR / hybrid** (Next.js, Angular SSR, Blazor Server/United): the first page is rendered on the server for speed and SEO, then the app "hydrates" and behaves like an SPA.

## Docker in a nutshell (Q11)

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY ./publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Shop.Api.dll"]
```

```text
docker build -t shop-api .          # image from the Dockerfile
docker run -p 8080:8080 shop-api    # container from the image
docker compose up                   # several containers: API + PostgreSQL + Redis
```

- **Image**: an immutable, layered template. **Container**: a running instance with its own writable layer, process tree and network namespace, sharing the host kernel.
- **Pros**: identical environments from a laptop to production, fast start, dense packing, easy local dependencies (a database in one command), the base for Kubernetes.
- **Cons**: data is lost with the container unless you use volumes; images need patching; debugging and networking add complexity; Linux containers need a Linux kernel (WSL 2 on Windows).

## Unit, integration and end-to-end tests (Q12)

- **Unit**: one class, dependencies faked, milliseconds, run on every build.
- **Integration**: several real parts together — a repository against a real database in Docker (Testcontainers), or the whole HTTP pipeline in memory with `WebApplicationFactory<Program>`.
- **End-to-end / UI**: the deployed system through a browser (Playwright, Selenium): slow and brittle, so keep only the critical paths.

The **test pyramid**: many unit tests at the bottom, fewer integration tests, very few end-to-end tests on top.
