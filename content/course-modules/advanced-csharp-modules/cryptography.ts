import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const tokenTypes = (body: string) => `// Signed tokens: "<base64url payload>.<base64url HMAC-SHA256 of the payload part>".
static class Token
{
    public static string Base64Url(byte[] data)
    {
        return Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public static byte[] FromBase64Url(string s)
    {
        s = s.Replace('-', '+').Replace('_', '/');
        switch (s.Length % 4) { case 2: s += "=="; break; case 3: s += "="; break; }
        return Convert.FromBase64String(s);
    }

    public static string Sign(string payload, byte[] key)
    {
${body.split("@@")[0]}
    }

    // Returns the payload if the signature is valid, otherwise null. Compares signatures in constant time.
    public static string Verify(string token, byte[] key)
    {
${body.split("@@")[1]}
    }

    // Constant-time comparison: always looks at every byte, so timing doesn't reveal where they differ.
    public static bool FixedTimeEquals(byte[] a, byte[] b)
    {
${body.split("@@")[2]}
    }
}`;

const tokenSolution = `        string body = Base64Url(Encoding.UTF8.GetBytes(payload));
        using (var hmac = new HMACSHA256(key))
        {
            byte[] sig = hmac.ComputeHash(Encoding.ASCII.GetBytes(body));
            return body + "." + Base64Url(sig);
        }@@        int dot = token.IndexOf('.');
        if (dot <= 0) return null;
        string body = token.Substring(0, dot);
        byte[] given;
        try { given = FromBase64Url(token.Substring(dot + 1)); }
        catch (FormatException) { return null; }
        using (var hmac = new HMACSHA256(key))
        {
            byte[] expected = hmac.ComputeHash(Encoding.ASCII.GetBytes(body));
            if (!FixedTimeEquals(expected, given)) return null;
        }
        return Encoding.UTF8.GetString(FromBase64Url(body));@@        if (a.Length != b.Length) return false;
        int diff = 0;
        for (int i = 0; i < a.Length; i++) diff |= a[i] ^ b[i];
        return diff == 0;`;

const tokenMain = `        byte[] key = Encoding.UTF8.GetBytes("a-32-byte-demo-key-do-not-use!!!");
        string token = Token.Sign("{\\"user\\":42,\\"role\\":\\"admin\\"}", key);
        Console.WriteLine(token);
        Console.WriteLine(Token.Verify(token, key));

        string tampered = Token.Sign("{\\"user\\":42,\\"role\\":\\"guest\\"}", key).Split('.')[0] + "." + token.Split('.')[1];
        Console.WriteLine(Token.Verify(tampered, key) ?? "rejected: payload changed");
        Console.WriteLine(Token.Verify(token, Encoding.UTF8.GetBytes("another-key")) ?? "rejected: wrong key");
        Console.WriteLine(Token.Verify("garbage", key) ?? "rejected: malformed");

        using (var sha = SHA256.Create())
            Console.WriteLine(BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes("hello"))).Replace("-", "").ToLowerInvariant());`;

const pwdTypes = (body: string) => `// Stores passwords as "iterations.saltBase64.hashBase64" using PBKDF2 (Rfc2898DeriveBytes).
static class PasswordHasher
{
    public const int SaltSize = 16, HashSize = 32;

    // 'salt' is passed in so the demo is repeatable; real code uses RandomNumberGenerator for it.
    public static string Hash(string password, byte[] salt, int iterations)
    {
${body.split("@@")[0]}
    }

    // Recomputes the hash with the stored salt and iterations and compares in constant time.
    public static bool Verify(string password, string stored)
    {
${body.split("@@")[1]}
    }
}`;

const pwdSolution = `        using (var kdf = new Rfc2898DeriveBytes(password, salt, iterations))
        {
            byte[] hash = kdf.GetBytes(HashSize);
            return iterations + "." + Convert.ToBase64String(salt) + "." + Convert.ToBase64String(hash);
        }@@        string[] parts = stored.Split('.');
        if (parts.Length != 3) return false;
        int iterations = int.Parse(parts[0]);
        byte[] salt = Convert.FromBase64String(parts[1]);
        byte[] expected = Convert.FromBase64String(parts[2]);
        using (var kdf = new Rfc2898DeriveBytes(password, salt, iterations))
        {
            byte[] actual = kdf.GetBytes(expected.Length);
            int diff = 0;
            for (int i = 0; i < expected.Length; i++) diff |= expected[i] ^ actual[i];
            return diff == 0;
        }`;

const pwdMain = `        byte[] salt = new byte[PasswordHasher.SaltSize];
        for (int i = 0; i < salt.Length; i++) salt[i] = (byte)(i * 7);
        string stored = PasswordHasher.Hash("correct horse battery staple", salt, 1000);
        Console.WriteLine(stored);
        Console.WriteLine(PasswordHasher.Verify("correct horse battery staple", stored));
        Console.WriteLine(PasswordHasher.Verify("Correct horse battery staple", stored));

        byte[] otherSalt = (byte[])salt.Clone();
        otherSalt[0] = 99;
        string sameWordOtherSalt = PasswordHasher.Hash("correct horse battery staple", otherSalt, 1000);
        Console.WriteLine("same hash with another salt: " + (sameWordOtherSalt.Split('.')[2] == stored.Split('.')[2]));
        Console.WriteLine(PasswordHasher.Verify("correct horse battery staple", sameWordOtherSalt));`;

export const cryptographyModule: ModuleDef = {
  slug: "cryptography",
  title: { en: "Cryptography", uk: "Криптографія" },
  slides: [
    lecture("crypto-overview", "Cryptography overview and Windows Data Protection", "Огляд криптографії та Windows Data Protection"),
    lecture("hashing-hmac", "Hashing, HMAC and password hashing", "Хешування, HMAC і хешування паролів"),
    lecture("symmetric-encryption", "Symmetric encryption with AES", "Симетричне шифрування з AES"),
    lecture("public-key-signing", "Public-key encryption and digital signatures", "Шифрування з відкритим ключем і цифрові підписи"),
    quiz("cryptography-quiz", "Cryptography", "Криптографія", [
      question(
        "hash-vs-encrypt",
        ["What's the essential difference between hashing and encryption?", "Яка суттєва різниця між хешуванням і шифруванням?"],
        [
          ["Hashing is one-way (no key, can't be reversed); encryption is reversible with the right key", "Хешування одностороннє (без ключа, не обертається); шифрування оборотне з правильним ключем"],
          ["Hashing is faster encryption", "Хешування — швидше шифрування"],
          ["Encryption produces fixed-size output", "Шифрування дає результат фіксованого розміру"],
          ["There is none", "Різниці немає"],
        ],
        "a",
      ),
      question(
        "passwords",
        ["How should passwords be stored?", "Як слід зберігати паролі?"],
        [
          ["Encrypted with AES", "Зашифрованими AES"],
          ["As a SHA-256 hash", "Як хеш SHA-256"],
          ["With a slow, salted password-hashing function: PBKDF2, bcrypt, scrypt or Argon2", "Через повільну функцію хешування паролів із сіллю: PBKDF2, bcrypt, scrypt чи Argon2"],
          ["In plain text in a secure database", "Відкритим текстом у захищеній базі"],
        ],
        "c",
      ),
      question(
        "salt",
        ["What does a unique random salt per password prevent?", "Від чого захищає унікальна випадкова сіль для кожного пароля?"],
        [
          ["Brute-forcing a single password", "Перебору одного пароля"],
          ["Precomputed (rainbow table) attacks and spotting users who share a password", "Атак із заздалегідь обчисленими таблицями (rainbow tables) і виявлення користувачів з однаковими паролями"],
          ["Network sniffing", "Перехоплення мережевого трафіку"],
          ["SQL injection", "SQL-ін'єкцій"],
        ],
        "b",
      ),
      question(
        "hmac",
        ["What does an HMAC prove about a message?", "Що доводить HMAC щодо повідомлення?"],
        [
          ["That it is encrypted", "Що воно зашифроване"],
          ["Who sent it, to a third party", "Хто його надіслав — третій стороні"],
          ["That it was compressed", "Що його стиснули"],
          ["That it wasn't modified and was produced by someone holding the shared secret key", "Що його не змінювали й створив хтось, хто має спільний секретний ключ"],
        ],
        "d",
      ),
      question(
        "aes-iv",
        ["Why must you use a fresh random IV (or nonce) for each AES encryption with the same key?", "Чому для кожного шифрування AES тим самим ключем потрібен новий випадковий IV (чи nonce)?"],
        [
          ["Otherwise identical plaintexts produce identical ciphertexts, leaking information (and with GCM, nonce reuse breaks security completely)", "Інакше однакові відкриті тексти дають однакові шифротексти, що видає інформацію (а в GCM повтор nonce повністю ламає безпеку)"],
          ["The IV is the key", "IV — це ключ"],
          ["To make decryption faster", "Щоб пришвидшити розшифрування"],
          ["It isn't necessary", "Це не обов'язково"],
        ],
        "a",
      ),
      question(
        "aead",
        ["Why prefer `AesGcm` over AES-CBC alone?", "Чому `AesGcm` кращий, ніж сам AES-CBC?"],
        [
          ["It uses shorter keys", "Він використовує коротші ключі"],
          ["It's authenticated encryption: it also detects tampering, so you don't need a separate HMAC", "Це автентифіковане шифрування: воно ще й виявляє підробку, тож окремий HMAC не потрібен"],
          ["It doesn't need a key", "Йому не потрібен ключ"],
          ["It compresses data", "Він стискає дані"],
        ],
        "b",
      ),
      question(
        "rsa-uses",
        ["Which are typical uses of public-key cryptography (RSA, ECDSA)?", "Що з цього — типові застосування криптографії з відкритим ключем (RSA, ECDSA)?"],
        [
          ["Signing data so anyone with the public key can verify it", "Підпис даних, щоб будь-хто з відкритим ключем міг його перевірити"],
          ["Exchanging or wrapping a symmetric key", "Обмін або обгортання симетричного ключа"],
          ["Encrypting gigabytes of data directly", "Пряме шифрування гігабайтів даних"],
          ["TLS certificates", "TLS-сертифікати"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "dpapi",
        ["What does `ProtectedData.Protect` (Windows DPAPI) or ASP.NET Core Data Protection solve?", "Яку проблему розв'язують `ProtectedData.Protect` (Windows DPAPI) чи Data Protection в ASP.NET Core?"],
        [
          ["Encrypting data without you having to generate, store and rotate keys yourself", "Шифрування даних без потреби самому генерувати, зберігати й ротувати ключі"],
          ["Hashing passwords", "Хешування паролів"],
          ["Compressing cookies", "Стиснення cookie"],
          ["Signing assemblies", "Підписування збірок"],
        ],
        "a",
      ),
    ]),
    practice("hmac-token-practice", "Signed tokens with HMAC-SHA256", "Підписані токени з HMAC-SHA256", {
      starter: PROGRAM_WITH(tokenTypes(`${TODO}@@${TODO}@@${TODO}`), tokenMain, "using System.Security.Cryptography;\nusing System.Text;"),
      solution: PROGRAM_WITH(tokenTypes(tokenSolution), tokenMain, "using System.Security.Cryptography;\nusing System.Text;"),
      expectedOutput:
        "eyJ1c2VyIjo0Miwicm9sZSI6ImFkbWluIn0.ktHOuCRK4-ZP69XfHeeekiiUgIwhdxfj9PUKWWxlq3I\n{\"user\":42,\"role\":\"admin\"}\nrejected: payload changed\nrejected: wrong key\nrejected: malformed\n2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\n",
    }),
    practice("password-hash-practice", "Password hashing with PBKDF2", "Хешування паролів через PBKDF2", {
      starter: PROGRAM_WITH(pwdTypes(`${TODO}@@${TODO}`), pwdMain, "using System.Security.Cryptography;"),
      solution: PROGRAM_WITH(pwdTypes(pwdSolution), pwdMain, "using System.Security.Cryptography;"),
      expectedOutput:
        "1000.AAcOFRwjKjE4P0ZNVFtiaQ==.1J2KlD7qO87UDBt2QbRivPmScPCoWtFU5OYJW3THxgI=\nTrue\nFalse\nsame hash with another salt: False\nTrue\n",
    }),
  ],
};
