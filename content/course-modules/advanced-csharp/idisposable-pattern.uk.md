## Пам'ять проти ресурсів

Збирач сміття забирає **пам'ять**. Він нічого не знає про терміновість **інших ресурсів**: дескрипторів файлів, сокетів, з'єднань з базою, блокувань, буферів GPU, дескрипторів подій ОС. Їх треба звільняти щойно вони стають непотрібні, детерміновано. Для цього існує `IDisposable`:

```csharp
public interface IDisposable { void Dispose(); }
```

## using

```csharp
using (var conn = new SqlConnection(cs))
using (var cmd = new SqlCommand(sql, conn))
{
    conn.Open();
    cmd.ExecuteNonQuery();
}   // cmd.Dispose(), потім conn.Dispose(), навіть якщо був виняток

using var file = File.OpenRead(path);     // оголошення C# 8: звільняється наприкінці області видимості
await using var stream = GetAsyncResource();   // IAsyncDisposable: DisposeAsync
```

`using` — це `try/finally` з перевіркою на null. Об'єкти звільняються у **зворотному порядку** створення.

## Контракт звільнення

Добре вихований `Dispose`:

1. **ідемпотентний**: повторний виклик нічого не робить;
2. робить об'єкт **непридатним**: інші члени після цього кидають `ObjectDisposedException`;
3. звільняє disposable-об'єкти, якими клас **володіє** (але не ті, які лише позичив);
4. по змозі не кидає винятків (виняток з `Dispose` під час розкручування іншого винятку приховує початковий).

`Close()` на типах на кшталт `Stream` чи `SqlConnection` — синонім `Dispose` (деякі типи дозволяють знову відкритися після `Close`).

## Хто що звільняє

- **Ви створили — ви звільняєте.** Фабрика чи `new` означає, що ви володієте.
- **Ви отримали — не звільняєте**, якщо API не каже, що володіння передається (наприклад, `new StreamReader(stream, leaveOpen: false)` бере потік у володіння).
- З dependency injection сервіси, створені **контейнером**, звільняє він сам наприкінці їхнього часу життя. Не звільняйте впроваджені сервіси.
- `HttpClient` — відомий виняток: створіть його раз (або через `IHttpClientFactory`) і використовуйте повторно, а не звільняйте на кожен запит, бо це вичерпує сокети.

## Класичний патерн Dispose

Для класу, що володіє лише керованими disposable-об'єктами, достатньо простого `Dispose`:

```csharp
public sealed class ReportWriter : IDisposable
{
    private readonly StreamWriter _writer;
    private bool _disposed;
    public ReportWriter(string path) => _writer = new StreamWriter(path);

    public void Write(string line)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);   // .NET 7; раніше: if (_disposed) throw new ObjectDisposedException(...)
        _writer.WriteLine(line);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _writer.Dispose();
    }
}
```

Для **незапечатаного** класу, від якого можуть наслідуватися (або який напряму тримає некеровані ресурси), повний патерн додає `protected virtual Dispose(bool disposing)`:

```csharp
public class ResourceHolder : IDisposable
{
    private bool _disposed;

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);        // фіналізатор більше не потрібен
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;
        if (disposing)
        {
            // звільнити керовані об'єкти, якими володієте
        }
        // звільнити некеровані ресурси (лише якщо тримаєте їх напряму)
        _disposed = true;
    }

    // ~ResourceHolder() => Dispose(disposing: false);   // лише якщо володієте сирими некерованими дескрипторами
}
```

`disposing == false` означає «викликано з фіналізатора»: інші керовані об'єкти могли вже бути фіналізовані, тож чіпайте лише некерований стан.

## IAsyncDisposable

Ресурси, чиє прибирання включає I/O (скинути мережевий потік, зафіксувати транзакцію), реалізують `ValueTask DisposeAsync()`. Використовуйте `await using`. Тип, що реалізує обидва, має забезпечити й синхронну роботу `Dispose`.

## Що сказати на співбесіді

- GC = пам'ять; `Dispose` = усе інше, детерміновано.
- `using` гарантує звільнення у зворотному порядку навіть при винятках.
- `Dispose` має бути ідемпотентним; звільняє власник; DI-контейнери звільняють те, що створили.
- Повний патерн `Dispose(bool)` — для незапечатаних класів і некерованих ресурсів.
