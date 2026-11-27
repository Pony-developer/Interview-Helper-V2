## Two keys

Public-key (asymmetric) cryptography uses a **key pair**:

- the **public key** can be shared with anyone;
- the **private key** never leaves its owner.

What one key does, only the other can undo:

| Operation | Done with | Checked/undone with | Gives |
| --- | --- | --- | --- |
| Encrypt | recipient's **public** key | recipient's **private** key | only the recipient can read |
| Sign | signer's **private** key | signer's **public** key | anyone can verify who signed and that nothing changed |

Asymmetric operations are **slow** and RSA can only encrypt small payloads (a few hundred bytes), so real systems combine them with symmetric crypto.

## Signing and verifying

```csharp
using ECDsa signer = ECDsa.Create(ECCurve.NamedCurves.nistP256);
byte[] publicKey = signer.ExportSubjectPublicKeyInfo();          // share this

byte[] document = Encoding.UTF8.GetBytes("{\"orderId\":42,\"total\":99.5}");
byte[] signature = signer.SignData(document, HashAlgorithmName.SHA256);

// elsewhere, with only the public key
using ECDsa verifier = ECDsa.Create();
verifier.ImportSubjectPublicKeyInfo(publicKey, out _);
bool ok = verifier.VerifyData(document, signature, HashAlgorithmName.SHA256);
```

Signing actually signs a **hash** of the data. Uses: JWTs signed with RS256/ES256 (an identity provider signs, your API verifies with the published public key), code signing, signed software updates, document signatures, certificate chains.

Signatures vs HMAC: an HMAC's verifier holds the **same** secret and could forge tags; a signature's verifier holds only the public key, so the signature proves the private-key holder made it (**non-repudiation**).

## RSA encryption

```csharp
using RSA rsa = RSA.Create(3072);
byte[] wrappedKey = rsa.Encrypt(aesKey, RSAEncryptionPadding.OaepSHA256);   // small data only
byte[] aesKeyAgain = rsa.Decrypt(wrappedKey, RSAEncryptionPadding.OaepSHA256);
```

Use **OAEP** padding (not PKCS#1 v1.5 for encryption) and keys of at least 2048 bits (3072+ for long-term use).

## Hybrid encryption

To encrypt a large message for someone:

1. generate a random AES key;
2. encrypt the message with AES-GCM;
3. encrypt (wrap) the AES key with the recipient's RSA public key;
4. send both. The recipient unwraps the AES key with their private key, then decrypts.

That's how TLS, PGP, S/MIME and cloud key-management "envelope encryption" work. TLS today mostly uses **Diffie-Hellman key agreement** (`ECDiffieHellman`) instead of RSA key transport, which gives forward secrecy.

## Certificates

A certificate (`X509Certificate2`) binds a public key to an identity (a domain, a company), signed by a certificate authority. Trust flows down a chain from a root CA the OS trusts.

```csharp
using var cert = new X509Certificate2("api.pfx", password);
using RSA? privateKey = cert.GetRSAPrivateKey();
Console.WriteLine($"{cert.Subject}, valid until {cert.NotAfter:d}");
```

Load certificates from secure stores (Windows certificate store, Azure Key Vault) rather than files with passwords in config.

## Interview takeaways

- Public key encrypts / verifies; private key decrypts / signs.
- Signatures give integrity + authenticity + non-repudiation; HMACs don't give non-repudiation.
- Real systems are hybrid: asymmetric to exchange a key, symmetric for the data.
