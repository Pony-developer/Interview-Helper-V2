## Повсякденні шаблони

```csharp
// 1. Чекаємо на I/O, передаємо токен скасування далі
public async Task<IReadOnlyList<Order>> GetRecentAsync(int customerId, CancellationToken ct)
{
    return await _db.Orders
        .Where(o => o.CustomerId == customerId)
        .OrderByDescending(o => o.CreatedAt)
        .Take(20)
        .ToListAsync(ct);
}

// 2. Незалежні виклики → запускаємо одночасно
var profileTask = _users.GetProfileAsync(id, ct);
var ordersTask = _orders.GetRecentAsync(id, ct);
await Task.WhenAll(profileTask, ordersTask);
var page = new Dashboard(profileTask.Result, ordersTask.Result);   // .Result тут безпечний: обидві завершені

// 3. Тайм-аут
using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
cts.CancelAfter(TimeSpan.FromSeconds(5));
var data = await _http.GetStringAsync(url, cts.Token);

// 4. Асинхронні потоки
await foreach (var line in ReadLinesAsync(path, ct)) { … }
```

## Помилки, які шукають інтерв'юери

| Помилка | Чому погано | Виправлення |
|---|---|---|
| `.Result` / `.Wait()` | блокує потік; взаємне блокування із SynchronizationContext | `await` до самого верху |
| `async void Save()` | викликач не може дочекатися; винятки обвалюють процес | `async Task Save()` |
| `await` у циклі для незалежних викликів | виконується послідовно | `Task.WhenAll` |
| `Task.Run(() => db.Query())` в ASP.NET | переносить блокування на інший потік пулу | використати асинхронний API |
| Забутий `await` | «запустив і забув», загублені винятки | зробити попередження CS4014 помилкою |
| Немає `CancellationToken` | запити працюють і після того, як клієнт пішов | приймати й передавати токени |
| `async`-лямбда в `List.ForEach` | стає `async void` | `foreach` + `await` |

## Задачі й потоки на одній картинці

```text
Блокування потоку:  [потік #5 ████████ чекає на БД ████████] → потік зайнятий 200 мс
Асинхронно:         [потік #5 ▌] ……… БД працює, потоку немає ……… [потік #9 ▌] → потоки зайняті ~1 мс
```

Тому асинхронний вебсервер обслуговує значно більше одночасних запитів із тією самою кількістю потоків.

## Async і модульні тести

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

Тестові методи повертають `Task` (ніколи `async void`); використовуйте `Assert.ThrowsAsync`; підробляйте асинхронні залежності через `Task.FromResult(...)` або `ReturnsAsync` у Moq.

## Розминка з SQL перед практикою

```sql
SELECT c.title, count(e.student_id) AS students
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id   -- зберігає курси без студентів
GROUP BY c.id, c.title;

SELECT s.name FROM students s
WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.id);   -- студенти без курсів
```

`avg()` і `count(колонка)` пропускають NULL; `count(*)` рахує рядки. Саме ця різниця вирішує практику.
