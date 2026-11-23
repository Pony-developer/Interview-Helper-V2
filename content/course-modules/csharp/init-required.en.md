## The problem with object initializers

An object initializer is convenient:

```csharp
var user = new User { Name = "Ann", Email = "ann@example.com" };
```

but it needs public **setters**, so anyone can change the object later: `user.Name = "";`. A constructor makes the object safe, but with ten properties it becomes long and easy to call with the arguments in the wrong order.

## `init` (C# 9)

An `init` accessor allows setting a property **only while the object is being created**: in a constructor or an object initializer.

```csharp
public class User
{
    public string Name { get; init; }
    public string Email { get; init; }
}

var user = new User { Name = "Ann", Email = "ann@example.com" };   // OK
user.Name = "Bob";                                                 // compile error
```

To get a changed copy, records (and, since C# 10, structs) have `with`: `var renamed = person with { Name = "Bob" };`. An ordinary class does not support `with`.

## `required` (C# 11)

`init` does not force anyone to set a property: `new User()` leaves `Name` as `null`. The modifier `required` does:

```csharp
public class User
{
    public required string Name { get; init; }
    public string? Nickname { get; init; }
}

var a = new User { Name = "Ann" };   // OK
var b = new User();                  // compile error: Name is required
```

If a constructor sets all the required members itself, mark it with `[SetsRequiredMembers]`, so that callers of that constructor are not asked for an initializer.

## Primary constructors (C# 12)

Records had parameters in the type declaration from the start. C# 12 allows them for any class or struct:

```csharp
public class OrderService(IOrderRepository repository, ILogger<OrderService> logger)
{
    public void Place(Order order)
    {
        repository.Add(order);
        logger.LogInformation("Order {Id} placed", order.Id);
    }
}
```

This removes the usual boilerplate of a constructor that only copies its arguments into private fields, which is why it is popular for dependency injection.

Important differences from records:

- the parameters of a class's primary constructor **do not become public properties**: they are just parameters, visible in the whole class body;
- they are **not readonly**: the class can assign to them. If that matters, copy the parameter into a `readonly` field: `private readonly IOrderRepository repository = repository;`;
- every other constructor must call the primary one with `: this(...)`.

## The `field` keyword (C# 14)

A property with a little logic used to need a hand-written backing field. Now the accessor can refer to the compiler's own field:

```csharp
public string Name
{
    get;
    set => field = value?.Trim() ?? throw new ArgumentNullException(nameof(value));
}
```

## The rule

Make data objects with `init` and `required` instead of public setters or huge constructors; use primary constructors to shorten classes whose constructor only stores its dependencies.
