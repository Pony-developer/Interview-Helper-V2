## Task

Question 78: "How do you configure caching of responses to HTTP requests?" In ASP.NET Core you'd use output caching; here you build the core of one yourself.

Complete **`ResponseCache.Get(url, produce)`**:

1. Build a **cache key** from the URL in which the order of query parameters doesn't matter: `/products?size=10&page=1` and `/products?page=1&size=10` must hit the same entry. Sort the `name=value` parts (ordinal) and join them back. A URL without `?` is its own key.
2. If there is an entry for the key and it is **younger than the TTL** (`clock.Now - storedAt < ttl`), count a hit and return the cached body.
3. Otherwise count a miss, call `produce()` to render the response, store it with the current time, and return it.

The clock is fake so that the test can move time forward: the entry for page 1 is still fresh after 30 seconds and expired after 61 seconds (TTL is 60 seconds).

Expected output:

```
v1
v1
v2
v1
v3
v4
v4
hits=3 misses=4
```
