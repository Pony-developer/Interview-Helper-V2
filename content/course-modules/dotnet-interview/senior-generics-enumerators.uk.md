## Generics під час виконання (П141)

```csharp
class Cache<T> { public static int Hits; }
Cache<int>.Hits = 1;
Cache<string>.Hits = 2;
Cache<object>.Hits = 3;
// Три окремі закриті типи → три окремі статичні поля
```

- **Метадані** зберігають одне відкрите визначення (``Cache`1``). Рантайм створює тип (таблицю методів) для кожного закритого типу, який ви використовуєте.
- **Спільний код**: для аргументів — типів значень JIT генерує **спеціалізований нативний код** для кожного типу (`List<int>`, `List<Guid>`) — без упакування, а виклики через обмеження на кшталт `IComparable<T>` можна девіртуалізувати й вбудувати. Для аргументів — типів посилань одна спільна реалізація (`List<__Canon>`) обслуговує всіх; коли коду потрібен точний тип (`typeof(T)`, `new T()`, приведення), він шукає його через прихований **generic-словник**.
- **Обмеження** (`where T : class`, `struct`, `new()`, `notnull`, `unmanaged`, базовий клас, інтерфейси, `allows ref struct` у C# 13) перевіряються під час компіляції та завантаження типу.
- **Варіантність** є лише в інтерфейсів і делегатів: `IEnumerable<out T>` (коваріантний — `IEnumerable<string>` є `IEnumerable<object>`), `IComparer<in T>` (контраваріантний), `Func<in T, out TResult>`. Класи на кшталт `List<T>` інваріантні.
- На відміну від Java, стирання типів немає: `List<int>` справді зберігає `int`-и.

## Пишемо незмінний тип (П142)

```csharp
public sealed class Order                                     // sealed: без змінних підкласів
{
    public Guid Id { get; }
    public IReadOnlyList<OrderLine> Lines { get; }           // OrderLine теж незмінний
    public OrderStatus Status { get; }

    public Order(Guid id, IEnumerable<OrderLine> lines, OrderStatus status)
    {
        if (id == Guid.Empty) throw new ArgumentException("Empty id", nameof(id));
        Id = id;
        Lines = lines.ToImmutableArray();                    // захисна копія: викликачі не змінять її
        Status = status;
    }

    public Order WithLine(OrderLine line) => new(Id, Lines.Append(line), Status);   // «зміни» повертають нові об'єкти
    public Order Ship() => Status == OrderStatus.Paid ? new(Id, Lines, OrderStatus.Shipped)
                                                      : throw new InvalidOperationException();
}

// Або для типів-даних:
public sealed record OrderLine(string Sku, int Quantity, decimal Price);
var bigger = line with { Quantity = 5 };
```

Пастки: `with` для record створює **поверхневу** копію — властивість `List<T>` спільна для копій; `init`-сетери все ще можна задати ініціалізатором об'єкта (так задумано); рефлексія й серіалізатори можуть обійти `readonly`. Використовуйте `System.Collections.Immutable` (спільна структура — `ImmutableList.Add` перевикористовує більшу частину старого дерева) або `ImmutableArray` (обгортка масиву, дешеве читання, копія при зміні).

## IEnumerable&lt;T&gt; докладно (П143)

```csharp
foreach (var x in source) Console.WriteLine(x);
// компілюється в:
using (IEnumerator<T> e = source.GetEnumerator())    // за шаблоном: структурний енумератор, якщо є
{
    while (e.MoveNext())
    {
        var x = e.Current;
        Console.WriteLine(x);
    }
}   // Dispose виконується навіть після break/винятку → блоки finally в ітераторах спрацьовують
```

Власноруч написаний енумератор для власної колекції:

```csharp
public struct Enumerator : IEnumerator<T>
{
    private readonly ArrayStack<T> _stack;
    private readonly int _version;
    private int _index;
    internal Enumerator(ArrayStack<T> s) { _stack = s; _version = s._version; _index = s._size; }

    public bool MoveNext()
    {
        if (_version != _stack._version) throw new InvalidOperationException("Collection was modified");
        return --_index >= 0;
    }
    public T Current => _stack._items[_index];
    object? IEnumerator.Current => Current;
    public void Reset() => throw new NotSupportedException();
    public void Dispose() { }
}
```

- Кожен виклик `GetEnumerator()` починає незалежний курсор; `IEnumerable` можна перебирати багато разів (лінивий — щоразу перераховується).
- `List<T>.Enumerator` — **структура**, що повертається з публічного `GetEnumerator()`, тож `foreach` по змінній типу `List<T>` не виділяє пам'ять; через змінну `IEnumerable<T>` вона упаковується.
- Перевірка `_version` — причина, чому зміна списку всередині його `foreach` кидає виняток.
- Методи-ітератори (`yield`) генерують клас, що реалізує і `IEnumerable<T>`, і `IEnumerator<T>`; перший `GetEnumerator()` у потоці-творці повертає той самий об'єкт, щоб заощадити виділення.

## Stack і родичі (П144)

`Stack<T>`: масив + `_size` + `_version`. `Push` пише `_array[_size++]` і подвоює масив, коли той заповнений (амортизовано O(1)); `Pop` повертає `_array[--_size]` і очищає слот (для типів посилань), щоб GC міг зібрати об'єкт; перебір іде від вершини. `Queue<T>`: кільцевий буфер з індексами `_head` і `_tail`, що «загортаються». `PriorityQueue<TElement, TPriority>`: мін-купа на масиві з четвірковим (4-ary) розгалуженням. `SortedSet`/`SortedDictionary`: червоно-чорні дерева. `LinkedList`: кільцевий двозв'язний список. `Dictionary`/`HashSet`: масиви кошиків і записів із ланцюжками за індексом.

## Інтерфейс + абстрактний клас і конструктори структур (П146–147)

Шаблон «інтерфейс для споживачів, абстрактна база для реалізацій» трапляється всюди в BCL і в добрих бібліотеках: `IHostedService` + `BackgroundService`, `IComparer<T>` + `Comparer<T>`, `IList<T>` + `Collection<T>`, `IValidator<T>` + `AbstractValidator<T>` (FluentValidation). Споживачі залежать від малого контракту (легко підробити); реалізації отримують «обв'язку» безкоштовно, але все одно можуть реалізувати інтерфейс з нуля.

Конструктори структур: `new S[1000]` і `default(S)` дають обнулену пам'ять без виконання будь-якого коду, тож історично C# не дозволяв оголосити конструктор структури без параметрів, який виконувався б лише в деяких випадках. C# 10 його дозволяє (і ініціалізатори полів), але пам'ятайте: елементи масивів, `default`, неініціалізовані поля й `Activator.CreateInstance` на деяких рантаймах однаково дають нульове значення. Проєктуйте структури так, щоб нуль був коректним станом (`default(TimeSpan)` — `00:00:00`, `default(Guid)` — `Guid.Empty`).
