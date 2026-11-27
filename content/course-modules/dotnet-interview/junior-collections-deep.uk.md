## Як росте List&lt;T&gt; (П33)

`List<T>` обгортає масив. Коли він заповнений, `Add` виділяє новий масив **подвоєної** місткості й копіює все. Більшість викликів `Add` — O(1); рідкісне збільшення — O(n); у середньому це **амортизовано O(1)**.

```csharp
var list = new List<int>();        // місткість 0
list.Add(1);                       // місткість 4
// ... 5-й Add → місткість 8, 9-й → 16, ...
var sized = new List<int>(10_000); // задайте розмір, коли знаєте кількість: жодних збільшень
```

`Insert(0, x)` і `RemoveAt(0)` зсувають кожен елемент: O(n). `Contains`/`IndexOf` сканують: O(n). Якщо часто шукаєте елементи за значенням, потрібна множина чи словник.

## HashSet і Dictionary (П33)

```csharp
var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
if (!seen.Add(email)) Console.WriteLine("duplicate");       // Add повертає false, якщо вже є

var stock = new Dictionary<string, int>();
stock["apple"] = 10;                                          // додати або перезаписати
stock.TryAdd("pear", 5);                                      // додати лише якщо немає
if (stock.TryGetValue("plum", out var qty)) { /* знайдено */ }   // без винятку, коли немає
stock["apple"] += 1;
foreach (var (name, count) in stock) Console.WriteLine($"{name}: {count}");
```

Обидва — хеш-таблиці: у середньому O(1) для додавання, пошуку й видалення. `GetHashCode` ключа обирає кошик; `Equals` розв'язує колізії — тож ключі не повинні змінюватися, поки лежать у колекції. Операції над множинами: `UnionWith`, `IntersectWith`, `ExceptWith`, `IsSubsetOf`. Жоден не зберігає сортування — для цього є `SortedSet` / `SortedDictionary` (O(log n)).

## Як обрати колекцію (П34)

| Вам потрібно… | Використовуйте |
|---|---|
| Фіксована кількість елементів, максимальна швидкість | `T[]` |
| Упорядкований список із додаванням і доступом за індексом | `List<T>` |
| Швидке «чи є?» / унікальність | `HashSet<T>` |
| Пошук за ключем | `Dictionary<TKey, TValue>` |
| Сортування за ключем | `SortedDictionary` / `SortedList` |
| Обробка FIFO | `Queue<T>` |
| LIFO (скасування, DFS, розбір дужок) | `Stack<T>` |
| Завжди брати найменший / найвищий пріоритет | `PriorityQueue<T, TPriority>` |
| Багато потоків одночасно | `ConcurrentDictionary`, `ConcurrentQueue`, `Channel<T>` |
| Не змінюється після створення | `ImmutableArray`, `FrozenDictionary` (.NET 8) |
| Віддати лише для читання | повертайте `IReadOnlyList<T>` / `IReadOnlyDictionary` |

## yield return докладно (П35)

```csharp
static IEnumerable<int> ReadNumbers(string path)
{
    Console.WriteLine("opening");
    foreach (var line in File.ReadLines(path))
    {
        if (line.StartsWith("#")) continue;
        yield return int.Parse(line);          // пауза тут, віддаємо одне значення
    }
    Console.WriteLine("closing");
}

var first3 = ReadNumbers("data.txt").Take(3).ToList();
```

- Під час виклику `ReadNumbers(...)` нічого не виконується; тіло стартує на першому `MoveNext()`.
- Виконання призупиняється на кожному `yield return` і продовжується з того самого місця на наступному `MoveNext()`.
- З `Take(3)` перебір зупиняється раніше: «closing» не надрукується, але `foreach` по файлу коректно звільниться (`Dispose` виконує незавершені блоки `finally`).
- Дворазовий перебір результату виконує метод двічі.
- `yield break` завершує послідовність. Ітератори не можуть мати параметрів `ref`/`out`, а перевірки аргументів виконуються пізно (ліниво) — розділіть метод, якщо потрібна негайна перевірка.
- `IAsyncEnumerable<T>` + `await foreach` — асинхронна версія (потокове читання рядків із бази чи сторінок з API).
