## Завдання

Питання 31: «Що таке generics і які проблеми вони розв'язують?» Один узагальнений клас може обслуговувати товари, клієнтів і замовлення з повною типобезпекою — без приведень і дубльованого коду. Обмеження кажуть компілятору, що вміє `T`.

Допишіть **`InMemoryRepository<T> where T : class, IEntity`** — `IEntity` дає доступ до `Id`, а `class` дозволяє повертати `null`:

1. **`Save(entity)`** — якщо `Id` дорівнює 0, присвойте наступний id (1, 2, 3, …); якщо такий id уже збережено, замініть збережену сутність; будь-який інший id → `KeyNotFoundException`. Поверніть сутність.
2. **`Find(id)`** — сутність або `null`.
3. **`Where(predicate)`** — сутності, що підходять, упорядковані за `Id`.
4. **`Delete(id)`** — `true`, якщо щось видалено.

І узагальнений метод з обмеженням на інший параметр типу:

5. **`Seq.MaxBy<T, TKey>(items, key) where TKey : IComparable<TKey>`** — елемент з найбільшим ключем через `CompareTo`; `InvalidOperationException` для порожньої послідовності. (У .NET 6 є `Enumerable.MaxBy`; тут ви пишете його самі.)

Очікуваний вивід:

```
no product 99
#2 Mouse Pro 29.90
7 not found
#1 Keyboard 49.90; #2 Mouse Pro 29.90
True False
#3 Monitor 289.00
#2 bob@shop.ua
banana
empty
```
