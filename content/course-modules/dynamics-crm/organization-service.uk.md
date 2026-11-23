Код на C# працює з Dataverse через один інтерфейс — **`IOrganizationService`**. Плагіни отримують його реалізацію від платформи; консольні застосунки, Azure Functions та інші сервіси створюють її через `ServiceClient`.

## Підключення ззовні

```csharp
// NuGet: Microsoft.PowerPlatform.Dataverse.Client
var connection = "AuthType=ClientSecret;Url=https://contoso.crm4.dynamics.com;" +
                 "ClientId=<app id>;ClientSecret=<secret from Key Vault>";
using var client = new ServiceClient(connection);
if (!client.IsReady) throw new Exception(client.LastError);

var me = (WhoAmIResponse)client.Execute(new WhoAmIRequest());
```

`ServiceClient` реалізує `IOrganizationService` (і асинхронну версію), сам оновлює токен і повторює частину запитів, які обмежила платформа. Сервіси автентифікуються як **application user**: реєстрація застосунку в Microsoft Entra, додана в середовище з роллю безпеки.

## Інтерфейс

```csharp
Guid Create(Entity entity);
Entity Retrieve(string entityName, Guid id, ColumnSet columnSet);
void Update(Entity entity);
void Delete(string entityName, Guid id);
void Associate(string entityName, Guid id, Relationship relationship, EntityReferenceCollection related);
void Disassociate(string entityName, Guid id, Relationship relationship, EntityReferenceCollection related);
EntityCollection RetrieveMultiple(QueryBase query);
OrganizationResponse Execute(OrganizationRequest request);
```

Усе інше — це **повідомлення** (messages), які надсилають через `Execute`: `WhoAmIRequest`, `UpsertRequest`, `ExecuteMultipleRequest`, `CreateMultipleRequest`, ваші власні Custom API. Create, Update та інші теж є повідомленнями, тому плагіни реєструють на імена повідомлень.

## Late-bound сутності

```csharp
var account = new Entity("account");
account["name"] = "Contoso";
account["revenue"] = new Money(5_000_000m);
account["industrycode"] = new OptionSetValue(7);
account["primarycontactid"] = new EntityReference("contact", contactId);
Guid id = service.Create(account);

var row = service.Retrieve("account", id, new ColumnSet("name", "revenue"));
decimal revenue = row.GetAttributeValue<Money>("revenue")?.Value ?? 0m;
```

Значення стовпців мають типи SDK:

| Тип стовпця | Тип .NET |
| --- | --- |
| Lookup, Customer, Owner | `EntityReference` (ім'я таблиці + id) |
| Choice | `OptionSetValue`; Choices: `OptionSetValueCollection` |
| Currency | `Money` |
| Текст, ціле, десяткове, Yes/No, дата | `string`, `int`, `decimal`, `bool`, `DateTime` (UTC) |

Порожнього стовпця просто **немає** в `Attributes`, тому використовуйте `GetAttributeValue<T>`, який повертає `default` замість винятку, або перевіряйте через `Contains`.

## Early-bound класи

`pac modelbuilder build` генерує клас для кожної таблиці (`Account`, `Contact`) з типізованими властивостями та константами для значень choice. Early-bound код ловить одруківки під час компіляції й працює з LINQ через `OrganizationServiceContext`; late-bound код не потребує генерації й підходить для універсальних інструментів. Багато команд пишуть бізнес-код у стилі early-bound.

## Оновлюйте лише змінене

```csharp
var change = new Entity("account", id);   // нова порожня сутність з id
change["telephone1"] = "+380 44 000 0000";
service.Update(change);
```

Ніколи не надсилайте назад сутність, отриману з усіма стовпцями. Кожен стовпець у запиті вважається зміненим: спрацьовують плагіни, відфільтровані на ці стовпці, аудит записує «зміни», і ви можете перезаписати значення, яке інший користувач зберіг мить тому. Для справжнього захисту від конкурентних змін задайте `RowVersion` і `ConcurrencyBehavior = IfRowVersionMatches` в `UpdateRequest`.

## Помилки

Серверні помилки приходять як `FaultException<OrganizationServiceFault>` з кодом помилки та повідомленням (сюди потрапляє повідомлення з `InvalidPluginExecutionException` плагіна). Обмеження навантаження повертає помилку з тривалістю *Retry-After*; про це — в модулі про інтеграції.

## На співбесіді

- Перелічіть методи `IOrganizationService` і поясніть, що все інше йде через `Execute`.
- Покажіть, як у late-bound коді задають lookup, choice і гроші.
- Порівняйте early-bound і late-bound.
- Поясніть, чому оновлення має містити лише змінені стовпці.
