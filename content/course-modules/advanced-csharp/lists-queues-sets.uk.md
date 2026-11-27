## List<T>: робоча конячка

`List<T>` обгортає масив. Коли той заповнюється, список виділяє масив **удвічі більший** і копіює елементи, тож `Add` у середньому O(1).

```csharp
var list = new List<int>(capacity: 1000);   // задайте розмір наперед, коли кількість відома
list.Add(5); list.AddRange(new[] { 6, 7 });
list.Insert(0, 4);                          // O(n): зсуває все праворуч
list.RemoveAt(list.Count - 1);              // O(1) у кінці
list.RemoveAll(x => x % 2 == 0);            // O(n), за один прохід
int i = list.BinarySearch(6);               // на відсортованому списку
list.Sort(); list.Reverse();
list.TrimExcess();                          // звільнити невикористану місткість
var span = CollectionsMarshal.AsSpan(list); // .NET 5: прямий доступ до внутрішнього масиву
```

Видалення елементів у циклі: ідіть **назад** через `for` або використовуйте `RemoveAll`. Виклик `Remove` усередині `foreach` кидає виняток.

## LinkedList<T>

Двозв'язний список із `LinkedListNode<T>`. Додавання чи видалення **на відомому вузлі** — O(1); пошук вузла — O(n). Кожен вузол — окремий об'єкт, тож пам'яті йде більше, і для кешу процесора це незручно. Його ніша: коли ви тримаєте посилання на вузли, як у LRU-кеші.

```csharp
var ll = new LinkedList<string>();
LinkedListNode<string> node = ll.AddLast("b");
ll.AddBefore(node, "a"); ll.AddAfter(node, "c");
ll.Remove(node);                     // O(1), маючи вузол
```

## Queue<T> і Stack<T>

```csharp
var queue = new Queue<Job>();        // FIFO: першим прийшов — першим вийшов
queue.Enqueue(job);
Job next = queue.Dequeue();          // кидає виняток, коли порожньо
if (queue.TryDequeue(out var j)) { } // .NET Core 2.0+

var stack = new Stack<string>();     // LIFO: останнім прийшов — першим вийшов
stack.Push("a"); stack.Push("b");
string top = stack.Pop();            // "b"
stack.TryPeek(out var peek);
```

Обидві побудовані на (кільцевому) масиві й мають O(1) для основних операцій. Типові застосування: BFS (черга), DFS та історія скасувань (стек), розбір дужок (стек).

## PriorityQueue<TElement, TPriority> (.NET 6)

```csharp
var pq = new PriorityQueue<string, int>();
pq.Enqueue("low", 5);
pq.Enqueue("urgent", 1);
pq.Enqueue("normal", 3);
while (pq.TryDequeue(out var item, out var priority))
    Console.WriteLine($"{priority}: {item}");   // 1: urgent, 3: normal, 5: low
```

Двійкова (насправді 4-арна) купа: O(log n) для вставки й видалення, першим іде **найменший** пріоритет. FIFO серед однакових пріоритетів не гарантовано, і змінити пріоритет на місці не можна. Чудово для алгоритму Дейкстри, планувальників, задач top-K.

## HashSet<T> і SortedSet<T>

```csharp
var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
bool added = seen.Add("Kyiv");        // false, якщо вже є
seen.Contains("kyiv");                // true, O(1)

var a = new HashSet<int> { 1, 2, 3 };
a.IntersectWith(new[] { 2, 3, 4 });   // a = {2, 3}
a.UnionWith(new[] { 9 });             // {2, 3, 9}
a.ExceptWith(new[] { 2 });            // {3, 9}
a.IsSubsetOf(new[] { 1, 3, 9 });      // true

var sorted = new SortedSet<int> { 5, 1, 3 };   // червоно-чорне дерево, впорядковане
sorted.Min; sorted.Max;
sorted.GetViewBetween(2, 4);          // {3}
```

`HashSet<T>` нічого не обіцяє щодо порядку. Операції над множинами **змінюють множину на місці**; для нових послідовностей беріть `Intersect`/`Union` з LINQ.

## BitArray

Компактний масив `bool` (по 1 біту) з `And`, `Or`, `Xor`, `Not`. Корисний для великих наборів прапорців чи фільтрів Блума.

## Що сказати на співбесіді

- `List<T>`: O(1) індексація й додавання в кінець; O(n) вставка на початок.
- `LinkedList<T>` виграє лише тоді, коли ви тримаєте посилання на вузли.
- `Queue`/`Stack` — O(1); `PriorityQueue` — O(log n), першим найменший пріоритет.
- Операції над множинами `HashSet<T>` змінюють саму множину.
