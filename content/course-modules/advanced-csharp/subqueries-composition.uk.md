## Підзапити

Підзапит — запит усередині лямбди іншого запиту:

```csharp
// клієнти, чиє найбільше замовлення понад 1000
var vip = customers.Where(c => c.Orders.Max(o => o.Total) > 1000);

// імена найменшої довжини (підзапит обчислюється... скільки разів?)
var shortest = names.Where(n => n.Length == names.Min(x => x.Length));
```

У LINQ to Objects внутрішній `names.Min(...)` виконується **для кожного зовнішнього елемента**: O(n²). Винесіть його, коли він не залежить від зовнішнього елемента:

```csharp
int min = names.Min(n => n.Length);
var shortest = names.Where(n => n.Length == min);
```

В EF Core обидві версії стають одним SQL-запитом з підзапитом, і база даних його оптимізує.

## let: назвати проміжне значення

```csharp
var query =
    from p in products
    let margin = p.Price - p.Cost
    where margin > 10
    orderby margin descending
    select new { p.Name, Margin = margin };
```

`let` обчислює значення один раз для кожного елемента й тримає його в області видимості для наступних клауз. Компілятор реалізує це через `Select` в анонімний тип, що несе і елемент, і нове значення.

## into: продовжити після select чи group

```csharp
var query =
    from w in words
    select w.ToLower() into lower          // продовжити з новою змінною діапазону
    where lower.StartsWith("a")
    select lower;

var bigGroups =
    from o in orders
    group o by o.CustomerId into g         // продовжити з кожною групою
    where g.Count() > 5
    select new { Customer = g.Key, Count = g.Count() };
```

Після `into` попередні змінні діапазону **виходять з області видимості**: починається новий запит над результатами.

## Стратегії композиції

Три способи побудувати складний запит:

1. **Поступова** побудова: додавайте оператори крок за кроком, за потреби — умовно.

```csharp
IQueryable<Order> q = db.Orders;
if (from != null) q = q.Where(o => o.Placed >= from);
if (customerId != null) q = q.Where(o => o.CustomerId == customerId);
if (sortByTotal) q = q.OrderByDescending(o => o.Total);
var page = await q.Skip(skip).Take(20).ToListAsync();
```

Так пишуть екрани пошуку та фільтри в API.

2. Продовження через **`into`** в одному query-виразі.
3. **Обгортання**: один запит як джерело іншого (`from x in (from ... select ...) where ...`).

Усі три дають той самий ланцюжок операторів; обирайте те, що краще читається.

## Стратегії проєкції

```csharp
// в анонімний тип: локальне використання, перекладається й у SQL
select new { o.Id, o.Total }

// в іменований DTO з ініціалізатором об'єкта: коли форма даних виходить за межі методу
select new OrderSummary { Id = o.Id, Total = o.Total, Customer = o.Customer.Name }

// у кортеж (лише LINQ to Objects; EF Core не в усіх версіях перекладає літерали кортежів)
.Select(o => (o.Id, o.Total))
```

Проєкція **лише потрібних колонок** — один з найбільших виграшів продуктивності в EF Core: згенерований SQL вибирає менше колонок, а для DTO не налаштовується відстеження змін.

## Що сказати на співбесіді

- У LINQ to Objects стережіться підзапитів, що обчислюються для кожного елемента; виносьте незмінні частини.
- `let` дає назву значенню для кожного елемента; `into` перезапускає запит над результатами.
- Необов'язкові фільтри будуйте поступово; проєктуйте в DTO, щоб тягнути лише потрібне.
