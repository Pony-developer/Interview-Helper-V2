The arguments are declared; now the `Execute` method. A custom activity does not get an `IServiceProvider` like a plug-in. It asks the **`CodeActivityContext`** for **extensions**.

## Getting the services

```csharp
protected override void Execute(CodeActivityContext executionContext)
{
    ITracingService tracing = executionContext.GetExtension<ITracingService>();
    IWorkflowContext context = executionContext.GetExtension<IWorkflowContext>();
    IOrganizationServiceFactory factory = executionContext.GetExtension<IOrganizationServiceFactory>();
    IOrganizationService service = factory.CreateOrganizationService(context.UserId);
    // …
}
```

**`IWorkflowContext`** is the workflow's version of the plug-in context. It has the familiar members (`PrimaryEntityName`, `PrimaryEntityId`, `UserId`, `InitiatingUserId`, `Depth`, `InputParameters`, `SharedVariables`, `PreEntityImages`, `PostEntityImages`) plus workflow-specific ones such as `WorkflowCategory`, `WorkflowMode` and `StageName`.

`context.UserId` depends on the workflow's settings: for an on-demand or real-time workflow it is usually the user who triggered it; for a background workflow it can be the workflow's **owner**. Know which, because records your activity creates belong to that user.

## The record the workflow runs on

The workflow always runs on one record: `context.PrimaryEntityName` and `context.PrimaryEntityId`. If the activity needs its columns, retrieve them; the designer can also pass specific values as input arguments, which keeps the activity reusable across tables.

## The whole Execute

```csharp
string key = Key.Get(executionContext);

var query = new QueryByAttribute("contoso_configuration") { ColumnSet = new ColumnSet("contoso_value") };
query.AddAttributeValue("contoso_key", key);
query.AddAttributeValue("statecode", 0);
var rows = service.RetrieveMultiple(query).Entities;

if (rows.Count > 1)
    throw new InvalidPluginExecutionException("Duplicate configuration key: " + key);

if (rows.Count == 1)
{
    Value.Set(executionContext, rows[0].GetAttributeValue<string>("contoso_value"));
    Found.Set(executionContext, true);
    tracing.Trace("{0}: found", key);
}
else
{
    Value.Set(executionContext, DefaultValue.Get(executionContext));
    Found.Set(executionContext, false);
    tracing.Trace("{0}: default used", key);
}
```

## Errors

Throw **`InvalidPluginExecutionException`** for a business error. In a **real-time** workflow the save is cancelled and the user sees the message. In a **background** workflow the system job is marked as failed with that message, and the workflow stops at this step. Decide whether a missing value is an error (throw) or normal (return a default and `Found = false`, and let the workflow branch on it).

## Testing it

The activity is a class with an `Execute` method; it can be unit tested. FakeXrmEasy runs `CodeActivity` classes with a fake context, and so can a small harness of your own, like the one in this module's practice: set the input arguments, run the activity, read the outputs. Keep complex logic in a separate class that both the activity and plug-ins can use.

## In an interview

- Show how an activity gets the tracing service, workflow context and organization service.
- Explain what `IWorkflowContext` adds compared with the plug-in context.
- Explain which user an activity's service runs as.
- Explain how errors behave in real-time and background workflows.
