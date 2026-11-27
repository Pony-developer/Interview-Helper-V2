## Завдання

Побудуйте підписані токени — ідею, що стоїть за підписаними cookie, підписами вебхуків і JWT з HS256. Токен має вигляд `<base64url payload>.<base64url підпис>`, де підпис — **HMAC-SHA256** першої частини. Помічники base64url уже написано.

1. **`Sign(payload, key)`**: закодуйте UTF-8 payload у base64url, обчисліть `HMACSHA256(key)` над ASCII-байтами цієї закодованої частини й поверніть `encoded + "." + base64url(signature)`.
2. **`FixedTimeEquals(a, b)`**: для різних довжин поверніть false; інакше накопичуйте XOR кожної пари байтів в акумуляторі й поверніть `accumulator == 0`. Не зупиняйтеся на першій відмінності: це видало б інформацію через час виконання.
3. **`Verify(token, key)`**: розділіть на першій `.` (поверніть null, якщо її немає); декодуйте підпис (поверніть null при `FormatException`); перерахуйте очікуваний HMAC над частиною payload; порівняйте через `FixedTimeEquals`; поверніть декодований payload, якщо підпис дійсний, інакше null.

Останній рядок друкує добре відомий SHA-256 від `hello`.

Очікуваний результат:

```
eyJ1c2VyIjo0Miwicm9sZSI6ImFkbWluIn0.ktHOuCRK4-ZP69XfHeeekiiUgIwhdxfj9PUKWWxlq3I
{"user":42,"role":"admin"}
rejected: payload changed
rejected: wrong key
rejected: malformed
2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
```
