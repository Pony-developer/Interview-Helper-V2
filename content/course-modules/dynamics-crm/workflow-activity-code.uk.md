Створімо activity **«Отримати значення конфігурації»**: за ключем вона повертає значення з конфігураційної таблиці або типове значення, якщо ключа немає.

## Проєкт

Такий самий проєкт, як для плагінів, і часто та сама збірка:

- бібліотека класів під **.NET Framework 4.6.2**, підписана ключем строгого імені;
- NuGet-пакети **`Microsoft.CrmSdk.CoreAssemblies`** і **`Microsoft.CrmSdk.Workflow`** (він приносить `Microsoft.Xrm.Sdk.Workflow.dll`);
- посилання на збірку фреймворку **`System.Activities`**.

## Клас і його аргументи

```csharp
using System.Activities;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk.Workflow;

public class GetConfigurationValue : CodeActivity
{
    [RequiredArgument]
    [Input("Key")]
    public InArgument<string> Key { get; set; }

    [Input("Default value")]
    [Default("")]
    public InArgument<string> DefaultValue { get; set; }

    [Output("Value")]
    public OutArgument<string> Value { get; set; }

    [Output("Found")]
    public OutArgument<bool> Found { get; set; }

    protected override void Execute(CodeActivityContext executionContext)
    {
        // наступна лекція
    }
}
```

Атрибути — це **інтерфейс користувача** activity:

- **`[Input("Key")]`** показує властивість «Key» у діалозі властивостей кроку; **`[Output("Value")]`** робить «Value» доступним для наступних кроків у списку динамічних значень.
- **`[RequiredArgument]`** не дає дизайнеру зберегти workflow, доки властивість не заповнено.
- **`[Default("…")]`** заповнює значення наперед.
- **`[ReferenceTarget("account")]`** обов'язковий для `InArgument<EntityReference>` і `OutArgument<EntityReference>`, щоб указати, на яку таблицю вказує lookup.
- **`[AttributeTarget("account", "industrycode")]`** прив'язує аргумент `OptionSetValue` до конкретного стовпця choice.

## Підтримувані типи аргументів

`string`, `bool`, `int`, `decimal`, `double`, `DateTime`, `Money`, `OptionSetValue` і `EntityReference`. Ні списків, ні власних класів. Якщо потрібно більше, передавайте JSON у рядку або розділіть роботу на кілька activities.

## Читання й запис аргументів

Аргументи — не звичайні властивості: їхні значення живуть у контексті виконання, тож читаєте й записуєте їх через нього:

```csharp
string key = Key.Get(executionContext);              // вхід
Value.Set(executionContext, "INV-");                 // вихід
Found.Set(executionContext, true);
```

Виклик `Key.Get(…)` без контексту чи збереження значень у полях не працює: один екземпляр activity можуть використовувати багато запусків workflow, тож, як і з плагінами, тримайте клас **без стану**.

## Назви для адміністраторів

Адміністратори бачать імена з `[Input]`/`[Output]`, а не ваші імена в C#. Пишіть їх як підписи («Default value», «Days to add»), тримайте стабільними (перейменування ламає наявні workflow, див. лекцію про версіонування) і додайте опис у реєстрацію збірки, щоб крок було легко знайти.

## На співбесіді

- Перелічіть NuGet-пакети й посилання, потрібні власній activity.
- Поясніть `InArgument<T>`, `OutArgument<T>` і атрибути, що їх описують.
- Поясніть, навіщо `[ReferenceTarget]` для lookup.
- Поясніть, як читаються й записуються значення аргументів і чому клас має бути без стану.
