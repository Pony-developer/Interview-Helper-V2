## Сигналізація: один потік дозволяє іншим продовжити

Блокування захищають дані; **сигналізація** координує час: «чекай, доки дані будуть готові», «запустіть усіх робітників разом», «продовжуйте, коли всі завершили фазу 1».

## Event wait handles

| Тип | Поведінка |
| --- | --- |
| `ManualResetEventSlim` | ворота: `Set()` відчиняє їх для **всіх**, доки `Reset()` не зачинить |
| `AutoResetEvent` | турнікет: `Set()` пропускає **один** потік, що чекає, і автоматично зачиняється |
| `CountdownEvent` | відчиняється після N сигналів |

```csharp
var ready = new ManualResetEventSlim(false);

var worker = new Thread(() =>
{
    ready.Wait();                     // блокується, доки ворота не відчиняться
    Console.WriteLine("config loaded, starting");
});
worker.Start();

LoadConfiguration();
ready.Set();                          // відчиняє ворота для кожного, хто чекає

var done = new CountdownEvent(3);
for (int i = 0; i < 3; i++) ThreadPool.QueueUserWorkItem(_ => { Work(); done.Signal(); });
done.Wait();                          // продовжує після трьох сигналів
```

Версії `Slim` недовго крутяться перед блокуванням і швидші; класичні `ManualResetEvent`/`AutoResetEvent` — об'єкти ядра, які можна іменувати для сигналізації між процесами й поєднувати через `WaitHandle.WaitAny/WaitAll`.

В асинхронному коді віддавайте перевагу `TaskCompletionSource` (одноразовий сигнал, який можна очікувати) або `SemaphoreSlim.WaitAsync`.

## Monitor.Wait і Pulse

Низькорівневий примітив, на якому побудовано багато блокуючих структур. Усередині lock потік може **чекати** на умову, звільняючи блокування на час очікування; інший потік **сигналізує** (pulse), змінивши стан:

```csharp
lock (_sync)
{
    while (_queue.Count == 0)        // ЗАВЖДИ перевіряйте умову в циклі
        Monitor.Wait(_sync);         // звільняє lock, засинає, знову захоплює при сигналі
    item = _queue.Dequeue();
}

lock (_sync)
{
    _queue.Enqueue(item);
    Monitor.PulseAll(_sync);         // розбудити тих, хто чекає; вони перевірять свої умови
}
```

- Очікування в циклі `while` обробляє хибні пробудження та випадок, коли інший потік забрав елемент першим.
- `Pulse` будить одного, `PulseAll` — усіх; `PulseAll` безпечніший, коли потоки чекають на різні умови.
- `Wait` і `Pulse` треба викликати, тримаючи блокування.

## Barrier

`Barrier` змушує фіксовану групу потоків зустрічатися наприкінці кожної **фази**:

```csharp
var barrier = new Barrier(participantCount: 3, postPhaseAction: b => Console.WriteLine($"phase {b.CurrentPhaseNumber} done"));

void Worker(int id)
{
    for (int phase = 0; phase < 3; phase++)
    {
        Compute(id, phase);
        barrier.SignalAndWait();   // ніхто не почне наступну фазу, доки всі троє не завершать цю
    }
}
```

Типово в симуляціях та ітеративних алгоритмах, де кожен крок залежить від результатів усіх робітників на попередньому кроці.

## Варіанти вищого рівня

Більшість прикладного коду не має використовувати ці примітиви напряму. `BlockingCollection<T>` і `Channel<T>` реалізують черги виробник/споживач, `Task.WhenAll` чекає на групу, `Parallel.For` розподіляє роботу, а `TaskCompletionSource` перетворює сигнал на задачу, яку можна очікувати.

## Що сказати на співбесіді

- `ManualResetEventSlim` = ворота для всіх; `AutoResetEvent` = турнікет для одного; `CountdownEvent` = після N сигналів.
- `Monitor.Wait/Pulse`: чекати всередині lock, завжди в циклі `while` з повторною перевіркою умови.
- `Barrier` синхронізує фази у фіксованій групі потоків; в асинхронному коді — TCS чи канали.
