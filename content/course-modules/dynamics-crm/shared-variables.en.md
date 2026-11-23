Steps registered on the same message often need to hand data to one another: a PreOperation step sees the old values, a PostOperation step needs them after the save. Plug-in classes must not keep state in fields, so Dataverse gives you a proper channel: **`context.SharedVariables`**.

## How it works

`SharedVariables` is a dictionary on the execution context. Every step that runs for **the same operation** (the same message on the same record, in the same pipeline execution) sees the same collection:

```csharp
// PreOperation step on Update of account
Money before = context.PreEntityImages["PreImage"].GetAttributeValue<Money>("creditlimit");
context.SharedVariables["oldCreditLimit"] = before?.Value ?? 0m;

// PostOperation step on Update of account
if (context.SharedVariables.Contains("oldCreditLimit"))
{
    var oldLimit = (decimal)context.SharedVariables["oldCreditLimit"];
    // compare with the new value, write an audit note...
}
```

Typical uses:

- Pass "before" values computed in PreOperation to PostOperation (often cheaper than a second image).
- Pass a flag: "the validation step already loaded the parent account, here is its id".
- Let one step tell another to skip work: `SharedVariables["contoso.skipRecalc"] = true`.

## Rules

- **Same operation only.** A shared variable does not survive into a *different* message. If your PostOperation step calls `service.Update` on another record, the plug-ins of that new Update get their own context.
- **Check before reading.** The step that sets the value may be disabled, filtered out or not registered in this environment. Use `Contains` and a sensible default.
- **Simple values.** Store strings, numbers, booleans, `Guid`s and SDK types such as `EntityReference`. Contexts can be serialised (for asynchronous steps, for example), so avoid your own complex objects.
- **Namespaced keys.** Use a prefix such as `contoso.` so keys from different solutions cannot clash.

## PreValidation and the parent context

PreValidation can run outside the transaction, in what the platform treats as an outer execution. A value set in PreValidation may therefore not be in `context.SharedVariables` of a later stage, but in **`context.ParentContext.SharedVariables`**. A helper that looks in both is common:

```csharp
static bool TryGetShared(IPluginExecutionContext context, string key, out object value)
{
    for (var c = context; c != null; c = c.ParentContext)
        if (c.SharedVariables.TryGetValue(key, out value)) return true;
    value = null;
    return false;
}
```

`ParentContext` is also how a plug-in sees the operation that caused it, for example the Create of an order that led to the Create of its lines.

## Passing data in from the caller

A client can put a value into the shared variables of the operation it starts by adding an optional **`tag`** parameter to the request (`request.Parameters["tag"] = "import-2026-11"`). Plug-ins read it as `context.SharedVariables["tag"]`. Integrations use it to tell plug-ins "this change came from the nightly import", so they can behave differently.

## In an interview

- Explain what shared variables are and why they exist instead of class fields.
- Show passing an old value from PreOperation to PostOperation.
- Explain why a value from PreValidation may only be in `ParentContext`.
- Explain how a caller can pass a tag to plug-ins.
