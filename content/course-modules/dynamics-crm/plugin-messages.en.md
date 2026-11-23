Everything you ask Dataverse to do is a **message**: a named operation with input parameters and output parameters. Creating a record is the `Create` message, reading one is `Retrieve`, qualifying a lead is `QualifyLead`. A plug-in step is registered on a **message** for a **table** (or for all tables), so knowing the messages is knowing where your code can run.

## Messages and their parameters

| Message | When it fires | Main InputParameters | Main OutputParameters |
| --- | --- | --- | --- |
| `Create` | A record is created | `Target`: `Entity` | `id`: `Guid` |
| `Update` | A record is changed | `Target`: `Entity` with the changed columns only | — |
| `Delete` | A record is deleted | `Target`: `EntityReference` | — |
| `Retrieve` | One record is read | `Target`: `EntityReference`, `ColumnSet` | `BusinessEntity`: `Entity` |
| `RetrieveMultiple` | A query runs (views, lookups, API) | `Query`: QueryExpression or FetchExpression | `BusinessEntityCollection` |
| `Associate` / `Disassociate` | An N:N link is added or removed | `Target`, `Relationship`, `RelatedEntities` | — |
| `Assign` | The owner changes | `Target`, `Assignee` | — |
| `SetState` / `SetStateDynamicEntity` | Status changes (older messages) | `EntityMoniker`, `State`, `Status` | — |

Many more are specific to tables: `QualifyLead`, `WinOpportunity`, `LoseOpportunity`, `Merge`, `Send` (email), `GrantAccess`, `AddMember` and others. Your own **Custom APIs** are messages too, with the parameters you define.

## Which messages a table supports

The supported combinations are themselves data: the `sdkmessage` table lists messages, and `sdkmessagefilter` says which tables each message is available for. The Plug-in Registration Tool reads them, so it only offers valid combinations. A few messages, such as `Associate`, are registered for **all** tables at once; your code must check the relationship name in `InputParameters["Relationship"]` itself.

## Specialised and general updates

Older code changed owners with `AssignRequest` and status with `SetStateRequest`. Today the recommended way is a plain `Update` that sets `ownerid` or `statecode`/`statuscode`. For backward compatibility the platform still runs steps registered on the older messages in many of these cases; check the documentation for the exact behaviour, and when you write new plug-ins, register on `Update` with filtering attributes on those columns.

## Bulk messages

`CreateMultiple`, `UpdateMultiple` and `UpsertMultiple` process many records in one request and are much faster for integrations. Plug-ins registered on `Create` and `Update` still run for each record; for heavy loads you can register directly on the bulk message and process the `Targets` collection in one go.

## Read messages need care

Steps on `Retrieve` and `RetrieveMultiple` run every time a form opens, a view loads or a lookup searches. They can mask data or add calculated values to results, but anything slow there makes the whole app slow. Use them rarely and keep them light.

## Reading the message in code

A single plug-in class can serve several steps, so code often checks where it is running:

```csharp
switch (context.MessageName)
{
    case "Create":
    case "Update":
        var target = (Entity)context.InputParameters["Target"];
        break;
    case "Delete":
        var deleted = (EntityReference)context.InputParameters["Target"];
        break;
}
```

`context.PrimaryEntityName` tells you the table, `context.Stage` the stage and `context.Mode` whether the step is synchronous (0) or asynchronous (1).

## In an interview

- Explain what a message is and give five examples beyond CRUD.
- Say what the Target is for Create, Update and Delete.
- Explain why steps on Retrieve and RetrieveMultiple are risky.
- Explain why new code should handle owner and status changes on Update.
