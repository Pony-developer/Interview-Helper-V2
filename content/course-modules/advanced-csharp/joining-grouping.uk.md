## Join: внутрішнє з'єднання за ключами

```csharp
var orderInfo = orders.Join(
    customers,
    o => o.CustomerId,          // зовнішній ключ
    c => c.Id,                  // внутрішній ключ
    (o, c) => new { o.Id, c.Name });

// query-синтаксис
var orderInfo2 =
    from o in orders
    join c in customers on o.CustomerId equals c.Id
    select new { o.Id, c.Name };
```

- Збіг за **рівністю** ключів (`equals`, а не `==`; зовнішня послідовність зліва).
- Замовлення, чийого клієнта не існує, відкидаються: це **внутрішнє** з'єднання.
- У LINQ to Objects `Join` спершу будує lookup над внутрішньою послідовністю, тож це O(n + m), набагато краще за вкладений `Where` (O(n × m)).
- Складені ключі — через анонімні типи: `on new { o.Year, o.Region } equals new { s.Year, s.Region }`.

## GroupJoin: ієрархічне / ліве зовнішнє з'єднання

`GroupJoin` поєднує кожен зовнішній елемент із **послідовністю** відповідних внутрішніх, яка може бути порожньою:

```csharp
var perCustomer = customers.GroupJoin(
    orders,
    c => c.Id,
    o => o.CustomerId,
    (c, custOrders) => new { c.Name, Count = custOrders.Count(), Total = custOrders.Sum(o => o.Total) });

// query-синтаксис: join ... into
var perCustomer2 =
    from c in customers
    join o in orders on c.Id equals o.CustomerId into custOrders
    select new { c.Name, Count = custOrders.Count() };
```

Клієнти без замовлень з'являються з порожньою групою, тож це природне **ліве зовнішнє з'єднання**. Щоб сплющити його назад у рядки (по одному на замовлення, або один рядок з null), додайте `from o in custOrders.DefaultIfEmpty()`.

## Zip

```csharp
string[] names = { "a", "b", "c" };
int[] scores = { 90, 80 };
var paired = names.Zip(scores, (n, s) => $"{n}:{s}");   // a:90, b:80: зупиняється на коротшій
var triples = names.Zip(scores, new[] { true, false });  // .NET 6: кортежі з трьох
```

## GroupBy

```csharp
IEnumerable<IGrouping<string, Order>> byCity = orders.GroupBy(o => o.City);
foreach (var g in byCity)
{
    Console.WriteLine($"{g.Key}: {g.Count()} orders, {g.Sum(o => o.Total)}");
    foreach (var o in g) { /* замовлення цього міста */ }
}

// селектори елемента й результату
var namesByCity = customers.GroupBy(c => c.City, c => c.Name);
var stats = orders.GroupBy(o => o.Placed.Year, (year, os) => new { year, Total = os.Sum(o => o.Total) });

// складений ключ
var byYearMonth = orders.GroupBy(o => new { o.Placed.Year, o.Placed.Month });

// query-синтаксис
var q = from o in orders
        group o by o.City into g
        where g.Count() > 10
        orderby g.Key
        select new { City = g.Key, Count = g.Count() };
```

- Кожен `IGrouping<TKey, TElement>` — послідовність із `Key`.
- У LINQ to Objects групи виходять у порядку першої появи їхніх ключів; елементи зберігають порядок.
- `GroupBy` відкладений, але під час перелічення буферизує весь вхід.
- EF Core може перекласти `GroupBy` з наступними агрегатами (`Count`, `Sum`, ...) в SQL `GROUP BY`; повернення самих груп обчислюється в пам'яті (або не підтримується — залежно від версії).

## ToLookup

`ToLookup` — **негайний** `GroupBy`, що повертає індексований `ILookup<TKey, TElement>`:

```csharp
var ordersByCustomer = orders.ToLookup(o => o.CustomerId);
var annOrders = ordersByCustomer[1];        // порожня послідовність, якщо ключа немає: без винятку
```

## Що сказати на співбесіді

- `Join` = внутрішнє з'єднання, `GroupJoin` = ієрархічне / ліве зовнішнє; обидва O(n + m) у пам'яті.
- `GroupBy` дає `IGrouping`; агрегуйте їх через `Count`, `Sum` тощо.
- `ToLookup` — жадібна індексована версія `GroupBy`.
