Every plug-in starts the same way: get the context, look at what is being saved, decide whether to act. Keep this page open while you write your first plug-ins.

## The opening lines

```csharp
public void Execute(IServiceProvider serviceProvider)
{
    var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
    var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
    var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
    var service = factory.CreateOrganizationService(context.UserId);   // only when you need to query or write
    // …
}
```

| Service | What you use it for |
| --- | --- |
| `IPluginExecutionContext` | What is happening: message, table, stage, the data |
| `ITracingService` | Writing diagnostic lines to the trace log |
| `IOrganizationServiceFactory` | Creating an `IOrganizationService` to read or write other rows |

## What the context tells you

| Property | Example | Meaning |
| --- | --- | --- |
| `MessageName` | `"Create"` | The operation |
| `PrimaryEntityName` | `"account"` | The table's logical name |
| `PrimaryEntityId` | a GUID | The row's id (empty in PreOperation of Create) |
| `Stage` | `10`, `20`, `40` | PreValidation, PreOperation, PostOperation |
| `Mode` | `0`, `1` | Synchronous, asynchronous |
| `Depth` | `1` | 1 when a user started it; higher when another plug-in or flow caused it |
| `UserId` | a GUID | Whose permissions the step runs with |
| `InitiatingUserId` | a GUID | Who actually started the operation |
| `InputParameters` | `["Target"]` | The request's data |
| `OutputParameters` | `["id"]` | The results, available in PostOperation |
| `PreEntityImages`, `PostEntityImages` | `["PreImage"]` | Snapshots registered on the step |
| `SharedVariables` | | Data passed between steps of the same operation |

## What is in Target

| Message | `InputParameters["Target"]` | Notes |
| --- | --- | --- |
| Create | `Entity` | All the columns being set. No id yet in PreOperation |
| Update | `Entity` | **Only the changed columns**, plus the id |
| Delete | `EntityReference` | Just the table and id; register a pre-image if you need the old values |
| Assign | `EntityReference` | The new owner is in `InputParameters["Assignee"]` |
| SetState | `EntityReference` | The new state is in `InputParameters["State"]` and `["Status"]` |

Always check the type before you cast, because the same plug-in class may be registered on several messages:

```csharp
if (!context.InputParameters.Contains("Target") || !(context.InputParameters["Target"] is Entity target))
    return;
```

## Which stage for what

| Stage | Inside the transaction? | Typical use |
| --- | --- | --- |
| 10 PreValidation | No | Cheap checks that reject the request early |
| 20 PreOperation | Yes | Change values in `Target` before they are saved: defaults, formatting, calculated values |
| 40 PostOperation | Yes (synchronous) | Create or update **other** rows: the record now has its id |

In PreValidation and PreOperation, **change `Target` directly**: whatever you put in it is saved, no `service.Update` needed. In PostOperation the row is already written; changing `Target` does nothing, and updating the same row again starts another round of plug-ins.

## Throwing an error

```csharp
throw new InvalidPluginExecutionException("Email is required.");
```

The message is shown to the user, so write it for them, not for developers. In a synchronous step, the whole save is cancelled.

## Five beginner mistakes

1. Using `target["name"]` when the column might be missing: use `GetAttributeValue` or `Contains`.
2. Setting defaults on Update: on Update, a missing column means "not changed".
3. Calling `service.Update` on the Target in PreOperation: just change `Target`.
4. Forgetting that Delete's Target is an `EntityReference`.
5. Writing display names (`"Credit Limit"`) instead of logical names (`"creditlimit"`).

The three practices after the quiz train exactly these habits.
