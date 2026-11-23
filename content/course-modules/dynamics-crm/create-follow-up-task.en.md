Write a real plug-in. The program contains a small model of the Dataverse SDK with the same names as `Microsoft.Xrm.Sdk` (`IPlugin`, `IPluginExecutionContext`, `IOrganizationServiceFactory`, `ITracingService`, `Entity`, `EntityReference`, `OptionSetValue`, `Money`, `ColumnSet`), and a fake platform that keeps records in memory and calls your plug-in the way the pipeline does. The code you write would compile against the real SDK almost unchanged.

`FollowUpTaskPlugin` is registered on **Create** of **account**, **PostOperation (stage 40)**, synchronous. Implement `Execute`:

1. Get the `IPluginExecutionContext`, `ITracingService` and `IOrganizationServiceFactory` from `serviceProvider.GetService(typeof(...))`.
2. If the message is not `Create`, the table is not `account`, the stage is not `40`, or `InputParameters` has no `Target` of type `Entity`, trace `Skipped: <message> of <table>` (with `tracing.Trace("Skipped: {0} of {1}", …)`) and return.
3. Create the service with `factory.CreateOrganizationService(context.UserId)`, so the task belongs to the user who created the account.
4. Build a `task` entity:
   - `subject`: `Welcome call: <account name>`;
   - `regardingobjectid`: an `EntityReference` to the account (`context.PrimaryEntityId`);
   - `prioritycode`: `OptionSetValue(2)` (High) when the account's `creditlimit` (`Money`) is above 100000, otherwise `OptionSetValue(1)` (Normal). An account without a credit limit is Normal.
   - If the account has a `primarycontactid`, retrieve that contact's `fullname` with `service.Retrieve` and set `description` to `Primary contact: <fullname>`. Lookups in the Target carry no names, so you have to retrieve it.
5. Create the task with `service.Create` and trace `Task created for <account name>`.

Do not change the fake platform or `Main`. Expected output:

```text
== Create account Contoso
  trace: Task created for Contoso
== Create account Fabrikam
  trace: Task created for Fabrikam
== Update account Contoso Ltd
  trace: Skipped: Update of account
== Create contact Taras Melnyk
  trace: Skipped: Create of contact
Tasks:
  Welcome call: Contoso | priority 2 | regarding Contoso Ltd | owner Anna Shevchenko | Primary contact: Olena Koval
  Welcome call: Fabrikam | priority 1 | regarding Fabrikam | owner Anna Shevchenko | -
```

The task shows the account's *current* name (Contoso Ltd) because the regarding lookup points at the record, not at a copy of its name. If the owner shows as SYSTEM, the service was created with `null` instead of `context.UserId`.

Hint: `target.GetAttributeValue<Money>("creditlimit")` returns `null` when the column is missing, so check for `null` before reading `.Value`. Reading `target["creditlimit"]` instead would throw for Fabrikam.
