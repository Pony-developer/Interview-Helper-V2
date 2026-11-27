## OOP: the four principles (Q1–2)

- **Encapsulation**: an object hides its state and exposes behaviour. Private fields plus public methods keep invariants in one place: a `BankAccount` exposes `Withdraw(amount)`, not a settable `Balance`.
- **Inheritance**: a class reuses and extends another class (`class Manager : Employee`). Use it for real *is-a* relations; prefer composition otherwise.
- **Abstraction**: work with the essential contract and hide the details. `Stream` lets you read bytes without caring whether they come from a file, memory or the network.
- **Polymorphism**: one call, many implementations. `shape.Area()` runs `Circle.Area` or `Square.Area` depending on the runtime type (virtual dispatch). Overloading is compile-time (ad-hoc) polymorphism; generics are parametric polymorphism.

Every .NET type implicitly derives from **`System.Object`** (structs through `System.ValueType`). C# has **no multiple inheritance of classes**: one base class, but any number of interfaces.

## Recursion and lambdas (Q3–4)

**Recursion** is a method that calls itself on a smaller problem. It needs a **base case** and progress toward it, otherwise every call adds a stack frame until a `StackOverflowException`, which cannot be caught. Deep recursion can be replaced with a loop and an explicit `Stack<T>`.

```csharp
static int Factorial(int n) => n <= 1 ? 1 : n * Factorial(n - 1);
```

A **lambda expression** is an anonymous function: `x => x * 2`. It converts to a delegate (`Func<int, int>`) or to an expression tree (`Expression<Func<int, int>>`, which EF Core turns into SQL). Lambdas can **capture** outer variables (closures): the compiler moves those variables into a hidden class.

## Multithreading (Q5)

Running several pieces of work at the same time to use all CPU cores or keep a UI responsive. Main tools: `Task` and `Task.Run`, `Parallel.For/ForEach`, PLINQ (`AsParallel()`), `Thread` (low level), the `ThreadPool`, and synchronization: `lock`, `Interlocked`, `SemaphoreSlim`, concurrent collections (`ConcurrentDictionary`). Risks: race conditions, deadlocks, harder debugging.

## Web basics (Q6–8, 10)

- **JSON**: a text format for data: objects `{}`, arrays `[]`, strings, numbers, `true/false`, `null`. In .NET: `System.Text.Json` (`JsonSerializer.Serialize/Deserialize`) or Newtonsoft.Json.
- **REST**: an architectural style for HTTP APIs. Resources have URIs (`/orders/42`); you act on them with HTTP verbs (GET reads, POST creates, PUT replaces, PATCH changes, DELETE removes); the server is stateless; responses can be cached; status codes carry meaning (200, 201, 204, 400, 404, 500).
- **SPA**: the browser loads one HTML shell and a JavaScript bundle; navigation re-renders views on the client and data comes from an API as JSON (React, Angular, Vue). Pros: app-like UX, less traffic. Cons: SEO and the first load need care (server-side rendering helps).
- **GET vs POST**: GET reads, is **safe and idempotent**, and its parameters are in the URL (logged, length-limited, cacheable, bookmarkable). POST sends data in the body, is not idempotent (two POSTs may create two orders) and is not cached by default. Neither is encrypted: only HTTPS encrypts.

## Patterns, Docker, tests (Q9, 11–12)

**GoF patterns** you will most likely name: Singleton, Factory Method, Builder, Strategy, Observer (C# events), Decorator (`Stream` wrappers, ASP.NET middleware), Adapter, Facade, Iterator (`IEnumerable`). Give a real example of where you used one and why.

**Docker** packages an app with its runtime and dependencies into an **image**; a **container** is an isolated process started from that image that shares the host kernel. It solves "works on my machine" and gives reproducible environments and easy scaling. Cons: one more layer to learn and secure, images to maintain, stateful data needs volumes, and isolation is weaker than a full VM.

**Unit vs integration tests**: a unit test checks one class or method in isolation, with dependencies replaced by fakes or mocks; it is fast and pinpoints failures. An integration test checks real components together (a database, the HTTP pipeline through `WebApplicationFactory`, the file system): slower, but it catches wiring and configuration bugs.
