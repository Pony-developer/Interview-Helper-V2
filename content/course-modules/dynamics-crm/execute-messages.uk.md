Огляд `Execute` на практиці: повідомлення CRUD, записані як запити, а потім бізнес-повідомлення, для яких немає скороченого методу.

## CRUD як запити

```csharp
var created = (CreateResponse)service.Execute(new CreateRequest { Target = account });
Guid id = created.id;

var retrieved = (RetrieveResponse)service.Execute(new RetrieveRequest
{
    Target = new EntityReference("account", id),
    ColumnSet = new ColumnSet("name", "creditlimit"),
});
Entity row = retrieved.Entity;

service.Execute(new UpdateRequest { Target = change });
service.Execute(new DeleteRequest { Target = new EntityReference("account", id) });

var page = (RetrieveMultipleResponse)service.Execute(new RetrieveMultipleRequest { Query = query });
```

Навіщо довгий шлях? Бо запити можуть нести **опції** (конкурентний доступ, необов'язкові параметри) і їх можна **об'єднувати в пакети**. Дві корисні:

```csharp
// Оптимістичний конкурентний доступ: помилка, якщо рядок змінили після нашого читання
var update = new UpdateRequest
{
    Target = changeWithRowVersion,                       // entity.RowVersion = row.RowVersion
    ConcurrencyBehavior = ConcurrencyBehavior.IfRowVersionMatches,
};

// Upsert за альтернативним ключем: створити або оновити одним викликом
var upsert = (UpsertResponse)service.Execute(new UpsertRequest
{
    Target = new Entity("account", "accountnumber", "C-1042") { ["name"] = "Contoso" },
});
bool wasCreated = upsert.RecordCreated;
```

## Бізнес-повідомлення

```csharp
// Кваліфікувати лід в акаунт, контакт і угоду
var qualify = (QualifyLeadResponse)service.Execute(new QualifyLeadRequest
{
    LeadId = new EntityReference("lead", leadId),
    CreateAccount = true,
    CreateContact = true,
    CreateOpportunity = true,
    Status = new OptionSetValue(3),                     // Qualified
});
// qualify.CreatedEntities перелічує нові записи

// Надати запис у спільний доступ команді
service.Execute(new GrantAccessRequest
{
    Target = new EntityReference("account", accountId),
    PrincipalAccess = new PrincipalAccess
    {
        Principal = new EntityReference("team", teamId),
        AccessMask = AccessRights.ReadAccess | AccessRights.WriteAccess,
    },
});

// Зв'язати записи через зв'язок N:N
service.Execute(new AssociateRequest
{
    Target = new EntityReference("contact", contactId),
    Relationship = new Relationship("listcontact_association"),
    RelatedEntities = new EntityReferenceCollection { new EntityReference("list", listId) },
});
```

Інші, які ви зустрінете: `MergeRequest` (злиття дублікатів), `WinOpportunityRequest` / `LoseOpportunityRequest`, `CloseIncidentRequest`, `SendEmailRequest`, `AddMemberListRequest`, `RetrieveEntityRequest` (метадані), `SetStateRequest` (старіший код; сьогодні краще оновлювати `statecode`/`statuscode`).

## Читання відповідей

Приведіть відповідь до потрібного типу (`(QualifyLeadResponse)`) або читайте `response.Results["Name"]` для загальних повідомлень. Документація кожного повідомлення перелічує його параметри й результати; якщо сумніваєтеся, подивіться `Results.Keys` у тесті.

## Помилки

Невдалий запит кидає `FaultException<OrganizationServiceFault>` із повідомленням платформи та кодом помилки (наприклад, кодом для «запис не існує» чи «дублікат ключа»). Перехоплюйте його там, де можете щось зробити; інакше дайте йому піднятися вище.

## Усередині плагінів

Плагіни так само вільно використовують `Execute` із сервісом від `IOrganizationServiceFactory`. Кожен запит — нове повідомлення з власним конвеєром і плагінами на глибині + 1, тож діють ті самі правила щодо циклів і продуктивності.

## На співбесіді

- Покажіть CRUD через `Execute` і поясніть, коли він кращий за скорочені методи.
- Покажіть upsert за альтернативним ключем і оновлення з оптимістичним конкурентним доступом.
- Напишіть з пам'яті `QualifyLeadRequest` або `GrantAccessRequest`.
- Поясніть, що кидає невдалий запит.
