## The everyday patterns

```csharp
// 1. Await I/O, pass the cancellation token through
public async Task<IReadOnlyList<Order>> GetRecentAsync(int customerId, CancellationToken ct)
{
    return await _db.Orders
        .Where(o => o.CustomerId == customerId)
        .OrderByDescending(o => o.CreatedAt)
        .Take(20)
        .ToListAsync(ct);
}

// 2. Independent calls → run them concurrently
var profileTask = _users.GetProfileAsync(id, ct);
var ordersTask = _orders.GetRecentAsync(id, ct);
await Task.WhenAll(profileTask, ordersTask);
var page = new Dashboard(profileTask.Result, ordersTask.Result);   // .Result is safe here: both are done

// 3. A timeout
using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
cts.CancelAfter(TimeSpan.FromSeconds(5));
var data = await _http.GetStringAsync(url, cts.Token);

// 4. Async streams
await foreach (var line in ReadLinesAsync(path, ct)) { … }
```

## The mistakes interviewers look for

| Mistake | Why it's bad | Fix |
|---|---|---|
| `.Result` / `.Wait()` | blocks a thread; deadlocks with a SynchronizationContext | `await` all the way up |
| `async void Save()` | caller can't await; exceptions crash the process | `async Task Save()` |
| `await` in a loop for independent calls | runs sequentially | `Task.WhenAll` |
| `Task.Run(() => db.Query())` in ASP.NET | moves blocking to another pool thread | use the async API |
| Forgetting `await` | fire-and-forget, lost exceptions | enable warning CS4014 as error |
| No `CancellationToken` | requests keep working after the client left | accept and pass tokens |
| `async` lambda in `List.ForEach` | becomes `async void` | `foreach` + `await` |

## Tasks vs threads in one picture

```text
Thread-blocking:  [thread #5 ████████ waiting for DB ████████] → thread busy 200 ms
Async:            [thread #5 ▌] ……… DB works, no thread ……… [thread #9 ▌] → threads busy ~1 ms
```

That's why an async web server handles far more concurrent requests with the same number of threads.

## Async and unit tests

```csharp
[Fact]
public async Task GetRecentAsync_returns_newest_first()
{
    var service = new OrderService(TestDb.With(orders));
    var result = await service.GetRecentAsync(7, CancellationToken.None);
    Assert.Equal(new[] { 3, 2, 1 }, result.Select(o => o.Id));
}

[Fact]
public async Task Throws_for_unknown_customer() =>
    await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetAsync(999, default));
```

Test methods return `Task` (never `async void`); use `Assert.ThrowsAsync`; fake async dependencies with `Task.FromResult(...)` or Moq's `ReturnsAsync`.

## SQL warm-up for the practice

```sql
SELECT c.title, count(e.student_id) AS students
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id   -- keeps courses with no students
GROUP BY c.id, c.title;

SELECT s.name FROM students s
WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.id);   -- students with no courses
```

`avg()` and `count(column)` skip NULLs; `count(*)` counts rows. That difference decides the practice.
