`ExpiringCache` keeps every value for `ttl` (time to live) after it was set. It already takes an `IClock` in its constructor, but ignores it and reads `DateTime.UtcNow`, so the tests in `Main` cannot check expiry without really waiting five minutes. Make the cache testable:

1. Finish `FakeClock`: the constructor sets the start time, `UtcNow` returns the current fake time, and `Advance(time)` moves it forward. The fake clock never moves by itself.
2. Make `ExpiringCache` read the time only from `clock`, never from `DateTime`.
3. Write `RemoveExpired()`: it deletes every expired entry and returns how many it deleted.

An entry set at time `T` is found while the time is before `T + ttl`; at `T + ttl` it is already expired. Setting a key again stores the new value and restarts its timer.

Each check in `Main` creates its own clock and cache, so the checks do not depend on each other. Do not change `Main` or `Check`. Expected output:

```text
ok: the fake clock shows the start time
ok: Advance moves the fake clock
ok: a fresh value is found
ok: a missing key is not found
ok: a value is still there after 4:59
ok: a value is gone after exactly 5 minutes
ok: Set again restarts the timer
ok: RemoveExpired removes only the expired entries
```

Hint: you cannot remove entries from a `Dictionary` while a `foreach` goes over it. Collect the expired keys into a list first, then remove them.
