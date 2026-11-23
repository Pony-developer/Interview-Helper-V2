Sending 10,000 records one call at a time means 10,000 round trips. **`ExecuteMultipleRequest`** packs many requests into one call, which makes imports and migrations several times faster.

## The request

```csharp
var batch = new ExecuteMultipleRequest
{
    Requests = new OrganizationRequestCollection(),
    Settings = new ExecuteMultipleSettings
    {
        ContinueOnError = true,     // keep going after a failed request
        ReturnResponses = true,     // return a response for each successful request too
    },
};
batch.Requests.Add(new CreateRequest { Target = account1 });
batch.Requests.Add(new UpdateRequest { Target = change });
batch.Requests.Add(new DeleteRequest { Target = oldRef });

var response = (ExecuteMultipleResponse)service.Execute(batch);
```

Any request type can go in, except another `ExecuteMultipleRequest`.

## The response

```csharp
foreach (ExecuteMultipleResponseItem item in response.Responses)
{
    OrganizationRequest request = batch.Requests[item.RequestIndex];
    if (item.Fault != null)
        Console.WriteLine($"#{item.RequestIndex} failed: {item.Fault.Message}");
    else if (item.Response is CreateResponse created)
        Console.WriteLine($"#{item.RequestIndex} created {created.id}");
}
if (response.IsFaulted) { /* at least one request failed */ }
```

- `Responses` contains an item for each **failed** request and, with `ReturnResponses = true`, for each successful one.
- **`RequestIndex`** is the position in *this batch*. When you split a big list into batches, add the batch's start index to report the original row.
- With `ContinueOnError = false`, processing stops at the first fault; the requests before it are **already saved**.

## Not a transaction

ExecuteMultiple is a **transport** optimisation: every request still runs as its own operation, with its own transaction and plug-ins. If request 7 fails, requests 1–6 stay saved. When several changes must succeed or fail together (an order and its lines), use **`ExecuteTransactionRequest`**: same shape, but all requests run in one transaction and the first failure rolls everything back.

## Limits and good practice

- At most **1,000** requests per batch. Batches of 100–500 are a common sweet spot: big enough to save round trips, small enough to retry.
- Every request inside still counts towards the **service protection limits**; handle 429 / `Retry-After` for the whole batch.
- Run a few batches **in parallel** (several threads or tasks) for big loads, and tune the degree of parallelism.
- For many records of the **same table**, **`CreateMultiple` / `UpdateMultiple` / `UpsertMultiple`** are faster still: one operation with many targets, and plug-ins can process them as a set.
- Do **not** use ExecuteMultiple (or ExecuteTransaction) inside plug-ins and workflow activities: they already run inside an operation, the batch makes the transaction long and the sandbox time limit easy to hit.
- Log failures with enough data to retry them: the original row, the request, the fault message.

## In an interview

- Explain `ContinueOnError` and `ReturnResponses` and what `Responses` contains.
- Explain why ExecuteMultiple is not a transaction and what to use instead.
- Give the batch size limit and how you would size batches for a migration.
- Compare ExecuteMultiple with `CreateMultiple`/`UpdateMultiple`.
