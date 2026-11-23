Створіть activity **«Get configuration value»** з цього модуля. У програмі є модель SDK і `System.Activities` / `Microsoft.Xrm.Sdk.Workflow` (`CodeActivity`, `InArgument<T>`, `OutArgument<T>`, `CodeActivityContext.GetExtension<T>()`, `IWorkflowContext`, атрибути `[Input]`, `[Output]`, `[RequiredArgument]` і `[Default]`) та фейковий рушій workflow. Аргументи вже оголошено. Реалізуйте `Execute`:

1. Отримайте `ITracingService`, `IWorkflowContext` та `IOrganizationServiceFactory` через `executionContext.GetExtension<T>()` і створіть сервіс для `context.UserId`.
2. Прочитайте ключ через `Key.Get(executionContext)`.
3. Зробіть запит до `contoso_configuration` через `QueryByAttribute`: `contoso_key` дорівнює ключу **і** `statecode` дорівнює `0` (лише активні рядки). Потрібен лише стовпець `contoso_value`.
4. Якщо збігається більше одного рядка, киньте `InvalidPluginExecutionException("Duplicate configuration key: <ключ>")`.
5. Якщо збігається рівно один, задайте `Value` його `contoso_value`, а `Found` — `true`, і трасуйте `<ключ>: found`.
6. Інакше задайте `Value` типове значення (`DefaultValue.Get(executionContext)`), а `Found` — `false`, і трасуйте `<ключ>: default used`.

Виходи записуйте через `Value.Set(executionContext, …)`. Не змінюйте аргументи та `Main`. Очікуваний результат:

```text
Step properties in the workflow designer:
  input  Key (required)
  input  Default value
  output Value
  output Found
== Key invoice.prefix
  Value = INV-, Found = True
  trace: invoice.prefix: found
== Key missing.key
  Value = fallback, Found = False
  trace: missing.key: default used
== Key old.feature
  Value = off, Found = False
  trace: old.feature: default used
== Key tax.rate
  ERROR Duplicate configuration key: tax.rate
Service calls: 4
```

Перші рядки згенеровано з атрибутів: це бачить адміністратор, додаючи крок. `old.feature` існує, але неактивний, тож використано типове значення. `Service calls: 4` перевіряє, що кожен запуск робить рівно один запит.

Підказка: `service.RetrieveMultiple(query).Entities` — список рядків, що збіглися. `query.AddAttributeValue("statecode", 0)` порівнює з числом варіанта choice.
