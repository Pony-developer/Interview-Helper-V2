Every message runs through the **event execution pipeline**. Where you register a step in that pipeline decides what the step can see, what it can change and whether it can still stop the operation.

## Stages

| Stage | Number | Transaction | Typical use |
| --- | --- | --- | --- |
| PreValidation | 10 | Usually outside | Cheap validation and security checks before any database work |
| PreOperation | 20 | Inside | Change the Target: set defaults, compute columns |
| MainOperation | 30 | Inside | The platform saves the record (only Custom APIs plug in here) |
| PostOperation | 40 | Inside when synchronous | Create or update related records, the record now has its id |

- In **PreValidation** nothing is locked yet, so rejecting a request there is cheapest. It runs outside the database transaction, unless the message itself was triggered from inside another transaction (for example, a cascade or another plug-in's call).
- In **PreOperation** you are inside the transaction. Changing the Target here is free: the change is saved by the main operation.
- In **PostOperation** the record exists (for Create, `context.OutputParameters["id"]` holds the new id). Changing the Target no longer has an effect; you need a separate `Update` call, which is a new message with its own pipeline.

## Synchronous and asynchronous

A **synchronous** step runs while the user waits. If it throws, the whole transaction is rolled back, including the record and anything other synchronous steps already wrote.

An **asynchronous** step (PostOperation only) is queued to the **asynchronous service** and runs a little later, outside the transaction. It cannot block the save, and its failures show up in *System Jobs*, not to the user. Use it for slow work that may happen after the save: notifications, integrations, heavy recalculation.

## Order

Several steps on the same message and stage run in order of their **execution order (rank)**, lowest first. Do not rely on the order of steps with the same rank.

## Filtering attributes

An Update step should list its **filtering attributes**: the columns it cares about. Without them, the step runs on every update of the record, including updates made by other plug-ins and integrations, which costs time and invites loops.

## Images

Because the Update Target holds only the changed columns, plug-ins often need the rest of the record. Instead of calling `Retrieve`, register an **image** on the step: a snapshot of chosen columns taken by the platform.

- A **pre-image** shows the record **before** the operation. Available for Update and Delete (there is nothing before a Create).
- A **post-image** shows the record **after** the operation. Available for Create and Update in PostOperation (there is nothing after a Delete).

```csharp
Entity before = context.PreEntityImages["PreImage"];
Entity target = (Entity)context.InputParameters["Target"];
var oldLimit = before.GetAttributeValue<Money>("creditlimit")?.Value ?? 0m;
var newLimit = target.Contains("creditlimit")
    ? target.GetAttributeValue<Money>("creditlimit")?.Value ?? 0m
    : oldLimit;
```

"The value after the update" is the Target value if the column is in the Target, and the pre-image value otherwise.

## Depth

`context.Depth` counts how many pipeline calls deep you are. A plug-in that updates a record triggers the pipeline again at depth 2, and so on. The platform stops a chain that goes too deep (by default above 8 levels within an hour) with an infinite-loop error. Checking `context.Depth > 1` is a blunt tool: it also skips legitimate calls. Prefer filtering attributes and setting values in PreOperation.

## Choosing a stage

- Reject bad data: **PreValidation** (or PreOperation if you need data read inside the transaction).
- Set or compute a column of the same record: **PreOperation**.
- Create child records or update other tables in the same transaction: **synchronous PostOperation**.
- Call external systems or do slow work: **asynchronous PostOperation**, a service endpoint, or a flow.

## In an interview

- Name the stages with their numbers and say which run inside the transaction.
- Explain what happens if a synchronous PostOperation step throws.
- Explain pre- and post-images and which messages have them.
- Explain filtering attributes and depth, and how to avoid a plug-in loop.
