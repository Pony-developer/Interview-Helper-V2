## `ValueTask<T>`: коли відповідь часто вже готова

Кожен метод `async Task<T>` під час завершення виділяє об'єкт `Task<T>`. Зазвичай це неважливо. Але візьмімо кеш, що у 99% випадків відповідає з пам'яті:

```csharp
public async ValueTask<User> GetUserAsync(int id)
{
    User user;
    if (cache.TryGetValue(id, out user))
        return user;                       // синхронний результат: без виділення пам'яті
    user = await db.LoadUserAsync(id);     // рідкісний повільний шлях
    cache[id] = user;
    return user;
}
```

`ValueTask<T>` — це структура, що містить або готовий результат, або справжню задачу. На швидкому шляху вона нічого не виділяє.

Ціна — суворі правила. `ValueTask` можна:

- **очікувати лише один раз**;
- не очікувати кількома споживачами одночасно;
- не читати через `.Result`, доки він не завершився.

Якщо потрібне щось із цього, перетворіть його через `.AsTask()`. Вибір за замовчуванням — і далі `Task<T>`: переходьте на `ValueTask<T>` лише в гарячому коді, де виміри показують, що виділення пам'яті мають значення.

## `IAsyncEnumerable<T>`: потік результатів

`IEnumerable<T>` з `yield return` видає елементи по одному, але не може чекати на введення-виведення між ними. Починаючи з C# 8 це вміє `async`-ітератор:

```csharp
public async IAsyncEnumerable<Order> GetAllOrdersAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    int page = 0;
    while (true)
    {
        List<Order> batch = await api.GetPageAsync(page++, ct);   // чекаємо на наступну сторінку
        if (batch.Count == 0) yield break;
        foreach (Order order in batch)
            yield return order;                                 // видаємо елементи по одному
    }
}
```

Його споживають через `await foreach`:

```csharp
await foreach (Order order in GetAllOrdersAsync().WithCancellation(token))
{
    Console.WriteLine(order.Id);   // перші замовлення з'являються до завантаження всіх сторінок
}
```

Викликаючий отримує перші елементи, щойно прийде перша сторінка, а в пам'яті одночасно лежить одна сторінка, а не весь результат. Entity Framework Core (`AsAsyncEnumerable`), `ChannelReader.ReadAllAsync` і потокові відповіді ASP.NET Core використовують саме цей інтерфейс.

## `Parallel.ForEachAsync`

Щоб асинхронно обробити багато елементів з обмеженням паралельності (.NET 6):

```csharp
await Parallel.ForEachAsync(urls, new ParallelOptions { MaxDegreeOfParallelism = 4 },
    async (url, ct) => await DownloadAsync(url, ct));
```

У простих випадках це заміняє написаний вручну патерн із `SemaphoreSlim`.

## Правило

За замовчуванням повертайте `Task<T>`, а `ValueTask<T>` — лише у виміряному гарячому коді; повертайте `IAsyncEnumerable<T>`, коли результати надходять поступово і викликаючий може почати роботу раніше, ніж усі вони будуть готові.
