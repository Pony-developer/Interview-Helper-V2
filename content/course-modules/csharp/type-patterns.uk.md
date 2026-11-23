Напишіть `Describe(object item)`, що повертає опис будь-якого об'єкта. Використайте **шаблони типів** з `is` (`item is Circle c`), які одразу перевіряють тип і дають типізовану змінну, замість `as` і приведень.

| Елемент | Опис |
|---|---|
| `null` | `nothing` |
| `Circle` з радіусом 0 | `a point` |
| будь-яке інше `Circle` | `circle with radius R` |
| `Rectangle` з рівними сторонами | `square with side W` |
| будь-який інший `Rectangle` | `rectangle W x H` |
| від'ємне `int` | `negative number` |
| будь-яке інше `int` | `number N` |
| `string` | `text of length L` |
| будь-що інше | `unknown: ` і назва його типу (`item.GetType().Name`) |

`Main` і класи не змінюйте. Очікуваний вивід:

```text
circle with radius 1
a point
square with side 2
rectangle 2 x 3
number 42
negative number
text of length 5
nothing
unknown: Double
```

Підказка: `if (item is Circle c)` істинне лише для `Circle`, що не дорівнює null, і всередині `if` змінна `c` уже має тип `Circle`. Дайте кожній змінній шаблону власну назву (`c`, `r`, `n`, `s`).

У сучасному C# (8 і новіших) той самий метод — один switch-вираз: `Circle { Radius: 0 } => "a point"`, `Circle c => ...`, `int n when n < 0 => ...`. Компілятор практик (Mono) поки не підтримує шаблонів у `switch`, тож тут ви використовуєте `is`.
