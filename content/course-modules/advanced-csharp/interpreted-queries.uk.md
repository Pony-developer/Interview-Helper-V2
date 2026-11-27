## Локальні та інтерпретовані запити

| | Локальні запити | Інтерпретовані запити |
| --- | --- | --- |
| Тип джерела | `IEnumerable<T>` | `IQueryable<T>` |
| Оператори з | `System.Linq.Enumerable` | `System.Linq.Queryable` |
| Лямбди стають | делегатами (`Func<...>`), скомпільованим IL | **деревами виразів** (`Expression<Func<...>>`), даними |
| Хто їх виконує | ваш процес, елемент за елементом | **провайдер**, що перекладає дерево (наприклад, EF Core → SQL) |

```csharp
IQueryable<Customer> query = db.Customers
    .Where(c => c.Name.StartsWith("A"))
    .OrderBy(c => c.Name)
    .Take(10);
// EF Core надсилає приблизно таке:
// SELECT TOP(10) ... FROM Customers WHERE Name LIKE N'A%' ORDER BY Name
```

Код C# в обох випадках однаковий; змінюється **статичний тип** джерела, від якого залежить, чи обере компілятор `Enumerable.Where(Func)`, чи `Queryable.Where(Expression<Func>)`.

## Як це працює

`IQueryable<T>` містить `Expression` (запит на цей момент) і `IQueryProvider`. Кожен оператор `Queryable` нічого не виконує; він будує більше дерево виразів: `Call(Where, source, Lambda(...))`. Коли ви перелічуєте чи викликаєте `ToList()`, `Count()`, `First()`..., провайдер проходить дерево, перекладає його, надсилає до бази й матеріалізує результати.

## Що не перекладається

Провайдер розуміє фіксований набір операторів і методів. Виклик власного методу C# у лямбді зазвичай не вдається:

```csharp
db.Customers.Where(c => IsVip(c)).ToList();
// InvalidOperationException: The LINQ expression ... could not be translated.
```

EF Core 3.0+ кидає виняток, а не тихо виконує фільтр у пам'яті (що раніше завантажувало цілі таблиці). Варіанти:

- переписати умову перекладними виразами;
- спершу зробити частину в базі, а потім перейти на LINQ to Objects:

```csharp
var result = db.Customers
    .Where(c => c.Country == "UA")          // виконується в SQL
    .AsEnumerable()                          // далі: LINQ to Objects
    .Where(c => IsVip(c))                    // виконується в .NET
    .ToList();
```

`AsEnumerable()` лише змінює статичний тип на `IEnumerable<T>`, тож наступні оператори зв'язуються з `Enumerable`. Ставте його **після** якомога більшої фільтрації в SQL.

## Особливості EF Core, які варто знати

- **Відстеження**: сутності, повернуті запитами, відстежуються для виявлення змін. Для запитів лише на читання беріть `AsNoTracking()`; проєкції в DTO не відстежуються.
- **Завантаження пов'язаних даних**: `Include(o => o.Lines)` (жадібне), явне `Entry(x).Collection(...).Load()` чи ліниві проксі (стережіться проблеми N+1).
- **Розділені запити**: `AsSplitQuery()` уникає декартового вибуху, коли включають кілька колекцій.
- **Async**: `ToListAsync`, `FirstOrDefaultAsync`, `CountAsync` звільняють потік, поки працює база.
- **Сирий SQL**: `FromSqlInterpolated($"... {param}")` безпечно параметризує значення; ніколи не склеюйте введення користувача з SQL.
- **Скомпільовані запити**: `EF.CompileAsyncQuery(...)` пропускає переклад у гарячих місцях.

## Проблема N+1

```csharp
foreach (var order in db.Orders.ToList())       // 1 запит
    Console.WriteLine(order.Customer.Name);     // + 1 запит на кожне замовлення при лінивому завантаженні
```

Виправлення: `Include(o => o.Customer)` або, ще краще, проєкція: `db.Orders.Select(o => new { o.Id, o.Customer.Name })`.

## Що сказати на співбесіді

- `IQueryable` + дерева виразів + провайдер = запити, перекладені іншою мовою.
- Статичний тип джерела обирає оператори `Enumerable` або `Queryable`.
- Не кожен метод C# перекладається; спершу фільтруйте в SQL, потім `AsEnumerable()` для решти.
- Знайте `AsNoTracking`, `Include`, проєкцію та проблему N+1.
