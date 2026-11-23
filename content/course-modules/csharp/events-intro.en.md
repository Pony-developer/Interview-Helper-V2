An **event** is a way for an object to say "something happened", without knowing who will react. A button says "I was clicked". A thermometer says "the temperature changed". Whoever is interested subscribes to the event and does its own work.

This is the **publish/subscribe** pattern:

- the **publisher** (the button) raises the event;
- the **subscribers** (any number of handlers) are methods that run when it is raised;
- the publisher does not know the subscribers, and the subscribers do not know each other.

```csharp
class Button
{
    public event Action Clicked;          // the event

    public void Click()
    {
        Clicked?.Invoke();                // announce it to all subscribers
    }
}

var button = new Button();
button.Clicked += () => Console.WriteLine("saved");     // a subscriber
button.Clicked += () => Console.WriteLine("logged");    // another one
button.Click();                                          // saved, logged
```

## Why not just call the methods?

The button could simply call `Save()` and `Log()` directly. That works for two methods, but then the button must know about every feature that reacts to a click. With events, the button stays the same when a new feature is added: the new feature only subscribes.

## Events are built on delegates

An event is declared with a delegate type, and the previous module showed that delegates hold methods. Subscribing with `+=` adds a method to the list of subscribers, and raising the event calls every method in that list in order. The next lecture explains the keyword `event` itself.
