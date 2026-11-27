**In plain words:** an adapter is a **translator between two interfaces** that don't fit each other. Your code keeps talking its own language, and the adapter converts each call into the language of the other side.

## A picture from life

A travel plug adapter. Your laptop has a European plug, the hotel in London has British sockets. You don't rewire the laptop or the wall: you put an adapter in between.

## The problem

Your shop code works with `IPayment.Pay(decimal amount)`. A new provider's SDK, which you can't change, offers `Charge(long cents, string currencyCode)`. Editing every place that pays to call the new SDK would spread the provider's details all over the code.

## In C#

```csharp
// What our code expects
interface IPayment
{
    bool Pay(decimal amount);
}

// Someone else's SDK: we can't change it
class StripeLikeClient
{
    public string Charge(long cents, string currencyCode) { /* ... */ return "succeeded"; }
}

// The adapter: implements OUR interface and calls THEIR API
class StripeLikePaymentAdapter : IPayment
{
    private readonly StripeLikeClient client;

    public StripeLikePaymentAdapter(StripeLikeClient client) { this.client = client; }

    public bool Pay(decimal amount)
    {
        var status = client.Charge((long)(amount * 100), "UAH");
        return status == "succeeded";
    }
}

IPayment payment = new StripeLikePaymentAdapter(new StripeLikeClient());
payment.Pay(199.99m);
```

## Where you already see it

- Wrapping an old SOAP or legacy service behind a clean interface for new code.
- In integrations: converting an external system's JSON into your own entities (for example into Dataverse `Entity` objects).
- `StreamReader` adapts a byte `Stream` into something that reads text.

## When to use it, and when not to

- **Fits:** you must use a class with the "wrong" interface and can't (or shouldn't) change it: third-party SDKs, legacy code.
- **Overkill:** you own both sides, so just make them match.

## Remember

Adapter **changes the interface** so two existing things can work together. (Decorator and Proxy, by contrast, keep the same interface.)
