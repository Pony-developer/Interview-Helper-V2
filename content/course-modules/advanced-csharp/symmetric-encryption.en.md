## One key for both directions

Symmetric encryption uses the **same secret key** to encrypt and decrypt. It's fast and suitable for any amount of data. **AES** (Advanced Encryption Standard) is the standard algorithm, with 128-, 192- or 256-bit keys.

## Authenticated encryption: AesGcm

Modern code should use an **AEAD** mode (authenticated encryption with associated data), which encrypts **and** detects tampering in one step:

```csharp
byte[] key = RandomNumberGenerator.GetBytes(32);             // AES-256; store it safely

byte[] Encrypt(byte[] plaintext, byte[] key)
{
    byte[] nonce = RandomNumberGenerator.GetBytes(AesGcm.NonceByteSizes.MaxSize);   // 12 bytes, NEW every time
    byte[] cipher = new byte[plaintext.Length];
    byte[] tag = new byte[AesGcm.TagByteSizes.MaxSize];                             // 16 bytes
    using var aes = new AesGcm(key);
    aes.Encrypt(nonce, plaintext, cipher, tag);
    return nonce.Concat(tag).Concat(cipher).ToArray();       // ship nonce + tag + ciphertext together
}

byte[] Decrypt(byte[] message, byte[] key)
{
    var nonce = message.AsSpan(0, 12);
    var tag = message.AsSpan(12, 16);
    var cipher = message.AsSpan(28);
    byte[] plain = new byte[cipher.Length];
    using var aes = new AesGcm(key);
    aes.Decrypt(nonce, cipher, tag, plain);                  // throws AuthenticationTagMismatchException if tampered
    return plain;
}
```

The **nonce** must be unique for every encryption with the same key. Reusing a nonce with GCM is catastrophic: it can reveal plaintext and allows forgeries. Random 12-byte nonces are fine up to about 2³² messages per key.

`ChaCha20Poly1305` is an alternative AEAD that's fast without AES hardware support.

## The classic API: Aes with CBC

```csharp
using var aes = Aes.Create();          // random Key and IV generated
aes.Key = key;                         // 32 bytes
aes.GenerateIV();                      // 16 bytes, new per message
byte[] cipher = aes.EncryptCbc(plaintext, aes.IV);           // .NET 6 one-shot API, PKCS7 padding
byte[] back = aes.DecryptCbc(cipher, aes.IV);
```

Or with streams for large data:

```csharp
using var output = File.Create("backup.enc");
output.Write(aes.IV);                                          // the IV isn't secret: store it in front
using var crypto = new CryptoStream(output, aes.CreateEncryptor(), CryptoStreamMode.Write);
using var input = File.OpenRead("backup.zip");
input.CopyTo(crypto);
```

CBC alone gives **confidentiality only**: an attacker can flip bits or exploit padding errors (padding-oracle attacks). If you must use CBC, add an HMAC over IV + ciphertext ("encrypt-then-MAC") and verify it before decrypting. Never use **ECB** mode: identical blocks encrypt identically, leaking patterns.

## Keys from passwords

A password isn't a key. Derive one with a key-derivation function and a random salt:

```csharp
byte[] keyFromPassword = Rfc2898DeriveBytes.Pbkdf2(password, salt, 600_000, HashAlgorithmName.SHA256, 32);
```

## Key management is the hard part

Encryption is only as strong as the protection of the key:

- generate keys with `RandomNumberGenerator` (or `Aes.Create()`), never from strings you typed;
- store them in a key vault / HSM / DPAPI, not next to the data or in source control;
- plan **rotation**: include a key id with each ciphertext so old data can still be decrypted;
- encrypt in transit with **TLS** (HTTPS), and use database/disk encryption for data at rest; application-level encryption is for especially sensitive fields.

## Interview takeaways

- Symmetric = one shared key; AES is the standard.
- Prefer AEAD (`AesGcm`): encryption + tamper detection; never reuse a nonce with the same key.
- CBC needs a random IV and a separate MAC; ECB is never acceptable; key management matters most.
