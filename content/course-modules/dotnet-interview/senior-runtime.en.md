## How lock works (Q134)

```csharp
lock (_sync) { _count++; }
// compiles to:
bool taken = false;
try
{
    Monitor.Enter(_sync, ref taken);
    _count++;
}
finally
{
    if (taken) Monitor.Exit(_sync);
}
```

Every object on the heap has a header word. `Monitor.Enter` first tries a cheap **thin lock**: it stores the owning thread id in the header with an interlocked compare-exchange and spins briefly under contention. If contention persists, the lock is **inflated** to a **sync block** (an entry in a runtime table) with an OS wait event, and waiting threads block. The lock is **re-entrant** for the owning thread. `Monitor.Wait/Pulse` give condition variables. (.NET 9 also adds a dedicated `System.Threading.Lock` type.)

**Structs can't be used**: `lock` requires a reference type. A struct would be boxed into a *new* object on every `lock`, so each thread would lock a different object and nothing would be protected — the compiler reports an error. Lock on a private `readonly object`, never on `this`, a `Type` or a string (others can lock the same instance). Never `await` inside a `lock` (not allowed); use `SemaphoreSlim.WaitAsync` instead.

## Expression trees (Q135)

`Expression<Func<User, bool>> e = u => u.Age > 18;` makes the compiler build a **data structure** — `LambdaExpression` with a `BinaryExpression(GreaterThan, MemberExpression(u.Age), ConstantExpression(18))` — instead of IL. You can:
- **inspect / translate** it: EF Core turns it into SQL, OData into queries, MongoDB driver into filters;
- **build** it at run time with `Expression.Property`, `Expression.Lambda` (dynamic filters, mappers);
- **compile** it with `.Compile()` into a delegate that runs at native speed — used to replace slow reflection (fast property getters/setters, object mappers).

## The GC in detail; why three generations (Q136)

- Allocation: a thread-local **allocation context** in Gen 0; allocating is a pointer bump.
- A GC is triggered by the Gen 0 budget, by `GC.Collect`, or by low memory. Managed threads are suspended at **safe points**.
- **Mark** from roots: thread stacks and registers (using JIT-generated GC info), statics, GC handles (incl. pinned), the finalization queue. For a Gen 0/1 collection, older-to-younger references are found through the **card table** (a write barrier marks cards when a reference is stored into an old object), so Gen 2 does not need scanning.
- **Plan / relocate / compact** (or sweep into free lists when compaction is not worth it), update references, **promote** survivors. Objects with finalizers survive one extra GC: they are put on the f-reachable queue, the finalizer thread runs `Finalize`, and the next GC frees them.
- Gen 2 is collected in the **background** (concurrent) in most configurations. **Server GC** has one heap and GC thread per core (throughput); **workstation GC** favours latency and memory. Since .NET 7 the heap is organized in **regions**. The **LOH** (≥ 85,000 bytes) and the **POH** (pinned object heap, .NET 5) are collected with Gen 2.

**Why three?** It is an empirical engineering trade-off based on the generational hypothesis: most objects die very young (Gen 0, collected often and cheaply), some live for the duration of one operation, such as a request (Gen 1 acts as a **buffer** so they don't get promoted to Gen 2 prematurely), and the rest are long-lived (Gen 2, collected rarely). Each extra generation needs its own budgets, card-table scanning and promotion copying, and the benefit shrinks fast; with only two, medium-lived objects would leak into the expensive generation. Other runtimes chose differently (Mono's SGen uses two generations; JVM collectors vary), which shows that it is a tuning decision, not a law. That reasoning is what the question tests.

## Tracing, secrets, CI/CD, CORS (Q137–140)

**Tracing of Web APIs**: **OpenTelemetry** (`AddOpenTelemetry().WithTracing(t => t.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation().AddSqlClientInstrumentation())`) exports traces to Jaeger, Zipkin, Grafana Tempo or Azure Monitor / Application Insights. ASP.NET Core propagates the W3C `traceparent` header automatically; use `ActivitySource` for custom spans, structured logging (Serilog) with the trace id in every log line, and metrics with `Meter`.

**Secrets**:
- Developer machines: **User Secrets** (`dotnet user-secrets set "Db:Password" …`) stored outside the repo in the user profile, loaded in the Development environment; or environment variables / a local `.env` that is git-ignored.
- Production: **Azure Key Vault** (`builder.Configuration.AddAzureKeyVault(uri, new DefaultAzureCredential())`) accessed with a **managed identity** — no credentials in config at all; Kubernetes secrets (ideally synced from a vault); environment variables injected by the platform. Never commit secrets; rotate them; prefer identity-based access (managed identity to SQL, Storage, Service Bus) over connection strings.

**CI/CD for .NET services in the cloud**: on each pull request — `dotnet restore`, `build`, unit + integration tests (Testcontainers), code analysis, dependency/vulnerability scanning; on merge — build a Docker image once (multi-stage), tag it with the commit SHA, push to a registry (ACR); deploy the **same artifact** through environments (dev → staging → prod) with infrastructure as code (Bicep/Terraform), database migrations as a separate step (EF migration bundles), approvals/gates, health checks, and safe rollout: blue-green or canary (deployment slots in App Service, rolling updates in AKS), automatic rollback. Tools: GitHub Actions or Azure DevOps Pipelines; secrets from Key Vault / OIDC federated credentials instead of stored keys.

**CORS** lets a browser page from another origin call your API.

```csharp
builder.Services.AddCors(o => o.AddPolicy("web", p => p
    .WithOrigins("https://app.example.com")
    .AllowAnyHeader()
    .WithMethods("GET", "POST")
    .AllowCredentials()));
// …
app.UseRouting();
app.UseCors("web");      // after UseRouting, before UseAuthorization
app.UseAuthorization();
```

Or per endpoint with `[EnableCors("web")]` / `.RequireCors("web")`. Don't combine `AllowAnyOrigin()` with credentials. CORS is enforced by browsers; it is not a server-side security boundary.

## Generics, immutability, IEnumerable, Stack (Q141–144)

**Generics** are a CLR feature, not just a compiler one: metadata keeps the generic definition, and the JIT creates instantiations on demand — **separate native code for each value type** (no boxing, full specialization), **shared code for all reference types** (`__Canon`), with a runtime lookup of the exact type when needed (e.g. `typeof(T)`, `new T()`). Constraints (`where T : struct, IComparable<T>`) are verified by the compiler and the runtime. Static fields are per closed type: `Cache<int>.Value` and `Cache<string>.Value` are different.

**Immutable type**: `public sealed record Money(decimal Amount, string Currency);` or a class with `readonly` fields / `init`-only properties, validation in the constructor, no setters, `IReadOnlyList`/`ImmutableArray` for collections (and defensive copies of incoming arrays), value equality, `With…` methods returning new instances. A `readonly struct` for small values. Seal the class so a subclass can't add mutable state.

**`IEnumerable<T>` in detail**: `GetEnumerator()` returns an `IEnumerator<T>` with `MoveNext()`, `Current` and `Dispose()`. `foreach` compiles to a `try/finally` loop calling them (and uses a struct enumerator via duck typing when available, e.g. `List<T>.Enumerator`, avoiding allocations). Iterator methods (`yield`) compile to a class that is both the enumerable and the enumerator, with a state field; `GetEnumerator` returns itself the first time on the same thread, otherwise a copy. `List<T>`'s enumerator checks a `version` field and throws `InvalidOperationException` if the list was modified during enumeration. `Dispose` runs `finally` blocks inside iterators when you `break` early.

**`Stack<T>`** is an array with a `size` pointer: `Push` writes at `array[size++]` and doubles the array when full (amortized O(1)); `Pop` reads `array[--size]` and clears the slot for the GC (O(1)); `Peek` is O(1). LIFO. `Queue<T>` is a circular array buffer with head and tail.

## Your own data structures, interface + abstract class, struct constructors (Q145–147)

Typical examples worth mentioning: an LRU cache (dictionary + linked list), a trie for autocomplete, a ring buffer for metrics, a priority queue before .NET 6 added `PriorityQueue`, a lock-free or bounded queue, a Bloom filter, an interval tree. Explain why the standard one did not fit (allocations, thread-safety, eviction policy, memory layout) and how you tested it.

**Interface + abstract class together**: expose an interface as the public contract (`IRepository<T>`, easy to mock and to implement differently), and provide an abstract base class with shared plumbing (`RepositoryBase<T>` implementing common CRUD, template methods). Consumers depend on the interface; implementers inherit from the base for convenience but aren't forced to. The BCL does the same: `IList<T>` + `Collection<T>`, `IComparer<T>` + `Comparer<T>`, `Stream` + abstract members.

**Struct default constructors**: a struct always has an implicit "zero" initialization: `default(T)`, `new T[100]`, fields of classes and unassigned struct fields are created by zeroing memory, **without calling any constructor** — that is what makes arrays of structs cheap. A user-defined parameterless constructor would therefore run only sometimes (for `new S()` but not for array elements or `default`), which is confusing, so C# forbade it until **C# 10**. Now you can declare one (and field initializers), but `default(S)` and array elements still skip it. Design structs so that the all-zero value is valid.
