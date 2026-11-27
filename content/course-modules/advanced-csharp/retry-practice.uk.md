## Завдання

Реалізуйте **`Retry.Run<T>(Func<int, T> action, int maxAttempts)`**. Він викликає `action(attempt)` з номерами спроб 1, 2, 3, ... і повертає перший успішний результат.

- **`TransientException`** означає «спробуй ще». Надрукуйте `attempt N failed: <message>` і повторіть, **якщо тільки** це не була спроба номер `maxAttempts`: тоді виняток має дійти до викликача без змін.
- Будь-який **інший** виняток іде далі одразу, без повторів і без друку.

Використайте **фільтр винятків**: `catch (TransientException e) when (attempt < maxAttempts)`. Коли фільтр хибний, виняток тут просто не перехоплюється, тож `throw;` взагалі не потрібен.

Очікуваний результат:

```
attempt 1 failed: timeout #1
attempt 2 failed: timeout #2
ok on attempt 3
attempt 1 failed: still down
gave up: still down
not retried: bad input
```
