Everything that reads or writes Dataverse data goes through its **web services**. There are two main endpoints, and they share the same platform behind them: the same messages, the same security and the same plug-ins.

## The Web API

The **Web API** is a RESTful **OData v4** endpoint that speaks JSON over HTTPS. Any language and platform can use it.

```text
GET https://contoso.crm4.dynamics.com/api/data/v9.2/accounts?$select=name,revenue&$top=3
Authorization: Bearer <token>
Accept: application/json
OData-MaxVersion: 4.0
OData-Version: 4.0
```

- Tables are addressed by their **entity set name** (`accounts`), records by id (`accounts(<guid>)`) or alternate key.
- `POST` creates, `PATCH` updates (or upserts), `DELETE` deletes, `GET` reads with `$select`, `$filter`, `$orderby`, `$expand`, `$top`.
- Messages that are not CRUD are **functions** (`GET …/WhoAmI`) and **actions** (`POST …/Microsoft.Dynamics.CRM.QualifyLead`), including your own Custom APIs.
- `$batch` sends several operations in one HTTP request, optionally as one transaction (a *change set*).
- `GET /api/data/v9.2/$metadata` returns the full service description, generated from your tables.

Form scripts use it through `Xrm.WebApi`; JavaScript, Python, Power Automate custom connectors and most integrations call it directly.

## The Organization service and the .NET SDK

The **Organization service** is the endpoint behind the **SDK for .NET**. You do not call it by hand: you use `IOrganizationService`, implemented by `ServiceClient` (package `Microsoft.PowerPlatform.Dataverse.Client`), with typed classes such as `Entity`, `EntityReference`, `QueryExpression` and request/response pairs.

```csharp
using var client = new ServiceClient(connectionString);
var response = (WhoAmIResponse)client.Execute(new WhoAmIRequest());
Console.WriteLine(response.UserId);
```

Its underlying protocol is SOAP, which is why older documentation calls it the "SOAP endpoint" (`/XRMServices/2011/Organization.svc`). Calling that SOAP endpoint directly from other languages is legacy; new non-.NET code should use the Web API. For .NET, the SDK remains the most convenient choice, especially for bulk operations and early-bound classes.

## Which one to use

| Situation | Choice |
| --- | --- |
| C# console app, Azure Function, data migration | SDK for .NET (`ServiceClient`) |
| JavaScript in a form or a PCF control | Web API via `Xrm.WebApi` / `context.webAPI` |
| Python, Node.js, Java, any HTTP client | Web API |
| Code inside a plug-in | Neither endpoint: the `IOrganizationService` the platform gives you |

That last row matters: a plug-in runs **inside** the platform. It receives an `IOrganizationService` from `IOrganizationServiceFactory`, already authenticated as the right user, and its calls do not go over HTTP. Never create a `ServiceClient` or call the Web API with `HttpClient` from a plug-in to talk to the same environment.

## Authentication

Both endpoints use **OAuth 2.0 with Microsoft Entra ID**. A user signs in interactively, or a service uses an **app registration** (client secret, certificate or managed identity) that is added to the environment as an **application user** with a security role. MSAL gets the token for the resource `https://<org>.crm.dynamics.com/.default`; `ServiceClient` does that for you from a connection string.

## Finding environments

The **Global Discovery Service** lists the environments a user can access, with their URLs. Multi-environment tools call it first, then connect to the chosen environment's Web API or Organization service.

## Retired endpoints

The **organization data service** (OData v2, `OrganizationData.svc`), the old **2011 SOAP** usage from JavaScript and the old "Office 365" username/password authentication are retired or deprecated. You still meet them in legacy code; replacing them is a common task when modernising a system.

## In an interview

- Name the two endpoints and say which clients use which.
- Write a Web API request with `$select` and `$filter`, and explain functions, actions and `$batch`.
- Explain how a plug-in talks to Dataverse, and why it must not use HTTP to call its own environment.
- Explain how a background service authenticates.
