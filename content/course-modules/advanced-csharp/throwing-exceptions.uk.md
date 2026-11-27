## Кидання

```csharp
if (amount <= 0)
    throw new ArgumentOutOfRangeException(nameof(amount), amount, "Amount must be positive.");

// throw-вирази (C# 7) працюють у ?:, ?? і членах з тілом-виразом
public string Name
{
    get => _name;
    set => _name = value ?? throw new ArgumentNullException(nameof(value));
}

// допоміжний метод-охоронець .NET 6
ArgumentNullException.ThrowIfNull(order);
```

## Повторне кидання

```csharp
catch (Exception ex)
{
    Log(ex);
    throw;          // кидає ТОЙ САМИЙ виняток, стек викликів збережено
}

catch (Exception ex)
{
    throw ex;       // НЕ ТРЕБА: скидає стек викликів до цього рядка
}

catch (SqlException ex)
{
    throw new DataAccessException("Could not load order 42", ex);   // обгорнути, зберігши InnerException
}
```

Обгортання корисне на межах шарів: тим, хто викликає репозиторій, не треба знати про `SqlException`, а початкова помилка лишається доступною через `InnerException`.

Щоб повторно кинути виняток, перехоплений деінде (наприклад, в іншому потоці), зі збереженим стеком, використовуйте `ExceptionDispatchInfo.Capture(ex).Throw();`. Саме так усередині працює `await`.

## Ключові властивості System.Exception

| Властивість | Містить |
| --- | --- |
| `Message` | зрозумілий людині опис |
| `StackTrace` | стек викликів від місця кидання до місця перехоплення |
| `InnerException` | виняток, що спричинив цей, якщо його обгорнули |
| `Data` | словник для додаткової діагностики |
| `HResult` | цілочисельний код, переважно для interop |

## Поширені типи винятків

| Тип | Коли кидати |
| --- | --- |
| `ArgumentException` / `ArgumentNullException` / `ArgumentOutOfRangeException` | викликач передав поганий аргумент |
| `InvalidOperationException` | стан об'єкта зараз не дозволяє цей виклик (наприклад, читання із закритого reader) |
| `NotSupportedException` | цей тип ніколи не підтримує операцію (наприклад, `Add` у колекції лише для читання) |
| `NotImplementedException` | заглушка для недописаного коду; не має потрапити в реліз |
| `ObjectDisposedException` | член використано після `Dispose` |
| `KeyNotFoundException`, `FormatException`, `TimeoutException` | конкретні, самопояснювальні збої |

Ніколи самі не кидайте `Exception`, `SystemException`, `NullReferenceException` чи `IndexOutOfRangeException`: вони надто загальні або зарезервовані для рантайму.

## Патерн TryXxx

```csharp
public bool TryGetPrice(string sku, out decimal price) { /* ... */ }
public decimal GetPrice(string sku) =>
    TryGetPrice(sku, out var price) ? price : throw new KeyNotFoundException(sku);
```

Пропонуйте `Try`-версію, коли невдача — **нормальний результат** (погане введення, відсутній ключ), щоб викликачі не платили за виняток і не писали try/catch для звичайних випадків.

## Власні винятки

```csharp
public class InsufficientFundsException : Exception
{
    public decimal Shortfall { get; }
    public InsufficientFundsException(decimal shortfall)
        : base($"Insufficient funds: {shortfall:C} short.") => Shortfall = shortfall;
    public InsufficientFundsException(string message, Exception inner) : base(message, inner) { }
}
```

Створюйте власний виняток лише тоді, коли викликачі **ловитимуть саме його** чи потребують додаткових даних. Називайте із суфіксом `Exception` і наслідуйте `Exception` (а не `ApplicationException`).

## Альтернативи винятків

Для очікуваних невдач у доменній логіці тип-результат (`Result<T>`, `bool` + `out` чи nullable-результат) часто зрозуміліший за кидання. Залиште винятки для помилок у коді та умов, з якими поточний метод не може впоратися.

## Що сказати на співбесіді

- `throw;` зберігає стек викликів; `throw ex;` його знищує.
- На межах шарів обгортайте низькорівневі винятки й зберігайте їх як `InnerException`.
- Використовуйте конкретні винятки для аргументів; для очікуваних невдач пропонуйте `TryXxx`.
