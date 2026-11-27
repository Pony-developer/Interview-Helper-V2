These three aren't in the original GoF book, but you'll meet them in every .NET backend and in almost every interview.

## Dependency Injection (DI)

**In plain words:** a class **doesn't create the things it needs**; it **receives them from outside**, usually through its constructor.

A picture from life: a chef doesn't grow vegetables or forge knives. The restaurant *provides* the ingredients and tools, and the chef just cooks. Change the supplier, and the chef doesn't notice.

```csharp
// Without DI: the class picks its own dependencies, and you can't swap them
class InvoiceService
{
    private readonly SqlInvoiceRepository repository = new SqlInvoiceRepository();
    private readonly SmtpEmailSender email = new SmtpEmailSender();
}

// With DI: dependencies come in through the constructor, as interfaces
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

// In ASP.NET Core, a DI container builds the whole graph for you
builder.Services.AddScoped<IInvoiceRepository, SqlInvoiceRepository>();
builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<InvoiceService>();
```

What you get:

- **Testability:** in a unit test you pass a fake `IEmailSender` and check that it was called, without sending real emails.
- **Visible dependencies:** the constructor tells you everything the class needs.
- **Swappable parts:** SMTP today, SendGrid tomorrow, one line in the registration.

The three lifetimes to know: **Singleton** (one for the app), **Scoped** (one per request), **Transient** (a new one every time). A classic bug: a singleton holding a scoped service (a "captive dependency"), for example a singleton that keeps one `DbContext` for every request.

## Repository

**In plain words:** a repository looks like **a collection of objects in memory** (`GetById`, `Add`, `Find`), and hides *how* the data is actually stored and queried.

```csharp
interface IAccountRepository
{
    Account GetById(Guid id);
    IEnumerable<Account> GetActiveByCity(string city);
    void Add(Account account);
}
```

The business code asks for "active accounts in Kyiv" and doesn't know whether that's SQL, Dataverse FetchXML or a test list. It also keeps query details in one place instead of scattered over the code.

Be careful with a **generic repository** wrapped around Entity Framework (`IRepository<T>` with `GetAll()`): `DbContext` is already a repository and a unit of work, and a thin generic wrapper often only hides useful features.

## Unit of Work

**In plain words:** collect all the changes of one business operation and **save them together, all or nothing**.

A picture from life: a shopping cart. You put things in and take them out, but nothing is paid until you press "Checkout", and then everything is paid at once.

```csharp
using (var uow = new UnitOfWork())
{
    uow.Orders.Add(order);
    uow.Stock.Reserve(order.Items);
    uow.Commit();                      // one transaction: either both are saved or neither
}
```

In EF, `DbContext` *is* the unit of work: it tracks changes, and `SaveChanges()` writes them in one transaction. In Dynamics 365, `ExecuteTransactionRequest` plays the same role for a batch of requests.

## Remember

DI = "**get, don't create**". Repository = "**data access that looks like a collection**". Unit of Work = "**save everything together or nothing**".
