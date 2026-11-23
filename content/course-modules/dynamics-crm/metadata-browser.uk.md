Код плагіна сповнений імен: `account`, `primarycontactid`, `prioritycode`, значення `2` для High. Помилитеся в одному — і код скомпілюється, але впаде під час виконання. Перш ніж писати рядок коду, знайдіть імена в **метаданих**.

## Що треба знати про таблицю

- **Логічне ім'я** (`account`) та **ім'я набору сутностей** для Web API (`accounts`).
- Стовпці **первинного id** і **основної назви** (`accountid`, `name`).
- **Тип володіння**: користувач/команда чи організація.
- Для кожного стовпця: **логічне ім'я**, **тип** (а отже, тип SDK: `EntityReference`, `OptionSetValue`, `Money`…), чи він обов'язковий, його **значення choice** і підписи, максимальну довжину, **поведінку дати**.
- **Зв'язки**: їхні схемні імена (потрібні для `Associate` і `$expand`), lookup-стовпець, що посилається, налаштування каскаду.

## На порталі мейкерів

**make.powerapps.com → Tables → Account → Columns** показує всі стовпці з відображуваними іменами й типами. Відкрийте стовпець і розгорніть **Advanced options**, щоб побачити **логічне** та **схемне** ім'я. Стовпці choice показують свої варіанти зі значеннями. Для одного стовпця це зручно, для всієї моделі даних — повільно.

## Розширення браузера

Розширення для браузерів на Chromium (Microsoft Edge, Google Chrome), як-от розширення спільноти **Level up for Dynamics 365/Power Apps**, додають кнопки поверх model-driven форми: показати **логічні імена** всіх полів замість підписів, показати приховані поля, відкрити метадані поточної таблиці, скопіювати id запису, відкрити URL запису у Web API. «Показати логічні імена» на формі — найшвидший спосіб відповісти на питання «як називається це поле?». Встановлюйте розширення свідомо й користуйтеся тими, які дозволяє ваша організація.

## XrmToolBox

**XrmToolBox** — безкоштовна десктопна оболонка для інструментів спільноти. Для метаданих:

- **Metadata Browser**: усі таблиці, стовпці, зв'язки й ключі з пошуком та експортом.
- **FetchXML Builder**: візуально будує запити й показує відповідні QueryExpression, Web API та код C#.
- **Early Bound Generator**: генерує типізовані класи.

## Web API

Метадані — це дані, які можна запитувати:

```text
GET [org]/api/data/v9.2/EntityDefinitions(LogicalName='account')?$select=LogicalName,EntitySetName,PrimaryIdAttribute,PrimaryNameAttribute
GET [org]/api/data/v9.2/EntityDefinitions(LogicalName='account')/Attributes?$select=LogicalName,AttributeType,RequiredLevel
GET [org]/api/data/v9.2/EntityDefinitions(LogicalName='task')/Attributes(LogicalName='prioritycode')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$expand=OptionSet
```

Вставте їх у браузер, увійшовши в систему, і побачите JSON.

## З C#

```csharp
var response = (RetrieveAttributeResponse)service.Execute(new RetrieveAttributeRequest
{
    EntityLogicalName = "task",
    LogicalName = "prioritycode",
    RetrieveAsIfPublished = true,
});
var metadata = (PicklistAttributeMetadata)response.AttributeMetadata;
foreach (var option in metadata.OptionSet.Options)
    Console.WriteLine($"{option.Value} = {option.Label.UserLocalizedLabel.Label}");
```

`RetrieveEntityRequest` з `EntityFilters.Attributes | EntityFilters.Relationships` повертає всю таблицю. Плагінам рідко потрібні метадані під час виконання, і це дорого; якщо потрібні — кешуйте їх у статичному потокобезпечному полі.

## Генерація early-bound класів

Найнадійніший спосіб не помилитися в іменах — не набирати їх: `pac modelbuilder build` генерує класи з властивостями, названими за стовпцями, і переліки для choice, тож `account.PrimaryContactId` і `task_prioritycode.High` перевіряє компілятор.

## На співбесіді

- Скажіть, де знайти логічне ім'я стовпця, його тип і значення choice.
- Поясніть різницю між логічним, схемним іменем та ім'ям набору сутностей.
- Покажіть запит Web API для метаданих таблиці.
- Поясніть компроміс між late-bound рядками та згенерованими early-bound класами.
