Усе, що ви просите Dataverse зробити, — це **повідомлення** (message): іменована операція з вхідними та вихідними параметрами. Створення запису — повідомлення `Create`, читання — `Retrieve`, кваліфікація ліда — `QualifyLead`. Крок плагіна реєструють на **повідомлення** для **таблиці** (або для всіх таблиць), тож знати повідомлення — означає знати, де може виконуватися ваш код.

## Повідомлення та їхні параметри

| Повідомлення | Коли спрацьовує | Основні InputParameters | Основні OutputParameters |
| --- | --- | --- | --- |
| `Create` | Створюється запис | `Target`: `Entity` | `id`: `Guid` |
| `Update` | Запис змінюється | `Target`: `Entity` лише зі зміненими стовпцями | — |
| `Delete` | Запис видаляється | `Target`: `EntityReference` | — |
| `Retrieve` | Читається один запис | `Target`: `EntityReference`, `ColumnSet` | `BusinessEntity`: `Entity` |
| `RetrieveMultiple` | Виконується запит (подання, lookup, API) | `Query`: QueryExpression або FetchExpression | `BusinessEntityCollection` |
| `Associate` / `Disassociate` | Додається чи прибирається зв'язок N:N | `Target`, `Relationship`, `RelatedEntities` | — |
| `Assign` | Змінюється власник | `Target`, `Assignee` | — |
| `SetState` / `SetStateDynamicEntity` | Змінюється статус (старіші повідомлення) | `EntityMoniker`, `State`, `Status` | — |

Багато повідомлень специфічні для таблиць: `QualifyLead`, `WinOpportunity`, `LoseOpportunity`, `Merge`, `Send` (email), `GrantAccess`, `AddMember` та інші. Ваші **Custom API** — теж повідомлення з параметрами, які ви визначили.

## Які повідомлення підтримує таблиця

Підтримувані поєднання самі є даними: таблиця `sdkmessage` перелічує повідомлення, а `sdkmessagefilter` каже, для яких таблиць доступне кожне. Plug-in Registration Tool читає їх, тож пропонує лише допустимі поєднання. Деякі повідомлення, як-от `Associate`, реєструються одразу для **всіх** таблиць; ваш код має сам перевіряти ім'я зв'язку в `InputParameters["Relationship"]`.

## Спеціалізовані та звичайні оновлення

Старий код змінював власника через `AssignRequest`, а статус — через `SetStateRequest`. Сьогодні рекомендовано звичайний `Update`, що задає `ownerid` чи `statecode`/`statuscode`. Для зворотної сумісності платформа в багатьох таких випадках досі запускає кроки, зареєстровані на старих повідомленнях; точну поведінку звіряйте з документацією, а нові плагіни реєструйте на `Update` з filtering attributes на цих стовпцях.

## Масові повідомлення

`CreateMultiple`, `UpdateMultiple` і `UpsertMultiple` обробляють багато записів одним запитом і набагато швидші для інтеграцій. Плагіни, зареєстровані на `Create` і `Update`, і далі виконуються для кожного запису; для великих навантажень можна реєструватися просто на масове повідомлення й обробляти колекцію `Targets` за один раз.

## Повідомлення читання потребують обережності

Кроки на `Retrieve` і `RetrieveMultiple` виконуються щоразу, коли відкривається форма, завантажується подання чи lookup шукає записи. Вони можуть маскувати дані чи додавати до результатів обчислені значення, але все повільне там сповільнює весь застосунок. Використовуйте їх рідко й тримайте легкими.

## Повідомлення в коді

Один клас плагіна може обслуговувати кілька кроків, тож код часто перевіряє, де він виконується:

```csharp
switch (context.MessageName)
{
    case "Create":
    case "Update":
        var target = (Entity)context.InputParameters["Target"];
        break;
    case "Delete":
        var deleted = (EntityReference)context.InputParameters["Target"];
        break;
}
```

`context.PrimaryEntityName` каже, яка таблиця, `context.Stage` — етап, а `context.Mode` — чи крок синхронний (0) або асинхронний (1).

## На співбесіді

- Поясніть, що таке повідомлення, і наведіть п'ять прикладів, крім CRUD.
- Скажіть, що є Target для Create, Update і Delete.
- Поясніть, чим ризиковані кроки на Retrieve і RetrieveMultiple.
- Поясніть, чому новий код має обробляти зміну власника й статусу на Update.
