## Records in one line

```csharp
public record Product(string Sku, string Name, decimal Price);
```

That single line declares a class with:

- a constructor taking `Sku`, `Name`, `Price`;
- public `init`-only properties with those names (immutable after construction);
- **value equality**: two products with the same Sku, Name and Price are equal (`Equals`, `==`, `GetHashCode`);
- a readable `ToString()`: `Product { Sku = A1, Name = Pen, Price = 1.5 }`;
- a `Deconstruct` method: `var (sku, name, price) = product;`;
- support for **non-destructive mutation** with `with`.

## with expressions

```csharp
var pen = new Product("A1", "Pen", 1.50m);
var discounted = pen with { Price = 1.20m };   // a copy with one property changed

Console.WriteLine(pen.Price);         // 1.50: the original is untouched
Console.WriteLine(pen == discounted); // False
```

`with` calls a hidden copy constructor (the "clone" method) and then sets the listed properties. It's a **shallow** copy: if a record holds a `List<T>`, both copies share the same list.

## Nominal records

You don't have to use the positional form:

```csharp
public record Customer
{
    public required string Email { get; init; }    // 'required' is C# 11; in C# 10 use a constructor
    public string? Phone { get; init; }
    public List<string> Tags { get; init; } = new();
}
```

You can mix both: positional parameters plus extra properties and methods in a body.

```csharp
public record Order(int Id, DateTime Placed)
{
    public decimal Total { get; init; }
    public bool IsLarge => Total > 1000;
}
```

## record class vs record struct (C# 10)

| | `record` / `record class` | `record struct` | `readonly record struct` |
| --- | --- | --- | --- |
| Kind | reference type | value type | value type |
| Positional properties | `init` (immutable) | `get; set;` (**mutable**) | `init` (immutable) |
| Inheritance | yes, records from records | no | no |
| `null` | possible | no | no |

Use `readonly record struct` for small value-like data (coordinates, money); `record class` for larger entities and DTOs.

## Inheritance

```csharp
public record Person(string Name);
public record Employee(string Name, string Department) : Person(Name);

Person p = new Employee("Ann", "IT");
Console.WriteLine(p);   // Employee { Name = Ann, Department = IT }: ToString is virtual
```

A record can only inherit from another record (or `object`), and a class can't inherit from a record.

## When records fit

- DTOs and API contracts, messages and events: data that's created, passed around and compared.
- Value objects in domain-driven design (`Money`, `Address`, `DateRange`).
- Keys in dictionaries and sets, thanks to value equality.

When they don't: entities whose identity matters more than their values (two `Customer` rows with the same data are still two customers), or objects that need mutable state and encapsulated behavior. Also, value equality on EF Core entities causes subtle tracking bugs.

## Interview takeaways

- `record` = class + value equality + `ToString` + deconstruction + `with`.
- `with` makes a shallow copy; the original is unchanged.
- `record struct` is a value type and mutable unless `readonly`.
