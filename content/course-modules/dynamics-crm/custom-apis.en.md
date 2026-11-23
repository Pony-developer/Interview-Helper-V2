Plug-ins on Create and Update react to data changes. Sometimes you need an **operation** instead: "recalculate this order", "close this case with a resolution", "import this file". Dataverse lets you define your own messages and implement them in C#.

## Custom APIs

A **Custom API** is a message you define as data in your solution:

- **Unique name** with your prefix (`contoso_RecalculateDiscount`) and display name.
- **Binding**: unbound (global), bound to a table (called on one record) or bound to a collection.
- **Function or action**: a function has no side effects and is called with `GET`; an action changes data and is called with `POST`.
- **Request parameters** and **response properties** with types (string, int, decimal, money, bool, EntityReference, Entity, EntityCollection…), each required or optional.
- **Plug-in type**: the class that implements the main operation.
- Optionally **private** (hidden from the metadata document) and restricted by a **privilege** name that the caller must have.

The implementation is an ordinary plug-in that reads `InputParameters` and fills `OutputParameters`:

```csharp
public void Execute(IServiceProvider serviceProvider)
{
    var context = serviceProvider.Get<IPluginExecutionContext>();
    var service = serviceProvider.Get<IOrganizationServiceFactory>().CreateOrganizationService(context.UserId);

    var orderRef = (EntityReference)context.InputParameters["Target"];  // bound to salesorder
    var coupon = (string)context.InputParameters["contoso_Coupon"];

    decimal discount = new DiscountCalculator(service).For(orderRef.Id, coupon);
    context.OutputParameters["contoso_Discount"] = discount;
}
```

Callers use it like any built-in message:

```text
POST [org]/api/data/v9.2/salesorders(<id>)/Microsoft.Dynamics.CRM.contoso_RecalculateDiscount
{ "contoso_Coupon": "SPRING" }
```

From C#, send an `OrganizationRequest("contoso_RecalculateDiscount")` through `Execute`. Other plug-ins can be registered on your Custom API's message too (PreValidation, PreOperation, PostOperation), just like on Create.

## The older options

- **Custom process actions** were defined with the classic workflow designer and can still be called the same way. Custom APIs replace them for new work: they are code-first, support functions and privileges, and do not need a workflow definition.
- **Custom workflow activities** are classes derived from `CodeActivity` that add steps to classic workflows. They still run but classic workflows are being replaced by Power Automate, so do not start new work with them.

## Plug-ins, flows or something else?

| Need | Lightest good option |
| --- | --- |
| Show, hide, require a field on a form | Business rule |
| Validation that must always hold, even for the API | Synchronous plug-in |
| Set a column of the record being saved | PreOperation plug-in, or a formula column |
| Notify people, call SaaS connectors, approvals | Power Automate flow |
| A reusable server operation with inputs and outputs | Custom API |
| Heavy or long-running processing | Azure Function triggered by Service Bus or a webhook |

Flows are quick to build and easy for non-developers to change, but they run asynchronously, are harder to test and version, and count against Power Automate limits. Plug-ins are transactional and fast, but need a developer and a deployment.

## Low-code plug-ins

Newer environments also offer **low-code plug-ins** written in Power Fx, both instant (a Custom API-like operation) and automated (on Create, Update, Delete). They are handy for simple rules owned by makers; complex logic still belongs in C#.

## In an interview

- Explain what a Custom API is, the difference between bound and unbound, function and action.
- Show how a plug-in reads input parameters and returns output parameters.
- Explain why Custom APIs replace custom process actions and custom workflow activities.
- Choose between a business rule, a plug-in, a flow and a Custom API for a requirement.
