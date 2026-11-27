## Завдання

Подивіться на власні очі, як виняток рухається стеком викликів угору. Допишіть три методи `Tracer`:

1. **`Dive(depth, failAt, log)`** — рекурсивний метод:
   - запишіть у лог `"enter <depth>"`;
   - якщо `depth == failAt`, киньте `new InvalidOperationException("boom at <depth>")`;
   - якщо `depth == 5`, поверніться (дно);
   - інакше викличте `Dive(depth + 1, failAt, log)`;
   - у блоці **`finally`** запишіть `"leave <depth>"`.
2. **`Run(failAt)`** — створіть лог, викличте `Dive(1, failAt, log)`, перехопіть `InvalidOperationException` **лише якщо його повідомлення містить "boom"** (фільтр винятку, `when`) і запишіть `"caught: <message>"`. У `finally` запишіть `"done"`. Поверніть лог.
3. **`Wrap(failAt)`** — викличте `Dive`, а якщо він кине виняток, обгорніть його: `throw new ApplicationException("wrapped", original)`. Викликач надрукує повідомлення й повідомлення внутрішнього винятку.

Стежте за порядком у першому рядку: блоки `finally` всіх трьох рівнів виконуються (від найглибшого) **раніше** за `catch` у `Run`.

Очікуваний вивід:

```
enter 1, enter 2, enter 3, leave 3, leave 2, leave 1, caught: boom at 3, done
enter 1, enter 2, enter 3, enter 4, enter 5, leave 5, leave 4, leave 3, leave 2, leave 1, done
wrapped <- boom at 2
```
