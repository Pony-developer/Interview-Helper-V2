## Task: обіцянка результату

`Task` подає операцію, що може завершитися пізніше. `Task<TResult>` додає результат. На відміну від потоку, задача — об'єкт вищого рівня: її можна очікувати, комбінувати, скасовувати, і вона несе винятки.

```csharp
Task<int> t = Task.Run(() => CountPrimes(1_000_000));   // виконується в пулі потоків
// ... робимо інше ...
int primes = await t;                                    // або t.Result, щоб заблокуватися (уникайте на серверах)
```

Не кожна задача виконується в потоці. Задача від `HttpClient.GetStringAsync` чи `Task.Delay` подає I/O або таймер: **жоден потік не зайнятий**, поки вона чекає.

## Стани

`Created` → `WaitingForActivation`/`WaitingToRun` → `Running` → один із:

- `RanToCompletion` (`IsCompletedSuccessfully`);
- `Faulted` (`IsFaulted`, `Exception` містить `AggregateException`);
- `Canceled` (`IsCanceled`).

`IsCompleted` істинний для всіх трьох кінцевих станів.

## Винятки

Задача **зберігає** винятки замість обвалювати процес:

```csharp
Task t = Task.Run(() => throw new InvalidOperationException("boom"));

try { await t; }                          // кидає початковий InvalidOperationException
catch (InvalidOperationException e) { }

try { t.Wait(); }                         // обгортає: AggregateException → InnerException
catch (AggregateException e) { Console.WriteLine(e.InnerException!.Message); }
```

`AggregateException` існує, бо задача може містити кілька винятків (з `Task.WhenAll` чи дочірніх задач). `await` розгортає й кидає **перший**; щоб побачити всі, дивіться `task.Exception.InnerExceptions`.

Виняток у задачі, яку ніхто ніколи не спостерігає, не обвалює процес (з .NET 4.5); про нього повідомляє `TaskScheduler.UnobservedTaskException`, коли задачу збирає GC. Тож задачі «запустив і забув» можуть падати мовчки: логуйте всередині них.

## Продовження

Продовження — код, що виконується, коли задача завершилася.

```csharp
Task<string> download = client.GetStringAsync(url);
Task<int> length = download.ContinueWith(prev => prev.Result.Length);

Task cleanup = download.ContinueWith(_ => Log("failed"), TaskContinuationOptions.OnlyOnFaulted);
```

`await` — сучасний читабельний спосіб писати продовження: решта методу **і є** продовженням. До `ContinueWith` вдавайтеся лише в особливих випадках; у нього підступні значення за замовчуванням (він виконується навіть після невдачі й використовує поточний `TaskScheduler`, а не пул, якщо не сказати інакше).

Нижчий рівень: `task.GetAwaiter().OnCompleted(...)` — те, що використовує `await`; `GetAwaiter().GetResult()` блокує, як `.Result`, але кидає початковий виняток, а не `AggregateException`.

## Комбінатори

```csharp
Task<string[]> all = Task.WhenAll(GetAsync(a), GetAsync(b), GetAsync(c));   // завершується, коли завершилися всі
Task<Task<string>> first = Task.WhenAny(GetAsync(a), GetAsync(b));           // завершується, коли завершилася одна
Task done = Task.CompletedTask;
Task<int> ready = Task.FromResult(42);                                        // уже завершена задача
Task failed = Task.FromException(new TimeoutException());
```

`WhenAll` не падає одразу: він чекає на кожну задачу, а потім завершується з помилкою, що містить усі їхні винятки.

## Task.Run проти Task.Factory.StartNew

`Task.Run(action)` — безпечне скорочення для `Task.Factory.StartNew(action, CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskScheduler.Default)`. `StartNew` з асинхронною лямбдою повертає `Task<Task>` (класична помилка); `Task.Run` розгортає це за вас. `StartNew` беріть лише для опцій на кшталт `LongRunning`.

## Що сказати на співбесіді

- Задача — обіцянка завершення; задачі I/O не використовують потік під час очікування.
- Задачі зберігають винятки; `await` кидає початковий, `.Wait()`/`.Result` обгортають в `AggregateException`.
- Віддавайте перевагу `await`, а не `ContinueWith`; `Task.Run`, а не `StartNew`.
