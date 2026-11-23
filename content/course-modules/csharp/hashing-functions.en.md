A **hash function** takes data of any size and returns a number of a fixed size, such as 32 bits. The same input always gives the same number, and different inputs usually give different numbers:

```csharp
Console.WriteLine("apple".GetHashCode() == "apple".GetHashCode());   // True
Console.WriteLine("apple".GetHashCode() == "apples".GetHashCode());  // False (almost always)
```

The number is called the **hash** or the **hash code**. It is much shorter than the data, so two different inputs can give the same hash. This is a **collision**. A good hash function makes collisions rare and spreads the values evenly.

## Why hashes are useful

The main use is the **hash table**: a structure where the hash code tells in which bucket an item is stored. Finding an item then means: compute its hash, look in that bucket, and compare only the few items there. This is what makes `Dictionary` and `HashSet` fast: a lookup takes about the same time regardless of how many items are stored.

```text
hash("Ann") = 17   ->  bucket 17: [Ann]
hash("Bob") = 42   ->  bucket 42: [Bob]
hash("Cy")  = 17   ->  bucket 17: [Ann, Cy]   a collision: both live in bucket 17
```

## What makes a good hash for a class

- **Equal objects give equal hashes.** This is the rule that `GetHashCode` must keep, together with `Equals`.
- **Fast to compute.** It runs every time an item is looked up.
- **Spread out.** Similar objects should give different numbers.
- **Based on the same fields as `Equals`.** Any field that `Equals` ignores should not influence the hash either.

A common way to combine several fields is `hash = hash * 31 + field` for each field, inside an `unchecked` block, so that overflow is allowed.

## A warning about strings

In .NET Core and later, `string.GetHashCode()` is randomized for each program run, on purpose, to protect against attacks. The same string can give different hash codes in two runs. So never store a `GetHashCode()` value in a file or a database, and never compare hashes between programs. The next lecture covers hashes that are stable and designed for security.
