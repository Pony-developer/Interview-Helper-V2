Dynamics rarely lives alone: ERP systems, websites, data warehouses and line-of-business apps all exchange data with it. Integrations are where a large part of a Dynamics developer's time goes.

## Authentication

Services connect as an **application user**:

1. Register an app in **Microsoft Entra ID** with a client secret or, better, a certificate (or a managed identity when running in Azure).
2. Add the app as an application user in the environment (Power Platform admin center).
3. Give it a **custom security role with the minimum privileges** it needs. Never System Administrator.

The service gets an OAuth token for `https://<org>.crm.dynamics.com/.default` (MSAL does it, `ServiceClient` wraps it) and calls the Web API or the SDK.

## Inbound: other systems write to Dataverse

- Use the **Web API** from any language, or `ServiceClient` from .NET.
- Address records by **alternate keys** and use **Upsert** so that sending the same message twice does no harm.
- For volume, use **bulk messages**: `CreateMultiple`, `UpdateMultiple`, `UpsertMultiple`, or `ExecuteMultiple` batches of up to 1,000 requests. `ExecuteTransaction` runs up to 1,000 requests in one transaction when they must succeed together.
- Azure Data Factory, dataflows and Azure Synapse Link cover large-scale data movement without custom code.

## Outbound: Dataverse notifies other systems

- **Service endpoints**: register an Azure Service Bus queue or topic, an Event Hub or a **webhook** in the Plug-in Registration Tool, then register asynchronous steps on it. The platform posts the execution context (`RemoteExecutionContext`) as a message. An Azure Function picks it up and talks to the other system, with retries and a dead-letter queue.
- **Power Automate** flows with the Dataverse trigger.
- **Synapse Link / Fabric** for analytics copies of the data.

Avoid calling external services synchronously from plug-ins: every save then waits for, and fails with, the other system.

## Service protection limits

Dataverse protects itself with **service protection API limits**, evaluated per user (including application users) and per web server, over a sliding 5-minute window:

- number of requests (6,000),
- combined execution time (20 minutes),
- concurrent requests (52).

The values can change, so check the documentation. When a limit is hit, the Web API returns **HTTP 429 Too Many Requests** with a **`Retry-After`** header saying how many seconds to wait. The SDK throws a fault with the same information, and `ServiceClient` retries some of them automatically.

What a well-behaved client does:

- On 429 (and on 503 Service Unavailable), wait for `Retry-After` and retry. When the header is missing, back off exponentially: 1, 2, 4, 8 seconds…
- Give up after a bounded number of retries and report the failure.
- Do **not** retry 400 Bad Request or 403 Forbidden: the request itself is wrong, and repeating it will not help.
- Use a moderate number of parallel threads. Start low and increase until you see 429s; the `x-ms-dop-hint` response header suggests a degree of parallelism.
- Spread big loads over several application users only within the licensing rules, never as a way to dodge limits.

There are also **entitlement limits**: daily request allocations tied to licences. They are monitored for reporting rather than blocking every call, but heavy integrations should be planned with them in mind.

## Idempotency and ordering

Messages may arrive twice or out of order (Service Bus delivers *at least once*). Design handlers so that processing a message twice has the same effect as once: upsert by key, compare a version or a modified-on timestamp, store processed message ids.

## In an interview

- Explain how a service authenticates as an application user and why it needs a least-privilege role.
- Describe inbound and outbound integration options, including service endpoints.
- Explain service protection limits, HTTP 429 and `Retry-After`, and how a client should retry.
- Explain why integration handlers must be idempotent.
