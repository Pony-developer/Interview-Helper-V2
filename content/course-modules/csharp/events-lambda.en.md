Lambda expressions are the most convenient way to write a handler, because the handler is usually short and specific to one place:

```csharp
var button = new Button();
int clicks = 0;
button.Clicked += () => clicks++;           // the lambda captures the variable clicks

button.Click();
button.Click();
Console.WriteLine(clicks);                  // 2
```

The lambda is a closure (see the delegates module): it reads and changes the local variable `clicks`, which lives as long as the subscription does.

## Lambdas with the standard signature

For `EventHandler<T>` the lambda gets two parameters, the sender and the data:

```csharp
var t = new Thermometer();
t.TemperatureChanged += (sender, e) =>
{
    if (e.New > 30)
    {
        Console.WriteLine("too hot: " + e.New);
    }
};
t.Set(35);                                  // too hot: 35
```

## The order of handlers

Handlers run in the order they were subscribed. If one handler throws an exception, the remaining handlers do not run, so keep handlers short and safe, or catch exceptions inside them.

## Lambdas and unsubscribing

As the previous lecture showed, a lambda cannot be removed with another lambda. If you subscribe a lambda and later want to unsubscribe, keep it in a variable of the delegate type. A simpler alternative is to subscribe a named method.

## When to use a lambda

- the handler is short and used in one place;
- it needs the local variables of the method that subscribes;
- the subscription lives as long as the object, so no unsubscription is needed.

Use a named method when the handler is long, is used in several places, or must be removed later.
