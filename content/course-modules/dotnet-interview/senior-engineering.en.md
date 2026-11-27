## Beyond OOP, and your hardest problems (Q122–123)

Name the paradigms you actually used and where:
- **Functional programming**: immutable data (records), pure functions, LINQ, higher-order functions, `Result`/`Option` types instead of exceptions for expected failures, pattern matching.
- **AOP** (aspect-oriented programming): cross-cutting code applied around methods — ASP.NET filters and middleware, decorators, Castle DynamicProxy interceptors, PostSharp/Fody weaving, source generators.
- **Reactive programming** (Rx.NET, `IObservable`), **event-driven** architecture, **DDD** (aggregates, value objects, domain events), **data-oriented** design for hot paths (`Span<T>`, structs, avoiding allocations).

For "three hardest problems", use **STAR**: Situation, Task, Action (options you considered and *why* you chose one), Result (measured: "p99 latency 2 s → 200 ms"). Interviewers check depth, ownership and whether you learned something.

## Coupling and static classes (Q124–125)

**Loosely coupled** code depends on abstractions and small contracts, so a part can change, be replaced or be tested without touching the others. Tightly coupled code knows concrete classes, internal details and global state: a change ripples everywhere.

Ways to reduce coupling: depend on interfaces and inject them (DIP + DI); small, focused interfaces; events, messages or mediators instead of direct calls; stable DTOs/contracts at module boundaries; hide internals (`internal`, private setters); avoid shared mutable state.

**Static classes increase coupling**: the caller is hard-wired to one implementation that cannot be swapped or mocked (`DateTime.Now`, `File.ReadAllText` inside business logic). Stateless pure helpers (`Math.Max`, extension methods) are fine; for anything with I/O, time or state, inject an abstraction (`TimeProvider`, `IFileSystem`).

## Measuring performance (Q126, 128)

- Micro-benchmarks: **BenchmarkDotNet** (warm-up, many iterations, statistics, `[MemoryDiagnoser]` for allocations). A naive `Stopwatch` loop in Debug mode measures the JIT and the debugger, not your code.
- Profiling: Visual Studio profiler, dotTrace/dotMemory, PerfView, `dotnet-trace` (CPU sampling), `dotnet-counters` (GC, allocation rate, thread pool queue length, exceptions/sec), `dotnet-gcdump`/`dotnet-dump` (heap), Application Insights / OpenTelemetry in production.
- **Yes, measuring affects what is measured**: instrumentation adds overhead, sampling has bias, Debug builds disable optimizations, logging and timers allocate. Prefer sampling profilers and measure release builds under realistic load.

Typical bottlenecks: CPU (algorithms with bad complexity, excessive LINQ in hot loops, regex without caching, serialization), memory (allocation rate → frequent GCs, LOH churn, leaks via static caches and event handlers), I/O (chatty DB calls, N+1 queries, missing indexes, synchronous I/O, no connection pooling), contention (locks, thread-pool starvation from blocking code).

Reducing memory and memory traffic: avoid allocations in hot paths (`Span<T>`, `stackalloc`, `ArrayPool<T>`, `StringBuilder` reuse, `ValueTask`), structs for small data, avoid boxing and closures, stream large data instead of loading it (`IAsyncEnumerable`, `Stream`), cache wisely with size limits, unsubscribe events, `RecyclableMemoryStream`.

## Docker multi-stage builds (Q127)

One Dockerfile with several `FROM` stages. Build in a large image with the SDK, then copy only the publish output into a small runtime image:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore                 # cached until the project file changes
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app .
USER app
ENTRYPOINT ["dotnet", "Api.dll"]
```

Result: a much smaller final image without compilers or source code (smaller attack surface, faster pulls), plus good layer caching. You can add a `test` stage too.

## Cross-cutting concerns (Q129)

- HTTP level: **middleware** (logging, correlation ids, exception handling, transactions per request) and **filters** (validation, authorization).
- Application level: **decorators** around interfaces (`LoggingOrderService : IOrderService`), registered with Scrutor's `Decorate`; **MediatR pipeline behaviors** (`ValidationBehavior`, `TransactionBehavior`) wrap every request handler.
- Outgoing calls: `DelegatingHandler` for `HttpClient` (retries with Polly, auth headers, logging).
- Validation: FluentValidation or DataAnnotations triggered automatically; logging via `ILogger` scopes and OpenTelemetry.

## REST maturity model (Q130)

Richardson's model:
- **Level 0**: one endpoint, RPC over HTTP (SOAP-style `POST /api`).
- **Level 1**: resources — separate URIs (`/orders/42`).
- **Level 2**: HTTP verbs and status codes used correctly (GET/POST/PUT/DELETE, 201, 404, 409). Most "REST" APIs stop here.
- **Level 3**: hypermedia controls (**HATEOAS**): responses include links to related resources and allowed next actions, so clients discover the API.

## CPU-bound vs IO-bound, marshalling (Q131–132)

**CPU-bound** work is limited by computation (image processing, hashing, compression): speed it up with parallelism (`Parallel.For`, `Task.Run` in client apps). **IO-bound** work waits for disk, network or a database: use async I/O so no thread is held while waiting. Wrapping IO in `Task.Run` or making CPU work "async" does not help.

**Marshalling** converts data between representations when crossing a boundary: managed ↔ unmanaged for P/Invoke and COM (strings to `char*`/`BSTR`, struct layout via `[StructLayout]`, `[MarshalAs]`), and across AppDomains/processes (by value or by reference). Blittable types (int, double, structs of them) need no conversion; source-generated `[LibraryImport]` avoids runtime marshalling costs.

## async/await in detail (Q133)

The compiler rewrites an `async` method into a **struct state machine** implementing `IAsyncStateMachine`, plus an `AsyncTaskMethodBuilder`:

1. The caller calls the method; the builder creates the state machine and runs `MoveNext()` synchronously until the first `await`.
2. `await x` calls `x.GetAwaiter()`. If `IsCompleted` is true, execution continues synchronously (no allocation, no thread switch).
3. Otherwise the state is saved (`state = 1`, locals hoisted to fields), the state machine is **boxed to the heap** the first time, `AwaitUnsafeOnCompleted` registers `MoveNext` as the continuation, and the method returns the builder's `Task` to the caller.
4. When the awaited operation completes, the continuation runs — posted to the captured `SynchronizationContext`/`TaskScheduler`, or on a thread-pool thread — and `MoveNext()` jumps to the saved state.
5. On `return`, the builder completes the `Task` with the result; exceptions are stored in the task and rethrown at the `await`.

**`async void`**: the caller gets nothing to await, so it cannot know when the method finishes or observe its exceptions. An exception escaping an `async void` method is raised on the `SynchronizationContext` or the thread pool and **crashes the process**. It is also hard to test. It exists for event handlers; elsewhere return `Task`. For deliberate fire-and-forget, use a background queue / hosted service, or at least `_ = Task.Run(...)` with a try/catch that logs.
