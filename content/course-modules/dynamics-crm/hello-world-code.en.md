The project is ready. The first plug-in does something small but visible: when an account is created, it writes a greeting into the account's description, and traces what it did.

## The code

```csharp
using System;
using Microsoft.Xrm.Sdk;

namespace Contoso.Plugins.Accounts
{
    // Step: Create of account, PreOperation (20), synchronous
    public class HelloWorldPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // 1. Get what the platform gives every plug-in
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            tracing.Trace("HelloWorld: {0} of {1}, stage {2}, depth {3}",
                context.MessageName, context.PrimaryEntityName, context.Stage, context.Depth);

            // 2. Make sure we run where we expect to
            if (context.MessageName != "Create" ||
                !(context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity target) ||
                target.LogicalName != "account")
            {
                return;
            }

            try
            {
                // 3. The work: change the Target before it is saved
                string name = target.GetAttributeValue<string>("name") ?? "(no name)";
                target["description"] = $"Hello, {name}! Created at {DateTime.UtcNow:u}.";
                tracing.Trace("Description set for {0}", name);
            }
            catch (Exception ex) when (!(ex is InvalidPluginExecutionException))
            {
                tracing.Trace(ex.ToString());
                throw new InvalidPluginExecutionException("HelloWorldPlugin failed: " + ex.Message, ex);
            }
        }
    }
}
```

## What each part does

**`IServiceProvider`** is the plug-in's toolbox. Ask it for:

- **`IPluginExecutionContext`**: what is happening: `MessageName`, `PrimaryEntityName`, `PrimaryEntityId`, `Stage`, `Mode`, `Depth`, `UserId`, `InitiatingUserId`, `InputParameters`, `OutputParameters`, `PreEntityImages`, `PostEntityImages`, `SharedVariables`.
- **`ITracingService`**: lines that appear in the plug-in trace log and in error details.
- **`IOrganizationServiceFactory`**: creates an `IOrganizationService` for reading and writing other records (the next lectures use it). `CreateOrganizationService(context.UserId)` runs with the user's privileges; `null` runs as SYSTEM.
- Also `ILogger` for Application Insights and `IServiceEndpointNotificationService` for posting to Azure endpoints.

**The guard** checks the message and the table. A step is registered for a specific message and table, but the same class is often reused or registered by mistake on the wrong step; failing quietly is better than throwing a cast exception.

**Changing the Target** works because the step runs in **PreOperation**: the platform has not saved the record yet, so whatever you put in the Target is saved with it. In PostOperation the same line would do nothing.

**Errors**: `InvalidPluginExecutionException` shows its message to the user and rolls back the operation. Any other exception also fails the save but shows a generic error, so wrap unexpected exceptions and trace the details.

## Rules every plug-in follows

- **Stateless**: the platform caches the plug-in instance and may call `Execute` for many requests at once. Never store request data in fields. Read-only configuration is fine:

```csharp
public HelloWorldPlugin(string unsecureConfig, string secureConfig)
{
    greeting = string.IsNullOrEmpty(unsecureConfig) ? "Hello" : unsecureConfig;   // set per step at registration
}
```

- **Fast**: synchronous code holds the transaction open; the sandbox stops an execution after 2 minutes.
- **Defensive**: columns may be missing from the Target, lookups may be empty, and the record may come from an import rather than a form.

## A popular first test

Many developers make their first plug-in throw on purpose: `throw new InvalidPluginExecutionException("Hello World!")`. Saving an account then shows the message in a dialog, which proves registration works before any real logic is written. Remove it straight away afterwards.

## In an interview

- Write a minimal plug-in from memory: interface, services, guard, work, errors.
- Explain why the description is set in PreOperation and what would happen in PostOperation.
- Explain the constructor configuration strings and why fields must not hold request data.
