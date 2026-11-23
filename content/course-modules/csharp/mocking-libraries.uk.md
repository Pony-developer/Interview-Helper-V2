Писати клас-стаб для кожного тесту стає нудно, коли інтерфейс має десять методів. **Бібліотека для моків** створює дублера за вас під час виконання. Дві найпопулярніші в .NET — **Moq** і **NSubstitute**. Вони роблять те саме з різним синтаксисом.

## Moq

```csharp
using Moq;

[Fact]
public void Pay_SuccessfulCharge_SendsReceipt()
{
    // Arrange
    var gateway = new Mock<IPaymentGateway>();
    gateway.Setup(g => g.Charge("4111", 10m)).Returns(true);
    var mailer = new Mock<IMailer>();
    var service = new CheckoutService(gateway.Object, mailer.Object, Mock.Of<IAuditLog>());

    // Act
    bool paid = service.Pay("ann@example.com", "4111", 10m);

    // Assert
    Assert.True(paid);
    mailer.Verify(m => m.Send("ann@example.com", It.Is<string>(t => t.Contains("10"))), Times.Once());
}
```

- `new Mock<T>()` створює дублера; `.Object` — екземпляр, який ви передаєте в код.
- `Setup(...).Returns(...)` робить його стабом. Виклик, який не налаштували, повертає значення за замовчуванням (`false`, `0`, `null`, порожню колекцію).
- `Verify(..., Times.Once())` робить його моком: тест падає, якщо виклик відбувся не рівно один раз.
- `Mock.Of<T>()` — швидкий манекен (dummy).

Що ще трапляється:

```csharp
gateway.Setup(g => g.Charge(It.IsAny<string>(), It.Is<decimal>(a => a > 1000m))).Returns(false);
gateway.Setup(g => g.Charge("0000", It.IsAny<decimal>())).Throws<TimeoutException>();
rates.Setup(r => r.GetAsync("USD", "EUR")).ReturnsAsync(0.92m);
queue.SetupSequence(q => q.Next()).Returns("a").Returns("b").Throws<InvalidOperationException>();
mailer.Setup(m => m.Send(It.IsAny<string>(), It.IsAny<string>()))
      .Callback<string, string>((to, text) => sent.Add(to));
mailer.Verify(m => m.Send(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
```

За замовчуванням мок **вільний** (loose): неочікувані виклики просто повертають значення за замовчуванням. `new Mock<T>(MockBehavior.Strict)` кидає виняток на будь-який неналаштований виклик. Строгі моки ловлять несподіванки, але й ламаються від безпечних змін, тож зазвичай обирають вільні.

## NSubstitute

Той самий тест на NSubstitute ближчий до звичайного C#:

```csharp
using NSubstitute;

var gateway = Substitute.For<IPaymentGateway>();
gateway.Charge("4111", 10m).Returns(true);
var mailer = Substitute.For<IMailer>();
var service = new CheckoutService(gateway, mailer, Substitute.For<IAuditLog>());

bool paid = service.Pay("ann@example.com", "4111", 10m);

Assert.True(paid);
mailer.Received(1).Send("ann@example.com", Arg.Is<string>(t => t.Contains("10")));
```

| | Moq | NSubstitute |
| --- | --- | --- |
| Створити | `new Mock<T>()`, потім `.Object` | `Substitute.For<T>()` |
| Повернути значення | `.Setup(x => x.M()).Returns(5)` | `x.M().Returns(5)` |
| Будь-який аргумент | `It.IsAny<int>()` | `Arg.Any<int>()` |
| Аргумент за умовою | `It.Is<int>(n => n > 0)` | `Arg.Is<int>(n => n > 0)` |
| Перевірити виклик | `.Verify(x => x.M(), Times.Once())` | `x.Received(1).M()` |
| Перевірити, що виклику не було | `Times.Never()` | `x.DidNotReceive().M()` |
| Кинути виняток | `.Throws<E>()` | `.Throws<E>()` (з `NSubstitute.ExceptionExtensions`) |

Яку обрати — справа смаку команди. Moq найпоширеніша. У 2023 році один випуск Moq приніс суперечливу залежність із телеметрією (SponsorLink); її прибрали в наступному патчі, але частина команд після цього перейшла на NSubstitute. Так чи інакше, умійте читати обидві.

## Як вони працюють і чого не вміють

Обидві бібліотеки генерують **підклас під час виконання** (динамічний проксі, побудований на Castle DynamicProxy), що перевизначає члени вашого типу. Підклас може перевизначити лише те, що перевизначається, тож бібліотеки вміють мокати:

- інтерфейси (звичайний випадок);
- `virtual` і `abstract` члени класів.

Вони **не можуть** замокати `sealed`-класи, `static`-методи, невіртуальні методи, конструктори чи методи розширення. Якщо код напряму викликає `File.ReadAllText`, `DateTime.Now` чи статичний помічник, жодна бібліотека для моків його не підмінить. Виправлення — у дизайні: сховати залежність за інтерфейсом (або абстрактним класом, як `TimeProvider`) і впровадити її. Інструменти, що переписують IL під час виконання (Microsoft Fakes, Pose), вміють підміняти статичне, але вони повільні й екзотичні; потреба в них — ознака проблем із дизайном.

> Поширена пастка: налаштування невіртуального методу класу через Moq компілюється, але під час виконання кидає `NotSupportedException` («Non-overridable members may not be used in setup»).

## Фейки кращі за моки для стану

Для залежності зі справжньою поведінкою, як-от репозиторій, невеликий написаний вручну фейк часто зрозуміліший за мок:

```csharp
class InMemoryOrders : IOrderRepository
{
    private readonly Dictionary<int, Order> orders = new Dictionary<int, Order>();
    public void Save(Order order) { orders[order.Id] = order; }
    public Order Find(int id) { Order o; return orders.TryGetValue(id, out o) ? o : null; }
}
```

Ви пишете його раз і використовуєте в сотні тестів, і ці тести перевіряють стан («замовлення збережено як Paid»), а не виклики («`Save` викликано із замовленням, чий `Status` був `Paid`»). Бібліотеки для моків лишіть для меж системи: сповіщень, шлюзів, усього, чий єдиний ефект — сам виклик.

## Arrange, Act, Assert із дублерами

Тест із дублерами все одно має три частини:

1. **Arrange**: створити дублерів і налаштувати відповіді стабів.
2. **Act**: один виклик коду, що тестується.
3. **Assert**: перевірити результат і верифікувати лише ті виклики, що мають значення.

Якщо частина Arrange розростається до двадцяти рядків, винесіть помічник (`CreateService(gateway: ...)`) або будівельник тестових даних (test data builder), щоб кожен тест показував лише те, чим він особливий.
