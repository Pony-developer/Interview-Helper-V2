## Task

Rate limiting protects distributed systems from overload (Q66–67) and is usually answered with the **token bucket** algorithm: a bucket holds up to `capacity` tokens and refills at a steady rate; each request takes one token; with no tokens the request is rejected with `429 Too Many Requests`. Short bursts up to the capacity are allowed, the long-term rate is limited.

Complete:

1. **`TokenBucket.TryTake()`** — first add the tokens earned since the last refill: `elapsed seconds × refillPerSecond`, but never more than `capacity`; remember the refill time. Then, if at least one token is available, take it and return `true`; otherwise return `false`. Tokens are fractional (`double`), so 1.5 seconds gives 1.5 tokens.
2. **`RateLimiter.Handle(client)`** — one bucket per client (create it on the first request); return `"200"` or `"429"`.

The limit in the test is 3 requests of burst and 1 request per second.

Expected output:

```
t=0 A: 200 200 200 429
t=0 B: 200
t=1.5 A: 200 429
t=2 A: 200 429
t=12 A: 200 200 200 429
```
