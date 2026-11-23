## The problem

```csharp
public class OrderService
{
    private readonly SqlOrderRepository repository = new SqlOrderRepository();
    private readonly SmtpEmailSender email = new SmtpEmailSender();

    public void Place(Order order)
    {
        repository.Save(order);
        email.Send(order.CustomerEmail, "Your order is placed");
    }
}
```

This class decides by itself **which** database and **which** mail server it uses. As a result:

- a unit test of `Place` writes to a real database and sends real e-mails;
- switching to another database means editing `OrderService`;
- a reader cannot see the dependencies from the outside: they are hidden inside.

## Dependency inversion and injection

The **Dependency Inversion Principle** (the "D" in SOLID): high-level code (business rules) should depend on **abstractions**, not on low-level details (SQL, SMTP).

**Dependency injection** is the technique that achieves it: a class does not create its dependencies, it **receives** them from outside.

```csharp
public class OrderService
{
    private readonly IOrderRepository repository;
    private readonly IEmailSender email;

    public OrderService(IOrderRepository repository, IEmailSender email)
    {
        this.repository = repository ?? throw new ArgumentNullException(nameof(repository));
        this.email = email ?? throw new ArgumentNullException(nameof(email));
    }

    public void Place(Order order) { /* the same code */ }
}
```

Now a test passes a fake repository and a fake sender, and production passes the real ones. `OrderService` did not change.

The general idea, "somebody else creates and controls my dependencies", is called **Inversion of Control** (IoC).

## Three ways to inject

- **Constructor injection** (the default): the dependencies are required, visible in the signature, and the object is complete right after `new`.
- **Property injection**: for optional dependencies with a sensible default.
- **Method injection**: a dependency needed by one call only, passed as a parameter (`Handle(request, CancellationToken token)`).

## The composition root

The objects are wired together in **one place** at the start of the application, usually `Program.cs`. Everywhere else, classes only ask for what they need through their constructors. Only the composition root knows the concrete classes.

## Two warning signs

- **Service Locator**: a class calls `ServiceLocator.Get<IRepository>()` inside its methods. The dependencies are hidden again, and a test must configure a global locator. This is considered an anti-pattern.
- **A constructor with many parameters** (more than four or five): the class most likely does too much. Split it, instead of hiding the dependencies.

## The rule

Ask for dependencies in the constructor, depend on interfaces, and create concrete objects only in the composition root.
