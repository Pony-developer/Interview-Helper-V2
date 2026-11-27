## Task

Two generic pieces, each relying on its constraints.

1. **`Generic.Max<T>(IList<T> items) where T : IComparable<T>`** returns the largest item. For an empty list return `default(T)`. Use `CompareTo`; the constraint is what lets you call it, and it works for `int`, `string` and `DateTime` without boxing.

2. **`Registry<T> where T : class, IEntity, new()`** keeps one entity per `Id`. `GetOrCreate(id, init)`:
   - if an entity with that `id` is already stored, return it (and don't call `init`);
   - otherwise create one with `new T()` (allowed by the `new()` constraint), pass it to `init(entity, id)` to fill it in, store the result under `id` and return it.

Expected output:

```
17
plum
0
2022
Pen Pen same=True count=1
customers=2
```
