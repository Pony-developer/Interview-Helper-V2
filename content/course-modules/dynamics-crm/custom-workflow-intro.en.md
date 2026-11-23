**Classic workflows** (also called processes) are the original no-code automation of Dynamics CRM: a designer where admins build steps such as "if the status is Won, create a task and send an email". When a step is missing, developers write a **custom workflow activity**: a C# class that appears in the designer as a new step.

## Where classic workflows stand today

- Microsoft recommends **Power Automate** flows for new automation and publishes guidance for migrating classic **background** workflows to flows.
- **Real-time** (synchronous) workflows are still widely used, because flows cannot run inside the transaction.
- Thousands of existing systems still run classic workflows with custom activities. Maintaining, debugging and migrating them is everyday Dynamics work, and interviewers ask about them.

So learn custom workflow activities to **maintain** what exists, and know the modern alternatives for **new** work.

## What a custom activity is

A class that derives from **`CodeActivity`** (Windows Workflow Foundation), with:

- **input arguments** that the workflow designer lets admins fill: fixed values or values from the record ("Account: Credit Limit");
- **output arguments** that later steps can use ("if Found equals Yes…");
- an **`Execute`** method that does the work, with access to the workflow context and the organization service.

```csharp
public class GetConfigurationValue : CodeActivity
{
    [RequiredArgument, Input("Key")]
    public InArgument<string> Key { get; set; }

    [Output("Value")]
    public OutArgument<string> Value { get; set; }

    protected override void Execute(CodeActivityContext executionContext) { /* … */ }
}
```

## Why build one

- **Reuse**: one activity ("Get configuration value", "Calculate working days", "Add to queue") used in dozens of workflows.
- **Power to admins**: developers build small, well-tested blocks; admins compose them without a deployment.
- **Things the designer cannot do**: loops over related records, complex calculations, calling services, string and date manipulation.

## Real-time vs background

The same activity can run in both:

- **Real-time workflows** run synchronously, inside the transaction, like a synchronous plug-in. An exception cancels the save and shows the message.
- **Background workflows** run through the asynchronous service; failures appear in system jobs.

## Modern equivalents

| Classic | Modern |
| --- | --- |
| Background workflow | Power Automate cloud flow |
| Custom workflow activity used by flows | **Custom API** (callable from flows, apps, code) |
| Real-time workflow with custom logic | Synchronous plug-in, or a real-time workflow while it remains supported |

A custom workflow activity **cannot be called from a cloud flow**. If logic must be shared with flows, put it in a Custom API backed by a plug-in, and keep a thin activity only if old workflows need it.

## What this module builds

A **configuration table** that admins maintain, and a "Get configuration value" activity that workflows use to read it, then deploying, debugging and versioning it, and a comparison of plug-ins and workflows.
