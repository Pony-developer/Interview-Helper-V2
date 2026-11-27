## Завдання

Побудуйте два комбінатори задач поверх `Task.WhenAny`.

1. **`WithTimeout<T>(task, ms)`**: змагання задачі з `Task.Delay(ms)`. Якщо перемогла затримка, киньте `TimeoutException("Timed out after <ms> ms")`; інакше поверніть `await task` (очікування ще й кидає її виняток, якщо вона впала).
2. **`FirstSuccessful<T>(params Func<Task<T>>[] sources)`**: запустіть **усі** джерела одразу, потім повторюйте `await Task.WhenAny(pending)`:
   - якщо завершена задача успішна (`Status == TaskStatus.RanToCompletion`), поверніть її результат;
   - якщо вона впала, запам'ятайте її виняток (`task.Exception.InnerException`), приберіть її зі списку очікуваних і чекайте далі;
   - якщо впали всі задачі, киньте `AggregateException` з усіма запам'ятованими винятками.

У прикладі дзеркало 1 падає першим (10 мс), дзеркало 3 успішне на 60 мс, раніше за дзеркало 2 (200 мс).

Очікуваний результат:

```
fast
Timed out after 50 ms
mirror 3
all failed: 2
```
