A delegate field and an event look almost the same, but the keyword `event` protects the subscriber list:

```csharp
class Publisher
{
    public Action Handler;                // a plain delegate field
    public event Action Changed;          // an event
}

var p = new Publisher();
p.Handler = () => Console.WriteLine("a");
p.Handler = null;                         // removes ALL handlers: outside code may do this
p.Handler();                              // ...and may call the handler directly

// p.Changed = null;                      // compile error: an event cannot be assigned from outside
// p.Changed();                           // compile error: an event cannot be raised from outside
p.Changed += () => Console.WriteLine("b");   // allowed: subscribe
p.Changed -= () => Console.WriteLine("b");   // a different lambda, so this does NOT unsubscribe (see later)
```

## What the keyword forbids outside the class

- assigning the field with `=`, which would replace every subscriber;
- raising the event from outside, which only the publisher should do;
- reading the list of subscribers as if it were a normal value.

Outside code may only add (`+=`) and remove (`-=`) its own handler. That is exactly the contract of publish/subscribe.

## Inside the class

Inside the class, the event behaves like a field, so the class raises it with `Changed?.Invoke(...)`. The `?.` skips the call when nobody has subscribed, and it avoids the race in which the last subscriber leaves between the check and the call.

## Rule of thumb

Declare a public event whenever the class needs to notify others, and never expose a public delegate field for notifications.
