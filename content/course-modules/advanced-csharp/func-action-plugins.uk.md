## Func і Action

BCL визначає узагальнені делегати для всіх поширених форм, тож власні оголошувати доводиться рідко:

| Делегат | Сигнатура | Приклад |
| --- | --- | --- |
| `Action` | `void ()` | `Action save = () => db.Save();` |
| `Action<T1, ..., T16>` | `void (T1, ...)` | `Action<string> print = Console.WriteLine;` |
| `Func<TResult>` | `TResult ()` | `Func<DateTime> now = () => DateTime.UtcNow;` |
| `Func<T1, ..., T16, TResult>` | `TResult (T1, ...)` | `Func<int, int, int> add = (a, b) => a + b;` |
| `Predicate<T>` | `bool (T)` | використовують `List<T>.Find`, `Array.Exists` |
| `Comparison<T>` | `int (T, T)` | використовує `List<T>.Sort` |

Останній параметр типу `Func` — завжди тип результату.

Винятки з правила: `Func` і `Action` не можуть виразити параметри `ref`/`out`/`in` чи вказівники. Для цього оголосіть власний делегат.

## Методи-плагіни з Func

```csharp
static IEnumerable<T> Where<T>(IEnumerable<T> source, Func<T, bool> predicate)
{
    foreach (var item in source)
        if (predicate(item)) yield return item;
}

var adults = Where(people, p => p.Age >= 18);
```

Саме так побудований LINQ.

## Сумісність делегатів

### Різні типи делегатів не змішуються

Два типи делегатів з однаковою сигнатурою — все одно **різні типи**:

```csharp
delegate void D1();
delegate void D2();

D1 d1 = Method;
D2 d2 = d1;              // помилка
D2 d3 = new D2(d1);      // ок: обгорнути
```

### Рівність

Делегати рівні, якщо вказують на ті самі методи, на тих самих цілях, у тому самому порядку:

```csharp
Action a = Foo, b = Foo;
Console.WriteLine(a == b);   // True
```

### Варіантність параметрів і результату

Коли **метод** присвоюють делегату, метод може бути загальнішим за делегат:

```csharp
static string GetName() => "Ann";
static void Print(object o) => Console.WriteLine(o);

Func<object> f = GetName;      // коваріантність результату: string — це object
Action<string> a = Print;      // контраваріантність параметра: Print приймає будь-який object
```

А оскільки `Func<out TResult>` і `Action<in T>` оголошують варіантність, перетворюються й **екземпляри** делегатів:

```csharp
Func<string> fs = () => "x";
Func<object> fo = fs;          // ок

Action<object> ao = o => { };
Action<string> as2 = ao;       // ок
```

Ось чому стандартна сигнатура події `EventHandler<TEventArgs>` може приймати обробник, написаний для базового `EventArgs`.

## Що сказати на співбесіді

- `Func<..., TResult>` повертає значення, `Action<...>` — void, `Predicate<T>` — bool.
- Однакова сигнатура ≠ однаковий тип делегата.
- Методи із загальнішими параметрами чи конкретнішим типом результату сумісні з делегатом.
