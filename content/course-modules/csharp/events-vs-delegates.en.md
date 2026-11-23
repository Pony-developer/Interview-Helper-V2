An event and a delegate are both "a list of methods to call". The difference is who may do what with that list.

| | Delegate field | Event |
|---|---|---|
| Subscribe with `+=` | yes | yes |
| Unsubscribe with `-=` | yes | yes |
| Assign with `=` from outside | yes: it replaces **all** subscribers | no |
| Invoke from outside | yes | no |
| Read the list from outside | yes | no |

## Why the difference matters

Suppose a class publishes a delegate field instead of an event:

```csharp
class Market
{
    public Action<decimal> PriceChanged;     // a field: anybody can do anything with it
}

var market = new Market();
market.PriceChanged += p => Console.WriteLine("chart: " + p);
market.PriceChanged = p => Console.WriteLine("only me: " + p);   // the chart is silently gone
market.PriceChanged.Invoke(10m);                                 // outsiders can raise the event
```

The second line deletes every other subscriber, and the third line raises an event that the market itself never raised. With `event`, both are compile errors.

## Which to choose

- Use **events** when other classes subscribe and must not interfere with each other.
- Use a **delegate field or a property of delegate type** when one object gives a single, replaceable behaviour, for example the comparison used by a sorting class. A strategy is a delegate; a notification is an event.
