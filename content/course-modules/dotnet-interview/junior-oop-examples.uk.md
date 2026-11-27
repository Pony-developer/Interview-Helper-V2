Інтерв'юери рідко задовольняються самими визначеннями з підручника: «Наведіть приклад, бажано з власного досвіду» (П2). У цій лекції кожен принцип показано на невеликому фрагменті C#, який легко переказати.

## Інкапсуляція: захищаємо інваріант

```csharp
public class BankAccount
{
    private readonly List<string> _history = new();
    public decimal Balance { get; private set; }          // читати можна, змінювати ззовні — ні
    public IReadOnlyList<string> History => _history;     // ніхто ззовні не зробить Add()

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        if (amount > Balance) throw new InvalidOperationException("Insufficient funds");
        Balance -= amount;
        _history.Add($"-{amount}");
    }
}
```

Правило «баланс ніколи не стає від'ємним» живе рівно в одному місці. Без інкапсуляції кожен викликач мусив би його пам'ятати. Інкапсуляція — це не «зробити поля приватними й додати get/set до кожного»: публічний сетер на все — інкапсуляція лише за назвою.

## Успадкування: перевикористовуємо відношення «є»

```csharp
public class Employee
{
    public string Name { get; init; } = "";
    public virtual decimal MonthlyCost() => 3000m;
}

public class Manager : Employee
{
    public List<Employee> Reports { get; } = new();
    public override decimal MonthlyCost() => base.MonthlyCost() + 500m * Reports.Count;
}
```

Менеджер *є* працівником, і його можна використати всюди, де очікують `Employee`. Тривожні ознаки поганого успадкування: підклас кидає `NotSupportedException` для успадкованих членів або ієрархія глибша за 2–3 рівні. **Надавайте перевагу композиції** («має»), коли відношення не справжнє «є»: `Car` має `Engine`; `OrderService` має `IEmailSender`.

## Абстракція: залежимо від «що», а не «як»

```csharp
public interface IPaymentGateway
{
    Task<PaymentResult> ChargeAsync(decimal amount, string cardToken);
}

public class CheckoutService(IPaymentGateway gateway)
{
    public Task<PaymentResult> PayAsync(Order order) => gateway.ChargeAsync(order.Total, order.CardToken);
}
```

`CheckoutService` не знає, хто за інтерфейсом: Stripe, LiqPay чи тестова підробка. Абстракція ховає складність, інкапсуляція ховає дані — інтерв'юерам подобається, коли ви вмієте назвати різницю.

## Поліморфізм: один виклик, різна поведінка

```csharp
abstract class Shape { public abstract double Area(); }
class Circle(double r) : Shape { public override double Area() => Math.PI * r * r; }
class Rect(double w, double h) : Shape { public override double Area() => w * h; }

Shape[] shapes = { new Circle(1), new Rect(2, 3) };
double total = shapes.Sum(s => s.Area());   // потрібний Area() обирається під час виконання
```

- Поліморфізм **підтипів** (під час виконання): `virtual`/`override`, інтерфейси. Виклик іде через таблицю методів фактичного типу об'єкта.
- **Ad-hoc** (під час компіляції): перевантаження — `Print(int)` і `Print(string)` — та перевантаження операторів.
- **Параметричний**: generics — `List<T>` працює з будь-яким `T`.

Приклад із життя, який можна розповісти: «У нас був `switch` за типами документів у п'яти місцях. Я замінив його на `IDocumentExporter` для кожного типу; додати формат стало одним новим класом замість п'яти правок».

## Object і множинне успадкування

Кожен тип походить від `System.Object` і успадковує `ToString()`, `Equals()`, `GetHashCode()`, `GetType()`, а також захищені `MemberwiseClone()` і `Finalize()`. C# дозволяє **один базовий клас** — це уникає «ромбоподібної проблеми» неоднозначних успадкованих реалізацій — але **багато інтерфейсів**. З C# 8 методи інтерфейсів за замовчуванням дають обмежену форму успадкування реалізації; коли два інтерфейси надають той самий член за замовчуванням, клас мусить реалізувати його явно.
