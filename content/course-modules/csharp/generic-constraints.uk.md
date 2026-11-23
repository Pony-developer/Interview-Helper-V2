Без обмежень компілятор нічого не знає про `T`. Усередині узагальненого методу можна робити лише те, що працює для **будь-якого** типу: присвоювати, порівнювати з `null`, викликати методи `object`. **Обмеження** (`where`) обіцяє більше про `T`, а натомість дозволяє більше використовувати.

```csharp
static T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) >= 0 ? a : b;   // CompareTo дозволено лише завдяки обмеженню
}

Max(3, 7);          // 7
Max("pear", "fig"); // "pear"
Max(new object(), new object()); // помилка компіляції: object не є IComparable<object>
```

## Види обмежень

| Обмеження | Означає |
|---|---|
| `where T : class` | `T` — посилальний тип |
| `where T : struct` | `T` — значущий тип, що не допускає null |
| `where T : new()` | `T` має публічний конструктор без параметрів, тож `new T()` працює |
| `where T : Animal` | `T` — це `Animal` або його нащадок |
| `where T : IComparable<T>` | `T` реалізує інтерфейс |
| `where T : U` | `T` — це `U` або його нащадок, де `U` — інший параметр типу |
| `where T : unmanaged` | `T` — структура без посилань усередині (C# 7.3) |
| `where T : notnull` | `T` — не nullable-тип (C# 8) |

Кілька обмежень одного параметра пишуть через кому. `class` або `struct` іде першим, `new()` — останнім:

```csharp
interface IEntity { int Id { get; set; } }

class Repository<T> where T : class, IEntity, new()
{
    private readonly Dictionary<int, T> items = new Dictionary<int, T>();

    public T GetOrCreate(int id)
    {
        T item;
        if (!items.TryGetValue(id, out item))
        {
            item = new T { Id = id };   // дозволено завдяки new() та IEntity
            items[id] = item;
        }
        return item;
    }
}
```

Кожен параметр типу має власний `where`:

```csharp
static TValue GetOrAdd<TKey, TValue>(Dictionary<TKey, TValue> map, TKey key)
    where TKey : notnull
    where TValue : new()
```

## Чому не просто `object` чи інтерфейс?

Можна написати `Max(IComparable a, IComparable b)`. Але тоді:

- значущий тип, як-от `int`, **пакується** (boxing) на кожному виклику;
- результат має тип `IComparable`, і викликаючий мусить приводити його назад;
- ніщо не перевіряє, що `a` і `b` одного типу, тож `Max(3, "pear")` компілюється і падає під час виконання.

Узагальнена версія зберігає точний тип, перевіряє його під час компіляції і не пакує.

## Правило

Додавайте **найменше** обмеження, з яким код компілюється. Кожне обмеження звужує коло тих, хто може викликати метод, тож не додавайте `class` чи `new()` «про всяк випадок».
