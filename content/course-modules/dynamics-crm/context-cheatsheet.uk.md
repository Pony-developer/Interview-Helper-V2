Кожен плагін починається однаково: отримати контекст, подивитися, що зберігається, вирішити, чи діяти. Тримайте цю сторінку відкритою, поки пишете перші плагіни.

## Перші рядки

```csharp
public void Execute(IServiceProvider serviceProvider)
{
    var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
    var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
    var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
    var service = factory.CreateOrganizationService(context.UserId);   // лише коли треба читати чи писати
    // …
}
```

| Сервіс | Для чого |
| --- | --- |
| `IPluginExecutionContext` | Що відбувається: повідомлення, таблиця, стадія, дані |
| `ITracingService` | Запис діагностичних рядків у журнал трасування |
| `IOrganizationServiceFactory` | Створення `IOrganizationService` для читання чи запису інших рядків |

## Що каже контекст

| Властивість | Приклад | Значення |
| --- | --- | --- |
| `MessageName` | `"Create"` | Операція |
| `PrimaryEntityName` | `"account"` | Логічне ім'я таблиці |
| `PrimaryEntityId` | GUID | Id рядка (порожній на PreOperation для Create) |
| `Stage` | `10`, `20`, `40` | PreValidation, PreOperation, PostOperation |
| `Mode` | `0`, `1` | Синхронно, асинхронно |
| `Depth` | `1` | 1, коли почав користувач; більше, коли причина — інший плагін чи потік |
| `UserId` | GUID | З чиїми правами виконується крок |
| `InitiatingUserId` | GUID | Хто насправді почав операцію |
| `InputParameters` | `["Target"]` | Дані запиту |
| `OutputParameters` | `["id"]` | Результати, доступні на PostOperation |
| `PreEntityImages`, `PostEntityImages` | `["PreImage"]` | Знімки, зареєстровані на кроці |
| `SharedVariables` | | Дані, що передаються між кроками однієї операції |

## Що в Target

| Повідомлення | `InputParameters["Target"]` | Примітки |
| --- | --- | --- |
| Create | `Entity` | Усі стовпці, що задаються. На PreOperation ще без id |
| Update | `Entity` | **Лише змінені стовпці** плюс id |
| Delete | `EntityReference` | Лише таблиця й id; зареєструйте pre-image, якщо потрібні старі значення |
| Assign | `EntityReference` | Новий власник у `InputParameters["Assignee"]` |
| SetState | `EntityReference` | Новий стан у `InputParameters["State"]` і `["Status"]` |

Завжди перевіряйте тип перед приведенням, бо той самий клас плагіна може бути зареєстрований на кілька повідомлень:

```csharp
if (!context.InputParameters.Contains("Target") || !(context.InputParameters["Target"] is Entity target))
    return;
```

## Яка стадія для чого

| Стадія | Усередині транзакції? | Типове використання |
| --- | --- | --- |
| 10 PreValidation | Ні | Дешеві перевірки, що рано відхиляють запит |
| 20 PreOperation | Так | Змінити значення в `Target` до збереження: типові значення, форматування, обчислені значення |
| 40 PostOperation | Так (синхронно) | Створити чи оновити **інші** рядки: запис уже має id |

На PreValidation і PreOperation **змінюйте `Target` напряму**: усе, що ви туди покладете, збережеться, `service.Update` не потрібен. На PostOperation рядок уже записано; зміна `Target` нічого не дає, а повторне оновлення того самого рядка запускає ще одне коло плагінів.

## Як кинути помилку

```csharp
throw new InvalidPluginExecutionException("Email is required.");
```

Повідомлення бачить користувач, тож пишіть його для нього, а не для розробників. У синхронному кроці скасовується все збереження.

## П'ять помилок новачків

1. Використовувати `target["name"]`, коли стовпця може не бути: беріть `GetAttributeValue` або `Contains`.
2. Задавати типові значення на Update: на Update відсутній стовпець означає «не змінено».
3. Викликати `service.Update` для Target на PreOperation: просто змініть `Target`.
4. Забувати, що Target у Delete — це `EntityReference`.
5. Писати відображувані імена (`"Credit Limit"`) замість логічних (`"creditlimit"`).

Три практики після квізу тренують саме ці звички.
