## Делегати крок за кроком (П21–22)

```csharp
delegate decimal PriceRule(decimal price);          // 1. оголошуємо тип делегата

static decimal Discount10(decimal p) => p * 0.9m;

PriceRule rule = Discount10;                         // 2. вказуємо на метод
rule += p => p - 5m;                                 // 3. multicast: додаємо лямбду
decimal result = rule(100m);                         // 4. виклик: виконаються обидва, результат ОСТАННЬОГО (95)
```

- Делегат — це об'єкт (походить від `System.MulticastDelegate` → `System.Delegate`), що зберігає цільовий об'єкт і метод.
- **Multicast**: `+=` додає до списку викликів, `-=` прибирає. Якщо є значення повернення, зберігається лише останній результат, тож multicast здебільшого використовують із `void` (події).
- **Вбудовані типи** покривають майже все: `Action`, `Action<T1..T16>` (void), `Func<T1..T16, TResult>`, `Predicate<T>` (= `Func<T, bool>`), `Comparison<T>`, `EventHandler<TEventArgs>`.
- **Чи відрізняється `Delegate` від `Action`?** `Delegate` — абстрактний базовий клас усіх делегатів: змінну цього типу не можна викликати з типізованими аргументами (лише `DynamicInvoke`). `Action` — один конкретний узагальнений тип делегата. Два типи делегатів з однаковою сигнатурою (`Action<int>` і ваш `delegate void Handler(int x)`) усе одно **різні типи** й не присвоюються один одному.

## Події: делегати із захистом

```csharp
public class Order
{
    public event EventHandler<OrderPaidEventArgs>? Paid;   // ззовні можна лише += / -=

    public void MarkPaid()
    {
        Status = OrderStatus.Paid;
        Paid?.Invoke(this, new OrderPaidEventArgs(Id));     // викликати може лише власник
    }
}
order.Paid += (s, e) => email.SendReceipt(e.OrderId);
```

Ключове слово `event` не дає зовнішньому коду викликати делегат чи замінити всіх підписників через `=`. Не забувайте відписуватися від довгоживучих видавців, інакше підписника не зможе зібрати GC (класичний витік).

## LINQ: оператори, які треба знати (П23)

```csharp
var orders = GetOrders();

orders.Where(o => o.Total > 100)                       // фільтр
      .Select(o => new { o.Id, o.Customer })           // проєкція
      .OrderBy(o => o.Customer).ThenByDescending(o => o.Id);

orders.GroupBy(o => o.Customer)
      .Select(g => new { Customer = g.Key, Count = g.Count(), Sum = g.Sum(o => o.Total) });

customers.Join(orders, c => c.Id, o => o.CustomerId, (c, o) => new { c.Name, o.Total });
orders.SelectMany(o => o.Lines);                       // «розплющення»
orders.Any(o => o.IsOverdue); orders.All(o => o.IsPaid);
orders.First(); orders.FirstOrDefault(); orders.Single(o => o.Id == 5);
orders.Skip(20).Take(10);                              // пагінація
orders.Select(o => o.Customer).Distinct();
orders.ToDictionary(o => o.Id); orders.ToLookup(o => o.Customer);
```

Синтаксис запитів компілюється в ті самі виклики методів:

```csharp
var adults = from p in people
             where p.Age >= 18
             orderby p.Name
             select p.Name;
```

LINQ працює з **будь-яким** `IEnumerable<T>` (масиви, списки, словники, файли через `File.ReadLines`, XML через LINQ to XML) і з `IQueryable<T>` (EF Core перетворює його на SQL). Знайте різницю між `First` (кидає виняток, якщо порожньо), `FirstOrDefault` (повертає default) і `Single` (кидає, якщо елемент не рівно один).

## Простори імен (П24)

```csharp
namespace Shop.Orders;                     // простір імен на рівні файлу (C# 10)
using Shop.Payments;                       // імпорт
using Json = System.Text.Json.JsonSerializer;   // псевдонім
global using System.Linq;                  // для всього проєкту (C# 10)
```

Домовленість: простір імен повторює структуру папок і починається з назви компанії чи продукту (`Contoso.Shop.Orders`). Простори імен не є межами доступу — для цього є `internal` і збірки.
