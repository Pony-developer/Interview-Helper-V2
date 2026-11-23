A tour of `Execute` in practice: the CRUD messages written as requests, then the business messages that have no shortcut method.

## CRUD as requests

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

Why write it the long way? Because requests can carry **options** (concurrency, optional parameters) and can be **batched**. Two useful ones:

```csharp
// Optimistic concurrency: fail if someone changed the row since we read it
var update = new UpdateRequest
{
    Target = changeWithRowVersion,                       // entity.RowVersion = row.RowVersion
    ConcurrencyBehavior = ConcurrencyBehavior.IfRowVersionMatches,
};

// Upsert by alternate key: create or update in one call
var upsert = (UpsertResponse)service.Execute(new UpsertRequest
{
    Target = new Entity("account", "accountnumber", "C-1042") { ["name"] = "Contoso" },
});
bool wasCreated = upsert.RecordCreated;
```

## Business messages

```csharp
// Qualify a lead into an account, contact and opportunity
var qualify = (QualifyLeadResponse)service.Execute(new QualifyLeadRequest
{
    LeadId = new EntityReference("lead", leadId),
    CreateAccount = true,
    CreateContact = true,
    CreateOpportunity = true,
    Status = new OptionSetValue(3),                     // Qualified
});
// qualify.CreatedEntities lists the new records

// Share a record with a team
service.Execute(new GrantAccessRequest
{
    Target = new EntityReference("account", accountId),
    PrincipalAccess = new PrincipalAccess
    {
        Principal = new EntityReference("team", teamId),
        AccessMask = AccessRights.ReadAccess | AccessRights.WriteAccess,
    },
});

// Link records through an N:N relationship
service.Execute(new AssociateRequest
{
    Target = new EntityReference("contact", contactId),
    Relationship = new Relationship("listcontact_association"),
    RelatedEntities = new EntityReferenceCollection { new EntityReference("list", listId) },
});
```

Others you will meet: `MergeRequest` (merge duplicates), `WinOpportunityRequest` / `LoseOpportunityRequest`, `CloseIncidentRequest`, `SendEmailRequest`, `AddMemberListRequest`, `RetrieveEntityRequest` (metadata), `SetStateRequest` (older code; today prefer updating `statecode`/`statuscode`).

## Reading responses

Cast the response to the matching type (`(QualifyLeadResponse)`), or read `response.Results["Name"]` for generic messages. The documentation of each message lists its parameters and results; when in doubt, inspect `Results.Keys` in a test.

## Errors

A failed request throws `FaultException<OrganizationServiceFault>` with the platform's message and an error code (for example, the code for "record does not exist" or "duplicate key"). Catch it where you can act on it; otherwise let it surface.

## Inside plug-ins

Plug-ins use `Execute` just as freely, with the service from `IOrganizationServiceFactory`. Each request is a new message, with its own pipeline and plug-ins at depth + 1, so the same loop and performance rules apply.

## In an interview

- Show CRUD through `Execute` and explain when you would prefer it to the shortcut methods.
- Show an upsert by alternate key and an update with optimistic concurrency.
- Write a `QualifyLeadRequest` or `GrantAccessRequest` from memory.
- Explain what a failed request throws.
