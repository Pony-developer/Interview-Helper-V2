## Проблема

```csharp
public class OrderService
{
    private readonly SqlOrderRepository repository = new SqlOrderRepository();
    private readonly SmtpEmailSender email = new SmtpEmailSender();

    public void Place(Order order)
    {
        repository.Save(order);
        email.Send(order.CustomerEmail, "Your order is placed");
    }
}
```

Цей клас сам вирішує, **яку** базу даних і **який** поштовий сервер використовувати. Як наслідок:

- модульний тест `Place` пише в справжню базу і надсилає справжні листи;
- перехід на іншу базу означає редагування `OrderService`;
- читач не бачить залежностей ззовні: вони сховані всередині.

## Інверсія та впровадження залежностей

**Принцип інверсії залежностей** (буква «D» у SOLID): високорівневий код (бізнес-правила) має залежати від **абстракцій**, а не від низькорівневих деталей (SQL, SMTP).

**Впровадження залежностей** (dependency injection, DI) — техніка, що цього досягає: клас не створює своїх залежностей, а **отримує** їх ззовні.

```csharp
public class OrderService
{
    private readonly IOrderRepository repository;
    private readonly IEmailSender email;

    public OrderService(IOrderRepository repository, IEmailSender email)
    {
        this.repository = repository ?? throw new ArgumentNullException(nameof(repository));
        this.email = email ?? throw new ArgumentNullException(nameof(email));
    }

    public void Place(Order order) { /* той самий код */ }
}
```

Тепер тест передає фальшивий репозиторій і фальшивого відправника, а робочий код — справжні. `OrderService` не змінився.

Загальну ідею «хтось інший створює мої залежності й керує ними» називають **інверсією керування** (Inversion of Control, IoC).

## Три способи впровадження

- **Через конструктор** (за замовчуванням): залежності обов'язкові, видимі в сигнатурі, а об'єкт повний одразу після `new`.
- **Через властивість**: для необов'язкових залежностей із розумним значенням за замовчуванням.
- **Через метод**: залежність, потрібна лише одному виклику, передається параметром (`Handle(request, CancellationToken token)`).

## Корінь композиції

Об'єкти з'єднують в **одному місці** на старті застосунку, зазвичай у `Program.cs`. Усюди інде класи лише просять потрібне через свої конструктори. Конкретні класи знає тільки корінь композиції (composition root).

## Два тривожні сигнали

- **Service Locator**: клас викликає `ServiceLocator.Get<IRepository>()` усередині своїх методів. Залежності знову сховані, а тест мусить налаштовувати глобальний локатор. Це вважають антипатерном.
- **Конструктор з багатьма параметрами** (понад чотири-п'ять): клас, найімовірніше, робить забагато. Розділіть його, а не ховайте залежності.

## Правило

Просіть залежності в конструкторі, залежте від інтерфейсів, а конкретні об'єкти створюйте лише в корені композиції.
