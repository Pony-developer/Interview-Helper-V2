## Завдання

Напишіть три методи розширення.

1. **`string.Truncate(int maxLength)`**: якщо текст довший за `maxLength`, обріжте його так, щоб результат **разом** із завершальним `"..."` мав рівно `maxLength` символів. Коротший текст повертається без змін. Для `null`-отримувача поверніть `null` (метод розширення можна викликати на null!). `maxLength < 3` кидає `ArgumentOutOfRangeException`.
2. **`IEnumerable<int>.MinMax()`** повертає іменований кортеж `(int Min, int Max)`, обчислений **за один прохід**. Порожня послідовність кидає `InvalidOperationException` з повідомленням `Sequence contains no elements`.
3. **`IEnumerable<int?>.AverageOrNull()`** повертає середнє не-null значень як `double?`, або `null`, коли їх немає.

Зверніть увагу, як `Main` деконструює кортеж (`var (min, max) = ...`), читає його за назвою (`range.Min`) і друкує цілим (`(7, 7)`).

Очікуваний результат:

```
Hello, ex...
short
(null)
min=-2 max=9
7..7 (7, 7)
Sequence contains no elements
4
no data
-1
```
