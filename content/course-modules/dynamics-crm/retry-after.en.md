An integration that ignores service protection limits works fine in testing and falls over on the first big import. Write the retry logic that keeps it alive.

The program has an `IHttpSender` that answers with scripted responses, an `IClock` whose `Sleep` only records the wait (so the program runs instantly), and `HttpResponse` with a `Status` and an optional `RetryAfter` in seconds. Implement `ResilientClient.Send(request)`:

- Send the request with `sender.Send(request)`.
- If the status is **429** (Too Many Requests) or **503** (Service Unavailable), the failure is temporary: wait and send again.
  - Wait `RetryAfter` seconds when the response has it.
  - Otherwise back off exponentially: `2^n` seconds, where `n` is the number of retries made so far: 1 s before the first retry, 2 s before the second, 4 s before the third.
  - Wait with `clock.Sleep(TimeSpan.FromSeconds(seconds))`.
- Retry at most `maxRetries` times. When the retries are used up, return the last response.
- Any other status (204, 400…) is returned at once, without retrying.

Do not change `Main`. Expected output:

```text
== Plain success
  PATCH accounts(1) -> 204
  result 204, waited 0s
== Throttled with Retry-After
  PATCH accounts(1) -> 429 (Retry-After: 5)
  wait 5s
  PATCH accounts(1) -> 429 (Retry-After: 3)
  wait 3s
  PATCH accounts(1) -> 204
  result 204, waited 8s
== Unavailable without Retry-After
  PATCH accounts(1) -> 503
  wait 1s
  PATCH accounts(1) -> 503
  wait 2s
  PATCH accounts(1) -> 503
  wait 4s
  PATCH accounts(1) -> 204
  result 204, waited 7s
== Gives up
  PATCH accounts(1) -> 429 (Retry-After: 10)
  wait 10s
  PATCH accounts(1) -> 429 (Retry-After: 10)
  wait 10s
  PATCH accounts(1) -> 429 (Retry-After: 10)
  result 429, waited 20s
== Mixed
  PATCH accounts(1) -> 503
  wait 1s
  PATCH accounts(1) -> 429 (Retry-After: 7)
  wait 7s
  PATCH accounts(1) -> 503
  wait 4s
  PATCH accounts(1) -> 204
  result 204, waited 12s
== Bad request is not retried
  PATCH accounts(1) -> 400
  result 400, waited 0s
```

In "Gives up", `maxRetries` is 2: the first send plus two retries, and the third 429 is returned without another wait. In "Mixed", the third wait is 4 s because two retries were already made, even though one of them used `Retry-After`.

Hint: a `for (int retry = 0; ; retry++)` loop that returns from inside is the shortest shape. `response.RetryAfter ?? (int)Math.Pow(2, retry)` picks the wait.
