## Ієрархія

```
IEnumerable<T>                  обхід лише вперед
 └ IReadOnlyCollection<T>       + Count
    └ IReadOnlyList<T>          + індексатор лише для читання
 └ ICollection<T>               + Count, Add, Remove, Contains, Clear, CopyTo, IsReadOnly
    ├ IList<T>                  + індексатор, IndexOf, Insert, RemoveAt
    ├ ISet<T>                   + UnionWith, IntersectWith, IsSubsetOf, ...
    └ IDictionary<TKey,TValue>  + індексатор за ключем, ContainsKey, TryGetValue, Keys, Values
IReadOnlyDictionary<TKey,TValue>
```

Кожен рівень додає можливостей. Є й неузагальнені версії (`IEnumerable`, `ICollection`, `IList`, `IDictionary`) з .NET 1.0, що працюють з `object` і пакують типи значень; трапляються вони лише в старих API.

## Який інтерфейс приймати й повертати?

Приймайте **найслабший** інтерфейс, що дає потрібне; повертайте **найкорисніший**, за який готові ручатися.

```csharp
// Лише обходить: приймаємо IEnumerable<T>
public decimal Total(IEnumerable<OrderLine> lines) => lines.Sum(l => l.Price);

// Потрібні Count чи індексація: приймаємо IReadOnlyList<T>
public OrderLine Median(IReadOnlyList<OrderLine> lines) => lines[lines.Count / 2];

// Повертаємо знімок, який викликачі не мають змінювати
public IReadOnlyList<Order> RecentOrders() => _orders.TakeLast(10).ToList();
```

Чому б не приймати всюди `IEnumerable<T>`? Бо якщо метод перелічує вхід **двічі** (раз для `Count()`, раз у циклі), лінивий запит виконається двічі. Вимога `IReadOnlyCollection<T>` чітко каже викликачу передати щось матеріалізоване.

## ICollection<T> проти IReadOnlyCollection<T>

Дивно, але `ICollection<T>` не походить від `IReadOnlyCollection<T>` (інтерфейси лише для читання з'явилися пізніше, у .NET 4.5). Більшість класів BCL реалізують обидва, тож `List<T>` можна передати як будь-який з них.

`ICollection<T>.IsReadOnly` існує, бо деякі реалізації (масиви, `ReadOnlyCollection<T>`) реалізують інтерфейс, але кидають `NotSupportedException` з `Add`. Інтерфейси лише для читання уникають цієї незграбності, просто не маючи `Add`.

## Масиви реалізують IList<T>

`int[]` реалізує `IList<int>` і `IReadOnlyList<int>`. Його `Add` та `Insert` кидають винятки, бо масиви мають фіксований розмір; сеттер індексатора працює.

## Контракти перелічення

- Зміна колекції під час перелічення (додавання чи видалення елементів) робить енумератор недійсним; наступний `MoveNext` кидає `InvalidOperationException`. Зберіть зміни й застосуйте після, або йдіть по списку `for` у зворотному напрямку.
- Енумератори колекцій BCL — **структури** (`List<T>.Enumerator`), тому `foreach` по `List<T>` нічого не алокує, а `foreach` по тому самому списку, типізованому як `IEnumerable<T>`, пакує енумератор.

## Вибір колекції: коротка таблиця

| Потреба | Тип | Ключові операції |
| --- | --- | --- |
| Впорядковані елементи, доступ за індексом | `List<T>` | індекс O(1), додавання в кінець у середньому O(1), вставка/видалення в середині O(n) |
| Швидкий пошук за ключем | `Dictionary<K,V>` | у середньому O(1) |
| Унікальні елементи, перевірка належності | `HashSet<T>` | у середньому O(1) |
| Відсортовано за ключем | `SortedDictionary<K,V>` / `SortedSet<T>` | O(log n) |
| FIFO / LIFO | `Queue<T>` / `Stack<T>` | O(1) |
| Обробка за пріоритетом | `PriorityQueue<T,P>` (.NET 6) | O(log n) |
| Часті вставки в середину, коли вузол уже під рукою | `LinkedList<T>` | O(1) на вузлі, O(n) щоб його знайти |
| Спільний доступ із кількох потоків | `ConcurrentDictionary`, `ConcurrentQueue`, ... | без блокувань / дрібнозернисті |

## Що сказати на співбесіді

- Приймайте найслабший потрібний інтерфейс; у публічних API віддавайте перевагу `IReadOnly*`.
- Не перелічуйте параметр `IEnumerable<T>` двічі.
- Знайте Big-O основних операцій `List`, `Dictionary`, `HashSet` і сортованих колекцій.
