## Cryptographic hashes

A hash function maps any input to a fixed-size **digest**. A cryptographic hash is designed so that:

- the same input always gives the same digest;
- a tiny change in the input changes the digest completely;
- you can't recover the input from the digest (**one-way**);
- you can't find two inputs with the same digest (**collision-resistant**).

```csharp
byte[] data = Encoding.UTF8.GetBytes("hello");
byte[] digest = SHA256.HashData(data);                        // .NET 5+
string hex = Convert.ToHexString(digest).ToLowerInvariant();  // 2cf24dba5fb0a30e...

using var sha = SHA256.Create();                              // older style; also works on streams
using var file = File.OpenRead("installer.msi");
byte[] fileHash = sha.ComputeHash(file);
```

Uses: file integrity checks, content-addressed storage and caching (ETags), deduplication, commit ids (git uses SHA-1/SHA-256), the building block of signatures.

| Algorithm | Digest | Status |
| --- | --- | --- |
| MD5 | 128 bits | **broken**: collisions are easy; only for non-security checksums |
| SHA-1 | 160 bits | **broken** for collision resistance |
| SHA-256 / SHA-384 / SHA-512 | 256–512 bits | secure; SHA-256 is the default choice |

`GetHashCode()` is **not** a cryptographic hash: it's small, fast and not designed to resist attacks.

## HMAC: hashing with a key

A plain hash proves nothing about **who** made it: an attacker who changes the data just recomputes the hash. An **HMAC** mixes a secret key into the hash, so only key holders can produce a valid tag:

```csharp
byte[] key = RandomNumberGenerator.GetBytes(32);
byte[] tag = HMACSHA256.HashData(key, Encoding.UTF8.GetBytes(payload));   // .NET 6

bool valid = CryptographicOperations.FixedTimeEquals(tag, receivedTag);    // constant-time comparison
```

Typical uses: webhook signatures (Stripe, GitHub sign their callbacks with HMAC-SHA256), signed cookies and URLs, JWTs with the HS256 algorithm, API request signing.

**Constant-time comparison** matters: a normal loop that returns at the first differing byte leaks, through timing, how many leading bytes were right, letting an attacker guess a valid signature byte by byte.

## Password hashing

A fast hash like SHA-256 is the **wrong** tool for passwords: attackers can compute billions per second on GPUs. Password hashing functions are deliberately **slow** and **salted**:

```csharp
byte[] salt = RandomNumberGenerator.GetBytes(16);                 // unique per password
byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations: 600_000,
                                        HashAlgorithmName.SHA256, outputLength: 32);   // .NET 6
string stored = $"{600_000}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
```

- The **salt** (random, per password, stored next to the hash) makes precomputed rainbow tables useless and gives identical passwords different hashes.
- The **iteration count** (work factor) makes each guess expensive; raise it over time, which is why it's stored with the hash.
- To verify, recompute with the stored salt and iterations and compare in constant time.
- Alternatives: bcrypt, scrypt, **Argon2id** (memory-hard; the current recommendation), via libraries. ASP.NET Core Identity's `PasswordHasher<T>` implements PBKDF2 for you.

## Interview takeaways

- SHA-256 for integrity; MD5/SHA-1 are broken for security.
- HMAC = keyed hash proving integrity + authenticity with a shared secret; compare tags in constant time.
- Passwords: slow, salted functions (PBKDF2, bcrypt, Argon2), never plain SHA-256, never encryption.
