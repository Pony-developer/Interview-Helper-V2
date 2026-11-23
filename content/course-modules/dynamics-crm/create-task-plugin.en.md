The second plug-in does real work: whenever a new account is created, it creates a **follow-up task** for the account's owner, so nobody forgets the welcome call. It uses the **organization service** to read and write other records.

## Choosing the step

- **Message and table**: `Create` of `account`.
- **Stage**: **PostOperation**. The task's *Regarding* lookup needs the account's id, which exists only after the main operation.
- **Mode**: **synchronous** if the task must exist the moment the form reloads, or if a failure to create it should cancel the account. **Asynchronous** if a few seconds of delay are fine and the account must be saved even when task creation fails. Here: synchronous.

## The code

```csharp
public class FollowUpTaskPlugin : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
        var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));

        if (context.MessageName != "Create" || context.PrimaryEntityName != "account" || context.Stage != 40 ||
            !(context.InputParameters["Target"] is Entity target))
            return;

        // Calls run with the privileges of the user who created the account
        IOrganizationService service = factory.CreateOrganizationService(context.UserId);

        var task = new Entity("task");
        task["subject"] = "Welcome call: " + target.GetAttributeValue<string>("name");
        task["regardingobjectid"] = new EntityReference("account", context.PrimaryEntityId);
        task["scheduledend"] = DateTime.UtcNow.AddDays(2);
        task["prioritycode"] = new OptionSetValue(1);              // 0 Low, 1 Normal, 2 High

        var primaryContact = target.GetAttributeValue<EntityReference>("primarycontactid");
        if (primaryContact != null)
        {
            var contact = service.Retrieve("contact", primaryContact.Id, new ColumnSet("fullname"));
            task["description"] = "Primary contact: " + contact.GetAttributeValue<string>("fullname");
        }

        Guid taskId = service.Create(task);
        tracing.Trace("Created task {0} for account {1}", taskId, context.PrimaryEntityId);
    }
}
```

## Things worth noticing

- **`regardingobjectid`** links an activity to the record it is about, so the task appears on the account's **timeline**. It is a lookup, so it takes an `EntityReference`.
- **Ownership**: a new record belongs to the user the service runs as, unless you set `ownerid`. With `context.UserId` the task belongs to the person who created the account. With `CreateOrganizationService(null)` it would belong to SYSTEM, and nobody would see it in "My Tasks". To give it to the account's owner instead, set `task["ownerid"] = target.GetAttributeValue<EntityReference>("ownerid")`.
- **Choice values** are numbers: check them in the metadata (`prioritycode`: 0 Low, 1 Normal, 2 High), and prefer named constants or early-bound enums over magic numbers.
- **Dates** are written in UTC.
- **Depth**: `service.Create(task)` runs the `Create` message for `task`, with its own pipeline at depth 2. If another plug-in on task creation updates the account, you can build a loop; know what is registered around your tables.
- **Transactions**: in a synchronous PostOperation step, the task is created in the same transaction as the account. If `Create` fails, the account is not saved either.

## Registering and testing

Register a step on **Create / account / PostOperation / Synchronous**, create an account with a primary contact, and open its timeline: the task is there, regarding the account, with the contact's name in the description. Check the trace log for the "Created task" line.

## Variations to try

- Make the task **High** priority when the credit limit is above a threshold.
- Read the number of days from the step's **unsecure configuration** instead of hard-coding 2.
- Create the task only for accounts of a certain **type** (`customertypecode`), and register **filtering** so the plug-in is cheap for everything else.

The practice that ends this module asks for a version of this plug-in.

## In an interview

- Explain why this plug-in runs in PostOperation and how you would choose between synchronous and asynchronous.
- Explain who owns a record created by a plug-in and how to change that.
- Explain what `regardingobjectid` is.
- Explain what happens to the account if creating the task fails.
