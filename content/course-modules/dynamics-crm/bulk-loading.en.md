A migration of a few million rows has to be fast enough to fit the cutover window and correct enough to sign off. That takes the right APIs, controlled parallelism, a way around business logic that should not run, and reconciliation at the end.

## The bulk messages

| API | What it does | Notes |
| --- | --- | --- |
| `Create` / `Update` one by one | One request per row | Simple, slowest |
| `ExecuteMultipleRequest` | Up to 1,000 different requests in one call | Saves round trips; each request still runs separately on the server |
| `CreateMultipleRequest`, `UpdateMultipleRequest`, `UpsertMultipleRequest` | Many rows of **one table** in one operation | The fastest option on standard tables; plug-ins can be registered on the `*Multiple` messages to process the batch at once |
| `ExecuteTransactionRequest` | Up to 1,000 requests, all or nothing | For data that must be consistent, not for throughput |

Batch sizes of 100 to 1,000 rows are typical; measure, because wide tables and heavy plug-ins favour smaller batches.

## Parallelism

Dataverse is built to process requests in parallel. A single-threaded loader leaves most of the capacity unused.

- Send batches from several threads or tasks. With `ServiceClient`, give each thread its own `Clone()` of the client.
- Respect the **service protection limits** (per user, per web server: number of requests, combined execution time and concurrent requests in a sliding 5-minute window). On a 429 error, wait for the `Retry-After` duration; `ServiceClient` retries automatically.
- Read `RecommendedDegreesOfParallelism` from `ServiceClient` (the `x-ms-dop-hint` response header) as a starting point for the number of threads.
- Spreading the load over several application users multiplies the per-user limits, but agree on it with the platform team: it is easy to overload the environment.

## Bypassing business logic

Plug-ins and flows written for users often should not run during a migration: welcome emails to 200,000 migrated contacts, recalculations on every row, integration messages to the ERP.

- The optional parameter **`BypassBusinessLogicExecution`** with `CustomSync`, `CustomAsync` or both skips the custom synchronous and/or asynchronous logic for that request (`BypassCustomPluginExecution = true` is the older parameter for synchronous logic). The caller needs the `prvBypassCustomBusinessLogic` privilege.
- **`BypassBusinessLogicExecutionStepIds`** skips only listed plug-in steps.
- Cloud flows can be skipped with the `SuppressCallbackRegistrationExpanderJob` parameter.
- System logic (security, rollups, duplicate detection settings, Microsoft's own plug-ins) still runs.

```csharp
var request = new CreateMultipleRequest { Targets = batch };
request.Parameters["BypassBusinessLogicExecution"] = "CustomSync,CustomAsync";
service.Execute(request);
```

Document what you bypass: anything the skipped logic would have computed (totals, numbers, statuses) has to be set by the migration itself.

## Errors and logging

Never stop the whole run on one bad row. Log every rejected row with its legacy id, table and error message, continue, and fix the data in staging for the next run. With `ExecuteMultipleRequest`, set `ContinueOnError = true` and read each response's `Fault`; with the `*Multiple` messages, a failing row fails the batch, so retry that batch row by row to find the culprit.

## Reconciliation

The business signs off a migration on evidence:

- **Row counts** per table in the source, staging and Dataverse, with rejected rows explaining the difference.
- **Totals** of money and quantity columns (sum of invoice amounts, of open opportunity values).
- **Samples**: a set of records checked field by field by business users.
- **Referential checks**: no orphans where a lookup should have been set.

Count Dataverse rows with `RetrieveTotalRecordCountRequest` (fast, from a snapshot) or an aggregate FetchXML query, keeping in mind the 50,000-row limit of aggregate queries on large tables.

## In an interview

- Compare ExecuteMultiple, the `*Multiple` messages and ExecuteTransaction.
- Explain how to parallelise a load without breaking the service protection limits.
- Explain how to bypass custom plug-ins and what that leaves for the migration to do.
- Describe how you reconcile a migration and handle rejected rows.
