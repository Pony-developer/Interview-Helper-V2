## Оператори елементів

| Оператор | Порожня послідовність | Більше одного збігу |
| --- | --- | --- |
| `First()` / `Last()` | кидає виняток | повертає перший / останній |
| `FirstOrDefault()` / `LastOrDefault()` | `default` (або ваше значення, .NET 6) | повертає перший / останній |
| `Single()` | кидає виняток | **кидає виняток** |
| `SingleOrDefault()` | `default` | **кидає виняток** |
| `ElementAt(i)` / `ElementAtOrDefault(i)` | кидає виняток / `default` | |

```csharp
var admin = users.First(u => u.IsAdmin);
var byEmail = users.SingleOrDefault(u => u.Email == email);   // стверджує, що email унікальні
var fallback = prices.FirstOrDefault(p => p > 100, defaultValue: -1);   // .NET 6
```

Обирайте свідомо: `Single` документує й забезпечує «має бути рівно один». `First` у запиті до бази додає `TOP(1)`; `Single` — `TOP(2)`, щоб виявити дублікати.

Обережно: `FirstOrDefault` на послідовності типу значення повертає `0`/`false`, а це може бути законне значення. Беріть перевантаження з `defaultValue` або спершу перевірте `Any`.

## Агрегація

```csharp
int count = orders.Count(o => o.Paid);
long big = hugeSequence.LongCount();
decimal total = lines.Sum(l => l.Qty * l.Price);
double avg = ratings.Average();
var cheapest = prices.Min();
var latest = orders.Max(o => o.Placed);
```

- `Min`, `Max`, `Average` кидають виняток на **порожній** послідовності non-nullable типу; `Sum` повертає 0. Спроєктуйте в nullable (`Max(o => (decimal?)o.Total)`), щоб отримати `null`.
- `Count()` використовує `ICollection<T>.Count`, коли він є (O(1)); інакше перелічує все.
- `TryGetNonEnumeratedCount` (.NET 6) підкаже, чи підрахунок дешевий.

### Aggregate: загальна згортка

```csharp
int product = numbers.Aggregate(1, (acc, n) => acc * n);              // зерно + акумулятор
string csv = words.Aggregate((a, b) => a + "," + b);                 // без зерна: починає з першого елемента
var stats = numbers.Aggregate(
    seed: (Min: int.MaxValue, Max: int.MinValue),
    func: (acc, n) => (Math.Min(acc.Min, n), Math.Max(acc.Max, n)),
    resultSelector: acc => $"{acc.Min}..{acc.Max}");
```

`Aggregate` може виразити будь-яку редукцію. Перекласти його в SQL не можна, тож з EF Core використовуйте його після матеріалізації.

## Квантифікатори

```csharp
bool anyOverdue = invoices.Any(i => i.DueDate < today);
bool allPaid = invoices.All(i => i.Paid);              // true для порожньої послідовності!
bool hasPen = products.Select(p => p.Name).Contains("Pen");
```

Беріть `Any()`, а не `Count() > 0`: він зупиняється на першому елементі (і стає `EXISTS` у SQL).

## Генерація

```csharp
Enumerable.Range(1, 5);              // 1 2 3 4 5
Enumerable.Repeat("-", 3);           // - - -
Enumerable.Empty<Order>();           // закешована порожня послідовність
items.DefaultIfEmpty(fallback);      // послідовність або один запасний елемент, якщо порожньо
```

## Перетворення

| Оператор | Результат |
| --- | --- |
| `ToList`, `ToArray` | матеріалізовані копії (негайно) |
| `ToDictionary(key, value?)` | кидає виняток на дублікатах ключів |
| `ToHashSet()` | множина унікальних (.NET Core 2.0+) |
| `ToLookup(key)` | словник «один до багатьох» |
| `AsEnumerable()` | змінює статичний тип на `IEnumerable<T>` (перемикає з SQL на пам'ять) |
| `AsQueryable()` | обгортає локальну послідовність як `IQueryable<T>` |
| `Cast<T>()` | приводить кожен елемент; кидає виняток на невідповідності |
| `OfType<T>()` | лишає лише елементи типу T |

`Cast` і `OfType` переважно для неузагальнених колекцій (`ArrayList`, `DataRowCollection`) і щоб вибрати підтип зі змішаного списку: `shapes.OfType<Circle>()`.

## Що сказати на співбесіді

- `First` проти `Single`: другий гарантує унікальність. Варіанти `OrDefault` не кидають на порожньому.
- `Min`/`Max`/`Average` кидають на порожньому; `Sum` і `Count` — ні.
- `Any()` кращий за `Count() > 0`; `All` дає true для порожньої послідовності.
