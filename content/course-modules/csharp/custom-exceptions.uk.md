Стандартні винятки покривають більшість випадків. Створюйте власний клас лише тоді, коли він дає викликаючому щось нове:

- викликаючому треба **перехоплювати цю проблему окремо** від інших (відхилена картка проти збою мережі);
- виняток має **нести дані**, якими викликаючий користується (баланс і запитана сума).

Якщо жодне не так, киньте стандартний виняток із добрим повідомленням.

## Як його написати

```csharp
public class InsufficientFundsException : InvalidOperationException
{
    public decimal Balance { get; }
    public decimal Requested { get; }

    public InsufficientFundsException(decimal balance, decimal requested)
        : base("Requested " + requested + ", but the balance is " + balance)
    {
        Balance = balance;
        Requested = requested;
    }

    public InsufficientFundsException(string message, Exception inner)
        : base(message, inner)
    {
    }
}
```

Домовленості:

- назва закінчується на `Exception`;
- клас успадковується від `Exception` або від конкретнішого стандартного винятку, що пасує за змістом (тут — `InvalidOperationException`), щоб старі блоки `catch` і далі працювали;
- повідомлення передають **базовому конструктору** через `: base(message)`. Без цього `Message` залишиться загальним «Exception of type ... was thrown»;
- додаткові дані — властивості лише для читання, задані в конструкторі;
- є конструктор, що приймає `inner`-виняток, щоб клас можна було використовувати для обгортання.

Старий «конструктор серіалізації» й атрибут `[Serializable]` у сучасному .NET не потрібні.

## Родина винятків

Бібліотека часто оголошує один базовий клас і кілька конкретних:

```csharp
public class PaymentException : Exception { /* конструктори */ }
public class CardDeclinedException : PaymentException { /* ... */ }
public class FraudSuspectedException : PaymentException { /* ... */ }
```

Викликаючий сам обирає рівень деталізації: `catch (CardDeclinedException)` для одного випадку або `catch (PaymentException)` для всіх проблем з оплатою одразу.

## Чого не класти в повідомлення

Повідомлення потрапляють у логи, а іноді й на екран. Не кладіть туди паролі, токени чи повні номери карток.

## Правило

Власний виняток — частина вашого API. Створюйте його, коли викликаючий буде його перехоплювати або читати його дані, успадковуйте від найближчого стандартного класу, передавайте повідомлення в `base`, а дані зберігайте у властивостях лише для читання.
