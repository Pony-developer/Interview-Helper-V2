## Task

Store passwords the right way: never the password itself, but a slow, salted **PBKDF2** hash, in the format `iterations.saltBase64.hashBase64`.

1. **`Hash(password, salt, iterations)`**: derive `HashSize` (32) bytes with `new Rfc2898DeriveBytes(password, salt, iterations)` and `GetBytes`, and return the three parts joined with dots. (The salt is passed in only to make the demo repeatable; real code creates it with `RandomNumberGenerator` for every password.)
2. **`Verify(password, stored)`**: split the stored string (return false if it doesn't have three parts), decode the salt and expected hash, **recompute** the hash with the same salt and iteration count, and compare in **constant time** (XOR accumulator).

Storing the iteration count with each hash lets you raise it later without breaking existing users.

Note on modern .NET: the static `Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, 32)` (.NET 6) is preferred, with hundreds of thousands of iterations; this practice uses the constructor because it's available on the practice runtime.

Expected output:

```
1000.AAcOFRwjKjE4P0ZNVFtiaQ==.1J2KlD7qO87UDBt2QbRivPmScPCoWtFU5OYJW3THxgI=
True
False
same hash with another salt: False
True
```
