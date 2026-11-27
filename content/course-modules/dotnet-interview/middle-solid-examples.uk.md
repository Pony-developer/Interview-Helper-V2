На «Як ви розумієте SOLID?» (П56) найкраще відповідати прикладом «до/після» для кожної літери. Ось один наскрізний приклад: оформлення замовлення.

## S — єдина відповідальність

```csharp
// До: один клас, чотири причини для змін (правила цін, збереження, макет PDF, поштовий провайдер)
public class OrderProcessor
{
    public void Process(Order o) { /* порахувати суми, зберегти в SQL, згенерувати PDF, надіслати лист */ }
}

// Після: у кожного класу одна робота; OrderProcessor лише координує
public class OrderProcessor(IPricing pricing, IOrderRepository repo, IInvoiceRenderer invoices, INotifier notifier)
{
    public async Task ProcessAsync(Order o)
    {
        o.Total = pricing.Calculate(o);
        await repo.SaveAsync(o);
        await notifier.SendAsync(o.CustomerEmail, invoices.Render(o));
    }
}
```

## O — відкритість/закритість

```csharp
// До: кожна нова знижка змінює цей метод
decimal Discount(Order o) => o.Type switch { "vip" => 0.1m, "student" => 0.05m, _ => 0 };

// Після: нове правило — це новий клас
public interface IDiscountRule { decimal For(Order o); }
public class VipDiscount : IDiscountRule { public decimal For(Order o) => o.IsVip ? 0.1m : 0; }
public class Pricing(IEnumerable<IDiscountRule> rules)
{
    public decimal Discount(Order o) => rules.Max(r => r.For(o));
}
```

## L — підстановка Лісков

Підтип мусить дотримуватися контракту базового: без сильніших передумов, без слабших післяумов, без нових винятків. Класичні порушення: `Square : Rectangle`; `ReadOnlyCollection`, що кидає виняток на `Add`, коли його використовують як `ICollection<T>`; перевизначення, що ігнорує токен скасування або повертає null там, де база ніколи цього не робила. Перевірка: чи пройшли б усі модульні тести базового класу з підкласом?

## I — розділення інтерфейсів

```csharp
// До: клієнти, які лише читають, залежать від Delete і Save, а підробки мусять реалізувати все
public interface IRepository<T> { T Get(int id); IEnumerable<T> All(); void Save(T x); void Delete(int id); }

// Після
public interface IReader<T> { T Get(int id); IEnumerable<T> All(); }
public interface IWriter<T> { void Save(T x); void Delete(int id); }
```

## D — інверсія залежностей

```csharp
// До: бізнес-логіка залежить від деталей
public class ReportService { private readonly SqlConnection _db = new(...); private readonly SmtpClient _smtp = new(); }

// Після: залежить від абстракцій, якими сама володіє; деталі підключаються в composition root
public class ReportService(IReportData data, IEmailSender email) { ... }

builder.Services.AddScoped<IReportData, SqlReportData>();
builder.Services.AddSingleton<IEmailSender, SendGridEmailSender>();
```

DIP — принцип; **DI** (передача залежностей ззовні) — техніка; **DI-контейнер** — інструмент, що її автоматизує. DI можна робити й без контейнера («pure DI»).

## Чисті функції (П58)

```csharp
// Нечиста: читає годинник і статичне поле, пише в лог
decimal Price(Order o) { Log.Write("pricing"); return DateTime.Now.Hour < 9 ? o.Total * 0.9m : o.Total; }

// Чиста: усе потрібне приходить на вхід, відповідь — на вихід
static decimal Price(decimal total, TimeOnly at) => at.Hour < 9 ? total * 0.9m : total;
```

Чистий код легко тестувати (без моків), безпечно кешувати й запускати паралельно, про нього легко міркувати. Практична архітектура — **функціональне ядро, імперативна оболонка**: чиста логіка рішень усередині, I/O на краях.

## Зв'язність і зчеплення (П60)

- **Висока зв'язність**: усе в `OrderPricing` стосується цін. Низька — клас `Utils` із датами, рядками й HTTP-помічниками.
- **Низьке зчеплення**: `OrderService` знає `IPaymentGateway`, а не типи SDK Stripe; модулі спілкуються через невеликі стабільні контракти чи події.
- Ознаки сильного зчеплення: зміна в одному класі змушує міняти багато інших; клас не протестувати без запуску бази; циклічні посилання між проєктами.
