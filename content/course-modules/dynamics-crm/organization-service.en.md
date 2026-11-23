C# code talks to Dataverse through one interface, **`IOrganizationService`**. Plug-ins receive an implementation from the platform; console apps, Azure Functions and other services create one with `ServiceClient`.

## Connecting from outside

```csharp
// NuGet: Microsoft.PowerPlatform.Dataverse.Client
var connection = "AuthType=ClientSecret;Url=https://contoso.crm4.dynamics.com;" +
                 "ClientId=<app id>;ClientSecret=<secret from Key Vault>";
using var client = new ServiceClient(connection);
if (!client.IsReady) throw new Exception(client.LastError);

var me = (WhoAmIResponse)client.Execute(new WhoAmIRequest());
```

`ServiceClient` implements `IOrganizationService` (and an async version), handles token refresh and retries some throttled calls for you. Services authenticate as an **application user**: a Microsoft Entra app registration added to the environment with a security role.

## The interface

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

Everything else is a **message** sent through `Execute`: `WhoAmIRequest`, `UpsertRequest`, `ExecuteMultipleRequest`, `CreateMultipleRequest`, your own Custom APIs. Create, Update and the rest are messages too, which is why plug-ins are registered on message names.

## Late-bound entities

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

Column values use SDK types:

| Column type | .NET type |
| --- | --- |
| Lookup, Customer, Owner | `EntityReference` (table name + id) |
| Choice | `OptionSetValue`; Choices: `OptionSetValueCollection` |
| Currency | `Money` |
| Text, whole number, decimal, Yes/No, date | `string`, `int`, `decimal`, `bool`, `DateTime` (UTC) |

A column that is empty is simply **missing** from `Attributes`, so use `GetAttributeValue<T>`, which returns `default` instead of throwing, or `Contains` to check.

## Early-bound classes

`pac modelbuilder build` generates a class per table (`Account`, `Contact`) with typed properties and constants for choice values. Early-bound code catches typos at compile time and works with LINQ through `OrganizationServiceContext`; late-bound code has no generation step and suits generic tools. Many teams use early-bound for business code.

## Update only what changed

```csharp
var change = new Entity("account", id);   // a new, empty entity with the id
change["telephone1"] = "+380 44 000 0000";
service.Update(change);
```

Never send back an entity you retrieved with all columns. Every column in the request counts as changed: plug-ins filtered on those columns run, auditing records "changes", and you may overwrite a value another user saved a moment ago. For real concurrency protection, set `RowVersion` and `ConcurrencyBehavior = IfRowVersionMatches` on an `UpdateRequest`.

## Errors

Server errors arrive as `FaultException<OrganizationServiceFault>`, with an error code and the message (a plug-in's `InvalidPluginExecutionException` message ends up here). Throttling returns a fault with a *Retry-After* duration, covered in the integrations module.

## In an interview

- List the methods of `IOrganizationService` and explain that everything else goes through `Execute`.
- Show how lookups, choices and money are set in late-bound code.
- Compare early-bound and late-bound.
- Explain why an update should contain only the changed columns.
