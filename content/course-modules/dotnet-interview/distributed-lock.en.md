## Task

Question 156: "Which database would you use for a distributed lock? Describe the implementation." Implement the Redis recipe on a small in-memory fake, including the part most answers miss: **fencing tokens**.

`FakeRedis` gives you `SetIfAbsent` (Redis `SET key value NX PX ttl`), `DeleteIfEquals` (the Lua compare-and-delete script) and `Increment` (`INCR`). Complete:

1. **`DistributedLock.TryAcquire(resource, ttl)`** — generate a unique token (`Guid.NewGuid()`), try `SetIfAbsent("lock:" + resource, token, ttl)`. On failure return `null`. On success take a fencing number with `Increment("fence:" + resource)` and return a `LockHandle` with the resource, token and fence. (Take the fence only after acquiring, so failed attempts don't use numbers.)
2. **`DistributedLock.Release(handle)`** — delete the key only if it still holds **this handle's token**. A plain delete would remove someone else's lock if yours already expired.
3. **`Storage.Write(fence, data)`** — reject a write whose fence is lower than the highest fence already seen (`"rejected (stale fence N)"`); otherwise remember the fence, store the data and return `"ok"`.

The scenario: A takes the lock, then pauses (say, a long GC) for longer than the TTL. The lock expires and B takes it with fence 2 and writes. When A wakes up, it still believes it holds the lock — the TTL alone can't stop its write; the fencing check in the storage does.

Expected output:

```
A acquired, fence 1
B: busy
B acquired, fence 2
write by B: ok
write by A: rejected (stale fence 1)
release by A: False
release by B: True
C acquired, fence 3, data B
other resource: fence 1
```
