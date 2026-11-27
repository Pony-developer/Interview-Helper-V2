## Повний приклад з xUnit і підробкою (П51–53)

```csharp
public interface IClock { DateTime UtcNow { get; } }

public class DiscountService(IClock clock)
{
    public decimal Apply(decimal price) =>
        clock.UtcNow.DayOfWeek == DayOfWeek.Friday ? price * 0.8m : price;
}

public class DiscountServiceTests
{
    private sealed class FakeClock(DateTime now) : IClock { public DateTime UtcNow => now; }

    [Fact]
    public void Friday_gives_20_percent_off()
    {
        // Arrange
        var service = new DiscountService(new FakeClock(new DateTime(2026, 11, 27)));   // п'ятниця
        // Act
        var result = service.Apply(100m);
        // Assert
        Assert.Equal(80m, result);
    }

    [Theory]
    [InlineData(2026, 11, 23)]   // понеділок
    [InlineData(2026, 11, 29)]   // неділя
    public void Other_days_keep_the_price(int y, int m, int d)
    {
        var service = new DiscountService(new FakeClock(new DateTime(y, m, d)));
        Assert.Equal(100m, service.Apply(100m));
    }
}
```

Зверніть увагу, чому тест узагалі можливий: `DateTime.UtcNow` сховано за `IClock` (з .NET 8 можна використати вбудований `TimeProvider`). Код, що напряму читає годинник, мережу чи статичні члени, важко тестувати — тестованість є властивістю дизайну.

## Моки з Moq

```csharp
var repo = new Mock<IOrderRepository>();
repo.Setup(r => r.GetAsync(42)).ReturnsAsync(new Order(42, total: 100m));
var email = new Mock<IEmailSender>();

var service = new OrderService(repo.Object, email.Object);
await service.ConfirmAsync(42);

email.Verify(e => e.SendAsync(It.Is<string>(s => s.Contains("42"))), Times.Once);
```

- **Стаб/підробка**: повертає заготовлені дані. **Мок**: ви ще й перевіряєте, як його викликали. Краще перевіряйте результати й стан; виклики перевіряйте лише тоді, коли виклик *і є* поведінкою (лист мусить піти).
- Не мокайте глибоко те, що вам не належить (EF `DbContext`, `HttpClient`): використовуйте тестову базу чи базу в пам'яті, підроблений `HttpMessageHandler` або тестуйте цей шар інтеграційними тестами.

## Що робить тест добрим

**FIRST**: Fast (швидкий), Independent (без спільного стану, у будь-якому порядку), Repeatable (без реального часу, мережі, random без seed), Self-validating (перевірки, а не вивід у консоль, який треба читати), Timely (пишеться разом із кодом).

- Називайте тести за поведінкою: `Withdraw_more_than_balance_throws`, `MethodName_State_ExpectedResult`.
- Одна логічна поведінка на тест; кілька перевірок — нормально, якщо вони перевіряють один результат.
- Тестуйте граничні випадки: порожньо, null, нуль, від'ємні, межі (`<` чи `<=`), великі входи, дублікати.
- Тестуйте поведінку через публічний API, а не приватні методи чи деталі реалізації — тоді рефакторинг не ламає тести.

## Переваги й недоліки (П52)

| Переваги | Недоліки |
|---|---|
| Ловлять регресії за секунди | Час на написання й підтримку |
| Безпечний рефакторинг | Не доводять, що частини працюють разом |
| Жива документація | Тести з надлишком моків ламаються на кожному рефакторингу |
| Ведуть до слабко зв'язаного дизайну (TDD) | 100% покриття ≠ відсутність багів; покриття може стати метрикою заради метрики |

Інструменти: xUnit / NUnit / MSTest, Moq / NSubstitute / FakeItEasy, FluentAssertions чи Shouldly, coverlet для покриття, `dotnet test` у CI.
