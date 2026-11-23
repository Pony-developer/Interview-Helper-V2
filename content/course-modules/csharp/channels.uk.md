`BlockingCollection` змушує споживача, що чекає, **блокувати потік**. На сервері із сотнями черг заблоковані потоки — марнотратство. `System.Threading.Channels` розв'язує ту саму задачу виробника і споживача через `await`: читач чи письменник, що чекає, не займає потоку.

## Канал має два кінці

```csharp
Channel<Order> channel = Channel.CreateBounded<Order>(capacity: 100);

ChannelWriter<Order> writer = channel.Writer;   // віддають виробникам
ChannelReader<Order> reader = channel.Reader;   // віддають споживачам
```

Виробник:

```csharp
foreach (Order order in incoming)
{
    await writer.WriteAsync(order);   // чекає (без потоку), поки канал заповнений
}
writer.Complete();                    // «більше елементів не буде»: читачі закінчать, дочитавши решту
```

Споживач:

```csharp
await foreach (Order order in reader.ReadAllAsync())   // закінчується після Complete і порожнього каналу
{
    await ProcessAsync(order);
}
```

Кілька споживачів можуть читати з одного каналу одночасно: кожен елемент дістається рівно одному з них.

## Обмежений чи необмежений

- `Channel.CreateUnbounded<T>()` ніколи не змушує письменника чекати. Якщо виробник швидший за споживачів, пам'ять росте без меж.
- `Channel.CreateBounded<T>(capacity)` змушує письменника чекати, коли канал заповнений. Це **зворотний тиск** (backpressure): повільний споживач автоматично пригальмовує виробника. Параметр `FullMode` натомість може відкидати найстаріший чи найновіший елемент, що пасує для телеметрії, де втратити один вимір не страшно.

У робочому коді віддавайте перевагу обмеженим каналам.

## Типове застосування: фонова черга

В ASP.NET Core запит має відповідати швидко, а повільна робота (надсилання листів, зміна розміру зображень) відбувається пізніше. Запит записує задачу в канал і повертає відповідь; фоновий сервіс (`BackgroundService`) читає канал і виконує роботу.

```csharp
public class EmailQueue
{
    private readonly Channel<Email> channel = Channel.CreateBounded<Email>(1000);
    public ValueTask EnqueueAsync(Email email) => channel.Writer.WriteAsync(email);
    public IAsyncEnumerable<Email> ReadAllAsync(CancellationToken ct) => channel.Reader.ReadAllAsync(ct);
}
```

## Порівняння з іншими інструментами

| Інструмент | Під час очікування |
|---|---|
| `BlockingCollection<T>` | блокує потік |
| `Channel<T>` | `await`, без потоку |
| `ConcurrentQueue<T>` | не чекає взагалі: `TryDequeue` просто повертає `false` |

Канали є в .NET Core 3.0 і новіших. Їх немає в компіляторі C# 7, на якому виконуються практики курсу, тож практика цього модуля використовує `BlockingCollection`, що втілює ту саму ідею виробника і споживача.

## Правило

Для асинхронних конвеєрів «виробник — споживач» використовуйте обмежений `Channel<T>`: письменники викликають `WriteAsync`, а потім `Complete`, читачі використовують `await foreach` по `ReadAllAsync`.
