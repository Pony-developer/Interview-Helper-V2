These are the questions that come up again and again in interviews for Dynamics 365 / Power Platform developers, with the short answer an interviewer wants to hear. Use them to check yourself: if an answer surprises you, go back to the lesson on that topic.

## Junior

**What is Dataverse, and how does Dynamics 365 relate to it?**
Dataverse is the data and logic platform of the Power Platform: tables, security, business logic and APIs. Dynamics 365 Sales, Customer Service and the rest are model-driven apps with tables and logic on top of it.

**What is the difference between a managed and an unmanaged solution?**
Unmanaged is for development: you edit its components directly. Managed is for test and production: it installs as a sealed layer that can be upgraded or uninstalled as a whole.

**What are the stages of the plug-in pipeline?**
PreValidation (before the transaction and the main security checks), PreOperation (inside the transaction, change `Target` before it is saved), MainOperation (the platform), PostOperation (inside the transaction, the record exists; asynchronous steps run after the commit).

**What are pre-images and post-images?**
Snapshots of the record before and after the operation, registered on a step, so the plug-in can compare values without retrieving the record again.

**Entity vs EntityReference?**
`Entity` is a record with its columns. `EntityReference` is a pointer: a table logical name and an id, used for lookups and for addressing records.

**How do you stop a save and show an error from a plug-in?**
Throw `InvalidPluginExecutionException` with a clear message in a synchronous step; the transaction is rolled back and the user sees the message.

**What is the difference between a business rule and a form script?**
Business rules are declarative, limited to the table's own columns, and can run on the server with entity scope. Form scripts are JavaScript with the full Client API, and run only in the form.

## Middle

**How do you prevent infinite loops in plug-ins?**
Register filtering attributes, compare old and new values and update only when something changes, update only the changed columns, and as a last guard check `context.Depth`.

**When do you choose an asynchronous plug-in, and what changes?**
For work that does not need to block the save: integrations, heavy calculations. It runs after the commit as a system job, can be retried, and does not slow the user down; it cannot roll back the save.

**QueryExpression or FetchXML?**
Both are translated to SQL. QueryExpression is strongly typed and easy to build in code; FetchXML is text, can be stored in views and configuration, supports aggregates and is what views use. Use the one that fits; know the paging cookie for both.

**How do you call Dataverse from an Azure Function?**
Register an app in Microsoft Entra ID, create an application user in the environment with a security role, and connect with `ServiceClient` using a client secret, certificate or managed identity.

**How do you pass configuration to a plug-in?**
Secure or unsecure configuration on the step, environment variables, or a configuration table. Never hard-code URLs or secrets; secrets belong in secure configuration or Azure Key Vault.

**How does record-level security work?**
A security role gives privileges per table with a depth (User, Business Unit, Parent: Child, Organization). Access then depends on the record's owner and business unit, on sharing, on team membership, and on hierarchy security if enabled.

**What are Custom APIs used for?**
To define your own messages with typed request and response parameters, implemented by a plug-in, callable from the SDK, the Web API, flows and form scripts, and usable as events for other plug-ins.

## Senior

**How do you design ALM for a team of several developers?**
Solutions per area under one publisher, source control with unpacked solutions (`pac solution unpack` or the Git integration), pipelines that build managed solutions and deploy them through test to production with deployment settings for connection references and environment variables, and no unmanaged changes in production.

**How do you handle service protection limits in an integration?**
Batch requests, parallelise sensibly, honour `Retry-After` on 429 responses (or use `ServiceClient`, which does), spread load over time, and make the integration idempotent so retries are safe.

**How do you make a plug-in testable?**
Keep `Execute` thin: read the context and services, then call a class with the business logic that depends on interfaces. Test that logic with a fake `IOrganizationService` (or FakeXrmEasy) and in-memory data.

**What would you do if a form takes ten seconds to load?**
Measure first with Monitor: count the network calls and scripts. Typical fixes: fewer tabs loaded at start, lazy-loaded subgrids, no synchronous `XMLHttpRequest`, fewer Retrieve plug-ins, fewer controls and quick view forms.

**Plug-in, flow or Azure Function?**
Plug-in for synchronous, transactional rules near the data. Flow for asynchronous automation with connectors that business users may maintain. Azure Function (fed by Service Bus or webhooks) for heavy, long-running or external processing that must scale and be monitored like a service.

## How to answer

- Answer the question, then add one sentence of experience: "On my last project we…".
- Name trade-offs: interviewers value "it depends on X and Y" when you then choose.
- Say "I don't know, but I would check…" rather than guessing; then say where you would look.
