Аргументи оголошено; тепер метод `Execute`. Власна activity не отримує `IServiceProvider`, як плагін. Вона просить **`CodeActivityContext`** про **розширення** (extensions).

## Отримання сервісів

```csharp
protected override void Execute(CodeActivityContext executionContext)
{
    ITracingService tracing = executionContext.GetExtension<ITracingService>();
    IWorkflowContext context = executionContext.GetExtension<IWorkflowContext>();
    IOrganizationServiceFactory factory = executionContext.GetExtension<IOrganizationServiceFactory>();
    IOrganizationService service = factory.CreateOrganizationService(context.UserId);
    // …
}
```

**`IWorkflowContext`** — це версія контексту плагіна для workflow. Він має знайомі члени (`PrimaryEntityName`, `PrimaryEntityId`, `UserId`, `InitiatingUserId`, `Depth`, `InputParameters`, `SharedVariables`, `PreEntityImages`, `PostEntityImages`) плюс специфічні для workflow, як-от `WorkflowCategory`, `WorkflowMode` і `StageName`.

`context.UserId` залежить від налаштувань workflow: для on-demand чи real-time workflow це зазвичай користувач, що його запустив; для фонового workflow це може бути **власник** workflow. Знайте, хто саме, бо записи, створені вашою activity, належатимуть цьому користувачу.

## Запис, на якому працює workflow

Workflow завжди працює на одному записі: `context.PrimaryEntityName` і `context.PrimaryEntityId`. Якщо activity потрібні його стовпці, отримайте їх; дизайнер також може передати конкретні значення як вхідні аргументи, і це робить activity придатною для різних таблиць.

## Увесь Execute

```csharp
string key = Key.Get(executionContext);

var query = new QueryByAttribute("contoso_configuration") { ColumnSet = new ColumnSet("contoso_value") };
query.AddAttributeValue("contoso_key", key);
query.AddAttributeValue("statecode", 0);
var rows = service.RetrieveMultiple(query).Entities;

if (rows.Count > 1)
    throw new InvalidPluginExecutionException("Duplicate configuration key: " + key);

if (rows.Count == 1)
{
    Value.Set(executionContext, rows[0].GetAttributeValue<string>("contoso_value"));
    Found.Set(executionContext, true);
    tracing.Trace("{0}: found", key);
}
else
{
    Value.Set(executionContext, DefaultValue.Get(executionContext));
    Found.Set(executionContext, false);
    tracing.Trace("{0}: default used", key);
}
```

## Помилки

Для бізнес-помилки киньте **`InvalidPluginExecutionException`**. У **real-time** workflow збереження скасовується, і користувач бачить повідомлення. У **фоновому** workflow системне завдання позначається як невдале з цим повідомленням, і workflow зупиняється на цьому кроці. Вирішіть, чи відсутнє значення — це помилка (кинути виняток), чи норма (повернути типове значення та `Found = false` і дати workflow розгалузитися).

## Тестування

Activity — це клас із методом `Execute`; її можна покривати модульними тестами. FakeXrmEasy запускає класи `CodeActivity` з фейковим контекстом, і так само може невелика власна обв'язка, як у практиці цього модуля: задати вхідні аргументи, запустити activity, прочитати виходи. Складну логіку тримайте в окремому класі, яким можуть користуватися і activity, і плагіни.

## На співбесіді

- Покажіть, як activity отримує сервіс трасування, контекст workflow і сервіс організації.
- Поясніть, що додає `IWorkflowContext` порівняно з контекстом плагіна.
- Поясніть, від імені якого користувача працює сервіс activity.
- Поясніть, як поводяться помилки в real-time і фонових workflow.
