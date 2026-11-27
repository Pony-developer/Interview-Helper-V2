## The building blocks

```csharp
public abstract class Document
{
    public string Title { get; }
    protected Document(string title) => Title = title;

    public abstract int PageCount { get; }               // must be overridden
    public virtual string Summary() => $"{Title}: {PageCount} pages";   // may be overridden
}

public class Report : Document
{
    private readonly int _pages;
    public Report(string title, int pages) : base(title) => _pages = pages;
    public override int PageCount => _pages;
    public override string Summary() => "[Report] " + base.Summary();   // reuse the base logic
}

public sealed class Invoice : Report { /* nobody can derive from Invoice */ }
```

- `abstract` class: can't be instantiated; may hold abstract members with no body.
- `virtual`: a default implementation that derived classes may `override`.
- `sealed` on a class stops derivation; `sealed override` stops further overriding of one member.
- `base.Member()` calls the overridden version; `: base(args)` picks a base constructor.

## Polymorphism and casting

A variable of a base type can hold any derived object; calls to virtual members go to the **runtime** type.

```csharp
Document d = new Report("Q3", 12);
Console.WriteLine(d.Summary());       // [Report] Q3: 12 pages

if (d is Report r) Console.WriteLine(r.PageCount);   // type pattern: test + cast in one step
var maybe = d as Invoice;              // null if it isn't an Invoice; never throws
var forced = (Invoice)d;               // InvalidCastException if it isn't
```

**Upcasting** (derived → base) is implicit and always safe. **Downcasting** (base → derived) is explicit and checked at run time.

## override vs new (hiding)

```csharp
class A { public virtual string Who() => "A"; }
class B : A { public override string Who() => "B"; }
class C : A { public new string Who() => "C"; }

A b = new B(); Console.WriteLine(b.Who());   // B  (override: runtime type wins)
A c = new C(); Console.WriteLine(c.Who());   // A  (new: compile-time type wins)
```

`new` breaks polymorphism: which method runs depends on the variable's declared type. You almost never want it; the compiler warns if you hide by accident.

## Covariant return types (C# 9)

An override may return a *more derived* type than the base method:

```csharp
class Animal { public virtual Animal Clone() => new Animal(); }
class Cat : Animal { public override Cat Clone() => new Cat(); }   // allowed since C# 9
```

## Constructors and inheritance

Constructors are **not inherited**. A derived class must define its own and call a base one (implicitly the parameterless one, which must then exist). Order of execution: derived field initializers → base field initializers → base constructor body → derived constructor body.

Don't call virtual methods from a base constructor: the override runs before the derived constructor has initialized its fields.

## Overload resolution with inheritance

When several overloads fit, the compiler picks the most specific one based on the **static** type of the argument, not its runtime type:

```csharp
void Show(Document d) => Console.WriteLine("document");
void Show(Report r)   => Console.WriteLine("report");
Document x = new Report("x", 1);
Show(x);   // "document": overloads are chosen at compile time
```

## Interview takeaways

- `override` replaces behavior for every caller; `new` only hides it for callers using the derived type.
- Overloads are resolved at compile time; overrides are dispatched at run time.
- Prefer composition when a class only needs another's behavior, not its identity.
