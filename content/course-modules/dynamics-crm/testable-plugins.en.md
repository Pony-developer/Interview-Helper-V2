Registering a plug-in, clicking through a form and reading the trace log is a slow way to find a bug. Plug-ins can be unit tested like any other C# code if you design them for it.

## Keep Execute thin

`Execute` should only unpack the context and hand over to plain C#:

```csharp
public class AccountPhoneSyncPlugin : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.Get<IPluginExecutionContext>();
        var service = serviceProvider.Get<IOrganizationServiceFactory>().CreateOrganizationService(context.UserId);
        var target = (Entity)context.InputParameters["Target"];

        new AccountPhoneSync(service).Run(target);
    }
}

public class AccountPhoneSync
{
    private readonly IOrganizationService service;
    public AccountPhoneSync(IOrganizationService service) => this.service = service;

    public int Run(Entity target) { /* the business rule */ }
}
```

(`Get<T>` is a small extension method over `GetService(typeof(T))`.) The rule class depends only on `IOrganizationService` and plain data, so a test can give it any implementation of that interface.

Many teams also use a **base plug-in class** that builds a "local context" (context, services, tracing, logger) once and calls an abstract method. Microsoft's `pac plugin init` template generates one.

## Three ways to give the code a service

1. **Mocks** (Moq, NSubstitute): set up exactly the calls you expect. Precise, but tests become a script of SDK calls and break when you refactor a query.
2. **An in-memory fake** of `IOrganizationService`: create records in the test, run the code, read the records back. The popular **FakeXrmEasy** library does this and even evaluates QueryExpression and FetchXML, runs registered plug-ins in a fake pipeline and simulates many messages.
3. **Integration tests** against a real development environment through `ServiceClient`: slow and need clean-up, but they test registration, security and real platform behaviour.

A good mix: many unit tests with a fake for the rules, a few integration tests for each important scenario.

## What to test

```csharp
[Fact]
public void Copies_phone_only_to_contacts_that_opted_in()
{
    var service = new FakeOrganizationService();
    var accountId = service.Create(new Entity("account") { ["name"] = "Contoso" });
    service.Create(Contact("Olena", accountId, syncPhone: true));
    service.Create(Contact("Taras", accountId, syncPhone: false));

    var target = new Entity("account", accountId) { ["telephone1"] = "222" };
    var updated = new AccountPhoneSync(service).Run(target);

    Assert.Equal(1, updated);
}
```

- The rule itself: happy path, missing columns (remember an Update Target has only the changed ones), empty values.
- The context handling: wrong table, wrong message, missing images, depth.
- Error cases: the plug-in throws `InvalidPluginExecutionException` with the right message.

## The tracing service

`ITracingService.Trace` is your log in production. Trace the important decisions ("3 contacts to update"), not every line. Traces appear in the **plug-in trace log** (enable it in system settings: *Exception* or *All*) and in the downloadable details of an error. For richer telemetry, the injected `ILogger` sends logs to Application Insights when the environment is connected to it.

## Debugging a live environment

The **Plug-in Registration Tool** can record a real execution into a **profile** and replay it in Visual Studio with breakpoints: the plug-in profiler. It is the way to reproduce a bug that only happens with production data, without attaching a debugger to the server.

## In an interview

- Explain how you structure a plug-in so the logic is testable.
- Compare mocks, an in-memory fake (FakeXrmEasy) and integration tests.
- Say what you test in a plug-in besides the happy path.
- Explain the trace log and the plug-in profiler.
