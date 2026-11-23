The hash codes of `GetHashCode` are fast, but they are **not secure**. They are made to spread values in a table, not to resist an attacker. For security, the hash must be a **cryptographic hash**, such as SHA-256:

```csharp
using System.Security.Cryptography;
using System.Text;

byte[] data = Encoding.UTF8.GetBytes("password123");
using (SHA256 sha = SHA256.Create())
{
    byte[] hash = sha.ComputeHash(data);
    Console.WriteLine(BitConverter.ToString(hash));   // 64 hex digits, 32 bytes
}
```

## Three properties that a cryptographic hash must have

- **Preimage resistance:** given a hash, it is practically impossible to find an input that produces it.
- **Second-preimage resistance:** given an input, it is practically impossible to find a different input with the same hash.
- **Collision resistance:** it is practically impossible to find any two inputs with the same hash.

A tiny change in the input changes the output completely: `"password123"` and `"password124"` give hashes that look unrelated. This is the **avalanche effect**.

## Where they are used

- **Storing passwords:** the server stores the hash, not the password. When the user logs in, the server hashes the typed password and compares. A stolen database then does not reveal the passwords (at least not directly).
- **Checking that a file was not changed:** a download comes with its SHA-256 hash, and you compute the hash of the file you received.
- **Digital signatures and certificates.**

## Passwords need more than a plain hash

Two users with the same password get the same hash, and attackers prepare tables of hashes of common passwords. So a password is hashed together with a random **salt**, which is stored with the hash. Dedicated password hashing functions (such as PBKDF2, bcrypt or Argon2) also repeat the work thousands of times, to make guessing slow.

## The main point

`GetHashCode` is for hash tables inside a program. A cryptographic hash is for security, and it is much slower. Never use `GetHashCode` to protect data.
