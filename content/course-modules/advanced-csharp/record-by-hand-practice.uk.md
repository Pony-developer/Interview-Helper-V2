## Завдання

Ця практика виконується на C# 7.3, де немає ключового слова `record`. Напишіть власноруч те, що компілятор згенерував би для

```csharp
public record Money(decimal Amount, string Currency);
```

Додайте до класу `Money`:

1. **`WithAmount(decimal amount)`**: новий `Money` з іншою сумою й тією самою валютою (аналог виразу `with`).
2. **`Deconstruct(out decimal amount, out string currency)`**.
3. **`Equals(Money other)`** (з `IEquatable<Money>`) і **`Equals(object obj)`**: рівні, коли рівні і Amount, і Currency; `false` для null.
4. **`GetHashCode()`**: поєднайте обидва поля так, щоб рівні об'єкти мали рівні хеш-коди.
5. **`operator ==` і `operator !=`**: безпечні щодо null. Обережно: якщо всередині написати `left == null`, викличеться ваш же оператор рекурсивно. Використовуйте `ReferenceEquals(left, null)`.
6. **`ToString()`** у стилі record: `Money { Amount = 10, Currency = EUR }`.

Очікуваний результат:

```
Money { Amount = 10, Currency = EUR }
Money { Amount = 25, Currency = EUR }
a == b: True, same object: False
a.Equals(c): False, a != c: True
hash equal: True
null == null: True, a == null: False
distinct: 2
EUR 25
```
