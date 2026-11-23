`Create`, `Retrieve`, `Update` and `Delete` cover the everyday work, but Dataverse can do far more: qualify a lead, merge records, share a record, close an opportunity, call your Custom API. All of it goes through one method: **`IOrganizationService.Execute`**.

## Everything is a message

```csharp
OrganizationResponse Execute(OrganizationRequest request);
```

An **`OrganizationRequest`** has a `RequestName` (the message) and a `Parameters` collection. The **`OrganizationResponse`** has a `ResponseName` and a `Results` collection. The convenience methods are thin wrappers: `service.Create(entity)` sends a `CreateRequest` with `Target = entity` and returns `CreateResponse.id`. That is also why plug-ins register on **message names**.

## Typed request classes

The SDK ships a request and response class for every built-in message:

- **`Microsoft.Xrm.Sdk.Messages`**: data and metadata operations: `CreateRequest`, `RetrieveRequest`, `UpdateRequest`, `DeleteRequest`, `UpsertRequest`, `RetrieveMultipleRequest`, `AssociateRequest`, `ExecuteMultipleRequest`, `ExecuteTransactionRequest`, `RetrieveEntityRequest`, `CreateMultipleRequest`.
- **`Microsoft.Crm.Sdk.Messages`**: business operations: `WhoAmIRequest`, `QualifyLeadRequest`, `WinOpportunityRequest`, `GrantAccessRequest`, `MergeRequest`, `SendEmailRequest`, `AddMemberListRequest`, `CloseIncidentRequest` and hundreds more.

Their properties are typed views over `Parameters`, so these two are the same request:

```csharp
var typed = new WhoAmIRequest();
var generic = new OrganizationRequest("WhoAmI");

var response = (WhoAmIResponse)service.Execute(typed);
Guid userId = response.UserId;                       // = (Guid)response.Results["UserId"]
```

## Custom APIs and messages without classes

For your own Custom APIs (or messages without a generated class), use the generic form:

```csharp
var request = new OrganizationRequest("contoso_RecalculateDiscount")
{
    ["Target"] = new EntityReference("salesorder", orderId),
    ["contoso_Coupon"] = "SPRING",
};
var response = service.Execute(request);
decimal discount = (decimal)response.Results["contoso_Discount"];
```

`pac modelbuilder build` can also generate typed request and response classes for your Custom APIs.

## Optional parameters

Many messages accept extra parameters that change their behaviour, set through `Parameters`:

- `SuppressDuplicateDetection = true` on Create/Update: skip duplicate detection rules.
- `tag = "nightly-import"`: lands in `context.SharedVariables["tag"]` for plug-ins.
- `BypassBusinessLogicExecution = "CustomSync,CustomAsync"`: skip custom synchronous and/or asynchronous logic during data loads (the caller needs a special privilege; use with great care).
- `SolutionUniqueName` on metadata requests: create the component inside a solution.

## Why Execute matters

- It is the **only** way to send most business operations from C#.
- It lets you build requests now and send them **later or together**: `ExecuteMultipleRequest`, `ExecuteTransactionRequest` and bulk messages take collections of requests.
- Requests are plain objects, so code that builds them is easy to test without a server.

## In an interview

- Explain how `Create` relates to `Execute` and `CreateRequest`.
- Name the two Messages namespaces and examples from each.
- Show how to call a Custom API from C#.
- Give two optional parameters and what they do.
