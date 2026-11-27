## Інтерфейси колекцій як драбина (П105–106)

```text
IEnumerable<T>            лише foreach (може бути лінивим, нескінченним чи запитом)
└── IReadOnlyCollection<T>   + Count
    └── IReadOnlyList<T>     + this[int] (читання)
ICollection<T>            + Count, Add, Remove, Contains, Clear
└── IList<T>              + this[int] (читання/запис), Insert, RemoveAt, IndexOf
```

- `T[]` реалізує `IList<T>`, але `Add` кидає `NotSupportedException` — розмір фіксований. Масиви трохи швидші за `List<T>` (без зайвої непрямості, перевірки меж можна прибрати) і підтримують багатовимірну та «зубчасту» форми.
- `List<T>` = масив + `Count` + зростання. Використовуйте, коли розмір змінюється.
- У сигнатурах методів **приймайте** найзагальніший потрібний тип (`IEnumerable<T>`, якщо лише перебираєте; `IReadOnlyList<T>`, якщо потрібен індекс), а **повертайте** конкретний чесний тип (`IReadOnlyList<T>`, `List<T>`). Повернення `IEnumerable<T>` з методу, що виконує запит, провокує багаторазовий перебір.

## Масиви в пам'яті (П104)

```csharp
int[] numbers = new int[1000];    // один об'єкт у купі: заголовок + довжина + 4000 байтів int-ів, суцільно
string[] names = new string[3];   // один об'єкт у купі з 3 посиланнями; кожен рядок — окремий об'єкт
int[,] grid = new int[3, 3];      // один прямокутний блок
int[][] jagged = new int[3][];    // масив із 3 посилань на окремі масиви
```

Усі масиви — об'єкти в купі, зокрема масиви примітивних типів; «масиву в стеку» не буває, крім `stackalloc` у `Span<T>`. Елементи-значення зберігаються безпосередньо в масиві, тому `int[]` дружній до кешу і тому `int[]` від 21 250 елементів (85 000 байтів) потрапляє в LOH.

## LinkedList&lt;T&gt; (П85)

```csharp
var list = new LinkedList<string>();
var node = list.AddLast("b");
list.AddFirst("a");
list.AddAfter(node, "c");    // O(1), бо вузол у нас є
list.Remove(node);           // O(1)
// немає list[2]: доступ за позицією проходить вузли, O(n)
```

Кожен елемент — окремий об'єкт `LinkedListNode<T>` з `Next`, `Previous`, `List` і `Value` — близько 48 байтів накладних витрат на елемент на 64 бітах, розкиданих у пам'яті. Добре для: LRU-кешів (словник вузлів + переміщення на початок), черг із видаленням із середини, зшивання списків. Погано майже для всього іншого.

## Індексатори (П86)

```csharp
public class Matrix
{
    private readonly double[] _data;
    public int Rows { get; }
    public int Cols { get; }
    public double this[int row, int col]
    {
        get => _data[row * Cols + col];
        set => _data[row * Cols + col] = value;
    }
}
public string this[string key] => _settings[key];   // індексатори приймають будь-який тип і перевантажуються
```

## Pull і push, синхронно й асинхронно (П107)

```csharp
// Pull, синхронно: споживач просить наступний елемент
foreach (var line in File.ReadLines("log.txt")) { … }

// Pull, асинхронно: просимо й чекаємо наступний елемент (рядки БД, сторінки API, потоки gRPC)
await foreach (var order in db.Orders.AsAsyncEnumerable()) { … }
async IAsyncEnumerable<Page> ReadAllAsync([EnumeratorCancellation] CancellationToken ct = default)
{
    string? next = "/api/items";
    while (next != null) { var page = await GetPageAsync(next, ct); yield return page; next = page.Next; }
}

// Push: джерело саме вирішує, коли приходять елементи (біржові котирування, сенсори, події UI)
IObservable<Tick> ticks = feed.Ticks;
using var sub = ticks.Where(t => t.Price > 100).Throttle(TimeSpan.FromSeconds(1)).Subscribe(t => Show(t));
```

`IObservable<T>`/`IObserver<T>` є в BCL; оператори дає **Rx.NET** (System.Reactive). `Channel<T>` — сучасна труба продюсер/споживач між цими двома світами.

## IEnumerable і IQueryable (П108)

```csharp
IQueryable<Order> q = db.Orders.Where(o => o.Total > 100);   // Expression<Func<Order,bool>>
// SQL: SELECT ... FROM Orders WHERE Total > 100

IEnumerable<Order> e = db.Orders.AsEnumerable().Where(o => o.Total > 100);   // Func<Order,bool>
// SQL: SELECT ... FROM Orders   — далі фільтрація в пам'яті
```

| | `IEnumerable<T>` | `IQueryable<T>` |
|---|---|---|
| Лямбди — це | делегати (скомпільований код) | дерева виразів (дані) |
| Виконується | у пам'яті, LINQ to Objects | провайдером (SQL, OData, Mongo…) |
| Можна викликати будь-який метод C# | так | лише ті, що перекладаються |
| Добре для | колекцій, уже наявних у пам'яті | побудови запитів до віддаленого джерела |

Репозиторій, що повертає `IQueryable<T>`, «протікає» деталями зберігання до викликачів (вони можуть скласти будь-який запит, можливо неперекладний чи повільний); повернення матеріалізованих результатів або конкретних методів-запитів зберігає контроль.
