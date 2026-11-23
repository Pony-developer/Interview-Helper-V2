Сервіс інколи падає з `TransientException`: тимчасова проблема, що може зникнути при наступній спробі. Напишіть `Retry(Func<string> action, int maxAttempts)`:

- він викликає `action` і повертає його результат;
- якщо `action` кидає `TransientException` і це **не** остання спроба, він друкує `  retrying` і пробує знову;
- на останній спробі `TransientException` іде вгору до викликаючого без змін (не обгорнутий і не кинутий повторно через `throw ex`);
- будь-який інший виняток іде вгору одразу, без повторів;
- після **кожної** спроби, хоч би чим вона закінчилася, він друкує `  attempt N finished`.

Для умови повтору використайте фільтр винятку (`catch ... when (...)`), а для рядка після кожної спроби — блок `finally`. `Main` і класи не змінюйте. Очікуваний вивід:

```text
Service A:
  call 1
  retrying
  attempt 1 finished
  call 2
  retrying
  attempt 2 finished
  call 3
  attempt 3 finished
ok after 3 calls
Service B:
  call 1
  retrying
  attempt 1 finished
  call 2
  retrying
  attempt 2 finished
  call 3
  attempt 3 finished
gave up: Temporary failure on attempt 3
Service C:
  attempt 1 finished
not retried: broken
```

Зверніть увагу на порядок: блок `catch` виконується перед `finally`, а `finally` виконується навіть тоді, коли метод повертає значення або виняток залишає метод.

Підказка: цикл `for (int attempt = 1; ; attempt++)` з `return action();` усередині `try` закінчується лише через `return` або виняток.
