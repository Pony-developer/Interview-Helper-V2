The most useful rule of abstraction is short: **depend on the contract, not on the implementation**. In code, it means that the **types** of your variables, parameters and return values are **interfaces** (or abstract classes), and the specific class appears only where an object is **created**.

## An example: a service and a logger

```csharp
interface ILogger
{
    void Log(string message);
}

class ConsoleLogger : ILogger
{
    public void Log(string message) { Console.WriteLine(message); }
}

class OrderService
{
    private readonly ILogger logger;                       // the type is the interface

    public OrderService(ILogger logger)                    // the logger is given from outside
    {
        this.logger = logger;
    }

    public void Place(int id)
    {
        // ...the real work...
        logger.Log("Order " + id + " placed");
    }
}

var service = new OrderService(new ConsoleLogger());       // the concrete class is chosen in ONE place
service.Place(1);
```

`OrderService` knows nothing about the console. Tomorrow you want to write the messages to a file, a database, or the internet:

```csharp
var service = new OrderService(new FileLogger("log.txt")); // one line changes, and OrderService does not
```

This idea (to **give** the object what it depends on, through the constructor, instead of letting it make the dependency itself) is called **dependency injection**. You do not need a framework for it. Constructor parameters are enough.

## The test double

The greatest practical benefit is **testing**. A real logger writes to a file or the screen, which is hard to check. Replace it with a simple one that **remembers** the messages:

```csharp
class ListLogger : ILogger
{
    private readonly List<string> messages = new List<string>();

    public void Log(string message) { messages.Add(message); }
    public string[] Messages => messages.ToArray();
}

var fake = new ListLogger();
new OrderService(fake).Place(7);
Console.WriteLine(fake.Messages[0]);                       // Order 7 placed: the test can check it
```

The code of `OrderService` is the same in both cases. A class that creates its own dependencies (`new ConsoleLogger()` inside) cannot be tested like this.

## Parameters: ask for the least you need

```csharp
static double Average(List<int> numbers)                   // forces a List: an array does not fit
static double Average(IEnumerable<int> numbers)            // any sequence fits: a list, an array...
```

A parameter of a **general** type makes a method useful in **more places**, and promises less. The return type should be the opposite: **precise** enough to be useful (for example, `List<string>` if the caller may add items), but no more than you want to keep promising.

## Building from small parts: wrappers

A class can implement an interface **and use another object of the same interface**. This gives a **wrapper** (a decorator) that adds something:

```csharp
class PrefixLogger : ILogger
{
    private readonly ILogger inner;
    private readonly string prefix;

    public PrefixLogger(ILogger inner, string prefix) { this.inner = inner; this.prefix = prefix; }

    public void Log(string message) { inner.Log(prefix + message); }     // adds a prefix, passes it on
}

var logger = new PrefixLogger(new ConsoleLogger(), "[orders] ");
new OrderService(logger).Place(2);                                        // [orders] Order 2 placed
```

`OrderService` still sees just an `ILogger`. The wrappers can be put one into another like boxes, and each of them adds one small feature. You will build such a chain in the practice task.

## When it is too much

Do not create an interface for **every** class "just in case". An interface is worth it when:

- there are (or will soon be) **several** implementations;
- you need to **replace** a part in tests;
- a part is on the **border** of the system (files, network, time, randomness).

A small helper class that has only one possible version can stay a class.
