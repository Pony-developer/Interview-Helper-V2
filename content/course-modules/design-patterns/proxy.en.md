**In plain words:** a proxy is a **stand-in** for the real object. It has the same interface, but it **controls access** to the real thing: creates it only when needed, checks permissions, or forwards calls to another machine.

## A picture from life

A bank card is a proxy for your bank account. You pay with the card as if it were money, but the card checks the PIN and the limit, and only then reaches the real account.

## Kinds of proxies

| Kind | What it does | Example |
| --- | --- | --- |
| **Virtual** (lazy) | Creates the expensive real object only on first use | Loading a big image or a record's related data on demand |
| **Protection** | Checks permissions before letting the call through | "Only admins may delete" |
| **Remote** | Looks local, but sends the call over the network | A generated client for a web service, a WCF/gRPC client |
| **Caching** | Remembers results | (overlaps with a caching decorator) |

## In C#

```csharp
interface IDocumentStore
{
    void Delete(Guid id);
}

class DocumentStore : IDocumentStore
{
    public void Delete(Guid id) { /* really deletes */ }
}

class SecureDocumentStore : IDocumentStore      // protection proxy
{
    private readonly IDocumentStore real;
    private readonly ICurrentUser user;

    public SecureDocumentStore(IDocumentStore real, ICurrentUser user) { this.real = real; this.user = user; }

    public void Delete(Guid id)
    {
        if (!user.IsInRole("Admin")) throw new UnauthorizedAccessException("Only admins can delete documents");
        real.Delete(id);
    }
}
```

And the lazy kind, which .NET gives you ready-made: `Lazy<T>` creates the object only on the first `.Value`.

## Where you already see it

- Entity Framework **lazy-loading proxies**: `order.Customer` is loaded from the database the first time you touch it.
- Generated **service clients** (`IOrganizationService` talking to Dataverse over HTTP from your console app is a remote proxy).
- Mocking libraries such as Moq and Castle DynamicProxy create proxy classes at runtime.

## Proxy vs Decorator

Both wrap an object with the same interface, so the code looks almost the same. The difference is the **intent**: a decorator **adds features** and is stacked by the client; a proxy **controls access** to the real object and often decides itself when (or whether) to create or call it.

## Remember

Proxy = "a stand-in that decides how and when the real object is reached".
