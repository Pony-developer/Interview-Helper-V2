Другий плагін робить справжню роботу: щойно створюється новий акаунт, він створює **завдання для подальшої дії** (follow-up task) для власника акаунта, щоб ніхто не забув про вітальний дзвінок. Він використовує **сервіс організації**, щоб читати й записувати інші записи.

## Вибір кроку

- **Повідомлення й таблиця**: `Create` для `account`.
- **Етап**: **PostOperation**. Lookup *Regarding* завдання потребує id акаунта, який існує лише після основної операції.
- **Режим**: **синхронний**, якщо завдання має існувати тієї ж миті, коли форма перезавантажиться, або якщо невдача з його створенням має скасувати акаунт. **Асинхронний**, якщо кілька секунд затримки прийнятні й акаунт має зберегтися, навіть коли завдання створити не вдалося. Тут — синхронний.

## Код

```csharp
public class FollowUpTaskPlugin : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
        var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));

        if (context.MessageName != "Create" || context.PrimaryEntityName != "account" || context.Stage != 40 ||
            !(context.InputParameters["Target"] is Entity target))
            return;

        // Виклики виконуються з привілеями користувача, що створив акаунт
        IOrganizationService service = factory.CreateOrganizationService(context.UserId);

        var task = new Entity("task");
        task["subject"] = "Welcome call: " + target.GetAttributeValue<string>("name");
        task["regardingobjectid"] = new EntityReference("account", context.PrimaryEntityId);
        task["scheduledend"] = DateTime.UtcNow.AddDays(2);
        task["prioritycode"] = new OptionSetValue(1);              // 0 Low, 1 Normal, 2 High

        var primaryContact = target.GetAttributeValue<EntityReference>("primarycontactid");
        if (primaryContact != null)
        {
            var contact = service.Retrieve("contact", primaryContact.Id, new ColumnSet("fullname"));
            task["description"] = "Primary contact: " + contact.GetAttributeValue<string>("fullname");
        }

        Guid taskId = service.Create(task);
        tracing.Trace("Created task {0} for account {1}", taskId, context.PrimaryEntityId);
    }
}
```

## На що варто звернути увагу

- **`regardingobjectid`** пов'язує активність із записом, якого вона стосується, тож завдання з'являється на **стрічці подій** (timeline) акаунта. Це lookup, тому він приймає `EntityReference`.
- **Власність**: новий запис належить користувачу, від імені якого працює сервіс, якщо ви не задали `ownerid`. З `context.UserId` завдання належить тому, хто створив акаунт. З `CreateOrganizationService(null)` воно належало б SYSTEM, і ніхто не побачив би його в «Моїх завданнях». Щоб віддати його власнику акаунта, задайте `task["ownerid"] = target.GetAttributeValue<EntityReference>("ownerid")`.
- **Значення choice** — числа: звіряйте їх у метаданих (`prioritycode`: 0 Low, 1 Normal, 2 High) і віддавайте перевагу іменованим константам або early-bound переліках, а не «магічним» числам.
- **Дати** записуються в UTC.
- **Глибина**: `service.Create(task)` запускає повідомлення `Create` для `task` з власним конвеєром на глибині 2. Якщо інший плагін на створення завдання оновлює акаунт, можна отримати цикл; знайте, що зареєстровано навколо ваших таблиць.
- **Транзакції**: на синхронному кроці PostOperation завдання створюється в тій самій транзакції, що й акаунт. Якщо `Create` впаде, акаунт теж не збережеться.

## Реєстрація та перевірка

Зареєструйте крок **Create / account / PostOperation / Synchronous**, створіть акаунт з основним контактом і відкрийте його стрічку подій: завдання там, пов'язане з акаунтом, з іменем контакту в описі. Перевірте рядок «Created task» у журналі трасування.

## Варіації, які варто спробувати

- Робіть завдання з пріоритетом **High**, коли кредитний ліміт перевищує поріг.
- Читайте кількість днів з **unsecure configuration** кроку замість зашитого числа 2.
- Створюйте завдання лише для акаунтів певного **типу** (`customertypecode`) і налаштуйте **фільтрацію**, щоб для всіх інших плагін був дешевим.

Практика наприкінці модуля просить написати версію цього плагіна.

## На співбесіді

- Поясніть, чому цей плагін працює на PostOperation і як ви обирали б між синхронним і асинхронним режимом.
- Поясніть, кому належить запис, створений плагіном, і як це змінити.
- Поясніть, що таке `regardingobjectid`.
- Поясніть, що станеться з акаунтом, якщо створити завдання не вдасться.
