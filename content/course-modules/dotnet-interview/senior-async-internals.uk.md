«Як докладно працює async/await?» (П133) — найсильніша відповідь показує, що приблизно генерує компілятор.

## Вихідний код

```csharp
public async Task<int> GetLengthAsync(string url)
{
    Console.WriteLine("start");
    string body = await _http.GetStringAsync(url);
    return body.Length;
}
```

## Що створює компілятор (спрощено)

```csharp
public Task<int> GetLengthAsync(string url)
{
    var sm = new GetLengthStateMachine();          // структура в Release-збірках
    sm.builder = AsyncTaskMethodBuilder<int>.Create();
    sm.self = this;
    sm.url = url;
    sm.state = -1;
    sm.builder.Start(ref sm);                      // виконує MoveNext() синхронно, просто зараз
    return sm.builder.Task;
}

struct GetLengthStateMachine : IAsyncStateMachine
{
    public int state;
    public AsyncTaskMethodBuilder<int> builder;
    public MyClient self;
    public string url;
    private TaskAwaiter<string> awaiter;           // локальні змінні, що живуть через await, стають полями

    public void MoveNext()
    {
        int result;
        try
        {
            if (state == -1)
            {
                Console.WriteLine("start");
                awaiter = self._http.GetStringAsync(url).GetAwaiter();
                if (!awaiter.IsCompleted)
                {
                    state = 0;
                    builder.AwaitUnsafeOnCompleted(ref awaiter, ref this);  // уперше упаковує структуру
                    return;                                                // викликач отримує незавершений Task
                }
            }
            // state == 0: відновлено продовженням (або завершено синхронно)
            string body = awaiter.GetResult();       // кидає тут, якщо задача впала
            result = body.Length;
        }
        catch (Exception ex)
        {
            state = -2;
            builder.SetException(ex);                // виняток іде в Task
            return;
        }
        state = -2;
        builder.SetResult(result);                   // завершує Task, запускає продовження
    }

    public void SetStateMachine(IAsyncStateMachine sm) => builder.SetStateMachine(sm);
}
```

Ключові факти, які варто проговорити:
- Метод виконується **синхронно до першого `await` незавершеної задачі**. Асинхронний метод, що насправді ніколи не чекає, завершується синхронно (а `ValueTask` тоді уникає навіть виділення `Task`).
- Локальні змінні стають **полями**; структура **упаковується в купу** лише тоді, коли метод справді призупиняється.
- `AwaitUnsafeOnCompleted` реєструє `MoveNext` як продовження. Де воно виконається, залежить від захопленого **`SynchronizationContext`** (UI-потік, класичний ASP.NET) або `TaskScheduler`; без них (ASP.NET Core, консоль) — на потоці пулу або прямо на потоці, що завершив I/O.
- Під час I/O **жоден потік не чекає**. «Потоку немає» — ключова ідея асинхронності для I/O.
- Винятки зберігаються в задачі й перекидаються через `GetResult()` на `await` зі збереженим початковим стеком (`ExceptionDispatchInfo`).

## Awaitable-типи

`await x` працює з усім, що має метод `GetAwaiter()`, який повертає тип з `IsCompleted`, `OnCompleted`/`UnsafeOnCompleted` і `GetResult()` — так підключаються `Task`, `ValueTask`, `YieldAwaitable` (`Task.Yield()`), `ConfiguredTaskAwaitable` і власні awaitable-типи.

## Знову про async void

`async void` використовує `AsyncVoidMethodBuilder`: задачі для повернення немає, тож викликач не може його дочекатися, а виняток у ньому потрапляє в `SynchronizationContext` (або кидається в пулі потоків), що в .NET Core **завершує процес**. Доречно лише для обробників подій. Для роботи «запустив і забув» у сервісах:

```csharp
// ризиковано: винятки губляться або обвалюють процес, немає обробки зупинки
_ = SendEmailAsync(order);

// краще: фонова черга, яку обробляє hosted service
await _queue.Writer.WriteAsync(new SendEmail(order.Id), ct);   // Channel<T> + BackgroundService
```

## Типові баги з async, які варто згадати

- `async`-лямбди там, де очікують `Action` (наприклад, `List.ForEach(async x => …)`), стають `async void`.
- Забутий `await` → «запустив і забув» з неспостереженими винятками (стежте за попередженням CS4014).
- `await` у циклі для незалежних операцій → послідовне виконання; використайте `Task.WhenAll` (за потреби з обмеженням паралелізму).
- Не передано `CancellationToken`; `Task.Result` / `.Wait()` у синхронному коді.
- Повернення `Task` зсередини `using` без `await` → ресурс звільняється раніше, ніж завершується робота.
