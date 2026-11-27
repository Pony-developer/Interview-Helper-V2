## Фільтрація

| Оператор | Повертає |
| --- | --- |
| `Where(pred)` | елементи, для яких предикат істинний |
| `Where((item, index) => ...)` | те саме, з позицією елемента |
| `Take(n)` / `Skip(n)` | перші n / усі, крім перших n |
| `TakeLast(n)` / `SkipLast(n)` | останні n / усі, крім останніх n (.NET Core 2.0+) |
| `Take(2..5)` | діапазон елементів (.NET 6) |
| `TakeWhile(pred)` / `SkipWhile(pred)` | елементи до / після моменту, коли предикат уперше став хибним |
| `Distinct()` / `DistinctBy(key)` | елементи без дублікатів (`DistinctBy`: .NET 6) |

```csharp
var page = products.OrderBy(p => p.Name).Skip(pageIndex * 20).Take(20);   // посторінковість
var sorted = readings.SkipWhile(r => r < 0);          // відкинути лише початкові від'ємні
var uniqueEmails = users.DistinctBy(u => u.Email.ToLowerInvariant());
```

`TakeWhile`/`SkipWhile` дивляться на елементи **по порядку** і зупиняються на першій невідповідності; це не фільтри на кшталт `Where`.

В EF Core `Skip`/`Take` стають `OFFSET`/`FETCH` (чи `LIMIT`): завжди спершу `OrderBy`, інакше вміст сторінки невизначений.

## Проєкція через Select

```csharp
var names = customers.Select(c => c.Name);
var indexed = names.Select((name, i) => $"{i + 1}. {name}");
var dtos = orders.Select(o => new OrderDto(o.Id, o.Lines.Sum(l => l.Qty * l.Price)));
```

`Select` відображає кожен вхідний елемент **рівно в один** вихідний.

## Сплющування через SelectMany

Коли кожен елемент відображається в **послідовність**, `SelectMany` сплющує результат:

```csharp
string[] sentences = { "the quick fox", "jumps over" };
var words = sentences.SelectMany(s => s.Split(' '));        // the, quick, fox, jumps, over
var allLines = orders.SelectMany(o => o.Lines);              // кожен рядок кожного замовлення

// із селектором результату, що зберігає зовнішній елемент
var lineInfo = orders.SelectMany(o => o.Lines, (o, l) => new { o.Id, l.Product });
```

У query-синтаксисі друга клауза `from` — це `SelectMany`:

```csharp
var pairs =
    from o in orders
    from l in o.Lines
    where l.Qty > 5
    select new { o.Id, l.Product };
```

Так само пишуть **перехресне з'єднання** (усі комбінації), а з `DefaultIfEmpty` — зовнішнє:

```csharp
var grid = from x in Enumerable.Range(1, 3) from y in "ab" select $"{x}{y}";   // 1a 1b 2a 2b 3a 3b
```

## Select проти SelectMany наочно

```
Select:      [A, B]        → [f(A), f(B)]                       (2 → 2)
SelectMany:  [A, B]        → [a1, a2, b1]   де f(A)=[a1,a2]     (2 → 3)
```

В EF Core `SelectMany` по колекції навігації стає SQL-з'єднанням.

## Що сказати на співбесіді

- `Where` фільтрує будь-де; `TakeWhile`/`SkipWhile` зупиняються на першому невідповідному елементі.
- `Select` = один до одного; `SelectMany` = один до багатьох, сплющено.
- Посторінковість потребує стабільного `OrderBy` перед `Skip`/`Take`.
