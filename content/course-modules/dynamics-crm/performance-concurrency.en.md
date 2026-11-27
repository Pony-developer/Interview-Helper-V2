Slow forms and failed saves under load almost always come from a few patterns: queries that read too much, plug-ins that query in loops, transactions that hold locks for too long, and two writers overwriting each other. Each has a known fix.

## Queries

- **Ask for the columns you need.** `new ColumnSet(true)` (or a Web API query without `$select`) reads every column, including large text, and gets slower every time someone adds a column.
- **Filter on indexed columns.** Lookups, primary keys, alternate keys and the find columns of the Quick Find view are indexed. A condition on an unindexed column of a large table scans it.
- **Avoid leading wildcards.** `like '%smith'` and `contains` cannot use an index; `begins with` can.
- **Be careful with negative and outer conditions.** `ne`, `not-in`, `not-null` and filters on outer link-entities often force scans on big tables.
- **Page.** RetrieveMultiple returns at most 5,000 rows per page; use the paging cookie, and `top` when you need only a few rows.
- **Aggregate with care.** FetchXML aggregates stop at 50,000 rows by default; for totals over large tables use rollup columns, `RetrieveTotalRecordCountRequest`, or reporting tools.

## Plug-ins

- **Don't query in a loop** (the N+1 problem). Read all related rows at once with one query using `in` or a link-entity, and look them up in a dictionary.
- **Use images** instead of retrieving the record again: a pre-image gives the old values for free.
- **Register filtering attributes** so update steps run only when relevant columns change.
- **Exit early** when there is nothing to do, before any service call.
- **Be careful on Retrieve and RetrieveMultiple**: a synchronous plug-in there runs for every view, grid and lookup.
- **Cache only what is immutable** in static fields (metadata, configuration) with an expiry and thread-safe access. Never cache the service, the context or record data: plug-in instances are shared between threads.

## Locks and hot rows

A synchronous plug-in runs **inside the database transaction**, so every row it updates stays locked until the whole operation commits. Two patterns cause blocking and deadlocks:

- **Hot rows**: many operations updating the same row, such as a counter on a configuration record for invoice numbers or a total kept on a parent account by every child. Use an autonumber column, a rollup, or asynchronous aggregation instead.
- **Long transactions**: external calls, big loops or many updates inside a synchronous step keep locks for seconds. Move slow work to asynchronous processing.

Sometimes you *want* a lock: updating a row at the start of a transaction (a "lock record") serialises competing operations, for example to hand out unique numbers safely. Keep such transactions short.

## Optimistic concurrency

Without precautions, the **last writer wins**: two users read a record, both change it, and the second save silently overwrites the first ("lost update"). Dataverse supports **optimistic concurrency** on most tables (`EntityMetadata.IsOptimisticConcurrencyEnabled`):

```csharp
var product = service.Retrieve("product", id, new ColumnSet("quantityonhand"));
var update = new Entity("product", id) { RowVersion = product.RowVersion };
update["quantityonhand"] = (decimal)product["quantityonhand"] - 1;

service.Execute(new UpdateRequest
{
    Target = update,
    ConcurrencyBehavior = ConcurrencyBehavior.IfRowVersionMatches,
});
// Someone saved in between → FaultException with ConcurrencyVersionMismatch: re-read and retry
```

In the Web API the row version is the **ETag**: send `If-Match: W/"12345"` with PATCH or DELETE and handle **412 Precondition Failed**. Two more headers are useful: `If-None-Match` on GET returns **304 Not Modified** when your cached copy is current, and `If-Match: *` on PATCH makes an upsert update only, never create.

Retry a conflict a limited number of times, re-reading the record and re-checking business rules each time.

## In an interview

- List the most common reasons for a slow query and how to fix each.
- Explain the N+1 problem in a plug-in and how to avoid it.
- Explain why hot rows cause blocking in synchronous plug-ins.
- Explain optimistic concurrency with RowVersion and ETags, and how to handle a conflict.
