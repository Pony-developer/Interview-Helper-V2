## The four-part identity

An assembly's full name has four components:

```
Shop.Core, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089
```

| Part | Meaning |
| --- | --- |
| Simple name | usually the file name without extension |
| Version | `major.minor.build.revision` (the `AssemblyVersion`) |
| Culture | `neutral` for code; a culture like `uk-UA` for satellite resource assemblies |
| Public key token | an 8-byte hash of the strong-name public key, or `null` if unsigned |

```csharp
var name = new AssemblyName("Shop.Core, Version=2.0.0.0, Culture=neutral, PublicKeyToken=null");
Console.WriteLine(name.Name);         // Shop.Core
Console.WriteLine(name.Version);      // 2.0.0.0
AssemblyName mine = typeof(Program).Assembly.GetName();
```

## Three versions

| Attribute | Used for | Advice |
| --- | --- | --- |
| `AssemblyVersion` | **binding**: what referencing assemblies record and request | change rarely, e.g. only on major versions, to avoid binding conflicts |
| `AssemblyFileVersion` | the Win32 file version shown in Explorer | bump on every build |
| `AssemblyInformationalVersion` | human-facing "product version", may contain any text (`2.1.0-beta+sha`) | what you show in "About" |

On .NET Core/5+, binding is lenient: a higher available version satisfies a reference to a lower one. On .NET Framework, strong-named references required exact versions unless redirected in config (binding redirects), a frequent source of "Could not load file or assembly" errors.

## Strong naming

Strong naming signs the assembly with a private key; the public key goes into the identity.

```xml
<SignAssembly>true</SignAssembly>
<AssemblyOriginatorKeyFile>shop.snk</AssemblyOriginatorKeyFile>   <!-- created with sn -k shop.snk -->
```

What it gives you:

- a **unique identity**: two different publishers can't produce the same full name;
- **tamper detection** when the runtime validates the signature (.NET Core skips validation for performance).

What it doesn't give you: trust. Anyone can create a key pair; a strong name says nothing about **who** you are. In .NET Core it matters mainly for compatibility (a strong-named .NET Framework assembly can only reference other strong-named assemblies), which is why many open-source libraries still sign with a publicly shared key.

## Authenticode signing

Authenticode proves **who published a file** using an X.509 code-signing certificate issued by a trusted certificate authority:

```
signtool sign /fd SHA256 /a /tr http://timestamp.example /td SHA256 MyApp.exe
```

- Windows shows the publisher in UAC prompts and SmartScreen trusts reputable signed files more.
- A **timestamp** keeps the signature valid after the certificate expires.
- NuGet has its own package signing (author and repository signatures).

| | Strong name | Authenticode |
| --- | --- | --- |
| Proves | identity uniqueness | publisher identity |
| Key from | self-generated | a certificate authority |
| Used by | the CLR loader | Windows, browsers, users |

## Interview takeaways

- Full name = simple name + version + culture + public key token.
- `AssemblyVersion` is for binding; `FileVersion` and `InformationalVersion` for humans and tools.
- Strong naming = unique identity, not trust; Authenticode = verified publisher.
