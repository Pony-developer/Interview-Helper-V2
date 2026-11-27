Almost every pattern in this course is built from the same few ideas. Learn them once, and the patterns stop looking like 23 separate things to memorize.

## Idea 1. Program to an interface, not an implementation

**In plain words:** depend on *what an object can do*, not on *which class it is*.

```csharp
// Tied to one class: to send SMS instead, you must edit this code
class OrderService
{
    private readonly EmailSender sender = new EmailSender();
}

// Depends only on the ability "can send": any sender fits
interface INotifier { void Send(string to, string text); }

class OrderService
{
    private readonly INotifier notifier;
    public OrderService(INotifier notifier) { this.notifier = notifier; }
}
```

A power socket is a good picture: the socket doesn't care whether you plug in a kettle or a laptop, as long as the plug fits. The interface is the shape of the plug.

## Idea 2. Composition over inheritance

**In plain words:** instead of *being* something (inheriting), an object can *have* something (hold another object) and ask it to do the work.

Inheritance is fixed at compile time and grows into deep trees: `Coffee`, `CoffeeWithMilk`, `CoffeeWithMilkAndSugar`, `CoffeeWithSugar`... Composition lets you combine parts at runtime: a coffee *has* a list of toppings. Decorator, Strategy, Bridge, State and Composite all rely on this idea.

## Idea 3. Encapsulate what varies

**In plain words:** find the part of the code that keeps changing and put it in its own box, so the rest of the code stays still.

Discount rules change every month, but the checkout process doesn't? Move the discount rule into its own class (Strategy). The way objects are created keeps changing? Move creation into one place (Factory).

## Idea 4. SOLID in one line each

Patterns are often the *practical way* to follow SOLID:

| Principle | In one line | Patterns that help |
| --- | --- | --- |
| **S**ingle responsibility | A class has one reason to change | Facade, Command |
| **O**pen/closed | Add new behavior by adding classes, not editing old ones | Strategy, Decorator, Observer |
| **L**iskov substitution | A subclass can stand in for its base class without surprises | Template Method, Composite |
| **I**nterface segregation | Many small interfaces beat one fat one | Adapter |
| **D**ependency inversion | Depend on abstractions; get dependencies from outside | Factory, Dependency Injection |

## Remember

When a pattern looks confusing, ask three questions: *What varies here? Which interface hides it? Who holds whom?* The answers almost always explain the whole pattern.
