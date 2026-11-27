## Task

Every ASP.NET Core app relies on a DI container. Build a tiny one with reflection to see how it works inside.

`Register<TService, TImpl>(singleton)` is written: it maps a service type to an implementation type. Implement **`Resolve(Type type)`**:

1. If a singleton instance for `type` already exists, return it.
2. Find the implementation: the registered type, or `type` itself if it's a concrete class that wasn't registered. An unregistered **interface or abstract class** throws `InvalidOperationException("No registration for " + type.Name)`.
3. Pick the public constructor with the **most parameters** (`GetConstructors()` + `GetParameters().Length`).
4. **Resolve every parameter recursively**, then call `ctor.Invoke(args)`.
5. If the service was registered as a singleton, remember the instance for next time.

`Report` needs an `OrderService`, which needs an `IRepository` (transient: a new one each time) and an `IClock` (singleton: always the same object).

Expected output:

```
order#7 (repo 1) at 2024-03-05 10:00
order#8 (repo 2) at 2024-03-05 10:00
same clock: True
same repo: False
No registration for IDisposable
```
