## Task

Questions 100–103 — hash functions, collisions and the complexity of `Dictionary`. Build a small hash map with **separate chaining** to see all of it at work.

`buckets` is an array of linked lists of `Entry` nodes; `BucketOf(key, size)` maps a key to a bucket index. Complete:

1. **`Put(key, value)`** — walk the chain of the key's bucket; if the key is there (compare with `Equals`), replace its value. Otherwise insert a new entry at the head of the chain and increase `Count`. After adding a **new** key, if `Count > Capacity * 3 / 4` (load factor 0.75), call a resize that doubles the array and **rehashes** every entry into the new buckets (an entry's bucket depends on the array size).
2. **`TryGet(key, out value)`** — find the key in its bucket's chain.
3. **`Remove(key)`** — unlink the entry from its chain (careful with the head of the chain); return whether it was there.
4. **`LongestChain()`** — the length of the longest chain.

The `BadKey` class returns the same hash code for every key: all entries land in one bucket, so the map still works correctly (thanks to `Equals`) but degrades into a linked list — O(n) per operation. That's what a bad `GetHashCode` or a hash-flooding attack does to a real `Dictionary`.

Capacity grows 4 → 8 → 16 → 32 while 20 keys are added.

Expected output:

```
20 32
20 500
False
True False 19
True 19
5 8 5 C
4 False
```
