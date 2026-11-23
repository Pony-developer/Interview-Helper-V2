Зареєструвати плагін, поклацати форму й читати журнал трасування — повільний спосіб шукати помилку. Плагіни можна покривати модульними тестами, як будь-який інший код на C#, якщо проєктувати їх для цього.

## Тонкий Execute

`Execute` має лише розпакувати контекст і передати роботу звичайному C#:

```csharp
public class AccountPhoneSyncPlugin : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.Get<IPluginExecutionContext>();
        var service = serviceProvider.Get<IOrganizationServiceFactory>().CreateOrganizationService(context.UserId);
        var target = (Entity)context.InputParameters["Target"];

        new AccountPhoneSync(service).Run(target);
    }
}

public class AccountPhoneSync
{
    private readonly IOrganizationService service;
    public AccountPhoneSync(IOrganizationService service) => this.service = service;

    public int Run(Entity target) { /* бізнес-правило */ }
}
```

(`Get<T>` — невеликий метод розширення над `GetService(typeof(T))`.) Клас правила залежить лише від `IOrganizationService` і простих даних, тож тест може дати йому будь-яку реалізацію цього інтерфейсу.

Багато команд також використовують **базовий клас плагіна**, що один раз будує «локальний контекст» (контекст, сервіси, трасування, логер) і викликає абстрактний метод. Шаблон `pac plugin init` від Microsoft генерує такий клас.

## Три способи дати коду сервіс

1. **Моки** (Moq, NSubstitute): налаштовуєте рівно ті виклики, на які очікуєте. Точно, але тести перетворюються на сценарій викликів SDK і ламаються під час рефакторингу запиту.
2. **Фейк** `IOrganizationService` у пам'яті: створюєте записи в тесті, запускаєте код, читаєте записи назад. Популярна бібліотека **FakeXrmEasy** робить саме це, ще й виконує QueryExpression і FetchXML, запускає зареєстровані плагіни у фейковому конвеєрі та імітує багато повідомлень.
3. **Інтеграційні тести** на справжньому dev-середовищі через `ServiceClient`: повільні й потребують прибирання, але перевіряють реєстрацію, безпеку та справжню поведінку платформи.

Добре поєднання: багато модульних тестів із фейком для правил і кілька інтеграційних тестів для кожного важливого сценарію.

## Що тестувати

```csharp
[Fact]
public void Copies_phone_only_to_contacts_that_opted_in()
{
    var service = new FakeOrganizationService();
    var accountId = service.Create(new Entity("account") { ["name"] = "Contoso" });
    service.Create(Contact("Olena", accountId, syncPhone: true));
    service.Create(Contact("Taras", accountId, syncPhone: false));

    var target = new Entity("account", accountId) { ["telephone1"] = "222" };
    var updated = new AccountPhoneSync(service).Run(target);

    Assert.Equal(1, updated);
}
```

- Саме правило: щасливий шлях, відсутні стовпці (пам'ятайте, що Target для Update містить лише змінені), порожні значення.
- Обробку контексту: не та таблиця, не те повідомлення, відсутні образи, глибина.
- Випадки помилок: плагін кидає `InvalidPluginExecutionException` з правильним повідомленням.

## Сервіс трасування

`ITracingService.Trace` — ваш журнал у продакшні. Трасуйте важливі рішення («оновити 3 контакти»), а не кожен рядок. Записи з'являються в **журналі трасування плагінів** (увімкніть його в системних налаштуваннях: *Exception* або *All*) і в деталях помилки, які можна завантажити. Для багатшої телеметрії вбудований `ILogger` надсилає логи в Application Insights, коли середовище під'єднане до нього.

## Налагодження живого середовища

**Plug-in Registration Tool** уміє записати справжнє виконання в **профіль** і відтворити його у Visual Studio з точками зупину — це plug-in profiler. Так відтворюють помилку, яка трапляється лише з продакшн-даними, не під'єднуючи налагоджувач до сервера.

## На співбесіді

- Поясніть, як ви структуруєте плагін, щоб логіку можна було тестувати.
- Порівняйте моки, фейк у пам'яті (FakeXrmEasy) та інтеграційні тести.
- Скажіть, що ви тестуєте в плагіні, крім щасливого шляху.
- Поясніть журнал трасування та plug-in profiler.
