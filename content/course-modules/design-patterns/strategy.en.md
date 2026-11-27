**In plain words:** Strategy puts **each way of doing a task into its own class** behind one interface. The main code holds "some strategy" and can swap it without changing itself.

## A picture from life

Getting to the airport: by taxi, by bus, by train. The goal is the same, the way differs, and you pick one depending on time and money. Your trip plan doesn't change, only the "how to get there" part.

## The problem

```csharp
int ShippingCost(string method, int weightKg)
{
    switch (method)
    {
        case "pickup": return 0;
        case "post": return 60 + 10 * weightKg;
        case "courier": return weightKg <= 5 ? 120 : 120 + 20 * (weightKg - 5);
        // a new method next month means editing this again...
    }
    throw new ArgumentException(method);
}
```

The switch grows, mixes unrelated rules in one method, and every new option means editing (and re-testing) old code.

## In C#

```csharp
interface IShippingStrategy
{
    int Cost(int weightKg);
}

class PickupShipping : IShippingStrategy { public int Cost(int weightKg) { return 0; } }
class PostShipping : IShippingStrategy { public int Cost(int weightKg) { return 60 + 10 * weightKg; } }

class Checkout
{
    private readonly IShippingStrategy shipping;

    public Checkout(IShippingStrategy shipping) { this.shipping = shipping; }

    public int Total(int itemsSum, int weightKg) { return itemsSum + shipping.Cost(weightKg); }
}

var total = new Checkout(new PostShipping()).Total(1500, 2);
```

Adding "drone delivery" is a new class. `Checkout` doesn't change at all.

## A lighter version: delegates

In C#, a strategy with one method is often just a `Func`:

```csharp
Func<int, int> post = weight => 60 + 10 * weight;
```

`List<T>.Sort(comparison)` and LINQ's `OrderBy(x => x.Name)` take strategies exactly like this.

## Where you already see it

- `IComparer<T>` passed to `Sort`, `IEqualityComparer<T>` passed to a `Dictionary`.
- Pricing rules, tax rules per country, different authentication schemes in ASP.NET Core.

## When to use it, and when not to

- **Fits:** several interchangeable ways to do the same thing, chosen by data or configuration, that keep growing.
- **Overkill:** two options that will never change. An `if` is fine.

## Remember

Strategy = "**the algorithm is a replaceable part**". The context holds an interface; the client chooses which implementation to put in.
