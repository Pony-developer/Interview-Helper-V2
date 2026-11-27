## Один ключ для обох напрямків

Симетричне шифрування використовує **той самий секретний ключ** для шифрування й розшифрування. Воно швидке й придатне для будь-якого обсягу даних. **AES** (Advanced Encryption Standard) — стандартний алгоритм із ключами на 128, 192 чи 256 бітів.

## Автентифіковане шифрування: AesGcm

Сучасний код має використовувати режим **AEAD** (автентифіковане шифрування з додатковими даними), що шифрує **й** виявляє підробку за один крок:

```csharp
byte[] key = RandomNumberGenerator.GetBytes(32);             // AES-256; зберігайте безпечно

byte[] Encrypt(byte[] plaintext, byte[] key)
{
    byte[] nonce = RandomNumberGenerator.GetBytes(AesGcm.NonceByteSizes.MaxSize);   // 12 байтів, НОВИЙ щоразу
    byte[] cipher = new byte[plaintext.Length];
    byte[] tag = new byte[AesGcm.TagByteSizes.MaxSize];                             // 16 байтів
    using var aes = new AesGcm(key);
    aes.Encrypt(nonce, plaintext, cipher, tag);
    return nonce.Concat(tag).Concat(cipher).ToArray();       // передаємо nonce + tag + шифротекст разом
}

byte[] Decrypt(byte[] message, byte[] key)
{
    var nonce = message.AsSpan(0, 12);
    var tag = message.AsSpan(12, 16);
    var cipher = message.AsSpan(28);
    byte[] plain = new byte[cipher.Length];
    using var aes = new AesGcm(key);
    aes.Decrypt(nonce, cipher, tag, plain);                  // кидає AuthenticationTagMismatchException, якщо підроблено
    return plain;
}
```

**Nonce** має бути унікальним для кожного шифрування тим самим ключем. Повтор nonce у GCM — катастрофа: це може розкрити відкритий текст і дозволяє підробки. Випадкові 12-байтові nonce прийнятні приблизно до 2³² повідомлень на ключ.

`ChaCha20Poly1305` — альтернативний AEAD, швидкий без апаратної підтримки AES.

## Класичний API: Aes з CBC

```csharp
using var aes = Aes.Create();          // генеруються випадкові Key та IV
aes.Key = key;                         // 32 байти
aes.GenerateIV();                      // 16 байтів, новий для кожного повідомлення
byte[] cipher = aes.EncryptCbc(plaintext, aes.IV);           // одноразовий API .NET 6, доповнення PKCS7
byte[] back = aes.DecryptCbc(cipher, aes.IV);
```

Або з потоками для великих даних:

```csharp
using var output = File.Create("backup.enc");
output.Write(aes.IV);                                          // IV не секретний: зберігаємо його попереду
using var crypto = new CryptoStream(output, aes.CreateEncryptor(), CryptoStreamMode.Write);
using var input = File.OpenRead("backup.zip");
input.CopyTo(crypto);
```

Сам по собі CBC дає **лише конфіденційність**: зловмисник може перевертати біти чи використати помилки доповнення (атаки padding oracle). Якщо мусите використовувати CBC, додайте HMAC над IV + шифротекстом («encrypt-then-MAC») і перевіряйте його перед розшифруванням. Ніколи не використовуйте режим **ECB**: однакові блоки шифруються однаково, видаючи візерунки.

## Ключі з паролів

Пароль — не ключ. Виведіть ключ функцією виведення ключів із випадковою сіллю:

```csharp
byte[] keyFromPassword = Rfc2898DeriveBytes.Pbkdf2(password, salt, 600_000, HashAlgorithmName.SHA256, 32);
```

## Найважче — керування ключами

Шифрування настільки сильне, наскільки захищений ключ:

- генеруйте ключі через `RandomNumberGenerator` (або `Aes.Create()`), ніколи з рядків, які ви надрукували;
- зберігайте їх у сховищі ключів / HSM / DPAPI, а не поруч із даними чи в системі контролю версій;
- плануйте **ротацію**: додавайте ідентифікатор ключа до кожного шифротексту, щоб старі дані можна було розшифрувати;
- шифруйте під час передачі через **TLS** (HTTPS), а для даних у спокої використовуйте шифрування бази/диска; шифрування на рівні застосунку — для особливо чутливих полів.

## Що сказати на співбесіді

- Симетричне = один спільний ключ; AES — стандарт.
- Віддавайте перевагу AEAD (`AesGcm`): шифрування + виявлення підробки; ніколи не повторюйте nonce з тим самим ключем.
- CBC потребує випадкового IV та окремого MAC; ECB неприйнятний ніколи; найважливіше — керування ключами.
