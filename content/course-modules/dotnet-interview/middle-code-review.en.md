The Middle list contains several "will this work?" and "what's wrong here?" snippets. The quiz after this lecture checks each of them.

## 1. Calling a method on null

```csharp
SomeClass myClass = null;
myClass.SomeMethod();
```

Usually a `NullReferenceException`. **But** if `SomeMethod` is an **extension method** (`static void SomeMethod(this SomeClass c)`), the call compiles to `Extensions.SomeMethod(myClass)`, a static call that receives `null` as an argument, and works as long as the method handles null. That's the trick — `string.IsNullOrEmpty`-style helpers rely on it. (Calling an instance method on null always throws, even if it does not use `this`: C# emits `callvirt`, which checks for null.)

## 2. Returning a disposed object

```csharp
SomeClass GetTable()
{
    using (var table = new SomeClass())
    {
        return table;
    }
}

var table = GetTable();
table.Draw();   // ObjectDisposedException, or worse: silently broken state
```

`using` calls `Dispose()` when control leaves the block — including via `return`. The caller gets an already-disposed object. Fix: don't dispose what you return; the **caller** owns it and wraps it in `using`.

## 3. `is` followed by a cast

```csharp
if (shape is Circle)
    Console.WriteLine(((Circle)shape).Radius);
```

Two type checks (`is`, then the cast). Use pattern matching — one check, a typed variable: `if (shape is Circle c) Console.WriteLine(c.Radius);`. Better still: if every shape has something to print, make it a virtual member and avoid type checks (polymorphism), or use a `switch` on types for closed hierarchies.

## 4. Exceptions for control flow

```csharp
public int Quantity
{
    get
    {
        try { return int.Parse(TxtQuantity.Text); }
        catch { return 0; }
    }
}
```

- Exceptions are expensive and meant for exceptional situations; invalid user input is expected. Use `int.TryParse(TxtQuantity.Text, out var q) ? q : 0`.
- The bare `catch` swallows everything, including real bugs.
- Silently returning 0 hides the problem from the user: validate the input in the UI and show an error instead.
- A property getter that touches UI controls and parses text mixes layers; parse once in a view model / validation step.

## 5. Rethrowing

```csharp
try { SomeMethod(); }
catch (Exception e)
{
    Log(e.Message);
    throw e;
}
```

- `throw e;` **resets the stack trace** to this line, so you lose where the error really happened. Use `throw;`. To add context, wrap: `throw new OrderException("…", e);` (keeps the inner exception).
- Logging only `e.Message` drops the type and the stack: log the exception object (`logger.LogError(e, "…")`).
- Log **or** rethrow, not both at every level, otherwise the same error is logged many times.
- Catching `Exception` is fine only at a boundary (top-level handler, middleware) or if you rethrow.
