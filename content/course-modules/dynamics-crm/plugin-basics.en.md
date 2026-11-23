A **plug-in** is a C# class that the platform runs when a message (Create, Update, Delete, Assign, a Custom API…) is processed for a table. Plug-ins are the tool for server-side rules that must always hold, no matter whether the change comes from a form, an import, a flow or an integration.

## The interface

```csharp
using Microsoft.Xrm.Sdk;

public class AccountNumberPlugin : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
        var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
        IOrganizationService service = factory.CreateOrganizationService(context.UserId);

        if (!(context.InputParameters.TryGetValue("Target", out var value) && value is Entity target)) return;
        if (target.LogicalName != "account") return;

        tracing.Trace("Depth {0}, message {1}", context.Depth, context.MessageName);
        if (!target.Contains("accountnumber"))
            target["accountnumber"] = "ACC-" + DateTime.UtcNow.ToString("yyMMddHHmmss");
    }
}
```

Everything comes from the `IServiceProvider`:

- **`IPluginExecutionContext`**: what is happening. `MessageName`, `PrimaryEntityName`, `Stage`, `Mode` (sync or async), `Depth`, `UserId` and `InitiatingUserId`, `InputParameters` and `OutputParameters`, `PreEntityImages` and `PostEntityImages`, and `SharedVariables` for passing data between steps of the same operation.
- **`IOrganizationServiceFactory`**: creates an `IOrganizationService`. Pass `context.UserId` to act with the user's privileges (or the user configured on the step), or `null` to run as SYSTEM.
- **`ITracingService`**: diagnostic messages that appear in the plug-in trace log and in the error details when the plug-in fails.
- Also available: `ILogger` (Application Insights) and `IServiceEndpointNotificationService` for posting to Azure.

## The Target

For Create and Update, `InputParameters["Target"]` is an `Entity` with the columns being saved. For Update it holds **only the changed columns**, not the whole record. For Delete, the Target is an `EntityReference`. Changing the Target in a stage before the save changes what gets saved, with no extra API call.

## Errors

Throw **`InvalidPluginExecutionException`** to stop the operation and show the message to the user:

```csharp
if (target.GetAttributeValue<Money>("creditlimit")?.Value < 0)
    throw new InvalidPluginExecutionException("The credit limit cannot be negative.");
```

Any other unhandled exception also fails the operation, but the user sees a generic error. Catch exceptions you can handle, trace what you know, and convert the rest into an `InvalidPluginExecutionException` with a useful message.

## Building and registering

1. Create a class library for **.NET Framework 4.6.2** (`pac plugin init` scaffolds one) and reference `Microsoft.CrmSdk.CoreAssemblies`.
2. **Sign** the assembly with a strong-name key. If you need other NuGet packages, build a **plug-in package** (`.nupkg`) instead of merging DLLs.
3. Register the assembly with the **Plug-in Registration Tool** (or `pac`), then register a **step** for each message: message, table, stage, mode, rank, filtering attributes, the user to run as, and images.
4. Add the assembly and its steps to your solution.

Plug-ins run in an isolated **sandbox**: no file system, no registry, limited network access (HTTP and HTTPS through names only), and a **2-minute** timeout per execution.

## Statelessness

The platform creates a plug-in instance and **caches** it, then calls `Execute` for many requests, possibly on several threads at once. Never keep request data in fields of the plug-in class: one user's data can leak into another user's request. Read-only configuration from the constructor (the step's *unsecure* and *secure* configuration strings) is fine.

## In an interview

- Explain what `IServiceProvider` gives a plug-in and the difference between `UserId` and `null` in `CreateOrganizationService`.
- Explain what is in the Target for Create, Update and Delete.
- Explain how to show a business error to the user.
- Explain the sandbox limits and why plug-ins must be stateless.
