## Завдання

Питання 135: «Що таке дерево виразів?» Збудуйте його власноруч — так працюють динамічні фільтри в адмінських таблицях, OData та конструктори звітів, а те саме дерево можна передати в EF Core, щоб воно стало SQL.

Допишіть **`FilterBuilder.Build<T>(conditions)`**, щоб він повертав `x => cond1 && cond2 && …`:

1. Створіть параметр: `Expression.Parameter(typeof(T), "x")`.
2. Почніть з `Expression.Constant(true)` (тож порожній список означає «все»).
3. Для кожної умови:
   - член: `Expression.Property(x, c.Property)`;
   - значення, перетворене на тип властивості: `Expression.Constant(Convert.ChangeType(c.Value, member.Type), member.Type)` — саме тому `5` працює для властивості `decimal`;
   - перевірка за оператором: `"=="` → `Expression.Equal`, `">"` → `Expression.GreaterThan`, `"<"` → `Expression.LessThan`, `"contains"` → `Expression.Call(member, typeof(string).GetMethod("Contains", new[] { typeof(string) }), value)`;
   - будь-який інший оператор → `NotSupportedException`;
   - поєднання: `body = Expression.AndAlso(body, test)`.
4. Поверніть `Expression.Lambda<Func<T, bool>>(body, x)`.

`Show` компілює дерево в делегат через `.Compile()` і фільтрує список у пам'яті.

Очікуваний вивід:

```
[C# in Depth, Clean Code, Refactoring, Mouse Pro, Keyboard Pro, USB cable]
[Clean Code, Refactoring]
[Mouse Pro]
[USB cable]
NotSupportedException
```
