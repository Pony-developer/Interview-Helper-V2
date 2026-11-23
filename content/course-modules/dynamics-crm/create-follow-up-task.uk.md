Напишіть справжній плагін. У програмі є невелика модель SDK Dataverse з тими самими іменами, що й у `Microsoft.Xrm.Sdk` (`IPlugin`, `IPluginExecutionContext`, `IOrganizationServiceFactory`, `ITracingService`, `Entity`, `EntityReference`, `OptionSetValue`, `Money`, `ColumnSet`), і фейкова платформа, що зберігає записи в пам'яті й викликає ваш плагін так, як це робить конвеєр. Код, який ви напишете, майже без змін скомпілюється зі справжнім SDK.

`FollowUpTaskPlugin` зареєстровано на **Create** для **account**, **PostOperation (етап 40)**, синхронно. Реалізуйте `Execute`:

1. Отримайте `IPluginExecutionContext`, `ITracingService` і `IOrganizationServiceFactory` через `serviceProvider.GetService(typeof(...))`.
2. Якщо повідомлення не `Create`, таблиця не `account`, етап не `40` або в `InputParameters` немає `Target` типу `Entity`, трасуйте `Skipped: <повідомлення> of <таблиця>` (через `tracing.Trace("Skipped: {0} of {1}", …)`) і поверніться.
3. Створіть сервіс через `factory.CreateOrganizationService(context.UserId)`, щоб завдання належало користувачу, який створив акаунт.
4. Зберіть сутність `task`:
   - `subject`: `Welcome call: <назва акаунта>`;
   - `regardingobjectid`: `EntityReference` на акаунт (`context.PrimaryEntityId`);
   - `prioritycode`: `OptionSetValue(2)` (High), коли `creditlimit` акаунта (`Money`) перевищує 100000, інакше `OptionSetValue(1)` (Normal). Акаунт без кредитного ліміту — Normal.
   - Якщо в акаунта є `primarycontactid`, отримайте `fullname` цього контакту через `service.Retrieve` і задайте `description` значення `Primary contact: <fullname>`. Lookup-поля в Target не мають назв, тож доведеться отримати запис.
5. Створіть завдання через `service.Create` і трасуйте `Task created for <назва акаунта>`.

Не змінюйте фейкову платформу й `Main`. Очікуваний результат:

```text
== Create account Contoso
  trace: Task created for Contoso
== Create account Fabrikam
  trace: Task created for Fabrikam
== Update account Contoso Ltd
  trace: Skipped: Update of account
== Create contact Taras Melnyk
  trace: Skipped: Create of contact
Tasks:
  Welcome call: Contoso | priority 2 | regarding Contoso Ltd | owner Anna Shevchenko | Primary contact: Olena Koval
  Welcome call: Fabrikam | priority 1 | regarding Fabrikam | owner Anna Shevchenko | -
```

Завдання показує *поточну* назву акаунта (Contoso Ltd), бо lookup regarding указує на запис, а не на копію його назви. Якщо власником показано SYSTEM, сервіс створено з `null` замість `context.UserId`.

Підказка: `target.GetAttributeValue<Money>("creditlimit")` повертає `null`, коли стовпця немає, тож перевірте на `null`, перш ніж читати `.Value`. Читання `target["creditlimit"]` натомість кинуло б виняток для Fabrikam.
