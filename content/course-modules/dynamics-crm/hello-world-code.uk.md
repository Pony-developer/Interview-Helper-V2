Проєкт готовий. Перший плагін робить щось невелике, але помітне: коли створюється акаунт, він записує привітання в опис акаунта й трасує, що зробив.

## Код

```csharp
using System;
using Microsoft.Xrm.Sdk;

namespace Contoso.Plugins.Accounts
{
    // Крок: Create для account, PreOperation (20), синхронно
    public class HelloWorldPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // 1. Отримуємо те, що платформа дає кожному плагіну
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            tracing.Trace("HelloWorld: {0} of {1}, stage {2}, depth {3}",
                context.MessageName, context.PrimaryEntityName, context.Stage, context.Depth);

            // 2. Переконуємося, що виконуємося там, де очікуємо
            if (context.MessageName != "Create" ||
                !(context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity target) ||
                target.LogicalName != "account")
            {
                return;
            }

            try
            {
                // 3. Робота: змінюємо Target до збереження
                string name = target.GetAttributeValue<string>("name") ?? "(no name)";
                target["description"] = $"Hello, {name}! Created at {DateTime.UtcNow:u}.";
                tracing.Trace("Description set for {0}", name);
            }
            catch (Exception ex) when (!(ex is InvalidPluginExecutionException))
            {
                tracing.Trace(ex.ToString());
                throw new InvalidPluginExecutionException("HelloWorldPlugin failed: " + ex.Message, ex);
            }
        }
    }
}
```

## Що робить кожна частина

**`IServiceProvider`** — це набір інструментів плагіна. Попросіть у нього:

- **`IPluginExecutionContext`**: що відбувається: `MessageName`, `PrimaryEntityName`, `PrimaryEntityId`, `Stage`, `Mode`, `Depth`, `UserId`, `InitiatingUserId`, `InputParameters`, `OutputParameters`, `PreEntityImages`, `PostEntityImages`, `SharedVariables`.
- **`ITracingService`**: рядки, що з'являються в журналі трасування плагінів і в деталях помилки.
- **`IOrganizationServiceFactory`**: створює `IOrganizationService` для читання й запису інших записів (його використовують наступні лекції). `CreateOrganizationService(context.UserId)` працює з привілеями користувача; `null` — від імені SYSTEM.
- Також `ILogger` для Application Insights та `IServiceEndpointNotificationService` для надсилання в ендпоінти Azure.

**Перевірка** контролює повідомлення й таблицю. Крок реєструють для конкретного повідомлення й таблиці, але той самий клас часто використовують повторно або помилково реєструють не на тому кроці; тихо вийти краще, ніж кинути виняток приведення типу.

**Зміна Target** працює, бо крок виконується на **PreOperation**: платформа ще не зберегла запис, тож усе, що ви покладете в Target, буде збережено разом із ним. На PostOperation той самий рядок нічого б не зробив.

**Помилки**: `InvalidPluginExecutionException` показує своє повідомлення користувачеві й відкочує операцію. Будь-який інший виняток теж зупиняє збереження, але показує загальну помилку, тож обгортайте неочікувані винятки й трасуйте подробиці.

## Правила, яких дотримується кожен плагін

- **Без стану**: платформа кешує екземпляр плагіна й може викликати `Execute` для багатьох запитів одночасно. Ніколи не зберігайте дані запиту в полях. Конфігурація лише для читання — нормально:

```csharp
public HelloWorldPlugin(string unsecureConfig, string secureConfig)
{
    greeting = string.IsNullOrEmpty(unsecureConfig) ? "Hello" : unsecureConfig;   // задається для кожного кроку під час реєстрації
}
```

- **Швидко**: синхронний код тримає транзакцію відкритою; пісочниця зупиняє виконання через 2 хвилини.
- **Обережно**: стовпців може не бути в Target, lookup-поля можуть бути порожніми, а запис може прийти з імпорту, а не з форми.

## Популярний перший тест

Багато розробників змушують свій перший плагін навмисно кинути виняток: `throw new InvalidPluginExecutionException("Hello World!")`. Тоді під час збереження акаунта з'являється діалог із повідомленням, і це доводить, що реєстрація працює, ще до написання справжньої логіки. Одразу після цього приберіть цей рядок.

## На співбесіді

- Напишіть мінімальний плагін з пам'яті: інтерфейс, сервіси, перевірка, робота, помилки.
- Поясніть, чому опис задається на PreOperation і що було б на PostOperation.
- Поясніть рядки конфігурації конструктора й чому поля не повинні містити дані запиту.
