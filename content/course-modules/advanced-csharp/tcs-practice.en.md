## Task

`LegacyGeocoder.Lookup` is an old callback-based API: it finishes on a thread-pool thread and calls either `onSuccess(lat, lon)` or `onError(message)`.

Write the extension method **`LookupAsync(city)`** that wraps it in a `Task<Tuple<double, double>>` using `TaskCompletionSource`:

- on success, complete the task with `Tuple.Create(lat, lon)`;
- on error, fault the task with a `GeocodeException` carrying the message;
- create the `TaskCompletionSource` with `TaskCreationOptions.RunContinuationsAsynchronously` and use the `TrySet*` methods.

`Main` then uses the task like any other: `.Result`, `Task.WaitAll` (whose `AggregateException` contains the inner `GeocodeException`), the task `Status`, and a continuation. (Blocking with `.Result` is acceptable in a console `Main`; in a server or UI you'd `await`.)

Expected output:

```
Kyiv: 50.45, 30.52
GeocodeException: Unknown city: Atlantis
Lviv: RanToCompletion 49.84
Atlantis: Faulted
lat 50.45
```
