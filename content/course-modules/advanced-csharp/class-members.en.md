## Fields

```csharp
class Account
{
    private decimal _balance;               // instance field
    public readonly string Id;              // assignable only in a declaration or constructor
    public const int MaxNameLength = 50;    // compile-time constant, implicitly static
    public static readonly DateTime Created = DateTime.UtcNow;  // computed once at run time
}
```

`const` is **inlined** into every caller at compile time. If a library changes a `const`, consumers keep the old value until they're recompiled. Use `static readonly` for anything that might change between versions.

## Properties

A property looks like a field to the caller but has `get`/`set` (or `init`) accessors.

```csharp
public string Name { get; set; }                    // auto-property
public decimal Balance { get; private set; }        // read-only from outside
public DateTime OpenedOn { get; init; }             // C# 9: settable only during initialization
public bool IsEmpty => Balance == 0;                // expression-bodied, computed

private int _age;
public int Age
{
    get => _age;
    set => _age = value >= 0 ? value : throw new ArgumentOutOfRangeException(nameof(value));
}
```

`init` gives you immutable objects that still use object-initializer syntax: `new Account { OpenedOn = today }` works, `acc.OpenedOn = x` afterwards doesn't.

## Indexers

```csharp
class Sentence
{
    private readonly string[] _words;
    public Sentence(string text) => _words = text.Split(' ');
    public string this[int index]
    {
        get => _words[index];
        set => _words[index] = value;
    }
    public string this[Index i] => _words[i];   // supports s[^1]
}
```

## Constructors

```csharp
class Order
{
    public Order(int id) : this(id, DateTime.UtcNow) { }   // chain to another constructor
    public Order(int id, DateTime placed) { Id = id; Placed = placed; }
    static Order() { /* runs once, before first use of the type */ }
    public int Id { get; }
    public DateTime Placed { get; }
}
```

- If you write no constructor, the compiler adds a public parameterless one.
- **Field initializers run before the constructor body**, in declaration order.
- A static constructor runs once per type, automatically, before the first instance is created or a static member is used. An exception thrown there makes the type unusable for the life of the app.

## Object initializers and deconstructors

```csharp
var o = new Order(1) { Note = "gift" };   // set accessible properties after construction

public void Deconstruct(out int id, out DateTime placed) { id = Id; placed = Placed; }
var (id, when) = order;                  // calls Deconstruct
```

## Partial types and methods

`partial` splits a class across files; it's how designers and source generators add code next to yours. A `partial` method declared without a body is removed entirely if nobody implements it.

## nameof

`nameof(Balance)` produces the string `"Balance"` at compile time, so a rename refactoring updates it too. Use it in exceptions and logging.

## Interview takeaways

- Prefer properties over public fields: you can add validation later without breaking callers.
- `init` + `readonly` fields give immutability without losing initializer syntax.
- Field initializers run before the constructor body; static constructors run once and lazily.
