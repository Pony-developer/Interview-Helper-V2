`Create`, `Retrieve`, `Update` і `Delete` покривають щоденну роботу, але Dataverse уміє набагато більше: кваліфікувати лід, злити записи, надати запис у спільний доступ, закрити угоду, викликати ваш Custom API. Усе це йде через один метод: **`IOrganizationService.Execute`**.

## Усе — це повідомлення

```csharp
OrganizationResponse Execute(OrganizationRequest request);
```

**`OrganizationRequest`** має `RequestName` (повідомлення) і колекцію `Parameters`. **`OrganizationResponse`** має `ResponseName` і колекцію `Results`. Зручні методи — тонкі обгортки: `service.Create(entity)` надсилає `CreateRequest` з `Target = entity` і повертає `CreateResponse.id`. Тому плагіни й реєструють на **імена повідомлень**.

## Типізовані класи запитів

SDK постачає клас запиту й відповіді для кожного вбудованого повідомлення:

- **`Microsoft.Xrm.Sdk.Messages`**: операції з даними й метаданими: `CreateRequest`, `RetrieveRequest`, `UpdateRequest`, `DeleteRequest`, `UpsertRequest`, `RetrieveMultipleRequest`, `AssociateRequest`, `ExecuteMultipleRequest`, `ExecuteTransactionRequest`, `RetrieveEntityRequest`, `CreateMultipleRequest`.
- **`Microsoft.Crm.Sdk.Messages`**: бізнес-операції: `WhoAmIRequest`, `QualifyLeadRequest`, `WinOpportunityRequest`, `GrantAccessRequest`, `MergeRequest`, `SendEmailRequest`, `AddMemberListRequest`, `CloseIncidentRequest` і сотні інших.

Їхні властивості — типізовані «вікна» на `Parameters`, тож ці два запити однакові:

```csharp
var typed = new WhoAmIRequest();
var generic = new OrganizationRequest("WhoAmI");

var response = (WhoAmIResponse)service.Execute(typed);
Guid userId = response.UserId;                       // = (Guid)response.Results["UserId"]
```

## Custom API і повідомлення без класів

Для власних Custom API (чи повідомлень без згенерованого класу) використовуйте загальну форму:

```csharp
var request = new OrganizationRequest("contoso_RecalculateDiscount")
{
    ["Target"] = new EntityReference("salesorder", orderId),
    ["contoso_Coupon"] = "SPRING",
};
var response = service.Execute(request);
decimal discount = (decimal)response.Results["contoso_Discount"];
```

`pac modelbuilder build` також уміє генерувати типізовані класи запитів і відповідей для ваших Custom API.

## Необов'язкові параметри

Багато повідомлень приймають додаткові параметри, що змінюють їхню поведінку, — їх задають через `Parameters`:

- `SuppressDuplicateDetection = true` для Create/Update: пропустити правила виявлення дублікатів.
- `tag = "nightly-import"`: потрапляє в `context.SharedVariables["tag"]` для плагінів.
- `BypassBusinessLogicExecution = "CustomSync,CustomAsync"`: пропустити власну синхронну та/або асинхронну логіку під час завантаження даних (тому, хто викликає, потрібен спеціальний привілей; користуйтеся дуже обережно).
- `SolutionUniqueName` у запитах метаданих: створити компонент усередині рішення.

## Чому Execute важливий

- Це **єдиний** спосіб надіслати з C# більшість бізнес-операцій.
- Він дає змогу будувати запити зараз і надсилати їх **пізніше чи разом**: `ExecuteMultipleRequest`, `ExecuteTransactionRequest` і масові повідомлення приймають колекції запитів.
- Запити — прості об'єкти, тож код, що їх будує, легко тестувати без сервера.

## На співбесіді

- Поясніть, як `Create` пов'язаний з `Execute` і `CreateRequest`.
- Назвіть два простори імен Messages і приклади з кожного.
- Покажіть, як викликати Custom API з C#.
- Назвіть два необов'язкові параметри й що вони роблять.
