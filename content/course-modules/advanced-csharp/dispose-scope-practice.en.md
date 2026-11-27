## Task

`DisposeScope` owns a group of disposable resources, like a mini DI scope.

1. **`Add<T>(T item)`** registers a resource and returns it (so you can write `var db = scope.Add(new Connection("db"));`). Adding to a disposed scope throws `ObjectDisposedException`.
2. **`Dispose()`**:
   - disposes the resources in **reverse order** of registration, as nested `using` statements would;
   - keeps going even when a resource's `Dispose` throws, collecting the exceptions;
   - after disposing everything, throws an `AggregateException` with all collected exceptions (if there were any);
   - is **idempotent**: the second call does nothing.

`Connection` is already written: it prints when it opens and closes, its `Dispose` is idempotent, and using it after disposal throws `ObjectDisposedException`.

Expected output:

```
open db
open cache
open queue
db <- hello
close queue
close cache
close db
disposed: cache
open a
open b
open c
close c
close b
close a
error: c failed to close
error: b failed to close
open x
scope is closed
```
