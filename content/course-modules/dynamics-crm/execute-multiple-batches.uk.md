Інструмент імпорту має список підготовлених запитів: створення, оновлення й видалення. Надішліть їх ефективно й повідомте про кожен збій із правильним рядком.

У програмі є модель повідомлень SDK (`CreateRequest`, `UpdateRequest`, `DeleteRequest`, `ExecuteMultipleRequest`, `ExecuteMultipleSettings`, `ExecuteMultipleResponse` і його елементи) та фейковий сервіс, що рахує виклики. Реалізуйте `ImportInBatches(service, requests, batchSize)`:

1. Розбийте `requests` на пакети щонайбільше по `batchSize`, зберігаючи порядок.
2. Для кожного пакета зберіть `ExecuteMultipleRequest` з новою `OrganizationRequestCollection` і налаштуваннями `ContinueOnError = true`, `ReturnResponses = true`. Виведіть `Batch <n>: <кількість> requests` (пакети нумеруються з 1).
3. Надішліть його через `service.Execute` і приведіть результат до `ExecuteMultipleResponse`.
4. Для кожного елемента в `Responses` обчисліть **вихідний індекс**: початкова позиція пакета плюс `item.RequestIndex`.
   - Якщо `item.Fault` не null, виведіть `  #<індекс> FAILED: <повідомлення помилки>`.
   - Інакше, якщо `item.Response` — це `CreateResponse`, виведіть `  #<індекс> created <перші 8 символів id>`.
   - Інакше виведіть `  #<індекс> <ResponseName> ok`.
5. Наприкінці виведіть `Succeeded: <n>, failed: <n>`.

Не змінюйте `Main`. Очікуваний результат:

```text
Batch 1: 3 requests
  #0 created 00000002
  #1 created 00000003
  #2 Update ok
Batch 2: 3 requests
  #3 FAILED: account With Id = 00000063-0000-0000-0000-000000000000 Does Not Exist
  #4 FAILED: Cannot insert duplicate key: account 00000001-0000-0000-0000-000000000000
  #5 Delete ok
Batch 3: 2 requests
  #6 FAILED: account With Id = 00000001-0000-0000-0000-000000000000 Does Not Exist
  #7 created 00000004
Succeeded: 5, failed: 3
Service calls: 3
Accounts: Fabrikam, Northwind, Litware
```

На що звернути увагу:

- Вісім запитів коштують **3 виклики сервісу**.
- Збої не зупиняють пакет (`ContinueOnError`), а успішні запити лишаються збереженими: ExecuteMultiple — не транзакція.
- Запит #6 падає, бо #5 видалив Contoso в попередньому пакеті: запити виконуються по черзі.
- Без додавання початкового індексу пакета #3 було б показано як #0, і журнал імпорту вказував би на неправильні рядки.

Підказка: `requests.Skip(start).Take(batchSize)` дає один пакет, а `batch.Requests.AddRange(…)` додає його. `item.Response as CreateResponse` дорівнює `null` для інших типів відповідей.
