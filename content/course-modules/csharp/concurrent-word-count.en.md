Two parts of a program run on many threads at once.

1. `CountWords(string[] documents)` counts how many times each word occurs in all documents. Process the documents in parallel with `Parallel.ForEach`, split each one by spaces, and count the words in a `ConcurrentDictionary<string, int>` with `AddOrUpdate`. A plain `Dictionary` would be corrupted by parallel writes.
2. `PriceCache.GetPrice(string product)` returns the price of a product. Computing a price is slow (`ComputePrice`), so each product must be computed **exactly once**, even when many threads ask for the same product at the same moment. Keep the prices in a `ConcurrentDictionary<string, Lazy<int>>` and use `GetOrAdd`.

Why `Lazy`? The factory of `GetOrAdd` runs outside the dictionary's lock, so two threads may both run it for the same missing key. With `Lazy<int>` only the stored `Lazy` is ever asked for its `Value`, so `ComputePrice` runs once per product.

Do not change `Main` or `ComputePrice`. Expected output:

```text
a 2
and 1
cat 2
dog 2
sat 2
the 2
Total: 18000
Computations: 2
```

The total is 20 requests for `apple` (price 500) and 20 for `kiwi` (price 400), made from parallel threads; only two computations happen.

Hint: `counts.AddOrUpdate(word, 1, (key, old) => old + 1)` adds a new word with 1 or increases an existing count.
