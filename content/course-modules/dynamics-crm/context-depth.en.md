`context.Depth` answers one question: **how many operations deep is this execution?** It is the platform's tool for spotting chains of plug-ins that trigger each other, and a frequent interview topic because it is so often misused.

## How depth grows

- A user saves an account: the Update runs at **depth 1**.
- A PostOperation plug-in on that Update calls `service.Update` on the account's contacts: those Updates run at **depth 2**.
- A plug-in on contact Update creates a task: that Create runs at **depth 3**.

Each call that a plug-in or workflow makes through the organization service starts a new operation one level deeper. Asynchronous steps and workflows carry the depth of the operation that queued them.

## The limit

If a chain goes deeper than the **maximum depth** (8 by default, counted within a time window of about an hour), the platform stops it with an error saying an infinite loop was detected. The limit protects the system; reaching it means a design problem, not a setting to raise.

## The classic loop

```csharp
// PostOperation, Update of account, no filtering attributes
var change = new Entity("account", context.PrimaryEntityId);
change["contoso_lastreview"] = DateTime.UtcNow;
service.Update(change);   // triggers this very step again, at depth 2, 3, 4...
```

## Ways out, best first

1. **Set the value in PreOperation** on the Target instead of calling Update. No new operation, no loop, no extra database round trip.
2. **Filtering attributes**: register the step only for the columns that matter (`creditlimit`, `telephone1`). If the step writes only other columns, its own update does not trigger it.
3. **Only write when something changes**: compare with the pre-image and skip the update if the value is already right.
4. **A depth check**, as a last resort:

```csharp
if (context.Depth > 1)
{
    tracing.Trace("Skipped at depth {0}", context.Depth);
    return;
}
```

## Why the depth check is blunt

`Depth > 1` does not mean "called by myself". It means "called by *anything*": another plug-in, a workflow, a flow's update, an ExecuteMultiple from a Custom API. A rule that must always hold, such as validation, must **not** be skipped just because the change came from automation; that is how bad data gets in through integrations. Use the depth check for side effects that only make sense for direct user actions, and say so in a comment.

A more precise alternative is to look at **`context.ParentContext`**: walk up the chain and check whether the same message on the same record (or your own plug-in) is already running.

## Depth in asynchronous work

Asynchronous plug-ins and background workflows run later but carry the depth, so a chain can also loop through the async queue. Such loops are slower to spot: system jobs pile up and fail with the same infinite-loop error.

## In an interview

- Explain what increases `context.Depth`.
- Explain what happens when the maximum depth is reached.
- Give four ways to prevent a loop and why `Depth > 1` is the last choice.
- Explain why validation plug-ins must not skip on depth.
