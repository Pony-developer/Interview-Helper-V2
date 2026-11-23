Напишіть два методи, що повертають **кортежі**.

1. `Stats(int[] values)` повертає `(int Min, int Max, double Average)` масиву. Для порожнього масиву він кидає `ArgumentException` з повідомленням `The array is empty`.
2. `SplitName(string fullName)` повертає `(string First, string Last)`: частину до першого пробілу і частину після нього. Ім'я без пробілу має весь текст як `First` і порожній `Last`.

`Main` не змінюйте. Він читає результати обома способами: **деконструкцією** (`var (min, max, average) = ...`) і **назвами елементів** (`stats.Min`). Очікуваний вивід:

```text
4 42 18
7 7 7
Lovelace, Ada
[Plato] []
The array is empty
```

Підказка: кортеж створюють круглими дужками: `return (min, max, (double)sum / values.Length);`. Без приведення до `double` ділення було б цілочисельним.
