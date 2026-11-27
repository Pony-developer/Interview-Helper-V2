Ваш перший плагін нічого не робить, лише роздивляється: записує в журнал трасування те, що бачить. Саме так варто вивчати, як зареєстровано крок.

Програма містить модель SDK і фейкову платформу. `Run` грає роль платформи: будує контекст для одного кроку, викликає ваш плагін, виводить ваші рядки трасування, потім те, що збережено (або `deleted`). Ви пишете лише тіло `HelloContextPlugin.Execute`:

1. Отримайте `IPluginExecutionContext` і `ITracingService` із `serviceProvider`.
2. Запишіть у трасування в такому порядку:
   - `Message: <MessageName>`
   - `Table: <PrimaryEntityName>`
   - `Stage: <Stage>, depth: <Depth>`
3. Подивіться на `InputParameters["Target"]`:
   - `Entity` (Create, Update): запишіть `Columns: ` та імена його стовпців в алфавітному порядку через `, `;
   - `EntityReference` (Delete): запишіть `Record: ` і саме посилання.

Не змінюйте `Main` і `Run`. Очікуваний результат:

```text
== Create contact (stage 20)
  trace: Message: Create
  trace: Table: contact
  trace: Stage: 20, depth: 1
  trace: Columns: emailaddress1, firstname, lastname
  saved: emailaddress1=olena@contoso.com, firstname=Olena, lastname=Koval
== Update account (stage 10)
  trace: Message: Update
  trace: Table: account
  trace: Stage: 10, depth: 1
  trace: Columns: telephone1
  saved: telephone1=+380 44 123 4567
== Delete contact (stage 20)
  trace: Message: Delete
  trace: Table: contact
  trace: Stage: 20, depth: 1
  trace: Record: contact(00000005)
  deleted
```

Зверніть увагу на Update: його Target містить лише стовпець, який змінив користувач.

Підказка: `tracing.Trace("Message: {0}", context.MessageName)` працює як `string.Format`. `target as Entity` повертає `null`, коли target — це `EntityReference`. `entity.Attributes.Keys.OrderBy(k => k, StringComparer.Ordinal)` сортує імена стовпців.
