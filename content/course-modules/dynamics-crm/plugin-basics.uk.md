**Плагін** — це клас на C#, який платформа запускає, коли для таблиці обробляється повідомлення (Create, Update, Delete, Assign, Custom API…). Плагіни — інструмент для серверних правил, які мають виконуватися завжди, хоч би звідки прийшла зміна: з форми, імпорту, flow чи інтеграції.

## Інтерфейс

```csharp
using Microsoft.Xrm.Sdk;

public class AccountNumberPlugin : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
        var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
        IOrganizationService service = factory.CreateOrganizationService(context.UserId);

        if (!(context.InputParameters.TryGetValue("Target", out var value) && value is Entity target)) return;
        if (target.LogicalName != "account") return;

        tracing.Trace("Depth {0}, message {1}", context.Depth, context.MessageName);
        if (!target.Contains("accountnumber"))
            target["accountnumber"] = "ACC-" + DateTime.UtcNow.ToString("yyMMddHHmmss");
    }
}
```

Усе береться з `IServiceProvider`:

- **`IPluginExecutionContext`**: що відбувається. `MessageName`, `PrimaryEntityName`, `Stage`, `Mode` (синхронно чи асинхронно), `Depth`, `UserId` та `InitiatingUserId`, `InputParameters` і `OutputParameters`, `PreEntityImages` і `PostEntityImages`, а також `SharedVariables` для передавання даних між кроками однієї операції.
- **`IOrganizationServiceFactory`**: створює `IOrganizationService`. Передайте `context.UserId`, щоб діяти з привілеями користувача (або користувача, вказаного в кроці), чи `null`, щоб працювати від імені SYSTEM.
- **`ITracingService`**: діагностичні повідомлення, що з'являються в журналі трасування плагінів і в деталях помилки, коли плагін падає.
- Також доступні `ILogger` (Application Insights) та `IServiceEndpointNotificationService` для надсилання в Azure.

## Target

Для Create і Update `InputParameters["Target"]` — це `Entity` зі стовпцями, які зберігаються. Для Update там **лише змінені стовпці**, а не весь запис. Для Delete Target — це `EntityReference`. Зміна Target на етапі перед збереженням змінює те, що буде збережено, без додаткового виклику API.

## Помилки

Киньте **`InvalidPluginExecutionException`**, щоб зупинити операцію й показати повідомлення користувачеві:

```csharp
if (target.GetAttributeValue<Money>("creditlimit")?.Value < 0)
    throw new InvalidPluginExecutionException("The credit limit cannot be negative.");
```

Будь-який інший необроблений виняток теж зупиняє операцію, але користувач бачить загальну помилку. Перехоплюйте винятки, які можете обробити, трасуйте те, що знаєте, а решту перетворюйте на `InvalidPluginExecutionException` зі зрозумілим повідомленням.

## Збирання та реєстрація

1. Створіть бібліотеку класів для **.NET Framework 4.6.2** (`pac plugin init` генерує шаблон) і додайте посилання на `Microsoft.CrmSdk.CoreAssemblies`.
2. **Підпишіть** збірку ключем строгого імені. Якщо потрібні інші NuGet-пакети, зберіть **пакет плагіна** (`.nupkg`), а не зливайте DLL.
3. Зареєструйте збірку через **Plug-in Registration Tool** (або `pac`), потім зареєструйте **крок** (step) для кожного повідомлення: повідомлення, таблиця, етап, режим, порядок (rank), filtering attributes, користувач, від якого виконувати, і образи.
4. Додайте збірку та її кроки до свого рішення.

Плагіни виконуються в ізольованій **пісочниці**: без файлової системи, без реєстру, з обмеженим доступом до мережі (HTTP і HTTPS лише за іменами хостів) і з тайм-аутом **2 хвилини** на виконання.

## Відсутність стану

Платформа створює екземпляр плагіна й **кешує** його, а потім викликає `Execute` для багатьох запитів, можливо, з кількох потоків одночасно. Ніколи не зберігайте дані запиту в полях класу плагіна: дані одного користувача можуть потрапити в запит іншого. Конфігурація лише для читання з конструктора (рядки *unsecure* і *secure* конфігурації кроку) — нормально.

## На співбесіді

- Поясніть, що `IServiceProvider` дає плагіну, і різницю між `UserId` і `null` у `CreateOrganizationService`.
- Поясніть, що міститься в Target для Create, Update і Delete.
- Поясніть, як показати користувачеві бізнес-помилку.
- Поясніть обмеження пісочниці й чому плагіни мають бути без стану.
