## Навіщо узагальнення

Узагальнення дозволяють написати тип чи метод один раз і використовувати його з будь-яким типом, **не втрачаючи типобезпечності і без пакування**.

```csharp
public class Box<T>
{
    public T Value { get; }
    public Box(T value) => Value = value;
}

var b = new Box<int>(5);     // Box<int> зберігає int напряму
int n = b.Value;             // без приведення, без пакування
```

Порівняйте з версією на `object`: кожен `int` пакувався б, а кожне читання вимагало б приведення, яке може впасти під час виконання.

## Узагальнені методи та виведення типів

```csharp
static void Swap<T>(ref T a, ref T b) { T t = a; a = b; b = t; }

int x = 1, y = 2;
Swap(ref x, ref y);          // T виведено як int
Swap<int>(ref x, ref y);     // або вказано явно
```

## default

`default(T)` (або просто `default`, коли тип зрозумілий) — це `null` для типів посилань і нуль для типів значень. Зручно для результату «не знайдено».

## Обмеження

| Обмеження | Означає |
| --- | --- |
| `where T : SomeBase` | T — це `SomeBase` або походить від нього |
| `where T : IComparable<T>` | T реалізує інтерфейс |
| `where T : class` / `class?` | T — тип посилання (non-nullable / nullable) |
| `where T : struct` | T — non-nullable тип значення |
| `where T : notnull` | T не nullable (C# 8) |
| `where T : unmanaged` | T — структура без посилань усередині (можна з вказівниками та `stackalloc`) |
| `where T : new()` | T має публічний конструктор без параметрів (має стояти останнім) |
| `where U : T` | «голе» обмеження: U походить від іншого параметра типу |

```csharp
static T Max<T>(T a, T b) where T : IComparable<T> => a.CompareTo(b) >= 0 ? a : b;

class Repository<TEntity, TKey>
    where TEntity : class, IEntity<TKey>, new()
    where TKey : IEquatable<TKey> { }
```

Обмеження дають компілятору дозвіл викликати члени T і захищають викликачів від використання типу, що не працюватиме.

## Узагальнені типи під час виконання

- **Кожен закритий тип — окремий тип.** `List<int>` і `List<string>` мають власні статичні поля і власний `typeof`.
- **Інстанціювання типами значень отримують власний машинний код** (без пакування, повністю спеціалізований). Інстанціювання типами посилань поділяють одну копію коду.
- На відміну від Java, узагальнення в .NET **не стираються**: `typeof(List<int>)` і рефлексія бачать справжній аргумент типу.

```csharp
class Counter<T> { public static int Instances; public Counter() => Instances++; }
new Counter<int>(); new Counter<int>(); new Counter<string>();
Console.WriteLine(Counter<int>.Instances);     // 2
Console.WriteLine(Counter<string>.Instances);  // 1
```

## Наслідування узагальнених типів

```csharp
class Stack<T> { }
class SpecialStack<T> : Stack<T> { }       // лишається відкритим
class IntStack : Stack<int> { }            // закриває параметр типу
class KeyedList<TKey, TValue> : List<TValue> { }   // додає новий
```

## Самопосилальні узагальнення

```csharp
interface IEquatable<T> { bool Equals(T other); }
class Money : IEquatable<Money> { public bool Equals(Money other) => /* ... */ true; }
```

## Що сказати на співбесіді

- Узагальнення дають типобезпечність і уникають пакування для типів значень.
- Обмеження дозволяють викликати члени T; `new()` дозволяє створювати T.
- Кожен закритий узагальнений тип має власні статичні поля; узагальнення в .NET матеріалізовані, а не стерті.
