`Connection` is a fake database connection. It prints `open <name>` when it is created. Finish its `IDisposable` implementation:

- `Dispose()` prints `close <name>` and adds one to the static counter `ClosedCount`. Calling `Dispose()` a second time must do **nothing**: no second line, no second count;
- `Query(string sql)` returns `<name>: <sql>`. After the connection is disposed, it throws an `ObjectDisposedException` instead.

Do not change `Main`. It uses the connection inside `using` blocks, disposes one connection twice, and leaves one `using` block with an exception. Expected output:

```text
open main
main: select 1
close main
open temp
close temp
temp is disposed
open report
report: select 3
close report
report failed
Total closed: 3
```

Notice that `close report` comes **before** `report failed`: the `using` block disposes the connection while the exception is on its way out, before the `catch` in `Main` runs.

Hint: keep a `bool disposed` field. `new ObjectDisposedException(name)` takes the name of the disposed object.
