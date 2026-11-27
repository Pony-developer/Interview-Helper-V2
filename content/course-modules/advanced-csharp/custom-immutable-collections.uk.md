## Налаштовувані колекції: Collection<T>

Методи `List<T>` не віртуальні, тож перехопити `Add` не вийде. `System.Collections.ObjectModel.Collection<T>` обгортає список і відкриває **захищені віртуальні гачки**:

```csharp
public class TagCollection : Collection<string>
{
    protected override void InsertItem(int index, string item)
    {
        if (string.IsNullOrWhiteSpace(item)) throw new ArgumentException("Empty tag");
        base.InsertItem(index, item.Trim().ToLowerInvariant());
    }
    protected override void SetItem(int index, string item) { /* теж перевірити */ base.SetItem(index, item); }
    protected override void RemoveItem(int index) { /* аудит */ base.RemoveItem(index); }
    protected override void ClearItems() { base.ClearItems(); }
}
```

`Add`, `Insert`, сеттер індексатора, `Remove` і `Clear` — усі проходять через ці чотири методи. `ObservableCollection<T>` (для прив'язування даних у WPF/MAUI) побудована саме так і викликає з них `CollectionChanged`.

## KeyedCollection<TKey, TItem>

Колекція, що є і списком, **і** словником, де ключ береться із самого елемента:

```csharp
public class Customers : KeyedCollection<string, Customer>
{
    public Customers() : base(StringComparer.OrdinalIgnoreCase) { }
    protected override string GetKeyForItem(Customer c) => c.Email;
}

var all = new Customers { ann, bob };
var a = all["ANN@shop.test"];    // за ключем
var first = all[0];              // за індексом, у порядку вставки
```

## Обгортки лише для читання

```csharp
private readonly List<Order> _orders = new();
public ReadOnlyCollection<Order> Orders => _orders.AsReadOnly();
```

`ReadOnlyCollection<T>` і `ReadOnlyDictionary<K,V>` — **представлення**: викликачі не можуть їх змінювати, але власник може, і викликачі бачать зміни. Вони захищають ваші інваріанти без копіювання.

## Незмінні колекції

`System.Collections.Immutable` дає колекції, що **ніколи не змінюються** після створення:

```csharp
ImmutableList<int> a = ImmutableList.Create(1, 2, 3);
ImmutableList<int> b = a.Add(4);       // повертає НОВИЙ список; a досі {1, 2, 3}

var builder = ImmutableDictionary.CreateBuilder<string, int>();   // ефективна масова побудова
builder.Add("x", 1); builder.Add("y", 2);
ImmutableDictionary<string, int> dict = builder.ToImmutable();
```

Як вони лишаються ефективними: більшість — **збалансовані дерева зі спільними частинами**, тож `Add` створює O(log n) нових вузлів і повторно використовує решту. Ціна: читання повільніше, ніж у `List<T>`/`Dictionary` (крім `ImmutableArray<T>` — простої обгортки над масивом зі швидким читанням, але O(n) «змінами»).

| Тип | Для чого |
| --- | --- |
| `ImmutableArray<T>` | невеликі дані, що рідко змінюються; найшвидше читання |
| `ImmutableList<T>` | списки, які часто «змінюють» і ділять між потоками |
| `ImmutableDictionary<K,V>` / `ImmutableHashSet<T>` | знімки довідкових даних |
| `FrozenDictionary`/`FrozenSet` (.NET 8) | будуються раз під час старту, читаються мільйони разів |

Переваги: **потокобезпечність без блокувань** (читач тримає знімок, що не може змінитися), безпечне спільне використання, просте скасування/історія і семантика значень усередині record.

## Підключення рівності та порядку

Більшість колекцій приймають `IEqualityComparer<T>` або `IComparer<T>`:

```csharp
var byEmail = new Dictionary<string, Customer>(StringComparer.OrdinalIgnoreCase);
var unique = new HashSet<Point>(new PointTolerantComparer(0.001));
var ordered = new SortedSet<Order>(Comparer<Order>.Create((a, b) => a.Placed.CompareTo(b.Placed)));

class PointTolerantComparer : IEqualityComparer<Point>
{
    private readonly double _eps;
    public PointTolerantComparer(double eps) => _eps = eps;
    public bool Equals(Point a, Point b) => Math.Abs(a.X - b.X) < _eps && Math.Abs(a.Y - b.Y) < _eps;
    public int GetHashCode(Point p) => 0;   // рівність із допуском не можна добре хешувати: коректно, але O(n)
}
```

Останній коментар — справжній урок: «приблизно рівні» не транзитивне, тож доброї хеш-функції мати не може.

## Що сказати на співбесіді

- Щоб перехоплювати зміни, наслідуйте `Collection<T>` (а не `List<T>`); `KeyedCollection` додає пошук за ключем.
- Обгортка лише для читання = представлення змінних даних; незмінна колекція = дані, що ніколи не зміняться.
- Незмінні колекції використовують спільні частини структури; чудові для конкурентності та знімків, повільніші на читання.
