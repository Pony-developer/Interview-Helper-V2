Питання 118 — як EF Core перетворює C# на SQL. Практичні уточнення — про те, як ним добре користуватися.

## Відстеження

```csharp
var order = await db.Orders.FirstAsync(o => o.Id == id);   // відстежується: зберігається знімок початкових значень
order.Status = OrderStatus.Paid;
await db.SaveChangesAsync();                                // DetectChanges → UPDATE Orders SET Status = … WHERE Id = …

var list = await db.Orders.AsNoTracking().Where(…).ToListAsync();   // лише читання: швидше, менше пам'яті
```

`DbContext` — це **одиниця роботи** й мапа ідентичності: один екземпляр сутності на ключ у межах контексту. Тримайте його короткоживучим (один на запит — він зареєстрований як scoped) і ніколи не діліть між потоками.

## Завантаження пов'язаних даних

```csharp
// Жадібне завантаження
var orders = await db.Orders.Include(o => o.Lines).ThenInclude(l => l.Product).ToListAsync();

// Проєкція: завантажити лише те, що потрібно екрану — часто найкращий варіант
var rows = await db.Orders
    .Where(o => o.CustomerId == customerId)
    .Select(o => new OrderRow(o.Id, o.CreatedAt, o.Lines.Sum(l => l.Quantity * l.Price)))
    .ToListAsync();

// Кілька колекцій одразу: уникаємо декартового вибуху
var customers = await db.Customers.Include(c => c.Orders).Include(c => c.Addresses).AsSplitQuery().ToListAsync();
```

Ліниве завантаження (проксі) вимкнене за замовчуванням не без причини: воно непомітно створює **N+1 запитів**. Увімкніть логування SQL (`LogTo(Console.WriteLine)` або `Microsoft.EntityFrameworkCore.Database.Command` на рівні Information), щоб бачити, що EF насправді надсилає.

## Транзакції

- Один `SaveChanges()` атомарний: усі зміни в одній транзакції.
- Кілька `SaveChanges()` чи сирий SQL в одній одиниці: `await using var tx = await db.Database.BeginTransactionAsync(); … await tx.CommitAsync();`.
- З увімкненими повторами (`EnableRetryOnFailure`) загортайте ручні транзакції в `db.Database.CreateExecutionStrategy().ExecuteAsync(...)`.
- Конкурентність: колонка `[Timestamp] byte[] RowVersion` (SQL Server) або `uint xmin` (PostgreSQL) змушує оновлення перевіряти версію → `DbUpdateConcurrencyException`, який треба обробити (перечитати й повторити або показати користувачу конфлікт).

## Масові операції (EF Core 7+)

```csharp
await db.Orders.Where(o => o.CreatedAt < cutoff).ExecuteDeleteAsync();
await db.Products.Where(p => p.CategoryId == 3).ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, p => p.Price * 1.1m));
```

Одна SQL-інструкція, жодних завантажених сутностей, жодного відстеження змін — і `SaveChanges` не потрібен.

## Міграції

```text
dotnet ef migrations add AddOrderStatus           # C#-міграція з різниці моделей
dotnet ef migrations script --idempotent -o migrate.sql
dotnet ef migrations bundle                       # самодостатній виконуваний файл для CI/CD
```

Переглядайте згенерований SQL (перейменована властивість може стати drop + add column = втрата даних). Застосовуйте міграції окремим кроком розгортання, а не з кожного екземпляра застосунку під час старту. Робіть зміни схеми зворотно сумісними (розширити → мігрувати дані → звузити), щоб стара й нова версії застосунку могли працювати поруч під час поступового розгортання.

## Сирий SQL і продуктивність

```csharp
var top = await db.Products.FromSql($"SELECT * FROM products WHERE price > {min}").ToListAsync();   // параметризовано
var count = await db.Database.SqlQuery<int>($"SELECT count(*) AS \"Value\" FROM orders").SingleAsync();
```

Інші інструменти: скомпільовані запити (`EF.CompileAsyncQuery`) для гарячих шляхів, пул `DbContext` (`AddDbContextPool`), Dapper для звітних запитів на читання поруч з EF для записів.

## Паралелізм із базою даних

`DbContext` не потокобезпечний: щоб виконувати запити паралельно, давайте кожній задачі власний контекст з `IDbContextFactory<T>`. Обмежуйте паралелізм (`Parallel.ForEachAsync` з `MaxDegreeOfParallelism` або `SemaphoreSlim`) — справжні межі встановлюють пул з'єднань (за замовчуванням 100) і сама база.
