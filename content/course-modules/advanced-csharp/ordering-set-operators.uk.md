## Впорядкування

```csharp
var sorted = people
    .OrderBy(p => p.LastName)                     // основний ключ
    .ThenBy(p => p.FirstName)                     // розв'язання нічиїх
    .ThenByDescending(p => p.BirthDate);          // друге розв'язання нічиїх

var caseless = names.OrderBy(n => n, StringComparer.OrdinalIgnoreCase);
var reversed = items.Reverse();
var natural = numbers.Order();                    // .NET 7: впорядкувати за самим елементом
```

- `OrderBy` повертає `IOrderedEnumerable<T>`, саме це робить доступним `ThenBy`.
- Подвійний виклик `OrderBy` **відкидає** перше впорядкування; для другорядних ключів беріть `ThenBy`.
- Впорядкування в LINQ **стабільне**: рівні ключі зберігають відносний порядок (на відміну від `List.Sort`).
- Воно відкладене, але під час перелічення буферизує все й сортує за O(n log n).

Query-синтаксис: `orderby p.LastName, p.FirstName, p.BirthDate descending`.

## Оператори множин

| Оператор | Результат (для `{1,2,3}` і `{3,4}`) |
| --- | --- |
| `Concat` | `1,2,3,3,4`: усе, дублікати лишаються |
| `Union` | `1,2,3,4`: усе, дублікати прибрано |
| `Intersect` | `3`: є в обох |
| `Except` | `1,2`: є в першій, але не в другій |

```csharp
var allTags = postA.Tags.Union(postB.Tags, StringComparer.OrdinalIgnoreCase);
var newUsers = imported.ExceptBy(existing.Select(u => u.Email), u => u.Email);   // варіанти «By» з .NET 6
var common = a.IntersectBy(b.Select(x => x.Id), x => x.Id);
```

- Вони використовують компаратор рівності за замовчуванням (або переданий) і всередині — хеш-множину: O(n + m).
- `Union`, `Intersect` і `Except` повертають **унікальні** результати.
- Вони працюють з послідовностями одного типу; варіанти `By` (.NET 6) порівнюють за ключем.

## SequenceEqual

```csharp
bool same = first.SequenceEqual(second);   // ті самі елементи в тому самому порядку
```

## Chunk (.NET 6)

```csharp
foreach (int[] batch in ids.Chunk(100))
    await SendBatchAsync(batch);           // обробка групами по 100; остання може бути меншою
```

## MinBy / MaxBy (.NET 6)

```csharp
var cheapest = products.MinBy(p => p.Price);     // сам елемент, а не лише ціна
var newest = orders.MaxBy(o => o.Placed);
```

До .NET 6 писали `OrderBy(...).First()`, що сортує все (O(n log n)) заради одного елемента; `MinBy` — один прохід за O(n).

## Що сказати на співбесіді

- `OrderBy` + `ThenBy` для сортування за кількома ключами; сортування в LINQ стабільне.
- `Concat` зберігає дублікати; `Union`/`Intersect`/`Except` повертають унікальні результати.
- .NET 6 додав `DistinctBy`, `UnionBy`, `ExceptBy`, `IntersectBy`, `MinBy`, `MaxBy` і `Chunk`.
