Your first plug-in does nothing but look around: it writes what it sees into the trace log. That's exactly what you'd do to learn how a step is registered.

The program contains a model of the SDK and a fake platform. `Run` plays the platform: it builds a context for one step, calls your plug-in, prints your trace lines, then prints what was saved (or `deleted`). You only write the body of `HelloContextPlugin.Execute`:

1. Get the `IPluginExecutionContext` and the `ITracingService` from the `serviceProvider`.
2. Trace, in this order:
   - `Message: <MessageName>`
   - `Table: <PrimaryEntityName>`
   - `Stage: <Stage>, depth: <Depth>`
3. Look at `InputParameters["Target"]`:
   - an `Entity` (Create, Update): trace `Columns: ` and its column names in alphabetical order, separated by `, `;
   - an `EntityReference` (Delete): trace `Record: ` and the reference itself.

Do not change `Main` or `Run`. Expected output:

```text
== Create contact (stage 20)
  trace: Message: Create
  trace: Table: contact
  trace: Stage: 20, depth: 1
  trace: Columns: emailaddress1, firstname, lastname
  saved: emailaddress1=olena@contoso.com, firstname=Olena, lastname=Koval
== Update account (stage 10)
  trace: Message: Update
  trace: Table: account
  trace: Stage: 10, depth: 1
  trace: Columns: telephone1
  saved: telephone1=+380 44 123 4567
== Delete contact (stage 20)
  trace: Message: Delete
  trace: Table: contact
  trace: Stage: 20, depth: 1
  trace: Record: contact(00000005)
  deleted
```

Notice the Update: its Target holds only the column the user changed.

Hint: `tracing.Trace("Message: {0}", context.MessageName)` works like `string.Format`. `target as Entity` returns `null` when the target is an `EntityReference`. `entity.Attributes.Keys.OrderBy(k => k, StringComparer.Ordinal)` sorts the column names.
