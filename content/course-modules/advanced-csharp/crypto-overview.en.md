## What cryptography gives you

| Goal | Question it answers | Tool |
| --- | --- | --- |
| **Integrity** | Was the data changed? | hash (SHA-256), HMAC, signature |
| **Authenticity** | Who produced it? | HMAC (shared key), digital signature (public key) |
| **Confidentiality** | Can others read it? | encryption: symmetric (AES) or public-key (RSA) |
| **Password storage** | Can we check a password without storing it? | slow salted hashing (PBKDF2, bcrypt, Argon2) |

## The .NET toolbox

All in `System.Security.Cryptography`:

| Need | Type |
| --- | --- |
| Hashing | `SHA256`, `SHA384`, `SHA512` (static `HashData` in .NET 5+); `MD5`/`SHA1` only for legacy checksums |
| Keyed hashing | `HMACSHA256`, `HMACSHA512` |
| Password hashing | `Rfc2898DeriveBytes` (PBKDF2), `Rfc2898DeriveBytes.Pbkdf2` (.NET 6) |
| Symmetric encryption | `Aes` (CBC), `AesGcm`, `ChaCha20Poly1305` (authenticated) |
| Public-key | `RSA`, `ECDsa`, `ECDiffieHellman` |
| Random numbers | `RandomNumberGenerator` |
| Certificates | `X509Certificate2`, `X509Store` |
| Data protection | `ProtectedData` (Windows DPAPI), ASP.NET Core `IDataProtector` |

## The golden rules

1. **Never invent your own crypto.** Use well-known algorithms through the platform APIs.
2. **Use secure randomness** (`RandomNumberGenerator`) for keys, IVs, salts and tokens, never `System.Random`.
3. **Prefer authenticated encryption** (`AesGcm`) so tampering is detected.
4. **Don't hard-code keys** in source code or config files committed to git. Use a key vault (Azure Key Vault, AWS KMS), DPAPI, or the platform's data protection system.
5. **Compare secrets in constant time** (`CryptographicOperations.FixedTimeEquals`).
6. **Keep up**: MD5 and SHA-1 are broken for security; RSA keys under 2048 bits are too short.

## Windows Data Protection (DPAPI)

On Windows, DPAPI encrypts data with keys derived from the user's (or machine's) credentials. You don't manage any key:

```csharp
byte[] secret = Encoding.UTF8.GetBytes("connection-string-password");
byte[] entropy = Encoding.UTF8.GetBytes("Shop.App v1");   // optional extra secret

byte[] protectedBytes = ProtectedData.Protect(secret, entropy, DataProtectionScope.CurrentUser);
byte[] back = ProtectedData.Unprotect(protectedBytes, entropy, DataProtectionScope.CurrentUser);
```

- `CurrentUser`: only the same Windows user can decrypt.
- `LocalMachine`: any process on the same machine can decrypt.
- Windows-only (`System.Security.Cryptography.ProtectedData` package in .NET Core).

## ASP.NET Core Data Protection

The cross-platform equivalent for web apps: it manages, rotates and stores keys for you (file system, Redis, Azure Blob + Key Vault), and is what protects authentication cookies and anti-forgery tokens.

```csharp
public class InviteLinks(IDataProtectionProvider provider)
{
    private readonly ITimeLimitedDataProtector _p =
        provider.CreateProtector("Shop.InviteLinks").ToTimeLimitedDataProtector();

    public string Create(int orderId) => _p.Protect(orderId.ToString(), TimeSpan.FromDays(7));
    public int Read(string token) => int.Parse(_p.Unprotect(token));   // throws if tampered or expired
}
```

The **purpose string** isolates protectors: data protected for "Shop.InviteLinks" can't be unprotected by another purpose. In a server farm, all instances must share the key ring.

## Interview takeaways

- Hashes for integrity, HMAC/signatures for authenticity, encryption for confidentiality, slow salted hashes for passwords.
- Use platform APIs, secure randomness, authenticated encryption, and managed key storage.
- DPAPI (Windows) and ASP.NET Core Data Protection encrypt without you managing keys.
