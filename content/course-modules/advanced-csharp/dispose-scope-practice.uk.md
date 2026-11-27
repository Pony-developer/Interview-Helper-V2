## Завдання

`DisposeScope` володіє групою disposable-ресурсів, як маленька DI-область.

1. **`Add<T>(T item)`** реєструє ресурс і повертає його (щоб можна було писати `var db = scope.Add(new Connection("db"));`). Додавання до вже звільненої області кидає `ObjectDisposedException`.
2. **`Dispose()`**:
   - звільняє ресурси у **зворотному порядку** реєстрації, як це зробили б вкладені `using`;
   - продовжує, навіть коли `Dispose` якогось ресурсу кидає виняток, збираючи винятки;
   - звільнивши все, кидає `AggregateException` з усіма зібраними винятками (якщо вони були);
   - **ідемпотентний**: повторний виклик нічого не робить.

`Connection` уже написано: він друкує, коли відкривається й закривається, його `Dispose` ідемпотентний, а використання після звільнення кидає `ObjectDisposedException`.

Очікуваний результат:

```
open db
open cache
open queue
db <- hello
close queue
close cache
close db
disposed: cache
open a
open b
open c
close c
close b
close a
error: c failed to close
error: b failed to close
open x
scope is closed
```
