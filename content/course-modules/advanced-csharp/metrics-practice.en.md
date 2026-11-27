## Task

Real timing code is hard to test because time keeps moving. Here the clock is injected (`IClock`), and `Main` uses a `FakeClock` that only moves when told to, so the output is deterministic.

1. **`Measure(name)`** returns an `IDisposable` scope that remembers the clock's value when it was created. When the scope is disposed, it records `now - start` under `name` by calling `Record`. Disposing the same scope twice must record only once. (A private nested class implementing `IDisposable` works well.)
2. **`Report()`** yields one line per operation, sorted by name (ordinal): `name: n=3 min=10 max=40 avg=20 p50=10`, where:
   - `avg` is the integer average (rounded down);
   - `p50` is the element at index `(n - 1) / 2` of the **sorted** samples.

Notice that scopes nest: `json.parse` is measured inside `http.get`, and both are recorded.

Expected output:

```
cache.get: n=1 min=1 max=1 avg=1 p50=1
db.query: n=3 min=10 max=40 avg=20 p50=10
http.get: n=1 min=125 max=125 avg=125 p50=125
json.parse: n=1 min=5 max=5 avg=5 p50=5
```
