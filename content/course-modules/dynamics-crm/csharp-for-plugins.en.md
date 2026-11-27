You don't need to be a C# expert to write good plug-ins, but you need a handful of language features every day. If you come from JavaScript or another language, this page is the short list.

## A class that implements an interface

Every plug-in is a class that implements the `IPlugin` interface, which has one method:

```csharp
using System;
using Microsoft.Xrm.Sdk;

namespace Contoso.Plugins
{
    public class AccountPreCreate : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // your code
        }
    }
}
```

- `using` imports namespaces, so you can write `Entity` instead of `Microsoft.Xrm.Sdk.Entity`.
- `namespace` groups your classes; plug-in steps are registered by the full name `Contoso.Plugins.AccountPreCreate`.
- `: IPlugin` means "this class implements that interface": it promises to have an `Execute` method.

## Getting a service: casting

The platform gives you an `IServiceProvider`. You ask it for a service by type and **cast** the result:

```csharp
var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
```

`(Type)value` converts an `object` to the type you know it is. If you are wrong, it throws `InvalidCastException`. The safer form `value as Type` returns `null` instead, and `value is Type t` checks and converts in one go:

```csharp
if (context.InputParameters["Target"] is Entity target) { /* use target */ }
```

## Types you meet all the time

| Type | Example | Use |
| --- | --- | --- |
| `string` | `"Contoso"` | Text. Compare with `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)` when case does not matter |
| `int`, `int?` | `500`, `null` | Whole numbers; the `?` makes it **nullable** |
| `decimal` | `1500.50m` | Money and exact amounts. Never `double` for money |
| `bool` | `true` | Yes/No columns |
| `DateTime` | `DateTime.UtcNow` | Dates. Dataverse stores UTC, so use `UtcNow`, not `Now` |
| `Guid` | `Guid.Empty` | Record ids |

## Null: the most common bug

A column that is empty is `null`. Calling a method on `null` throws `NullReferenceException`, the error new Dynamics developers see most. Three tools prevent it:

```csharp
string city = account.GetAttributeValue<string>("address1_city");
int length = city?.Length ?? 0;            // ?. stops at null, ?? gives a default
if (string.IsNullOrWhiteSpace(city)) { }   // empty, null and spaces in one check
```

## Collections and LINQ

```csharp
var names = new List<string> { "Contoso", "Fabrikam" };
var lookup = new Dictionary<string, int> { { "Gold", 100000002 } };

using System.Linq;
var active = accounts.Where(a => a.GetAttributeValue<OptionSetValue>("statecode").Value == 0)
                     .Select(a => a.GetAttributeValue<string>("name"))
                     .ToList();
```

`Where` filters, `Select` transforms, `FirstOrDefault` returns the first match or `null`, `Any` asks "is there at least one?". The `a => …` part is a **lambda**: a small inline function.

## Exceptions

```csharp
throw new InvalidPluginExecutionException("The credit limit cannot be negative.");
```

Throwing this in a synchronous plug-in stops the save, rolls back the transaction and shows your message to the user. Use `try`/`catch` around code that may fail for technical reasons, trace the details, and rethrow a clear message.

## What plug-ins must avoid

- **Static fields that hold data** between executions: one plug-in instance serves many users at once.
- **`async`/`await` and threads**: plug-ins run synchronously in a sandbox.
- **`DateTime.Now`**: use UTC.
- **Hard-coded ids and URLs**: they differ between environments; use configuration.

## Where to practise

Every C# practice in this course runs in the browser. Start with the three in this module: they use the same `Entity`, `EntityReference`, `OptionSetValue` and `Money` classes as real plug-ins.
