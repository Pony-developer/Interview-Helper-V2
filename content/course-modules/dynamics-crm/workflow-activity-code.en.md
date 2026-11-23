Let us build the **Get configuration value** activity: given a key, it returns the value from the configuration table, or a default when the key is missing.

## The project

The same kind of project as for plug-ins, and often the same assembly:

- class library for **.NET Framework 4.6.2**, signed with a strong-name key;
- NuGet packages **`Microsoft.CrmSdk.CoreAssemblies`** and **`Microsoft.CrmSdk.Workflow`** (it brings `Microsoft.Xrm.Sdk.Workflow.dll`);
- a reference to the framework assembly **`System.Activities`**.

## The class and its arguments

```csharp
using System.Activities;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk.Workflow;

public class GetConfigurationValue : CodeActivity
{
    [RequiredArgument]
    [Input("Key")]
    public InArgument<string> Key { get; set; }

    [Input("Default value")]
    [Default("")]
    public InArgument<string> DefaultValue { get; set; }

    [Output("Value")]
    public OutArgument<string> Value { get; set; }

    [Output("Found")]
    public OutArgument<bool> Found { get; set; }

    protected override void Execute(CodeActivityContext executionContext)
    {
        // next lecture
    }
}
```

The attributes are the activity's **user interface**:

- **`[Input("Key")]`** shows a property called "Key" in the step's properties dialog; **`[Output("Value")]`** makes "Value" available to later steps in the dynamic values list.
- **`[RequiredArgument]`** makes the designer refuse to save the workflow until the property is filled.
- **`[Default("…")]`** pre-fills a value.
- **`[ReferenceTarget("account")]`** is required on `InArgument<EntityReference>` and `OutArgument<EntityReference>` to say which table the lookup points to.
- **`[AttributeTarget("account", "industrycode")]`** binds an `OptionSetValue` argument to a specific choice column.

## Supported argument types

`string`, `bool`, `int`, `decimal`, `double`, `DateTime`, `Money`, `OptionSetValue` and `EntityReference`. No lists, no custom classes. If you need more, pass JSON in a string, or split the work into several activities.

## Reading and writing arguments

Arguments are not ordinary properties: their values live in the execution context, so you read and write them through it:

```csharp
string key = Key.Get(executionContext);              // input
Value.Set(executionContext, "INV-");                 // output
Found.Set(executionContext, true);
```

Calling `Key.Get(…)` without the context, or storing values in fields, does not work: one activity instance can be used by many workflow runs, so, as with plug-ins, keep the class **stateless**.

## Naming for admins

Admins see the `[Input]`/`[Output]` names, not your C# names. Write them as labels ("Default value", "Days to add"), keep them stable (renaming one breaks existing workflows, see the versioning lecture), and add a description in the assembly's registration so the step is easy to find.

## In an interview

- List the NuGet packages and references a custom activity needs.
- Explain `InArgument<T>`, `OutArgument<T>` and the attributes that describe them.
- Explain why `[ReferenceTarget]` is needed for lookups.
- Explain how argument values are read and written, and why the class must be stateless.
