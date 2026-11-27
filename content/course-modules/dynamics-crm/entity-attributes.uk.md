У C# рядок Dataverse — це `Entity`: ім'я таблиці, id і словник стовпців `Attributes`. Правильне читання й запис цих стовпців — половина всього коду плагінів.

## Що містить Entity

```csharp
var account = new Entity("account");          // логічне ім'я таблиці
account["name"] = "Contoso";                   // логічне ім'я стовпця → значення
account["numberofemployees"] = 500;
```

Сутність містить лише стовпці, які було **прочитано** або **задано**. Акаунт, прочитаний з `new ColumnSet("name")`, має `name` і нічого більше, хоча рядок у базі має сотню стовпців. Порожній стовпець, який прочитали, **відсутній** в `Attributes` (SDK не передає null).

## Три способи прочитати стовпець

```csharp
var name1 = (string)account["name"];                        // 1. індексатор
var name2 = account.GetAttributeValue<string>("name");      // 2. GetAttributeValue
if (account.Contains("name")) { /* … */ }                   // 3. спершу перевірити
```

| Спосіб | Стовпця немає | Коли використовувати |
| --- | --- | --- |
| `account["name"]` | Кидає `KeyNotFoundException` | Стовпець обов'язково має бути |
| `GetAttributeValue<T>("name")` | Повертає `default(T)`: `null`, `0` або `false` | Майже завжди |
| `Contains("name")` | Повертає `false` | Треба знати, чи його взагалі надіслали |

`Contains` важливий у плагінах на оновлення: `Target` в Update містить **лише змінені стовпці**, тож `Contains("creditlimit")` каже, чи змінив користувач кредитний ліміт.

Для типів-значень запитуйте **nullable**-тип, щоб відрізнити «порожньо» від «нуля»: `GetAttributeValue<int?>("numberofemployees")` повертає `null`, коли порожньо, а `GetAttributeValue<int>` повернув би `0`.

## Особливі типи

| Тип стовпця | Тип .NET | Читання | Запис |
| --- | --- | --- | --- |
| Текст | `string` | `GetAttributeValue<string>("name")` | `e["name"] = "Contoso"` |
| Ціле число | `int` | `GetAttributeValue<int?>("numberofemployees")` | `e["numberofemployees"] = 500` |
| Десяткове | `decimal` | `GetAttributeValue<decimal?>(…)` | `e["contoso_rate"] = 0.15m` |
| Валюта | `Money` | `GetAttributeValue<Money>("creditlimit")?.Value` | `e["creditlimit"] = new Money(1000m)` |
| Choice | `OptionSetValue` | `GetAttributeValue<OptionSetValue>("industrycode")?.Value` | `e["industrycode"] = new OptionSetValue(7)` |
| Yes/No | `bool` | `GetAttributeValue<bool>("donotemail")` | `e["donotemail"] = true` |
| Дата й час | `DateTime` | `GetAttributeValue<DateTime?>("createdon")` | `e["contoso_start"] = DateTime.UtcNow` |
| Lookup | `EntityReference` | `GetAttributeValue<EntityReference>("parentcustomerid")` | `e["parentcustomerid"] = new EntityReference("account", id)` |

Класичні помилки новачків: записати просто `1000m` у стовпець валюти або просто `7` у стовпець choice. Обидва варіанти падають із помилкою типу; обгорніть їх у `Money` та `OptionSetValue`.

## Очищення стовпця

Щоб очистити стовпець, задайте йому `null`: `account["telephone1"] = null;`. Видалення з `Attributes` робить інше: стовпець просто не надсилається, тож лишається без змін.

## Створення й оновлення

```csharp
var contact = new Entity("contact");
contact["lastname"] = "Koval";
contact["parentcustomerid"] = new EntityReference("account", accountId);
Guid id = service.Create(contact);

var change = new Entity("contact", id);       // id рядка, який оновлюємо
change["jobtitle"] = "Sales Manager";          // лише стовпці, які змінюємо
service.Update(change);
```

Надсилайте **лише змінені стовпці**. Оновлення всієї прочитаної сутності переписує кожен стовпець, запускає всі зареєстровані на них плагіни й потоки та може перезаписати чужу зміну.

## Детальніше про lookup

`EntityReference` містить **таблицю** (`LogicalName`) та **id**. Коли ви його читаєте, `Name` також містить основну назву рядка, на який він посилається, що економить запит, коли її треба лише показати. Lookup **Customer** може вказувати на акаунт або контакт, тож перевіряйте `LogicalName`, перш ніж використовувати id.
