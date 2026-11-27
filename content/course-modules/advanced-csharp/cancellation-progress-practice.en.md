## Task

Implement **`Importer.ImportAllAsync(files, importOne, progress, token)`** following the TAP conventions:

1. Process the files **in order**, awaiting `importOne(file, token)` for each and adding up the returned row counts.
2. **Before** each file, call `token.ThrowIfCancellationRequested()`, so a cancelled import stops with `OperationCanceledException`.
3. **After** each file, report progress as `completed * 100 / total` through `progress` (which may be null).
4. Return the total number of rows.

`Main` first runs a full import, then a second one whose progress handler cancels the token once 50% is reached: the third file must never start.

`SyncProgress<T>` reports synchronously on the calling thread so the console output stays in order. In a UI app you'd use `Progress<T>`, which marshals reports to the UI thread.

Expected output:

```
progress 25%
progress 50%
progress 75%
progress 100%
rows 200
progress 25%
progress 50%
import cancelled
```
