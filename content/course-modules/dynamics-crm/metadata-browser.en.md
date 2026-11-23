Plug-in code is full of names: `account`, `primarycontactid`, `prioritycode`, the value `2` for High. Get one wrong and the code compiles but fails at run time. Before writing a line, look the names up in the **metadata**.

## What you need to know about a table

- The **logical name** (`account`) and the **entity set name** for the Web API (`accounts`).
- The **primary id** and **primary name** columns (`accountid`, `name`).
- The **ownership type**: user/team or organization.
- For each column: the **logical name**, the **type** (and so the SDK type: `EntityReference`, `OptionSetValue`, `Money`…), whether it is required, its **choice values** and labels, its maximum length, the **date behaviour**.
- The **relationships**: their schema names (needed for `Associate` and `$expand`), the referencing lookup column, the cascade settings.

## In the maker portal

**make.powerapps.com → Tables → Account → Columns** lists every column with its display name and type. Open a column and expand **Advanced options** to see the **logical name** and **schema name**. Choice columns show their options with values. It is fine for one column, slow for a whole data model.

## Browser extensions

Extensions for Chromium-based browsers (Microsoft Edge, Google Chrome), such as the community extension **Level up for Dynamics 365/Power Apps**, add buttons on top of a model-driven form: show the **logical names** of all fields in place of their labels, show hidden fields, open the current table's metadata, copy the record id, open the Web API URL of the record. "Show logical names" on a form is the fastest way to answer "what is this field called?". Treat any extension as a tool you install deliberately, and use those your organisation allows.

## XrmToolBox

**XrmToolBox** is a free desktop host for community tools. For metadata:

- **Metadata Browser**: every table, column, relationship and key, with search and export.
- **FetchXML Builder**: builds queries visually and shows the matching QueryExpression, Web API and C# code.
- **Early Bound Generator**: generates typed classes.

## The Web API

The metadata is data you can query:

```text
GET [org]/api/data/v9.2/EntityDefinitions(LogicalName='account')?$select=LogicalName,EntitySetName,PrimaryIdAttribute,PrimaryNameAttribute
GET [org]/api/data/v9.2/EntityDefinitions(LogicalName='account')/Attributes?$select=LogicalName,AttributeType,RequiredLevel
GET [org]/api/data/v9.2/EntityDefinitions(LogicalName='task')/Attributes(LogicalName='prioritycode')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$expand=OptionSet
```

Paste them in the browser while signed in to see JSON.

## From C#

```csharp
var response = (RetrieveAttributeResponse)service.Execute(new RetrieveAttributeRequest
{
    EntityLogicalName = "task",
    LogicalName = "prioritycode",
    RetrieveAsIfPublished = true,
});
var metadata = (PicklistAttributeMetadata)response.AttributeMetadata;
foreach (var option in metadata.OptionSet.Options)
    Console.WriteLine($"{option.Value} = {option.Label.UserLocalizedLabel.Label}");
```

`RetrieveEntityRequest` with `EntityFilters.Attributes | EntityFilters.Relationships` returns a whole table. Plug-ins rarely need metadata at run time, and it is expensive; when they do, cache it in a static, thread-safe field.

## Early-bound generation

The most reliable way to avoid wrong names is not to type them: `pac modelbuilder build` generates classes with properties named after columns and enums for choices, so `account.PrimaryContactId` and `task_prioritycode.High` are checked by the compiler.

## In an interview

- Say where you find a column's logical name, type and choice values.
- Explain the difference between logical, schema and entity set names.
- Show a Web API request for table metadata.
- Explain the trade-off between late-bound strings and generated early-bound classes.
