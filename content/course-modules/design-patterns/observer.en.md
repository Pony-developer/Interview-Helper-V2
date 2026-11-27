**In plain words:** Observer lets one object (the **publisher**) **notify many others** (the **subscribers**) when something happens, without knowing who they are. Subscribers sign up and sign out themselves.

## A picture from life

A YouTube channel. You press "Subscribe", and when a new video comes out, you get a notification. The author doesn't phone every viewer and doesn't even know their names.

## The problem

When an order is paid, the warehouse must reserve items, accounting must create an invoice, and the customer must get an email. If `Order.Pay()` calls all three directly, the order class knows about everything, and adding a "loyalty points" reaction means editing it again.

## In C#: events are Observer built into the language

```csharp
class Order
{
    public event EventHandler<decimal> Paid;     // the subscription point

    public void Pay(decimal amount)
    {
        // ... take the money ...
        var handler = Paid;
        if (handler != null) handler(this, amount);   // notify everyone (Paid?.Invoke in newer C#)
    }
}

var order = new Order();
order.Paid += (sender, amount) => Console.WriteLine("Warehouse: reserve items");
order.Paid += (sender, amount) => Console.WriteLine("Accounting: invoice for " + amount);
order.Pay(1500m);
```

`Order` knows nothing about the warehouse or accounting. New reactions are added from outside with `+=`.

## The classic bug: forgetting to unsubscribe

The publisher keeps a reference to every subscriber. If a short-lived object (a form, a view model) subscribes to a long-lived one (a global service) and never does `-=`, it will **never be garbage-collected** and will keep reacting to events. Unsubscribe in `Dispose`, or keep subscriptions as short as the subscriber's life.

## Where you already see it

- `event` in WinForms/WPF (`button.Click += ...`), `INotifyPropertyChanged` in data binding.
- `IObservable<T>` / `IObserver<T>` and Rx (Reactive Extensions).
- On a bigger scale: message queues and pub/sub (Azure Service Bus topics), webhooks, Dataverse sending events to Service Bus.

## When to use it, and when not to

- **Fits:** one change should trigger an open-ended list of reactions.
- **Careful:** too many events make the flow hard to follow ("who reacts to this, and in what order?"). Subscribers shouldn't depend on being called in a particular order.

## Remember

Observer = "**subscribe and get notified**". In C#, that's `event` with `+=` and `-=`, and the rule is: whoever subscribes must also unsubscribe.
