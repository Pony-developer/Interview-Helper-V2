FakeXrmEasy — це просто дуже повний `IOrganizationService` у пам'яті. Збудуйте невеликий власний. У програмі є модель SDK (`Entity` з `Id`, `ColumnSet`, `FaultException`), інтерфейс `IOrganizationService` і шматок логіки плагіна, `AccountPhoneSync`, що копіює телефон акаунта в його контакти. Реалізуйте `FakeOrganizationService`:

- **`Create(entity)`**: збережіть **копію** сутності, щоб подальші зміни об'єкта, який передав код, не змінювали збережений запис. Якщо в сутності немає id (`Guid.Empty`), дайте їй наступний: перший запис отримує `new Guid(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`, другий — `new Guid(2, …)` і так далі. Поверніть id.
- **`Retrieve(entityName, id, columnSet)`**: поверніть **копію** запису лише з тими запитаними стовпцями, які в нього є (з усіма, якщо `columnSet.AllColumns` дорівнює true). Зміна повернутої сутності не має змінювати збережену.
- **`Update(entity)`**: скопіюйте кожен атрибут `entity` у збережений запис; інші стовпці зберігають свої значення.
- **`Delete(entityName, id)`**: видаліть запис.
- **`RetrieveByAttribute(entityName, attribute, value)`**: копії (з усіма стовпцями) записів цієї таблиці, у яких атрибут дорівнює `value` (використовуйте `Equals`), у порядку створення.

Коли `Retrieve`, `Update` чи `Delete` не знаходять запису з таким іменем таблиці **та** id, киньте `FaultException` з тим самим повідомленням, що й справжній сервіс: `<entityName> With Id = <id> Does Not Exist`.

Не змінюйте `AccountPhoneSync` і `Main`. Очікуваний результат:

```text
Created: 00000001-0000-0000-0000-000000000000
Retrieved: account(00000001) name=Contoso
Stored: account(00000001) name=Contoso telephone1=111
Contacts updated: 2
  Olena Koval 222
  Taras Melnyk 000
  Iryna Bondar 222
Account: account(00000001) name=Contoso telephone1=222
Retrieve deleted: contact With Id = 00000005-0000-0000-0000-000000000000 Does Not Exist
Delete twice: contact With Id = 00000005-0000-0000-0000-000000000000 Does Not Exist
Wrong table: contact With Id = 00000002-0000-0000-0000-000000000000 Does Not Exist
Contacts left: 2
```

Перші рядки перевіряють копії: `Main` перейменовує акаунт у власному об'єкті та в отриманій копії, а збережена назва має лишитися «Contoso». Останній рядок перевіряє, що видалений контакт зник. «Wrong table» передає id акаунта з іменем таблиці `contact`: фейк, що дивиться лише на id, знайде не той запис.

Підказка: `List<Entity>` зберігає порядок створення. Статичний допоміжний метод `Copy(Entity source, ColumnSet columns)` знадобиться в `Create`, `Retrieve` і `RetrieveByAttribute`, а метод `Find(entityName, id)`, що кидає помилку, — у `Retrieve`, `Update` і `Delete`.
