Most production incidents with plug-ins come from the same handful of mistakes. Interviewers love them because they show whether you have run plug-ins at scale.

## Shared state

The plug-in instance is cached and reused, possibly by several threads at once.

```csharp
public class BadPlugin : IPlugin
{
    private Entity target;          // shared by every request!
    private IOrganizationService service;

    public void Execute(IServiceProvider sp) { /* sets the fields, then uses them */ }
}
```

Two saves at the same moment overwrite each other's fields. Keep everything request-specific in local variables, pass it as parameters, and treat the class as stateless. Static caches are possible but must be thread-safe and must not hold user-specific data.

## Infinite loops

A PostOperation Update plug-in on `account` that calls `service.Update` on the same account triggers itself again. The platform stops it eventually with an infinite-loop error, after wasting time and locks. Fixes, in order of preference:

1. Set the value in **PreOperation** on the Target: no extra Update, no new pipeline.
2. Use **filtering attributes** so the step fires only when the columns it reads change, and make sure it does not write those columns.
3. Only update when the value actually changes.
4. As a last resort, check `context.Depth`. It is blunt: it also blocks legitimate updates that come from another plug-in or a flow.

## Too much work in the transaction

A synchronous plug-in holds database locks while it runs. Every slow call in it makes every save of that table slower and causes blocking and deadlocks under load.

- Do not call slow external services synchronously. Use an **asynchronous** step, a **service endpoint** (Azure Service Bus, Event Hubs, webhook) or a flow.
- Retrieve only the columns you need (`new ColumnSet("name")`, never `new ColumnSet(true)`).
- Use **images** instead of retrieving the record that is being saved.
- Query once with a filter instead of calling `Retrieve` in a loop.
- Remember the **2-minute** sandbox timeout: long batch work does not belong in a plug-in.

## Assuming the Target has every column

On Update, the Target contains only the changed columns. Code like `target.GetAttributeValue<Money>("creditlimit")` returns `null` when the user changed only the phone, and the rule silently treats the limit as zero. Combine the Target with a pre-image to get the full picture.

## Running as the wrong user

`CreateOrganizationService(null)` runs as SYSTEM and bypasses security. It is sometimes necessary (writing an audit record the user may not touch), but using it everywhere lets users change data they have no rights to. Default to `context.UserId`, and make SYSTEM calls deliberate and narrow.

## Swallowing exceptions

```csharp
try { DoWork(); } catch (Exception) { }   // the save succeeds with half the work done
```

Either handle an error properly or let it fail the transaction with an `InvalidPluginExecutionException` and a clear message. Silent failures turn into data quality problems that are found months later.

## Hard-coded values

GUIDs of teams, queues or currencies differ between environments. Read them by name or alternate key, from an environment variable, or from the step's configuration, never from a constant.

## Async plug-ins are not free

Asynchronous steps go through the asynchronous service queue. Thousands of them (for example, during a data import) delay everything else in that queue, including other customers' flows and system jobs. For bulk loads, consider disabling non-essential steps or processing in batches.

## In an interview

- Explain why plug-ins must be stateless and what happens otherwise.
- Explain how a plug-in loop happens and four ways to prevent it.
- List ways to keep synchronous plug-ins fast.
- Explain the Update Target trap and how images solve it.
