Час побути платформою. У програмі є крихітна модель SDK (`Entity`, `InvalidPluginExecutionException`, `IPlugin`), `Database` з транзакціями та п'ять плагінів, зареєстрованих на Create акаунта в довільному порядку. Напишіть `Pipeline.Execute(context)`, який виконує повідомлення Create так, як це робить Dataverse:

1. Упорядкуйте зареєстровані кроки за **етапом**, потім за **rank**.
2. Виконайте кроки **PreValidation**. Вони працюють поза транзакцією.
3. Почніть транзакцію через `db.Begin()`.
4. Виконайте кроки **PreOperation**. Вони можуть змінювати `context.Target`.
5. Основна операція: збережіть запис через `db.Insert(context.Target)`.
6. Виконайте кроки **PostOperation** (тут усі вони синхронні).
7. `db.Commit()` і поверніть `true`.

Перед запуском кроку виведіть два пробіли, етап та ім'я кроку, наприклад `  PreOperation AccountNumber`, потім викличте `step.Plugin.Execute(context)`.

Якщо крок кидає `InvalidPluginExecutionException`, одразу зупиніться: виведіть `  ERROR <повідомлення>`, викличте `db.Rollback()`, **якщо транзакція відкрита** (`db.InTransaction`), і поверніть `false`. Rollback прибирає все, що вставлено в транзакції, включно із завданням, яке створив плагін follow-up.

Не змінюйте плагіни та `Main`. Очікуваний результат:

```text
== Contoso
  PreValidation RequireName
  PreOperation AccountNumber
  PreOperation NormalizeName
  INSERT account accountnumber=ACC-1001 name=Contoso
  PostOperation FollowUpTask
  INSERT task subject=Call Contoso
  PostOperation CreditLimit
  COMMIT
  saved: True
== No name
  PreValidation RequireName
  ERROR Account name is required.
  saved: False
== Fabrikam
  PreValidation RequireName
  PreOperation AccountNumber
  PreOperation NormalizeName
  INSERT account accountnumber=ACC-1002 creditlimit=250000 name=Fabrikam
  PostOperation FollowUpTask
  INSERT task subject=Call Fabrikam
  PostOperation CreditLimit
  ERROR A credit limit over 100000 needs approval.
  ROLLBACK
  saved: False
== Northwind
  PreValidation RequireName
  PreOperation AccountNumber
  PreOperation NormalizeName
  INSERT account accountnumber=NW-7 name=Northwind
  PostOperation FollowUpTask
  INSERT task subject=Call Northwind
  PostOperation CreditLimit
  COMMIT
  saved: True
Rows: 4
  account accountnumber=ACC-1001 name=Contoso
  task subject=Call Contoso
  account accountnumber=NW-7 name=Northwind
  task subject=Call Northwind
```

Що показує цей результат:

- «No name» падає на PreValidation: нічого не заблоковано й не записано, тож відкочувати нічого, і номер акаунта не витрачено.
- Fabrikam падає на синхронному кроці PostOperation **після** вставлення, тож акаунт і його завдання відкочуються. Номер ACC-1002 назад не повертається, як і в послідовності бази даних.
- Назву обрізають на PreOperation, тому зберігається вже обрізане значення.

Підказка: `steps.OrderBy(s => (int)s.Stage).ThenBy(s => s.Rank)` сортує кроки; сортування в LINQ стабільне. Допоміжний метод `Run(Step step, PluginContext context)`, що виводить рядок і виконує крок, робить `Execute` коротким, а один `try`/`catch` навколо всієї послідовності обробляє всі етапи.
