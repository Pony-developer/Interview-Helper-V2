Цих трьох немає в оригінальній книжці GoF, але ви зустрінете їх у кожному .NET-бекенді й майже на кожній співбесіді.

## Dependency Injection (DI, впровадження залежностей)

**Простими словами:** клас **не створює те, що йому потрібно**; він **отримує це ззовні**, зазвичай через конструктор.

Картинка з життя: кухар не вирощує овочі й не кує ножі. Ресторан *надає* продукти й інструменти, а кухар просто готує. Змініть постачальника — кухар і не помітить.

```csharp
// Без DI: клас сам вибирає свої залежності, і замінити їх не можна
class InvoiceService
{
    private readonly SqlInvoiceRepository repository = new SqlInvoiceRepository();
    private readonly SmtpEmailSender email = new SmtpEmailSender();
}

// З DI: залежності приходять через конструктор як інтерфейси
class InvoiceService
{
    private readonly IInvoiceRepository repository;
    private readonly IEmailSender email;

    public InvoiceService(IInvoiceRepository repository, IEmailSender email)
    {
        this.repository = repository;
        this.email = email;
    }
}

// В ASP.NET Core DI-контейнер будує весь граф за вас
builder.Services.AddScoped<IInvoiceRepository, SqlInvoiceRepository>();
builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<InvoiceService>();
```

Що це дає:

- **Тестованість:** у модульному тесті ви передаєте підроблений `IEmailSender` і перевіряєте, що його викликали, не надсилаючи справжніх листів.
- **Видимі залежності:** конструктор каже все, що потрібно класу.
- **Змінні частини:** сьогодні SMTP, завтра SendGrid — один рядок у реєстрації.

Три життєві цикли, які треба знати: **Singleton** (один на застосунок), **Scoped** (один на запит), **Transient** (новий щоразу). Класична помилка: singleton, що тримає scoped-сервіс («полонена залежність»), наприклад singleton, який тримає один `DbContext` для всіх запитів.

## Repository (Репозиторій)

**Простими словами:** репозиторій виглядає як **колекція об'єктів у пам'яті** (`GetById`, `Add`, `Find`) і приховує, *як* дані насправді зберігаються й запитуються.

```csharp
interface IAccountRepository
{
    Account GetById(Guid id);
    IEnumerable<Account> GetActiveByCity(string city);
    void Add(Account account);
}
```

Бізнес-код просить «активні акаунти в Києві» й не знає, чи це SQL, FetchXML у Dataverse чи тестовий список. А ще подробиці запитів зібрано в одному місці, а не розкидано кодом.

Обережно з **узагальненим репозиторієм** поверх Entity Framework (`IRepository<T>` з `GetAll()`): `DbContext` уже є репозиторієм і unit of work, а тонка узагальнена обгортка часто лише ховає корисні можливості.

## Unit of Work (Одиниця роботи)

**Простими словами:** зібрати всі зміни однієї бізнес-операції й **зберегти їх разом: усе або нічого**.

Картинка з життя: кошик у магазині. Ви кладете й виймаєте товари, але нічого не оплачено, поки не натиснете «Оформити», і тоді оплачується все одразу.

```csharp
using (var uow = new UnitOfWork())
{
    uow.Orders.Add(order);
    uow.Stock.Reserve(order.Items);
    uow.Commit();                      // одна транзакція: або збережено обидва, або жодного
}
```

В EF `DbContext` *і є* unit of work: він відстежує зміни, а `SaveChanges()` записує їх однією транзакцією. У Dynamics 365 ту саму роль для пакета запитів відіграє `ExecuteTransactionRequest`.

## Запам'ятайте

DI = «**отримуй, а не створюй**». Repository = «**доступ до даних, що виглядає як колекція**». Unit of Work = «**зберегти все разом або нічого**».
