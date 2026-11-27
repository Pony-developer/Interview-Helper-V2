## Що дає криптографія

| Мета | На яке питання відповідає | Інструмент |
| --- | --- | --- |
| **Цілісність** | Чи змінювалися дані? | хеш (SHA-256), HMAC, підпис |
| **Автентичність** | Хто їх створив? | HMAC (спільний ключ), цифровий підпис (відкритий ключ) |
| **Конфіденційність** | Чи можуть інші їх прочитати? | шифрування: симетричне (AES) чи з відкритим ключем (RSA) |
| **Зберігання паролів** | Чи можна перевірити пароль, не зберігаючи його? | повільне хешування із сіллю (PBKDF2, bcrypt, Argon2) |

## Інструменти .NET

Усе в `System.Security.Cryptography`:

| Потреба | Тип |
| --- | --- |
| Хешування | `SHA256`, `SHA384`, `SHA512` (статичний `HashData` у .NET 5+); `MD5`/`SHA1` лише для старих контрольних сум |
| Хешування з ключем | `HMACSHA256`, `HMACSHA512` |
| Хешування паролів | `Rfc2898DeriveBytes` (PBKDF2), `Rfc2898DeriveBytes.Pbkdf2` (.NET 6) |
| Симетричне шифрування | `Aes` (CBC), `AesGcm`, `ChaCha20Poly1305` (автентифіковані) |
| Відкритий ключ | `RSA`, `ECDsa`, `ECDiffieHellman` |
| Випадкові числа | `RandomNumberGenerator` |
| Сертифікати | `X509Certificate2`, `X509Store` |
| Захист даних | `ProtectedData` (Windows DPAPI), `IDataProtector` в ASP.NET Core |

## Золоті правила

1. **Ніколи не вигадуйте власну криптографію.** Використовуйте відомі алгоритми через API платформи.
2. **Використовуйте безпечну випадковість** (`RandomNumberGenerator`) для ключів, IV, солі й токенів, ніколи `System.Random`.
3. **Віддавайте перевагу автентифікованому шифруванню** (`AesGcm`), щоб підробку було виявлено.
4. **Не вшивайте ключі** в код чи конфігураційні файли, що потрапляють у git. Використовуйте сховище ключів (Azure Key Vault, AWS KMS), DPAPI або систему захисту даних платформи.
5. **Порівнюйте секрети за сталий час** (`CryptographicOperations.FixedTimeEquals`).
6. **Стежте за актуальністю**: MD5 і SHA-1 зламані для безпеки; ключі RSA коротші за 2048 бітів надто короткі.

## Windows Data Protection (DPAPI)

У Windows DPAPI шифрує дані ключами, похідними від облікових даних користувача (чи машини). Жодним ключем ви не керуєте:

```csharp
byte[] secret = Encoding.UTF8.GetBytes("connection-string-password");
byte[] entropy = Encoding.UTF8.GetBytes("Shop.App v1");   // необов'язковий додатковий секрет

byte[] protectedBytes = ProtectedData.Protect(secret, entropy, DataProtectionScope.CurrentUser);
byte[] back = ProtectedData.Unprotect(protectedBytes, entropy, DataProtectionScope.CurrentUser);
```

- `CurrentUser`: розшифрувати може лише той самий користувач Windows.
- `LocalMachine`: розшифрувати може будь-який процес на тій самій машині.
- Лише Windows (пакет `System.Security.Cryptography.ProtectedData` у .NET Core).

## Data Protection в ASP.NET Core

Кросплатформний відповідник для веб-застосунків: він керує, ротує й зберігає ключі за вас (файлова система, Redis, Azure Blob + Key Vault), і саме він захищає cookie автентифікації та anti-forgery токени.

```csharp
public class InviteLinks(IDataProtectionProvider provider)
{
    private readonly ITimeLimitedDataProtector _p =
        provider.CreateProtector("Shop.InviteLinks").ToTimeLimitedDataProtector();

    public string Create(int orderId) => _p.Protect(orderId.ToString(), TimeSpan.FromDays(7));
    public int Read(string token) => int.Parse(_p.Unprotect(token));   // кидає виняток, якщо підроблено чи прострочено
}
```

**Рядок призначення** (purpose) ізолює протектори: дані, захищені для "Shop.InviteLinks", не можна розкрити з іншим призначенням. У фермі серверів усі екземпляри мають ділити спільний набір ключів.

## Що сказати на співбесіді

- Хеші — для цілісності, HMAC/підписи — для автентичності, шифрування — для конфіденційності, повільні хеші із сіллю — для паролів.
- Використовуйте API платформи, безпечну випадковість, автентифіковане шифрування й кероване зберігання ключів.
- DPAPI (Windows) і Data Protection в ASP.NET Core шифрують без вашого керування ключами.
