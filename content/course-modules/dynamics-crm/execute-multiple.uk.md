Надсилати 10 000 записів по одному виклику — це 10 000 звернень до сервера. **`ExecuteMultipleRequest`** пакує багато запитів в один виклик, і це в рази пришвидшує імпорти й міграції.

## Запит

```csharp
var batch = new ExecuteMultipleRequest
{
    Requests = new OrganizationRequestCollection(),
    Settings = new ExecuteMultipleSettings
    {
        ContinueOnError = true,     // продовжувати після невдалого запиту
        ReturnResponses = true,     // повертати відповідь і для кожного успішного запиту
    },
};
batch.Requests.Add(new CreateRequest { Target = account1 });
batch.Requests.Add(new UpdateRequest { Target = change });
batch.Requests.Add(new DeleteRequest { Target = oldRef });

var response = (ExecuteMultipleResponse)service.Execute(batch);
```

Усередину можна покласти будь-який тип запиту, крім іншого `ExecuteMultipleRequest`.

## Відповідь

```csharp
foreach (ExecuteMultipleResponseItem item in response.Responses)
{
    OrganizationRequest request = batch.Requests[item.RequestIndex];
    if (item.Fault != null)
        Console.WriteLine($"#{item.RequestIndex} failed: {item.Fault.Message}");
    else if (item.Response is CreateResponse created)
        Console.WriteLine($"#{item.RequestIndex} created {created.id}");
}
if (response.IsFaulted) { /* щонайменше один запит упав */ }
```

- `Responses` містить елемент для кожного **невдалого** запиту, а з `ReturnResponses = true` — і для кожного успішного.
- **`RequestIndex`** — позиція в *цьому пакеті*. Коли ви ділите великий список на пакети, додавайте початковий індекс пакета, щоб указати на вихідний рядок.
- З `ContinueOnError = false` обробка зупиняється на першій помилці; запити перед нею **вже збережено**.

## Не транзакція

ExecuteMultiple — це оптимізація **транспорту**: кожен запит усередині все одно виконується як окрема операція з власною транзакцією та плагінами. Якщо запит 7 упаде, запити 1–6 лишаться збереженими. Коли кілька змін мають разом вдатися чи разом скасуватися (замовлення та його рядки), використовуйте **`ExecuteTransactionRequest`**: та сама форма, але всі запити виконуються в одній транзакції, і перша помилка відкочує все.

## Ліміти й добрі практики

- Щонайбільше **1000** запитів у пакеті. Пакети по 100–500 — поширена золота середина: достатньо великі, щоб зекономити звернення, і достатньо малі, щоб їх повторити.
- Кожен запит усередині все одно рахується в **ліміти захисту сервісу**; обробляйте 429 / `Retry-After` для всього пакета.
- Для великих обсягів запускайте кілька пакетів **паралельно** (кілька потоків чи задач) і налаштовуйте ступінь паралелізму.
- Для багатьох записів **однієї таблиці** ще швидші **`CreateMultiple` / `UpdateMultiple` / `UpsertMultiple`**: одна операція з багатьма цілями, і плагіни можуть обробляти їх як набір.
- **Не** використовуйте ExecuteMultiple (чи ExecuteTransaction) усередині плагінів і workflow activities: вони вже працюють усередині операції, пакет подовжує транзакцію, і легко вийти за ліміт часу пісочниці.
- Записуйте збої з достатніми даними для повтору: вихідний рядок, запит, повідомлення про помилку.

## На співбесіді

- Поясніть `ContinueOnError` і `ReturnResponses` та що містить `Responses`.
- Поясніть, чому ExecuteMultiple — не транзакція і що використати натомість.
- Назвіть ліміт розміру пакета й як ви б підбирали пакети для міграції.
- Порівняйте ExecuteMultiple з `CreateMultiple`/`UpdateMultiple`.
