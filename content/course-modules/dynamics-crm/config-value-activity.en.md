Build the **Get configuration value** activity from this module. The program contains a model of the SDK and of `System.Activities` / `Microsoft.Xrm.Sdk.Workflow` (`CodeActivity`, `InArgument<T>`, `OutArgument<T>`, `CodeActivityContext.GetExtension<T>()`, `IWorkflowContext`, the `[Input]`, `[Output]`, `[RequiredArgument]` and `[Default]` attributes), and a fake workflow engine. The arguments are already declared. Implement `Execute`:

1. Get the `ITracingService`, `IWorkflowContext` and `IOrganizationServiceFactory` with `executionContext.GetExtension<T>()`, and create the service for `context.UserId`.
2. Read the key with `Key.Get(executionContext)`.
3. Query `contoso_configuration` with a `QueryByAttribute`: `contoso_key` equal to the key **and** `statecode` equal to `0` (active rows only). You only need the `contoso_value` column.
4. If more than one row matches, throw `InvalidPluginExecutionException("Duplicate configuration key: <key>")`.
5. If exactly one matches, set `Value` to its `contoso_value` and `Found` to `true`, and trace `<key>: found`.
6. Otherwise set `Value` to the default value (`DefaultValue.Get(executionContext)`) and `Found` to `false`, and trace `<key>: default used`.

Write outputs with `Value.Set(executionContext, …)`. Do not change the arguments or `Main`. Expected output:

```text
Step properties in the workflow designer:
  input  Key (required)
  input  Default value
  output Value
  output Found
== Key invoice.prefix
  Value = INV-, Found = True
  trace: invoice.prefix: found
== Key missing.key
  Value = fallback, Found = False
  trace: missing.key: default used
== Key old.feature
  Value = off, Found = False
  trace: old.feature: default used
== Key tax.rate
  ERROR Duplicate configuration key: tax.rate
Service calls: 4
```

The first lines are generated from the attributes: that is what an admin sees when adding the step. `old.feature` exists but is inactive, so the default is used. `Service calls: 4` checks that each run makes exactly one query.

Hint: `service.RetrieveMultiple(query).Entities` is a list of the matching rows. `query.AddAttributeValue("statecode", 0)` compares with the choice's number.
