An import tool has a list of prepared requests: creates, updates and deletes. Send them efficiently and report every failure against the right row.

The program has a model of the SDK messages (`CreateRequest`, `UpdateRequest`, `DeleteRequest`, `ExecuteMultipleRequest`, `ExecuteMultipleSettings`, `ExecuteMultipleResponse` and its items) and a fake service that counts calls. Implement `ImportInBatches(service, requests, batchSize)`:

1. Split `requests` into batches of at most `batchSize`, in order.
2. For each batch, build an `ExecuteMultipleRequest` with a new `OrganizationRequestCollection` and settings `ContinueOnError = true`, `ReturnResponses = true`. Print `Batch <n>: <count> requests` (batches are numbered from 1).
3. Send it with `service.Execute` and cast the result to `ExecuteMultipleResponse`.
4. For each item in `Responses`, compute the **original index**: the batch's start position plus `item.RequestIndex`.
   - If `item.Fault` is not null, print `  #<index> FAILED: <fault message>`.
   - Else if `item.Response` is a `CreateResponse`, print `  #<index> created <first 8 characters of id>`.
   - Else print `  #<index> <ResponseName> ok`.
5. At the end print `Succeeded: <n>, failed: <n>`.

Do not change `Main`. Expected output:

```text
Batch 1: 3 requests
  #0 created 00000002
  #1 created 00000003
  #2 Update ok
Batch 2: 3 requests
  #3 FAILED: account With Id = 00000063-0000-0000-0000-000000000000 Does Not Exist
  #4 FAILED: Cannot insert duplicate key: account 00000001-0000-0000-0000-000000000000
  #5 Delete ok
Batch 3: 2 requests
  #6 FAILED: account With Id = 00000001-0000-0000-0000-000000000000 Does Not Exist
  #7 created 00000004
Succeeded: 5, failed: 3
Service calls: 3
Accounts: Fabrikam, Northwind, Litware
```

What to notice:

- Eight requests cost **3 service calls**.
- Failures do not stop the batch (`ContinueOnError`), and successful requests stay saved: ExecuteMultiple is not a transaction.
- Request #6 fails because #5 deleted Contoso in an earlier batch: requests run in order.
- Without adding the batch's start index, #3 would be reported as #0 and the import log would point at the wrong rows.

Hint: `requests.Skip(start).Take(batchSize)` gives one batch, and `batch.Requests.AddRange(…)` adds it. `item.Response as CreateResponse` is `null` for other response types.
